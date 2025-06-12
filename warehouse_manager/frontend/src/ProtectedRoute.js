import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, children }) {
  // Jeśli user === undefined => jeszcze nie wiemy, czy zalogowany (czekamy na fetch)
  // Jeśli user === null => niezalogowany
  // Jeśli user to obiekt => zalogowany

  if (user === undefined) {
    // Możesz dodać spinner lub pusty div
    return <div>Ładowanie...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
