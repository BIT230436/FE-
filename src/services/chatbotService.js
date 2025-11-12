// src/services/chatbotService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserIdSafe() {
  const { user } = useAuthStore.getState();
  return user?.id || null; // nếu chưa đăng nhập -> null
}

export async function askGemini(prompt, conversationId = null) {
  if (!prompt || prompt.trim() === "") {
    throw new Error("Nội dung prompt không được để trống.");
  }

  const userId = getCurrentUserIdSafe();

  try {
    const response = await api.post("/chatbot/ask", {
      prompt,
      conversationId,
      userId,
    });

    // ✅ Sau khi nhận response từ Gemini
    let answer = response.data.response || "";

    // ✅ Làm sạch markdown và ký tự đặc biệt
    answer = answer
      .replace(/\*\*/g, "") // bỏ các dấu ** in đậm
      .replace(/__+/g, "") // bỏ gạch dưới kép nếu có
      .replace(/#+\s?/g, "") // bỏ tiêu đề markdown (# Heading)
      .replace(/\*\s*/g, "• ") // chuyển * đầu dòng thành bullet
      .trim();

    // ✅ Nếu quá dài thì rút ngắn
    if (answer.length > 800) {
      answer =
        answer
          .replace(/\s+/g, " ") // bỏ thừa khoảng trắng
          .replace(/---/g, "\n") // giữ phần tách
          .split("\n")
          .slice(0, 6)
          .join("\n") + "\n...";
    }

    return {
      answer,
      conversationId: response.data.conversationId,
    };
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    throw (
      error.response?.data?.error ||
      "Đã xảy ra lỗi khi kết nối tới chatbot server."
    );
  }
}
