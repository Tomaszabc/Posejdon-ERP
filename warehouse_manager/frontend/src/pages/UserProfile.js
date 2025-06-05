import React, { useEffect, useState } from "react";

export default function UserProfile({ user }) {
  const [profile, setProfile] = useState(null);
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: ""
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");
    fetch("http://localhost:8000/api/auth/user/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  const handleChange = e => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    setMsg("");
    if (passwords.new_password !== passwords.confirm_new_password) {
      setMsg("Nowe hasła nie są identyczne.");
      return;
    }
    const token = localStorage.getItem("access");
    const res = await fetch("http://localhost:8000/api/auth/password/change/", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    old_password: passwords.old_password,
    new_password1: passwords.new_password,
    new_password2: passwords.confirm_new_password
  })
});
    if (res.ok) {
      setMsg("Hasło zostało zmienione.");
      setPasswords({ old_password: "", new_password: "", confirm_new_password: "" });
    } else {
      setMsg("Błąd zmiany hasła. Sprawdź stare hasło.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-24 bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-ocean-900">Moje konto</h2>
      {!profile ? (
        <div>Ładowanie...</div>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-lg font-semibold text-ocean-800">Nazwa użytkownika:</div>
            <div className="mb-2 text-gray-700">{profile.username}</div>
            <div className="text-lg font-semibold text-ocean-800">Email:</div>
            <div className="mb-2 text-gray-700">{profile.email}</div>
            <div className="text-lg font-semibold text-ocean-800">Data utworzenia konta:</div>
            <div className="mb-2 text-gray-700">
              {profile.date_joined
                ? new Date(profile.date_joined).toLocaleString("pl-PL")
                : "brak danych"}
            </div>
          </div>
          <hr className="my-6" />
          <form onSubmit={handlePasswordChange}>
            <div className="text-lg font-semibold text-ocean-800 mb-2">Zmień hasło</div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-700">Stare hasło</label>
              <input
                type="password"
                name="old_password"
                value={passwords.old_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-700">Nowe hasło</label>
              <input
                type="password"
                name="new_password"
                value={passwords.new_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1 text-gray-700">Powtórz nowe hasło</label>
              <input
                type="password"
                name="confirm_new_password"
                value={passwords.confirm_new_password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-ocean-600 hover:bg-ocean-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Zmień hasło
            </button>
            {msg && <div className="mt-4 text-ocean-700">{msg}</div>}
          </form>
        </>
      )}
    </div>
  );
}