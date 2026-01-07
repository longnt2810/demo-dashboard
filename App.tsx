import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { TrendingUp, Menu, X, ShieldAlert, ChevronDown, Calculator, Target, Landmark, Moon, Sun, TrendingDown, Flame, LayoutDashboard, Scale, PieChart, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Pages
import HomeV2 from './pages/HomeV2';
import Funds from './pages/Funds';
import Compare from './pages/Compare';
import FundDetail from './pages/FundDetail';
import Simulator from './pages/Simulator';
import PortfolioBuilder from './pages/PortfolioBuilder';
import Tools from './pages/Tools';
import Insights from './pages/Insights';
import InsightDetail from './pages/InsightDetail';
import CompoundInterestCalculator from './pages/CompoundInterestCalculator';
import FinancialGoalPlanner from './pages/FinancialGoalPlanner';
import LoanRepaymentSchedule from './pages/LoanRepaymentSchedule';
import InflationCalculator from './pages/InflationCalculator';
import FireCalculator from './pages/FireCalculator';

// Theme Context
export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

// User Data Context (Watchlist, Settings, etc.)
export const UserDataContext = createContext({
  watchlist: [] as string[],
  toggleWatchlist: (fundId: string) => {},
  isInWatchlist: (fundId: string) => false as boolean,
});

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useContext(ThemeContext);

  const navItems = [
    { label: t('common.home'), path: '/' },
    { 
      label: t('common.fund_data'), 
      path: '/funds',
      children: [
        { label: t('common.compare'), path: '/compare', icon: Scale },
        { label: t('common.funds'), path: '/funds', icon: PieChart },
      ]
    },
    { 
      label: t('common.simulator'), 
      path: '/simulator',
      children: [
        { label: t('common.simulator'), path: '/simulator', icon: TrendingUp },
        { label: t('common.portfolioBuilder'), path: '/portfolio-builder', icon: Briefcase },
      ]
    },
    { 
      label: t('common.tools'), 
      path: '/tools',
      groups: [
        {
          title: t('tools.groups.investment'),
          items: [
             { label: t('tools.compound.name'), path: '/tools/compound-interest', icon: Calculator },
             { label: t('tools.goal.name'), path: '/tools/financial-goal-planner', icon: Target },
             { label: t('tools.fire.name'), path: '/tools/fire-calculator', icon: Flame },
          ]
        },
        {
          title: t('tools.groups.utilities'),
          items: [
             { label: t('tools.inflation.name'), path: '/tools/inflation-calculator', icon: TrendingDown },
             { label: t('tools.loan.name'), path: '/tools/loan-repayment', icon: Landmark }
          ]
        }
      ]
    },
    { label: t('common.insights'), path: '/insights' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                {t('common.appName')}
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              if (item.groups || (item as any).children) {
                return (
                  <div key={item.path} className="relative group px-4 py-2">
                    <div className="flex items-center gap-1 cursor-pointer">
                        <Link 
                            to={item.path}
                            className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                                isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            {item.label}
                        </Link>
                        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-hover:rotate-180" />
                    </div>
                    
                    <div className="absolute top-full left-0 w-full h-2"></div>

                    <div className={`absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50 ${item.groups ? 'w-80' : 'w-56'}`}>
                      {item.groups ? (
                        item.groups.map((group, gIdx) => (
                           <div key={gIdx}>
                             {gIdx > 0 && <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-3" />}
                             <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                               {group.title}
                             </div>
                             {group.items.map((subItem) => (
                               <Link
                                  key={subItem.path}
                                  to={subItem.path}
                                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/item"
                                >
                                  <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-md group-hover/item:bg-emerald-100 dark:group-hover/item:bg-emerald-900/50 transition-colors">
                                    <subItem.icon className="h-4 w-4" />
                                  </div>
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover/item:text-slate-900 dark:group-hover/item:text-white">
                                    {subItem.label}
                                  </span>
                                </Link>
                             ))}
                           </div>
                        ))
                      ) : (
                        (item as any).children.map((subItem: any) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/item"
                          >
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg group-hover/item:bg-emerald-100 dark:group-hover/item:bg-emerald-900/50 transition-colors">
                              <subItem.icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover/item:text-slate-900 dark:group-hover/item:text-white">
                              {subItem.label}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                    isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 p-2"
            >
              {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 absolute w-full shadow-lg max-h-[90vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <React.Fragment key={item.path}>
                <div
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                    {item.groups || (item as any).children ? (
                        <span>{item.label}</span>
                    ) : (
                        <Link to={item.path} onClick={() => setIsOpen(false)} className="block w-full h-full">
                            {item.label}
                        </Link>
                    )}
                </div>
                {item.groups ? (
                    <div className="pl-4 space-y-1 ml-3 mb-2">
                        {item.groups.map((group, idx) => (
                        <div key={idx} className="pt-2 first:pt-0">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 border-l-2 border-transparent">
                            {group.title}
                            </div>
                            <div className="border-l-2 border-slate-100 dark:border-slate-800 ml-0 pl-3 space-y-1">
                            {group.items.map((subItem) => (
                                <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    <subItem.icon className="h-4 w-4" />
                                    {subItem.label}
                                </Link>
                            ))}
                            </div>
                        </div>
                        ))}
                    </div>
                ) : (item as any).children ? (
                  <div className="pl-6 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-3 mb-2">
                    {(item as any).children.map((subItem: any) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                         <subItem.icon className="h-4 w-4" />
                         {subItem.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                {t('common.appName')}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
              {t('common.footerDesc')}
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('common.resources')}</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/funds" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('common.funds')}</Link></li>
              <li><Link to="/simulator" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('common.simulator')}</Link></li>
              <li><Link to="/portfolio-builder" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('common.portfolioBuilder')}</Link></li>
              <li><Link to="/tools" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('common.tools')}</Link></li>
              <li><Link to="/insights" className="hover:text-emerald-600 dark:hover:text-emerald-400">{t('common.insights')}</Link></li>
            </ul>
          </div>

          <div>
             <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <ShieldAlert className="h-4 w-4 text-amber-500" />
               {t('common.legal')}
             </h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
               {t('common.legalDesc')}
             </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {t('common.appName')}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('watchlist');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const toggleWatchlist = (fundId: string) => {
    setWatchlist(prev => {
      const next = prev.includes(fundId) 
        ? prev.filter(id => id !== fundId)
        : [...prev, fundId];
      localStorage.setItem('watchlist', JSON.stringify(next));
      return next;
    });
  };

  const isInWatchlist = (fundId: string) => watchlist.includes(fundId);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <UserDataContext.Provider value={{ watchlist, toggleWatchlist, isInWatchlist }}>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300 font-sans text-slate-900 dark:text-slate-100">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomeV2 />} />
                <Route path="/funds" element={<Funds />} />
                <Route path="/funds/:id" element={<FundDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/simulator" element={<Simulator />} />
                <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/compound-interest" element={<CompoundInterestCalculator />} />
                <Route path="/tools/financial-goal-planner" element={<FinancialGoalPlanner />} />
                <Route path="/tools/loan-repayment" element={<LoanRepaymentSchedule />} />
                <Route path="/tools/inflation-calculator" element={<InflationCalculator />} />
                <Route path="/tools/fire-calculator" element={<FireCalculator />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/insights/:id" element={<InsightDetail />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </UserDataContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;