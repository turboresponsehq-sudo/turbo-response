// TEMPORARY: Backend calls removed to fix static build
// TODO: Re-add backend integration after setting up separate backend service

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import "./ChatInterface.css";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm Turbo AI. Backend integration is temporarily disabled. Please check back later.",
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

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      },
    ]);

    setCurrentMessage("");

    // PLACEHOLDER: Add bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Backend integration is temporarily disabled. Your message has been received but cannot be processed yet.",
          timestamp: new Date(),
        },
      ]);
    }, 500);
  };

  return (
    <div className="chat-interface">
      <div className="chat-container">
        <div className="chat-header">
          <h2>💬 Chat with Turbo AI</h2>
          <p>Temporary placeholder - backend integration pending</p>
        </div>

        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.role === "user" ? "user-message" : "assistant-message"}`}
            >
              <div className="message-content">{msg.content}</div>
              <div className="message-timestamp">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} className="send-button">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
