import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Target, Landmark, ArrowRight, TrendingDown, Flame } from 'lucide-react';
import { MOCK_TOOLS } from '../constants';
import { useTranslation } from 'react-i18next';

const Tools: React.FC = () => {
  const { t } = useTranslation();

  const getToolContent = (id: string) => {
    switch(id) {
        case 'compound': return { name: t('tools.compound.name'), desc: t('tools.compound.desc') };
        case 'inflation': return { name: t('tools.inflation.name'), desc: t('tools.inflation.desc') };
        case 'fire': return { name: t('tools.fire.name'), desc: t('tools.fire.desc') };
        case 'goal': return { name: t('tools.goal.name'), desc: t('tools.goal.desc') };
        case 'loan': return { name: t('tools.loan.name'), desc: t('tools.loan.desc') };
        default: return { name: '', desc: '' };
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('tools.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {t('tools.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_TOOLS.map((tool) => {
            const content = getToolContent(tool.id);
            return (
          <div key={tool.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col hover:shadow-md transition-all group">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              {tool.id === 'compound' && <Calculator className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
              {tool.id === 'inflation' && <TrendingDown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
              {tool.id === 'fire' && <Flame className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
              {tool.id === 'goal' && <Target className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
              {tool.id === 'loan' && <Landmark className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {content.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 flex-grow">
              {content.desc}
            </p>
            {tool.id === 'compound' && (
              <Link to="/tools/compound-interest" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                {t('tools.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'inflation' && (
              <Link to="/tools/inflation-calculator" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                {t('tools.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'fire' && (
              <Link to="/tools/fire-calculator" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                {t('tools.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'goal' && (
              <Link to="/tools/financial-goal-planner" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                 {t('tools.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'loan' && (
              <Link to="/tools/loan-repayment" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                 {t('tools.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        )})}
      </div>

      <div className="mt-16 bg-slate-100 dark:bg-slate-800 rounded-xl p-8 text-center transition-colors">
        <p className="text-slate-600 dark:text-slate-300 mb-4">Các công cụ khác đang được phát triển dựa trên phản hồi cộng đồng.</p>
        <button className="text-sm font-medium text-slate-900 dark:text-white underline hover:text-emerald-600 dark:hover:text-emerald-400">
          Gửi yêu cầu
        </button>
      </div>
    </div>
  );
};

export default Tools;