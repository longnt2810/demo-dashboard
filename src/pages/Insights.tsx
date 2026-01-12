import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { MOCK_ARTICLES } from '../constants';
import { useTranslation } from 'react-i18next';

const Insights: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('insights.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('insights.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ARTICLES.map((article) => (
          <article 
            key={article.id} 
            onClick={() => navigate(`/insights/${article.id}`)}
            className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="h-48 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
               {/* Placeholder for article image */}
               <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-50 dark:group-hover:bg-slate-600 transition-colors">
                 <BookOpen className="h-10 w-10 opacity-20" />
               </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3 space-x-2">
                <span>{article.date}</span>
                <span>•</span>
                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {article.readTime}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 flex-grow">
                {article.summary}
              </p>
              <button className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center group-hover:text-emerald-700 dark:group-hover:text-emerald-300 mt-auto self-start">
                {t('insights.read')} <ChevronRight className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Insights;