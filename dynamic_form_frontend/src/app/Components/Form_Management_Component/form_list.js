import React, { useState } from 'react';

const FormList = ({ forms }) => {
  const [expanded_form_id, setExpandedFormId] = useState(null);

  const handleFormExpand = (formId) => {
    setExpandedFormId(expanded_form_id === formId ? null : formId);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Forms</h2>
      {forms.length === 0 ? (
        <p>No forms available.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 px-4">Form Name</th>
              <th className="border-b py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id}>
                <td className="border-b py-2 px-4">{form.name}</td>
                <td className="border-b py-2 px-4">
                  <button
                    onClick={() => handleFormExpand(form.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {expanded_form_id === form.id ? 'Collapse' : 'Expand'}
                  </button>
                </td>
              </tr>
            ))}
            {expanded_form_id && (
              <tr>
                <td colSpan="2" className="border-b py-2 px-4">
                  {/* Add any expanded content related to the form */}
                  <div>Form details go here...</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FormList;
