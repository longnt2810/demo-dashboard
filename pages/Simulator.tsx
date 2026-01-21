import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Calculator, AlertCircle, Calendar, Plus, X, Check, Search, TrendingUp, DollarSign, Info, Trash2, ListPlus, RotateCcw, Save, CalendarRange, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { MOCK_FUNDS } from '../constants';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

// --- Types ---
type TimeFrame = '1Y' | '2Y' | '3Y' | '5Y' | 'YTD' | 'CUSTOM';
type SimulationMode = 'RECURRING' | 'CUSTOM';

interface DailyData {
  date: Date;
  dateStr: string;
  [fundId: string]: number | string | Date; // Stores value for each fund
}

interface FundSimulationResult {
  fundId: string;
  totalUnits: number;
  currentValue: number;
  totalInvested: number;
  absoluteReturn: number;
  percentReturn: number; // Simple ROI
  xirr: number | null;   // Annualized Return
}

interface CashFlow {
  amount: number;
  date: Date;
}

interface CustomTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
}

// --- Helper: XIRR Calculation (Newton-Raphson method) ---
const calculateXIRR = (cashFlows: CashFlow[], guess = 0.1): number | null => {
  if (cashFlows.length < 2) return null;

  const maxIterations = 100;
  const tolerance = 1e-6;
  let rate = guess;

  // Pre-calculate days difference to optimize loop
  const startDate = cashFlows[0].date.getTime();
  const flows = cashFlows.map(cf => ({
    amount: cf.amount,
    days: (cf.date.getTime() - startDate) / (1000 * 60 * 60 * 24)
  }));

  for (let i = 0; i < maxIterations; i++) {
    let fValue = 0;
    let fDerivative = 0;

    for (const { amount, days } of flows) {
      const discountFactor = Math.pow(1 + rate, days / 365);
      fValue += amount / discountFactor;
      fDerivative -= (days / 365) * amount * Math.pow(1 + rate, -((days / 365) + 1));
    }

    if (Math.abs(fValue) < tolerance) {
      return rate * 100; // Return as percentage
    }

    if (Math.abs(fDerivative) < tolerance) {
        return null; // Derivative too close to zero, method fails
    }

    const newRate = rate - fValue / fDerivative;
    
    // Check for convergence or NaN
    if (isNaN(newRate) || !isFinite(newRate)) return null;
    
    rate = newRate;
  }

  return null; // Failed to converge
};

// --- Mock History Generator (Deterministic based on Fund ID) ---
// Generates 5 years of daily NAV data ending today
const generateMockNavHistory = (fundId: string, baseCagr: number, volatility: number) => {
  const today = new Date();
  const data: { date: Date; nav: number }[] = [];
  const days = 5 * 365; 
  
  // Start from 5 years ago
  let currentNav = 10000; // Base start NAV
  const dailyReturn = Math.pow(1 + baseCagr / 100, 1 / 365) - 1;
  const dailyVol = (volatility / 100) / Math.sqrt(252);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days);

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // Random walk with drift
    const seed = date.getTime() + fundId.charCodeAt(0);
    const random = Math.sin(seed) * 10000 - Math.floor(Math.sin(seed) * 10000); // Pseudo random 0-1
    const change = (random - 0.5) * 2 * dailyVol; // Noise
    
    currentNav = currentNav * (1 + dailyReturn + change);
    
    data.push({
      date: date,
      nav: currentNav
    });
  }
  return data;
};

const Simulator: React.FC = () => {
  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);

  // --- State ---
  const [selectedFundIds, setSelectedFundIds] = useState<string[]>([]);
  
  // Mode Selection
  const [simulationMode, setSimulationMode] = useState<SimulationMode>('RECURRING');

  // Recurring Mode Inputs
  const [initialInvestment, setInitialInvestment] = useState<number>(10000000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000000);
  
  // Custom Mode Inputs
  const [customTransactions, setCustomTransactions] = useState<CustomTransaction[]>([
    { id: '1', date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0], amount: 20000000 }
  ]);
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTxDate, setNewTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTxAmount, setNewTxAmount] = useState<number>(10000000);

  // Timeframe
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('3Y');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Initialize selected fund from URL or default
  useEffect(() => {
    const paramId = searchParams.get('fundId');
    if (paramId) {
      setSelectedFundIds([paramId]);
    } else if (selectedFundIds.length === 0) {
      setSelectedFundIds([MOCK_FUNDS[0].id]);
    }
    
    // Set default custom dates
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 3);
    setCustomStartDate(start.toISOString().split('T')[0]);
  }, []);

  // --- 1. Generate Historical Data for ALL funds (Memoized) ---
  const allFundsHistory = useMemo(() => {
    const historyMap: Record<string, { date: Date; nav: number }[]> = {};
    MOCK_FUNDS.forEach(fund => {
      historyMap[fund.id] = generateMockNavHistory(fund.id, fund.cagr5Y, fund.volatility);
    });
    return historyMap;
  }, []);

  // --- 2. Determine Simulation Date Range ---
  const dateRange = useMemo(() => {
    const end = timeFrame === 'CUSTOM' ? new Date(customEndDate) : new Date();
    const start = new Date(end);

    switch (timeFrame) {
      case '1Y': start.setFullYear(end.getFullYear() - 1); break;
      case '2Y': start.setFullYear(end.getFullYear() - 2); break;
      case '3Y': start.setFullYear(end.getFullYear() - 3); break;
      case '5Y': start.setFullYear(end.getFullYear() - 5); break;
      case 'YTD': start.setMonth(0, 1); break; // Jan 1st of current year
      case 'CUSTOM': 
        const parsed = new Date(customStartDate);
        if (!isNaN(parsed.getTime())) start.setTime(parsed.getTime());
        break;
    }
    
    // Normalize to start of day
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    return { start, end };
  }, [timeFrame, customStartDate, customEndDate]);

  // --- 3. Run Simulation Logic ---
  const { chartData, summaryResults, cashFlowsMap } = useMemo(() => {
    if (selectedFundIds.length === 0) return { chartData: [], summaryResults: [], cashFlowsMap: {} };

    // Common timeline (using the first fund's dates as reference, filtered by range)
    const referenceHistory = allFundsHistory[selectedFundIds[0]].filter(
      d => d.date >= dateRange.start && d.date <= dateRange.end
    );

    const dataPoints: DailyData[] = [];
    const fundStates: Record<string, { units: number; invested: number }> = {};
    const cashFlows: Record<string, CashFlow[]> = {}; // Track cash flows for XIRR
    
    // Initialize states
    selectedFundIds.forEach(id => {
      fundStates[id] = { units: 0, invested: 0 };
      cashFlows[id] = [];
    });

    let firstDayProcessed = false;
    let lastProcessedMonth = -1;

    // Iterate through daily history
    referenceHistory.forEach((dayPoint) => {
      const currentPoint: DailyData = {
        date: dayPoint.date,
        dateStr: dayPoint.date.toLocaleDateString('vi-VN'),
      };
      
      let commonInvested = 0; 
      const currentDayStr = dayPoint.date.toISOString().split('T')[0];

      const isStartDay = !firstDayProcessed;
      const currentMonth = dayPoint.date.getMonth();
      const isContributionDay = currentMonth !== lastProcessedMonth && !isStartDay; 

      if (isStartDay) firstDayProcessed = true;
      if (isContributionDay) lastProcessedMonth = currentMonth;

      // Identify investment actions for this day
      let investmentsToday: number[] = [];
      
      if (simulationMode === 'RECURRING') {
        if (isStartDay && initialInvestment > 0) investmentsToday.push(initialInvestment);
        if (isContributionDay && monthlyContribution > 0) investmentsToday.push(monthlyContribution);
      } else {
        // Custom Mode
        const txs = customTransactions.filter(tx => tx.date === currentDayStr);
        txs.forEach(tx => investmentsToday.push(tx.amount));
      }

      selectedFundIds.forEach(fundId => {
        const dailyNavObj = allFundsHistory[fundId].find(d => d.date.getTime() === dayPoint.date.getTime());
        const nav = dailyNavObj ? dailyNavObj.nav : 10000; 

        // Execute Investments
        investmentsToday.forEach(amount => {
           if (amount > 0) {
              const unitsBought = amount / nav;
              fundStates[fundId].units += unitsBought;
              fundStates[fundId].invested += amount;
              // XIRR: Cash OUT (Negative)
              cashFlows[fundId].push({ amount: -amount, date: dayPoint.date });
           }
        });

        // Calculate current value
        const val = fundStates[fundId].units * nav;
        currentPoint[fundId] = Math.round(val);
        commonInvested = fundStates[fundId].invested;
      });

      currentPoint['invested'] = commonInvested;
      dataPoints.push(currentPoint);
    });

    // Generate Summary
    const results: FundSimulationResult[] = selectedFundIds.map(fundId => {
      const finalState = fundStates[fundId];
      const lastPoint = dataPoints[dataPoints.length - 1];
      const finalValue = lastPoint ? (lastPoint[fundId] as number) : 0;
      
      // XIRR: Add Final Value as Cash IN (Positive) - CLONE ARRAY FIRST
      const summaryFlows = [...cashFlows[fundId]];
      if (referenceHistory.length > 0) {
          summaryFlows.push({ amount: finalValue, date: referenceHistory[referenceHistory.length - 1].date });
      }

      // Calculate XIRR
      const xirr = calculateXIRR(summaryFlows);
      
      return {
        fundId,
        totalUnits: finalState.units,
        totalInvested: finalState.invested,
        currentValue: finalValue,
        absoluteReturn: finalValue - finalState.invested,
        percentReturn: finalState.invested > 0 ? ((finalValue - finalState.invested) / finalState.invested) * 100 : 0,
        xirr: xirr
      };
    }).sort((a, b) => b.percentReturn - a.percentReturn);

    return { chartData: dataPoints, summaryResults: results, cashFlowsMap: cashFlows };

  }, [selectedFundIds, dateRange, allFundsHistory, simulationMode, initialInvestment, monthlyContribution, customTransactions]);

  // --- Handlers ---
  const toggleFund = (id: string) => {
    if (selectedFundIds.includes(id)) {
      if (selectedFundIds.length > 1) {
        setSelectedFundIds(prev => prev.filter(f => f !== id));
      }
    } else {
      if (selectedFundIds.length < 3) {
        setSelectedFundIds(prev => [...prev, id]);
      }
    }
  };

  const handleCurrencyChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    setter(Number(rawValue));
  };

  const handleAddTransaction = () => {
    if (!newTxDate || newTxAmount <= 0) return;
    const newTx: CustomTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: newTxDate,
      amount: newTxAmount
    };
    // Sort by date immediately
    setCustomTransactions(prev => [...prev, newTx].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setShowAddModal(false); // Close modal
  };

  const removeCustomTransaction = (id: string) => {
    setCustomTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const formatInputValue = (val: number) => val.toLocaleString('vi-VN');
  
  const formatVND = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} tr`;
    return num.toLocaleString('vi-VN');
  };

  // Colors for chart
  const colors = ['#059669', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartTooltipBg = isDark ? '#1e293b' : '#fff';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  // --- Custom Tooltip for Chart ---
  const CustomTooltip = ({ active, payload, label, cashFlowsMap }: any) => {
    if (active && payload && payload.length) {
      const dateObj = payload[0].payload.date; // Original Date object
      
      return (
        <div style={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, borderRadius: '8px', padding: '8px 12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <p style={{ color: chartTextColor, fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>{label}</p>
          {payload.map((entry: any, index: number) => {
             const isInvestedLine = entry.name === 'invested';
             const fundName = isInvestedLine ? t('pages.simulator.totalInv') : (MOCK_FUNDS.find(f => f.id === entry.name)?.code || entry.name);
             const value = entry.value;
             const color = entry.stroke || entry.fill;
             
             let xirr = null;
             if (!isInvestedLine && cashFlowsMap && cashFlowsMap[entry.name]) {
                 // Calculate Dynamic XIRR up to this date
                 const investments = cashFlowsMap[entry.name].filter((cf: CashFlow) => cf.date <= dateObj);
                 if (investments.length > 0) {
                     // Add current value as positive cash flow
                     const flows = [...investments, { amount: value, date: dateObj }];
                     xirr = calculateXIRR(flows);
                 }
             }

             return (
               <div key={index} style={{ marginBottom: '4px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></div>
                        <span style={{ fontSize: '12px', color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 500 }}>{fundName}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: isDark ? '#fff' : '#0f172a', fontFamily: 'monospace' }}>
                        {formatVND(value)}
                    </span>
                  </div>
                  {xirr !== null && (
                      <div style={{ paddingLeft: '12px', marginTop: '-2px' }}>
                          <span style={{ fontSize: '10px', color: xirr >= 0 ? '#10b981' : '#f43f5e' }}>
                              XIRR: {xirr.toFixed(2)}%
                          </span>
                      </div>
                  )}
               </div>
             );
          })}
        </div>
      );
    }
    return null;
  };

  // --- Custom Legend Content ---
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-700">
        {payload.map((entry: any, index: number) => {
          const dataKey = entry.dataKey;
          const isInvested = dataKey === 'invested';
          const color = entry.color;
          
          if (isInvested) {
             return (
               <div key={index} className="flex items-center gap-2">
                 <div className="w-4 h-0.5" style={{ backgroundColor: color, height: 2 }} />
                 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('pages.simulator.totalInv')}</span>
               </div>
             )
          }

          const result = summaryResults.find(r => r.fundId === dataKey);
          const fundCode = MOCK_FUNDS.find(f => f.id === dataKey)?.code || dataKey;

          if (!result) return null;

          return (
            <div key={index} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{fundCode}</span>
                    <span className={`text-xs font-bold ${result.percentReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {result.percentReturn > 0 ? '+' : ''}{result.percentReturn.toFixed(1)}%
                    </span>
                </div>
                {result.xirr !== null && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        XIRR: {result.xirr.toFixed(1)}%
                    </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('pages.simulator.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('pages.simulator.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT PANEL: CONTROLS --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 1. Mode & Investment Inputs & Timeframe */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-600" />
                {t('pages.simulator.params')}
             </h2>

             {/* Mode Tabs */}
             <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
                <button 
                  onClick={() => setSimulationMode('RECURRING')}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-all ${
                    simulationMode === 'RECURRING' 
                      ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" /> Định kỳ
                </button>
                <button 
                  onClick={() => setSimulationMode('CUSTOM')}
                  className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-all ${
                    simulationMode === 'CUSTOM' 
                      ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <ListPlus className="h-4 w-4" /> Tùy chọn
                </button>
             </div>
             
             {/* RECURRING MODE INPUTS */}
             {simulationMode === 'RECURRING' && (
               <div className="animate-fade-in">
                 {/* Initial */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('pages.simulator.initialInv')}</label>
                   <div className="relative">
                     <input
                       type="text"
                       value={formatInputValue(initialInvestment)}
                       onChange={handleCurrencyChange(setInitialInvestment)}
                       className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                     />
                     <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                     </div>
                   </div>
                 </div>

                 {/* Monthly */}
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('pages.simulator.monthlyCont')}</label>
                   <div className="relative">
                     <input
                       type="text"
                       value={formatInputValue(monthlyContribution)}
                       onChange={handleCurrencyChange(setMonthlyContribution)}
                       className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                     />
                     <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                     </div>
                   </div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                     Đầu tư vào ngày đầu tiên mỗi tháng.
                   </p>
                 </div>
               </div>
             )}

             {/* CUSTOM MODE INPUTS */}
             {simulationMode === 'CUSTOM' && (
               <div className="animate-fade-in">
                 <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Danh sách lệnh ({customTransactions.length})
                      </label>
                    </div>
                    
                    {/* List of existing transactions */}
                    <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto pr-1">
                      {customTransactions.length === 0 && (
                        <div className="text-sm text-slate-400 italic text-center py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                          Chưa có giao dịch nào
                        </div>
                      )}
                      {customTransactions.map((tx, idx) => (
                        <div key={tx.id} className="group relative flex items-center justify-between p-2 bg-white dark:bg-slate-700/30 rounded-lg border-l-4 border-l-emerald-500 border border-t-slate-100 border-r-slate-100 border-b-slate-100 dark:border-t-slate-700 dark:border-r-slate-700 dark:border-b-slate-700 shadow-sm hover:shadow-md transition-all">
                           {/* Left: Index + Date */}
                           <div className="flex items-center gap-3">
                             <span className="text-[10px] font-bold text-slate-400 w-4">#{idx + 1}</span>
                             <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{tx.date}</span>
                           </div>
                           
                           {/* Right: Amount + Delete */}
                           <div className="flex items-center gap-3">
                             <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatVND(tx.amount)}</span>
                             <button 
                                onClick={() => removeCustomTransaction(tx.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all"
                                title="Xóa lệnh"
                              >
                               <Trash2 className="h-3.5 w-3.5" />
                             </button>
                           </div>
                        </div>
                      ))}
                    </div>

                    {/* Trigger Modal Button */}
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
                    >
                      <Plus className="h-4 w-4" /> Thêm lệnh đầu tư
                    </button>
                 </div>
               </div>
             )}

             {/* Timeframe Selection (Segmented Control Style) */}
             <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
               <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-emerald-600" />
                  {t('pages.dashboard.period')}
               </label>
               
               <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl grid grid-cols-3 sm:flex">
                  {(['1Y', '2Y', '3Y', '5Y', 'YTD', 'CUSTOM'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeFrame(tf)}
                      className={`sm:flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                        timeFrame === tf
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {tf === 'CUSTOM' ? 'Tùy chọn' : tf}
                    </button>
                  ))}
               </div>
               
               {timeFrame === 'CUSTOM' && (
                 <div className="flex flex-col gap-3 mt-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700 animate-fade-in-down">
                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Từ ngày</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full text-xs p-2 pl-8 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                          <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Đến ngày</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full text-xs p-2 pl-8 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                          <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* 2. Fund Selection */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('pages.simulator.selectFund')}</h2>
                <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">{selectedFundIds.length}/3</span>
             </div>
             <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
               {MOCK_FUNDS.map(fund => {
                 const isSelected = selectedFundIds.includes(fund.id);
                 return (
                   <div 
                      key={fund.id}
                      onClick={() => toggleFund(fund.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                   >
                     <div className="flex flex-col">
                       <span className={`font-bold text-sm ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                         {fund.code}
                       </span>
                       <span className="text-xs text-slate-500">{fund.name}</span>
                     </div>
                     {isSelected && <Check className="h-5 w-5 text-emerald-600" />}
                   </div>
                 );
               })}
             </div>
             {selectedFundIds.length >= 3 && (
               <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                 <AlertCircle className="h-3 w-3" /> Tối đa 3 quỹ để so sánh.
               </p>
             )}
          </div>

        </div>

        {/* --- RIGHT PANEL: RESULTS --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Summary Cards (Top Performer Highlight) */}
          {summaryResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Total Invested */}
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400">
                     <DollarSign className="h-4 w-4" />
                     <span className="text-sm font-semibold uppercase tracking-wider">{t('pages.simulator.totalInv')}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatVND(summaryResults[0].totalInvested)}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Vốn gốc đã bỏ ra trong giai đoạn này
                  </div>
               </div>

               {/* Best Performer */}
               <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-800 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1 text-emerald-800 dark:text-emerald-300">
                        <TrophyWrapper />
                        <span className="text-sm font-bold uppercase tracking-wider">Hiệu quả nhất: {MOCK_FUNDS.find(f => f.id === summaryResults[0].fundId)?.code}</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                      {formatVND(summaryResults[0].currentValue)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-bold text-emerald-600 bg-white dark:bg-emerald-900 px-2 py-0.5 rounded shadow-sm">
                          +{summaryResults[0].percentReturn.toFixed(1)}%
                        </span>
                        {summaryResults[0].xirr !== null && (
                          <span className="text-xs text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 border border-emerald-200 dark:border-emerald-800 rounded bg-white/50 dark:bg-black/20">
                            XIRR: {summaryResults[0].xirr.toFixed(2)}%
                          </span>
                        )}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('pages.simulator.chartTitle')} (Backtest)</h3>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(0)}M` : val} 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    content={<CustomTooltip cashFlowsMap={cashFlowsMap} />}
                  />
                  <Legend 
                    content={renderCustomLegend} 
                    verticalAlign="top"
                    height={80}
                  />
                  
                  {/* Invested Line */}
                  <Line 
                    type="stepAfter" 
                    dataKey="invested" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false} 
                    name="invested"
                  />

                  {/* Fund Lines */}
                  {selectedFundIds.map((id, index) => (
                    <Line 
                      key={id}
                      type="monotone" 
                      dataKey={id} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={3} 
                      dot={false}
                      name={id} // We use ID here, formatter handles display name
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
               <h3 className="font-bold text-slate-900 dark:text-white">Bảng so sánh hiệu quả</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                 <thead className="bg-white dark:bg-slate-800">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Quỹ</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.simulator.totalInv')}</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Giá trị hiện tại</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('pages.simulator.totalProfit')}</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng lãi (%)</th>
                     <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-end gap-1">
                        XIRR
                        <div className="group relative">
                          <Info className="h-3 w-3 cursor-help text-slate-400" />
                          <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-white text-[10px] p-2 rounded hidden group-hover:block z-50 normal-case font-normal">
                            Extended Internal Rate of Return: Tỷ suất lợi nhuận thực tế hằng năm tính theo dòng tiền vào/ra.
                          </div>
                        </div>
                     </th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                   {summaryResults.map((res) => {
                     const fund = MOCK_FUNDS.find(f => f.id === res.fundId);
                     return (
                       <tr key={res.fundId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="font-bold text-slate-900 dark:text-white">{fund?.code}</div>
                           <div className="text-xs text-slate-500">{fund?.name}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500 dark:text-slate-400 font-mono">
                           {formatVND(res.totalInvested)}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-right text-slate-900 dark:text-white font-bold font-mono">
                           {formatVND(res.currentValue)}
                         </td>
                         <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${res.absoluteReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {res.absoluteReturn > 0 ? '+' : ''}{formatVND(res.absoluteReturn)}
                         </td>
                         <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${res.percentReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {res.percentReturn.toFixed(2)}%
                         </td>
                         <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${res.xirr && res.xirr >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                           {res.xirr !== null ? `${res.xirr.toFixed(2)}%` : 'N/A'}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>

      {/* --- ADD TRANSACTION MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 animate-scale-in">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thêm lệnh đầu tư</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                  <X className="h-6 w-6" />
                </button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ngày giao dịch</label>
                   <input 
                      type="date" 
                      value={newTxDate}
                      onChange={(e) => setNewTxDate(e.target.value)}
                      className="w-full text-sm p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Số tiền (VND)</label>
                   <div className="relative">
                     <input 
                        type="text" 
                        value={formatInputValue(newTxAmount)}
                        onChange={handleCurrencyChange(setNewTxAmount)}
                        className="w-full text-lg font-bold p-3 pr-16 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                     />
                     <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                     </div>
                   </div>
                </div>
             </div>

             <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:shadow-md"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleAddTransaction}
                  className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 shadow-md transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" /> Xác nhận
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper component to avoid import issues
const TrophyWrapper = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

export default Simulator;