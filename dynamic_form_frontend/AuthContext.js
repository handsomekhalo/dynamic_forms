'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create context with default values to prevent null errors
const AuthContext = createContext({
  authToken: null,
  csrfToken: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  navigate: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [csrfToken, setCSRFToken] = useState(null);
  const router = useRouter();

  // Initialize from localStorage (only runs client-side)
  useEffect(() => {
    // Next.js specific check to ensure we're on the client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const csrf = localStorage.getItem('csrfToken');
      if (token) setAuthToken(token);
      if (csrf) setCSRFToken(csrf);
    }
  }, []);

  // Update localStorage when authToken changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (authToken) {
        localStorage.setItem('authToken', authToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }, [authToken]);

  // Update localStorage when csrfToken changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (csrfToken) {
        localStorage.setItem('csrfToken', csrfToken);
      } else {
        localStorage.removeItem('csrfToken');
      }
    }
  }, [csrfToken]);

  const login = (token, csrf) => {
    setAuthToken(token);
    setCSRFToken(csrf);
  };

  const logout = () => {
    setAuthToken(null);
    setCSRFToken(null);
    // Optionally navigate to login page after logout
    router.push('/login');
  };

  const navigate = (path) => {
    router.push(path);
  };

  const isAuthenticated = Boolean(authToken);

  return (
    <AuthContext.Provider value={{ 
      authToken, 
      csrfToken, 
      isAuthenticated, 
      login, 
      logout,
      navigate
    }}>
      {children}
    </AuthContext.Provider>
  );
};