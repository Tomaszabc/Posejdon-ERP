import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salesDropdownOpen, setSalesDropdownOpen] = useState(false);
  const [mobileSalesDropdownOpen, setMobileSalesDropdownOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser && setUser(null);
    navigate('/login');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <>
      <nav className="bg-gradient-to-r from-ocean-800 to-ocean-900 shadow-xl fixed w-full z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center text-white font-bold text-xl tracking-wide">
               <img
              src="/diffuser_white_small.png"
              alt="Dyfuzor"
              className="inline-block w-8 h-8 ml-2 mr-2 align-middle"
              style={{ borderRadius: '0.5rem' }}
            />
              E-Posejdon
            </Link>
            {/* Desktop menu */}
            <div className="hidden lg:flex items-center space-x-4">
              {user && (
                <Link to="/" className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg">
                  Strona główna
                </Link>
              )}
              {user && (
                <>
                  {/* Dropdown desktop */}
                  <div className="relative">
                    <button
                      onClick={() => setSalesDropdownOpen((v) => !v)}
                      className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg flex items-center focus:outline-none"
                    >
                      Sprzedaż
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {salesDropdownOpen && (
                      <div
                        className="absolute left-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg z-40"
                        onMouseLeave={() => setSalesDropdownOpen(false)}
                      >
                        <a href="#" className="block px-4 py-2 hover:bg-ocean-100">
                          Uruchom dodatek PrintNode
                        </a>
                        <a href="#" className="block px-4 py-2 hover:bg-ocean-100">
                          Uruchom dodatek WfSync
                        </a>
                        <a
                          href="https://panel.baselinker.com/login.php"
                          target="_blank"
                          rel="noopener"
                          className="block px-4 py-2 hover:bg-ocean-100"
                        >
                          Przeglądaj Sprzedaż
                        </a>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/warehouse"
                    className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg"
                  >
                    Magazyn
                  </Link>
                  <Link
                    to="/orders"
                    className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg"
                  >
                    Zamówienie
                  </Link>
                  <Link
                    to="/production"
                    className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg"
                  >
                    Produkcja
                  </Link>
                  <Link
                    to="/user"
                    className="text-ocean-200 hover:text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {capitalize(user?.username || user?.user_id)}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Wyloguj
                  </button>
                </>
              )}
              {!user && (
                <Link
                  to="/login"
                  className="bg-ocean-500 hover:bg-ocean-600 text-white px-4 py-2 rounded-lg"
                >
                  Zaloguj się
                </Link>
              )}
            </div>
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-ocean-200 hover:text-white focus:outline-none"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay - kliknięcie zamyka menu */}
          <div
            className="fixed inset-0 z-20"
            style={{ background: 'rgba(0,0,0,0.01)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu mobilne */}
          <div className="lg:hidden bg-ocean-900 text-white text-base px-4 py-6 space-y-4 fixed top-16 left-0 w-full z-30">
            {user && (
              <Link
                to="/"
                className="block px-4 py-2 rounded-lg hover:bg-ocean-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Strona główna
              </Link>
            )}
            {user ? (
              <>
                {/* Dropdown mobile */}
                <div>
                  <button
                    onClick={() => setMobileSalesDropdownOpen((v) => !v)}
                    className="w-full text-left block px-4 py-2 rounded-lg hover:bg-ocean-800 flex items-center focus:outline-none"
                  >
                    Zarządzanie Sprzedażą
                    <svg
                      className="ml-2 w-4 h-4 inline"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {mobileSalesDropdownOpen && (
                    <div className="pl-4 mt-2 space-y-1">
                      <a href="#" className="block px-4 py-2 rounded-lg hover:bg-ocean-700">
                        Uruchom dodatek PrintNode
                      </a>
                      <a href="#" className="block px-4 py-2 rounded-lg hover:bg-ocean-700">
                        Uruchom dodatek WfSync
                      </a>
                      <a
                        href="https://panel.baselinker.com/login.php"
                        target="_blank"
                        rel="noopener"
                        className="block px-4 py-2 rounded-lg hover:bg-ocean-700"
                      >
                        Sprzedaż
                      </a>
                    </div>
                  )}
                </div>

                <Link
                  to="/warehouse"
                  className="block px-4 py-2 rounded-lg hover:bg-ocean-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Magazyn
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2 rounded-lg hover:bg-ocean-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Zamówienia
                </Link>
                <Link
                  to="/production"
                  className="block px-4 py-2 rounded-lg hover:bg-ocean-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Produkcja
                </Link>
                <Link
                  to="/user"
                  className="block px-4 py-2 rounded-lg hover:bg-ocean-800 flex items-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Moje konto: {capitalize(user?.username || user?.user_id)}
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <a
                href="/login"
                className="block px-4 py-2 rounded-lg bg-ocean-500 hover:bg-ocean-600"
              >
                Zaloguj się
              </a>
            )}
          </div>
        </>
      )}
    </>
  );
}
