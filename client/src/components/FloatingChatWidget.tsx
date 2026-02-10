import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import "./FloatingChatWidget.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Helper: Get or create visitor ID
function getVisitorId(): string {
  let visitorId = localStorage.getItem('turbo_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('turbo_visitor_id', visitorId);
  }
  return visitorId;
}

// Helper: Get or create session ID
async function getSessionId(): Promise<string> {
  let sessionId = localStorage.getItem('turbo_session_id');
  
  if (!sessionId) {
    // Create new session via API
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: getVisitorId(),
          page_url: window.location.href,
          referrer_url: document.referrer || null,
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          user_agent: navigator.userAgent,
          ip_address: null // Backend will capture this
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        sessionId = data.session.session_id;
        localStorage.setItem('turbo_session_id', sessionId);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('[Chat] Session creation failed:', error);
      // Fallback: create local session ID
      sessionId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('turbo_session_id', sessionId);
    }
  }
  
  return sessionId;
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
  const [isLoading, setIsLoading] = useState(false);
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
    if (!currentMessage.trim() || isLoading) return;

    const userMessageContent = currentMessage;
    const userMessage: Message = {
      role: "user",
      content: userMessageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      // Get session ID (creates session if needed)
      const sessionId = await getSessionId();

      // Save user message to database
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          role: 'user',
          content: userMessageContent,
          tokens_used: 0,
          model: null
        })
      });

      // Get AI response from backend
      const aiResponse = await fetch('/api/chat/ai-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessageContent
        })
      });

      if (!aiResponse.ok) {
        throw new Error('AI response failed');
      }

      const aiData = await aiResponse.json();
      const aiMessageContent = aiData.response || "I'm having trouble responding right now. Please try again.";

      // Save AI message to database
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          role: 'assistant',
          content: aiMessageContent,
          tokens_used: aiData.tokens_used || 0,
          model: aiData.model || 'gpt-4'
        })
      });

      // Display AI response
      const aiMessage: Message = {
        role: "assistant",
        content: aiMessageContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('[Chat] Error:', error);
      
      // Fallback response on error
      const errorMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment, or click 'Get Started' on the homepage to begin your case.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
            {isLoading && (
              <div className="chat-message ai-message">
                <div className="message-bubble">Typing...</div>
              </div>
            )}
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
              disabled={isLoading}
            />
            <button 
              className="chat-send-button" 
              onClick={sendMessage}
              disabled={isLoading}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
