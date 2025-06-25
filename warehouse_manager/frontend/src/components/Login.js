import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Zapisz tokeny
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);

        // Pobierz dane użytkownika
        fetch(`${API_URL}/api/auth/user/`, {
          headers: {
            Authorization: `Bearer ${data.access}`,
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((userData) => {
            setUser && setUser({ username: userData.username, email: userData.email });
            navigate('/');
          });
      } else {
        setError('Nieprawidłowy login lub hasło.');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    }
  };

  return (
    <form
      autoComplete="on"
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-24 bg-white p-8 rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Logowanie</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
          {error}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Login</label>
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300"
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-300"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-ocean-600 hover:bg-ocean-700 text-white py-3 rounded-xl font-medium"
      >
        Zaloguj się
      </button>
    </form>
  );
}
