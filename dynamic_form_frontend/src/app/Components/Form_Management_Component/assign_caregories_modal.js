'use client';
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../../../../AuthContext';
import backendApi from '../../../../utils/backendApi';
import Swal from 'sweetalert2';

export default function AssignCategoryModal({ open, formId, onClose }) {
  const { authToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [assignedCategoryIds, setAssignedCategoryIds] = useState(new Set());

  useEffect(() => {
    if (formId && open) {
      fetchData();
    }
  }, [formId, open]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch all categories first
      const allCategoriesRes = await backendApi.get('/application_management/get_all_categories/', {
        headers: { Authorization: `Token ${authToken}` },
      });
      
      // Use your specific get_assigned_categories endpoint with form_type_id parameter
      const assignedCategoriesRes = await backendApi.get(
        // '/application_management/get_assigned_categories/'  , 
        // `/application_management/get_assigned_categories/?form_type_id=${formId}`, 
        `/application_management/get_assigned_categories/${formId}/`,
        


        {
          headers: { Authorization: `Token ${authToken}` },

        }
      );

      console.log('All categories response:', allCategoriesRes.data);
      console.log('Assigned categories response:', assignedCategoriesRes.data);

      const allCategories = allCategoriesRes.data.categories || [];
      
      // Extract assigned categories from your specific endpoint
      // Adjust this based on the actual response structure of your get_assigned_categories endpoint
      const assignedCategories = assignedCategoriesRes.data.assigned_categories || [];
      
      // Create a Set of assigned category IDs for easy lookup
      const assignedIds = new Set(assignedCategories.map(cat => cat.id));
      setAssignedCategoryIds(assignedIds);

      // Map and mark which categories are assigned
      setCategories(
        allCategories.map(cat => ({
          ...cat,
          isChecked: assignedIds.has(cat.id)
        }))
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire('Error', 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (categoryId, checked) => {
    // Update local state immediately for responsiveness
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, isChecked: checked } : cat
      )
    );
    
    // Update our tracking of assigned categories
    const newAssignedIds = new Set(assignedCategoryIds);
    if (checked) {
      newAssignedIds.add(categoryId);
    } else {
      newAssignedIds.delete(categoryId);
    }
    setAssignedCategoryIds(newAssignedIds);
  
    setSavingChanges(true);
    try {
      if (checked) {
        // Assign category
        await backendApi.post(
          `/application_management/assign_or_update_category/${formId}/`, 
          {
            assignments: [{ category_id: categoryId, form_type_id: formId }],
          },
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );
      } else {
        // Remove category assignment
        await backendApi.post(
          `/application_management/remove_category_assignment/`, 
          {
            form_type_id: formId,
            main_category_id: categoryId,
          },
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );
      }

      // After successful update, refresh the assigned categories
      // This ensures our local state stays in sync with the server
      const refreshRes = await backendApi.get(
        `/application_management/get_assigned_categories/?form_type_id=${formId}`, 
        {
          headers: { Authorization: `Token ${authToken}` },
        }
      );
      
      const refreshedAssignedCategories = refreshRes.data.assigned_categories || [];
      const refreshedAssignedIds = new Set(refreshedAssignedCategories.map(cat => cat.id));
      setAssignedCategoryIds(refreshedAssignedIds);
      
    } catch (err) {
      console.error("Error updating category assignment:", err);
      
      // Revert local state if API call fails
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId ? { ...cat, isChecked: !checked } : cat
        )
      );
      
      // Also revert our tracking of assigned categories
      const revertedAssignedIds = new Set(assignedCategoryIds);
      if (checked) {
        revertedAssignedIds.delete(categoryId);
      } else {
        revertedAssignedIds.add(categoryId);
      }
      setAssignedCategoryIds(revertedAssignedIds);
      
      Swal.fire('Error', 'Failed to update category assignment', 'error');
    } finally {
      setSavingChanges(false);
    }
  };
  
  const handleClose = () => {
    // Call parent component's onClose with a refresh flag
    onClose(true);
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl bg-white p-6 rounded-xl shadow-lg">
          <Dialog.Title className="text-lg font-bold mb-4 flex items-center justify-between">
            <span>Assign Categories</span>
            {savingChanges && (
              <span className="text-sm text-blue-600">(Saving changes...)</span>
            )}
          </Dialog.Title>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={category.isChecked || false}
                    onChange={(e) =>
                      handleCheckboxChange(category.id, e.target.checked)
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No categories available.</p>
          )}

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {assignedCategoryIds.size} categories assigned
            </div>
            <button
              onClick={handleClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}