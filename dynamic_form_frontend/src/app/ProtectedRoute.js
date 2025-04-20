// // Create a new file: ProtectedRoute.js
// 'use client';

// import { useEffect, useState } from 'react';
// // import { useAuth } from './path-to-your-AuthContext';
// import { useAuth } from '../../AuthContext';

// export default function ProtectedRoute({ children }) {
//   const { isAuthenticated, isLoading, navigate } = useAuth();
//   const [isChecking, setIsChecking] = useState(true);

//   useEffect(() => {
//     if (!isLoading) {
//       if (!isAuthenticated) {
//         console.log('Not authenticated, redirecting to login');
//         navigate('/');
//       }
//       setIsChecking(false);
//     }
//   }, [isLoading, isAuthenticated, navigate]);

//   if (isLoading || isChecking) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <p className="text-lg">Loading...</p>
//           <p className="text-sm text-gray-500">Please wait while we verify your authentication</p>
//         </div>
//       </div>
//     );
//   }

//   // Only render children if authenticated
//   return isAuthenticated ? children : null;
// }

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to login');
        router.push('/');
      }
      setIsChecking(false);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
          <p className="text-sm text-gray-500">Please wait while we verify your authentication</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}
