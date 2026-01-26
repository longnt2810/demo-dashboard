import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, TrendingDown, Coffee, ShoppingBag, Coins, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

interface InflationRow {
  year: number;
  nominalValue: number; // Value stays same (e.g. 100M)
  purchasingPower: number; // Value erodes (e.g. 96M)
  futureCost: number; // Cost increases (e.g. 104M to buy same goods)
}

const InflationCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);

  // Inputs
  const [currentAmount, setCurrentAmount] = useState<number>(100000000); // 100M VND
  const [inflationRate, setInflationRate] = useState<number>(4); // 4% average
  const [years, setYears] = useState<number>(10);

  // Results
  const [data, setData] = useState<InflationRow[]>([]);
  
  useEffect(() => {
    calculate();
  }, [currentAmount, inflationRate, years]);

  const calculate = () => {
    const rows: InflationRow[] = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= years; i++) {
      // Purchasing Power: Amount / (1 + r)^n
      // Future Cost: Amount * (1 + r)^n
      const power = currentAmount / Math.pow(1 + inflationRate / 100, i);
      const cost = currentAmount * Math.pow(1 + inflationRate / 100, i);

      rows.push({
        year: currentYear + i,
        nominalValue: currentAmount,
        purchasingPower: Math.round(power),
        futureCost: Math.round(cost)
      });
    }
    setData(rows);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
  };

  const formatShortVND = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} tr`;
    return num.toLocaleString();
  };

  const handleCurrencyChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    setter(Number(rawValue));
  };

  const formatInputValue = (val: number) => {
    return val.toLocaleString('vi-VN');
  };

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#94a3b8';

  const finalData = data[data.length - 1] || { 
    year: new Date().getFullYear(), 
    nominalValue: currentAmount, 
    purchasingPower: 0, 
    futureCost: 0 
  };
  const phoPriceToday = 50000;
  const phoPriceFuture = phoPriceToday * Math.pow(1 + inflationRate / 100, years);
  
  // New Metric: Total Loss %
  const lossPercentage = currentAmount > 0 ? ((currentAmount - finalData.purchasingPower) / currentAmount) * 100 : 0;

  // --- Custom Tooltip Component ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Access the full data object for this point
      const dataItem = payload[0].payload;
      
      const futureCost = dataItem.futureCost;
      const purchasingPower = dataItem.purchasingPower;
      
      // Calculate multiplier
      const multiplier = currentAmount > 0 ? futureCost / currentAmount : 1;
      
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 min-w-[240px]">
          {/* Header: NĂM X */}
          <div className="mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
               NĂM {label}
             </span>
          </div>

          {/* Main Value: Future Cost */}
          <div className="mb-5">
             <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{t('pages.tools.inflation.chartCost')}</p>
             <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
               {formatShortVND(futureCost)}
             </p>
             <p className="text-[10px] text-slate-400 mt-1">
               Gấp {multiplier.toFixed(1)}x hiện tại
             </p>
          </div>

          {/* Breakdown List */}
          <div className="space-y-3">
            {/* Purchasing Power */}
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">{t('pages.tools.inflation.chartPower')}</span>
               </div>
               <span className="font-bold text-slate-900 dark:text-white text-xs tabular-nums">{formatShortVND(purchasingPower)}</span>
            </div>
            
            {/* Value Eroded */}
            <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-50 dark:border-slate-700/50">
               <div className="flex items-center gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">Mất giá trị</span>
               </div>
               <span className="font-bold text-rose-600 dark:text-rose-400 text-xs tabular-nums">
                 -{formatShortVND(currentAmount - purchasingPower)}
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('pages.tools.inflation.name')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('pages.tools.inflation.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-600" />
              {t('pages.tools.compound.params')}
            </h2>

            {/* Current Amount */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.inflation.current')}
              </label>
              <div className="relative">
                 <input
                  type="text"
                  value={formatInputValue(currentAmount)}
                  onChange={handleCurrencyChange(setCurrentAmount)}
                  className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                </div>
              </div>
            </div>

            {/* Inflation Rate */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.inflation.rate')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="block w-full pl-4 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                *Lạm phát trung bình tại Việt Nam thường dao động quanh mức 4%.
              </p>
            </div>

            {/* Duration */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.compound.period')}: {years} {t('common.year')}
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>1 {t('common.year')}</span>
                <span>50 {t('common.year')}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setCurrentAmount(100000000);
                setInflationRate(4);
                setYears(10);
              }}
              className="w-full flex items-center justify-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 rounded-full transition-all"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> {t('pages.tools.compound.reset')}
            </button>
          </div>
          
           {/* Coffee/Pho Index Card */}
           <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-900/50">
             <div className="flex items-center gap-2 mb-4">
               <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-lg">
                 <Coffee className="h-5 w-5 text-amber-700 dark:text-amber-300" />
               </div>
               <h3 className="font-bold text-amber-900 dark:text-amber-100">{t('pages.tools.inflation.exampleTitle')}</h3>
             </div>
             <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
               {t('pages.tools.inflation.exampleDesc', { years })}
             </p>
             <div className="flex items-end gap-2">
               <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                 {formatVND(Math.round(phoPriceFuture))}
               </span>
               <span className="text-xs text-amber-600 dark:text-amber-400 mb-1 line-through">
                 {formatVND(phoPriceToday)}
               </span>
             </div>
           </div>
        </div>

        {/* Right Column: Summary & Chart */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* UPDATED: Modern FinTech Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Card 1: HERO - Purchasing Power (Rose Gradient) */}
             <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 text-white shadow-lg md:col-span-1 lg:col-span-1 xl:col-span-1">
               {/* Decorative Circles */}
               <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border-[16px] border-white/10"></div>
               <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border-[16px] border-white/5"></div>
               
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                     <p className="text-rose-100 text-sm font-medium mb-1 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        {t('pages.tools.inflation.purchasingPower')}
                     </p>
                     <h3 className="text-3xl font-extrabold tracking-tight">
                       {formatShortVND(finalData.purchasingPower)}
                     </h3>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-rose-50 text-xs">
                     <TrendingDown className="h-4 w-4 text-white" />
                     <span>Giá trị thực còn lại</span>
                  </div>
               </div>
             </div>

             {/* Card 2: Future Cost (Clean Style) */}
             <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                   <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                      <Coins className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                   </div>
               </div>
               <div>
                   <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('pages.tools.inflation.futureCost')}</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatShortVND(finalData.futureCost)}</h3>
                   <div className="text-xs text-slate-400 mt-1">Để mua cùng lượng hàng hóa</div>
               </div>
             </div>

             {/* Card 3: Loss Percentage (Clean Style) */}
             <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                   <div className="bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                   </div>
                   <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-md">
                      Mất {lossPercentage.toFixed(1)}%
                   </span>
               </div>
               <div>
                   <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Tài sản bốc hơi</p>
                   <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatShortVND(currentAmount - finalData.purchasingPower)}</h3>
                   <div className="text-xs text-slate-400 mt-1">Do lạm phát tích lũy</div>
               </div>
             </div>
          </div>

          {/* Area Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full max-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
                {t('pages.tools.compound.chart')}
              </h3>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                  <XAxis dataKey="year" stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={formatShortVND} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="futureCost" name={t('pages.tools.inflation.chartCost')} stackId="2" stroke="#059669" fill="url(#colorCost)" />
                  <Area type="monotone" dataKey="purchasingPower" name={t('pages.tools.inflation.chartPower')} stackId="1" stroke="#e11d48" fill="url(#colorPower)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InflationCalculator;