/**
 * Admin Messaging Component
 * Chat-style interface for admin to communicate with clients
 */

import { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "https://turboresponsehq.ai";

interface Message {
  id: number;
  case_id: number;
  sender: "client" | "admin";
  sender_name?: string;
  message_text?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
}

interface AdminMessagingProps {
  caseId: number;
  clientName: string;
}

export default function AdminMessaging({ caseId, clientName }: AdminMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
    // Mark messages as read when admin opens this
    markAsRead();
  }, [caseId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/case/${caseId}/messages`, {
        withCredentials: true
      });
      setMessages(response.data.messages || []);
      setError(null);
      
      // Mark messages as read when admin opens them
      try {
        await axios.post(`${API_URL}/api/case/${caseId}/messages/mark-read`, {}, {
          withCredentials: true
        });
      } catch (markReadErr) {
        console.error("Failed to mark messages as read:", markReadErr);
        // Don't show error to user, this is a background operation
      }
    } catch (err: any) {
      console.error("Failed to fetch messages:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.post(
        `${API_URL}/api/case/${caseId}/messages/mark-read`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/case/${caseId}/messages`,
        {
          sender: "admin",
          senderName: "Turbo Response Team",
          messageText: newMessage
        },
        { withCredentials: true }
      );

      setMessages([...messages, response.data.message]);
      setNewMessage("");
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Upload file to get PDF URL
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post(
        `${API_URL}/api/upload/single`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      const fileUrl = uploadResponse.data.url;
      const fileName = file.name;

      // Send message with file attachment
      const messageResponse = await axios.post(
        `${API_URL}/api/case/${caseId}/messages`,
        {
          sender: "admin",
          senderName: "Turbo Response Team",
          messageText: `Sent a file: ${fileName}`,
          filePath: fileUrl,
          fileName: fileName,
          fileType: 'application/pdf'
        },
        { withCredentials: true }
      );

      setMessages([...messages, messageResponse.data.message]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error("Failed to upload file:", err);
      setError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        textAlign: "center"
      }}>
        <p style={{ color: "#6b7280" }}>Loading messages...</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "1.5rem",
      border: "1px solid #e5e7eb"
    }}>
      <h3 style={{
        fontSize: "1.125rem",
        fontWeight: 600,
        color: "#111827",
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
      }}>
        💬 Messages with {clientName}
      </h3>

      {error && (
        <div style={{
          padding: "0.75rem",
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          borderRadius: "6px",
          marginBottom: "1rem",
          color: "#991b1b",
          fontSize: "0.875rem"
        }}>
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div style={{
        height: "400px",
        overflowY: "auto",
        marginBottom: "1rem",
        padding: "1rem",
        backgroundColor: "#f9fafb",
        borderRadius: "6px",
        border: "1px solid #e5e7eb"
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
            <p>No messages yet. Start the conversation with {clientName}!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.sender === "admin" ? "flex-end" : "flex-start"
                }}
              >
                <div style={{
                  maxWidth: "70%",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: msg.sender === "admin" ? "#3b82f6" : "white",
                  color: msg.sender === "admin" ? "white" : "#111827",
                  border: msg.sender === "client" ? "1px solid #e5e7eb" : "none",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                }}>
                  <div style={{
                    fontSize: "0.75rem",
                    marginBottom: "0.25rem",
                    opacity: 0.8,
                    fontWeight: 600
                  }}>
                    {msg.sender === "admin" ? "You" : (msg.sender_name || clientName)}
                  </div>
                  {msg.message_text && (
                    <div style={{
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                      whiteSpace: "pre-wrap"
                    }}>
                      {msg.message_text}
                    </div>
                  )}
                  {msg.file_path && (
                    <a
                      href={msg.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        marginTop: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        backgroundColor: msg.sender === "admin" ? "rgba(255,255,255,0.2)" : "#f3f4f6",
                        color: msg.sender === "admin" ? "white" : "#111827",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        textDecoration: "none",
                        fontWeight: 500
                      }}
                    >
                      📎 {msg.file_name || "Download File"}
                    </a>
                  )}
                  <div style={{
                    fontSize: "0.625rem",
                    marginTop: "0.5rem",
                    opacity: 0.7
                  }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {uploading && (
          <div style={{
            padding: "0.75rem",
            backgroundColor: "#eff6ff",
            border: "1px solid #3b82f6",
            borderRadius: "6px",
            color: "#1e40af",
            fontSize: "0.875rem",
            textAlign: "center"
          }}>
            📤 Uploading file...
          </div>
        )}
        <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.75rem" }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending || uploading}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.875rem",
              outline: "none",
              backgroundColor: "white",
              color: "#111827"
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png,.heic,.webp,.tiff,.bmp"
            style={{ display: "none" }}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: uploading ? "#9ca3af" : "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: uploading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap"
            }}
          >
            📎
          </button>
          <button
            type="submit"
            disabled={sending || !newMessage.trim() || uploading}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: sending || !newMessage.trim() || uploading ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: sending || !newMessage.trim() || uploading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
