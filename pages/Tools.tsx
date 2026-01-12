import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Target, Landmark, ArrowRight, TrendingDown, Flame, Mail, Copy, Check } from 'lucide-react';
import { MOCK_TOOLS } from '../constants';
import { useTranslation } from 'react-i18next';

const Tools: React.FC = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const email = "test@gmail.com";

  const getToolContent = (id: string) => {
    switch(id) {
        case 'compound': return { name: t('pages.tools.compound.name'), desc: t('pages.tools.compound.desc') };
        case 'inflation': return { name: t('pages.tools.inflation.name'), desc: t('pages.tools.inflation.desc') };
        case 'fire': return { name: t('pages.tools.fire.name'), desc: t('pages.tools.fire.desc') };
        case 'goal': return { name: t('pages.tools.goal.name'), desc: t('pages.tools.goal.desc') };
        case 'loan': return { name: t('pages.tools.loan.name'), desc: t('pages.tools.loan.desc') };
        default: return { name: '', desc: '' };
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('pages.tools.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {t('pages.tools.subtitle')}
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
                {t('common.actions.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'inflation' && (
              <Link to="/tools/inflation-calculator" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                {t('common.actions.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'fire' && (
              <Link to="/tools/fire-calculator" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                {t('common.actions.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'goal' && (
              <Link to="/tools/financial-goal-planner" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                 {t('common.actions.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
            {tool.id === 'loan' && (
              <Link to="/tools/loan-repayment" className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                 {t('common.actions.launch')} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        )})}
      </div>

      <div className="mt-16 bg-slate-100 dark:bg-slate-800 rounded-xl p-8 transition-colors max-w-3xl mx-auto text-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Yêu cầu công cụ mới</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
          Bạn có ý tưởng về công cụ tài chính hữu ích? Hãy gửi yêu cầu cho chúng tôi.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="relative group w-full sm:w-auto">
                <div className="flex items-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-700 dark:text-slate-200 font-mono text-sm shadow-sm">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {email}
                </div>
            </div>

            <button 
                onClick={handleCopy}
                className="flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto"
            >
                {copied ? <Check className="h-4 w-4 mr-2 text-emerald-600" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Đã chép' : 'Sao chép'}
            </button>

            <a 
                href={`mailto:${email}?subject=[Bảng tin tài chính] Yêu cầu công cụ mới`}
                className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium text-sm w-full sm:w-auto"
            >
                <Mail className="h-4 w-4 mr-2" />
                Gửi mail
            </a>
        </div>
      </div>
    </div>
  );
};

export default Tools;