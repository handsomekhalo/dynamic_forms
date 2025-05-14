// 'use client';
// import React, { useState, useEffect } from 'react';
// import backendApi from '../../../../utils/backendApi';
// import { useAuth } from '../../../../AuthContext';

// const FormList = ({ forms, onAssignClick, onCategoryUpdate }) => {
//   const { authToken } = useAuth();
//   const [expandedFormId, setExpandedFormId] = useState(null);
//   const [allCategories, setAllCategories] = useState([]);
//   const [formCategories, setFormCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [toggleInProgress, setToggleInProgress] = useState(false);

//   // Fetch all categories on component mount
//   useEffect(() => {
//     const fetchAllCategories = async () => {
//       try {
//         const response = await backendApi.get('/application_management/get_all_categories/', {
//           headers: { Authorization: `Token ${authToken}` },
//         });
//         setAllCategories(response.data.categories || []);
//       } catch (error) {
//         console.error('Error fetching all categories:', error);
//       }
//     };
    
//     fetchAllCategories();
//   }, [authToken]);

//   const toggleExpand = async (formId) => {
//     if (expandedFormId === formId) {
//       setExpandedFormId(null);
//     } else {
//       setExpandedFormId(formId);
//       onAssignClick(formId); // Call the parent's onAssignClick to set the current form ID
//       await fetchCategoriesForForm(formId);
//     }
//   };

//   const fetchCategoriesForForm = async (formId) => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const formCatRes = await backendApi.get(`/application_management/get_assigned_categories/${formId}/`, {
//         headers: { Authorization: `Token ${authToken}` },
//       });
      
//       const assignedCategories = formCatRes.data.categories || [];
      
//       setFormCategories(assignedCategories.map(cat => ({
//         ...cat,
//         is_active: cat.is_active // Ensure is_active is included from response
//       })));

//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       setError('Failed to load categories');
//       setLoading(false);
//     }
//   };

//   // Re-fetch when expanded form changes
//   useEffect(() => {
//     if (expandedFormId) {
//       fetchCategoriesForForm(expandedFormId);
//     }
//   }, [expandedFormId]);

//   const isCategoryAssigned = (categoryId) => {
//     const category = formCategories.find(cat => cat.id === categoryId);
//     return category ? category.is_active : false;
//   };

//   const handleCategoryToggle = async (categoryId, formTypeId) => {
//     if (toggleInProgress) return;

//     try {
//       setToggleInProgress(true);
//       const isCurrentlyAssigned = isCategoryAssigned(categoryId);

//       if (isCurrentlyAssigned) {
//         // Unassign category
        
//         await backendApi.post(`/application_management/unassign_category/`, {
//           form_type_id: formTypeId,
//           main_category_id: categoryId,
//           deactivate: true  // Optional: set to true if you're marking it inactive instead of deleting
//         }, {
//           headers: { Authorization: `Token ${authToken}` },
//         });

//         // Immediately update UI to reflect change
//         setFormCategories(prev => prev.filter(cat => cat.id !== categoryId));

//         // Notify parent component that a category was updated
//         if (onCategoryUpdate) {
//           onCategoryUpdate();
//         }
//       } else {
//         // Assign category
//         await backendApi.post(`/application_management/assign_category/${formTypeId}/`, {
//           assignments: [{ category_id: categoryId, questions: [] }]
//         }, {
//           headers: { Authorization: `Token ${authToken}` },
//         });

//         // Add the newly assigned category to local state
//         const categoryToAdd = allCategories.find(cat => cat.id === categoryId);
//         if (categoryToAdd) {
//           setFormCategories(prev => [...prev, { ...categoryToAdd, is_active: true }]);
//         }

//         // Notify parent component that a category was updated
//         if (onCategoryUpdate) {
//           onCategoryUpdate();
//         }
//       }

//       // Refresh categories to ensure UI is in sync with backend
//       await fetchCategoriesForForm(formTypeId);

//     } catch (err) {
//       console.error('Failed to toggle category assignment:', err);
//       setError(`Failed to ${isCurrentlyAssigned ? 'unassign' : 'assign'} category: ${err.message}`);

//       // Refresh to ensure UI is in sync with actual backend state
//       await fetchCategoriesForForm(formTypeId);
//     } finally {
//       setToggleInProgress(false);
//     }
//   };

//   // Show question assignment modal for a category
//   const handleAssignQuestions = (categoryId) => {
//     // This should trigger the QuestionModal to open
//     // We'll delegate this to the parent component
//     onAssignClick(expandedFormId, categoryId);
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-2">Forms</h2>
      
//       {error && <div className="text-red-500 mb-2">{error}</div>}

//       {!forms?.length ? (
//         <div className="text-center py-8">
//           <p className="mb-4">No forms available.</p>
//         </div>
//       ) : (
//         <table className="min-w-full border-collapse">
//           <thead>
//             <tr>
//               <th className="border-b px-4 py-2 text-left">Form Name</th>
//               <th className="border-b px-4 py-2 text-left">Description</th>
//               <th className="border-b px-4 py-2 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {forms.map((form) => (
//               <React.Fragment key={form.id}>
//                 <tr>
//                   <td className="border-b px-4 py-2">{form.name}</td>
//                   <td className="border-b px-4 py-2">{form.description}</td>
//                   <td className="border-b px-4 py-2 text-center">
//                     <button
//                       className="text-blue-600 hover:text-blue-800"
//                       onClick={() => toggleExpand(form.id)}
//                     >
//                       {expandedFormId === form.id ? 'Collapse' : 'Expand'}
//                     </button>
//                   </td>
//                 </tr>
                
//                 {expandedFormId === form.id && (
//                   <tr>
//                     <td colSpan="3" className="bg-gray-50 border-b px-4 py-4">
//                       <div>
//                         <h4 className="font-semibold mb-2">Manage Categories</h4>
//                         {loading ? (
//                           <p>Loading categories...</p>
//                         ) : allCategories.length ? (
//                           <ul className="ml-2 space-y-2">
//                             {allCategories.map(cat => {
//                               const assigned = isCategoryAssigned(cat.id);
//                               return (
//                                 <li key={cat.id} className="flex items-center gap-2">
//                                   <input
//                                     type="checkbox"
//                                     id={`cat-${form.id}-${cat.id}`}
//                                     checked={assigned}
//                                     onChange={() => handleCategoryToggle(cat.id, form.id)}
//                                     disabled={toggleInProgress}
//                                     className="form-checkbox h-4 w-4 text-blue-600"
//                                   />
//                                   <label 
//                                     htmlFor={`cat-${form.id}-${cat.id}`} 
//                                     className={`select-none ${assigned ? 'font-medium' : 'text-gray-600'}`}
//                                   >
//                                     {cat.name}
//                                   </label>
//                                   {assigned && (
//                                     <button
//                                       onClick={() => handleAssignQuestions(cat.id)}
//                                       className="ml-2 text-blue-500 hover:text-blue-700"
//                                       title="Assign Questions"
//                                       disabled={toggleInProgress}
//                                     >
//                                       ✏️
//                                     </button>
//                                   )}
//                                 </li>
//                               );
//                             })}
//                           </ul>
//                         ) : (
//                           <p className="text-sm text-gray-500">No categories found.</p>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default FormList;
'use client';
import React, { useState, useEffect } from 'react';
import backendApi from '../../../../utils/backendApi';
import { useAuth } from '../../../../AuthContext';

const FormList = ({ forms, onAssignClick, onCategoryUpdate }) => {
  const { authToken } = useAuth();
  const [expandedFormId, setExpandedFormId] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [formCategories, setFormCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toggleInProgress, setToggleInProgress] = useState(false);

  // Fetch all categories on component mount
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await backendApi.get('/application_management/get_all_categories/', {
          headers: { Authorization: `Token ${authToken}` },
        });
        setAllCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching all categories:', error);
      }
    };
    
    fetchAllCategories();
  }, [authToken]);

  const toggleExpand = async (formId) => {
    if (expandedFormId === formId) {
      setExpandedFormId(null);
    } else {
      setExpandedFormId(formId);
      onAssignClick(formId); // Call the parent's onAssignClick to set the current form ID
      await fetchCategoriesForForm(formId);
    }
  };

  const fetchCategoriesForForm = async (formId) => {
    try {
      setLoading(true);
      setError(null);
      
      const formCatRes = await backendApi.get(`/application_management/get_assigned_categories/${formId}/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      
      const assignedCategories = formCatRes.data.categories || [];
      
      setFormCategories(assignedCategories.map(cat => ({
        ...cat,
        is_active: cat.is_active // Ensure is_active is included from response
      })));

      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
      setLoading(false);
    }
  };

  // Re-fetch when expanded form changes
  useEffect(() => {
    if (expandedFormId) {
      fetchCategoriesForForm(expandedFormId);
    }
  }, [expandedFormId]);

  const isCategoryAssigned = (categoryId) => {
    const category = formCategories.find(cat => cat.id === categoryId);
    return category ? category.is_active : false;
  };

  const handleCategoryToggle = async (categoryId, formTypeId) => {
    if (toggleInProgress) return;

    try {
      setToggleInProgress(true);
      const isCurrentlyAssigned = isCategoryAssigned(categoryId);

      if (isCurrentlyAssigned) {
        // Unassign category
        
        await backendApi.post(`/application_management/unassign_category/`, {
          form_type_id: formTypeId,
          main_category_id: categoryId,
          deactivate: true  // Optional: set to true if you're marking it inactive instead of deleting
        }, {
          headers: { Authorization: `Token ${authToken}` },
        });

        // Immediately update UI to reflect change
        setFormCategories(prev => prev.filter(cat => cat.id !== categoryId));

        // Notify parent component that a category was updated
        if (onCategoryUpdate) {
          onCategoryUpdate();
        }
      } else {
        // Assign category
        await backendApi.post(`/application_management/assign_category/${formTypeId}/`, {
          assignments: [{ category_id: categoryId, questions: [] }]
        }, {
          headers: { Authorization: `Token ${authToken}` },
        });

        // Add the newly assigned category to local state
        const categoryToAdd = allCategories.find(cat => cat.id === categoryId);
        if (categoryToAdd) {
          setFormCategories(prev => [...prev, { ...categoryToAdd, is_active: true }]);
        }

        // Notify parent component that a category was updated
        if (onCategoryUpdate) {
          onCategoryUpdate();
        }
      }

      // Refresh categories to ensure UI is in sync with backend
      await fetchCategoriesForForm(formTypeId);

    } catch (err) {
      console.error('Failed to toggle category assignment:', err);
      setError(`Failed to ${isCurrentlyAssigned ? 'unassign' : 'assign'} category: ${err.message}`);

      // Refresh to ensure UI is in sync with actual backend state
      await fetchCategoriesForForm(formTypeId);
    } finally {
      setToggleInProgress(false);
    }
  };

  // Show question assignment modal for a category
  const handleAssignQuestions = (categoryId) => {
    // This should trigger the QuestionModal to open
    // We'll delegate this to the parent component
    onAssignClick(expandedFormId, categoryId);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Forms</h2>
      
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {!forms?.length ? (
        <div className="text-center py-8">
          <p className="mb-4">No forms available.</p>
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
                        <h4 className="font-semibold mb-2">Manage Categories</h4>
                        {loading ? (
                          <p>Loading categories...</p>
                        ) : allCategories.length ? (
                          <ul className="ml-2 space-y-2">
                            {allCategories.map(cat => {
                              const assigned = isCategoryAssigned(cat.id);
                              return (
                                <li key={cat.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`cat-${form.id}-${cat.id}`}
                                    checked={assigned}
                                    onChange={() => handleCategoryToggle(cat.id, form.id)}
                                    disabled={toggleInProgress}
                                    className="form-checkbox h-4 w-4 text-blue-600"
                                  />
                                  <label 
                                    htmlFor={`cat-${form.id}-${cat.id}`} 
                                    className={`select-none ${assigned ? 'font-medium' : 'text-gray-600'}`}
                                  >
                                    {cat.name}
                                  </label>
                                  {assigned && (
                                    <button
                                      onClick={() => handleAssignQuestions(cat.id)}
                                      className="ml-2 text-blue-500 hover:text-blue-700"
                                      title="Assign Questions"
                                      disabled={toggleInProgress}
                                    >
                                      ✏️
                                    </button>
                                  )}
                                </li>
                              );
                            })}
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