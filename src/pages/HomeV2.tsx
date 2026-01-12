import React, { useContext, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Trophy, TrendingUp, Activity, BarChart2, Shield, ArrowRight, Calculator, Target, TrendingDown, Calendar, Clock, LayoutDashboard, Info, Wrench, Sparkles, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ZAxis, Cell, ReferenceArea, ReferenceLine } from 'recharts';
import { MOCK_FUNDS } from '../constants';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

// Define consistent colors for funds based on their code
const FUND_COLORS: Record<string, string> = {
  'E1VFVN30': '#059669', // Emerald
  'FUESSV50': '#3b82f6', // Blue
  'VCBF-BCF': '#8b5cf6', // Violet
  'VEOF': '#f59e0b',     // Amber
  'MAFEQI': '#ef4444',   // Red
  // Fallback colors if more funds are added
  'DEFAULT': '#64748b'
};

const getFundColor = (code: string, index: number) => {
  return FUND_COLORS[code] || ['#06b6d4', '#ec4899', '#84cc16'][index % 3];
};

const HomeV2: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);
  const [period, setPeriod] = useState<'1Y' | '3Y' | '5Y'>('5Y');

  // Helper to calculate date range string
  const dateRangeInfo = useMemo(() => {
    const end = new Date();
    const start = new Date();
    const years = parseInt(period.replace('Y', ''));
    start.setFullYear(end.getFullYear() - years);
    
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return `${start.toLocaleDateString('vi-VN', options)} - ${end.toLocaleDateString('vi-VN', options)}`;
  }, [period]);

  // 1. Data for Ranking Chart
  const sortedFunds = useMemo(() => {
    return [...MOCK_FUNDS]
      .sort((a, b) => {
        const key = `cagr${period}` as keyof typeof a;
        return (b[key] as number) - (a[key] as number);
      })
      .slice(0, 5);
  }, [period]);

  // 2. Data for Historical Simulation (based on selected period)
  const simulationData = useMemo(() => {
    const initialAmount = 100000000;
    const numYears = parseInt(period.replace('Y', ''));
    const dataPoints = [];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - numYears;

    for (let i = 0; i <= numYears; i++) {
        const point: any = { year: startYear + i };
        sortedFunds.forEach(fund => {
            // Approximating history using CAGR for the selected period
            // Value = P * (1 + r)^t
            const cagrKey = `cagr${period}` as keyof typeof fund;
            const rate = (fund[cagrKey] as number) / 100; 
            const value = initialAmount * Math.pow(1 + rate, i);
            point[fund.code] = Math.round(value);
        });
        dataPoints.push(point);
    }
    return dataPoints;
  }, [sortedFunds, period]);

  // 3. Data for Risk/Reward Scatter (based on selected period)
  const riskRewardData = useMemo(() => {
      return MOCK_FUNDS.map(fund => {
          const cagrKey = `cagr${period}` as keyof typeof fund;
          return {
            x: fund.volatility, // Risk (Volatility) - Assumed constant/annualized
            y: fund[cagrKey] as number, // Reward (Return) - Dynamic based on period
            z: fund.expenseRatio,
            name: fund.code,
            type: fund.type
          };
      });
  }, [period]);

  // 4. Featured Tools
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

  const formatShortVND = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}M`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section (Revamped) */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.2]" 
             style={{ backgroundImage: `radial-gradient(${isDark ? '#334155' : '#cbd5e1'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
        </div>
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-100/60 dark:bg-emerald-900/20 blur-[100px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tracking-wide uppercase">
                  Dữ liệu được cập nhật {new Date().getFullYear()}
              </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            {t('homePage.heroTitle')} <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 relative">
              Thị trường Việt Nam
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-emerald-200 dark:text-emerald-900/50 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('homePage.heroSubtitle')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/simulator"
              className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-emerald-600 rounded-full overflow-hidden transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              <span className="relative z-10 flex items-center">
                {t('homePage.simulateBtn')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            
            <Link
              to="/funds"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:shadow-md"
            >
              {t('homePage.viewFundsBtn')}
            </Link>
          </div>

          {/* Footer Note */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400 dark:text-slate-500">
             <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>Trung lập</span>
             </div>
             <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
             <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                <span>Dữ liệu thực</span>
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 1: MARKET OVERVIEW (Dashboard) --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                         <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                             <LayoutDashboard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('homeV2.title')}</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                        {t('homeV2.subtitle')}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center">
                        <div className="hidden sm:flex items-center gap-2 px-3 text-sm text-slate-500 border-r border-slate-100 dark:border-slate-700 mr-1">
                            <Calendar className="h-4 w-4" />
                            <span>Kỳ hạn:</span>
                        </div>
                        {(['1Y', '3Y', '5Y'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                                    period === p
                                    ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-md'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
                        <Clock className="h-3 w-3" />
                        Dữ liệu: <span className="text-slate-700 dark:text-slate-300">{dateRangeInfo}</span>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Ranking Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            {t('homeV2.topFunds')}
                        </h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{period}</span>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={sortedFunds} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                                <XAxis type="number" stroke={chartTextColor} tickLine={false} axisLine={false} unit="%" fontSize={12} />
                                <YAxis dataKey="code" type="category" stroke={chartTextColor} tickLine={false} axisLine={false} width={70} tick={{fontWeight: 'bold', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4}}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                            <div style={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, padding: '8px 12px', borderRadius: '8px', color: chartTextColor, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                <p className="font-bold text-sm mb-1">{data.name}</p>
                                                <p className="text-xs text-emerald-500 font-semibold">
                                                    +{data[`cagr${period}`]}%
                                                </p>
                                            </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey={`cagr${period}`} 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={24}
                                    onClick={(data) => navigate(`/funds/${data.id}`)}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    {sortedFunds.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getFundColor(entry.code, index)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Risk/Reward Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="h-5 w-5 text-rose-500" />
                            {t('homeV2.riskTitle')}
                        </h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{period}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t('homeV2.riskDesc')}</p>
                    
                    <div className="h-[220px] relative">
                         {/* Quadrant Helper */}
                        <div className="absolute top-0 right-0 text-[9px] font-bold text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded z-10 bg-white/50 dark:bg-black/50">
                             Hiệu quả cao ↗
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                {/* Background Zones */}
                                <ReferenceArea y1={0} fill={isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)"} stroke="none" />
                                <ReferenceArea y2={0} fill={isDark ? "rgba(244, 63, 94, 0.1)" : "rgba(244, 63, 94, 0.05)"} stroke="none" />
                                <ReferenceLine y={0} stroke={isDark ? "#94a3b8" : "#64748b"} strokeDasharray="3 3" />

                                <XAxis type="number" dataKey="x" name="Volatility" unit="%" stroke={chartTextColor} tickLine={false} axisLine={false} tick={{fontSize: 10}} label={{ value: 'Rủi ro (Biến động)', position: 'insideBottom', offset: -5, fill: chartTextColor, fontSize: 10 }} />
                                <YAxis type="number" dataKey="y" name="Return" unit="%" stroke={chartTextColor} tickLine={false} axisLine={false} tick={{fontSize: 10}} label={{ value: 'Lợi nhuận', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 10 }} />
                                <ZAxis type="number" dataKey="z" range={[60, 300]} name="Expense Ratio" unit="%" />
                                <Tooltip 
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                            <div style={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, padding: '8px 12px', borderRadius: '8px', color: chartTextColor, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                <p className="font-bold text-sm text-emerald-600">{data.name}</p>
                                                <div className="flex gap-3 text-xs mt-1">
                                                    <span>Lãi: {data.y}%</span>
                                                    <span>Rủi ro: {data.x}%</span>
                                                </div>
                                            </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Funds" data={riskRewardData} onClick={(node) => {
                                    const fund = MOCK_FUNDS.find(f => f.code === node.name);
                                    if(fund) navigate(`/funds/${fund.id}`);
                                }} className="cursor-pointer">
                                    {riskRewardData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getFundColor(entry.name, index)} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Simulation Chart (Full Width) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BarChart2 className="h-5 w-5 text-emerald-600" />
                                Tăng trưởng tài sản giả định
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                <Info className="h-3 w-3" /> 100tr VND đầu tư vào {parseInt(period.replace('Y',''))} năm trước
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Link to="/simulator" className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                                 Mở Bộ mô phỏng chi tiết →
                             </Link>
                        </div>
                    </div>
                    
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    {sortedFunds.map((fund, index) => (
                                        <linearGradient key={fund.id} id={`color${fund.code}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={getFundColor(fund.code, index)} stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor={getFundColor(fund.code, index)} stopOpacity={0}/>
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                <XAxis 
                                    dataKey="year" 
                                    stroke={chartTextColor} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickMargin={10} 
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke={chartTextColor} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={formatShortVND} 
                                    domain={['dataMin', 'auto']}
                                    fontSize={12}
                                />
                                <Tooltip 
                                    formatter={(value: number) => formatShortVND(value)}
                                    contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, color: chartTextColor }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                
                                {sortedFunds.map((fund, index) => (
                                    <Area 
                                        key={fund.id}
                                        type="monotone" 
                                        dataKey={fund.code} 
                                        stroke={getFundColor(fund.code, index)} 
                                        fill={`url(#color${fund.code})`} 
                                        fillOpacity={1}
                                        strokeWidth={2}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
      </section>

      {/* --- SECTION 2: TOOLS --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                         <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                             <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('common.tools')}</h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                        Các công cụ hỗ trợ tính toán tài chính cá nhân.
                    </p>
                </div>
                 <Link to="/tools" className="hidden sm:inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
                    Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
                 </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredTools.map((tool, idx) => (
                <Link 
                    key={idx} 
                    to={tool.path} 
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all hover:-translate-y-1 group"
                >
                    <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                        {tool.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tool.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {tool.desc}
                    </p>
                </Link>
                ))}
            </div>
      </section>

    </div>
  );
};

export default HomeV2;