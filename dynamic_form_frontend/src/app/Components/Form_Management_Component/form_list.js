'use client';

import React, { useState } from 'react';
import backendApi from '../../../../utils/backendApi';

const FormList = ({ forms }) => {
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [assignedCategories, setAssignedCategories] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const toggleExpand = async (formId) => {
    const isExpanding = expandedFormId !== formId;
    setExpandedFormId(isExpanding ? formId : null);

    if (isExpanding && !assignedCategories[formId]) {
      try {
        const res = await backendApi.get(`/application_management/get_all_categories/${formId}/`);
        setAssignedCategories((prev) => ({
          ...prev,
          [formId]: res.data.categories || [],
        }));
      } catch (error) {
        console.error('Error fetching assigned categories:', error);
      }
    }
  };

  const handleAssignClick = async (formId) => {
    setSelectedFormId(formId);
    setShowModal(true);

    try {
      // const res = await backendApi.get('/application_management/get_all_categories/');
      const res = await backendApi.get(`/application_management/get_all_categories/${formId}/`);

      
      // const res = await backendApi.get(`/application_management/get_all_categories/${formId}/`);

      setAllCategories(res.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch all categories:', error);
    }
  };

  const assignCategoryToForm = (category) => {
    setAssignedCategories((prev) => ({
      ...prev,
      [selectedFormId]: [...(prev[selectedFormId] || []), category],
    }));
  };

  const getUnassignedCategories = () => {
    const assigned = assignedCategories[selectedFormId] || [];
    const assignedIds = new Set(assigned.map((cat) => cat.id));
    return allCategories.filter((cat) => !assignedIds.has(cat.id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Forms</h2>
      </div>

      {!forms || forms.length === 0 ? (
        <p>No forms available.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 px-4 text-left">Form Name</th>
              <th className="border-b py-2 px-4 text-left">Description</th>
              <th className="border-b py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <React.Fragment key={form.id}>
                <tr>
                  <td className="border-b py-2 px-4">{form.name}</td>
                  <td className="border-b py-2 px-4">{form.description}</td>
                  <td className="border-b py-2 px-4 text-center">
                    <button
                      onClick={() => toggleExpand(form.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {expandedFormId === form.id ? 'Collapse' : 'Expand'}
                    </button>
                  </td>
                </tr>

                {expandedFormId === form.id && (
                  <tr>
                    <td colSpan="3" className="border-b py-4 px-4 bg-gray-50">
                      <div className="space-y-3">
                        <button
                          onClick={() => handleAssignClick(form.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Assign Categories
                        </button>

                        <div>
                          <h4 className="font-semibold mb-2">Assigned Categories</h4>
                          {assignedCategories[form.id]?.length > 0 ? (
                            <ul className="list-disc ml-6 space-y-1">
                              {assignedCategories[form.id].map((cat) => (
                                <li key={cat.id} className="flex justify-between items-center">
                                  <span>{cat.name}</span>
                                  <button className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Categories</h3>
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
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormList;
