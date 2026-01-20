import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
      <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-full mb-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <FileQuestion className="h-20 w-20 text-slate-300 dark:text-slate-600" />
      </div>
      
      {/* Big 404 Watermark Effect */}
      <h1 className="text-8xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter opacity-10 dark:opacity-20 select-none">
        404
      </h1>
      
      <div className="relative -mt-16 mb-6">
         <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Không tìm thấy trang
         </h2>
      </div>

      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 text-lg leading-relaxed">
        Có vẻ như trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn không chính xác.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 dark:border-slate-700 text-base font-bold rounded-full text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:shadow-sm min-w-[160px]"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </button>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-full text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 min-w-[160px]"
        >
          <Home className="h-5 w-5 mr-2" />
          Trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;