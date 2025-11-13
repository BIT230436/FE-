// src/components/ChatbotWidget.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import { askGemini } from "../../services/chatbotService";
import "./Chatbot.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatbotWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hàm decode JWT token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Kiểm tra xem có nên hiển thị chatbot không
  const shouldShowChatbot = () => {
    // Thử lấy user từ nhiều nguồn
    const userStr = localStorage.getItem("user");
    const authStorageStr = localStorage.getItem("auth-storage");

    let user = null;
    let token = null;

    // Thử parse từ auth-storage (Zustand store)
    try {
      if (authStorageStr) {
        const authStorage = JSON.parse(authStorageStr);
        user = authStorage.state?.user || authStorage.user;
        token = authStorage.state?.token || authStorage.token;
      }
    } catch (e) {
      console.error("Parse auth-storage error:", e);
    }

    // Fallback: thử parse từ localStorage user
    if (!user) {
      try {
        if (userStr && userStr !== "{}") {
          user = JSON.parse(userStr);
        }
      } catch (e) {
        console.error("Parse user error:", e);
      }
    }

    // Thử decode từ token nếu chưa có user
    if (!user && token) {
      const decoded = decodeToken(token);
      if (decoded) {
        user = decoded;
      }
    }

    // Kiểm tra nếu đang ở trang login
    const isLoginPage =
      location.pathname === "/login" || location.pathname === "/";

    // Debug
    console.log("=== CHATBOT DEBUG ===");
    console.log("Path:", location.pathname);
    console.log("Auth storage:", authStorageStr);
    console.log("Final user object:", user);
    console.log("User role:", user?.role);
    console.log("User roles:", user?.roles);

    // Kiểm tra xem user có data thực sự không
    const hasUserData =
      user && Object.keys(user).length > 0 && (user.role || user.roles);

    // Nếu chưa đăng nhập, chỉ hiển thị ở trang login
    if (!hasUserData) {
      console.log("-> Show on login page:", isLoginPage);
      return isLoginPage;
    }

    // Kiểm tra role (có thể là role hoặc roles array)
    const allowedRoles = ["intern", "user", "INTERN", "USER", "Intern", "User"];
    let shouldShow = false;

    if (user.role) {
      shouldShow = allowedRoles.includes(user.role);
    } else if (user.roles && Array.isArray(user.roles)) {
      shouldShow = user.roles.some((r) => allowedRoles.includes(r));
    }

    console.log("-> Should show for role:", shouldShow);
    return shouldShow;
  };

  // Đóng chatbot khi chuyển trang không được phép
  useEffect(() => {
    if (!shouldShowChatbot()) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await askGemini(userMessage.content, conversationId);

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Error sending message:", err);

      const errorMsg =
        typeof err === "string"
          ? err
          : err.message || "Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.";

      setError(errorMsg);

      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: errorMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Xin chào! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn?",
        timestamp: new Date(),
      },
    ]);
    setConversationId(null);
    setError(null);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Không render gì nếu không được phép hiển thị
  if (!shouldShowChatbot()) {
    return null;
  }

  return (
    <>
      {/* Nút mở chatbot */}
      <button
        className={`chatbot-toggle-btn ${isOpen ? "hidden" : ""}`}
        onClick={toggleChat}
        aria-label="Mở chat"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
        >
          <path
            d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM6 9H18V11H6V9ZM14 14H6V12H14V14ZM18 8H6V6H18V8Z"
            fill="currentColor"
          />
        </svg>
        <span className="notification-badge">1</span>
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="chatbot-widget">
          <div className="chatbot-container">
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-avatar">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="chatbot-header-text">
                  <h3>Trợ lý AI</h3>
                  <span className="chatbot-status">
                    <span className="status-dot"></span> Đang hoạt động
                  </span>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <button
                  className="clear-chat-btn"
                  onClick={clearChat}
                  title="Xóa lịch sử chat"
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  🗑️
                </button>
                <button
                  className="close-chat-btn"
                  onClick={toggleChat}
                  title="Đóng chat"
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  <span style={{ fontSize: "20px", paddingBottom: "5px" }}>
                    -
                  </span>
                </button>
              </div>
            </div>

            <div className="chatbot-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message message-${message.type}`}
                >
                  <div className="message-avatar">
                    {message.type === "bot" ? (
                      <span style={{ fontSize: "18px" }}>🤖</span>
                    ) : message.type === "error" ? (
                      <span style={{ fontSize: "18px" }}>⚠️</span>
                    ) : (
                      <span style={{ fontSize: "18px" }}>👤</span>
                    )}
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-content markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message message-bot">
                  <div className="message-avatar">
                    <span style={{ fontSize: "18px" }}>🤖</span>
                  </div>
                  <div className="message-content-wrapper">
                    <div className="message-content typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form className="chatbot-input-form" onSubmit={handleSubmit}>
              <div className="input-wrapper">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn của bạn..."
                  rows="1"
                  disabled={isLoading}
                  className="chatbot-input"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="send-button"
                >
                  <span style={{ fontSize: "20px" }}>➤</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
