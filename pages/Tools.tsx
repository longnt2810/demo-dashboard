import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Target, Landmark, ArrowRight, TrendingDown, Flame, Mail, Copy, Check, Briefcase, Zap } from 'lucide-react';
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

  // Define groups
  const investmentIds = ['compound', 'goal', 'fire'];
  const utilityIds = ['inflation', 'loan'];

  const investmentTools = MOCK_TOOLS.filter(t => investmentIds.includes(t.id));
  const utilityTools = MOCK_TOOLS.filter(t => utilityIds.includes(t.id));

  const renderToolCard = (tool: any) => {
    const content = getToolContent(tool.id);
    // Determine icon and specific path logic if needed (currently path is generic in MOCK_TOOLS except hardcoded links)
    // We override the MOCK_TOOLS path with specific routes
    let specificPath = tool.path;
    if(tool.id === 'compound') specificPath = '/tools/compound-interest';
    if(tool.id === 'inflation') specificPath = '/tools/inflation-calculator';
    if(tool.id === 'fire') specificPath = '/tools/fire-calculator';
    if(tool.id === 'goal') specificPath = '/tools/financial-goal-planner';
    if(tool.id === 'loan') specificPath = '/tools/loan-repayment';

    return (
      <div key={tool.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col hover:shadow-md transition-all group h-full">
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
        <Link to={specificPath} className="flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mt-auto">
          {t('common.actions.launch')} <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header - Left Aligned */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('pages.tools.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-3xl">
          {t('pages.tools.subtitle')}
        </p>
      </div>

      <div className="space-y-16">
        
        {/* Section 1: Investment & Accumulation */}
        <section>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('navigation.groups.investment')}
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {investmentTools.map(tool => renderToolCard(tool))}
            </div>
        </section>

        {/* Section 2: Financial Utilities */}
        <section>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('navigation.groups.utilities')}
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {utilityTools.map(tool => renderToolCard(tool))}
            </div>
        </section>

      </div>

      {/* Footer / Request Tool */}
      <div className="mt-20 bg-slate-100 dark:bg-slate-800 rounded-xl p-8 transition-colors max-w-3xl mx-auto text-center border border-slate-200 dark:border-slate-700">
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