'use client';

import React, { useState } from 'react';
import backendApi from '../../../../utils/backendApi';
import AssignModal from './assign_modal';

const FormList = ({ forms }) => {
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [assignedCategories, setAssignedCategories] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [assignCategoryModalOpen, setAssignCategoryModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [allCategories, setAllCategories] = useState([]);

  const toggleExpand = async (formId) => {
    const isExpanding = expandedFormId !== formId;
    setExpandedFormId(isExpanding ? formId : null);

    if (isExpanding && !assignedCategories[formId]) {
      try {
        console.log("Fetching categories for form:", formId);
        const res = await backendApi.get(`/application_management/get_all_categories/${formId}/`);
        console.log("Response from API:", res.data);
        setAssignedCategories((prev) => ({
          ...prev,
          [formId]: res.data.categories || [],
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
  };

  const openCategoryModal = async (formId) => {
    setSelectedFormId(formId);
    setShowCategoryModal(true);

    try {
      console.log("Fetching all categories for form:", formId);
      const res = await backendApi.get(`/application_management/get_all_categories/${formId}/`);
      console.log("All categories response:", res.data);
      setAllCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching all categories:', error);
    }
  };

  // const assignCategoryToForm = (category) => {
  //   console.log("Assigning category to form:", { category, formId: selectedFormId });
  //   setAssignedCategories((prev) => ({
  //     ...prev,
  //     [selectedFormId]: [...(prev[selectedFormId] || []), category],
  //   }));
  //   setShowCategoryModal(false); // Close the category selection modal
  // };

  const assignCategoryToForm = (category) => {
    setAssignedCategories((prev) => {
      const currentAssigned = prev[selectedFormId] || [];
      const isAlreadyAssigned = currentAssigned.some((cat) => cat.id === category.id);
  
      const updatedCategories = isAlreadyAssigned
        ? currentAssigned.filter((cat) => cat.id !== category.id) // remove
        : [...currentAssigned, category]; // add
  
      return {
        ...prev,
        [selectedFormId]: updatedCategories,
      };
    });
  };
  
  const getUnassignedCategories = () => {
    const assigned = assignedCategories[selectedFormId] || [];
    const assignedIds = new Set(assigned.map((cat) => cat.id));
    return allCategories.filter((cat) => !assignedIds.has(cat.id));
  };

  const handleOpenAssignModal = (formId, categoryId) => {
    console.log("Opening assign modal for form & category:", formId, categoryId);
    setSelectedFormId(formId);
    setSelectedCategoryId(categoryId);
    setAssignCategoryModalOpen(true);
  };
  
  // const handleOpenAssignModal = (formId) => {
  //   console.log("Opening assign modal for form:", formId);
  //   setSelectedFormId(formId);
  //   setAssignCategoryModalOpen(true);
  // };

  const handleCloseAssignModal = () => {
    console.log("Closing assign modal");
    setAssignCategoryModalOpen(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Forms</h2>

      {!forms?.length ? (
        <p>No forms available.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b px-4 py-2 text-left">Form Name</th>
              <th className="border-b px-4 py-2 text-left">Description</th>
              <th className="border-b px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <React.Fragment key={form.id}>
                <tr>
                  <td className="border-b px-4 py-2">{form.name}</td>
                  <td className="border-b px-4 py-2">{form.description}</td>
                  <td className="border-b px-4 py-2 text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => toggleExpand(form.id)}
                    >
                      {expandedFormId === form.id ? 'Collapse' : 'Expand'}
                    </button>
                  </td>
                </tr>

                {expandedFormId === form.id && (
                  <tr>
                    <td colSpan="3" className="bg-gray-50 border-b px-4 py-4">
                      <div className="space-y-4">
                        <button
                          onClick={() => openCategoryModal(form.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Assign Categories
                        </button>

                        <div>
                          <h4 className="font-semibold mb-2">Assigned Categories</h4>
                          {assignedCategories[form.id]?.length ? (
                            <ul className="list-disc ml-6 space-y-1">
                              {assignedCategories[form.id].map((cat) => (
                                <li key={cat.id} className="flex justify-between items-center">
                                  <span>{cat.name}</span>
                                  <button
                                    onClick={() => handleOpenAssignModal(form.id, cat.id)}
                                    className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    Assign Questions
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500">No categories assigned yet.</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Categories</h3>
            {/* {getUnassignedCategories().length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {getUnassignedCategories().map((cat) => (
                  <li key={cat.id} className="flex justify-between items-center border-b py-1">
                    <span>{cat.name}</span>
                    <button
                      onClick={() => assignCategoryToForm(cat)}
                      className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Assign
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No unassigned categories available.</p>
            )} */}
            <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {allCategories.map((cat) => {
                    const isAssigned = assignedCategories[selectedFormId]?.some(
                      (assigned) => assigned.id === cat.id
                     );

                    return (
                      <li key={cat.id} className="flex items-center justify-between border-b py-1">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => assignCategoryToForm(cat)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <span>{cat.name}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>

            <div className="mt-4 text-right">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AssignModal - This component handles question assignments */}
      {/* {assignCategoryModalOpen && (
        <AssignModal
          isOpen={assignCategoryModalOpen}
          onClose={handleCloseAssignModal}
          form_id={selectedFormId}
          backendApi={backendApi}
        />
      )} */}
      <AssignModal
      isOpen={assignCategoryModalOpen}
      onClose={handleCloseAssignModal}
      form_id={selectedFormId}
      category_id={selectedCategoryId} // new prop
      backendApi={backendApi}
    />

    </div>
  );
};

export default FormList;