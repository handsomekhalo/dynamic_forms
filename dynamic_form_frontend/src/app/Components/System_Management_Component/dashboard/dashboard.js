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

