import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, ShieldCheck, PieChart, Info, ArrowRight, Calculator, Target, Landmark, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MOCK_FUNDS, CHART_DATA_OVERVIEW } from '../constants';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);
  const [period, setPeriod] = React.useState<'1Y' | '3Y' | '5Y'>('5Y');

  // Sort funds by CAGR descending based on selected period
  const sortedFunds = [...MOCK_FUNDS].sort((a, b) => {
    const key = `cagr${period}` as keyof typeof a;
    return (b[key] as number) - (a[key] as number);
  }).slice(0, 5); // Top 5

  const featuredTools = [
    {
      title: t('common.simulator'),
      desc: t('simulator.subtitle'),
      icon: <TrendingUp className="h-6 w-6 text-white" />,
      path: '/simulator',
      color: 'bg-blue-600'
    },
    {
      title: t('tools.compound.name'),
      desc: t('tools.compound.desc'),
      icon: <Calculator className="h-6 w-6 text-white" />,
      path: '/tools/compound-interest',
      color: 'bg-emerald-600'
    },
    {
      title: t('tools.goal.name'),
      desc: t('tools.goal.desc'),
      icon: <Target className="h-6 w-6 text-white" />,
      path: '/tools/financial-goal-planner',
      color: 'bg-purple-600'
    },
    {
      title: t('tools.inflation.name'),
      desc: t('tools.inflation.desc'),
      icon: <TrendingDown className="h-6 w-6 text-white" />,
      path: '/tools/inflation-calculator',
      color: 'bg-rose-600'
    }
  ];

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartTooltipBg = isDark ? '#1e293b' : '#fff';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {t('homePage.heroTitle')} <span className="text-emerald-600 dark:text-emerald-400">Việt Nam</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            {t('homePage.heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/simulator"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {t('homePage.simulateBtn')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/funds"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t('homePage.viewFundsBtn')}
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            {t('homePage.disclaimer')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Featured Tools Grid */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTools.map((tool, idx) => (
              <Link 
                key={idx} 
                to={tool.path} 
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {tool.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Fund Ranking Table */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('homePage.rankingTitle')}</h2>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg self-start">
              {(['1Y', '3Y', '5Y'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPeriod(t)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    period === t
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.info')}</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">CAGR ({period})</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundDetail.volatility')}</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.expense')}</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.type')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {sortedFunds.map((fund) => (
                  <tr
                    key={fund.id}
                    onClick={() => navigate(`/funds/${fund.id}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {fund.code}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{fund.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fund[`cagr${period}`] > 10 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' 
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                        {fund[`cagr${period}`]}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                      {fund.volatility}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                      {fund.expenseRatio}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                      {fund.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 text-center">
            <Link to="/funds" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center justify-center gap-1">
              {t('homePage.viewFundsBtn')} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Overview Chart */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('homePage.marketPerf')}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{t('homePage.marketPerfSub')}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHART_DATA_OVERVIEW} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="year" stroke={chartTextColor} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke={chartTextColor} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}tr`} />
                <Tooltip
                  contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: chartTextColor }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                  labelStyle={{ color: chartTextColor, marginBottom: '4px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="fund" name="Quỹ Tăng trưởng" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="market" name="VN-Index" stroke={chartTextColor} strokeWidth={2} dot={{ r: 4, fill: chartTextColor, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-12 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">{t('homePage.ctaTitle')}</h2>
            <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
              {t('homePage.ctaDesc')}
            </p>
            <Link
              to="/simulator"
              className="inline-block px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-lg"
            >
              {t('homePage.ctaBtn')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;