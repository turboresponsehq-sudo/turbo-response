import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import "./FloatingChatWidget.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey 👋 I'm Turbo AI — your AI-powered consumer defense assistant. Tell me what kind of notice or issue you're facing, and I'll help you fight back against unfair practices.",
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        role: "assistant",
        content: getAIResponse(currentMessage),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Knowledge base responses
    if (input.includes("case") || input.includes("help")) {
      return "If you've received a notice for eviction, debt collection, IRS issues, repossession, or benefits denial, you likely have grounds for a legal response. Click the 'Get Started' button on the homepage to begin your case analysis.";
    }

    if (input.includes("price") || input.includes("cost") || input.includes("free")) {
      return "Turbo Response offers professional legal game plans starting at $149 for case analysis. This is much more affordable than hiring a lawyer who typically charges $250-$500 per letter. Click 'Get Started' to see our pricing options.";
    }

    if (input.includes("time") || input.includes("long")) {
      return "Most game plans are generated within 24-48 hours. Our AI analyzes your case instantly, and our expert team reviews everything to ensure maximum effectiveness before delivery.";
    }

    if (input.includes("eviction") || input.includes("rent")) {
      return "For eviction cases, we can help you draft responses citing tenant rights laws. Start your case analysis now by clicking 'Get Started' on the homepage.";
    }

    if (input.includes("debt") || input.includes("collector")) {
      return "Debt collectors must follow strict rules under the FDCPA. We can help you fight back with professional legal responses. Click 'Get Started' to begin.";
    }

    // Default response
    return "I can help you with evictions, debt collection, IRS issues, and more. To get started with your case, click the 'Get Started' button on the homepage, or tell me more about your specific situation.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button className="floating-chat-button" onClick={toggleChat}>
          <MessageCircle className="chat-icon" />
          <span>Chat with Turbo AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="floating-chat-window">
          {/* Header */}
          <div className="floating-chat-header">
            <div className="chat-title-section">
              <div className="ai-avatar">🤖</div>
              <div>
                <h4>Turbo AI Assistant</h4>
                <span className="status-indicator">Online • Ready to help</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={toggleChat}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="floating-chat-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.role === "user" ? "user-message" : "ai-message"}`}
              >
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="floating-chat-input-area">
            <input
              type="text"
              className="chat-input-field"
              placeholder="Type your question..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="chat-send-button" onClick={sendMessage}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
