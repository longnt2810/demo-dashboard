import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, ChevronLeft, ChevronRight, TrendingUp, Image as ImageIcon, FileSpreadsheet, Wallet, Sparkles, Calculator, Info, LineChart, Table as TableIcon, Layout, Download, Eye, PieChart, PiggyBank, Coins, Calendar, CalendarClock, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../App';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';

type Frequency = 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
type TableView = 'Monthly' | 'Yearly';

interface CalculationRow {
  monthIndex: number;
  yearIndex: number;
  label: string;
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
  
  // --- View Control State ---
  const [tableView, setTableView] = useState<TableView>('Yearly');
  const [pageSizeMode, setPageSizeMode] = useState<'default' | 'all'>('default');

  // --- Results State ---
  const [rawData, setRawData] = useState<CalculationRow[]>([]); // Stores all monthly points
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
  
  // Dynamic items per page based on view and selection
  const itemsPerPage = useMemo(() => {
      if (pageSizeMode === 'all') return 999999; // Effectively all
      return tableView === 'Monthly' ? 12 : 10;
  }, [pageSizeMode, tableView]);

  // --- Calculation Effect ---
  useEffect(() => {
    calculate();
    setCurrentPage(1);
  }, [initialPrincipal, contribution, interestRate, years, frequency]);

  // Reset page when view settings change
  useEffect(() => {
    setCurrentPage(1);
  }, [tableView, pageSizeMode]);

  const calculate = () => {
    // We simulate on a Monthly basis to support detailed views
    const totalMonths = years * 12;
    const ratePerMonth = (interestRate / 100) / 12;

    let balance = initialPrincipal;
    let principal = initialPrincipal;
    
    const rows: CalculationRow[] = [];
    
    // Initial State (Month 0 / Year 0)
    rows.push({ 
        monthIndex: 0, 
        yearIndex: 0,
        label: '0',
        totalPrincipal: Math.round(principal), 
        totalInterest: 0, 
        totalBalance: Math.round(balance) 
    });

    for (let m = 1; m <= totalMonths; m++) {
        // Determine monthly contribution based on frequency
        let added = 0;
        if (frequency === 'Monthly') {
            added = contribution;
        } else if (frequency === 'Weekly') {
            // Approx: 52 weeks / 12 months
            added = contribution * (52 / 12);
        } else if (frequency === 'Quarterly') {
            if ((m - 1) % 3 === 0) added = contribution;
        } else if (frequency === 'Yearly') {
            if ((m - 1) % 12 === 0) added = contribution;
        }

        balance += added;
        principal += added;
        
        // Add Interest (Compounded Monthly)
        const interest = balance * ratePerMonth;
        balance += interest;

        rows.push({
            monthIndex: m,
            yearIndex: Math.floor(m / 12),
            label: m.toString(),
            totalPrincipal: Math.round(principal),
            totalInterest: Math.round(balance - principal),
            totalBalance: Math.round(balance)
        });
    }

    setRawData(rows);
    setSummary({
        futureValue: balance,
        totalPrincipal: principal,
        totalInterest: balance - principal
    });
  };

  // --- Derived Data: CHART (Always Yearly) ---
  const chartData = useMemo(() => {
      // Always filter for Year 0, 1, 2...
      return rawData.filter(r => r.monthIndex % 12 === 0).map(r => ({
          ...r,
          label: (r.monthIndex / 12).toString() // Explicitly set label to Year Number
      }));
  }, [rawData]);

  // --- Derived Data: TABLE (Depends on View) ---
  const tableData = useMemo(() => {
      if (tableView === 'Yearly') {
          // Exclude Year 0 (monthIndex === 0)
          return rawData.filter(r => r.monthIndex > 0 && r.monthIndex % 12 === 0).map(r => ({
              ...r,
              label: (r.monthIndex / 12).toString()
          }));
      } else {
          // Exclude Month 0
          return rawData.filter(r => r.monthIndex > 0).map(r => ({
              ...r,
              label: `T${r.monthIndex}`
          }));
      }
  }, [rawData, tableView]);

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
      ["--- Breakdown ---"],
      [tableView === 'Yearly' ? "Year" : "Month", "Total Principal", "Total Interest", "Total Balance"]
    ];

    const excelData = tableData.map(row => [
      row.label,
      row.totalPrincipal,
      row.totalInterest,
      row.totalBalance
    ]);

    const wsData = [...inputInfo, ...excelData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, "compound_interest_schedule.xlsx");
  };

  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const paginatedData = tableData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const chartGridColor = isDark ? '#334155' : '#e2e8f0';
  const chartTextColor = isDark ? '#94a3b8' : '#94a3b8';
  
  // Calculate percentages for the summary
  const principalPercent = summary.futureValue > 0 ? (summary.totalPrincipal / summary.futureValue) * 100 : 0;
  const interestPercent = summary.futureValue > 0 ? (summary.totalInterest / summary.futureValue) * 100 : 0;
  
  // ROI Calculation (Return on Investment)
  const roi = summary.totalPrincipal > 0 ? (summary.totalInterest / summary.totalPrincipal) * 100 : 0;

  // --- Logic for Pagination Page Numbers ---
  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;
    
    if (totalPages <= maxButtons) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        // Always show 1
        pages.push(1);
        
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        
        // Adjust if close to beginning
        if (currentPage <= 3) {
            endPage = Math.min(totalPages - 1, 4); // 1, 2, 3, 4 ...
        }
        // Adjust if close to end
        if (currentPage >= totalPages - 2) {
            startPage = Math.max(2, totalPages - 3); // ... N-3, N-2, N-1, N
        }

        if (startPage > 2) pages.push('...');
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        
        if (endPage < totalPages - 1) pages.push('...');
        
        // Always show last
        pages.push(totalPages);
    }
    return pages;
  };

  // --- Custom Tooltip Component ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Access the full data object for this point
      const dataItem = payload[0].payload;
      
      const principal = dataItem.totalPrincipal;
      const interest = dataItem.totalInterest;
      const total = dataItem.totalBalance;
      
      // Calculate growth relative to principal at this point
      const pointGrowth = principal > 0 ? ((total - principal) / principal) * 100 : 0;
      
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 min-w-[240px]">
          {/* Header: NĂM X */}
          <div className="mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
             <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
               NĂM {label}
             </span>
          </div>

          {/* Total Balance */}
          <div className="mb-5">
             <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">TỔNG TÀI SẢN</p>
             <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
               {formatVND(total)}
             </p>
          </div>

          {/* Breakdown List */}
          <div className="space-y-3">
            {/* Principal */}
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">Vốn đã nộp</span>
               </div>
               <span className="font-bold text-slate-900 dark:text-white text-xs tabular-nums">{formatVND(principal)}</span>
            </div>

            {/* Interest */}
            <div className="flex justify-between items-center text-sm">
               <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">Tiền lãi</span>
               </div>
               <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs tabular-nums">+{formatVND(interest)}</span>
            </div>
            
            {/* Growth */}
            <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-slate-50 dark:border-slate-700/50">
               <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">Tăng trưởng</span>
               </div>
               <span className="font-bold text-purple-600 dark:text-purple-400 text-xs tabular-nums">
                 {pointGrowth > 0 ? '+' : ''}{pointGrowth.toFixed(1)}%
               </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // --- Render Chart Label ---
  const renderChartLabel = (props: any) => {
    const { x, y, index } = props;
    
    // Safety check - use chartData
    if (!chartData[index]) return null;
    
    const item = chartData[index];
    const isLast = index === chartData.length - 1;
    
    // Determine step to prevent overcrowding
    let step = 1;
    const len = chartData.length;
    if (len > 30) step = Math.ceil(len / 6);
    else if (len > 15) step = 3;
    else if (len > 8) step = 2;

    // Show label if it matches step or is the last point
    const isVisible = (index % step === 0) || isLast;

    if (!isVisible) return null;

    return (
        <text 
            x={x} 
            y={y - 10} 
            fill={isDark ? "#cbd5e1" : "#475569"} 
            textAnchor="middle" 
            dominantBaseline="auto"
            fontSize={11}
            fontWeight={600}
        >
            {formatShortVND(item.totalBalance)}
        </text>
    );
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
                setTableView('Yearly');
              }}
              className="w-full flex items-center justify-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 rounded-full transition-all"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> {t('pages.tools.compound.reset')}
            </button>
          </div>
        </div>

        {/* Right Column: Summary & Chart & Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {hasData ? (
            <>
              {/* NEW SUMMARY CARD STYLE - Side-by-Side Layout */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
                  
                  {/* Hero Section: Future Value & Growth split */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
                      
                      {/* Col 1: Total Assets */}
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

                      {/* Vertical Divider (Hidden on mobile) */}
                      <div className="hidden sm:block h-12 w-px bg-slate-200 dark:bg-slate-700 mx-4"></div>

                      {/* Col 2: Growth % */}
                      <div className="sm:text-right">
                           <div className="flex items-center sm:justify-end gap-2 mb-2">
                              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Tăng trưởng
                              </span>
                              <TrendingUp className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="text-4xl sm:text-5xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">
                              +{roi.toFixed(1)}%
                          </div>
                      </div>
                  </div>

                  {/* Detailed Grid Breakdown - Reorganized to 3 cols */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                      
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
                      <div className="relative group pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-100 dark:border-slate-700">
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

                      {/* 3. IRR / Rate */}
                      <div className="relative group pl-0 sm:pl-6 border-l-0 sm:border-l border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-1">
                              <Coins className="h-3.5 w-3.5 text-slate-500" />
                              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">TB Năm (IRR)</p>
                          </div>
                          <div className="text-xl font-bold text-slate-700 dark:text-slate-300">
                              {interestRate}%
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                              Lãi suất giả định
                          </div>
                      </div>

                  </div>
              </div>

              {/* CARD 1: CHART */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-fade-in-up">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                          Biểu đồ tăng trưởng
                      </h3>
                      <button 
                          onClick={handleExportImage}
                          className="group flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                          title={t('pages.tools.compound.saveGraph')}
                      >
                          <Download className="h-4 w-4" />
                      </button>
                  </div>
                  
                  <div className="h-[400px]">
                      <div className="h-full w-full" ref={chartRef}>
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
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
                              <XAxis dataKey="label" stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} minTickGap={30} padding={{ right: 20 }} tickFormatter={(val) => `Năm ${val}`} />
                              <YAxis stroke={chartTextColor} tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={formatShortVND} />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                              <Area type="linear" dataKey="totalPrincipal" name={t('pages.simulator.table.invested')} stackId="1" stroke="#3b82f6" fill="url(#colorPrincipal)" />
                              <Area 
                                  type="linear" 
                                  dataKey="totalInterest" 
                                  name={t('pages.tools.compound.earned')} 
                                  stackId="1" 
                                  stroke="#059669" 
                                  fill="url(#colorInterest)" 
                                  label={renderChartLabel}
                              />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>

              {/* CARD 2: TABLE */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <TableIcon className="h-5 w-5 text-emerald-600" />
                          Bảng số liệu chi tiết
                      </h3>
                      
                      <div className="flex items-center gap-3">
                          {/* Toggle View Mode: Monthly vs Yearly */}
                          <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg flex items-center">
                              {(['Yearly', 'Monthly'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setTableView(mode)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                                        tableView === mode 
                                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {mode === 'Yearly' ? <Calendar className="h-3 w-3" /> : <CalendarClock className="h-3 w-3" />}
                                    {mode === 'Yearly' ? 'Theo Năm' : 'Theo Tháng'}
                                </button>
                              ))}
                          </div>

                          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                          <button 
                              onClick={handleExportExcel}
                              className="group flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                              title={t('pages.tools.compound.exportExcel')}
                          >
                              <FileSpreadsheet className="h-4 w-4" />
                          </button>
                      </div>
                  </div>

                  <div className="flex flex-col">
                      {/* Pagination Controls Container - MOVED TO TOP to ensure visibility or bottom as well. Keeping at bottom. */}
                      
                      <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                              <thead className="bg-slate-50 dark:bg-slate-900/50">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thời gian</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.simulator.table.invested')}</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.tools.compound.earned')}</th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pages.simulator.table.value')}</th>
                              </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                              {paginatedData.map((row) => (
                                  <tr key={`${row.yearIndex}-${row.monthIndex}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                                      {tableView === 'Yearly' ? `Năm ${row.label}` : `Tháng ${row.label.replace('T','')}`}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-slate-500 dark:text-slate-400">{formatVND(row.totalPrincipal)}</td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-indigo-600 dark:text-indigo-400 font-medium">+{formatVND(row.totalInterest)}</td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-emerald-600 dark:text-emerald-400 font-bold">{formatVND(row.totalBalance)}</td>
                                  </tr>
                              ))}
                              </tbody>
                          </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 mt-auto gap-4">
                          
                          {/* Left: Items per page selector */}
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <span>Hiển thị:</span>
                              <div className="relative">
                                  <select 
                                      value={pageSizeMode}
                                      onChange={(e) => setPageSizeMode(e.target.value as 'default' | 'all')}
                                      className="block w-full pl-3 pr-8 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium shadow-sm appearance-none cursor-pointer hover:border-emerald-400 transition-colors"
                                  >
                                      <option value="default">{tableView === 'Monthly' ? '12' : '10'} dòng / trang</option>
                                      <option value="all">Hiện tất cả</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                      <ChevronDown className="h-3 w-3" />
                                  </div>
                              </div>
                          </div>

                          {/* Right: Page Numbers - Hide if showing ALL or if there is only 1 page */}
                          {totalPages > 1 && pageSizeMode !== 'all' && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {getPageNumbers().map((page, idx) => (
                                        <React.Fragment key={idx}>
                                            {page === '...' ? (
                                                <span className="text-slate-400 dark:text-slate-600 px-1 text-xs select-none">...</span>
                                            ) : (
                                                <button
                                                    onClick={() => setCurrentPage(page as number)}
                                                    className={`min-w-[28px] h-7 px-1 text-xs font-medium rounded-md border transition-all ${
                                                        currentPage === page 
                                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                          )}
                      </div>
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