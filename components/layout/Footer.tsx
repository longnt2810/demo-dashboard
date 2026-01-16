import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShieldAlert, Calculator, Target, Flame, Landmark, TrendingDown, Scale, PieChart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. Legal Text */}
        <div className="mb-12 pb-8 border-b border-slate-200/50 dark:border-slate-800/50">
           <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center leading-relaxed max-w-4xl mx-auto">
             <ShieldAlert className="h-4 w-4 inline mr-1.5 -mt-0.5 text-amber-500" />
             <strong>Miễn trừ trách nhiệm:</strong> {t('footer.legalDesc')} 
             <Link to="/insights" className="ml-1 text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
               Tìm hiểu thêm
             </Link>
           </p>
        </div>

        {/* 2. Main Layout - Split 50/50 on LG screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          
          {/* LEFT COLUMN (50%): Brand Only (Removed Made By from here) */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-emerald-600 p-2 rounded-xl shadow-sm group-hover:bg-emerald-700 transition-colors">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                {t('meta.title')}
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
          </div>
          
          {/* RIGHT COLUMN (50%): Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* Links Column: Explore */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Tìm hiểu thêm</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link to="/funds" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                     <PieChart className="h-4 w-4" /> Danh sách Quỹ
                  </Link>
                </li>
                <li>
                  <Link to="/compare" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                     <Scale className="h-4 w-4" /> So sánh hiệu suất
                  </Link>
                </li>
                <li>
                  <Link to="/simulator" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                     <TrendingUp className="h-4 w-4" /> Mô phỏng đầu tư
                  </Link>
                </li>
                <li>
                  <Link to="/insights" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                     Kiến thức & Phân tích
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column: Tools */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Công cụ tính toán</h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link to="/tools/compound-interest" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> Tính lãi kép
                  </Link>
                </li>
                <li>
                  <Link to="/tools/financial-goal-planner" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <Target className="h-4 w-4" /> Lập kế hoạch mục tiêu
                  </Link>
                </li>
                <li>
                  <Link to="/tools/fire-calculator" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <Flame className="h-4 w-4" /> Tính toán FIRE
                  </Link>
                </li>
                <li>
                  <Link to="/tools/loan-repayment" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <Landmark className="h-4 w-4" /> Lịch trả nợ vay
                  </Link>
                </li>
                <li>
                  <Link to="/tools/inflation-calculator" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" /> Tính lạm phát
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* 3. Bottom Section: Copyright + Made By */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} {t('meta.title')}. All rights reserved.
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