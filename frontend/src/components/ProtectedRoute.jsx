import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps a route that requires sign-in. While the auth state is being restored
// we render nothing; once ready, unauthenticated users are sent to /login with
// the intended destination remembered so we can return them after sign-in.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
