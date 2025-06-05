import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import { jwtDecode } from "jwt-decode";


function App() {
  // Przykładowy user, w przyszłości pobierzesz z API lub contextu
  const [user, setUser] = useState(null);

    // Sprawdź token po załadowaniu aplikacji
  useEffect(() => {
  const token = localStorage.getItem("access");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Pobierz dane użytkownika z API
      fetch("http://localhost:8000/api/auth/user/", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  }
})
        .then(res => res.json())
        .then(data => setUser({ username: data.username, email: data.email }))
        .catch(() => setUser({ user_id: decoded.user_id }));
    } catch {
      setUser(null);
    }
  }
}, []);

   return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-1 max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 pt-20 sm:pt-24 pb-8">
          <Routes>
            <Route path="/orders" element={<Orders />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            {/* ...inne trasy... */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;