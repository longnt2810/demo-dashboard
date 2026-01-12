import React, { useState, useMemo, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Search, Scale, ChevronRight, ArrowRight } from 'lucide-react';
import { MOCK_FUNDS } from '../constants';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

// --- Types ---
type FundCategory = 'All' | 'Equity' | 'Bond' | 'Balanced' | 'ETF';

const Funds: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);
  
  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FundCategory>('All');

  // --- Filtered Funds List ---
  const filteredTableFunds = useMemo(() => {
    return MOCK_FUNDS.filter(fund => {
      const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fund.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fund.company.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesType = true;
      if (categoryFilter !== 'All') {
          if (categoryFilter === 'ETF') matchesType = fund.type === 'ETF';
          else if (categoryFilter === 'Equity') matchesType = fund.type === 'Equity' || fund.type === 'ETF'; // ETFs are usually equity
          else matchesType = fund.type === categoryFilter;
      }
      return matchesSearch && matchesType;
    });
  }, [searchTerm, categoryFilter]);

  const getCategoryLabel = (cat: FundCategory) => {
    switch (cat) {
        case 'All': return t('fundsPage.filterAll');
        case 'Equity': return 'Cổ phiếu (Equity)';
        case 'Bond': return 'Trái phiếu (Bond)';
        case 'Balanced': return 'Cân bằng (Balanced)';
        case 'ETF': return 'ETF';
        default: return cat;
    }
  }

  const getRiskColor = (level: string) => {
    switch(level) {
        case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
        case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200';
        case 'Very High': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
        default: return 'bg-slate-100 text-slate-800';
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('fundsPage.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">{t('fundsPage.subtitle')}</p>
        </div>
        <Link 
            to="/compare" 
            className="group inline-flex items-center justify-center px-6 py-2.5 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-full hover:border-emerald-500 hover:shadow-md transition-all duration-200 font-bold hover:-translate-y-0.5"
        >
            <Scale className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
            Công cụ so sánh
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center transition-colors">
        <div className="relative w-full xl:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
            placeholder={t('fundsPage.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 text-slate-500">
             <Filter className="h-5 w-5" />
             <span className="text-sm font-medium">Lọc theo loại:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(['All', 'Equity', 'Bond', 'Balanced', 'ETF'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fund List Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.info')}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.type')} / Rủi ro</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.nav')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.return1Y')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.cagr3Y')}</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('fundsPage.table.expense')}</th>
                <th className="px-6 py-4 relative"><span className="sr-only">{t('fundsPage.table.action')}</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTableFunds.map((fund) => {
                return (
                  <tr
                    key={fund.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/funds/${fund.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                                {fund.code}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{fund.name}</span>
                            <span className="text-xs text-slate-400 mt-1">{fund.company}</span>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                            fund.type === 'ETF' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' :
                            fund.type === 'Equity' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300' :
                            fund.type === 'Bond' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300' :
                            'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300'
                        }`}>
                            {fund.type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${getRiskColor(fund.riskLevel)}`}>
                            Rủi ro: {fund.riskLevel === 'Low' ? 'Thấp' : fund.riskLevel === 'Medium' ? 'Trung bình' : fund.riskLevel === 'High' ? 'Cao' : 'Rất cao'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 dark:text-slate-200 font-mono">
                      {fund.nav.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className={fund.cagr1Y >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                        {fund.cagr1Y > 0 ? '+' : ''}{fund.cagr1Y}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600 dark:text-slate-300">
                      {fund.cagr3Y}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-500 dark:text-slate-400">
                      {fund.expenseRatio}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                            <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-full text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTableFunds.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    {t('fundsPage.noFunds')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Funds;