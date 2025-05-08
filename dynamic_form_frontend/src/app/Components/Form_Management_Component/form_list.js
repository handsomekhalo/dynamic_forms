'use client';

import React, { useState, useEffect } from 'react';
import backendApi from '../../../../utils/backendApi';

const FormList = ({ forms, onCreateFormClick }) => {
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  const toggleExpand = (formId) => {
    setExpandedFormId(expandedFormId === formId ? null : formId);
  };

  // Fetch categories for the form once expanded
  const fetchCategoriesForForm = async (formId) => {
    try {
      const res = await backendApi.get(`/application_management/get_all_categories/${formId}/`);
      setAllCategories(res.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Trigger fetch when a form is expanded
  useEffect(() => {
    if (expandedFormId) {
      fetchCategoriesForForm(expandedFormId);
    }
  }, [expandedFormId]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Forms</h2>

      {!forms?.length ? (
        <div className="text-center py-8">
          <p className="mb-4">No forms available.</p>
          {onCreateFormClick && (
            <button
              onClick={onCreateFormClick}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create New Form
            </button>
          )}
        </div>
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
                      <div>
                        <h4 className="font-semibold mb-2">Tick to Assign/UnAssign category</h4>
                        {allCategories.length ? (
                          <ul className="ml-2 space-y-2">
                            {allCategories.map((cat) => (
                              <li key={cat.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-blue-600"
                                />
                                <label>{cat.name}</label>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No categories found.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FormList;
  