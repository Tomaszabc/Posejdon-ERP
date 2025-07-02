import React, { useEffect, useRef, useState } from "react";
import { WS_URL } from "../config";

const ChatBox = ({ user, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    ws.current = new WebSocket(`${WS_URL}/ws/chat/`);
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "chat" || data.type === "info") {
        setMessages((msgs) => [...msgs, data]);
      }
    };
    return () => ws.current && ws.current.close();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() && ws.current && ws.current.readyState === 1) {
      ws.current.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  if (!user) return null;

  return (
    <div style={{
      width: 400,
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 2px 16px #0002",
      padding: 20,
      position: "relative"
    }}>
      {/* Przycisk zamykania */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: "none",
          fontSize: 22,
          cursor: "pointer",
          color: "#888"
        }}
        aria-label="Zamknij czat"
      >
        ×
      </button>
      <h4 style={{ textAlign: "center" }}>Czat wewnętrzny</h4>
      <div style={{
        height: 200,
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: 10,
        marginBottom: 10,
        background: "#fafbfc"
      }}>
        {messages.map((msg, idx) =>
          <div key={idx}>
            {msg.type === "chat"
              ? <b>{msg.username}:</b>
              : <i style={{ color: "#888" }}>[info]</i>
            }{" "}
            {msg.message}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: "flex" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: 5 }}
          placeholder="Napisz wiadomość..."
        />
        <button type="submit" style={{ marginLeft: 8 }}>Wyślij</button>
      </form>
    </div>
  );
};

export default ChatBox;