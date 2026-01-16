
import { Fund, Article, Tool, Holding, MonthlyPerf, AnnualPerf } from './types';

// Helper to generate random holdings
const generateHoldings = (type: string): Holding[] => {
  if (type === 'Bond') {
    return [
      { symbol: 'TPCP_10Y', name: 'Trái phiếu Chính phủ 10N', sector: 'Government', weight: 15.5, change: 0.1 },
      { symbol: 'TP_VIC', name: 'Trái phiếu Vingroup', sector: 'Corporate', weight: 8.2, change: 0.05 },
      { symbol: 'TP_MSN', name: 'Trái phiếu Masan', sector: 'Corporate', weight: 7.8, change: 0.02 },
      { symbol: 'TIEN_GUI', name: 'Tiền gửi & Tương đương tiền', sector: 'Cash', weight: 12.5, change: 0 },
      { symbol: 'TP_NVL', name: 'Trái phiếu Novaland', sector: 'Corporate', weight: 5.4, change: -0.1 },
      { symbol: 'TP_VHM', name: 'Trái phiếu Vinhomes', sector: 'Corporate', weight: 6.1, change: 0.08 },
      { symbol: 'TPCP_5Y', name: 'Trái phiếu Chính phủ 5N', sector: 'Government', weight: 10.2, change: 0.05 },
      { symbol: 'TP_TCB', name: 'Trái phiếu Techcombank', sector: 'Financials', weight: 9.5, change: 0.03 },
      { symbol: 'TP_BID', name: 'Trái phiếu BIDV', sector: 'Financials', weight: 8.8, change: 0.04 },
      { symbol: 'TP_HDB', name: 'Trái phiếu HDBank', sector: 'Financials', weight: 6.0, change: 0.02 },
    ];
  }

  return [
    { symbol: 'FPT', name: 'FPT Corp', sector: 'Technology', weight: 9.8, change: 1.2 },
    { symbol: 'MWG', name: 'Mobile World', sector: 'Retail', weight: 8.5, change: -0.5 },
    { symbol: 'VCB', name: 'Vietcombank', sector: 'Banking', weight: 7.2, change: 0.3 },
    { symbol: 'HPG', name: 'Hoa Phat Group', sector: 'Materials', weight: 6.9, change: 1.5 },
    { symbol: 'VHM', name: 'Vinhomes', sector: 'Real Estate', weight: 5.4, change: -0.2 },
    { symbol: 'VPB', name: 'VPBank', sector: 'Banking', weight: 4.8, change: 0.8 },
    { symbol: 'ACB', name: 'ACB', sector: 'Banking', weight: 4.5, change: 0.4 },
    { symbol: 'MSN', name: 'Masan Group', sector: 'Consumer', weight: 4.2, change: -1.1 },
    { symbol: 'VNM', name: 'Vinamilk', sector: 'Consumer', weight: 3.8, change: -0.3 },
    { symbol: 'TCB', name: 'Techcombank', sector: 'Banking', weight: 3.5, change: 0.9 },
  ];
};

// Helper to generate monthly performance (kept for backward compatibility if needed, though mostly unused now)
const generatePerformance = (baseReturn: number): MonthlyPerf[] => {
  const data: MonthlyPerf[] = [];
  const years = [2021, 2022, 2023, 2024];
  
  years.forEach(year => {
    for (let m = 1; m <= 12; m++) {
      if (year === 2024 && m > 3) break; 
      const noise = (Math.random() - 0.5) * 8; 
      const val = (baseReturn / 12) + noise;
      data.push({
        year,
        month: m,
        value: parseFloat(val.toFixed(2))
      });
    }
  });
  return data;
};

// Helper to generate Annual Performance based on Fund Type
const generateAnnualHistory = (type: string): AnnualPerf[] => {
  if (type === 'Bond') {
    return [
      { year: 2019, value: 7.2 },
      { year: 2020, value: 6.8 },
      { year: 2021, value: 5.5 },
      { year: 2022, value: 8.1 }, // Bonds did okay when stocks crashed
      { year: 2023, value: 6.5 },
      { year: 2024, value: 2.1 }, // YTD
    ];
  } else if (type === 'Balanced') {
    return [
       { year: 2019, value: 9.5 },
       { year: 2020, value: 12.4 },
       { year: 2021, value: 18.5 },
       { year: 2022, value: -15.2 },
       { year: 2023, value: 8.5 },
       { year: 2024, value: 4.2 },
    ];
  } else {
    // Equity / ETF
    return [
      { year: 2019, value: 11.2 },
      { year: 2020, value: 14.8 },
      { year: 2021, value: 35.4 }, // Great year for VNIndex
      { year: 2022, value: -32.5 }, // Crash
      { year: 2023, value: 12.2 }, // Recovery
      { year: 2024, value: 6.5 }, // YTD
    ];
  }
};

export const MOCK_FUNDS: Fund[] = [
  {
    id: '1',
    name: 'Quỹ ETF Dragon Capital VN30',
    code: 'E1VFVN30',
    company: 'Dragon Capital',
    type: 'ETF',
    riskLevel: 'High',
    benchmark: 'Chỉ số VN30',
    nav: 21500,
    cagr1Y: 12.5,
    cagr3Y: 8.4,
    cagr5Y: 9.2,
    volatility: 14.5,
    maxDrawdown: -32.4,
    expenseRatio: 0.65,
    inceptionDate: '06/10/2014',
    description: 'Mô phỏng hiệu suất của chỉ số VN30, đại diện cho 30 công ty niêm yết lớn nhất và thanh khoản nhất tại Việt Nam.',
    holdings: generateHoldings('ETF'),
    monthlyPerformance: generatePerformance(12.5),
    annualPerformance: generateAnnualHistory('ETF')
  },
  {
    id: '2',
    name: 'Quỹ ETF SSIAM VNX50',
    code: 'FUESSV50',
    company: 'SSI AM',
    type: 'ETF',
    riskLevel: 'High',
    benchmark: 'Chỉ số VNX50',
    nav: 18200,
    cagr1Y: 14.2,
    cagr3Y: 9.1,
    cagr5Y: 10.5,
    volatility: 16.2,
    maxDrawdown: -35.1,
    expenseRatio: 0.55,
    inceptionDate: '14/11/2017',
    description: 'Đầu tư vào rổ cổ phiếu VNX50, mang lại khả năng tiếp cận thị trường rộng hơn so với VN30.',
    holdings: generateHoldings('ETF'),
    monthlyPerformance: generatePerformance(14.2),
    annualPerformance: generateAnnualHistory('ETF')
  },
  {
    id: '3',
    name: 'Quỹ Đầu tư Cổ phiếu Vietcombank',
    code: 'VCBF-BCF',
    company: 'VCBF',
    type: 'Equity',
    riskLevel: 'High',
    benchmark: 'VN-Index',
    nav: 34100,
    cagr1Y: 18.5,
    cagr3Y: 12.8,
    cagr5Y: 14.2,
    volatility: 12.1,
    maxDrawdown: -28.5,
    expenseRatio: 1.8,
    inceptionDate: '22/08/2014',
    description: 'Quản lý chủ động, tập trung vào các cổ phiếu tăng trưởng vốn hóa lớn với lợi thế cạnh tranh bền vững.',
    holdings: generateHoldings('Equity'),
    monthlyPerformance: generatePerformance(18.5),
    annualPerformance: generateAnnualHistory('Equity')
  },
  {
    id: '4',
    name: 'Quỹ Cổ phiếu Hưng Thịnh VinaCapital',
    code: 'VEOF',
    company: 'VinaCapital',
    type: 'Equity',
    riskLevel: 'High',
    benchmark: 'VN-Index',
    nav: 26500,
    cagr1Y: 16.8,
    cagr3Y: 11.2,
    cagr5Y: 13.5,
    volatility: 13.5,
    maxDrawdown: -29.8,
    expenseRatio: 1.75,
    inceptionDate: '01/07/2014',
    description: 'Tập trung vào các công ty bị định giá thấp với tiềm năng tăng trưởng cao trên nhiều lĩnh vực.',
    holdings: generateHoldings('Equity'),
    monthlyPerformance: generatePerformance(16.8),
    annualPerformance: generateAnnualHistory('Equity')
  },
  {
    id: '5',
    name: 'Quỹ Đầu tư Cân bằng Tuệ Sáng',
    code: 'VIBF',
    company: 'VinaCapital',
    type: 'Balanced',
    riskLevel: 'Medium',
    benchmark: '50% VN-Index + 50% Lãi suất tiết kiệm',
    nav: 19800,
    cagr1Y: 8.5,
    cagr3Y: 6.8,
    cagr5Y: 7.2,
    volatility: 6.5,
    maxDrawdown: -12.4,
    expenseRatio: 1.5,
    inceptionDate: '15/05/2019',
    description: 'Chiến lược cân bằng giữa cổ phiếu và trái phiếu, phù hợp với nhà đầu tư chấp nhận rủi ro trung bình.',
    holdings: generateHoldings('Balanced'),
    monthlyPerformance: generatePerformance(8.5),
    annualPerformance: generateAnnualHistory('Balanced')
  },
  {
    id: '6',
    name: 'Quỹ Đầu tư Trái phiếu VCBF',
    code: 'VCBF-FIF',
    company: 'VCBF',
    type: 'Bond',
    riskLevel: 'Low',
    benchmark: 'Lãi suất TPCP 10 năm',
    nav: 14500,
    cagr1Y: 6.2,
    cagr3Y: 5.8,
    cagr5Y: 6.1,
    volatility: 1.2,
    maxDrawdown: -1.5,
    expenseRatio: 0.9,
    inceptionDate: '08/08/2019',
    description: 'Đầu tư chủ yếu vào trái phiếu chính phủ và trái phiếu doanh nghiệp chất lượng cao, mục tiêu bảo toàn vốn.',
    holdings: generateHoldings('Bond'),
    monthlyPerformance: generatePerformance(6.2),
    annualPerformance: generateAnnualHistory('Bond')
  },
  {
    id: '7',
    name: 'Quỹ Trái phiếu SSI',
    code: 'SSIBF',
    company: 'SSI AM',
    type: 'Bond',
    riskLevel: 'Low',
    benchmark: 'Lãi suất tiết kiệm 12T',
    nav: 12300,
    cagr1Y: 7.1,
    cagr3Y: 6.5,
    cagr5Y: 6.8,
    volatility: 2.1,
    maxDrawdown: -2.1,
    expenseRatio: 0.8,
    inceptionDate: '04/09/2018',
    description: 'Tối đa hóa lợi nhuận từ các công cụ thu nhập cố định, tập trung vào trái phiếu doanh nghiệp niêm yết.',
    holdings: generateHoldings('Bond'),
    monthlyPerformance: generatePerformance(7.1),
    annualPerformance: generateAnnualHistory('Bond')
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'why-invest',
    title: 'Tại sao phải đầu tư? Hiểu về Lạm phát, Lãi kép và Tự do tài chính',
    summary: 'Đầu tư không phải là con đường làm giàu nhanh, mà là cách duy nhất để bảo vệ sức lao động của bạn trước sự bào mòn của lạm phát. Bài viết này giải thích triết lý cốt lõi của Bảng tin Tài chính VN.',
    date: '20 Th05, 2024',
    readTime: '10 phút đọc',
    content: `
      <p class="mb-4 text-lg font-medium text-slate-700 dark:text-slate-200">
        Bạn có bao giờ tự hỏi: Tại sao 100.000 đồng hôm nay mua được ít đồ hơn 100.000 đồng của 5 năm trước? Tại sao để tiền trong ngân hàng lại được coi là "lỗ" trong dài hạn? Và làm thế nào để người giàu ngày càng giàu hơn?
      </p>
      
      <p class="mb-6">
        Câu trả lời nằm ở ba khái niệm cốt lõi: <strong>Lạm phát</strong>, <strong>Lãi suất thực</strong> và <strong>Lãi kép</strong>. Bài viết này sẽ giải thích lý do tại sao đầu tư không phải là một sự lựa chọn xa xỉ, mà là một nhu cầu bắt buộc nếu bạn muốn bảo vệ tương lai tài chính của mình.
      </p>

      <div class="my-8 p-6 bg-slate-50 dark:bg-slate-700/30 border-l-4 border-emerald-500 rounded-r-lg">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Kẻ thù vô hình: Lạm phát</h3>
        <p class="text-slate-600 dark:text-slate-300 mb-0">
          Hãy tưởng tượng lạm phát như một con mối mọt, âm thầm gặm nhấm giá trị đồng tiền của bạn mỗi ngày. Tại Việt Nam, lạm phát trung bình thường dao động quanh mức 3-4% mỗi năm. Điều này có nghĩa là, nếu bạn giữ 100 triệu đồng tiền mặt dưới gối, năm sau nó chỉ còn sức mua tương đương khoảng 96 triệu đồng. Sau 10 năm, sức mua đó có thể giảm xuống chỉ còn khoảng 60-70 triệu.
        </p>
      </div>

      <h3 class="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">2. Cái bẫy của Tiền gửi tiết kiệm</h3>
      <p class="mb-4">
        Nhiều người coi gửi tiết kiệm ngân hàng là kênh đầu tư an toàn nhất. Tuy nhiên, hãy nhìn vào công thức:
      </p>
      <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-center font-mono text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mb-6">
        Lãi suất thực = Lãi suất ngân hàng - Lạm phát
      </div>
      <p class="mb-4">
        Nếu ngân hàng trả lãi 6%/năm và lạm phát là 4%/năm, tài sản của bạn thực chất chỉ tăng trưởng <strong>2%</strong>. Đây là mức tăng trưởng quá thấp để tạo ra sự đột phá về tài sản hay đạt được tự do tài chính. Gửi tiết kiệm chỉ giúp bạn <em>giữ tiền</em>, không phải là cách tối ưu để <em>nhân tiền</em>.
      </p>

      <h3 class="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">3. Kỳ quan thứ 8: Lãi suất kép</h3>
      <p class="mb-4">
        Albert Einstein từng gọi lãi suất kép là "kỳ quan thứ 8 của thế giới". Đây là chìa khóa để biến những khoản tiền nhỏ thành gia tài lớn theo thời gian.
      </p>
      <p class="mb-4">
        Khi bạn đầu tư vào cổ phiếu, chứng chỉ quỹ hoặc bất động sản, lợi nhuận sinh ra (cổ tức, tiền lãi) sẽ được tái đầu tư để sinh ra lợi nhuận tiếp theo. Giống như hòn tuyết lăn, ban đầu nó rất nhỏ, nhưng càng lăn lâu, nó càng to ra với tốc độ khủng khiếp.
      </p>
      <ul class="list-disc pl-6 mb-6 space-y-2 text-slate-700 dark:text-slate-300">
        <li><strong>Đầu tư sớm:</strong> Thời gian quan trọng hơn số vốn. Bắt đầu từ năm 20 tuổi với 1 triệu/tháng sẽ hiệu quả hơn nhiều so với bắt đầu từ năm 40 tuổi với 5 triệu/tháng.</li>
        <li><strong>Kỷ luật:</strong> Đầu tư đều đặn (DCA) giúp bạn tận dụng tối đa lãi kép và giảm thiểu rủi ro biến động thị trường.</li>
      </ul>

      <h3 class="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">4. Tại sao lại là Đầu tư Thụ động?</h3>
      <p class="mb-4">
        Trang web này, <strong>Bảng tin Tài chính VN</strong>, được xây dựng dựa trên triết lý của đầu tư thụ động (Passive Investing).
      </p>
      <p class="mb-4">
        Thay vì cố gắng "đánh bại thị trường" bằng cách mua đi bán lại cổ phiếu hàng ngày (điều mà 90% nhà đầu tư cá nhân thất bại), chúng tôi khuyến khích việc nắm giữ dài hạn các <strong>Quỹ hoán đổi danh mục (ETF)</strong> hoặc <strong>Quỹ mở (Mutual Funds)</strong> uy tín.
      </p>
      <p class="mb-4">
        Lịch sử thị trường chứng khoán Việt Nam (VN-Index) cho thấy xu hướng tăng trưởng dài hạn song hành cùng sự phát triển của nền kinh tế. Bằng cách sở hữu một phần của rổ cổ phiếu đại diện cho nền kinh tế (như VN30, VNX50), bạn sẽ được hưởng lợi từ sự tăng trưởng chung đó mà không cần tốn thời gian phân tích từng mã cổ phiếu.
      </p>

      <h3 class="text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">5. Mục đích của trang web này</h3>
      <p class="mb-4">
        Chúng tôi tạo ra <strong>Bảng tin Tài chính VN</strong> không phải để kêu gọi đầu tư hay phím hàng. Mục đích của chúng tôi là:
      </p>
      <ol class="list-decimal pl-6 mb-6 space-y-3 text-slate-700 dark:text-slate-300">
        <li><strong>Minh bạch hóa dữ liệu:</strong> Cung cấp cái nhìn trực quan, trung thực về hiệu suất quá khứ của các quỹ đầu tư tại Việt Nam.</li>
        <li><strong>Công cụ hóa kiến thức:</strong> Cung cấp các công cụ (Máy tính lãi kép, Giả lập đầu tư, Tính toán FIRE) để bạn tự lập kế hoạch cho riêng mình.</li>
        <li><strong>Xây dựng niềm tin:</strong> Chứng minh bằng số liệu rằng đầu tư dài hạn, kỷ luật là con đường chắc chắn nhất để đạt được thịnh vượng.</li>
      </ol>

      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p class="italic text-slate-500 dark:text-slate-400">
          "Cây tốt nhất để trồng là 20 năm trước. Cây tốt thứ hai là ngay bây giờ." - Ngạn ngữ Trung Quốc. Hãy bắt đầu hành trình của bạn bằng việc khám phá các công cụ trên trang web này.
        </p>
      </div>
    `
  }
];

export const MOCK_TOOLS: Tool[] = [
  {
    id: 'compound',
    name: 'Compound Interest Calculator',
    description: '',
    path: '/tools'
  },
  {
    id: 'inflation',
    name: 'Inflation Calculator',
    description: '',
    path: '/tools'
  },
  {
    id: 'fire',
    name: 'FIRE Calculator',
    description: '',
    path: '/tools'
  },
  {
    id: 'goal',
    name: 'Financial Goal Planner',
    description: '',
    path: '/tools'
  },
  {
    id: 'loan',
    name: 'Loan Repayment Schedule',
    description: '',
    path: '/tools'
  }
];

export const CHART_DATA_OVERVIEW = [
  { year: '2018', fund: 100, market: 100 },
  { year: '2019', fund: 112, market: 108 },
  { year: '2020', fund: 125, market: 122 },
  { year: '2021', fund: 168, market: 145 },
  { year: '2022', fund: 128, market: 105 },
  { year: '2023', fund: 145, market: 118 },
  { year: '2024', fund: 172, market: 135 },
];
