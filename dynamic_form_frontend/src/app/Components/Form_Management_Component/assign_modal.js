import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../../../../AuthContext';

export default function AssignModal({ isOpen, onClose, form_id, backendApi }) {
  const { authToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // Fetch unassigned categories on mount
  useEffect(() => {
    if (form_id && isOpen) {
      fetchUnassignedCategories();
    }
  }, [form_id, isOpen]);

  const fetchUnassignedCategories = async () => {
    try {
      const res = await backendApi.get(`/application_management/get_unassigned_categories/${form_id}/`, {
        headers: {
          Authorization: `Token ${authToken}`
        }
      });
      setCategories(res.data.unassigned_categories || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) ? 
        prev.filter(id => id !== categoryId) :
        [...prev, categoryId]
    );
  };

  const handleAssignCategories = async () => {
    if (selectedCategories.length === 0) return;

    try {
      await backendApi.post(`/application_management/form/${form_id}/assign/`, {
        assignments: selectedCategories.map(categoryId => ({
          category_id:categoryId,
          questions: [] // Questions logic can be added later
        }))
      });
      
      onClose();
    } catch (err) {
      console.error('Assignment error:', err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl bg-white p-6 rounded-xl shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">Assign Categories to Questions</Dialog.Title>

          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between border-b py-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{category.name}</span>
                  </label>
                  <button
                    onClick={() => handleAssignCategories()}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No unassigned categories available.</p>
          )}

          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
