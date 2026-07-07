// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // brief flash while the silent session-restore check runs on page load
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09050e]">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // remember where they were trying to go, so login can send them back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}