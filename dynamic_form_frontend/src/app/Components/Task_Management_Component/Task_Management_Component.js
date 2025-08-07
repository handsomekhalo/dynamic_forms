'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../System_Management_Component/dashboard/SideBarComponent/sidebar';
// import Navbar from '../System_Management_Component/dashboard/SideBarComponent/navheader';
import { useAuth } from '../../../../AuthContext';
import backendApi from '../../../../utils/backendApi';
import CreateTaskModal from './Create_Task_Modal';
import EditTaskModal from './Edit_Task_Modal';
import DeleteTaskModal from './Delete_Task_Modal';
import TaskTable from './Task_Table_Modal';
import ViewTasksModal from './View_Task_Modal';

const Task_Management = () => {
  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  // Task data and modals state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Selected task data
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  
  // Calculate pagination values
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  // Fetch all tasks
  // const fetchTasks = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await backendApi.get('/task_management/get_all_tasks/', {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Token ${authToken}`,
  //       },
  //     });
      
  //     if (res.data.status === 'success') {
  //       setTasks(res.data.tasks || []);
  //       setError(null);
  //     } else {
  //       setError(res.data.message || 'Failed to load tasks');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching tasks:', err);
  //     setError('Failed to load tasks. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
// const fetchTasks = async () => {
//   try {
//     setLoading(true);
//     const res = await backendApi.get('/task_management/get_all_tasks/', {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Token ${authToken}`,
//       },
//     });
    
//     if (res.data.status === 'success') {
//       const tasksData = res.data.data;

//       // Check if tasksData is an array, otherwise default to an empty array
//       const tasksArray = Array.isArray(tasksData) ? tasksData : [];
//       setTasks(tasksArray);
//       setError(null);
//     } else {
//       setError(res.data.message || 'Failed to load tasks');
//       setTasks([]); // Ensure state is an array on error
//     }
//   } catch (err) {
//     console.error('Error fetching tasks:', err);
//     setError('Failed to load tasks. Please try again.');
//     setTasks([]); // Ensure state is an array on fetch error
//   } finally {
//     setLoading(false);
//   }
// };
const fetchTasks = async () => {
  try {
    setLoading(true);
    const res = await backendApi.get('/task_management/get_all_tasks/', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${authToken}`,
      },
    });

    if (res.data.status === 'success') {
      const tasksData = res.data.data;

      // Make sure tasksData is an array. If it's an object, we treat it as no data.
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
      } else {
        console.error("API response data is not an array, defaulting to an empty array:", tasksData);
        setTasks([]);
      }
      setError(null);
    } else {
      setError(res.data.message || 'Failed to load tasks');
      setTasks([]);
    }
  } catch (err) {
    console.error('Error fetching tasks:', err);
    setError('Failed to load tasks. Please try again.');
    setTasks([]);
  } finally {
    setLoading(false);
  }
};

  // Initial load
  useEffect(() => {
    if (isLoading) return;
    if (!authToken || !isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTasks();
  }, [authToken, isAuthenticated, isLoading]);

  // Handle create task
  const handleCreateTask = async (formData) => {
    try {
      const res = await backendApi.post('/task_management/create_task/', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
      });
      
      if (res.data.status === 'success') {
        await fetchTasks(); // Refresh tasks list
        setIsCreateModalOpen(false);
        // Optional: Show success message
      } else {
        console.error('Failed to create task:', res.data.message);
        // Optional: Show error message
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      // Optional: Show error message
    }
  };

  // Handle edit task click
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  // Handle save edited task
  const handleSaveTask = async (formData) => {
    try {
      const res = await backendApi.post('/task_management/update_task/', {
        task_id: formData.id,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
      });
      
      if (res.data.status === 'success') {
        await fetchTasks(); // Refresh tasks list
        setIsEditModalOpen(false);
        setSelectedTask(null);
      } else {
        console.error('Failed to update task:', res.data.message);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Handle delete task click
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async (taskId) => {
    try {
      const res = await backendApi.post('/task_management/delete_task/', {
        task_id: taskId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
      });
      
      if (res.data.status === 'success') {
        await fetchTasks(); // Refresh tasks list
        setIsDeleteModalOpen(false);
        setTaskToDelete(null);
      } else {
        console.error('Failed to delete task:', res.data.message);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Handle toggle task completion (optional feature)
  const handleToggleComplete = async (task) => {
    try {
      const res = await backendApi.post('/task_management/update_task/', {
        task_id: task.id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        completed: !task.completed,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
      });
      
      if (res.data.status === 'success') {
        await fetchTasks(); // Refresh tasks list
      } else {
        console.error('Failed to toggle task completion:', res.data.message);
      }
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4">
        {/* <Navbar /> */}
        
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Task Management</h2>

          {/* Action buttons */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Task
            </button>
            
            <button
              onClick={() => setIsViewModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              View All Tasks
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Task Table */}
          <TaskTable
            tasks={tasks}
            currentTasks={currentTasks}
            loading={loading}
            error={error}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            indexOfFirstTask={indexOfFirstTask}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            setTaskToDelete={setTaskToDelete}
            setIsDeleteModalOpen={setIsDeleteModalOpen}
            onToggleComplete={handleToggleComplete}
          />

          {/* Modals */}
          <CreateTaskModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleCreateTask}
          />

          <EditTaskModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedTask(null);
            }}
            onSave={handleSaveTask}
            taskToEdit={selectedTask}
          />

          <DeleteTaskModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setTaskToDelete(null);
            }}
            onDelete={handleConfirmDelete}
            taskToDelete={taskToDelete}
          />

          <ViewTasksModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            tasks={tasks}
            onEditTask={(task) => {
              setIsViewModalOpen(false);
              handleEditClick(task);
            }}
            onDeleteTask={(task) => {
              setIsViewModalOpen(false);
              handleDeleteClick(task);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Task_Management;