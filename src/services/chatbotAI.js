// services/chatbotAI.js

/**
 * Dữ liệu huấn luyện cho chatbot
 */
export const trainingData = {
  greetings: {
    patterns: [
      "xin chào",
      "chào",
      "hello",
      "hi",
      "hey",
      "chào bạn",
      "good morning",
      "good afternoon",
      "good evening",
    ],
    responses: [
      "Xin chào! Tôi có thể giúp gì cho bạn?",
      "Chào bạn! Rất vui được hỗ trợ bạn hôm nay.",
      "Hi! Tôi là trợ lý ảo, sẵn sàng giúp đỡ bạn.",
    ],
    context: "greeting",
  },

  products: {
    patterns: [
      "sản phẩm",
      "dịch vụ",
      "cung cấp gì",
      "làm gì",
      "product",
      "service",
      "tính năng",
    ],
    responses: [
      "Chúng tôi cung cấp các dịch vụ quản lý thực tập sinh, theo dõi tiến độ học tập và hỗ trợ đào tạo. Bạn muốn biết chi tiết về dịch vụ nào?",
      "Hệ thống của chúng tôi bao gồm: Quản lý thực tập sinh, Báo cáo tiến độ, Đánh giá kết quả và Hỗ trợ mentor. Bạn quan tâm phần nào?",
    ],
    context: "product_inquiry",
  },

  pricing: {
    patterns: [
      "giá",
      "chi phí",
      "phí",
      "bao nhiêu tiền",
      "price",
      "cost",
      "giá cả",
      "mức phí",
      "pricing",
      "báo giá",
    ],
    responses: [
      "Để biết thông tin chi tiết về giá cả và các gói dịch vụ, vui lòng liên hệ bộ phận kinh doanh qua email hoặc hotline.",
      "Chúng tôi có nhiều gói dịch vụ phù hợp với từng nhu cầu. Để được tư vấn cụ thể, vui lòng liên hệ bộ phận kinh doanh.",
    ],
    context: "pricing_inquiry",
  },

  technical_support: {
    patterns: [
      "lỗi",
      "bug",
      "không hoạt động",
      "bị lỗi",
      "error",
      "hỏng",
      "sự cố",
      "technical",
      "kỹ thuật",
      "hỗ trợ",
    ],
    responses: [
      "Tôi rất tiếc khi bạn gặp sự cố. Bạn có thể mô tả chi tiết vấn đề để tôi hỗ trợ tốt hơn không?",
      "Để được hỗ trợ kỹ thuật nhanh nhất, vui lòng mô tả chi tiết vấn đề hoặc gửi ảnh chụp màn hình.",
    ],
    context: "technical_support",
  },

  account: {
    patterns: [
      "đăng ký",
      "tạo tài khoản",
      "đăng nhập",
      "login",
      "register",
      "sign up",
      "sign in",
      "quên mật khẩu",
      "reset password",
    ],
    responses: [
      'Để đăng ký tài khoản, bạn vui lòng nhấn nút "Đăng ký" trên trang chủ và điền thông tin cá nhân.',
      'Nếu quên mật khẩu, bạn có thể chọn "Quên mật khẩu" ở trang đăng nhập và làm theo hướng dẫn qua email.',
    ],
    context: "account_management",
  },

  thanks: {
    patterns: ["cảm ơn", "thanks", "thank you", "thank"],
    responses: [
      "Rất vui được giúp đỡ bạn! Nếu có thắc mắc gì khác, đừng ngại hỏi nhé.",
      "Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn.",
    ],
    context: "thanks",
  },

  goodbye: {
    patterns: ["tạm biệt", "bye", "goodbye", "hẹn gặp lại", "see you"],
    responses: [
      "Tạm biệt! Chúc bạn một ngày tốt lành!",
      "Hẹn gặp lại bạn! Nếu cần hỗ trợ, hãy quay lại nhé.",
    ],
    context: "goodbye",
  },

  contact: {
    patterns: [
      "liên hệ",
      "contact",
      "hotline",
      "email",
      "địa chỉ",
      "phone",
      "số điện thoại",
    ],
    responses: [
      "Bạn có thể liên hệ với chúng tôi qua email: support@company.com hoặc hotline: 1900-xxxx",
      "Thông tin liên hệ: Email: support@company.com, Hotline: 1900-xxxx, Giờ làm việc: 8:00 - 17:30 (T2-T6)",
    ],
    context: "contact_info",
  },
};

/**
 * Tìm ý định (intent) từ tin nhắn
 */
export const findIntent = (message) => {
  if (!message || typeof message !== "string") {
    return null;
  }

  const normalizedMessage = message.toLowerCase().trim();
  let bestMatch = null;
  let highestScore = 0;

  try {
    for (const [intentName, intentData] of Object.entries(trainingData)) {
      const score = intentData.patterns.reduce((acc, pattern) => {
        if (normalizedMessage.includes(pattern.toLowerCase())) {
          return acc + 1;
        }
        return acc;
      }, 0);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = { name: intentName, data: intentData };
      }
    }

    return bestMatch;
  } catch (error) {
    console.error("Lỗi trong findIntent:", error);
    return null;
  }
};

/**
 * Sinh phản hồi từ intent
 */
export const generateResponse = (intent) => {
  try {
    if (!intent || !intent.data) {
      return {
        text: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể diễn đạt lại được không?",
        context: "unknown",
      };
    }

    const responses = intent.data.responses;
    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    return {
      text: randomResponse,
      context: intent.data.context,
    };
  } catch (error) {
    console.error("Lỗi trong generateResponse:", error);
    return {
      text: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.",
      context: "error",
    };
  }
};

/**
 * Xử lý tin nhắn
 */
export const processMessage = (message, conversationHistory = []) => {
  try {
    const intent = findIntent(message);
    const response = generateResponse(intent);

    return {
      ...response,
      intent: intent?.name || "unknown",
      confidence: intent ? "high" : "low",
    };
  } catch (error) {
    console.error("Lỗi trong processMessage:", error);
    return {
      text: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.",
      context: "error",
      intent: "error",
      confidence: "low",
    };
  }
};

/**
 * Cấu hình API
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8090/api",

  endpoints: {
    SEND_MESSAGE: "/chatbot/message",
    GET_HISTORY: "/chatbot/history",
    SAVE_FEEDBACK: "/chatbot/feedback",
    GET_FAQ: "/chatbot/faq",
    CONNECT_HUMAN: "/chatbot/connect-support",
  },

  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * Dịch vụ API
 */
export const chatbotAPI = {
  sendMessage: async (message, userId, conversationId = null) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.endpoints.SEND_MESSAGE}`,
        {
          method: "POST",
          headers: {
            ...API_CONFIG.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            message,
            userId,
            conversationId,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      throw error;
    }
  },

  getHistory: async (userId, limit = 50) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.endpoints.GET_HISTORY}?userId=${userId}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            ...API_CONFIG.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử:", error);
      throw error;
    }
  },

  saveFeedback: async (messageId, rating, comment = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.endpoints.SAVE_FEEDBACK}`,
        {
          method: "POST",
          headers: {
            ...API_CONFIG.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            messageId,
            rating,
            comment,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lưu phản hồi:", error);
      throw error;
    }
  },

  connectToSupport: async (userId, issue) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.endpoints.CONNECT_HUMAN}`,
        {
          method: "POST",
          headers: {
            ...API_CONFIG.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            userId,
            issue,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Lỗi khi kết nối hỗ trợ:", error);
      throw error;
    }
  },
};

/**
 * Các hàm tiện ích
 */
export const chatbotUtils = {
  formatTime: (date) => {
    try {
      if (!date) return "";
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Lỗi khi định dạng thời gian:", error);
      return "";
    }
  },

  formatDate: (date) => {
    try {
      if (!date) return "";
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Lỗi khi định dạng ngày:", error);
      return "";
    }
  },

  isSpam: (message) => {
    try {
      if (!message || typeof message !== "string") return false;

      const spamPatterns = [
        /(.)\1{5,}/,
        /http[s]?:\/\/(?!company\.com)/,
        /\b\d{10,}\b/,
      ];

      return spamPatterns.some((pattern) => pattern.test(message));
    } catch (error) {
      console.error("Lỗi khi kiểm tra spam:", error);
      return false;
    }
  },

  sanitizeMessage: (message) => {
    try {
      if (!message || typeof message !== "string") return "";

      return message
        .trim()
        .replace(/<[^>]*>/g, "")
        .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF.,!?()-]/g, "")
        .substring(0, 500);
    } catch (error) {
      console.error("Lỗi khi làm sạch tin nhắn:", error);
      return message;
    }
  },

  generateConversationId: (userId) => {
    try {
      return `conv_${userId}_${Date.now()}`;
    } catch (error) {
      console.error("Lỗi khi tạo ID cuộc hội thoại:", error);
      return `conv_${Date.now()}`;
    }
  },
};
