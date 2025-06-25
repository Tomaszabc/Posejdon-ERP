import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return <div>Ładowanie...</div>; // lub spinner
  }
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
}
