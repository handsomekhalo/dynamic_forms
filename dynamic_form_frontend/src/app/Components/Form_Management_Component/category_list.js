'use client';
import React, { useState } from 'react';
import backendApi from '../../../../utils/backendApi';

const CategoryList = ({ categories, fetchCategories, form_id}) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setDescription] = useState('');  

  const handleCategoryExpand = (categoryId) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };


  const handleCreateCategory = async () => {
    try {
      await backendApi.post('/application_management/create_category/', {
        name: categoryName,
        description: categoryDescription,
        form_id,  // Make sure this is passed in from props

      });
      setCategoryName('');  // Reset the category name
      setDescription('');   // Reset the category description (fixed typo here)
      setShowModal(false);
      fetchCategories(); // Refresh list
    } catch (err) {
      console.error('Error creating category:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to create category.');
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Categories</h2>
    
      </div>

      {categories.length === 0 ? (
        <p>No categories available.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 px-4">Category Name</th>
              <th className="border-b py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                <tr>
                  <td className="border-b py-2 px-4">{category.name}</td>
                  <td className="border-b py-2 px-4">
                    <button
                      onClick={() => handleCategoryExpand(category.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {expandedCategoryId === category.id ? 'Collapse' : 'Expand'}
                    </button>
                  </td>
                </tr>
                {expandedCategoryId === category.id && (
                  <tr>
                    <td colSpan="2" className="border-b py-2 px-4">
                      <div>Category details go here...</div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />

<input
              type="text"
              placeholder="Category Description"
              value={categoryDescription}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCreateCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              >
                Create
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
