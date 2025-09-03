import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <p>Loading user...</p>;

  if (!token) return <Navigate to="/login" />;

  return children;
}
