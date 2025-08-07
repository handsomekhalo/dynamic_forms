import React from 'react';

const ViewTasksModal = ({ isOpen, onClose, tasks, onEditTask, onDeleteTask }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-semibold">All Tasks</h5>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-4">
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h5>
                    <p className="text-gray-700 text-sm mb-2">
                      <span className="font-medium">Description:</span> {task.description}
                    </p>
                    <p className="text-gray-700 text-sm mb-2">
                      <span className="font-medium">Due Date:</span> {formatDate(task.due_date)}
                    </p>
                    <p className="text-gray-700 text-sm mb-4">
                      <span className="font-medium">Completed:</span> {task.completed ? 'Yes' : 'No'}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditTask(task)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Edit Task
                      </button>
                      <button
                        onClick={() => onDeleteTask(task)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete Task
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md" role="alert">
                  No tasks found.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTasksModal;