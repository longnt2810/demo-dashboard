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
            "3y": "3 Năm (TB)",
            "5y": "5 Năm (TB)",
            "volatility": "Độ biến động",
            "expense": "Phí Quản lý"
          }
        },
        "fundDetail": {
          "back": "Quay lại danh sách",
          "simulate": "Mô phỏng Quỹ này",
          "inception": "Ngày thành lập",
          "expense": "Phí quản lý",
          "volatility": "Biến động (Năm)",
          "benchmark": "Tham chiếu",
          "navHistory": "Lịch sử NAV (5 Năm)",
          "metrics": "Chỉ số Hiệu suất",
          "maxDrawdown": "Sụt giảm tối đa",
          "drawdownDesc": "Mức giảm lớn nhất từ đỉnh xuống đáy của quỹ trong quá khứ."
        },
        "simulator": {
          "title": "Mô phỏng Đầu tư (Backtest)",
          "subtitle": "Kiểm thử chiến lược đầu tư dựa trên dữ liệu lịch sử.",
          "params": "Thiết lập đầu tư",
          "selectFund": "Chọn Quỹ so sánh",
          "initialInv": "Vốn đầu tư ban đầu (VND)",
          "monthlyCont": "Đầu tư hàng tháng (VND)",
          "totalInv": "Tổng vốn gốc",
          "totalProfit": "Tổng lãi/lỗ",
          "chartTitle": "Tăng trưởng tài sản theo thời gian",
          "breakdown": "Chi tiết",
          "table": {
            "value": "Giá trị"
          }
        },
        "portfolio": {
          "title": "Xây dựng Danh mục Đầu tư",
          "subtitle": "Phối hợp các quỹ để tối ưu hóa lợi nhuận và giảm thiểu rủi ro.",
          "assets": "Tài sản & Tỷ trọng",
          "add": "Thêm quỹ",
          "allocation": "Phân bổ tài sản",
          "warningWeight": "Tổng tỷ trọng phải bằng 100% để phân tích.",
          "metrics": {
              "return": "Lợi nhuận TB (Năm)",
              "risk": "Rủi ro (Độ lệch chuẩn)",
              "ratio": "Tỷ suất Sinh lời / Rủi ro"
          },
          "growthChart": "Tăng trưởng giả định (100tr ban đầu)",
          "rebalance": "Giả định tái cân bằng (Rebalance) hàng ngày.",
          "riskReduction": "Giảm thiểu rủi ro nhờ đa dạng hóa"
        },
        "tools": {
          "title": "Công cụ Tài chính",
          "subtitle": "Các công cụ tính toán đơn giản giúp bạn lập kế hoạch tài chính.",
          "compound": {
            "name": "Tính lãi kép",
            "desc": "Hình dung sức mạnh của lãi kép theo thời gian.",
            "params": "Tham số đầu vào",
            "initial": "Vốn gốc (VND)",
            "cont": "Đóng góp định kỳ (VND)",
            "freq": "Tần suất",
            "rate": "Lãi suất kỳ vọng (%/Năm)",
            "period": "Thời gian (Năm)",
            "reset": "Đặt lại mặc định",
            "summary": "Tổng kết sau {{years}} năm",
            "earned": "Tiền lãi",
            "chart": "Biểu đồ tăng trưởng",
            "saveGraph": "Lưu ảnh",
            "exportExcel": "Xuất Excel"
          },
          "inflation": {
              "name": "Tính lạm phát",
              "desc": "Xem sức mua của tiền bị bào mòn như thế nào theo thời gian.",
              "current": "Số tiền hiện tại (VND)",
              "rate": "Tỷ lệ lạm phát (%/Năm)",
              "purchasingPower": "Sức mua tương đương",
              "futureCost": "Cần có trong tương lai",
              "chartPower": "Sức mua giảm dần",
              "chartCost": "Giá cả tăng lên",
              "exampleTitle": "Ví dụ thực tế: Bát phở",
              "exampleDesc": "Nếu hôm nay một bát phở giá 50,000đ, sau {{years}} năm sẽ có giá:",
              "resultDesc": "Để mua được cùng lượng hàng hóa trị giá {{amount}} hôm nay, bạn sẽ cần {{future}} vào năm {{year}}."
          },
          "fire": {
            "name": "Tính toán FIRE",
            "desc": "Khi nào bạn có thể nghỉ hưu sớm và tự do tài chính?",
            "currentAge": "Tuổi hiện tại",
            "netWorth": "Tài sản ròng hiện tại (VND)",
            "income": "Thu nhập (VND)",
            "expense": "Chi tiêu (VND)",
            "swr": "Quy tắc rút tiền an toàn (%)",
            "swrDesc": "Mặc định 4% (Quy tắc 25 lần).",
            "returns": "Lợi nhuận đầu tư dự kiến (%)",
            "inflation": "Lạm phát dự kiến (%)",
            "savingsRate": "Tỷ lệ tiết kiệm",
            "fireNumber": "Con số FIRE (Mục tiêu)",
            "yearsToFire": "Số năm cần thiết",
            "ageAtFire": "Tuổi nghỉ hưu",
            "chartWorth": "Tài sản ròng",
            "chartTarget": "Mục tiêu FIRE"
          },
          "goal": {
            "name": "Lập kế hoạch mục tiêu",
            "desc": "Bạn cần tiết kiệm bao nhiêu để đạt 10 tỷ?",
            "target": "Mục tiêu tài chính (VND)",
            "current": "Vốn hiện có",
            "result": "Cần tiết kiệm {{freq}}",
            "resultDesc": "để đạt {{amount}} trong {{years}} năm."
          },
          "loan": {
            "name": "Tính lịch trả nợ",
            "desc": "Tính toán khoản trả hàng tháng cho vay mua nhà/xe.",
            "amount": "Số tiền vay (VND)",
            "rate": "Lãi suất (%/Năm)",
            "term": "Thời hạn (Năm)",
            "start": "Ngày giải ngân",
            "method": "Phương pháp tính",
            "reducing": "Dư nợ giảm dần",
            "flat": "Trên dư nợ gốc",
            "totalPay": "Tổng phải trả",
            "totalInt": "Tổng lãi phải trả",
            "estMonthly": "Trả hàng tháng (Ước tính)",
            "schedule": "Lịch trả nợ",
            "colBalance": "Dư nợ",
            "colPrincipal": "Gốc",
            "colInterest": "Lãi",
            "colTotal": "Tổng trả",
            "chartRemaining": "Tiền gốc còn lại",
            "chartTotalInterest": "Tổng lãi đã trả"
          }
        },
        "insights": {
          "title": "Kiến thức & Phân tích",
          "subtitle": "Phân tích dựa trên dữ liệu về đầu tư thụ động.",
          "read": "Đọc bài viết"
        },
        "insightDetail": {
          "back": "Quay lại danh sách",
          "notFound": "Không tìm thấy bài viết",
          "return": "Về trang kiến thức"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "vi",
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;