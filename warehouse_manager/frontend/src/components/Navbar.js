import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser && setUser(null);
    navigate("/login");
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-ocean-800 to-ocean-900 shadow-xl fixed w-full z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-white font-bold text-xl tracking-wide">E-Posejdon Produkcja</Link>
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg">Strona główna</Link>
              {user && (
                <>
                  <a href="/user" className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg">
                    Moje konto: {user?.username || user?.user_id}
                  </a>
                  <Link to="/warehouse" className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg">Magazyn</Link>
                  <Link to="/orders" className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg">Zamówienie produkcyjne</Link>
                  <Link to="/production" className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg">Produkcja</Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Wyloguj
                  </button>
                </>
              )}
              {!user && (
                <Link to="/login" className="bg-ocean-500 hover:bg-ocean-600 text-white px-4 py-2 rounded-lg">Zaloguj się</Link>
              )}
            </div>
            {/* Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-ocean-200 hover:text-white focus:outline-none"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-ocean-900 text-white text-base px-4 py-6 space-y-4 fixed top-16 left-0 w-full z-30">
          <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-ocean-800">Strona główna</Link>
          {user ? (
            <>
              <a href="/user" className="block px-4 py-2 rounded-lg hover:bg-ocean-800">
  Moje konto: {user?.username || user?.user_id}
</a>
              <a href="/orders" className="block px-4 py-2 rounded-lg hover:bg-ocean-800">Zamówienia</a>
              <a href="/production" className="block px-4 py-2 rounded-lg hover:bg-ocean-800">Produkcja</a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <a href="/login" className="block px-4 py-2 rounded-lg bg-ocean-500 hover:bg-ocean-600">Zaloguj się</a>
          )}
        </div>
      )}
    </>
  );
}