"use client";

import React, { useEffect, useMemo, useState } from "react";

import AppLayout from "@/components/dashboard/Applayout";
import backendApi from "../../../utils/backendApi";
import { useAuth } from "../../../AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

const USERS_PER_PAGE = 6;

export default function UserManagementPage() {
  const { authToken, isAuthenticated } =
    useAuth() || {};

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [userToDelete, setUserToDelete] =
    useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    if (authToken && isAuthenticated) {
      fetchData();
    }
  }, [authToken, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchUsers(),
        fetchRoles(),
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await backendApi.get(
        "/system_management/get_all_users/",
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      const data =
        typeof res.data === "string"
          ? JSON.parse(res.data)
          : res.data;

      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await backendApi.get(
        "/system_management/get_roles/",
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      setRoles(res.data?.data?.roles || []);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const value = search.toLowerCase();

      return (
        user.first_name
          ?.toLowerCase()
          .includes(value) ||
        user.last_name
          ?.toLowerCase()
          .includes(value) ||
        user.email?.toLowerCase().includes(value)
      );
    });
  }, [users, search]);

  const totalPages = Math.ceil(
    filteredUsers.length / USERS_PER_PAGE
  );

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      role: "",
    });
  };

  const handleCreateUser = async () => {
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_type_id: parseInt(formData.role),
      };

      const response = await backendApi.post(
        "/system_management/create_user/",
        payload,
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        await fetchUsers();

        setIsCreateModalOpen(false);

        resetForm();
      }
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Failed to create user"
      );
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);

    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: user.user_type_id?.toString() || "",
    });

    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        user_type_id: parseInt(formData.role),
      };

      const response = await backendApi.post(
        `/system_management/update_user/${selectedUser.id}/`,
        payload,
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        await fetchUsers();

        setIsEditModalOpen(false);

        setSelectedUser(null);

        resetForm();
      }
    } catch (err) {
      console.error(err);

      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleting(true);

      const response = await backendApi.post(
        "/system_management/delete_user/",
        {
          email: userToDelete.email,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        await fetchUsers();

        setIsDeleteModalOpen(false);

        setUserToDelete(null);
      }
    } catch (err) {
      console.error(err);

      alert("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              User Management
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              Manage platform users and roles.
            </p>
          </div>

          <Button
            onClick={() =>
              setIsCreateModalOpen(true)
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="max-w-sm relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <Input
                placeholder="Search users..."
                className="pl-9"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>

                  <TableHead>Email</TableHead>

                  <TableHead>
                    Role
                  </TableHead>

                  <TableHead>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : currentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name}{" "}
                        {user.last_name}
                      </TableCell>

                      <TableCell>
                        {user.email}
                      </TableCell>

                      <TableCell>
                        {user.user_type ||
                          "N/A"}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              handleEditClick(
                                user
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setUserToDelete(
                                user
                              );

                              setIsDeleteModalOpen(
                                true
                              );
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {Array.from({
                      length: totalPages,
                    }).map((_, index) => (
                      <PaginationItem
                        key={index}
                      >
                        <PaginationLink
                          isActive={
                            currentPage ===
                            index + 1
                          }
                          onClick={() =>
                            setCurrentPage(
                              index + 1
                            )
                          }
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 rounded-lg p-4">
            {error}
          </div>
        )}

        {/* CREATE USER MODAL */}

        <Dialog
          open={isCreateModalOpen}
          onOpenChange={
            setIsCreateModalOpen
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Create User
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_name:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    last_name:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />

              <select
                className="w-full border rounded-md h-10 px-3"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
              >
                <option value="">
                  Select Role
                </option>

                {roles.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                  >
                    {role.name}
                  </option>
                ))}
              </select>

              <Button
                className="w-full"
                onClick={handleCreateUser}
              >
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* EDIT USER MODAL */}

        <Dialog
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Edit User
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                placeholder="First Name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    first_name:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    last_name:
                      e.target.value,
                  })
                }
              />

              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
              />

              <select
                className="w-full border rounded-md h-10 px-3"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
              >
                <option value="">
                  Select Role
                </option>

                {roles.map((role) => (
                  <option
                    key={role.id}
                    value={role.id}
                  >
                    {role.name}
                  </option>
                ))}
              </select>

              <Button
                className="w-full"
                onClick={handleUpdateUser}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* DELETE USER MODAL */}

        <Dialog
          open={isDeleteModalOpen}
          onOpenChange={
            setIsDeleteModalOpen
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Delete User
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to
                delete{" "}
                <span className="font-medium text-black">
                  {userToDelete?.email}
                </span>
                ?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setIsDeleteModalOpen(
                      false
                    )
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={deleting}
                  onClick={
                    handleDeleteUser
                  }
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete User"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

// 'use client';

// import React, { useEffect, useState } from 'react';
// // import Sidebar from '../../../../components/dashboard/Sidebar';
// import Sidebar from '@/components/dashboard/Sidebar';


// import { useAuth } from '../../../AuthContext';
// import backendApi from '../../../utils/backendApi';
// // import Navbar from '../dashboard/SideBarComponent/navheader';
// // import CreateUserModal  from '../../../../components/users/Create_User_Modal'
// import CreateUserModal from '../../components/users/Create_User_Modal'
// import DeleteUserModal from '../../components/users/DeleteUserModal'


// import EditUserModal from '../../components/users/EditUserModal'
// import UserTable from '../../components/users/UserManagement';



// const UserManagement = () => {
// //   const { authToken, isAuthenticated, navigate } = useAuth();
// //   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [csrfToken, setCsrfToken] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const usersPerPage = 6;
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
// const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
// const [userToDelete, setUserToDelete] = useState(null);
// const [deleting, setDeleting] = useState(false);


//   // Fetch CSRF Token
// // In UserManagement.js
// const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

// // Main data fetching effect
// useEffect(() => {
//   if (isLoading) {
//     console.log('AuthContext still loading...');
//     return;
//   }

//   if (!authToken || !isAuthenticated) {
//     console.log('Not authenticated, redirecting to login');
//     console.log('Auth state:', { authToken, isAuthenticated });
//     navigate('/login');
//     return;
//   }

//   console.log('Starting data fetch with auth token:', authToken);
//   // Rest of your code...
// }, [authToken, isAuthenticated, navigate, isLoading]);;

//   // Fetch Users
//   const fetchUsers = async () => {
//     try {
//       console.log('Fetching users with token:', authToken);
//       const res = await backendApi.get('/system_management/get_all_users/', {
//         headers: { Authorization: `Token ${authToken}` }
        
//       });
      
//       // Check if response data is a string or already an object
//       let userData;
//       if (typeof res.data === 'string') {
//         try {
//           userData = JSON.parse(res.data);
//         } catch (parseErr) {
//           console.error('Error parsing user data:', parseErr);
//           throw new Error('Invalid user data format');
//         }
//       } else {
//         userData = res.data;
//       }
      
//       console.log('Users data received:', userData);
//       setUsers(userData.users || []);
//       return true;
//     } catch (err) {
//       console.error('Failed to fetch users:', err);
//       setError('Error loading users');
//       return false;
//     }
//   };

//   // Fetch Roles

//   const fetchRoles = async () => {
//     try {
//       console.log('Fetching roles with token:', authToken);
//       const res = await backendApi.get('/system_management/get_roles/', {
//         headers: { Authorization: `Token ${authToken}` }
//       });
  
//       console.log('Roles data received:', res.data);
//       // setRoles(res.data.roles || []); // FIXED: was user_types
//       setRoles(res.data?.data?.roles || []);

//       return true;
//     } catch (err) {
//       console.error('Failed to fetch roles:', err);
//       setError(prev => prev || 'Error loading roles');
//       return false;
//     }
//   };

//   const handleEditClick = (user) => {
//     setSelectedUser(user);
//     setIsModalOpen(true);
//   };
  
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedUser(null);
//   };
  

//   const handleSaveUser = async (userId, formData) => {
//     try {
//       // Make sure role is always a valid integer or an empty string
//       // Use a default value (like 1) if needed, or retain as empty string 
//       // depending on your backend validation requirements
//       let user_type_id = formData.role ? parseInt(formData.role) : "";
      
//       // If parsing results in NaN, set to empty string or a default value
//       if (isNaN(user_type_id)) {
//         user_type_id = "";  // or set to a default role ID like 1
//       }
      
//       const payload = {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email,
//         user_type_id: user_type_id,
//       };
      
//       console.log('Sending payload to backend:', payload);
      
//       const response = await backendApi.post(
//         `/system_management/update_user/${userId}/`, 
//         payload,
//         {
//           headers: { 
//             'Authorization': `Token ${authToken}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       console.log('Update response:', response);
      
//       if (response.data.status === 'success') {
//         // Refresh user list after successful update
//         await fetchUsers();
//         handleCloseModal();
//       } else {
//         throw new Error(response.data.message || 'Failed to update user');
//       }
//     } catch (err) {
//       console.error('Error updating user:', err);
//       alert('Failed to update user: ' + (err.message || 'Unknown error'));
//     }
//   };

//   // Main data fetching effect
//   useEffect(() => {
//     if (!authToken || !isAuthenticated) {
//       console.log('Not authenticated, redirecting to login');
//       navigate('/login');
//       return;
//     }

    
//     const fetchData = async () => {
//       setLoading(true);
//       const usersSuccess = await fetchUsers();
//       const rolesSuccess = await fetchRoles();
//       setLoading(false);
      
//       if (!usersSuccess || !rolesSuccess) {
//         console.error('Data fetching incomplete');
//       }
//     };

//     fetchData();
//   }, [authToken, isAuthenticated, navigate]);

// const handleCreateUser = async (formData) => {
//   try {
//     console.log('Creating user with data:', formData);
    
//     const response = await backendApi.post(
//         `/system_management/create_user/`, 
//         formData,
//       {
//         headers: { 
//           'Authorization': `Token ${authToken}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     console.log('Create response:', response);
    
//     if (response.data.status === 'success') {
//       // Refresh user list after successful creation
//       await fetchUsers();
//       setIsCreateModalOpen(false);
//       alert('User created successfully! Login credentials sent via email.');
//     } else {
//       throw new Error(response.data.message || 'Failed to create user');
//     }
//   } catch (err) {
//     console.error('Error creating user:', err);
//     alert('Failed to create user: ' + (err.response?.data?.message || err.message || 'Unknown error'));
//   }
// };

// const handleDeleteClick = (user) => {
//   setUserToDelete(user);
//   setIsDeleteModalOpen(true);
// };

// const handleConfirmDelete = async (email) => {
//   if (!email) {
//     console.error('No email provided for deletion');
//     return;
//   }

//   try {
//     setDeleting(true);
//     const response = await backendApi.post(
//       '/system_management/delete_user/',
//       { email },
//       {
//         headers: {
//           Authorization: `Token ${authToken}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (response.data.status === 'success') {
//       await fetchUsers();
//       setIsDeleteModalOpen(false);
//       setUserToDelete(null);
//     } else {
//       throw new Error(response.data.message || 'Delete failed');
//     }
//   } catch (error) {
//     console.error('Delete error:', error);
//     alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
//   } finally {
//     setDeleting(false);
//   }
// };



// const handleDelete = (user) => {
//     console.log('Setting user to delete:', user);

//   setUserToDelete(user); // assuming this state exists
//   setIsDeleteModalOpen(true);
// };
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
// <button 
//         type="button" 
//         onClick={() => setIsCreateModalOpen(true)}
//         className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
//       >
//         Create User
//       </button>


//         <EditUserModal
//           user={selectedUser}
//           isOpen={isModalOpen}
//           onClose={handleCloseModal} // This was wrong: onClose={() => setModalOpen(false)}
//           onSave={handleSaveUser}
//           roles={roles}
//         />
        
//         {error && <div className="bg-red-100 p-3 mb-4 text-red-700 rounded">{error}</div>}
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
//           onEdit={handleEditClick}
//            onDelete={handleDelete}
//   setUserToDelete={setUserToDelete}
//   setIsDeleteModalOpen={setIsDeleteModalOpen}
//         />


//         <CreateUserModal
//   isOpen={isCreateModalOpen}
//   onClose={() => setIsCreateModalOpen(false)}
//   onSave={handleCreateUser}
//   roles={roles}
// />

// {/* <DeleteUserModal
//   isOpen={isDeleteModalOpen}
//   onClose={() => setIsDeleteModalOpen(false)}
//   onDelete={handleConfirmDelete}
//   userEmail={userToDelete?.email || ''}
//   loading={deleting}
// /> */}
// <DeleteUserModal
//   isOpen={isDeleteModalOpen}
//   onClose={() => setIsDeleteModalOpen(false)}
//   onDelete={handleConfirmDelete}             // receives email from modal
//   userEmail={userToDelete?.email || ''}      // pulls email from selected user
//   loading={deleting}
// />

//       </div>


//     </div>
//   );
// };

// export default UserManagement;