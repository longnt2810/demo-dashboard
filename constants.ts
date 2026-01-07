
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
    id: '1',
    title: 'Hiểu về Tỷ lệ chi phí (Expense Ratio) tại Việt Nam',
    summary: 'Tại sao việc trả phí 2% so với 0.6% tạo ra sự khác biệt lớn sau 20 năm.',
    date: '12 Th10, 2023',
    readTime: '5 phút đọc',
    content: `
      <p class="mb-4">Khi đầu tư vào các quỹ mở hoặc ETF, nhiều nhà đầu tư thường chỉ tập trung vào lợi nhuận quá khứ mà bỏ qua một yếu tố quan trọng không kém: <strong>Chi phí (Expense Ratio)</strong>.</p>
      
      <h3 class="text-xl font-bold mt-6 mb-3">Tỷ lệ chi phí là gì?</h3>
      <p class="mb-4">Tỷ lệ chi phí là khoản phí hàng năm mà quỹ thu để trang trải các chi phí vận hành, quản lý và marketing. Khoản phí này được khấu trừ trực tiếp vào tài sản ròng (NAV) của quỹ mỗi ngày, nghĩa là bạn sẽ không thấy nó trong sao kê giao dịch, nhưng nó âm thầm làm giảm lợi nhuận của bạn.</p>

      <h3 class="text-xl font-bold mt-6 mb-3">Tác động của 1% chênh lệch</h3>
      <p class="mb-4">Hãy tưởng tượng bạn đầu tư 1 tỷ đồng trong 20 năm với lợi nhuận gộp 10%/năm.</p>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>Quỹ A (Phí 0.6%):</strong> Lợi nhuận thực nhận là 9.4%. Sau 20 năm, bạn có khoảng <strong>6.03 tỷ đồng</strong>.</li>
        <li><strong>Quỹ B (Phí 2.0%):</strong> Lợi nhuận thực nhận là 8.0%. Sau 20 năm, bạn có khoảng <strong>4.66 tỷ đồng</strong>.</li>
      </ul>
      <p class="mb-4">Sự chênh lệch chỉ 1.4% phí dẫn đến sự khác biệt gần <strong>1.4 tỷ đồng</strong> tiền mặt sau 20 năm. Đó là cái giá của chi phí quản lý cao.</p>

      <h3 class="text-xl font-bold mt-6 mb-3">Thực trạng tại Việt Nam</h3>
      <p class="mb-4">Tại Việt Nam, các quỹ ETF thường có mức phí thấp hơn (khoảng 0.5% - 0.8%), trong khi các quỹ mở chủ động thường thu phí cao hơn (1.5% - 2.5%) với lời hứa sẽ đánh bại thị trường.</p>
      <p class="mb-4">Tuy nhiên, dữ liệu lịch sử cho thấy rất ít quỹ chủ động có thể chiến thắng thị trường một cách nhất quán sau khi trừ đi các khoản phí này trong dài hạn.</p>

      <h3 class="text-xl font-bold mt-6 mb-3">Lời khuyên</h3>
      <p class="mb-4">Hãy luôn kiểm tra mục "Phí quản lý" hoặc "Tỷ lệ chi phí" trong bản cáo bạch của quỹ trước khi xuống tiền. Trong đầu tư thụ động, chi phí là yếu tố duy nhất bạn có thể kiểm soát hoàn toàn.</p>
    `
  },
  {
    id: '2',
    title: 'ETF vs Quỹ Mở: Lựa chọn nào cho bạn?',
    summary: 'So sánh về thanh khoản, chi phí và sai số mô phỏng (tracking error).',
    date: '28 Th09, 2023',
    readTime: '7 phút đọc',
    content: `
      <p class="mb-4">Trên thị trường chứng khoán Việt Nam, hai loại hình quỹ phổ biến nhất dành cho nhà đầu tư cá nhân là <strong>ETF (Quỹ hoán đổi danh mục)</strong> và <strong>Quỹ mở (Mutual Fund)</strong>. Dù cả hai đều giúp đa dạng hóa danh mục, cơ chế hoạt động của chúng rất khác nhau.</p>

      <h3 class="text-xl font-bold mt-6 mb-3">1. Cơ chế giao dịch</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li><strong>ETF:</strong> Giao dịch như một cổ phiếu trên sàn HOSE/HNX. Bạn có thể mua bán ngay lập tức trong giờ giao dịch với giá khớp lệnh thời gian thực.</li>
        <li><strong>Quỹ mở:</strong> Giao dịch trực tiếp với công ty quản lý quỹ. Lệnh thường được chốt vào cuối ngày hoặc ngày làm việc tiếp theo (T+1) dựa trên giá NAV đóng cửa.</li>
      </ul>

      <h3 class="text-xl font-bold mt-6 mb-3">2. Chiến lược đầu tư</h3>
      <p class="mb-4"><strong>ETF</strong> thường là đầu tư <em>thụ động</em>. Mục tiêu của nó là mô phỏng chính xác nhất có thể một chỉ số (như VN30, VNX50). Nếu VN30 tăng 10%, ETF cũng nên tăng khoảng 10% (trừ phí).</p>
      <p class="mb-4"><strong>Quỹ mở</strong> thường là đầu tư <em>chủ động</em>. Các chuyên gia sẽ chọn lọc cổ phiếu để cố gắng đạt lợi nhuận cao hơn thị trường chung. Tuy nhiên, điều này đi kèm rủi ro con người cao hơn.</p>

      <h3 class="text-xl font-bold mt-6 mb-3">3. Chi phí</h3>
      <p class="mb-4">Như đã đề cập ở bài viết trước, ETF thường có lợi thế lớn về chi phí quản lý (0.5% - 0.8%) so với quỹ mở (1.5% - 2.5%). Ngoài ra, ETF không có phí gia nhập/rút vốn (chỉ tốn phí giao dịch chứng khoán nhỏ), trong khi quỹ mở có thể thu phí bán lại nếu bạn rút vốn sớm (thường dưới 1-2 năm).</p>

      <h3 class="text-xl font-bold mt-6 mb-3">Kết luận</h3>
      <p class="mb-4">Nếu bạn tin tưởng vào sự tăng trưởng dài hạn của kinh tế Việt Nam và muốn chi phí thấp nhất, <strong>ETF</strong> là lựa chọn tối ưu. Nếu bạn muốn tìm kiếm cơ hội vượt trội và chấp nhận trả phí cao hơn cho chuyên gia, <strong>Quỹ mở</strong> có thể phù hợp.</p>
    `
  },
  {
    id: '3',
    title: 'Sức mạnh của DCA trong thị trường biến động',
    summary: 'Cách đầu tư hàng tháng giúp làm phẳng các đỉnh và đáy của VN-Index.',
    date: '15 Th09, 2023',
    readTime: '4 phút đọc',
    content: `
      <p class="mb-4">Thị trường chứng khoán Việt Nam nổi tiếng với độ biến động cao. VN-Index có thể tăng 20% trong một tháng nhưng cũng có thể giảm 15% ngay sau đó. Làm thế nào để nhà đầu tư cá nhân tồn tại?</p>
      
      <h3 class="text-xl font-bold mt-6 mb-3">Chiến lược DCA (Dollar-Cost Averaging)</h3>
      <p class="mb-4">DCA, hay Trung bình giá, là chiến lược đầu tư một số tiền cố định vào một khoản đầu tư theo lịch trình định kỳ (ví dụ: 5 triệu đồng vào ngày 15 hàng tháng), bất kể giá cả thị trường đang ra sao.</p>

      <h3 class="text-xl font-bold mt-6 mb-3">Tại sao DCA hiệu quả?</h3>
      <ol class="list-decimal pl-6 mb-4 space-y-2">
        <li><strong>Loại bỏ cảm xúc:</strong> Bạn không cần phải đoán đỉnh hay đáy. Bạn cứ mua đều đặn như một cái máy.</li>
        <li><strong>Mua nhiều hơn khi giá thấp:</strong> Với cùng 5 triệu đồng, khi giá chứng chỉ quỹ thấp, bạn mua được nhiều đơn vị hơn. Khi giá cao, bạn mua được ít hơn. Kết quả là giá vốn trung bình của bạn thường thấp hơn giá trung bình của thị trường.</li>
        <li><strong>Phù hợp với dòng tiền lương:</strong> Đa số chúng ta có thu nhập hàng tháng, vì vậy việc trích một phần để đầu tư ngay khi nhận lương là cách kỷ luật tốt nhất.</li>
      </ol>

      <h3 class="text-xl font-bold mt-6 mb-3">Ví dụ thực tế</h3>
      <p class="mb-4">Giả sử bạn bắt đầu DCA vào đỉnh năm 2022. Mặc dù thị trường giảm mạnh sau đó, nhưng nhờ việc bạn liên tục mua vào ở vùng đáy 2023, tài khoản của bạn có thể đã hòa vốn hoặc có lãi ngay khi thị trường mới chỉ phục hồi nhẹ, trong khi những người "all-in" ở đỉnh vẫn đang lỗ nặng.</p>

      <h3 class="text-xl font-bold mt-6 mb-3">Lời kết</h3>
      <p class="mb-4">Trong đầu tư thụ động, <em>thời gian trên thị trường (time in the market)</em> quan trọng hơn <em>thời điểm vào thị trường (timing the market)</em>. DCA là công cụ giúp bạn duy trì thời gian trên thị trường lâu nhất có thể.</p>
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
