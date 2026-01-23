import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, ChevronLeft, ChevronRight, TrendingUp, Image as ImageIcon, FileSpreadsheet, Wallet, Sparkles, Calculator, Info, LineChart, Table as TableIcon, Layout, Download, Eye, PieChart, PiggyBank, Coins } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';

type Frequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
type ViewMode = 'Chart' | 'Table';

interface CalculationRow {
  year: number;
  yearLabel: string;
  totalPrincipal: number;
  totalInterest: number;
  totalBalance: number;
}

const CompoundInterestCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useContext(ThemeContext);

  // --- State ---
  const [initialPrincipal, setInitialPrincipal] = useState<number>(100000000);
  const [contribution, setContribution] = useState<number>(5000000);
  
  // Interest Rate State (Number for calc, String for Input Display)
  const [interestRate, setInterestRate] = useState<number>(10);
  const [interestRateInput, setInterestRateInput] = useState<string>("10");

  const [years, setYears] = useState<number>(10);
  const [frequency, setFrequency] = useState<Frequency>('Monthly');
  
  const [viewMode, setViewMode] = useState<ViewMode>('Chart');

  // --- Results State ---
  const [data, setData] = useState<CalculationRow[]>([]);
  const [summary, setSummary] = useState({
    futureValue: 0,
    totalPrincipal: 0,
    totalInterest: 0
  });

  // --- Check if user has entered data ---
  const hasData = useMemo(() => {
    return initialPrincipal > 0 || contribution > 0;
  }, [initialPrincipal, contribution]);

  // --- Pagination & Refs ---
  const chartRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Calculation Effect ---
  useEffect(() => {
    calculate();
    setCurrentPage(1);
  }, [initialPrincipal, contribution, interestRate, years, frequency]);

  const calculate = () => {
    let periodsPerYear = 12;
    if (frequency === 'Weekly') periodsPerYear = 52;
    if (frequency === 'Quarterly') periodsPerYear = 4;
    if (frequency === 'Yearly') periodsPerYear = 1;

    const ratePerPeriod = (interestRate / 100) / periodsPerYear;
    const totalPeriods = years * periodsPerYear;

    let balance = initialPrincipal;
    let principal = initialPrincipal;
    
    const currentYear = new Date().getFullYear();
    const rows: CalculationRow[] = [];
    rows.push({ 
        year: 0, 
        yearLabel: currentYear.toString(),
        totalPrincipal: Math.round(principal), 
        totalInterest: 0, 
        totalBalance: Math.round(balance) 
    });

    for (let i = 1; i <= totalPeriods; i++) {
        // Add contribution at start of period (Annuity Due assumption commonly used for savings)
        balance += contribution;
        principal += contribution;
        
        // Add interest at end of period
        const interest = balance * ratePerPeriod;
        balance += interest;

        // Record year-end data
        if (i % periodsPerYear === 0) {
            const yearIndex = i / periodsPerYear;
            rows.push({
                year: yearIndex,
                yearLabel: (currentYear + yearIndex).toString(),
                totalPrincipal: Math.round(principal),
                totalInterest: Math.round(balance - principal),
                totalBalance: Math.round(balance)
            });
        }
    }

    setData(rows);
    setSummary({
        futureValue: balance,
        totalPrincipal: principal,
        totalInterest: balance - principal
    });
  };

  // --- Helpers ---
  const getFrequencyLabel = (freq: string) => {
    switch(freq) {
        case 'Weekly': return 'Tuần';
        case 'Monthly': return 'Tháng';
        case 'Quarterly': return 'Quý';
        case 'Yearly': return 'Năm';
        default: return freq;
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(num);
  };

  const formatShortVND = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} tỷ`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)} tr`;
    return num.toLocaleString();
  };

  const formatInputValue = (val: number) => {
    return val.toLocaleString('vi-VN');
  };

  const handleCurrencyChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
    setter(Number(rawValue));
  };

  // Specialized Handler for Interest Rate (Supports . and , -> displays ,)
  const handleInterestRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Auto-replace dot with comma for display consistency
    value = value.replace('.', ',');

    // Validate: Only numbers and optional one comma, max 2 decimal places
    if (/^[0-9]*[,]?[0-9]{0,2}$/.test(value)) {
        setInterestRateInput(value);
        
        // Update numeric state for calculation (replace comma back to dot for float parsing)
        if (value === '' || value === ',') {
            setInterestRate(0);
        } else {
            const numericValue = parseFloat(value.replace(',', '.'));
            setInterestRate(isNaN(numericValue) ? 0 : numericValue);
        }
    }
  };

  const handleExportImage = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current);
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "compound_interest_chart.png";
        link.click();
      } catch (err) {
        console.error("Failed to export image", err);
      }
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const inputInfo = [
      ["Compound Interest Results"],
      ["Date Generated", new Date().toLocaleDateString('vi-VN')],
      [],
      ["--- Parameters ---"],
      ["Initial Principal", initialPrincipal],
      ["Periodic Contribution", contribution],
      ["Contribution Frequency", frequency],
      ["Annual Interest Rate (%)", interestRate],
      ["Period (Years)", years],
      [],
      ["--- Summary ---"],
      ["Future Value", summary.futureValue],
      ["Total Principal Invested", summary.totalPrincipal],
      ["Total Interest Earned", summary.totalInterest],
      [],
      ["--- Yearly Breakdown ---"],
      ["Year", "Total Principal", "Total Interest", "Total Balance"]
    ];

    const tableData = data.map(row => [
      row.yearLabel,
      row.totalPrincipal,
      row.totalInterest,
      row.totalBalance
    ]);

    const wsData = [...inputInfo, ...tableData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, "compound_interest_schedule.xlsx");
  };

  const totalPages = Math.ceil((data.length - 1) / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#94a3b8';
  const chartTooltipBg = isDark ? '#1e293b' : '#fff';
  const chartTooltipBorder = isDark ? '#334155' : '#e2e8f0';

  // Calculate percentages for the summary
  const principalPercent = summary.futureValue > 0 ? (summary.totalPrincipal / summary.futureValue) * 100 : 0;
  const interestPercent = summary.futureValue > 0 ? (summary.totalInterest / summary.futureValue) * 100 : 0;
  
  // ROI Calculation (Return on Investment)
  const roi = summary.totalPrincipal > 0 ? (summary.totalInterest / summary.totalPrincipal) * 100 : 0;

  // --- Custom Tooltip Component ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Access the full data object for this point
      const dataItem = payload[0].payload;
      
      const principal = dataItem.totalPrincipal;
      const interest = dataItem.totalInterest;
      const total = dataItem.totalBalance;

      return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 min-w-[220px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
               {t('common.year')} {label}
             </span>
          </div>

          {/* Total Balance Hero */}
          <div className="mb-4">
             <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5 uppercase">Tổng tài sản</p>
             <p className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
               {formatVND(total)}
             </p>
          </div>

          {/* Breakdown */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">{t('pages.simulator.table.invested')}</span>
               </div>
               <span className="font-bold text-slate-900 dark:text-white text-xs tabular-nums">{formatVND(principal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">{t('pages.tools.compound.earned')}</span>
               </div>
               <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">+{formatVND(interest)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/tools" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('navigation.tools')}
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('pages.tools.compound.name')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">{t('pages.tools.compound.desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              {t('pages.tools.compound.params')}
            </h2>

            {/* Initial Investment */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.compound.initial')}
              </label>
              <div className="relative">
                 <input
                  type="text"
                  value={formatInputValue(initialPrincipal)}
                  onChange={handleCurrencyChange(setInitialPrincipal)}
                  className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                </div>
              </div>
            </div>

            {/* Contribution */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t('pages.tools.compound.cont')}
              </label>
              
              {/* 1. Amount Input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={formatInputValue(contribution)}
                  onChange={handleCurrencyChange(setContribution)}
                  className="block w-full pl-4 pr-16 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">VND</span>
                </div>
              </div>

              {/* 2. Frequency Label & Tooltip */}
              <div className="flex items-center gap-1.5 mb-2">
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t('pages.tools.compound.freq')}
                 </span>
                 <div className="group relative">
                    <Info className="h-4 w-4 text-slate-400 hover:text-emerald-500 transition-colors cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl hidden group-hover:block z-10 text-center leading-tight">
                        Giả định tiền được góp vào ngày đầu tiên của mỗi kỳ.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                 </div>
              </div>

              {/* 3. Frequency Tabs (Using ToggleGroup with Custom Styling) */}
              <ToggleGroup 
                type="single" 
                value={frequency} 
                onValueChange={(val) => val && setFrequency(val as Frequency)}
                className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full justify-stretch"
              >
                {(['Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map((freq) => (
                    <ToggleGroupItem
                        key={freq}
                        value={freq}
                        className="flex-1 h-auto py-2 text-xs font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:bg-transparent hover:text-slate-900 dark:hover:text-slate-200 data-[state=on]:bg-white dark:data-[state=on]:bg-slate-700 data-[state=on]:text-emerald-600 dark:data-[state=on]:text-white data-[state=on]:shadow-sm data-[state=on]:font-bold"
                    >
                        {getFrequencyLabel(freq)}
                    </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Row: Interest Rate & Duration */}
            <div className="grid grid-cols-2 gap-4 mb-5">
                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 truncate">
                    {t('pages.tools.compound.rate')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={interestRateInput}
                      onChange={handleInterestRateChange}
                      placeholder="0,0"
                      className="block w-full pl-4 pr-10 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">%</span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 truncate">
                    {t('pages.tools.compound.period')} ({t('common.year')})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="block w-full pl-4 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-sm transition-all"
                    />
                  </div>
                </div>
            </div>

            <button 
              onClick={() => {
                setInitialPrincipal(100000000);
                setContribution(5000000);
                setInterestRate(10);
                setInterestRateInput("10");
                setYears(10);
                setFrequency('Monthly');
                setViewMode('Chart');
              }}
              className="w-full flex items-center justify-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 rounded-full transition-all"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> {t('pages.tools.compound.reset')}
            </button>
          </div>
        </div>

        {/* Right Column: Summary & Chart OR Empty State */}
        <div className="lg:col-span-8 space-y-6">
          
          {hasData ? (
            <>
              {/* NEW SUMMARY CARD STYLE - Clean Breakdown */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                  
                  {/* Hero Section: Future Value */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
                      <div>
                          <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                  <Sparkles className="h-5 w-5" />
                              </div>
                              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Tổng tài sản sau {years} năm
                              </span>
                          </div>
                          <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                              {formatVND(summary.futureValue)}
                          </div>
                      </div>
                  </div>

                  {/* Detailed Grid Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                      
                      {/* 1. Total Principal */}
                      <div className="relative group">
                          <div className="flex items-center gap-2 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tiền gốc</p>
                          </div>
                          <div className="text-xl font-bold text-slate-900 dark:text-white">
                              {formatShortVND(summary.totalPrincipal)}
                          </div>
                          <div className="text-xs font-medium text-slate-400 mt-1">
                              Chiếm <span className="text-slate-600 dark:text-slate-300">{principalPercent.toFixed(1)}%</span> tổng TS
                          </div>
                      </div>

                      {/* 2. Total Interest */}
                      <div className="relative group">
                          <div className="flex items-center gap-2 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tiền lãi</p>
                          </div>
                          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              {formatShortVND(summary.totalInterest)}
                          </div>
                          <div className="text-xs font-medium text-slate-400 mt-1">
                              Chiếm <span className="text-emerald-600 dark:text-emerald-400">{interestPercent.toFixed(1)}%</span> tổng TS
                          </div>
                      </div>

                      {/* 3. ROI */}
                      <div className="relative group pl-0 sm:pl-6 lg:pl-0 border-l-0 sm:border-l border-slate-100 dark:border-slate-700 lg:border-l-0">
                          <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Tỷ suất LN (ROI)</p>
                          </div>
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {roi.toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                              Lợi nhuận / Vốn gốc
                          </div>
                      </div>

                      {/* 4. IRR / Rate */}
                      <div className="relative group pl-0 lg:pl-6 border-l-0 lg:border-l border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-1">
                              <Coins className="h-3.5 w-3.5 text-purple-500" />
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">TB Năm (IRR)</p>
                          </div>
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                              {interestRate}%
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                              Lãi suất giả định
                          </div>
                      </div>

                  </div>
              </div>

              {/* UNIFIED MAIN CARD (Chart & Table) */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up mt-6">
                
                {/* Unified Header - Clear & Descriptive */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Dynamic Title & Context */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {viewMode === 'Chart' ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TableIcon className="h-5 w-5 text-emerald-600" />}
                            {viewMode === 'Chart' ? 'Biểu đồ tăng trưởng' : 'Bảng số liệu chi tiết'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {viewMode === 'Chart' 
                                ? 'Trực quan hóa quá trình tích lũy tài sản qua các năm.' 
                                : 'Theo dõi chính xác dòng tiền và lãi suất hàng năm.'}
                        </p>
                    </div>

                    {/* Right: Controls (Switcher + Action) */}
                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto bg-slate-50 dark:bg-slate-900/30 p-2 md:p-0 rounded-lg md:bg-transparent">
                        
                        {/* Explicit Label & Switcher */}
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                                Chế độ xem:
                            </span>
                            
                            <ToggleGroup 
                                type="single" 
                                value={viewMode} 
                                onValueChange={(val) => val && setViewMode(val as ViewMode)}
                                className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700"
                            >
                                <ToggleGroupItem
                                    value="Chart"
                                    className="flex items-center gap-2 h-auto py-1.5 px-3 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-transparent hover:text-slate-700 dark:hover:text-slate-200 data-[state=on]:bg-white dark:data-[state=on]:bg-slate-700 data-[state=on]:text-emerald-600 dark:data-[state=on]:text-emerald-400 data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-black/5 dark:data-[state=on]:ring-white/5"
                                >
                                    <LineChart className="h-3.5 w-3.5" />
                                    Biểu đồ
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                    value="Table"
                                    className="flex items-center gap-2 h-auto py-1.5 px-3 rounded-md text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-transparent hover:text-slate-700 dark:hover:text-slate-200 data-[state=on]:bg-white dark:data-[state=on]:bg-slate-700 data-[state=on]:text-emerald-600 dark:data-[state=on]:text-emerald-400 data-[state=on]:shadow-sm data-[state=on]:ring-1 data-[state=on]:ring-black/5 dark:data-[state=on]:ring-white/5"
                                >
                                    <TableIcon className="h-3.5 w-3.5" />
                                    Chi tiết
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        {/* Divider (Hidden on small screens) */}
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>

                        {/* Action Button */}
                        {viewMode === 'Chart' ? (
                            <button 
                                onClick={handleExportImage}
                                className="group flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                                title={t('pages.tools.compound.saveGraph')}
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        ) : (
                            <button 
                                onClick={handleExportExcel}
                                className="group flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                                title={t('pages.tools.compound.exportExcel')}
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Body */}
                <div>
                    {viewMode === 'Chart' ? (
                        <div className="p-6 h-[400px]">
                            <div className="h-full w-full" ref={chartRef}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        </linearGradient>
                                        <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                                    <XAxis dataKey="yearLabel" stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} minTickGap={30} padding={{ right: 20 }} />
                                    <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={formatShortVND} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="linear" dataKey="totalPrincipal" name={t('pages.simulator.table.invested')} stackId="1" stroke="#3b82f6" fill="url(#colorPrincipal)" />
                                    <Area type="linear" dataKey="totalInterest" name={t('pages.tools.compound.earned')} stackId="1" stroke="#059669" fill="url(#colorInterest)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('common.year')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.simulator.table.invested')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.tools.compound.earned')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.simulator.table.value')}</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {paginatedData.map((row) => (
                                        <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{row.yearLabel}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">{formatVND(row.totalPrincipal)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-indigo-600 dark:text-indigo-400 font-medium">+{formatVND(row.totalInterest)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-emerald-600 dark:text-emerald-400 font-bold">{formatVND(row.totalBalance)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 mt-auto">
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
                    )}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center animate-fade-in transition-all">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50 dark:ring-slate-700/30">
                    <LineChart className="h-10 w-10 text-slate-300 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bắt đầu tính toán</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
                    Nhập <strong>Số tiền ban đầu</strong> hoặc <strong>Góp thêm định kỳ</strong> để xem sức mạnh của lãi suất kép theo thời gian.
                </p>
                <div className="flex gap-2">
                    <div className="h-2 w-16 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-2 w-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                    <div className="h-2 w-2 bg-slate-100 dark:bg-slate-700 rounded-full"></div>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;