// import React, { useState } from 'react';

// const DeleteTaskModal = ({ isOpen, onClose, onDelete, taskToDelete }) => {
//   const [loading, setLoading] = useState(false);

//   const handleDelete = async (e) => {
//     e.preventDefault();
    
//     if (!taskToDelete) return;

//     setLoading(true);
//     try {
//       await onDelete(taskToDelete.id);
//     } catch (error) {
//       console.error('Error deleting task:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <div className="modal-body">
//           <form onSubmit={handleDelete}>
//             {/* Hidden field for task ID */}
//             <input type="hidden" name="task_id" value={taskToDelete?.id || ''} />
            
//             <div className="my-8 text-center">
//               <svg 
//                 xmlns="http://www.w3.org/2000/svg" 
//                 className="w-14 h-14 fill-red-500 mx-auto" 
//                 viewBox="0 0 24 24"
//               >
//                 <path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z"/>
//                 <path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z"/>
//               </svg>
//               <h4 className="text-gray-800 text-lg font-semibold mt-4">
//                 Are you sure you want to delete this task?
//               </h4>
//               {taskToDelete && (
//                 <p className="text-sm text-gray-600 mt-2">
//                   Task: "{taskToDelete.title}"
//                 </p>
//               )}
//               <p className="text-sm text-gray-600 mt-4">
//                 This action cannot be undone.
//               </p>
//             </div>
            
//             <div className="flex flex-col space-y-2">
//               <button 
//                 type="submit" 
//                 className="px-4 py-2 rounded-lg text-white text-sm tracking-wide bg-red-500 hover:bg-red-600 active:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                 disabled={loading}
//               >
//                 {loading ? 'Deleting...' : 'Delete'}
//               </button>
//               <button 
//                 type="button" 
//                 className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200"
//                 onClick={onClose}
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteTaskModal;
import React, { useState, useEffect } from 'react';

const DeleteTaskModal = ({ isOpen, onClose, onDelete, taskToDelete, fetchTasks }) => {
  const [loading, setLoading] = useState(false);

  // Reset loading state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!taskToDelete) return;

    setLoading(true);
    try {
      await onDelete(taskToDelete.id); // Delete the task
      if (typeof fetchTasks === 'function') {
        await fetchTasks(); // Refresh task list
      }
      onClose(); // Close modal after deletion
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="modal-body">
          <form onSubmit={handleDelete}>
            {/* Hidden field for task ID */}
            <input type="hidden" name="task_id" value={taskToDelete?.id || ''} />

            <div className="my-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 fill-red-500 mx-auto"
                viewBox="0 0 24 24"
              >
                <path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1Zm1-3h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z"/>
                <path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Zm4 0v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z"/>
              </svg>
              <h4 className="text-gray-800 text-lg font-semibold mt-4">
                Are you sure you want to delete this task?
              </h4>
              {taskToDelete && (
                <p className="text-sm text-gray-600 mt-2">
                  Task: &quot;{taskToDelete.title}&quot;
                </p>
              )}
              <p className="text-sm text-gray-600 mt-4">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white text-sm tracking-wide bg-red-500 hover:bg-red-600 active:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskModal;
