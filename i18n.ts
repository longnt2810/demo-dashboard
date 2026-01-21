import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      "meta": {
        "title": "Bảng tin Tài chính VN",
        "description": "Phổ cập dữ liệu tài chính cho nhà đầu tư thụ động tại Việt Nam. Chúng tôi tin vào quyết định dựa trên dữ liệu dài hạn."
      },
      "navigation": {
        "home": "Trang chủ",
        "fund_data": "Dữ liệu Quỹ", 
        "funds": "Danh sách Quỹ",
        "compare": "So sánh Hiệu suất",
        "simulator": "Giả lập Đầu tư",
        "portfolioBuilder": "Xây dựng Danh mục",
        "tools": "Công cụ",
        "insights": "Kiến thức",
        "groups": {
          "investment": "Đầu tư & Tích lũy",
          "utilities": "Tiện ích tài chính"
        },
        "toolItems": {
          "compound": "Tính lãi kép",
          "goal": "Lập kế hoạch mục tiêu",
          "fire": "Tính toán FIRE",
          "inflation": "Tính lạm phát",
          "loan": "Lịch trả nợ vay"
        }
      },
      "footer": {
        "about": "Về chúng tôi",
        "description": "Phổ cập dữ liệu tài chính cho nhà đầu tư thụ động tại Việt Nam. Chúng tôi tin vào quyết định dựa trên dữ liệu dài hạn.",
        "resources": "Tài nguyên",
        "legal": "Cảnh báo pháp lý",
        "legalDesc": "Mọi thông tin chỉ mang tính chất tham khảo giáo dục và không phải là lời khuyên đầu tư. Hiệu suất quá khứ không đảm bảo kết quả tương lai."
      },
      "common": {
        "viewDetails": "Chi tiết",
        "search": "Tìm kiếm...",
        "year": "Năm",
        "month": "Tháng",
        "date": "Ngày",
        "currency": "₫",
        "tools": "Công cụ",
        "simulator": "Giả lập",
        "actions": {
          "continue": "Tiếp tục",
          "cancel": "Hủy bỏ",
          "confirm": "Xác nhận",
          "launch": "Mở công cụ",
          "readMore": "Đọc thêm",
          "back": "Quay lại"
        }
      },
      "pages": {
        "home": {
          "heroTitle": "Hiệu suất Quỹ thụ động tại",
          "heroSubtitle": "Theo dõi, phân tích và mô phỏng lợi nhuận các Quỹ mở và ETF hàng đầu Việt Nam.",
          "simulateBtn": "Mô phỏng Đầu tư",
          "viewFundsBtn": "Xem tất cả Quỹ",
          "disclaimer": "Dữ liệu lịch sử • Không phải lời khuyên đầu tư",
          "rankingTitle": "Xếp hạng Quỹ",
          "marketPerf": "Hiệu suất Thị trường",
          "marketPerfSub": "Giả định 100tr VND đầu tư từ năm 2018",
          "ctaTitle": "Sẵn sàng bắt đầu hành trình?",
          "ctaDesc": "Sử dụng công cụ mô phỏng để thấy sức mạnh của lãi suất kép với các khoản đầu tư hàng tháng.",
          "ctaBtn": "Mô phỏng ngay"
        },
        "homeV2": {
            "title": "Tổng quan Thị trường",
            "subtitle": "Dữ liệu hiệu suất các quỹ đầu tư hàng đầu.",
            "topFunds": "Top Quỹ Tăng Trưởng",
            "riskTitle": "Biểu đồ Rủi ro & Lợi nhuận",
            "riskDesc": "Tương quan giữa Lợi nhuận và Biến động (Rủi ro) trong khung thời gian"
        },
        "dashboard": {
          "title": "Tổng quan Thị trường",
          "subtitle": "Dữ liệu hiệu suất các quỹ đầu tư hàng đầu.",
          "topFunds": "Top Quỹ Tăng Trưởng",
          "period": "Kỳ hạn",
          "riskTitle": "Biểu đồ Rủi ro & Lợi nhuận",
          "riskDesc": "Lợi nhuận cao thường đi kèm rủi ro (biến động) cao."
        },
        "funds": {
          "title": "Danh sách Quỹ",
          "subtitle": "Khám phá và so sánh các quỹ đầu tư tại Việt Nam.",
          "searchPlaceholder": "Tìm theo tên, mã hoặc công ty...",
          "filterAll": "Tất cả",
          "table": {
            "info": "Thông tin Quỹ",
            "type": "Loại",
            "nav": "NAV (VND)",
            "return1Y": "Lãi 1 năm",
            "cagr3Y": "TB năm (3Y)",
            "expense": "Phí QL",
            "action": "Hành động"
          },
          "noFunds": "Không tìm thấy quỹ phù hợp."
        },
        "compare": {
          "title": "So sánh Hiệu suất Quỹ",
          "subtitle": "Phân tích và đối chiếu sự tăng trưởng giữa các quỹ đầu tư khác nhau.",
          "selectFunds": "Chọn quỹ để so sánh",
          "limitReached": "Đã đạt giới hạn",
          "guideBtn": "Hướng dẫn phân loại",
          "closeGuide": "Đóng hướng dẫn",
          "guideTitle": "Giải thích các loại quỹ",
          "growthTitle": "Tăng trưởng (%)",
          "riskTitle": "Rủi ro & Lợi nhuận",
          "riskDesc": "Tương quan giữa Lợi nhuận và Biến động (Rủi ro) trong khung thời gian",
          "annualTitle": "Hiệu suất từng năm (%)",
          "metricsTitle": "Tổng hợp Chỉ số",
          "table": {
            "fund": "Quỹ",
            "1y": "1 Năm",
            "3y": "3 Năm",
            "5y": "5 Năm",
            "volatility": "Biến động",
            "expense": "Phí QL"
          }
        },
        "fundDetail": {
            "back": "Quay lại danh sách",
            "simulate": "Mô phỏng đầu tư quỹ này",
            "inception": "Ngày thành lập",
            "expense": "Phí quản lý",
            "volatility": "Độ biến động (1Y)",
            "benchmark": "Tham chiếu",
            "navHistory": "Lịch sử NAV",
            "metrics": "Hiệu suất",
            "maxDrawdown": "Max Drawdown",
            "drawdownDesc": "Mức sụt giảm tối đa từ đỉnh xuống đáy trong quá khứ."
        },
        "simulator": {
            "title": "Giả lập Đầu tư",
            "subtitle": "Kiểm tra hiệu quả đầu tư định kỳ (DCA) hoặc một lần (Lump-sum) với dữ liệu quá khứ.",
            "params": "Thông tin tính toán",
            "initialInv": "Vốn đầu tư ban đầu",
            "monthlyCont": "Đầu tư hàng tháng",
            "selectFund": "Chọn quỹ để giả lập",
            "chartTitle": "Giá trị tài sản theo thời gian",
            "totalInv": "Tổng vốn đầu tư",
            "totalProfit": "Tổng lợi nhuận",
            "table": {
                "invested": "Vốn đã nộp",
                "value": "Giá trị cuối kỳ"
            },
            "breakdown": "Bảng chi tiết hàng năm"
        },
        "portfolio": {
            "title": "Xây dựng Danh mục",
            "subtitle": "Tối ưu hóa phân bổ tài sản giữa Cổ phiếu và Trái phiếu.",
            "assets": "Tài sản & Tỷ trọng",
            "add": "Thêm quỹ",
            "allocation": "Phân bổ",
            "warningWeight": "Tổng tỷ trọng phải bằng 100%",
            "metrics": {
                "return": "Lợi nhuận kỳ vọng",
                "risk": "Rủi ro dự kiến",
                "ratio": "Hiệu quả"
            },
            "growthChart": "Tăng trưởng giả định",
            "rebalance": "Tái cân bằng hàng năm",
            "riskReduction": "Đa dạng hóa giảm rủi ro"
        },
        "tools": {
            "title": "Công cụ Tài chính",
            "subtitle": "Bộ công cụ giúp bạn tính toán lãi kép, lập kế hoạch hưu trí và vay mua nhà.",
            "compound": {
                "name": "Tính lãi kép",
                "desc": "Xem sức mạnh của lãi suất kép theo thời gian.",
                "explanationTitle": "Lãi suất kép là gì?",
                "explanationDesc": "Lãi suất kép là khi tiền lãi bạn kiếm được tiếp tục sinh ra lãi mới. Theo thời gian, hiệu ứng này giúp tài sản tăng trưởng theo cấp số nhân.",
                "learnMore": "Tìm hiểu thêm",
                "disclaimer": "Kết quả chỉ mang tính tham khảo. Lãi suất thực tế có thể thay đổi tùy thuộc vào thị trường và sản phẩm tài chính.",
                "params": "Thông tin tính toán",
                "initial": "Số tiền ban đầu",
                "cont": "Góp thêm định kỳ",
                "rate": "Lãi suất / Lợi nhuận (%)",
                "period": "Thời gian",
                "freq": "Tần suất góp",
                "reset": "Đặt lại",
                "summary": "Sau {years} năm, bạn sẽ có",
                "earned": "Tiền lãi",
                "chart": "Biểu đồ tăng trưởng",
                "saveGraph": "Lưu biểu đồ",
                "exportExcel": "Xuất Excel"
            },
            "goal": {
                "name": "Lập kế hoạch mục tiêu",
                "desc": "Tính số tiền cần tiết kiệm để đạt mục tiêu tài chính.",
                "target": "Mục tiêu (VND)",
                "current": "Hiện có (VND)",
                "result": "Cần tiết kiệm mỗi {freq}"
            },
            "fire": {
                "name": "Tính toán FIRE",
                "desc": "Khi nào bạn có thể nghỉ hưu sớm?",
                "currentAge": "Tuổi hiện tại",
                "netWorth": "Tài sản ròng hiện tại",
                "income": "Thu nhập",
                "expense": "Chi tiêu",
                "returns": "Lợi nhuận đầu tư (%)",
                "inflation": "Lạm phát (%)",
                "swr": "Tỷ lệ rút tiền an toàn (%)",
                "swrDesc": "Quy tắc 4% thường được sử dụng.",
                "fireNumber": "Con số FIRE",
                "yearsToFire": "Số năm còn lại",
                "savingsRate": "Tỷ lệ tiết kiệm",
                "chartWorth": "Tài sản",
                "chartTarget": "Mục tiêu"
            },
            "inflation": {
                "name": "Tính lạm phát",
                "desc": "Giá trị đồng tiền trong tương lai.",
                "current": "Số tiền hiện tại",
                "rate": "Tỷ lệ lạm phát (%)",
                "exampleTitle": "Chỉ số Phở",
                "exampleDesc": "Giá một bát phở 50k sau {years} năm:",
                "purchasingPower": "Sức mua tương đương",
                "futureCost": "Chi phí tương lai",
                "chartCost": "Chi phí hàng hóa",
                "chartPower": "Sức mua còn lại"
            },
            "loan": {
                "name": "Lịch trả nợ vay",
                "desc": "Tính toán lịch trả nợ vay mua nhà, xe.",
                "amount": "Số tiền vay",
                "rate": "Lãi suất năm (%)",
                "term": "Thời hạn vay",
                "start": "Ngày giải ngân",
                "method": "Phương pháp tính",
                "reducing": "Dư nợ giảm dần",
                "flat": "Dư nợ gốc",
                "estMonthly": "Trả hàng tháng (ước tính)",
                "totalInt": "Tổng lãi phải trả",
                "totalPay": "Tổng gốc + lãi",
                "schedule": "Lịch trả nợ",
                "colBalance": "Dư nợ đầu kỳ",
                "colPrincipal": "Gốc",
                "colInterest": "Lãi",
                "colTotal": "Tổng trả",
                "chartRemaining": "Dư nợ còn lại",
                "chartTotalInterest": "Lãi tích lũy"
            }
        },
        "insights": {
            "title": "Kiến thức & Phân tích",
            "subtitle": "Bài viết chuyên sâu về đầu tư thụ động và tài chính cá nhân.",
            "read": "Đọc tiếp"
        },
        "insightDetail": {
            "notFound": "Không tìm thấy bài viết",
            "return": "Quay lại danh sách",
            "back": "Quay lại"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi", // default language
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;