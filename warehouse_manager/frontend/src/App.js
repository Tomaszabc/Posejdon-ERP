import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  // Przykładowy user, w przyszłości pobierzesz z API lub contextu
  const user = { username: "andrzej" };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar user={user} />
      <main className="flex-1 max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 pt-20 sm:pt-24 pb-8">
        {/* Tutaj wklej zawartość dashboardu lub formularza zamówienia */}
        <h1 className="text-3xl font-bold">Witaj w systemie produkcji AFDynamic</h1>
        {/* ... */}
      </main>
      <Footer />
    </div>
  );
}

export default App;