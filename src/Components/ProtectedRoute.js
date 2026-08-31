// src/Components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './Pages/Login/Context';

const ProtectedRoute = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  
  // Check if user is authenticated
  const isAuthenticated = authToken !== null && authToken !== undefined && authToken !== '';
  
  // Also check localStorage directly as a fallback
  const localStorageToken = localStorage.getItem('authToken');
  const isLocalAuthenticated = localStorageToken !== null && localStorageToken !== undefined && localStorageToken !== '';
  
  if (!isAuthenticated && !isLocalAuthenticated) {
    // Redirect to login page
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;