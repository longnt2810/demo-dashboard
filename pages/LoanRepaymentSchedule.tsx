import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, ChevronLeft, ChevronRight, Landmark, Calendar as CalendarIcon, Wallet, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
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
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 1 year per page usually

  // Refs
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    calculateLoan();
    setCurrentPage(1);
  }, [loanAmount, interestRate, durationYears, startDate, method]);

  const calculateLoan = () => {
    const rows: AmortizationRow[] = [];
    const months = durationYears * 12;
    const monthlyRate = (interestRate / 100) / 12;
    
    let balance = loanAmount;
    let accumulatedInterest = 0;
    let accumulatedPayment = 0;
    
    // Tracking cumulative variables for chart
    let runningAccPrincipal = 0;
    let runningAccInterest = 0;

    let disbursementDate = new Date(startDate);

    // Calculate fixed Monthly Payment for Reducing Balance (Annuity Formula)
    let fixedMonthlyPayment = 0;
    if (method === 'Reducing') {
       if (monthlyRate === 0) {
         fixedMonthlyPayment = loanAmount / months;
       } else {
         fixedMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
       }
    } else {
       const monthlyPrincipal = loanAmount / months;
       const fixedInterest = loanAmount * monthlyRate;
       fixedMonthlyPayment = monthlyPrincipal + fixedInterest;
    }

    // Add initial state (Month 0) for cleaner chart
    rows.push({
      month: 0,
      date: disbursementDate.toLocaleDateString('vi-VN'),
      beginningBalance: loanAmount,
      principalPaid: 0,
      interestPaid: 0,
      accPrincipal: 0,
      accInterest: 0,
      totalPayment: 0,
      endingBalance: loanAmount
    });

    for (let i = 1; i <= months; i++) {
      let interest = 0;
      let principal = 0;
      let payment = 0;

      // Handle Dates
      const currentDate = new Date(disbursementDate);
      currentDate.setMonth(disbursementDate.getMonth() + i);
      const dateString = currentDate.toLocaleDateString('vi-VN');

      if (method === 'Reducing') {
        interest = balance * monthlyRate;
        payment = fixedMonthlyPayment;
        if (i === months) {
           payment = balance + interest;
        }
        principal = payment - interest;
      } else {
        interest = loanAmount * monthlyRate;
        principal = loanAmount / months;
        payment = principal + interest;
      }

      if (balance - principal < 0) principal = balance;
      
      const beginningBalance = balance;
      balance -= principal;
      if (balance < 0) balance = 0;

      accumulatedInterest += interest;
      accumulatedPayment += payment;
      
      // Update running totals
      runningAccPrincipal += principal;
      runningAccInterest += interest;

      rows.push({
        month: i,
        date: dateString,
        beginningBalance: Math.round(beginningBalance),
        principalPaid: Math.round(principal),
        interestPaid: Math.round(interest),
        accPrincipal: Math.round(runningAccPrincipal),
        accInterest: Math.round(runningAccInterest),
        totalPayment: Math.round(payment),
        endingBalance: Math.round(balance)
      });
    }

    setSchedule(rows);
    setTotalInterest(accumulatedInterest);
    setTotalPayment(accumulatedPayment);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
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
        link.download = "loan_repayment_chart.png";
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
      ["Interest Rate (%/Year)", interestRate],
      ["Term (Years)", durationYears],
      ["Start Date", startDate],
      ["Method", method === 'Reducing' ? 'Reducing Balance (Dư nợ giảm dần)' : 'Flat Rate (Trên dư nợ gốc)'],
      [],
      ["--- Summary ---"],
      ["Total Payment", totalPayment],
      ["Total Interest", totalInterest],
      [],
      ["--- Schedule ---"],
      ["Month", "Date", "Beginning Balance", "Principal", "Interest", "Total Payment", "Ending Balance"]
    ];

    const tableData = schedule.slice(1).map(row => [ // Skip month 0 for excel
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
    XLSX.utils.book_append_sheet(wb, ws, "Loan Schedule");
    XLSX.writeFile(wb, "loan_schedule.xlsx");
  };

  const totalPages = Math.ceil((schedule.length - 1) / itemsPerPage); // Subtract 1 for month 0
  const paginatedData = schedule.slice(1).slice( // Skip month 0 for table display
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
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('common.tools')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('tools.loan.name')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('tools.loan.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-emerald-600" />
              {t('tools.compound.params')}
            </h2>

            {/* Loan Amount */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tools.loan.amount')}
              </label>
              <div className="relative rounded-md shadow-sm">
                 <input
                  type="text"
                  value={formatInputValue(loanAmount)}
                  onChange={handleCurrencyChange(setLoanAmount)}
                  className="block w-full pl-3 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tools.loan.rate')}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="block w-full pl-3 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Duration */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tools.loan.term')}: {durationYears} {t('common.year')}
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
                {t('tools.loan.start')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full pl-3 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <CalendarIcon className="absolute right-3 top-3 h-5 w-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Calculation Method */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('tools.loan.method')}
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="method"
                    value="Reducing"
                    checked={method === 'Reducing'}
                    onChange={() => setMethod('Reducing')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">{t('tools.loan.reducing')}</span>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <input
                    type="radio"
                    name="method"
                    value="Flat"
                    checked={method === 'Flat'}
                    onChange={() => setMethod('Flat')}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-slate-900 dark:text-white">{t('tools.loan.flat')}</span>
                  </div>
                </label>
              </div>
            </div>

            <button 
              onClick={() => {
                setLoanAmount(1000000000);
                setInterestRate(10.5);
                setDurationYears(5);
                setMethod('Reducing');
                setStartDate(new Date().toISOString().slice(0, 10));
              }}
              className="w-full flex items-center justify-center py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-200 dark:hover:border-emerald-900 bg-slate-50 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
            >
              <RefreshCcw className="h-3 w-3 mr-2" /> {t('tools.compound.reset')}
            </button>
          </div>
        </div>

        {/* Right Column: Summary & Chart */}
        <div className="lg:col-span-8 space-y-6">
          
           {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
               <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('tools.loan.totalPay')}</div>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatShortVND(totalPayment)}</div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
               <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('tools.loan.totalInt')}</div>
               <div className="text-xl font-bold text-rose-600">{formatShortVND(totalInterest)}</div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
               <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{t('tools.loan.estMonthly')}</div>
               <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                 {schedule.length > 1 ? formatShortVND(schedule[1].totalPayment) : 0}
               </div>
             </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full max-h-[450px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                {t('tools.compound.chart')}
              </h3>
              <button 
                onClick={handleExportImage}
                className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <ImageIcon className="h-4 w-4" /> {t('tools.compound.saveGraph')}
              </button>
            </div>
            <div className="h-[350px]" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={schedule} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                  <XAxis dataKey="month" stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} interval={11} label={{ value: t('common.month'), position: 'insideBottomRight', offset: -5 }} />
                  <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={formatShortVND} />
                  <Tooltip 
                    formatter={(value: number) => formatVND(value)}
                    contentStyle={{ backgroundColor: chartTooltipBg, borderRadius: '8px', border: `1px solid ${chartTooltipBorder}`, color: chartTextColor }}
                    itemStyle={{ color: chartTextColor }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  {/* Ending Balance (Remaining Principal) - No Stack */}
                  <Area type="monotone" dataKey="endingBalance" name={t('tools.loan.chartRemaining')} stroke="#64748b" fill="url(#colorPrincipal)" />
                  {/* Accumulated Interest - No Stack */}
                  <Area type="monotone" dataKey="accInterest" name={t('tools.loan.chartTotalInterest')} stroke="#e11d48" fill="url(#colorInterest)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      
      {/* Paginated Table - Full Width */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
               <h3 className="font-semibold text-slate-900 dark:text-white">{t('tools.loan.schedule')}</h3>
               <button 
                  onClick={handleExportExcel}
                  className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <FileSpreadsheet className="h-4 w-4" /> {t('tools.compound.exportExcel')}
                </button>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                 <thead className="bg-white dark:bg-slate-800">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common.date')}</th>
                     <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tools.loan.colBalance')}</th>
                     <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tools.loan.colPrincipal')}</th>
                     <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tools.loan.colInterest')}</th>
                     <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('tools.loan.colTotal')}</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                   {paginatedData.map((row) => (
                     <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{row.date}</td>
                       <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-900 dark:text-white font-medium">{formatShortVND(row.beginningBalance)}</td>
                       <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">{formatShortVND(row.principalPaid)}</td>
                       <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-rose-600 dark:text-rose-400">{formatShortVND(row.interestPaid)}</td>
                       <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-emerald-600 dark:text-emerald-400 font-bold">{formatShortVND(row.totalPayment)}</td>
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