'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../../../../AuthContext'; // Adjust the path based on your project structure

export default function AssignModal({ isOpen, onClose, form_id, backendApi }) {
  const { authToken } = useAuth(); // 👈 use authToken from context
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   if (isOpen && form_id) {
  //     fetchUnassignedCategories();
  //   }
  // }, [form_id, isOpen]);
  useEffect(() => {
    if (isOpen && form_id) {
      console.log("Fetching unassigned categories for form_id *******************:", form_id); // Debugging line
      fetchUnassignedCategories();
    }
  }, [form_id, isOpen]);
  
  

  const fetchUnassignedCategories = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const res = await backendApi.get(`/application_management/get_unassigned_categories/${form_id}/`, {
        headers: {
          Authorization: `Token ${authToken}`
        }
      });

      console.log('***************************************',res)
  
      const data = res.data;
  
      if (data.status === 'success') {
        setCategories(data.unassigned_categories || []);
      } else {
        setError(data.message || "Could not load unassigned categories");
      }
  
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server error loading unassigned categories");
    } finally {
      setLoading(false);
    }
  };
  

  // const fetchUnassignedCategories = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const res = await backendApi.get(`/application_management/get_unassigned_categories/${form_id}/`, {
  //       headers: {
  //         Authorization: `Token ${authToken}`
  //       }
  //     });
  //     setCategories(res.data.unassigned_categories || []);

  //     if (data.status === 'success') {
  //       setCategories(data.unassigned_categories || []);
  //     } else {
  //       setError(data.message || "Could not load unassigned categories");
  //     }
  //   } catch (err) {
  //     console.error("Fetch error:", err);
  //     setError("Server error loading unassigned categories");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCategoryToggle = (category_id) => {
    setSelectedCategories((prev) =>
      prev.includes(category_id) ? prev.filter((id) => id !== category_id) : [...prev, category_id]
    );
  };

  const handleSubmit = async () => {
    try {
      const payload = selectedCategories.map((category_id) => ({
        category_id,
        questions: [], // Questions logic can be added later
      }));

      await backendApi.post(`/application_management/form/${form_id}/assign/`, {
        assignments: payload,
      });

      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to assign questions.');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl bg-white p-6 rounded-xl shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4">Assign Categories to Questions</Dialog.Title>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mb-4 space-y-2">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <label key={cat.id} className="block">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="mr-2"
                      />
                      {cat.name}
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">No categories available.</p>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={onClose}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  disabled={selectedCategories.length === 0}
                >
                  Assign
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );

}