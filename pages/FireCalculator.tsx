import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, Flame, PiggyBank, CalendarCheck, TrendingUp, AlertTriangle, Calculator, Sparkles } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

interface FireRow {
  age: number;
  year: number;
  netWorth: number;
  fireTarget: number;
}

type Frequency = 'Monthly' | 'Yearly';

const FireCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);

  // Inputs
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [netWorth, setNetWorth] = useState<number>(500000000); // 500M VND
  
  // Income
  const [income, setIncome] = useState<number>(360000000); // Default value
  const [incomeFreq, setIncomeFreq] = useState<Frequency>('Yearly');

  // Expenses
  const [expense, setExpense] = useState<number>(180000000); // Default value
  const [expenseFreq, setExpenseFreq] = useState<Frequency>('Yearly');

  const [returnRate, setReturnRate] = useState<number>(10); // 10% investment return
  const [inflationRate, setInflationRate] = useState<number>(4); // 4% inflation
  const [withdrawalRate, setWithdrawalRate] = useState<number>(4); // 4% rule

  // Results
  const [fireNumber, setFireNumber] = useState<number>(0);
  const [yearsToFire, setYearsToFire] = useState<number>(0);
  const [ageAtFire, setAgeAtFire] = useState<number>(0);
  const [savingsRate, setSavingsRate] = useState<number>(0);
  const [data, setData] = useState<FireRow[]>([]);

  useEffect(() => {
    calculateFire();
  }, [currentAge, netWorth, income, incomeFreq, expense, expenseFreq, returnRate, inflationRate, withdrawalRate]);

  const calculateFire = () => {
    // Normalize to Annual values for calculation
    const annualIncome = incomeFreq === 'Monthly' ? income * 12 : income;
    const annualExpenses = expenseFreq === 'Monthly' ? expense * 12 : expense;

    // 1. Calculate Target
    const target = annualExpenses / (withdrawalRate / 100);
    setFireNumber(target);

    // 2. Calculate Savings Rate
    const savings = annualIncome - annualExpenses;
    const rate = annualIncome > 0 ? (savings / annualIncome) * 100 : 0;
    setSavingsRate(rate);

    // 3. Project Growth (Using Real Rate of Return for simplicity in visualization relative to purchasing power)
    // Formula: Real Rate = (1 + Nominal) / (1 + Inflation) - 1
    const realReturnRate = ((1 + returnRate / 100) / (1 + inflationRate / 100)) - 1;
    
    // We project using REAL values so the FIRE Target line stays flat (representing today's purchasing power).
    // This makes the chart easier to understand.
    
    let currentBalance = netWorth;
    const rows: FireRow[] = [];
    const currentYear = new Date().getFullYear();
    let reached = false;
    let yearsAfterFire = 0;

    // Limit projection to 50 years or Age 100
    const maxYears = 100 - currentAge;

    for (let i = 0; i <= maxYears; i++) {
      rows.push({
        age: currentAge + i,
        year: currentYear + i,
        netWorth: Math.round(currentBalance),
        fireTarget: Math.round(target)
      });

      if (currentBalance >= target) {
        if (!reached) {
            setYearsToFire(i);
            setAgeAtFire(currentAge + i);
            reached = true;
        }
        
        yearsAfterFire++;
        // Stop 5 years after reaching target to show the crossover clearly but not go on forever
        if (yearsAfterFire >= 5) {
            break;
        }
      }

      // Grow for next year
      // Add savings (assuming savings adjust with inflation, so in real terms they are constant)
      currentBalance = currentBalance * (1 + realReturnRate) + savings;
    }

    if (!reached) {
      setYearsToFire(maxYears);
      setAgeAtFire(currentAge + maxYears);
    }

    setData(rows);
  };

  // Formatters
  const formatShortVND = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} tr`;
    return num.toLocaleString();
  };

  const formatInputValue = (val: number) => {
    return val.toLocaleString('vi-VN');
  };

  const handleCurrencyChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    setter(Number(rawValue));
  };

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  
  // --- Custom Tooltip Component ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Access the full data object for this point
      const dataItem = payload[0].payload;
      
      const netWorthVal = dataItem.netWorth;
      const targetVal = dataItem.fireTarget;
      
      // Calculate progress
      const progress = targetVal > 0 ? (netWorthVal / targetVal) * 100 : 0;
      const isReached = netWorthVal >= targetVal;
      
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 min-w-[240px]">
          {/* Header: AGE (YEAR) */}
          <div className="mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
               {label} TUỔI (NĂM {dataItem.year})
             </span>
          </div>

          {/* Main Value: Net Worth */}
          <div className="mb-5">
             <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{t('pages.tools.fire.chartWorth')}</p>
             <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
               {formatShortVND(netWorthVal)}
             </p>
          </div>

          {/* Breakdown List */}
          <div className="space-y-3">
            {/* Target */}
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">{t('pages.tools.fire.chartTarget')}</span>
               </div>
               <span className="font-bold text-slate-900 dark:text-white text-xs tabular-nums">{formatShortVND(targetVal)}</span>
            </div>
            
            {/* Progress */}
            <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-50 dark:border-slate-700/50">
               <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">Tiến độ</span>
               </div>
               <span className={`font-bold text-xs tabular-nums ${isReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                 {progress.toFixed(1)}%
               </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/tools" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('navigation.tools')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {t('pages.tools.fire.name')} <Flame className="h-8 w-8 text-orange-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('pages.tools.fire.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              {t('pages.tools.compound.params')}
            </h2>

            {/* Current Age */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.fire.currentAge')}
              </label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="block w-full pl-4 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
              />
            </div>

            {/* Net Worth */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.fire.netWorth')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formatInputValue(netWorth)}
                  onChange={handleCurrencyChange(setNetWorth)}
                  className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                </div>
              </div>
            </div>

            {/* Income with Frequency */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.fire.income')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={formatInputValue(income)}
                    onChange={handleCurrencyChange(setIncome)}
                    className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                  </div>
                </div>
                <select
                  value={incomeFreq}
                  onChange={(e) => setIncomeFreq(e.target.value as Frequency)}
                  className="block w-32 pl-3 pr-8 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm"
                >
                  <option value="Monthly">/ {t('common.month')}</option>
                  <option value="Yearly">/ {t('common.year')}</option>
                </select>
              </div>
            </div>

            {/* Expenses with Frequency */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.fire.expense')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={formatInputValue(expense)}
                    onChange={handleCurrencyChange(setExpense)}
                    className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                  </div>
                </div>
                 <select
                  value={expenseFreq}
                  onChange={(e) => setExpenseFreq(e.target.value as Frequency)}
                  className="block w-32 pl-3 pr-8 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm"
                >
                  <option value="Monthly">/ {t('common.month')}</option>
                  <option value="Yearly">/ {t('common.year')}</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
               <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Nâng cao</h3>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t('pages.tools.fire.returns')}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={returnRate}
                        onChange={(e) => setReturnRate(Number(e.target.value))}
                        className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">%</span>
                      </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t('pages.tools.fire.inflation')}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={inflationRate}
                        onChange={(e) => setInflationRate(Number(e.target.value))}
                        className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 dark:text-slate-400 text-xs">%</span>
                      </div>
                    </div>
                 </div>
               </div>
               
               <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t('pages.tools.fire.swr')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={withdrawalRate}
                      onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                      className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{t('pages.tools.fire.swrDesc')}</p>
               </div>
            </div>

            <button 
              onClick={() => {
                setCurrentAge(30);
                setNetWorth(500000000);
                setIncome(360000000);
                setIncomeFreq('Yearly');
                setExpense(180000000);
                setExpenseFreq('Yearly');
                setReturnRate(10);
                setInflationRate(4);
                setWithdrawalRate(4);
              }}
              className="w-full flex items-center justify-center py-3 mt-6 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 rounded-full transition-all"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> {t('pages.tools.compound.reset')}
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* UPDATED: Modern FinTech Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: HERO - FIRE Number (Gradient & Pattern) */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-lg md:col-span-1 lg:col-span-1 xl:col-span-1">
                {/* Decorative Pattern */}
                <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border-[16px] border-white/10"></div>
                <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border-[16px] border-white/5"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <p className="text-orange-100 text-sm font-medium mb-1 flex items-center gap-2">
                         <Flame className="h-4 w-4" />
                         {t('pages.tools.fire.fireNumber')}
                      </p>
                      <h3 className="text-3xl font-extrabold tracking-tight">
                        {formatShortVND(fireNumber)}
                      </h3>
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-orange-50 text-xs">
                      <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                      <span>Mục tiêu tài chính cần đạt</span>
                   </div>
                </div>
            </div>

            {/* Card 2: Years to FIRE (Clean Style) */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                   <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl">
                      <CalendarCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                   </div>
               </div>
               <div>
                   <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('pages.tools.fire.yearsToFire')}</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{yearsToFire} {t('common.year')}</h3>
                   <div className="text-xs text-slate-400 mt-1">Đạt tự do tài chính tuổi {ageAtFire}</div>
               </div>
            </div>

            {/* Card 3: Savings Rate (Clean Style) */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                   <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                      <PiggyBank className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                      Tốt
                   </span>
               </div>
               <div>
                   <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('pages.tools.fire.savingsRate')}</p>
                   <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{savingsRate.toFixed(1)}%</h3>
                   <div className="text-xs text-slate-400 mt-1">Tỷ lệ tiết kiệm hiện tại</div>
               </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full max-h-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Lộ trình tăng trưởng tài sản
              </h3>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                  <XAxis dataKey="age" stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} label={{ value: 'Tuổi', position: 'insideBottom', offset: -5, fill: chartTextColor, fontSize: 10 }} />
                  <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={formatShortVND} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine y={fireNumber} label="Mục tiêu FIRE" stroke="red" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="netWorth" name={t('pages.tools.fire.chartWorth')} stroke="#059669" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="fireTarget" name={t('pages.tools.fire.chartTarget')} stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FireCalculator;