// pages/dashboard/index.js

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/auth/login'); // Redirect to login if not authenticated
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to your Dashboard</h1>
      <p>This is a protected route.</p>
    </div>
  );
};

export default Dashboard;
