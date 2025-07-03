import React, { useEffect, useRef, useState } from 'react';

const ROOMS = ["Ogólny", "Biuro", "Magazyn"];

const ChatBox = ({
  user,
  onClose,
  showChat,
  setHasUnreadChat,
  messages,
  sendMessage,
  currentRoom,
  setCurrentRoom,
  unreadRooms = {}, // <-- dodaj ten props
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      try {
        console.log('Wysyłam wiadomość:', input); // DEBUG
        sendMessage(input);
      } catch (err) {
        console.error('Błąd przy wysyłaniu wiadomości:', err); // DEBUG
        alert('Błąd przy wysyłaniu wiadomości!');
      }
      setInput('');
    } else {
      console.log('Nie można wysłać pustej wiadomości'); // DEBUG
    }
  };

  if (!user) {
    console.log('Brak użytkownika, czat niewidoczny'); // DEBUG
    return null;
  }
  
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
      {/* Zakładki pokojów */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, gap: 8 }}>
        {ROOMS.map((room) => (
          <button
            key={room}
            onClick={() => setCurrentRoom(room)}
            style={{
              padding: '4px 14px',
              borderRadius: 8,
              border: 'none',
              background: currentRoom === room ? '#2563eb' : '#eee',
              color: currentRoom === room ? '#fff' : '#333',
              fontWeight: currentRoom === room ? 'bold' : 'normal',
              cursor: 'pointer',
              marginRight: 4,
              position: 'relative',
            }}
          >
            {room}
            {/* Ping zawsze widoczny na każdej zakładce */}
            <span style={{
              position: 'absolute',
              top: 2,
              right: 2,
              display: 'flex',
              height: 12,
              width: 12,
              pointerEvents: 'none',
            }}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>
        ))}
      </div>
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
