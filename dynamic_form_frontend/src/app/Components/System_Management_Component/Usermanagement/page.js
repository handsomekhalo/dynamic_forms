'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../dashboard/SideBarComponent/sidebar';
import UserTable from './usermanagement';
import { useAuth } from '../../../../../AuthContext';
import backendApi from '../../../../../utils/backendApi';
import Navbar from '../dashboard/SideBarComponent/navheader';
import EditUserModal from './edit_user_modalr';

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const res = await backendApi.get('/system_management/get_all_users/', {
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
      const res = await backendApi.get('/system_management/get_roles/', {
        headers: { Authorization: `Token ${authToken}` }
      });
  
      console.log('Roles data received:', res.data);
      setRoles(res.data.roles || []); // FIXED: was user_types
      return true;
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      setError(prev => prev || 'Error loading roles');
      return false;
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  

  const handleSaveUser = async (userId, formData) => {
    try {
      // Make sure role is always a valid integer or an empty string
      // Use a default value (like 1) if needed, or retain as empty string 
      // depending on your backend validation requirements
      let user_type_id = formData.role ? parseInt(formData.role) : "";
      
      // If parsing results in NaN, set to empty string or a default value
      if (isNaN(user_type_id)) {
        user_type_id = "";  // or set to a default role ID like 1
      }
      
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_type_id: user_type_id,
      };
      
      console.log('Sending payload to backend:', payload);
      
      const response = await backendApi.post(
        `/system_management/update_user/${userId}/`, 
        payload,
        {
          headers: { 
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update response:', response);
      
      if (response.data.status === 'success') {
        // Refresh user list after successful update
        await fetchUsers();
        handleCloseModal();
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user: ' + (err.message || 'Unknown error'));
    }
  };

  // Main data fetching effect
  useEffect(() => {
    if (!authToken || !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    
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


        <EditUserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal} // This was wrong: onClose={() => setModalOpen(false)}
          onSave={handleSaveUser}
          roles={roles}
        />
        {/* <EditUserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveUser}
          
          roles={roles} // Ensure this is an array like [{ id: 1, name: 'Admin' }, ...]
        /> */}


        {/* <EditUserModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        roles={roles}
      /> */}

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
          onEdit={handleEditClick}
        />
      </div>


    </div>
  );
};

export default UserManagement;