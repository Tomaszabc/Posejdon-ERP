import React, { useState, useEffect } from 'react';
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

import ProductionIndex from './pages/Production/ProductionIndex';
import ComponentProduction from './pages/Production/ComponentProduction';
import { API_URL, WS_URL } from './config';

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Użyj tego samego tokena co w logowaniu
    const token = localStorage.getItem('access');
    if (token) {
      fetch(`${API_URL}/api/auth/user/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => setUser({ username: data.username, email: data.email }))
        .catch(() => setUser(null));
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-1 max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 pt-20 sm:pt-24 pb-8">
          <Routes>
            <Route path="/login" element={<Login setUser={setUser} />} />
            {/* Chronione trasy */}
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute user={user}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user"
              element={
                <ProtectedRoute user={user}>
                  <UserProfile user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production"
              element={
                <ProtectedRoute user={user}>
                  <ProductionIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production/production"
              element={
                <ProtectedRoute user={user}>
                  <Production />
                </ProtectedRoute>
              }
            />
            <Route
              path="/production/component-production"
              element={
                <ProtectedRoute user={user}>
                  <ComponentProduction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouse"
              element={
                <ProtectedRoute user={user}>
                  <WarehouseIndex />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouse/components"
              element={
                <ProtectedRoute user={user}>
                  <Warehouse />
                </ProtectedRoute>
              }
            />
            <Route
              path="/warehouse/parts-builder/products"
              element={
                <ProtectedRoute user={user}>
                  <ProductBuilder />
                </ProtectedRoute>
              }
            />
            <Route path="/warehouse/parts-builder" element={<PartsBuilderIndex />} />
            <Route path="/warehouse/products" element={<ProductsAndGoods />} />
            <Route path="/order/:orderId" element={<OrderDetail />} />

            <Route path="/warehouse/parts-builder/parts" element={<PartsBuilder />} />
            <Route path="/warehouse/parts-builder/components" element={<ComponentsBuilder />} />
            {/* ...inne chronione trasy w ten sam sposób... */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
