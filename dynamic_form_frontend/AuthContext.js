// 'use client';

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // Create context with default values to prevent null errors

// const AuthContext = createContext({
//   authToken: null,
//   csrfToken: null,
//   isAuthenticated: false,
//   login: () => {},
//   logout: () => {},
//   navigate: () => {}
// });

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [authToken, setAuthToken] = useState(null);
//   const [csrfToken, setCSRFToken] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const router = useRouter();


//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('authToken');
//       const csrf = localStorage.getItem('csrfToken');
//       console.log('AuthContext initialization - tokens from localStorage:', { token, csrf });
//       if (token) setAuthToken(token);
//       if (csrf) setCSRFToken(csrf);
//       setIsLoading(false);
//     }
//   }, []);


//   // Initialize from localStorage (only runs client-side)
//   useEffect(() => {
//     // Next.js specific check to ensure we're on the client side
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('authToken');
//       const csrf = localStorage.getItem('csrfToken');
//       if (token) setAuthToken(token);
//       if (csrf) setCSRFToken(csrf);
//     }
//   }, []);

//   // Update localStorage when authToken changes
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       if (authToken) {
//         localStorage.setItem('authToken', authToken);
//       } else {
//         localStorage.removeItem('authToken');
//       }
//     }
//   }, [authToken]);

//   // Update localStorage when csrfToken changes
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       if (csrfToken) {
//         localStorage.setItem('csrfToken', csrfToken);
//       } else {
//         localStorage.removeItem('csrfToken');
//       }
//     }
//   }, [csrfToken]);

//   const login = (token, csrf) => {
//     console.log('AuthContext.login called with:', { token, csrf });

//     setAuthToken(token);
//     setCSRFToken(csrf);
//   };

//   const logout = () => {
//     setAuthToken(null);
//     setCSRFToken(null);
//     // Optionally navigate to login page after logout
//     router.push('/login');
//   };

//   const navigate = (path) => {
//     router.push(path);
//   };

//   const isAuthenticated = Boolean(authToken);

//   // return (
//   //   <AuthContext.Provider value={{ 
//   //     authToken, 
//   //     csrfToken, 
//   //     isAuthenticated, 
//   //     login, 
//   //     logout,
//   //     navigate
//   //   }}>
//   //     {children}
//   //   </AuthContext.Provider>
//   // );
//   return (
//     <AuthContext.Provider value={{
//       authToken,
//       csrfToken,
//       isAuthenticated: Boolean(authToken),
//       isLoading,
//       login,
//       logout,
//       navigate
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
// 'use client';

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // Create context with default values to prevent null errors
// const AuthContext = createContext({
//   authToken: null,
//   csrfToken: null,
//   isAuthenticated: false,
//   isLoading: true,
//   login: () => {},
//   logout: () => {},
//   navigate: () => {}
// });

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [authToken, setAuthToken] = useState(null);
//   const [csrfToken, setCSRFToken] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();



// // In your AuthContext.js, update the initialization useEffect:

// useEffect(() => {
//   console.log('-------- AuthContext Initialization Starting --------');
  
//   const initializeAuth = () => {
//     try {
//       if (typeof window !== 'undefined') {
//         console.log('Checking localStorage for tokens');
//         const token = localStorage.getItem('authToken');
//         const csrf = localStorage.getItem('csrfToken');
        
//         console.log('Tokens found in localStorage:', { 
//           authTokenExists: Boolean(token), 
//           csrfTokenExists: Boolean(csrf) 
//         });
        
//         if (token) {
//           console.log('Setting authToken in state from localStorage');
//           setAuthToken(token);
//         } else {
//           console.log('No authToken found in localStorage');
//         }
        
//         if (csrf) {
//           console.log('Setting csrfToken in state from localStorage');
//           setCSRFToken(csrf);
//         } else {
//           console.log('No csrfToken found in localStorage');
//         }
//       }
//     } catch (error) {
//       console.error('Error during AuthContext initialization:', error);
//     } finally {
//       console.log('Setting isLoading to false');
//       setIsLoading(false);
//       console.log('-------- AuthContext Initialization Complete --------');
//     }
//   };
  
//   // Execute initialization
//   initializeAuth();
// }, []);
//   // Update localStorage when authToken changes
//   useEffect(() => {
//     if (typeof window !== 'undefined' && !isLoading) {
//       console.log('authToken changed, updating localStorage:', authToken);
//       if (authToken) {
//         localStorage.setItem('authToken', authToken);
//       } else {
//         localStorage.removeItem('authToken');
//       }
//     }
//   }, [authToken, isLoading]);

//   // Update localStorage when csrfToken changes
//   useEffect(() => {
//     if (typeof window !== 'undefined' && !isLoading) {
//       console.log('csrfToken changed, updating localStorage:', csrfToken);
//       if (csrfToken) {
//         localStorage.setItem('csrfToken', csrfToken);
//       } else {
//         localStorage.removeItem('csrfToken');
//       }
//     }
//   }, [csrfToken, isLoading]);

//   const login = (token, csrf) => {
//     console.log('AuthContext.login called with:', { token, csrf });
    
//     // Validate input
//     if (!token) {
//       console.error('Error: Attempted login with null or empty token');
//       return;
//     }
    
//     // Update state
//     setAuthToken(token);
//     setCSRFToken(csrf || null);
    
//     console.log('Auth state after login update:', { 
//       authToken: token, 
//       csrfToken: csrf,
//       isAuthenticated: Boolean(token)
//     });
//   };

//   const logout = () => {
//     console.log('Logout called, clearing auth state');
//     // Clear state
//     setAuthToken(null);
//     setCSRFToken(null);
    
//     // Clear localStorage
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('csrfToken');
//       localStorage.removeItem('user');
//     }
    
//     // Navigate to login page
//     console.log('Navigating to login page after logout');
//     router.push('/');
//   };

//   const navigate = (path) => {
//     console.log('Navigate called with path:', path);
//     router.push(path);
//   };

//   // Calculate authentication status
//   const isAuthenticated = Boolean(authToken);
  
//   // Log current state (helpful for debugging)
//   console.log('AuthContext current state:', { 
//     authToken, 
//     csrfToken, 
//     isAuthenticated, 
//     isLoading 
//   });

//   return (
//     <AuthContext.Provider value={{
//       authToken,
//       csrfToken,
//       isAuthenticated,
//       isLoading,
//       login,
//       logout,
//       navigate
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [csrfToken, setCSRFToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initial token load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      const csrf = localStorage.getItem('csrfToken');

      if (token && token !== 'null') setAuthToken(token);
      if (csrf && csrf !== 'null') setCSRFToken(csrf);

      setIsLoading(false);
    }
  }, []);

  const login = (token, csrf) => {
    if (!token || token === 'null') return;

    setAuthToken(token);
    setCSRFToken(csrf || null);
    localStorage.setItem('authToken', token);
    localStorage.setItem('csrfToken', csrf || '');
  };

  const logout = () => {
    setAuthToken(null);
    setCSRFToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('csrfToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const navigate = (path) => {
    router.push(path);
  };

  const isAuthenticated = !!authToken && authToken !== 'null';

  const contextValue = {
    authToken,
    csrfToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    navigate,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
