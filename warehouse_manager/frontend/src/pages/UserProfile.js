import React, { useEffect, useState } from 'react';

export default function UserProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access');
    fetch('http://localhost:8000/api/auth/user/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, []);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg('');
    if (passwords.new_password !== passwords.confirm_new_password) {
      setMsg('Nowe hasła nie są identyczne.');
      return;
    }
    const token = localStorage.getItem('access');
    const res = await fetch('http://localhost:8000/api/auth/password/change/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_password: passwords.old_password,
        new_password1: passwords.new_password,
        new_password2: passwords.confirm_new_password,
      }),
    });
    if (res.ok) {
      setMsg('Hasło zostało zmienione.');
      setPasswords({ old_password: '', new_password: '', confirm_new_password: '' });
    } else {
      setMsg('Błąd zmiany hasła. Sprawdź stare hasło.');
    }
  };

  // ...existing code...
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-2 bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-ocean-900 text-center">
          Moje konto
        </h2>
        {!profile ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <div className="text-lg font-semibold text-ocean-800">Nazwa użytkownika</div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700">
                    {profile.username}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-ocean-800">Email</div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700">
                    {profile.email}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-ocean-800">Data utworzenia konta</div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700">
                    {profile.date_joined
                      ? new Date(profile.date_joined).toLocaleString('pl-PL')
                      : 'brak danych'}
                  </div>
                </div>
              </div>

              <div className="lg:border-l lg:pl-8">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="text-xl font-semibold text-ocean-800 mb-4">Zmień hasło</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stare hasło
                    </label>
                    <input
                      type="password"
                      name="old_password"
                      value={passwords.old_password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nowe hasło
                    </label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwords.new_password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Powtórz nowe hasło
                    </label>
                    <input
                      type="password"
                      name="confirm_new_password"
                      value={passwords.confirm_new_password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Zmień hasło
                  </button>
                  {msg && (
                    <div className="mt-4 p-4 rounded-lg bg-ocean-50 text-ocean-700 border border-ocean-200">
                      {msg}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
