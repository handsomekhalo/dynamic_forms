// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Sidebar from '../dashboard/SideBarComponent/sidebar';
// import UserTable from './usermanagement';
// import { useAuth } from '../../../../../AuthContext';
// import backendApi from '../../../../../utils/backendApi';

// const UserManagement = () => {
//   const { authToken, isAuthenticated, navigate } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [csrfToken, setCsrfToken] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const usersPerPage = 6;

//   // Fetch CSRF Token
//   useEffect(() => {
//     backendApi
//       .get('/system_management/csrf/', { withCredentials: true })
//       .then((res) => {
//         if (res.data?.csrfToken) {
//           setCsrfToken(res.data.csrfToken);
//         }
//         console.log('CSRF Token response:', res);
//       })
//       .catch((err) => {
//         console.error('Failed to fetch CSRF:', err);
//       });
//   }, []);

//   // Fetch Users
//   const fetchUsers = async () => {
//     try {
//       const res = await axios.get('/system_management_api/get_all_users_api/', {
//         headers: { Authorization: `Token ${authToken}` }
//       });
//       const parsedData = JSON.parse(res.data); // Because your API returns a string
//       setUsers(parsedData.users);
//     } catch (err) {
//       console.error('Failed to fetch users:', err);
//       setError('Error loading users');
//     }
//   };

//   // Fetch Roles
//   const fetchRoles = async () => {
//     try {
//       const res = await axios.get('/system_management_api/get_user_types_api/', {
//         headers: { Authorization: `Token ${authToken}` }
//       });
//       setRoles(res.data.user_types);
//     } catch (err) {
//       console.error('Failed to fetch roles:', err);
//     }
//   };

//   useEffect(() => {
//     if (!authToken || !isAuthenticated) {
//       navigate('/login');
//       return;
//     }

//     const fetchData = async () => {
//       await fetchUsers();
//       await fetchRoles();
//       setLoading(false);
//     };

//     fetchData();
//   }, [authToken, isAuthenticated]);

//   // Pagination
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(users.length / usersPerPage);

//   return (
//     <div className="flex">
//       <Sidebar />
//       <div className="flex-1 p-4">
//         <h2 className="text-2xl font-semibold mb-4">User Management</h2>
//         <UserTable
//           users={users}
//           currentUsers={currentUsers}
//           roles={roles}
//           loading={loading}
//           error={error}
//           currentPage={currentPage}
//           totalPages={totalPages}
//           setCurrentPage={setCurrentPage}
//           indexOfFirstUser={indexOfFirstUser}
//           csrfToken={csrfToken}
//         />
//       </div>
//     </div>
//   );
// };

// export default UserManagement;
'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../dashboard/SideBarComponent/sidebar';
import UserTable from './usermanagement';
import { useAuth } from '../../../../../AuthContext';
import backendApi from '../../../../../utils/backendApi';

const UserManagement = () => {
//   const { authToken, isAuthenticated, navigate } = useAuth();
//   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;

  // Fetch CSRF Token
// In UserManagement.js
const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

// Main data fetching effect
useEffect(() => {
  if (isLoading) {
    console.log('AuthContext still loading...');
    return;
  }

  if (!authToken || !isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    console.log('Auth state:', { authToken, isAuthenticated });
    navigate('/login');
    return;
  }

  console.log('Starting data fetch with auth token:', authToken);
  // Rest of your code...
}, [authToken, isAuthenticated, navigate, isLoading]);;

  // Fetch Users
  const fetchUsers = async () => {
    try {
      console.log('Fetching users with token:', authToken);
      const res = await backendApi.get('/system_management_api/get_users_api/', {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      // Check if response data is a string or already an object
      let userData;
      if (typeof res.data === 'string') {
        try {
          userData = JSON.parse(res.data);
        } catch (parseErr) {
          console.error('Error parsing user data:', parseErr);
          throw new Error('Invalid user data format');
        }
      } else {
        userData = res.data;
      }
      
      console.log('Users data received:', userData);
      setUsers(userData.users || []);
      return true;
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Error loading users');
      return false;
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      console.log('Fetching roles with token:', authToken);
      const res = await backendApi.get('/system_management_api/get_user_types_api/', {
        headers: { Authorization: `Token ${authToken}` }
      });
      console.log('Roles data received:', res.data);
      setRoles(res.data.user_types || []);
      return true;
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError(prev => prev || 'Error loading roles');
      return false;
    }
  };

  // Main data fetching effect
  useEffect(() => {
    if (!authToken || !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Starting data fetch with auth token:', authToken);
    
    const fetchData = async () => {
      setLoading(true);
      const usersSuccess = await fetchUsers();
      const rolesSuccess = await fetchRoles();
      setLoading(false);
      
      if (!usersSuccess || !rolesSuccess) {
        console.error('Data fetching incomplete');
      }
    };

    fetchData();
  }, [authToken, isAuthenticated, navigate]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        <h2 className="text-2xl font-semibold mb-4">User Management</h2>
        {error && <div className="bg-red-100 p-3 mb-4 text-red-700 rounded">{error}</div>}
        <UserTable
          users={users}
          currentUsers={currentUsers}
          roles={roles}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          indexOfFirstUser={indexOfFirstUser}
          csrfToken={csrfToken}
        />
      </div>
    </div>
  );
};

export default UserManagement;