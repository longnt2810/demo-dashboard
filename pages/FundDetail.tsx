import React, { useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Percent, Activity, BarChart2, PieChart, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { MOCK_FUNDS } from '../constants';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

// Helper to generate fake historical data based on fund performance
const generateMockHistory = (baseValue: number, cagr: number) => {
  const data = [];
  let currentValue = 10000;
  const monthlyRate = Math.pow(1 + cagr / 100, 1 / 12) - 1;
  const volatility = 0.04; // Random noise

  for (let i = 0; i < 60; i++) {
    // 5 years of data
    const date = new Date();
    date.setMonth(date.getMonth() - (59 - i));

    const noise = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + monthlyRate + noise);

    data.push({
      date: date.toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' }),
      nav: Math.round(currentValue),
      benchmark: Math.round(currentValue * (0.95 + Math.random() * 0.1)) // correlated benchmark
    });
  }
  return data;
};

const FundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);
  const fund = MOCK_FUNDS.find(f => f.id === id);

  if (!fund) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fund not found</h2>
        <Link to="/funds" className="text-emerald-600 hover:underline mt-4 inline-block">
          Return to funds list
        </Link>
      </div>
    );
  }

  const historyData = generateMockHistory(fund.nav, fund.cagr3Y);
  
  // Prepare Annual Performance Data
  const annualPerfData = useMemo(() => {
    return fund.annualPerformance.map(p => ({
        year: p.year,
        value: p.value,
        fill: p.value >= 0 ? '#059669' : '#e11d48'
    }));
  }, [fund]);

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#94a3b8';
  const chartTooltipBg = isDark ? '#1e293b' : '#fff';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/funds" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('pages.fundDetail.back')}
      </Link>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8 transition-colors">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                  fund.type === 'ETF' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                }`}>
                  {fund.type}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{fund.company}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{fund.name}</h1>
              <p className="text-2xl text-slate-900 dark:text-slate-200 font-mono flex items-baseline gap-2">
                {fund.code}
              </p>
            </div>
            <div className="flex flex-col gap-3">
               <Link
                to={`/simulator?fundId=${fund.id}`}
                className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                {t('pages.fundDetail.simulate')}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-sm">
              <Calendar className="h-4 w-4" /> {t('pages.fundDetail.inception')}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{fund.inceptionDate}</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-sm">
              <Percent className="h-4 w-4" /> {t('pages.fundDetail.expense')}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{fund.expenseRatio}%</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-sm">
              <Activity className="h-4 w-4" /> {t('pages.fundDetail.volatility')}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{fund.volatility}%</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1 text-sm">
              <BarChart2 className="h-4 w-4" /> {t('pages.fundDetail.benchmark')}
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{fund.benchmark}</div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            {fund.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* NAV History Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('pages.fundDetail.navHistory')}</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartTextColor} tick={{fontSize: 12}} minTickGap={30} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: chartTextColor }}
                  itemStyle={{ color: chartTextColor }}
                />
                <Area type="monotone" dataKey="nav" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorNav)" name="NAV" />
                <Area type="monotone" dataKey="benchmark" stroke={isDark ? '#475569' : '#cbd5e1'} strokeWidth={2} strokeDasharray="4 4" fill="none" name={t('pages.fundDetail.benchmark')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Side Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{t('pages.fundDetail.metrics')}</h3>
           <div className="space-y-6">
             <div>
               <div className="flex justify-between items-end mb-1">
                 <span className="text-sm text-slate-500 dark:text-slate-400">1 Year Return</span>
                 <span className={`text-lg font-bold ${fund.cagr1Y >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                   {fund.cagr1Y > 0 ? '+' : ''}{fund.cagr1Y}%
                 </span>
               </div>
               <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                 <div
                   className={`h-2 rounded-full ${fund.cagr1Y >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                   style={{ width: `${Math.min(Math.abs(fund.cagr1Y) * 2, 100)}%` }}
                 />
               </div>
             </div>

             <div>
               <div className="flex justify-between items-end mb-1">
                 <span className="text-sm text-slate-500 dark:text-slate-400">3 Year CAGR</span>
                 <span className="text-lg font-bold text-slate-900 dark:text-white">{fund.cagr3Y}%</span>
               </div>
               <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                 <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(fund.cagr3Y * 2, 100)}%` }} />
               </div>
             </div>

             <div>
               <div className="flex justify-between items-end mb-1">
                 <span className="text-sm text-slate-500 dark:text-slate-400">5 Year CAGR</span>
                 <span className="text-lg font-bold text-slate-900 dark:text-white">{fund.cagr5Y}%</span>
               </div>
               <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                 <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(fund.cagr5Y * 2, 100)}%` }} />
               </div>
             </div>

             <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{t('pages.fundDetail.maxDrawdown')}</span>
                  <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{fund.maxDrawdown}%</span>
               </div>
               <p className="text-xs text-slate-400 dark:text-slate-500">
                 {t('pages.fundDetail.drawdownDesc')}
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* --- NEW SECTIONS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Annual Performance Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="h-5 w-5 text-emerald-600" />
                    Hiệu suất từng năm (%)
                </h3>
            </div>
            
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={annualPerfData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                        <XAxis dataKey="year" stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={chartTextColor} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                             cursor={{fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4}}
                             contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, color: chartTextColor }}
                             formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}%`, 'Lợi nhuận']}
                        />
                        <ReferenceLine y={0} stroke={chartTextColor} />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                            {annualPerfData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. Top Holdings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-emerald-600" />
                Top 10 Tài sản nắm giữ
            </h3>
            
            <div className="overflow-hidden">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                            <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Mã</th>
                            <th className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pl-2">Tên</th>
                            <th className="text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Tỷ trọng</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {fund.holdings.map((holding, idx) => (
                            <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="py-3 text-sm font-bold text-slate-900 dark:text-white w-16">
                                    {holding.symbol}
                                </td>
                                <td className="py-3 pl-2">
                                    <div className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[200px]">{holding.name}</div>
                                    <div className="text-[10px] text-slate-400">{holding.sector}</div>
                                </td>
                                <td className="py-3 text-right w-32">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white mb-1">{holding.weight}%</span>
                                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full" 
                                                style={{ width: `${(holding.weight / 20) * 100}%` }} // Scale relative to ~20% max for visual pop
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>

    </div>
  );
};

export default FundDetail;