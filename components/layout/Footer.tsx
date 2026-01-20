import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShieldAlert, ExternalLink, Heart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Legal Text using Alert Component */}
        <div className="mb-12">
           <Alert variant="warning" className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10">
             <ShieldAlert className="h-4 w-4" />
             <AlertTitle>Miễn trừ trách nhiệm</AlertTitle>
             <AlertDescription>
               {t('footer.legalDesc')} 
               <Link to="/insights" className="ml-1 font-semibold underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-100 transition-colors">
                 Tìm hiểu thêm
               </Link>
             </AlertDescription>
           </Alert>
        </div>

        {/* 2. Main Layout - 3 Equal Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          
          {/* Col 1: Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-sm group-hover:bg-emerald-700 transition-colors">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                {t('meta.title')}
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Phổ cập dữ liệu tài chính minh bạch cho nhà đầu tư Việt Nam. Xây dựng thói quen tích lũy kỷ luật và đầu tư thụ động dài hạn.
            </p>
          </div>
          
          {/* Col 2: Popular Actions */}
          <div className="md:pl-8">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Phổ biến nhất</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/simulator" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                   Backtest chiến lược (5 năm)
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                   So sánh Top 5 quỹ ETF
                </Link>
              </li>
              <li>
                <Link to="/tools/fire-calculator" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                   Tính thời gian nghỉ hưu (FIRE)
                </Link>
              </li>
              <li>
                <Link to="/portfolio-builder" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                   Xây dựng danh mục mẫu
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Support */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-sm uppercase tracking-wider">Tài nguyên & Hỗ trợ</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/insights" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                   Bài viết phân tích
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                   Dữ liệu thị trường <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                   Thuật ngữ tài chính
                </a>
              </li>
              <li>
                <Link to="/page-not-found-demo" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                   Demo Trang 404 (Test)
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
                   Ủng hộ dự án <Heart className="h-3 w-3 text-rose-400" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Bottom Section: Copyright + Made By + Contact */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col items-center gap-6">
          <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
            <span>© {new Date().getFullYear()} {t('meta.title')}</span>
            <span className="mx-3 text-slate-300 dark:text-slate-700">|</span>
            <span>
               Contact: <a href="mailto:mail@bangtintaichinh.vn" className="text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">mail@bangtintaichinh.vn</a>
            </span>
          </div>
          
          <a href="#" className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 hover:from-emerald-50 hover:to-white dark:hover:from-emerald-900/20 dark:hover:to-slate-900 transition-all group shadow-sm hover:shadow-md">
                <img src="https://i.ibb.co/tpVCxBKj/bb-logo.png" alt="B&B" className="h-8 w-auto drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                <div>
                    <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5 tracking-wide">MADE BY</span>
                    <span className="font-bold text-base text-slate-800 dark:text-white tracking-tight">B&B Studio</span>
                </div>
          </a>
        </div>

      </div>
    </footer>
  );
};