'use client';
import React from 'react';
import { useAuth } from '../../../AuthContext';

export default function CategoryModal({ 
  newCategoryName, 
  setNewCategoryName, 
  newDescriptionName, 
  setNewDescriptionName, 
  onSubmit, 
  onClose 
}) {
  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
        
        <input
          type="text"
          placeholder="Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <input
          type="text"
          placeholder="Description"
          value={newDescriptionName}
          onChange={(e) => setNewDescriptionName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
