import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Orders from './pages/Order/Orders';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import { jwtDecode } from 'jwt-decode';
import UserProfile from './pages/UserProfile';
import Home from './pages/Home';
import ProtectedRoute from './ProtectedRoute';
import Production from './pages/Production/Production';
import Warehouse from './pages/Warehouse/Warehouse';

import PartsBuilder from './pages/Warehouse/PartsBuilder/PartsBuilder.js';
import ProductsAndGoods from './pages/Warehouse/ProductsAndGoods/ProductsAndGoods.js';
import WarehouseIndex from './pages/Warehouse/WarehouseIndex';
import OrderDetail from './pages/OrderDetails/OrderDetail';
import PartsBuilderIndex from './pages/Warehouse/PartsBuilder/PartsBuilderIndex';
import ComponentsBuilder from './pages/Warehouse/PartsBuilder/ComponentsBuilder';
import ProductBuilder from './pages/Warehouse/PartsBuilder/ProductBuilder';
import ChatBox from './components/ChatBox';
import ChatIcon from './components/ChatIcon';

import ProductionIndex from './pages/Production/ProductionIndex';
import ComponentProduction from './pages/Production/ComponentProduction';
import { API_URL, WS_URL } from './config';

function App() {
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [showChatNotification, setShowChatNotification] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("Ogólny");
  const wsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetch(`${API_URL}/api/auth/user/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (res.status === 401) {
            // Spróbuj odświeżyć token
            const refresh = localStorage.getItem('refresh');
            if (refresh) {
              return fetch(`${API_URL}/api/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh }),
              })
                .then((r) => r.json())
                .then((data) => {
                  if (data.access) {
                    localStorage.setItem('access', data.access);
                    // ponów żądanie z nowym tokenem
                    return fetch(`${API_URL}/api/auth/user/`, {
                      headers: {
                        Authorization: `Bearer ${data.access}`,
                        'Content-Type': 'application/json',
                      },
                    });
                  } else {
                    throw new Error();
                  }
                });
            } else {
              throw new Error();
            }
          }
          return res;
        })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          setUser({ username: data.username, email: data.email });
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  // WebSocket logic - na user i currentRoom
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access');
    if (wsRef.current) wsRef.current.close();
    setChatMessages([]); // czyść wiadomości przy zmianie pokoju
    wsRef.current = new WebSocket(`${WS_URL}/ws/chat/?token=${token}&room=${encodeURIComponent(currentRoom)}`);
    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'chat' || data.type === 'info') {
        setChatMessages((msgs) => [...msgs, data]);
        if (!showChat && data.username !== user?.username) {
          setHasUnreadChat(true);
          setShowChatNotification(true);
          setTimeout(() => setShowChatNotification(false), 3000);
        }
        else {
          setHasUnreadChat(false); 
        }
      }
    };
    return () => wsRef.current && wsRef.current.close();
    // eslint-disable-next-line
  }, [user, currentRoom]);

  // Gdy otwierasz czat, kasuj powiadomienie
  useEffect(() => {
    if (showChat) setHasUnreadChat(false);
  }, [showChat]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-1 max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 pt-20 sm:pt-24 pb-8">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route
              path="/"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <UserProfile user={user} loading={loading} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <ProductionIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production/production"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Production />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production/component-production"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <ComponentProduction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouse"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <WarehouseIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouse/components"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <Warehouse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouse/parts-builder/products"
              element={
                <ProtectedRoute user={user} loading={loading}>
                  <ProductBuilder />
                </ProtectedRoute>
              }
            />
            <Route path="/warehouse/parts-builder" element={<PartsBuilderIndex />} />
            <Route path="/warehouse/products" element={<ProductsAndGoods />} />
            <Route path="/order/:orderId" element={<OrderDetail />} />
            <Route path="/warehouse/parts-builder/parts" element={<PartsBuilder />} />
            <Route path="/warehouse/parts-builder/components" element={<ComponentsBuilder />} />
          </Routes>
        </main>
        <Footer />
        {/* Chat Icon w prawym dolnym rogu */}
        {user && !showChat && (
          <ChatIcon onClick={() => setShowChat(true)} hasUnreadChat={hasUnreadChat} />
        )}
        {/* Okno czatu */}
        {user && showChat && (
          <div
            style={{
              position: 'fixed',
              right: 32,
              bottom: 110,
              zIndex: 10001,
            }}
          >
            <ChatBox
              user={user}
              onClose={() => setShowChat(false)}
              showChat={showChat}
              setHasUnreadChat={setHasUnreadChat}
              messages={chatMessages}
              sendMessage={(msg) => {
                if (wsRef.current && wsRef.current.readyState === 1) {
                  wsRef.current.send(JSON.stringify({ message: msg }));
                }
              }}
              currentRoom={currentRoom}
              setCurrentRoom={setCurrentRoom}
            />
          </div>
        )}
       
      </div>
    </Router>
  );
}

export default App;
