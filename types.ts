export interface Holding {
  symbol: string;
  name: string;
  sector: string;
  weight: number; // percentage
  change: number; // 24h change mock
}

export interface MonthlyPerf {
  year: number;
  month: number;
  value: number; // percentage return
}

export interface AnnualPerf {
  year: number;
  value: number; // percentage return
}

export interface Fund {
  id: string;
  name: string;
  code: string;
  company: string;
  type: 'ETF' | 'Equity' | 'Bond' | 'Balanced';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  benchmark: string;
  nav: number;
  cagr1Y: number;
  cagr3Y: number;
  cagr5Y: number;
  volatility: number;
  maxDrawdown: number;
  expenseRatio: number;
  inceptionDate: string;
  description: string;
  holdings: Holding[];
  monthlyPerformance: MonthlyPerf[];
  annualPerformance: AnnualPerf[];
}

export interface SimulationResult {
  year: number;
  invested: number;
  value: number;
  annualReturn: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  content: string; // HTML content
  imageUrl?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
}