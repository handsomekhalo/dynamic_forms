// // 'use client';

// // import React from 'react';
// // // import Dashboard from './dashboard';
// // import Navbar from './SideBarComponent/navheader';
// // import Sidebar from './SideBarComponent/sidebar';

// // export default function Dashboard() {
// //   return (
// //     <div>
// //       <Navbar />
// //       <Sidebar/>
      
// //       {/* Your dashboard content here */}
// //     </div>
// //   );
// // }

// // 'use client';

// // import React, { useEffect } from 'react';
// // import Navbar from './SideBarComponent/navheader';
// // import Sidebar from './SideBarComponent/sidebar';
// // import { useAuth } from '../../../../../AuthContext'; // Adjust path as needed

// // export default function Dashboard() {
// //   const { authToken, isAuthenticated, navigate } = useAuth();

// //   useEffect(() => {
// //     // Check authentication
// //     if (!authToken || !isAuthenticated) {
// //       console.log('Dashboard: Not authenticated, redirecting to login');
// //       navigate('/login');
// //       return;
// //     }
// //     console.log('Dashboard: User is authenticated', { authToken });
// //   }, [authToken, isAuthenticated, navigate]);

// //   // If not authenticated, you could return null or a loading state
// //   if (!isAuthenticated) {
// //     return <div>Checking authentication...</div>;
// //   }

// //   return (
// //     <div>
// //       <Navbar />
// //       <Sidebar />
// //       {/* Your dashboard content here */}
// //       <div className="p-4 ml-64">
// //         <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
// //         <p>Welcome to your dashboard!</p>
// //       </div>
// //     </div>
// //   );
// // }



// // // 'use client';

// // // import React from 'react';
// // // import Navbar from '../components/Navbar'; // adjust the path if needed
// // // import Dashboard from './dashboard';

// // // export default function DashboardPage() {
// // //   return (
// // //     <div>
// // //       <Navbar />
// // //       <div className="p-8">
// // //         <Dashboard />
// // //       </div>
// // //     </div>
// // //   );
// // // }



// // 'use client';

// // import React, { useEffect, useState } from 'react';
// // import Navbar from './SideBarComponent/navheader';
// // import Sidebar from './SideBarComponent/sidebar';
// // import { useAuth } from '../../../../../AuthContext'; // Adjust path as needed

// // export default function Dashboard() {
// //   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();
// //   const [authChecked, setAuthChecked] = useState(false);

// //   useEffect(() => {
// //     // Skip check if still loading auth state
// //     if (isLoading) {
// //       console.log('Dashboard: Auth context still loading...');
// //       return;
// //     }

// //     console.log('Dashboard: Checking auth status:', { 
// //       isAuthenticated, 
// //       authToken, 
// //       authTokenExists: Boolean(authToken) 
// //     });

// //     // Check authentication
// //     if (!authToken || !isAuthenticated) {
// //       console.log('Dashboard: Not authenticated, redirecting to login');
// //       navigate('/login');
// //       return;
// //     }

// //     console.log('Dashboard: User is authenticated with token:', authToken);
// //     setAuthChecked(true);
// //   }, [authToken, isAuthenticated, navigate, isLoading]);

// //   // Show loading state while checking authentication or loading auth context
// //   if (isLoading) {
// //     return <div className="flex items-center justify-center h-screen">Loading authentication...</div>;
// //   }

// //   // If authentication check failed, show message while redirect happens
// //   if (!authChecked && !isAuthenticated) {
// //     return <div className="flex items-center justify-center h-screen">Checking authentication status...</div>;
// //   }

// //   return (
// //     <div>
// //       <Navbar />
// //       <Sidebar />
// //       <div className="p-4 ml-64">
// //         <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
// //         <p>Welcome to your dashboard!</p>
// //         <div className="mt-4 p-4 bg-gray-100 rounded">
// //           <p className="text-sm text-gray-700">Authentication Status: 
// //             <span className="ml-2 font-medium text-green-600">Authenticated</span>
// //           </p>
// //           {authToken && (
// //             <p className="text-sm text-gray-700 mt-2">
// //               Auth Token: <span className="font-mono bg-gray-200 px-1 rounded">{authToken.substring(0, 15)}...</span>
// //             </p>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // In your Dashboard.js
// // 'use client';

// // import React from 'react';
// // import Navbar from './SideBarComponent/navheader';
// // import Sidebar from './SideBarComponent/sidebar';
// // import ProtectedRoute from '@/app/ProtectedRoute';

// // export default function Dashboard() {
// //   return (
// //     <ProtectedRoute>
// //       <div>
// //         <Navbar />
// //         <Sidebar />
// //         <div className="p-4 ml-64">
// //           <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
// //           <p>Welcome to your dashboard!</p>
// //         </div>
// //       </div>
// //     </ProtectedRoute>
// //   );
// // }

// // 'use client';

// // import React, { useEffect, useState } from 'react';
// // import Navbar from './SideBarComponent/navheader';
// // import Sidebar from './SideBarComponent/sidebar';
// // import { useAuth } from '../../../../../AuthContext'; // Adjust path as needed

// // export default function Dashboard() {
// //   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();
// //   const [authDebugInfo, setAuthDebugInfo] = useState({});

// //   // Comprehensive debug logging
// //   useEffect(() => {
// //     console.log('-------- Dashboard Component Mount --------');
// //     console.log('Initial auth state:', { 
// //       isLoading, 
// //       isAuthenticated, 
// //       authTokenExists: Boolean(authToken),
// //       authToken: authToken ? `${authToken.substring(0, 10)}...` : 'null'
// //     });
    
// //     // Direct localStorage check
// //     if (typeof window !== 'undefined') {
// //       const localAuthToken = localStorage.getItem('authToken');
// //       const localCsrfToken = localStorage.getItem('csrfToken');
// //       const localUser = localStorage.getItem('user');
      
// //       const debugInfo = {
// //         localAuthToken: localAuthToken ? `${localAuthToken.substring(0, 10)}...` : 'null',
// //         localCsrfToken: localCsrfToken ? `${localCsrfToken.substring(0, 10)}...` : 'null',
// //         localUserExists: Boolean(localUser),
// //         authTokenExists: Boolean(authToken),
// //         isAuthenticatedValue: isAuthenticated,
// //         isLoadingValue: isLoading
// //       };
      
// //       console.log('Direct localStorage check:', debugInfo);
// //       setAuthDebugInfo(debugInfo);
// //     }
// //   }, []);

// //   // Authentication check effect
// //   useEffect(() => {
// //     console.log('-------- Auth Status Change Detected --------');
// //     console.log('Current auth state:', { 
// //       isLoading, 
// //       isAuthenticated, 
// //       authTokenExists: Boolean(authToken) 
// //     });

// //     // Only perform check when loading is complete
// //     if (!isLoading) {
// //       if (!isAuthenticated) {
// //         console.log('Not authenticated after loading complete, preparing redirect');
        
// //         // Double-check localStorage directly
// //         const localAuthToken = localStorage.getItem('authToken');
// //         console.log('Final localStorage check before redirect:', { 
// //           localAuthToken: localAuthToken ? `${localAuthToken.substring(0, 10)}...` : 'null',
// //         });
        
// //         // Add delay before redirect to allow for debugging
// //         console.log('Will redirect to login in 3 seconds...');
// //         setTimeout(() => {
// //           console.log('Executing redirect to login now');
// //           navigate('/login');
// //         }, 3000);
// //       } else {
// //         console.log('Authentication confirmed. Proceeding with Dashboard render.');
// //       }
// //     }
// //   }, [isLoading, isAuthenticated, authToken, navigate]);

// //   // If still loading, show loading state
// //   if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center h-screen flex-col">
// //         <div className="mb-4 text-blue-600 font-bold text-xl">Loading Authentication...</div>
// //         <div className="bg-gray-100 p-4 rounded max-w-md">
// //           <p className="text-sm mb-2">Debug: Waiting for AuthContext to initialize</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Show authentication issues with debug info
// //   if (!isAuthenticated) {
// //     return (
// //       <div className="flex items-center justify-center h-screen flex-col">
// //         <div className="mb-4 text-red-600 font-bold text-xl">Authentication Issue</div>
// //         <div className="bg-gray-100 p-4 rounded max-w-md">
// //           <p className="text-sm mb-2">You will be redirected to login in a moment...</p>
// //           <div className="mt-4">
// //             <p className="text-xs font-semibold mb-1">Debug Information:</p>
// //             <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
// //               {JSON.stringify(authDebugInfo, null, 2)}
// //             </pre>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Normal dashboard when authenticated
// //   return (
// //     <div>
// //       <Navbar />
// //       <Sidebar />
// //       <div className="p-4 ml-64">
// //         <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
// //         <p className="mb-4">Welcome to your dashboard!</p>
        
// //         {/* Debug information panel - remove in production */}
// //         <div className="mt-6 p-4 bg-gray-100 rounded border border-gray-300">
// //           <h3 className="font-medium text-gray-700 mb-2">Authentication Debug Info</h3>
// //           <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40">
// //             {JSON.stringify(authDebugInfo, null, 2)}
// //           </pre>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// 'use client';

// import React, { useEffect, useState } from 'react';
// import Navbar from './SideBarComponent/navheader';
// import Sidebar from './SideBarComponent/sidebar';
// import { useAuth } from '../../../../../AuthContext';
// import { useRouter } from 'next/navigation';

// export default function Dashboard() {
//   const { authToken, isAuthenticated, isLoading } = useAuth();
//   const [authDebugInfo, setAuthDebugInfo] = useState({});
//   const router = useRouter();

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const localAuthToken = localStorage.getItem('authToken');
//       const localCsrfToken = localStorage.getItem('csrfToken');
//       const localUser = localStorage.getItem('user');

//       const debugInfo = {
//         localAuthToken: localAuthToken ? `${localAuthToken.substring(0, 10)}...` : 'null',
//         localCsrfToken: localCsrfToken ? `${localCsrfToken.substring(0, 10)}...` : 'null',
//         localUserExists: Boolean(localUser),
//         authTokenExists: Boolean(authToken),
//         isAuthenticatedValue: isAuthenticated,
//         isLoadingValue: isLoading,
//       };

//       setAuthDebugInfo(debugInfo);
//       console.log('Direct localStorage check:', debugInfo);
//     }
//   }, []);

//   useEffect(() => {
//     if (!isLoading) {
//       if (!isAuthenticated) {
//         console.log('Will redirect to login in 3 seconds...');
//         setTimeout(() => {
//           console.log('Redirecting now...');
//           router.push('/login');
//         }, 3000);
//       }
//     }
//   }, [isLoading, isAuthenticated, router]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen flex-col">
//         <div className="mb-4 text-blue-600 font-bold text-xl">Loading Authentication...</div>
//         <div className="bg-gray-100 p-4 rounded max-w-md">
//           <p className="text-sm mb-2">Debug: Waiting for AuthContext to initialize</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return (
//       <div className="flex items-center justify-center h-screen flex-col">
//         <div className="mb-4 text-red-600 font-bold text-xl">Authentication Issue</div>
//         <div className="bg-gray-100 p-4 rounded max-w-md">
//           <p className="text-sm mb-2">You will be redirected to login in a moment...</p>
//           <div className="mt-4">
//             <p className="text-xs font-semibold mb-1">Debug Information:</p>
//             <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
//               {JSON.stringify(authDebugInfo, null, 2)}
//             </pre>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <Navbar />
//       <Sidebar />
//       <div className="p-4 ml-64">
//         <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
//         <p className="mb-4">Welcome to your dashboard!</p>
//         <div className="mt-6 p-4 bg-gray-100 rounded border border-gray-300">
//           <h3 className="font-medium text-gray-700 mb-2">Authentication Debug Info</h3>
//           <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40">
//             {JSON.stringify(authDebugInfo, null, 2)}
//           </pre>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useAuth } from '../../../../../AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './SideBarComponent/navheader';
import Sidebar from './SideBarComponent/sidebar';

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/Components/System_Management_Component/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <p className="text-center mt-10 text-gray-600">Checking authentication...</p>;
  }

  if (!isAuthenticated) {
    return null; // Or show a loading spinner
  }

  // return (
  //   <div className="min-h-screen bg-gray-100 p-8">
  //     <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
  //     <p className="text-gray-600">Welcome to the secured dashboard!</p>
  //   </div>
  // );
  return (
        <div>
          <Navbar />
          <Sidebar/>
          
          {/* Your dashboard content here */}
        </div>
  )
}

