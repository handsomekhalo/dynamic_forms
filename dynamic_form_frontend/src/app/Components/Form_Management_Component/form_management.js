  // 'use client';
  // import React, { useEffect, useState } from 'react';
  // import backendApi from '../../../../utils/backendApi';
  // import { useAuth } from '../../../../AuthContext';

  // import FormList from './form_list';
  // import CreateButton from './create_button';
  // import CategoryList from './category_list';
  // import FormModal from './form_modal';
  // import CategoryModal from './category_modal';
  // import AssignModal from './assign_modal';

  // export default function FormManagement() {
  //   const [forms, setForms] = useState([]);
  //   const [categories, setCategories] = useState([]);
  //   const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState(null);
  //   const assignedCategories = categories.filter(
  //     (category) => category.assigned_to !== null // Assuming `assigned_to` is the field used to check if assigned
  //   );

  //   const [showFormModal, setShowFormModal] = useState(false);
  //   const [showCategoryModal, setShowCategoryModal] = useState(false);
  //   const [newCategoryName, setNewCategoryName] = useState('');
  //   const [newDescriptionName, setNewDescriptionName] = useState('');
  //   const [showModal, setShowModal] = useState(false);


  //   const [assignFormId, setAssignFormId] = useState(null);
  //   const [showAssignModal, setShowAssignModal] = useState(false);

  //   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();


  //   const handleOpenModal = () => {
  //     setShowModal(true);  // Open the modal when button is clicked
  //   };

  //   const handleCloseModal = () => {
  //     setShowModal(false);  // Close the modal
  //   };

    
  //   const fetchForms = async () => {
  //     try {
  //       const res = await backendApi.get('/application_management/get_all_forms/');
  //       setForms(res.data.forms || []);
  //     } catch (err) {
  //       console.error('Error fetching forms:', err);
  //       setError('Failed to load forms.');
  //     }
  //   };

  //   const fetchCategories = async (formId) => {
  //     if (!formId) return;
  //     try {
  //       const res = await backendApi.get(`/application_management/get_categories_with_form_id/${formId}/`);
  //       setCategories(res.data.categories || []);
  //     } catch (err) {
  //       console.error('Failed to fetch categories:', err);
  //     }
  //   };

  //   const handleFormCreate = async () => {
  //     try {
  //       await backendApi.post('/application_management/create_form/', formData);
  //       await fetchForms();
  //       setFormData({ name: '', description: '', is_active: true });
  //       setShowFormModal(false);
  //     } catch (err) {
  //       console.error('Error creating form:', err.response?.data || err.message);
  //       alert(err.response?.data?.error || 'Failed to create form.');
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
  //         <p>Loading...</p>
  //       ) : error ? (
  //         <div className="text-red-500">{error}</div>
  //       ) : (
  //         <>
  //           <CreateButton
  //             onCreateFormClick={() => {
  //               setShowFormModal(true);
  //               setShowCategoryModal(false);
  //             }}
  //             onCreateCategoryClick={() => {
  //               setShowCategoryModal(true);
  //               setShowFormModal(false);
  //             }}
  //           />

  //           {showFormModal && (
  //             <FormModal
  //               formData={formData}
  //               setFormData={setFormData}
  //               onSubmit={handleFormCreate}
  //               onClose={() => setShowFormModal(false)}
  //             />
  //           )}

  //           {showCategoryModal && (
  //             <CategoryModal
  //               newCategoryName={newCategoryName}
  //               setNewCategoryName={setNewCategoryName}
  //               newDescriptionName={newDescriptionName}
  //               setNewDescriptionName={setNewDescriptionName}
  //               onSubmit={async () => {
  //                 try {
  //                   await backendApi.post('/application_management/create_category/', {
  //                     name: newCategoryName,
  //                     description: newDescriptionName,
  //                   });
  //                   setNewCategoryName('');
  //                   setNewDescriptionName('');
  //                   setShowCategoryModal(false);
  //                   fetchCategories(assignFormId);
  //                 } catch (err) {
  //                   console.error(err.response?.data || err.message);
  //                   alert(err.response?.data?.error || 'Failed to create category.');
  //                 }
  //               }}
  //               onClose={() => setShowCategoryModal(false)}
  //             />
  //           )}

  //           <div className="grid grid-cols-2 gap-6 mt-6">

  //             {/* <FormList
  //                 forms={forms}
  //                 allCategories={assignedCategories} // Only pass assigned categories here
  //                 fetchCategories={fetchCategories}
  //                 onAssignClick={async (formId) => {
  //                   await fetchCategories(formId);  // Fetch all categories (assigned and unassigned)
  //                   setAssignFormId(formId);
  //                   setShowAssignModal(true);
                    
  //                 }}
  //               /> */}
  //               <FormList
  //                     forms={forms}
  //                     allCategories={assignedCategories} // Only pass assigned categories here
  //                     fetchCategories={fetchCategories}
  //                     onAssignClick={async (formId) => {
  //                       console.log("Form ID to AssignModal:", formId); // Check if this logs the correct ID
  //                       await fetchCategories(formId);  // Fetch all categories (assigned and unassigned)
  //                       setAssignFormId(formId);
  //                       setShowAssignModal(true); // Trigger AssignModal visibility
  //                     }}
  //                   />


  //             <CategoryList
  //               categories={categories}
  //               fetchCategories={fetchCategories}
  //               form_id={assignFormId}
  //             />
  //           </div>

  //           {/* {showAssignModal && (
  //             <AssignModal
  //               formId={assignFormId}
  //               categories={categories}
  //               onClose={() => setShowAssignModal(false)}
  //             />
  //           )} */}
  //           {showAssignModal && (
  //   <AssignModal
  //     isOpen={showAssignModal}  // Ensure isOpen prop is passed
  //     form_id={assignFormId}    // Pass form_id as a prop to ensure categories are fetched
  //     onClose={() => setShowAssignModal(false)}
  //     backendApi={backendApi}
  //   />
  // )}

  //         </>
  //       )}
  //     </div>
  //   );
  // }
'use client';
import React, { useEffect, useState } from 'react';
import backendApi from '../../../../utils/backendApi';
import { useAuth } from '../../../../AuthContext';

import FormList from './form_list';
import CreateButton from './create_button';
import CategoryList from './category_list';
import FormModal from './form_modal';
import CategoryModal from './category_modal';
import AssignModal from './assign_modal';

export default function FormManagement() {
  const [forms, setForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const assignedCategories = categories.filter(
    (category) => category.assigned_to !== null
  );

  const [showFormModal, setShowFormModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDescriptionName, setNewDescriptionName] = useState('');

  const [assignFormId, setAssignFormId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  const fetchForms = async () => {
    try {
      const res = await backendApi.get('/application_management/get_all_forms/');
      setForms(res.data.forms || []);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError('Failed to load forms.');
    }
  };

  const fetchCategories = async (formId) => {
    if (!formId) return;
    try {
      const res = await backendApi.get(`/application_management/get_categories_with_form_id/${formId}/`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleFormCreate = async () => {
    try {
      await backendApi.post('/application_management/create_form/', formData);
      await fetchForms();
      setFormData({ name: '', description: '', is_active: true });
      setShowFormModal(false);
    } catch (err) {
      console.error('Error creating form:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to create form.');
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
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">Form Management</h1>
      <p className="text-gray-600 mb-6">Create and manage forms and categories here.</p>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <CreateButton
            onCreateFormClick={() => {
              setShowFormModal(true);
              setShowCategoryModal(false);
            }}
            onCreateCategoryClick={() => {
              setShowCategoryModal(true);
              setShowFormModal(false);
            }}
          />

          {showFormModal && (
            <FormModal
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleFormCreate}
              onClose={() => setShowFormModal(false)}
            />
          )}

          {showCategoryModal && (
            <CategoryModal
              newCategoryName={newCategoryName}
              setNewCategoryName={setNewCategoryName}
              newDescriptionName={newDescriptionName}
              setNewDescriptionName={setNewDescriptionName}
              onSubmit={async () => {
                try {
                  await backendApi.post('/application_management/create_category/', {
                    name: newCategoryName,
                    description: newDescriptionName,
                  });
                  setNewCategoryName('');
                  setNewDescriptionName('');
                  setShowCategoryModal(false);
                  fetchCategories(assignFormId);
                } catch (err) {
                  console.error(err.response?.data || err.message);
                  alert(err.response?.data?.error || 'Failed to create category.');
                }
              }}
              onClose={() => setShowCategoryModal(false)}
            />
          )}

          <div className="grid grid-cols-2 gap-6 mt-6">
            <FormList
              forms={forms}
              allCategories={assignedCategories}
              fetchCategories={fetchCategories}
              onAssignClick={async (formId) => {
                await fetchCategories(formId);
                setAssignFormId(formId);
                setShowAssignModal(true);
              }}
            />

            <CategoryList
              categories={categories}
              fetchCategories={fetchCategories}
              form_id={assignFormId}
            />
          </div>

          {showAssignModal && (
            <AssignModal
              isOpen={showAssignModal}
              form_id={assignFormId}
              onClose={() => setShowAssignModal(false)}
              backendApi={backendApi}
            />
          )}
        </>
      )}
    </div>
  );
}
