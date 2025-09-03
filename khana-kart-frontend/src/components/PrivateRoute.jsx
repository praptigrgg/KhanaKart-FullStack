import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, requiredRole }) {
  const { token, role, loading } = useAuth();

  if (loading) return <p>Loading user...</p>;

  if (!token) return <Navigate to="/login" />;  // If not authenticated, redirect to login

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;  // If role doesn't match, redirect to home or some other page
  }

  return children;
}
