import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Briefcase, Plus, X, PieChart, AlertTriangle, TrendingUp, Info, Check, RefreshCw, Activity, Percent } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MOCK_FUNDS } from '../constants';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

interface PortfolioAsset {
  id: string;
  weight: number; // 0 to 100
}

// Reuse mock history generator
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
    data.push({ date: date, nav: currentNav });
  }
  return data;
};

const PortfolioBuilder: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);

  // --- State ---
  const [assets, setAssets] = useState<PortfolioAsset[]>([
    { id: '1', weight: 50 }, // Default: E1VFVN30
    { id: '6', weight: 50 }, // Default: VCBF-FIF (Bond)
  ]);

  // --- Derived State ---
  const totalWeight = useMemo(() => assets.reduce((sum, a) => sum + a.weight, 0), [assets]);
  const isValid = totalWeight === 100;

  // --- Data Generation (Backtest) ---
  const backtestData = useMemo(() => {
    if (!isValid || assets.length === 0) return null;

    // 1. Generate histories for selected funds
    const histories: Record<string, { date: Date; nav: number }[]> = {};
    assets.forEach(asset => {
        const fund = MOCK_FUNDS.find(f => f.id === asset.id);
        if (fund) {
            histories[asset.id] = generateMockNavHistory(fund.id, fund.cagr5Y, fund.volatility);
        }
    });

    // 2. Combine daily returns based on weights (Assume Daily Rebalancing for simplicity)
    const masterTimeline = histories[assets[0].id]; // Use first asset as timeline reference
    const dataPoints = [];
    const dailyReturns = [];
    
    // Initial Investment
    let currentPortfolioValue = 100000000; // 100M start
    let vnIndexValue = 100000000;

    for (let i = 0; i < masterTimeline.length; i++) {
        const date = masterTimeline[i].date;
        
        // Calculate Portfolio Value
        let dailyWeightedReturn = 0;
        
        if (i > 0) {
            assets.forEach(asset => {
                const hist = histories[asset.id];
                const todayNav = hist[i].nav;
                const prevNav = hist[i-1].nav;
                const assetReturn = (todayNav - prevNav) / prevNav;
                dailyWeightedReturn += assetReturn * (asset.weight / 100);
            });
            
            // Mock VNIndex Return (approx 8-10% volatility)
            const seed = date.getTime();
            const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000);
            const vnIndexReturn = 0.0003 + (random - 0.5) * 0.012; // Slight positive drift + noise

            currentPortfolioValue = currentPortfolioValue * (1 + dailyWeightedReturn);
            vnIndexValue = vnIndexValue * (1 + vnIndexReturn);
            
            dailyReturns.push(dailyWeightedReturn);
        }

        dataPoints.push({
            date: date,
            dateStr: date.toLocaleDateString('vi-VN'),
            portfolio: Math.round(currentPortfolioValue),
            vnIndex: Math.round(vnIndexValue)
        });
    }

    // 3. Calculate Metrics
    // CAGR
    const years = 5;
    const finalReturn = (currentPortfolioValue - 100000000) / 100000000;
    const cagr = (Math.pow(1 + finalReturn, 1 / years) - 1) * 100;

    // Volatility (Std Dev of Daily Returns * Sqrt(252))
    const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;

    // Sharpe (assuming risk free rate 4%)
    const riskFree = 4;
    const sharpe = (cagr - riskFree) / volatility;

    return {
        chartData: dataPoints,
        metrics: { cagr, volatility, sharpe }
    };

  }, [assets, isValid]);

  // --- Handlers ---
  const handleAddFund = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fundId = e.target.value;
    if (fundId && !assets.find(a => a.id === fundId)) {
        const remaining = Math.max(0, 100 - totalWeight);
        setAssets([...assets, { id: fundId, weight: remaining }]);
    }
    e.target.value = "";
  };

  const handleRemoveFund = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleWeightChange = (id: string, newWeight: number) => {
    setAssets(assets.map(a => a.id === id ? { ...a, weight: newWeight } : a));
  };

  // Pie Chart Data
  const pieData = assets.map(a => {
      const fund = MOCK_FUNDS.find(f => f.id === a.id);
      return {
          name: fund?.code || a.id,
          value: a.weight,
          type: fund?.type
      };
  });

  const COLORS = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartTooltipBg = isDark ? '#1e293b' : '#fff';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  const formatShortVND = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)} tr`;
    return num.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {t('portfolio.title')}
            <Briefcase className="h-8 w-8 text-emerald-600" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('portfolio.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* --- COLUMN 1 & 2: ASSET SELECTION & WEIGHTS --- */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('portfolio.assets')}</h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng tỷ trọng:</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${isValid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                        {totalWeight}%
                    </span>
                </div>
            </div>

            {/* Add Fund Select */}
            <div className="mb-6">
                <div className="relative">
                    <select 
                        onChange={handleAddFund}
                        className="w-full appearance-none bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white py-3 pl-4 pr-10 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                    >
                        <option value="">+ {t('portfolio.add')}</option>
                        {MOCK_FUNDS.filter(f => !assets.find(a => a.id === f.id)).map(fund => (
                            <option key={fund.id} value={fund.id}>
                                {fund.code} - {fund.name} ({fund.type})
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <Plus className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Asset List */}
            <div className="space-y-4">
                {assets.map((asset, idx) => {
                    const fund = MOCK_FUNDS.find(f => f.id === asset.id);
                    return (
                        <div key={asset.id} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-sm transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="font-bold text-slate-900 dark:text-white">{fund?.code}</span>
                                        <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600 text-slate-500">{fund?.type}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 pl-5 truncate">{fund?.name}</div>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={asset.weight} 
                                        onChange={(e) => handleWeightChange(asset.id, parseInt(e.target.value))}
                                        className="flex-grow w-full sm:w-32 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                    />
                                    <div className="w-12 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                        {asset.weight}%
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveFund(asset.id)}
                                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {assets.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        Chưa có tài sản nào được chọn
                    </div>
                )}
            </div>
        </div>

        {/* --- COLUMN 3: PIE CHART --- */}
        <div className="xl:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{t('portfolio.allocation')}</h3>
            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, color: chartTextColor }}
                        />
                    </RechartsPie>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className={`text-xl font-bold ${isValid ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {totalWeight}%
                    </span>
                </div>
            </div>
            {/* Legend */}
            <div className="w-full mt-4 space-y-1">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-slate-600 dark:text-slate-300">{entry.name}</span>
                        </div>
                        <span className="font-mono font-medium text-slate-900 dark:text-white">{entry.value}%</span>
                    </div>
                ))}
            </div>
        </div>

        {/* --- COLUMN 4: METRICS --- */}
        <div className="xl:col-span-1 space-y-4">
            {!isValid ? (
                <div className="h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 p-6 text-center">
                    <AlertTriangle className="h-10 w-10 mb-3 opacity-50" />
                    <p className="font-medium text-sm">{t('portfolio.warningWeight')}</p>
                </div>
            ) : backtestData ? (
                <>
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-[32%]">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('portfolio.metrics.return')}</div>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {backtestData.metrics.cagr.toFixed(1)}%
                            </span>
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">CAGR (Trung bình 5 năm)</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-[32%]">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('portfolio.metrics.risk')}</div>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                                {backtestData.metrics.volatility.toFixed(1)}%
                            </span>
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
                                <Activity className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Độ biến động (Volatility)</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-[32%]">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('portfolio.metrics.ratio')}</div>
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {backtestData.metrics.sharpe.toFixed(2)}
                            </span>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                <Percent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Sharpe Ratio</p>
                    </div>
                </>
            ) : null}
        </div>

        {/* --- FULL WIDTH ROW: CHART & EDUCATION --- */}
        {isValid && backtestData && (
            <div className="xl:col-span-4 space-y-6 animate-fade-in-up">
                
                {/* Main Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('portfolio.growthChart')}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                            <RefreshCw className="h-3 w-3" />
                            {t('portfolio.rebalance')}
                        </div>
                    </div>
                    
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={backtestData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
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
                                    tickFormatter={(val) => `${val/1000000}tr`}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip 
                                    formatter={(val: number) => formatShortVND(val)}
                                    contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, color: chartTextColor }}
                                />
                                <Legend iconType="circle" />
                                <Area 
                                    type="monotone" 
                                    dataKey="portfolio" 
                                    name="Danh mục của bạn" 
                                    stroke="#059669" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorPortfolio)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="vnIndex" 
                                    name="VN-Index (Mô phỏng)" 
                                    stroke={isDark ? "#475569" : "#94a3b8"} 
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="none" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Educational Note */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex gap-4">
                    <Info className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">{t('portfolio.riskReduction')}</h4>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                            Bằng cách kết hợp các tài sản có độ tương quan thấp (như Cổ phiếu và Trái phiếu), bạn có thể giảm độ biến động tổng thể của danh mục thấp hơn mức trung bình của từng tài sản riêng lẻ. Đây là "bữa trưa miễn phí" duy nhất trong tài chính.
                        </p>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default PortfolioBuilder;