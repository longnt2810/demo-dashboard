import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, ChevronLeft, ChevronRight, Landmark, Calendar as CalendarIcon, Wallet, Download, Image as ImageIcon, FileSpreadsheet, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';

type CalculationMethod = 'Reducing' | 'Flat'; // Dư nợ giảm dần vs Trên dư nợ gốc

interface AmortizationRow {
  month: number;
  date: string;
  beginningBalance: number;
  principalPaid: number;
  interestPaid: number;
  accPrincipal: number; // Accumulated Principal
  accInterest: number;  // Accumulated Interest
  totalPayment: number;
  endingBalance: number;
}

const LoanRepaymentSchedule: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);

  // Inputs
  const [loanAmount, setLoanAmount] = useState<number>(1000000000); // 1 Billion VND
  const [interestRate, setInterestRate] = useState<number>(10.5); // 10.5%
  const [durationYears, setDurationYears] = useState<number>(5);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<CalculationMethod>('Reducing');

  // Results
  const [data, setData] = useState<AmortizationRow[]>([]);
  const [summary, setSummary] = useState({
    totalPrincipal: 0,
    totalInterest: 0,
    totalPayment: 0,
    monthlyPayment: 0 // For flat, or first month for reducing
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 1 year per page

  // Refs
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    calculate();
    setCurrentPage(1);
  }, [loanAmount, interestRate, durationYears, startDate, method]);

  const calculate = () => {
    const rows: AmortizationRow[] = [];
    const totalMonths = durationYears * 12;
    const monthlyRate = (interestRate / 100) / 12;
    
    let currentBalance = loanAmount;
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    
    // Start Date Object
    const startObj = new Date(startDate);

    if (method === 'Reducing') {
        // EMI Calculation: P * r * (1+r)^n / ((1+r)^n - 1)
        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        for (let i = 1; i <= totalMonths; i++) {
            const interest = currentBalance * monthlyRate;
            const principal = emi - interest;
            const endingBalance = Math.max(0, currentBalance - principal);
            
            // Adjust last month
            let finalPrincipal = principal;
            let finalPayment = emi;
            let finalEndingBalance = endingBalance;

            if (i === totalMonths && endingBalance > 0) {
               // Due to rounding, ensure balance is 0
               finalPrincipal = currentBalance;
               finalPayment = finalPrincipal + interest;
               finalEndingBalance = 0;
            } else if (i === totalMonths && endingBalance < 0) {
                finalPrincipal = currentBalance;
                finalPayment = finalPrincipal + interest;
                finalEndingBalance = 0;
            }

            totalPrincipalPaid += finalPrincipal;
            totalInterestPaid += interest;

            const date = new Date(startObj);
            date.setMonth(startObj.getMonth() + i);

            rows.push({
                month: i,
                date: date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
                beginningBalance: Math.round(currentBalance),
                principalPaid: Math.round(finalPrincipal),
                interestPaid: Math.round(interest),
                accPrincipal: Math.round(totalPrincipalPaid),
                accInterest: Math.round(totalInterestPaid),
                totalPayment: Math.round(finalPayment),
                endingBalance: Math.round(finalEndingBalance)
            });

            currentBalance = finalEndingBalance;
        }
        
        setSummary({
            totalPrincipal: loanAmount,
            totalInterest: totalInterestPaid,
            totalPayment: loanAmount + totalInterestPaid,
            monthlyPayment: emi
        });

    } else {
        // Flat Rate
        // Total Interest = P * r * t (where t is years)
        // Monthly Payment = (P + Total Interest) / months
        const totalInterest = loanAmount * (interestRate / 100) * durationYears;
        const monthlyPayment = (loanAmount + totalInterest) / totalMonths;
        const monthlyPrincipal = loanAmount / totalMonths;
        const monthlyInterest = totalInterest / totalMonths;

        for (let i = 1; i <= totalMonths; i++) {
            totalPrincipalPaid += monthlyPrincipal;
            totalInterestPaid += monthlyInterest;
            const endingBalance = Math.max(0, loanAmount - totalPrincipalPaid);

            const date = new Date(startObj);
            date.setMonth(startObj.getMonth() + i);

            rows.push({
                month: i,
                date: date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }),
                beginningBalance: Math.round(loanAmount - (monthlyPrincipal * (i-1))),
                principalPaid: Math.round(monthlyPrincipal),
                interestPaid: Math.round(monthlyInterest),
                accPrincipal: Math.round(totalPrincipalPaid),
                accInterest: Math.round(totalInterestPaid),
                totalPayment: Math.round(monthlyPayment),
                endingBalance: Math.round(endingBalance)
            });
        }

        setSummary({
            totalPrincipal: loanAmount,
            totalInterest: totalInterest,
            totalPayment: loanAmount + totalInterest,
            monthlyPayment: monthlyPayment
        });
    }

    setData(rows);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
  };

  const formatShortVND = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} tr`;
    return num.toLocaleString();
  };

  const handleCurrencyChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    setter(Number(rawValue));
  };

  const formatInputValue = (val: number) => {
    return val.toLocaleString('vi-VN');
  };

  const handleExportImage = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "loan_schedule_chart.png";
        link.click();
      } catch (err) {
        console.error("Failed to export image", err);
      }
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const inputInfo = [
      ["Loan Repayment Schedule"],
      ["Date Generated", new Date().toLocaleDateString('vi-VN')],
      [],
      ["--- Parameters ---"],
      ["Loan Amount", loanAmount],
      ["Annual Interest Rate (%)", interestRate],
      ["Duration (Years)", durationYears],
      ["Start Date", startDate],
      ["Calculation Method", method === 'Reducing' ? 'Reducing Balance' : 'Flat Rate'],
      [],
      ["--- Summary ---"],
      ["Total Payment", summary.totalPayment],
      ["Total Interest", summary.totalInterest],
      ["Est. Monthly Payment", summary.monthlyPayment],
      [],
      ["--- Schedule ---"],
      ["Month", "Date", "Beginning Balance", "Principal", "Interest", "Total Payment", "Ending Balance"]
    ];

    const tableData = data.map(row => [
      row.month,
      row.date,
      row.beginningBalance,
      row.principalPaid,
      row.interestPaid,
      row.totalPayment,
      row.endingBalance
    ]);

    const wsData = [...inputInfo, ...tableData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, "loan_repayment_schedule.xlsx");
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#94a3b8';
  const chartTooltipBg = isDark ? '#1e293b' : '#fff';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/tools" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('navigation.tools')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('pages.tools.loan.name')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('pages.tools.loan.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-emerald-600" />
              {t('pages.tools.compound.params')}
            </h2>

            {/* Loan Amount */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.loan.amount')}
              </label>
              <div className="relative">
                 <input
                  type="text"
                  value={formatInputValue(loanAmount)}
                  onChange={handleCurrencyChange(setLoanAmount)}
                  className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                </div>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.loan.rate')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="block w-full pl-4 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.loan.term')}: {durationYears} {t('common.year')}
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>1 {t('common.year')}</span>
                <span>30 {t('common.year')}</span>
              </div>
            </div>

            {/* Start Date */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('pages.tools.loan.start')}
                </label>
                <div className="relative">
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium shadow-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Method */}
            <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('pages.tools.loan.method')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setMethod('Reducing')}
                        className={`py-3 px-3 text-sm rounded-xl border transition-all ${method === 'Reducing' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'}`}
                    >
                        {t('pages.tools.loan.reducing')}
                    </button>
                    <button 
                        onClick={() => setMethod('Flat')}
                        className={`py-3 px-3 text-sm rounded-xl border transition-all ${method === 'Flat' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'}`}
                    >
                        {t('pages.tools.loan.flat')}
                    </button>
                </div>
            </div>

            <button 
              onClick={() => {
                setLoanAmount(1000000000);
                setInterestRate(10.5);
                setDurationYears(5);
                setStartDate(new Date().toISOString().slice(0, 10));
                setMethod('Reducing');
              }}
              className="w-full flex items-center justify-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 rounded-full transition-all"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> {t('pages.tools.compound.reset')}
            </button>
          </div>
        </div>

        {/* Right Column: Summary & Chart */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* UPDATED: Modern FinTech Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             
             {/* Card 1: HERO - Monthly Payment (Blue Gradient) */}
             <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg md:col-span-1 lg:col-span-1 xl:col-span-1">
                {/* Decorative Circles */}
                <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full border-[16px] border-white/10"></div>
                <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border-[16px] border-white/5"></div>
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">{t('pages.tools.loan.estMonthly')}</p>
                      <h3 className="text-3xl font-extrabold tracking-tight">
                        {formatVND(summary.monthlyPayment)}
                      </h3>
                   </div>
                   <div className="mt-4 flex items-center gap-2 text-blue-50 text-xs">
                      <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                      <span>{method === 'Reducing' ? 'Tháng đầu tiên (giảm dần)' : 'Cố định hàng tháng'}</span>
                   </div>
                </div>
             </div>

             {/* Card 2: Total Interest (Clean Style) */}
             <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                   <div className="bg-rose-50 dark:bg-rose-900/30 p-2.5 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                   </div>
               </div>
               <div>
                   <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('pages.tools.loan.totalInt')}</p>
                   <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatShortVND(summary.totalInterest)}</h3>
                   <div className="text-xs text-slate-400 mt-1">Chi phí lãi vay phải trả</div>
               </div>
             </div>

             {/* Card 3: Total Payment (Clean Style) */}
             <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                   <div className="bg-slate-50 dark:bg-slate-700 p-2.5 rounded-xl">
                      <DollarSign className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                   </div>
               </div>
               <div>
                   <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('pages.tools.loan.totalPay')}</p>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatShortVND(summary.totalPayment)}</h3>
                   <div className="text-xs text-slate-400 mt-1">Tổng tiền gốc + lãi</div>
               </div>
             </div>
          </div>

          {/* Area Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full max-h-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                {t('pages.tools.compound.chart')}
              </h3>
              <button 
                onClick={handleExportImage}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-bold"
              >
                <ImageIcon className="h-4 w-4" /> {t('pages.tools.compound.saveGraph')}
              </button>
            </div>
            <div className="h-[350px]" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                  <XAxis dataKey="month" stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `Tháng ${val}`} minTickGap={30} />
                  <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={formatShortVND} />
                  <Tooltip 
                    formatter={(value: number) => formatVND(value)}
                    contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, color: chartTextColor }}
                    itemStyle={{ color: chartTextColor }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="endingBalance" name={t('pages.tools.loan.chartRemaining')} stackId="1" stroke="#059669" fill="url(#colorBalance)" />
                  <Area type="monotone" dataKey="accInterest" name={t('pages.tools.loan.chartTotalInterest')} stackId="2" stroke="#e11d48" fill="url(#colorInterest)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Paginated Table - Full Width */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">{t('pages.tools.loan.schedule')}</h3>
            <button 
              onClick={handleExportExcel}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-bold"
            >
              <FileSpreadsheet className="h-4 w-4" /> {t('pages.tools.compound.exportExcel')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-white dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common.month')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common.date')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.tools.loan.colBalance')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.tools.loan.colPrincipal')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.tools.loan.colInterest')}</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.tools.loan.colTotal')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {paginatedData.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{row.month}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{row.date}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">{formatVND(row.beginningBalance)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-emerald-600 dark:text-emerald-400 font-medium">{formatVND(row.principalPaid)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-rose-600 dark:text-rose-400 font-medium">{formatVND(row.interestPaid)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-slate-900 dark:text-white font-bold">{formatVND(row.totalPayment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default LoanRepaymentSchedule;