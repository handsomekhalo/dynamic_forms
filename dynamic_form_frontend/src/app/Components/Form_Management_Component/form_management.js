// 'use client';

// // import React, { useEffect, useState } from 'react';
// // import backendApi from '../../../../utils/backendApi';
// // import { useAuth } from '../../../../AuthContext';

// // import FormList from './form_list';
// // import CreateButton from './create_button';
// // import CategoryList from './category_list';
// // import FormModal from './form_modal';

// // export default function FormManagement() {
// //   const [forms, setForms] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showFormModal, setShowFormModal] = useState(false);

// //   const [assignFormId, setAssignFormId] = useState(null);

// //   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

// //   const fetchForms = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await backendApi.get('/application_management/get_all_forms/');
// //       let formsData = Array.isArray(res.data) ? res.data : res.data.forms || [];
// //       setForms(formsData);
// //       setLoading(false);
// //     } catch (err) {
// //       console.error('Error fetching forms:', err);
// //       setError('Failed to load forms.');
// //       setLoading(false);
// //     }
// //   };

// //   const fetchCategories = async (formId) => {
// //     if (!formId) return;
// //     try {
// //       const res = await backendApi.get(`/application_management/get_categories_with_form_id/${formId}/`);
// //       const categoriesData = res.data.categories || [];
      
// //       // Initialize checkbox states for each category
// //       const updatedCategories = categoriesData.map((category) => ({
// //         ...category,
// //         isChecked: false, // Initially, none of the checkboxes are checked
// //       }));

// //       setCategories(updatedCategories);
// //     } catch (err) {
// //       console.error('Failed to fetch categories:', err);
// //     }
// //   };

// //   // const handleCheckboxChange = (categoryId) => {
// //   //   // Toggle the 'isChecked' state for the clicked category
// //   //   setCategories((prevCategories) =>
// //   //     prevCategories.map((category) =>
// //   //       category.id === categoryId
// //   //         ? { ...category, isChecked: !category.isChecked }
// //   //         : category
// //   //     )
// //   //   );
// //   // };

// //   const handleCheckboxChange = (categoryId) => {
// //     // Update the 'isChecked' state for the clicked category
// //     setCategories((prevCategories) =>
// //       prevCategories.map((category) =>
// //         category.id === categoryId
// //           ? { ...category, isChecked: !category.isChecked }  // Toggle the checkbox
// //           : category
// //       )
// //     );
// //   };

  
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setLoading(true);
// //       await fetchForms();
// //       setLoading(false);
// //     };

// //     if (isLoading) return;
// //     if (!authToken || !isAuthenticated) return navigate('/login');

// //     fetchData();
// //   }, [authToken, isAuthenticated, navigate, isLoading]);

// //   return (
// //     <div className="p-6 bg-white shadow-md rounded-2xl">
// //       <h1 className="text-2xl font-bold mb-4">Form Management</h1>
// //       <p className="text-gray-600 mb-6">Create and manage forms and categories here.</p>

// //       {loading ? (
// //         <p>Loading forms...</p>
// //       ) : error ? (
// //         <div className="text-red-500">{error}</div>
// //       ) : (
// //         <>
// //           <CreateButton
// //             onCreateFormClick={() => setShowFormModal(true)}
// //             onCreateCategoryClick={() => setShowCategoryModal(true)}
// //           />

// //           {showFormModal && (
// //             <FormModal
// //               formData={formData}
// //               setFormData={setFormData}
// //               onSubmit={handleFormCreate}
// //               onClose={() => setShowFormModal(false)}
// //             />
// //           )}

// //           <div className="grid grid-cols-2 gap-6 mt-6">
// //             <FormList
// //               forms={forms}
// //               onAssignClick={async (formId) => {
// //                 await fetchCategories(formId);
// //                 setAssignFormId(formId);
// //               }}
// //             />

// //             <CategoryList
// //               categories={categories}
// //               onCheckboxChange={handleCheckboxChange} // Pass the function to handle checkbox changes
// //               form_id={assignFormId}
// //               fetchCategories={fetchCategories}
// //               backendApi={backendApi}
// //             />
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // }
// // import React, { useEffect, useState } from 'react';
// // import backendApi from '../../../../utils/backendApi';
// // import { useAuth } from '../../../../AuthContext';

// // import FormList from './form_list';
// // import CreateButton from './create_button';
// // import CategoryList from './category_list';
// // import FormModal from './form_modal';

// // export default function FormManagement() {
// //   const [forms, setForms] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showFormModal, setShowFormModal] = useState(false);
// //   const [assignFormId, setAssignFormId] = useState(null);

// //   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

// //   const fetchForms = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await backendApi.get('/application_management/get_all_forms/');
// //       let formsData = Array.isArray(res.data) ? res.data : res.data.forms || [];
// //       setForms(formsData);
// //       setLoading(false);
// //     } catch (err) {
// //       console.error('Error fetching forms:', err);
// //       setError('Failed to load forms.');
// //       setLoading(false);
// //     }
// //   };

// //   const fetchCategories = async (formId) => {
// //     if (!formId) return;
// //     try {
// //       const res = await backendApi.get(`/application_management/get_categories_with_form_id/${formId}/`);
// //       const categoriesData = res.data.categories || [];
      
// //       // Initialize checkbox states for each category
// //       const updatedCategories = categoriesData.map((category) => ({
// //         ...category,
// //         isChecked: false, // Initially, none of the checkboxes are checked
// //       }));

// //       setCategories(updatedCategories);
// //     } catch (err) {
// //       console.error('Failed to fetch categories:', err);
// //     }
// //   };

// //   const handleCheckboxChange = (categoryId) => {
// //     // Update the 'isChecked' state for the clicked category
// //     setCategories((prevCategories) =>
// //       prevCategories.map((category) =>
// //         category.id === categoryId
// //           ? { ...category, isChecked: !category.isChecked }  // Toggle the checkbox
// //           : category
// //       )
// //     );
// //   };

// //   const handleAssignCategory = async (categoryId) => {
// //     try {
// //       const payload = [
// //         {
// //           category_id: categoryId,
// //           questions: [],  // Assuming no questions are being assigned at the moment
// //         },
// //       ];
// //       await backendApi.post(`/application_management/form/${assignFormId}/assign/`, {
// //         assignments: payload,
// //       });

// //       // Refresh categories list to remove assigned category
// //       fetchCategories(assignFormId);  // Fetch the updated categories after assignment
// //     } catch (err) {
// //       setError('Failed to assign category.');
// //       console.error('Assign error:', err);
// //     }
// //   };

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setLoading(true);
// //       await fetchForms();
// //       setLoading(false);
// //     };

// //     if (isLoading) return;
// //     if (!authToken || !isAuthenticated) return navigate('/login');

// //     fetchData();
// //   }, [authToken, isAuthenticated, navigate, isLoading]);

// //   return (
// //     <div className="p-6 bg-white shadow-md rounded-2xl">
// //       <h1 className="text-2xl font-bold mb-4">Form Management</h1>
// //       <p className="text-gray-600 mb-6">Create and manage forms and categories here.</p>

// //       {loading ? (
// //         <p>Loading forms...</p>
// //       ) : error ? (
// //         <div className="text-red-500">{error}</div>
// //       ) : (
// //         <>
// //           <CreateButton
// //             onCreateFormClick={() => setShowFormModal(true)}
// //             onCreateCategoryClick={() => setShowCategoryModal(true)}
// //           />

// //           {showFormModal && (
// //             <FormModal
// //               formData={formData}
// //               setFormData={setFormData}
// //               onSubmit={handleFormCreate}
// //               onClose={() => setShowFormModal(false)}
// //             />
// //           )}

// //           <div className="grid grid-cols-2 gap-6 mt-6">
// //             <FormList
// //               forms={forms}
// //               onAssignClick={async (formId) => {
// //                 await fetchCategories(formId);
// //                 setAssignFormId(formId);
// //               }}
// //             />

// //             <CategoryList
// //               categories={categories}
// //               onCheckboxChange={handleCheckboxChange} // Pass the function to handle checkbox changes
// //               onAssignCategory={handleAssignCategory} // Handle category assignment
// //             />
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // }
// import React, { useEffect, useState } from 'react';
// import backendApi from '../../../../utils/backendApi';
// import { useAuth } from '../../../../AuthContext';

// import FormList from './form_list';
// import CreateButton from './create_button';
// import CategoryList from './category_list';
// import FormModal from './form_modal';

// export default function FormManagement() {
//   const [forms, setForms] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showFormModal, setShowFormModal] = useState(false);
//   const [showCategoryModal, setShowCategoryModal] = useState(false);
//   const [assignFormId, setAssignFormId] = useState(null);

//   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

//   const fetchForms = async () => {
//     try {
//       setLoading(true);
//       const res = await backendApi.get('/application_management/get_all_forms/');
//       let formsData = Array.isArray(res.data) ? res.data : res.data.forms || [];
//       setForms(formsData);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching forms:', err);
//       setError('Failed to load forms.');
//       setLoading(false);
//     }
//   };

//   const fetchCategories = async (formId) => {
//     if (!formId) return;
//     try {
//       const res = await backendApi.get(`/application_management/get_categories_with_form_id/${formId}/`);
//       const categoriesData = res.data.categories || [];
      
//       // Initialize checkbox states for each category
//       const updatedCategories = categoriesData.map((category) => ({
//         ...category,
//         isChecked: false, // Initially, none of the checkboxes are checked
//       }));

//       setCategories(updatedCategories);
//     } catch (err) {
//       console.error('Failed to fetch categories:', err);
//     }
//   };

//   const handleCheckboxChange = (categoryId) => {
//     // Update the 'isChecked' state for the clicked category
//     setCategories((prevCategories) =>
//       prevCategories.map((category) =>
//         category.id === categoryId
//           ? { ...category, isChecked: !category.isChecked }  // Toggle the checkbox
//           : category
//       )
//     );
//   };

//   const handleAssignCategory = async (categoryId) => {
//     try {
//       const payload = [
//         {
//           category_id: categoryId,
//           questions: [],  // Assuming no questions are being assigned at the moment
//         },
//       ];
//       await backendApi.post(`/application_management/form/${assignFormId}/assign/`, {
//         assignments: payload,
//       });

//       // Refresh categories list to remove assigned category
//       fetchCategories(assignFormId);  // Fetch the updated categories after assignment
//     } catch (err) {
//       setError('Failed to assign category.');
//       console.error('Assign error:', err);
//     }
//   };

//   const handleFormCreate = async () => {
//     try {
//       await backendApi.post('/application_management/create_form/', formData);
//       setShowFormModal(false);
//       setFormData({ name: '', description: '', is_active: true }); // Reset form data
//       fetchForms(); // Refresh the forms list
//     } catch (err) {
//       setError('Failed to create form.');
//       console.error('Create form error:', err);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       await fetchForms();
//       setLoading(false);
//     };

//     if (isLoading) return;
//     if (!authToken || !isAuthenticated) return navigate('/login');

//     fetchData();
//   }, [authToken, isAuthenticated, navigate, isLoading]);

//   return (
//     <div className="p-6 bg-white shadow-md rounded-2xl">
//       <h1 className="text-2xl font-bold mb-4">Form Management</h1>
//       <p className="text-gray-600 mb-6">Create and manage forms and categories here.</p>

//       {loading ? (
//         <p>Loading forms...</p>
//       ) : error ? (
//         <div className="text-red-500">{error}</div>
//       ) : (
//         <>
//           <CreateButton
//             onCreateFormClick={() => setShowFormModal(true)}
//             onCreateCategoryClick={() => setShowCategoryModal(true)}
//           />

//           {showFormModal && (
//             <FormModal
//               formData={formData}
//               setFormData={setFormData}
//               onSubmit={handleFormCreate}
//               onClose={() => setShowFormModal(false)}
//             />
//           )}

//           <div className="grid grid-cols-2 gap-6 mt-6">
//             <FormList
//               forms={forms}
//               onAssignClick={async (formId) => {
//                 await fetchCategories(formId);
//                 setAssignFormId(formId);
//               }}
//             />

//             <CategoryList
//               categories={categories}
//               onCheckboxChange={handleCheckboxChange} // Pass the function to handle checkbox changes
//               onAssignCategory={handleAssignCategory} // Handle category assignment
//             />
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
'use client';

import React, { useState, useEffect } from 'react';
import backendApi from '../../../../utils/backendApi';
import { useAuth } from '../../../../AuthContext';

import FormList from './form_list';
import CreateButton from './create_button';
import CategoryList from './category_list';
import FormModal from './form_modal';

export default function FormManagement() {
  const [forms, setForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [assignFormId, setAssignFormId] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  // Fetch all forms
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await backendApi.get('/application_management/get_all_forms/');
      let formsData = Array.isArray(res.data) ? res.data : res.data.forms || [];
      setForms(formsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError('Failed to load forms.');
      setLoading(false);
    }
  };

  // Fetch categories with formId and initialize isChecked based on selectedCategoryIds for UI
  const fetchCategories = async (formId) => {
    if (!formId) return;
    try {
      const res = await backendApi.get(`/application_management/get_categories_with_form_id/${formId}/`);
      const categoriesData = res.data.categories || [];

      // Mark categories as checked if they are in selectedCategoryIds
      const updatedCategories = categoriesData.map((category) => ({
        ...category,
        isChecked: selectedCategoryIds.includes(category.id),
      }));

      setCategories(updatedCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to fetch categories.');
    }
  };

  // Toggle checkbox for individual category
  const handleCheckboxChange = (categoryId) => {
    setSelectedCategoryIds((prevSelected) => {
      if (prevSelected.includes(categoryId)) {
        return prevSelected.filter((id) => id !== categoryId);
      } else {
        return [...prevSelected, categoryId];
      }
    });

    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId ? { ...category, isChecked: !category.isChecked } : category
      )
    );
  };

  // Assign all selected categories to the current form
  const handleAssignSelectedCategories = async () => {
    if (!assignFormId || selectedCategoryIds.length === 0) {
      alert('Please select at least one category and a form to assign.');
      return;
    }
    try {
      const payload = selectedCategoryIds.map((category_id) => ({
        category_id,
        questions: [], // No questions for now
      }));
      await backendApi.post(`/application_management/form/${assignFormId}/assign/`, {
        assignments: payload,
      });
      // Refresh categories list and clear selection after assignment
      await fetchCategories(assignFormId);
      setSelectedCategoryIds([]);
    } catch (err) {
      console.error('Failed to assign categories:', err);
      setError('Failed to assign categories.');
    }
  };

  // Handle form creation
  const handleFormCreate = async () => {
    try {
      await backendApi.post('/application_management/create_form/', formData);
      setShowFormModal(false);
      setFormData({ name: '', description: '', is_active: true });
      fetchForms();
    } catch (err) {
      setError('Failed to create form.');
      console.error('Create form error:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchForms();
      setLoading(false);
    };

    if (isLoading) return;
    if (!authToken || !isAuthenticated) return navigate('/login');

    fetchData();
  }, [authToken, isAuthenticated, navigate, isLoading]);

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl max-w-screen-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Form Management</h1>
      <p className="text-gray-600 mb-6">Create and manage forms and categories here.</p>

      {loading ? (
        <p>Loading forms...</p>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <CreateButton
            onCreateFormClick={() => setShowFormModal(true)}
            onCreateCategoryClick={() => alert('Category creation handled elsewhere or modal removed.')}
          />

          {showFormModal && (
            <FormModal
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormCreate}
              onClose={() => setShowFormModal(false)}
            />
          )}

          <div className="grid grid-cols-1 gap-6 mt-6">
            <FormList
              forms={forms}
              onAssignClick={async (formId) => {
                setAssignFormId(formId);
                setSelectedCategoryIds([]); // Clear selections on form change
                await fetchCategories(formId);
              }}
            />

            {assignFormId && (
              <div className="mt-4 bg-gray-50 p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Categories for Selected Form</h2>
                {categories.length === 0 ? (
                  <p className="text-gray-500">No categories available.</p>
                ) : (
                  <ul>
                    {categories.map((category) => (
                      <li key={category.id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={category.isChecked || false}
                          onChange={() => handleCheckboxChange(category.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`category-${category.id}`} className="select-none">
                          {category.name}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={handleAssignSelectedCategories}
                  disabled={selectedCategoryIds.length === 0}
                  className={`mt-4 px-4 py-2 rounded font-semibold text-white ${
                    selectedCategoryIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Assign Selected Categories
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
