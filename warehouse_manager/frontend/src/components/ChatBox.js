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
  unreadRooms = {},
  users = [],
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [input, setInput] = useState(() => {
    return localStorage.getItem(`chatDraft_${currentRoom}`) || '';
  });
  const messagesEndRef = useRef(null);

  // Zmieniaj draft w localStorage przy każdej zmianie inputa
  useEffect(() => {
    localStorage.setItem(`chatDraft_${currentRoom}`, input);
  }, [input, currentRoom]);

  // Po zmianie pokoju wczytaj draft dla nowego pokoju
  useEffect(() => {
    setInput(localStorage.getItem(`chatDraft_${currentRoom}`) || '');
  }, [currentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      try {
        console.log('Wysyłam wiadomość:', input); // DEBUG
        sendMessage(input, selectedUser);
      } catch (err) {
        console.error('Błąd przy wysyłaniu wiadomości:', err); // DEBUG
        alert('Błąd przy wysyłaniu wiadomości!');
      }
      setInput('');
      localStorage.removeItem(`chatDraft_${currentRoom}`);
    } else {
      console.log('Nie można wysłać pustej wiadomości'); // DEBUG
    }
  };

  if (!user) {
    console.log('Brak użytkownika, czat niewidoczny'); // DEBUG
    return null;
  }

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  const isMyMessage = (msg) => {
    return msg.username === user;
  };

  return (
    <div
      style={{
        width: 380,
        height: 500,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e4e6ea',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0084ff, #00a0ff)',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 14,
            }}
          >
            💬
          </div>
          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            {selectedUser ? `Czat z ${selectedUser}` : `Pokój: ${currentRoom}`}
          </h4>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: 16,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ×
        </button>
      </div>

      {/* Room/User Tabs */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #e4e6ea',
        background: '#f8f9fa'
      }}>
        {/* Room Selection */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#65676b', marginBottom: 6, fontWeight: 600 }}>
            POKOJE
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ROOMS.map((room) => (
              <button
                key={room}
                onClick={() => {
                  setCurrentRoom(room);
                  setSelectedUser(null);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: 'none',
                  background: currentRoom === room && !selectedUser ? '#0084ff' : '#e4e6ea',
                  color: currentRoom === room && !selectedUser ? '#fff' : '#65676b',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* User Selection */}
        {users.filter(u => u !== user).length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#65676b', marginBottom: 6, fontWeight: 600 }}>
              UŻYTKOWNICY
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {users.filter(u => u !== user).map(u => (
                <button
                  key={u}
                  onClick={() => setSelectedUser(u)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: 'none',
                    background: selectedUser === u ? '#0084ff' : '#e4e6ea',
                    color: selectedUser === u ? '#fff' : '#65676b',
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              flexDirection: isMyMessage(msg) ? 'row-reverse' : 'row',
            }}
          >
            {/* Avatar */}
            {!isMyMessage(msg) && (
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: msg.type === 'chat' ? '#0084ff' : '#42b883',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                {msg.type === 'chat' ? getInitials(msg.username) : 'ℹ'}
              </div>
            )}

            {/* Message Bubble */}
            <div
              style={{
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: 18,
                background: isMyMessage(msg) 
                  ? 'linear-gradient(135deg, #0084ff, #00a0ff)' 
                  : msg.type === 'chat' 
                    ? '#f0f0f0' 
                    : '#e8f5e8',
                color: isMyMessage(msg) ? 'white' : '#1c1e21',
                fontSize: 14,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {msg.type !== 'chat' && (
                <div style={{ 
                  fontSize: 11, 
                  opacity: 0.7, 
                  marginBottom: 2,
                  fontStyle: 'italic'
                }}>
                  Informacja systemowa
                </div>
              )}
              {!isMyMessage(msg) && msg.type === 'chat' && (
                <div style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  marginBottom: 2,
                  color: '#0084ff'
                }}>
                  {msg.username}
                </div>
              )}
              <div>{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ 
        padding: '12px 16px', 
        borderTop: '1px solid #e4e6ea',
        background: '#f8f9fa'
      }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ 
            flex: 1, 
            position: 'relative',
            background: 'white',
            borderRadius: 20,
            border: '1px solid #e4e6ea',
            overflow: 'hidden'
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ 
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                background: 'transparent',
                boxSizing: 'border-box'
              }}
              placeholder="Napisz wiadomość..."
            />
          </div>
          <button 
            type="submit" 
            disabled={!input.trim()}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: input.trim() ? 'linear-gradient(135deg, #0084ff, #00a0ff)' : '#e4e6ea',
              color: input.trim() ? 'white' : '#bcc0c4',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              transition: 'all 0.2s',
            }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
