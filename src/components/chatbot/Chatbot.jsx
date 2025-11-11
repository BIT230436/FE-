import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  TbMessage2,
  TbSend,
  TbX,
  TbThumbUp,
  TbThumbDown,
} from "react-icons/tb";
import {
  processMessage,
  chatbotAPI,
  chatbotUtils,
} from "../../services/chatbotAI";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [useBackend, setUseBackend] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;
  const userId = user?.id;

  // Only show for INTERN and USER roles
  if (!["INTERN", "USER"].includes(userRole)) {
    return null;
  }

  // Initialize conversation ID
  useEffect(() => {
    if (userId && !conversationId) {
      try {
        setConversationId(chatbotUtils.generateConversationId(userId));
      } catch (err) {
        console.error("Error generating conversation ID:", err);
        setConversationId(`conv_${userId}_${Date.now()}`);
      }
    }
  }, [userId, conversationId]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    setError(null);
  }, []);

  // Generate bot response using local AI
  const generateLocalResponse = useCallback(
    (userMessage) => {
      try {
        const result = processMessage(userMessage, messages);
        return result.text;
      } catch (err) {
        console.error("Error generating local response:", err);
        return "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn.";
      }
    },
    [messages]
  );

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();

      const trimmedMessage = message.trim();
      if (!trimmedMessage || isTyping) return;

      // Validate message
      let isSpamMessage = false;
      try {
        isSpamMessage = chatbotUtils.isSpam(trimmedMessage);
      } catch (err) {
        console.error("Error checking spam:", err);
      }

      if (isSpamMessage) {
        setError("Tin nhắn không hợp lệ. Vui lòng thử lại.");
        return;
      }

      let sanitizedMessage = trimmedMessage;
      try {
        sanitizedMessage = chatbotUtils.sanitizeMessage(trimmedMessage);
      } catch (err) {
        console.error("Error sanitizing message:", err);
      }

      // Add user message
      const userMessage = {
        id: Date.now(),
        text: sanitizedMessage,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setIsTyping(true);
      setError(null);

      try {
        // Generate bot response
        const botText = generateLocalResponse(sanitizedMessage);

        // Simulate typing delay
        const typingDelay = 500 + Math.random() * 500;
        setTimeout(() => {
          const botResponse = {
            id: Date.now() + 1,
            text: botText,
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botResponse]);
          setIsTyping(false);
        }, typingDelay);
      } catch (error) {
        console.error("Error generating response:", error);
        setIsTyping(false);
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    },
    [message, isTyping, generateLocalResponse]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
  );

  // Handle feedback
  const handleFeedback = useCallback(
    async (messageId, rating) => {
      try {
        if (useBackend) {
          await chatbotAPI.saveFeedback(messageId, rating);
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, feedback: rating } : msg
          )
        );
      } catch (error) {
        console.error("Failed to save feedback:", error);
      }
    },
    [useBackend]
  );

  // Connect to human support
  const handleConnectSupport = useCallback(async () => {
    try {
      setIsTyping(true);

      if (useBackend) {
        await chatbotAPI.connectToSupport(
          userId,
          "User requested human support"
        );
      }

      const supportMessage = {
        id: Date.now(),
        text: "Đã chuyển yêu cầu của bạn đến bộ phận hỗ trợ. Chúng tôi sẽ liên hệ lại sớm nhất có thể.",
        sender: "bot",
        timestamp: new Date(),
        isSupport: true,
      };

      setMessages((prev) => [...prev, supportMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Failed to connect to support:", error);
      setIsTyping(false);
      setError("Không thể kết nối với bộ phận hỗ trợ. Vui lòng thử lại sau.");
    }
  }, [userId, useBackend]);

  const formatTime = (date) => {
    try {
      return chatbotUtils.formatTime(date);
    } catch (err) {
      console.error("Error formatting time:", err);
      return new Date(date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <TbMessage2 size={20} />
              </div>
              <div className="chatbot-title">
                <h3>Hỗ trợ trực tuyến</h3>
                <span className="chatbot-status">
                  {useBackend ? "Kết nối server" : "Chế độ offline"}
                </span>
              </div>
            </div>
            <button
              className="close-btn"
              onClick={toggleChat}
              aria-label="Đóng chat"
            >
              <TbX size={20} />
            </button>
          </div>

          {/* Error notification */}
          {error && (
            <div className="chatbot-error">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                  </span>

                  {/* Feedback buttons for bot messages */}
                  {msg.sender === "bot" && !msg.feedback && !msg.isSupport && (
                    <div className="message-feedback">
                      <button
                        className="feedback-btn"
                        onClick={() => handleFeedback(msg.id, "positive")}
                        title="Hữu ích"
                      >
                        <TbThumbUp size={14} />
                      </button>
                      <button
                        className="feedback-btn"
                        onClick={() => handleFeedback(msg.id, "negative")}
                        title="Chưa hữu ích"
                      >
                        <TbThumbDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message bot">
                <div className="message-content typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="chatbot-quick-actions">
            <button
              className="quick-action-btn"
              onClick={handleConnectSupport}
              disabled={isTyping}
            >
              Kết nối hỗ trợ viên
            </button>
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <div className="chatbot-input">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                className="chatbot-message-input"
                maxLength={500}
                disabled={isTyping}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="chatbot-send-button"
                disabled={!message.trim() || isTyping}
                aria-label="Gửi tin nhắn"
              >
                <TbSend size={20} />
              </button>
            </div>
            {message.length > 400 && (
              <div className="character-count">{message.length}/500</div>
            )}
          </div>
        </div>
      ) : (
        <button
          className="chatbot-button"
          onClick={toggleChat}
          aria-label="Mở chat"
        >
          <TbMessage2 size={24} />
          <span className="notification-dot"></span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
