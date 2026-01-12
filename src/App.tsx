import React, { createContext, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Layout - Import components from the new files
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

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

// Theme Context Definition
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

// User Data Context (Watchlist, Settings, etc.)
export const UserDataContext = createContext({
  watchlist: [] as string[],
  toggleWatchlist: (fundId: string) => {},
  isInWatchlist: (fundId: string) => false as boolean,
});

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