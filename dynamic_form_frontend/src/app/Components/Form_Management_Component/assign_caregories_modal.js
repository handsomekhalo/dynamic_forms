// 'use client';
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

  // Clear state when modal closes to ensure fresh data on reopen
  useEffect(() => {
    if (!open) {
      setCategories([]);
      setAssignedCategoryIds(new Set());
    }
  }, [open]);

  // Add a manual refresh method
  const refreshCategoryData = async () => {
    if (formId) {
      await fetchData();
    }
  };

  // Setup our initial effect with the expanded condition
  useEffect(() => {
    if (formId && open) {
      refreshCategoryData();
    }
  }, [formId, open]);

  // Create a new method to handle when checkboxes are changed successfully
  const afterSuccessfulUpdate = async () => {
    try {
      await refreshCategoryData();
    } catch (err) {
      console.error("Error refreshing categories after update:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch all categories
      const allCategoriesRes = await backendApi.get('/application_management/get_all_categories/', {
        headers: { Authorization: `Token ${authToken}` },
      });
      
      // Fetch assigned categories for this specific form
      const assignedCategoriesRes = await backendApi.get(
        `/application_management/get_form_categories/${formId}/`,
        {
          headers: { Authorization: `Token ${authToken}` },
        }
      );

      console.log('All categories response:', allCategoriesRes.data);
      console.log('Assigned categories response:', assignedCategoriesRes.data);

      // Check different possible structures based on your APIs
      let allCategories = [];
      if (allCategoriesRes.data.categories) {
        allCategories = allCategoriesRes.data.categories;
      } else if (Array.isArray(allCategoriesRes.data)) {
        allCategories = allCategoriesRes.data;
      }
      
      // Try different possible structures for assigned categories
      let assignedCategories = [];
      if (assignedCategoriesRes.data.assigned_categories) {
        assignedCategories = assignedCategoriesRes.data.assigned_categories;
      } else if (assignedCategoriesRes.data.categories) {
        assignedCategories = assignedCategoriesRes.data.categories;
      } else if (Array.isArray(assignedCategoriesRes.data)) {
        assignedCategories = assignedCategoriesRes.data;
      }
      
      console.log('Extracted all categories:', allCategories);
      console.log('Extracted assigned categories:', assignedCategories);
      
      // Create a Set of assigned category IDs for easy lookup
      // Be flexible in how we extract the ID in case the structure varies
      const assignedIds = new Set(assignedCategories.map(cat => cat.id || cat.category_id || cat));
      console.log('Assigned category IDs:', [...assignedIds]);
      setAssignedCategoryIds(assignedIds);

      // Map and mark which categories are assigned
      const updatedCategories = allCategories.map(cat => ({
        ...cat,
        isChecked: assignedIds.has(cat.id || cat.category_id)
      }));
      
      console.log('Categories with checked state:', updatedCategories);
      setCategories(updatedCategories);
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
        // Use API endpoint for assignment
        const response = await backendApi.post(
          `/application_management/assign_or_update_category/`, 
          {
            assignments: [{ category_id: categoryId, form_type_id: formId }],
          },
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );
        console.log('Assignment response:', response.data);
      } else {
        // Use API endpoint for removal
        const response = await backendApi.post(
          `/application_management/remove_category_assignment/`, 
          {
            form_type_id: formId,
            main_category_id: categoryId,
          },
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );
        console.log('Removal response:', response.data);
      }
      
      // Refresh our data to ensure consistency with server state
      await afterSuccessfulUpdate();
      
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