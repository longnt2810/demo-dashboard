import React, { useState, useMemo, useContext, useEffect } from 'react';
import { LineChart as LineChartIcon, BarChart2, Check, AlertCircle, RefreshCw, Info, X, HelpCircle, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Rectangle, LabelList, ScatterChart, Scatter, ZAxis, Cell, ReferenceArea, ReferenceLine } from 'recharts';
import { MOCK_FUNDS } from '../constants';
import { ThemeContext } from '../App';
import { Fund } from '../types';
import { useTranslation } from 'react-i18next';

// --- Types ---
type TimeFrame = 'YTD' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL' | 'CUSTOM';

interface RiskRewardItem {
  id: string;
  name: string;
  fullName: string;
  return: number;
  volatility: number;
  expenseRatio: number;
}

// --- Helper: Mock History Generator ---
const generateMockNavHistory = (fundId: string, baseCagr: number, volatility: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  const data: { date: Date; nav: number }[] = [];
  const years = 5; 
  const days = years * 365;
  
  let currentNav = 10000; 
  const dailyReturn = Math.pow(1 + baseCagr / 100, 1 / 365) - 1;
  const dailyVol = (volatility / 100) / Math.sqrt(252);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const seed = date.getTime() + fundId.charCodeAt(0);
    const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000); 
    const change = (random - 0.5) * 2 * dailyVol; 
    
    currentNav = currentNav * (1 + dailyReturn + change);
    
    data.push({
      date: date,
      nav: currentNav
    });
  }
  return data;
};

// --- Category Definitions for UI ---
const CATEGORY_INFO: Record<string, { label: string; desc: string; color: string }> = {
    'ETF': { 
        label: 'ETF (Hoán đổi danh mục)', 
        desc: 'Phí thấp, mô phỏng chỉ số VN30/VNX50.', 
        color: 'text-blue-600 dark:text-blue-400' 
    },
    'Equity': { 
        label: 'Quỹ Cổ phiếu', 
        desc: 'Tăng trưởng mạnh, rủi ro cao.', 
        color: 'text-purple-600 dark:text-purple-400' 
    },
    'Balanced': { 
        label: 'Quỹ Cân bằng', 
        desc: 'Kết hợp Cổ phiếu & Trái phiếu.', 
        color: 'text-orange-600 dark:text-orange-400' 
    },
    'Bond': { 
        label: 'Quỹ Trái phiếu', 
        desc: 'An toàn, thu nhập ổn định.', 
        color: 'text-slate-600 dark:text-slate-400' 
    }
};

const Compare: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const { t } = useTranslation();
  
  // --- State ---
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Chart Selection State
  const [selectedChartFundIds, setSelectedChartFundIds] = useState<string[]>([]);
  
  // UI State
  const [showGuide, setShowGuide] = useState(false);

  // Initialize selected funds (Top 3 by default)
  useEffect(() => {
    setSelectedChartFundIds(MOCK_FUNDS.slice(0, 3).map(f => f.id));
    
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 1);
    setCustomStartDate(start.toISOString().split('T')[0]);
  }, []);

  // --- Data Preparation ---

  // 1. Group Funds by Type for Selector
  const fundsByType = useMemo(() => {
    const groups: Record<string, Fund[]> = {
        'ETF': [],
        'Equity': [],
        'Balanced': [],
        'Bond': []
    };
    MOCK_FUNDS.forEach(fund => {
        if (groups[fund.type]) {
            groups[fund.type].push(fund);
        } else {
            // Fallback
            groups[fund.type] = [fund];
        }
    });
    return groups;
  }, []);

  // 2. Determine Date Range
  const dateRange = useMemo(() => {
    const end = timeFrame === 'CUSTOM' ? new Date(customEndDate) : new Date();
    const start = new Date(end);
    end.setHours(23, 59, 59, 999);

    switch (timeFrame) {
      case '6M': start.setMonth(end.getMonth() - 6); break;
      case '1Y': start.setFullYear(end.getFullYear() - 1); break;
      case '3Y': start.setFullYear(end.getFullYear() - 3); break;
      case '5Y': start.setFullYear(end.getFullYear() - 5); break;
      case 'ALL': start.setFullYear(end.getFullYear() - 5); break; 
      case 'YTD': start.setMonth(0, 1); break;
      case 'CUSTOM': 
        const parsed = new Date(customStartDate);
        if (!isNaN(parsed.getTime())) start.setTime(parsed.getTime());
        break;
    }
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }, [timeFrame, customStartDate, customEndDate]);

  // 3. Generate Raw Histories for Selected Funds & Range
  const fundHistories = useMemo(() => {
    const result: Record<string, { date: Date; nav: number }[]> = {};
    const fundsToChart = MOCK_FUNDS.filter(f => selectedChartFundIds.includes(f.id));

    fundsToChart.forEach(fund => {
        // In a real app, this might come from an API. Here we regenerate mock data.
        const fullHistory = generateMockNavHistory(fund.id, fund.cagr5Y, fund.volatility);
        // Filter by date range
        result[fund.id] = fullHistory.filter(p => p.date >= dateRange.start && p.date <= dateRange.end);
    });
    return result;
  }, [selectedChartFundIds, dateRange]);

  // 4. Line Chart Data (Growth)
  const lineChartData = useMemo(() => {
    if (selectedChartFundIds.length === 0) return [];
    
    // Use the first fund's dates as the master timeline
    const firstId = selectedChartFundIds[0];
    const firstFundHistory = fundHistories[firstId];
    if (!firstFundHistory || firstFundHistory.length === 0) return [];

    const timeline = firstFundHistory.map(p => ({
        date: p.date,
        dateStr: p.date.toLocaleDateString('vi-VN'),
        timestamp: p.date.getTime()
    }));

    const result = timeline.map(point => {
        const item: any = { 
            dateStr: point.dateStr, 
            timestamp: point.timestamp,
            date: point.date 
        };
        
        selectedChartFundIds.forEach(fundId => {
            const history = fundHistories[fundId];
            const fund = MOCK_FUNDS.find(f => f.id === fundId);
            const dayData = history.find(h => h.date.getTime() === point.timestamp);
            
            if (dayData && history.length > 0 && fund) {
                const startNav = history[0].nav;
                const pctReturn = ((dayData.nav - startNav) / startNav) * 100;
                item[fund.code] = pctReturn; 
            }
        });
        return item;
    });

    if (result.length > 300) {
        return result.filter((_, i) => i % 5 === 0);
    }
    return result;
  }, [fundHistories, selectedChartFundIds]);

  // 5. Risk/Reward Scatter Data
  const riskRewardData: RiskRewardItem[] = useMemo(() => {
     const results = selectedChartFundIds.map(id => {
         const history = fundHistories[id];
         const fund = MOCK_FUNDS.find(f => f.id === id);
         
         if (!history || history.length < 2 || !fund) return null;

         // Calculate Actual Return in Period
         const startNav = history[0].nav;
         const endNav = history[history.length - 1].nav;
         const totalReturn = ((endNav - startNav) / startNav) * 100;

         // Calculate Annualized Volatility (Standard Deviation of Daily Returns)
         // Daily Return R_i = (NAV_i - NAV_{i-1}) / NAV_{i-1}
         const dailyReturns: number[] = [];
         for(let i = 1; i < history.length; i++) {
             const r = (history[i].nav - history[i-1].nav) / history[i-1].nav;
             dailyReturns.push(r);
         }

         // Mean
         const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
         // Variance
         const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dailyReturns.length;
         // Std Dev
         const stdDev = Math.sqrt(variance);
         // Annualized Volatility = StdDev * sqrt(252 trading days)
         const annualizedVol = stdDev * Math.sqrt(252) * 100;

         return {
             id: fund.id,
             name: fund.code,
             fullName: fund.name,
             return: parseFloat(totalReturn.toFixed(2)),
             volatility: parseFloat(annualizedVol.toFixed(2)),
             expenseRatio: fund.expenseRatio
         };
     });
     
     return results.filter((item): item is RiskRewardItem => Boolean(item));
  }, [fundHistories, selectedChartFundIds]);

  // 6. Bar Chart Data (Annual Performance) - Static for simplicity or reuse MOCK directly
  const annualBarData = useMemo(() => {
     const fundsToChart = MOCK_FUNDS.filter(f => selectedChartFundIds.includes(f.id));
     if (fundsToChart.length === 0) return [];

     // Find all unique years present in the data
     const allYears = new Set<number>();
     fundsToChart.forEach(f => {
         f.annualPerformance?.forEach(p => allYears.add(p.year));
     });
     
     const sortedYears: number[] = Array.from(allYears).sort((a,b) => a - b);

     return sortedYears.map(year => {
         const entry: any = { year };
         fundsToChart.forEach(fund => {
             const perf = fund.annualPerformance?.find(p => p.year === year);
             entry[fund.code] = perf ? perf.value : 0;
         });
         return entry;
     });
  }, [selectedChartFundIds]);

  const toggleChartFund = (fundId: string) => {
    if (selectedChartFundIds.includes(fundId)) {
        if (selectedChartFundIds.length > 1) {
            setSelectedChartFundIds(prev => prev.filter(id => id !== fundId));
        }
    } else {
        if (selectedChartFundIds.length < 5) {
            setSelectedChartFundIds(prev => [...prev, fundId]);
        }
    }
  };

  // Colors for chart
  const colors = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartTooltipBg = isDark ? '#1e293b' : '#fff';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  // --- Custom Tooltip for Line Chart ---
  const CustomLineTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length && lineChartData.length > 0) {
        return (
            <div style={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, padding: '8px 12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <p style={{ color: chartTextColor, fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex flex-col mb-1 last:mb-0">
                         <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.stroke }}></div>
                                <span style={{ fontSize: '12px', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 500 }}>{entry.dataKey}</span>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: entry.value >= 0 ? '#10b981' : '#f43f5e' }}>
                                {entry.value > 0 ? '+' : ''}{Number(entry.value).toFixed(2)}%
                            </span>
                         </div>
                    </div>
                ))}
            </div>
        );
    }
    return null;
  };

  // --- Custom Label for Bar Chart to Distinguish Profit/Loss ---
  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const isPositive = value >= 0;
    
    // Determine color based on value sign and theme
    const fill = isPositive 
        ? (isDark ? '#34d399' : '#059669')  // Emerald
        : (isDark ? '#fb7185' : '#e11d48'); // Rose

    return (
        <text 
            x={x + width / 2} 
            // Positive: y is Top. Label above (y - 10).
            // Negative: y is Top (Zero Line). Bar goes down. Label below (y + height + 10).
            y={isPositive ? y - 10 : y + height + 10} 
            fill={fill} 
            fontSize={11} 
            fontWeight="bold" 
            textAnchor="middle"
            dominantBaseline={isPositive ? "auto" : "hanging"}
        >
            {value > 0 ? '+' : ''}{value}%
        </text>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('pages.compare.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('pages.compare.subtitle')}</p>
      </div>

      {/* --- SECTION 1: DETAILED FUND SELECTOR --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 transition-colors">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Check className="h-5 w-5 text-emerald-600" />
                {t('pages.compare.selectFunds')} ({selectedChartFundIds.length}/5)
            </h3>
            
            <div className="flex items-center gap-3">
                 {selectedChartFundIds.length >= 5 && (
                    <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {t('pages.compare.limitReached')}
                    </span>
                )}
                <button 
                    onClick={() => setShowGuide(!showGuide)}
                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        showGuide 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                >
                    {showGuide ? <X className="h-3 w-3" /> : <HelpCircle className="h-3 w-3" />}
                    {showGuide ? t('pages.compare.closeGuide') : t('pages.compare.guideBtn')}
                </button>
            </div>
         </div>

         {/* Info Guide Panel (Collapsible) */}
         {showGuide && (
             <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 animate-fade-in-down">
                 <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4 text-emerald-600" />
                    {t('pages.compare.guideTitle')}
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                        <div key={key} className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className={`text-xs font-bold uppercase mb-1 ${info.color}`}>{info.label}</div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{info.desc}</p>
                        </div>
                    ))}
                 </div>
             </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Object.entries(fundsByType).map(([type, funds]) => (
                <div key={type} className="space-y-3">
                    <div className="border-b border-slate-100 dark:border-slate-700 pb-1">
                        <h4 className={`text-sm font-bold uppercase tracking-wider ${CATEGORY_INFO[type]?.color || 'text-slate-400'}`}>
                            {CATEGORY_INFO[type]?.label || type}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {CATEGORY_INFO[type]?.desc}
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        {funds.map(fund => {
                            const isSelected = selectedChartFundIds.includes(fund.id);
                            const selectedIndex = selectedChartFundIds.indexOf(fund.id);
                            const color = selectedIndex >= 0 ? colors[selectedIndex % colors.length] : undefined;
                            const isDisabled = !isSelected && selectedChartFundIds.length >= 5;

                            return (
                                <button
                                    key={fund.id}
                                    onClick={() => toggleChartFund(fund.id)}
                                    disabled={isDisabled}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                                        isSelected 
                                            ? 'bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-500 shadow-sm' 
                                            : isDisabled
                                                ? 'opacity-50 cursor-not-allowed border-transparent bg-slate-50 dark:bg-slate-800/50'
                                                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600'
                                    }`}
                                    style={isSelected ? { borderLeftColor: color, borderLeftWidth: 4 } : {}}
                                >
                                    <div>
                                        <div className={`text-sm font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {fund.code}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{fund.name}</div>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* --- SECTION 2: LINE CHART (GROWTH) --- */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LineChartIcon className="h-5 w-5 text-emerald-600" />
                        {t('pages.compare.growthTitle')}
                    </h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg self-start">
                        {(['YTD', '6M', '1Y', '3Y', '5Y', 'ALL', 'CUSTOM'] as const).map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeFrame(tf)}
                                className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-md transition-all ${
                                    timeFrame === tf
                                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {tf === 'CUSTOM' ? 'Tùy chọn' : tf}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Custom Date Inputs */}
            {timeFrame === 'CUSTOM' && (
                <div className="flex gap-4 mb-4 justify-end animate-fade-in-down">
                    <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Từ ngày</label>
                    <input 
                        type="date" 
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="text-xs p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Đến ngày</label>
                    <input 
                        type="date" 
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="text-xs p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    </div>
                </div>
            )}

            <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                        <XAxis 
                            dataKey="dateStr" 
                            stroke={chartTextColor} 
                            tick={{fontSize: 12}} 
                            tickLine={false} 
                            axisLine={false} 
                            minTickGap={50}
                        />
                        <YAxis 
                            stroke={chartTextColor} 
                            tick={{fontSize: 12}} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(0)}%`}
                        />
                        <Tooltip content={<CustomLineTooltip />} />
                        <Legend iconType="circle" />
                        <Line type="linear" dataKey={() => 0} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" dot={false} activeDot={false} legendType="none" />
                        
                        {MOCK_FUNDS.filter(f => selectedChartFundIds.includes(f.id)).map((fund, index) => (
                            <Line 
                                key={fund.id}
                                type="linear" 
                                dataKey={fund.code} 
                                stroke={colors[index % colors.length]} 
                                strokeWidth={2} 
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* --- SECTION 3: RISK/REWARD SCATTER CHART (NEW) --- */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-rose-500" />
                    {t('pages.compare.riskTitle')}
                </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                {t('pages.compare.riskDesc')} {timeFrame !== 'CUSTOM' ? timeFrame : 'tùy chọn'}.
            </p>

            <div className="h-[280px] relative">
                {/* Quadrant Helper */}
                <div className="absolute top-0 right-0 text-[9px] font-bold text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded z-10 bg-white/50 dark:bg-black/50">
                    Hiệu quả cao ↗
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        {/* Background Zones */}
                        <ReferenceArea y1={0} fill={isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)"} stroke="none" />
                        <ReferenceArea y2={0} fill={isDark ? "rgba(244, 63, 94, 0.1)" : "rgba(244, 63, 94, 0.05)"} stroke="none" />
                        <ReferenceLine y={0} stroke={isDark ? "#94a3b8" : "#64748b"} strokeDasharray="3 3" />

                        <XAxis 
                            type="number" 
                            dataKey="volatility" 
                            name="Volatility" 
                            unit="%" 
                            stroke={chartTextColor} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{fontSize: 10}} 
                            label={{ value: 'Rủi ro (Biến động)', position: 'insideBottom', offset: -15, fill: chartTextColor, fontSize: 10 }} 
                        />
                        <YAxis 
                            type="number" 
                            dataKey="return" 
                            name="Return" 
                            unit="%" 
                            stroke={chartTextColor} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{fontSize: 10}} 
                            label={{ value: 'Lợi nhuận', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 10, offset: 15 }} 
                        />
                        <ZAxis type="number" dataKey="expenseRatio" range={[60, 300]} name="Expense Ratio" unit="%" />
                        <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                    <div style={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, padding: '8px 12px', borderRadius: '8px', color: chartTextColor, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                        <p className="font-bold text-sm mb-1">{data.name}</p>
                                        <div className="flex flex-col gap-1 text-xs">
                                            <span className={data.return >= 0 ? 'text-emerald-500' : 'text-rose-500'}>Lãi: {data.return}%</span>
                                            <span>Rủi ro: {data.volatility}%</span>
                                        </div>
                                    </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter name="Funds" data={riskRewardData}>
                            {riskRewardData.map((entry, index) => {
                                const originalIndex = selectedChartFundIds.indexOf(entry.id);
                                return <Cell key={`cell-${index}`} fill={colors[originalIndex % colors.length]} />;
                            })}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* --- SECTION 4: ANNUAL PERFORMANCE BAR CHART --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8 transition-colors">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-emerald-600" />
                {t('pages.compare.annualTitle')}
            </h3>
         </div>

         <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={annualBarData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                     <XAxis dataKey="year" stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                     <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                     <Tooltip 
                         cursor={{fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4}}
                         contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, color: chartTextColor }}
                     />
                     <Legend iconType="circle" />
                     {/* Zero Line for clear separation */}
                     <ReferenceLine y={0} stroke={isDark ? "#94a3b8" : "#64748b"} strokeWidth={1} />
                     
                     {MOCK_FUNDS.filter(f => selectedChartFundIds.includes(f.id)).map((fund, index) => (
                         <Bar 
                             key={fund.id} 
                             dataKey={fund.code} 
                             fill={colors[index % colors.length]}
                         >
                            <LabelList 
                                dataKey={fund.code} 
                                content={<CustomBarLabel />}
                            />
                         </Bar>
                     ))}
                 </BarChart>
             </ResponsiveContainer>
         </div>
      </div>

      {/* --- SECTION 5: METRICS TABLE --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('pages.compare.metricsTitle')}</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-white dark:bg-slate-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.compare.table.fund')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.compare.table.1y')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.compare.table.3y')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.compare.table.5y')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.compare.table.volatility')}</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.compare.table.expense')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {MOCK_FUNDS.filter(f => selectedChartFundIds.includes(f.id)).map((fund, index) => (
                        <tr key={fund.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors[index % colors.length] }}></div>
                                     <span className="font-bold text-slate-900 dark:text-white">{fund.code}</span>
                                </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${fund.cagr1Y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {fund.cagr1Y > 0 ? '+' : ''}{fund.cagr1Y}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{fund.cagr3Y}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{fund.cagr5Y}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{fund.volatility}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-slate-700 dark:text-slate-300">{fund.expenseRatio}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Compare;