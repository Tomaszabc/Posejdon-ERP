import React, { useEffect, useRef, useState } from 'react';

const ChatBox = ({ user, onClose, showChat, setHasUnreadChat, messages, sendMessage }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  if (!user) return null;

  return (
    <div
      style={{
        width: 400,
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 2px 16px #0002',
        padding: 20,
        position: 'relative',
      }}
    >
      {/* Przycisk zamykania */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'transparent',
          border: 'none',
          fontSize: 22,
          cursor: 'pointer',
          color: '#888',
        }}
        aria-label="Zamknij czat"
      >
        ×
      </button>
      <h4 style={{ textAlign: 'center' }}>Czat wewnętrzny</h4>
      <div
        style={{
          height: 200,
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: 10,
          marginBottom: 10,
          background: '#fafbfc',
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.type === 'chat' ? <b>{msg.username}:</b> : <i style={{ color: '#888' }}>[info]</i>}{' '}
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: 5 }}
          placeholder="Napisz wiadomość..."
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Wyślij
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
