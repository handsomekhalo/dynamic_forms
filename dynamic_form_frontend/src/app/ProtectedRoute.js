'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
          <p className="text-sm text-gray-500">Please wait while we verify your authentication</p>
        </div>
      </div>
    );
  }

  return children;
}
