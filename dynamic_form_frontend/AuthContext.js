// 'use client';

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [authToken, setAuthToken] = useState(null);
//   const [csrfToken, setCSRFToken] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   // Initial token load
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('authToken');
//       const csrf = localStorage.getItem('csrfToken');

//       if (token && token !== 'null') setAuthToken(token);
//       if (csrf && csrf !== 'null') setCSRFToken(csrf);

//       setIsLoading(false);
//     }
//   }, []);

//   const login = (token, csrf) => {
//     if (!token || token === 'null') return;

//     setAuthToken(token);
//     setCSRFToken(csrf || null);
//     localStorage.setItem('authToken', token);
//     localStorage.setItem('csrfToken', csrf || '');
//   };

//   const logout = () => {
//     setAuthToken(null);
//     setCSRFToken(null);
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('csrfToken');
//     localStorage.removeItem('user');
//     router.push('/');
//   };

//   const navigate = (path) => {
//     router.push(path);
//   };

//   const isAuthenticated = !!authToken && authToken !== 'null';

//   const contextValue = {
//     authToken,
//     csrfToken,
//     isAuthenticated,
//     isLoading,
//     login,
//     logout,
//     navigate,
//   };

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {!isLoading && children}
//     </AuthContext.Provider>
//   );
// };
'use client'; // This directive is correct for Client Components

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initialize authToken and csrfToken to null initially.
  // We will load them from localStorage in a useEffect.
  const [authToken, setAuthToken] = useState(null);
  const [csrfToken, setCSRFToken] = useState(null);
  // isLoading is crucial here to prevent rendering children until tokens are loaded from localStorage
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const [user, setUser] = useState(null); // add this

  const router = useRouter();

  // This useEffect will run *only on the client side* after initial render
useEffect(() => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    const csrf = localStorage.getItem('csrfToken');
    const storedUser = localStorage.getItem('user');

    if (token && token !== 'null') setAuthToken(token);
    if (csrf && csrf !== 'null') setCSRFToken(csrf);
    if (storedUser && storedUser !== 'null') {
      setUser(JSON.parse(storedUser));
    }
  }
  setIsLoading(false);
}, []);// Run only once on client-side mount

const login = (token, csrf, userData) => {
  const actualToken = token && token !== 'null' ? token : null;
  const actualCsrf = csrf && csrf !== 'null' ? csrf : null;

  const normalizedUser = userData ? {
    ...userData,
    full_name: `${userData.first_name} ${userData.last_name}`.trim(),
    role: userData.user_type__name || 'Administrator',
  } : null;

  setAuthToken(actualToken);
  setCSRFToken(actualCsrf);
  setUser(normalizedUser);

  localStorage.setItem('authToken', actualToken || '');
  localStorage.setItem('csrfToken', actualCsrf || '');
  localStorage.setItem('user', JSON.stringify(normalizedUser));
};


const logout = () => {
  setAuthToken(null);
  setCSRFToken(null);
  setUser(null); // add this
  localStorage.removeItem('authToken');
  localStorage.removeItem('csrfToken');
  localStorage.removeItem('user');
  router.push('/');
};

  const navigate = (path) => {
    router.push(path);
  };

  const isAuthenticated = !!authToken;

  const contextValue = {
    authToken,
    csrfToken,
      user,        // add this
    isAuthenticated,
    isLoading, // Provide isLoading to consumers
    login,
    logout,
    navigate,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Only render children when we know whether they are authenticated or not.
          This prevents rendering content that requires authentication (or redirection)
          before the token from localStorage has been read on the client. */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};