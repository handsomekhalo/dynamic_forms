import React from 'react';

const TaskTable = ({ 
  tasks, 
  currentTasks, 
  loading, 
  error, 
  currentPage, 
  totalPages, 
  setCurrentPage, 
  indexOfFirstTask, 
  onEdit, 
  onDelete,
  setTaskToDelete, 
  setIsDeleteModalOpen,
  onToggleComplete 
}) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (completed) => {
    return completed ? 'text-green-600' : 'text-yellow-600';
  };

  const getDueDateColor = (dueDateString, completed) => {
    if (completed) return 'text-gray-500';
    
    const today = new Date();
    const dueDate = new Date(dueDateString);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) return 'text-red-600'; // Overdue
    if (dueDate.getTime() === today.getTime()) return 'text-orange-600'; // Due today
    return 'text-gray-700'; // Future date
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">S.N</th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTasks && currentTasks.length > 0 ? (
                currentTasks.map((task, index) => (
                  <tr key={task.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{index + 1 + indexOfFirstTask}</td>
                    <td className="px-4 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2">
                      <div className="max-w-xs truncate" title={task.description}>
                        {task.description}
                      </div>
                    </td>
                    <td className={`px-4 py-2 ${getDueDateColor(task.due_date, task.completed)}`}>
                      {formatDate(task.due_date)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`font-medium ${getStatusColor(task.completed)}`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          className="text-blue-600 hover:underline text-sm" 
                          onClick={() => onEdit(task)}
                        >
                          Edit
                        </button>
                        
                        {onToggleComplete && (
                          <button 
                            className={`text-sm hover:underline ${
                              task.completed ? 'text-yellow-600' : 'text-green-600'
                            }`}
                            onClick={() => onToggleComplete(task)}
                          >
                            {task.completed ? 'Mark Pending' : 'Mark Complete'}
                          </button>
                        )}
                        
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => {
                            setTaskToDelete(task);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded mx-1 hover:bg-gray-50 ${
                    currentPage === i + 1 ? 'bg-blue-500 text-white hover:bg-blue-600' : ''
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded ml-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Tasks Summary */}
          {currentTasks && currentTasks.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {indexOfFirstTask + 1} to {Math.min(indexOfFirstTask + currentTasks.length, tasks?.length || 0)} of {tasks?.length || 0} tasks
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskTable;