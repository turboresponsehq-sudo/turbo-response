import { useState } from "react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function TurboHQ() {
  const [activeAgent, setActiveAgent] = useState("turbo");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const agents = [
    { id: "turbo", name: "Turbo", icon: "⚡" },
    { id: "case-analyzer", name: "Case Analyzer", icon: "🔍" },
    { id: "business-auditor", name: "Business Auditor", icon: "📊" },
    { id: "market-scout", name: "Market Scout", icon: "🎯" },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/turbo/chat", {
        message: input,
        agent: activeAgent,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error.message || "Failed to get response"}`,
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
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Left Sidebar - Agents */}
      <div
        style={{
          width: "240px",
          backgroundColor: "#1a1d29",
          color: "white",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#00d4ff" }}>
          Turbo Command
        </h2>
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => setActiveAgent(agent.id)}
            style={{
              padding: "0.75rem",
              backgroundColor: activeAgent === agent.id ? "#00d4ff" : "#2a2d3a",
              color: activeAgent === agent.id ? "#1a1d29" : "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "0.875rem",
              fontWeight: activeAgent === agent.id ? "600" : "400",
              transition: "all 0.2s",
            }}
          >
            <span style={{ marginRight: "0.5rem" }}>{agent.icon}</span>
            {agent.name}
          </button>
        ))}
      </div>

      {/* Center - Chat Window */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f1117",
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#1a1d29",
            borderBottom: "1px solid #2a2d3a",
            color: "white",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.125rem" }}>
            {agents.find((a) => a.id === activeAgent)?.icon}{" "}
            {agents.find((a) => a.id === activeAgent)?.name}
          </h3>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#6c757d", marginTop: "2rem" }}>
              <p style={{ fontSize: "1.125rem", margin: 0 }}>
                👋 Welcome to Turbo Command Interface
              </p>
              <p style={{ fontSize: "0.875rem", margin: "0.5rem 0 0 0" }}>
                Select an agent and start chatting
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: msg.role === "user" ? "#00d4ff" : "#1a1d29",
                  color: msg.role === "user" ? "#0f1117" : "white",
                }}
              >
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.75rem",
                    opacity: 0.7,
                  }}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: "#1a1d29",
                  color: "#6c757d",
                }}
              >
                <p style={{ margin: 0 }}>⚡ Turbo is thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#1a1d29",
            borderTop: "1px solid #2a2d3a",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #2a2d3a",
                backgroundColor: "#0f1117",
                color: "white",
                fontSize: "0.875rem",
                resize: "none",
                minHeight: "60px",
                fontFamily: "system-ui, sans-serif",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isLoading || !input.trim() ? "#2a2d3a" : "#00d4ff",
                color: isLoading || !input.trim() ? "#6c757d" : "#0f1117",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "0.875rem",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Analytics */}
      <div
        style={{
          width: "280px",
          backgroundColor: "#1a1d29",
          color: "white",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", color: "#6c757d" }}>
            LAST ANALYSIS
          </h4>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#0f1117",
              borderRadius: "8px",
              border: "1px solid #2a2d3a",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#adb5bd" }}>
              No recent analysis
            </p>
          </div>
        </div>

        <div>
          <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", color: "#6c757d" }}>
            ESTIMATED CONSUMER DAMAGES
          </h4>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#0f1117",
              borderRadius: "8px",
              border: "1px solid #2a2d3a",
            }}
          >
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600", color: "#00d4ff" }}>
              $0
            </p>
          </div>
        </div>

        <div>
          <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.875rem", color: "#6c757d" }}>
            IMPORTANT ALERTS
          </h4>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#0f1117",
              borderRadius: "8px",
              border: "1px solid #2a2d3a",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#adb5bd" }}>
              No active alerts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
