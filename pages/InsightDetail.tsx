import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { MOCK_ARTICLES } from '../constants';
import { useTranslation } from 'react-i18next';

const InsightDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const article = MOCK_ARTICLES.find(a => a.id === id);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pages.insightDetail.notFound')}</h2>
        <Link to="/insights" className="text-emerald-600 hover:underline mt-4 inline-block">
          {t('pages.insightDetail.return')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/insights" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('pages.insightDetail.back')}
      </Link>

      <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <span className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {article.date}
            </span>
            <span className="flex items-center bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {article.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none text-slate-700 dark:text-slate-300">
             {/* Using dangerouslySetInnerHTML because the mock content contains HTML tags for formatting */}
             <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default InsightDetail;