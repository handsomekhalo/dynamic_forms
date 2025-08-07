"use client";
import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from 'sweetalert2';
import CreateButton from "./create_button";
import FormModal from "./form_modal";
import CategoryModal from "./category_modal";
import FormTabs from "./Form_tabs_modal";
import { EnhancedFormList } from "./Form_tabs_modal";
import AssignCategoryModal from "./assign_caregories_modal";
import AssignQuestionToCategoryModal from "../Question_Management_Component/assign_questions_to_category_modal";
import UpdateFormModal from "./update_form_details_modal";

export default function FormManagement() {
  const [forms, setForms] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [assignFormId, setAssignFormId] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newDescriptionName, setNewDescriptionName] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
    const [showUpdateFormModal, setShowUpdateFormModal] = useState(false);
    


  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await backendApi.get(
        "/application_management/get_all_forms/"
      );
      const formsData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.forms)
        ? res.data.forms
        : [];
      setForms(formsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("Failed to load forms.");
      setLoading(false);
    }
  };

  const handleFormCreate = async () => {
    try {
      await backendApi.post("/application_management/create_form/", formData);
      setShowFormModal(false);
      setFormData({ name: "", description: "", is_active: true });
      fetchForms();
    } catch (err) {
      setError("Failed to create form.");
      console.error("Create form error:", err);
    }
  };


// const handleFormUpdate = async () => {
//   try {
//     await backendApi.post("/application_management/update_form_details/", {
//       formId: formData.id,
//       name: formData.name,
//       description: formData.description,
//       is_active: formData.is_active,
//     });

//     setShowFormModal(false);
//     fetchForms();
//   } catch (err) {
//     setError("Failed to update form.");
//     console.error("Update form error:", err);
//   }
// };

const handleFormUpdate = async () => {
  try {
    await backendApi.post("/application_management/update_form_details/", {
      formId: formData.id,
      name: formData.name,
      description: formData.description,
      is_active: formData.is_active,
    });

    setShowUpdateFormModal(false);
        fetchForms();


    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Form updated successfully.',
      confirmButtonText: "OK"
    }).then(() => {
      location.reload(); // or fetchForms() if you prefer not to reload the whole page
    });

  } catch (err) {
    setError("Failed to update form.");
    console.error("Update form error:", err);

    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: 'Something went wrong while updating the form.',
      confirmButtonText: "OK"
    });
  }
};


  const handleAssignClick = (formId) => {
    setSelectedFormId(formId);
    setShowAssignModal(true);
  };

  

  const handleUpdateClick = (form) => {
  setFormData(form); // preload form data
  // setShowUpdateFormModal(true);
  setShowUpdateFormModal(true)
  
}

  const handleAssignQuestionsClick = (formId) => {
    setAssignFormId(formId);
    setShowQuestionModal(true);
  };

  const handleAssignModalClose = (refreshNeeded = false) => {
    setShowAssignModal(false);
    if (refreshNeeded) {
      fetchForms();
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleQuestionModalClose = (refreshNeeded = false) => {
    setShowQuestionModal(false);
    setAssignFormId(null);
    if (refreshNeeded) {
      fetchForms();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading) return;
      if (!authToken || !isAuthenticated) return navigate("/login");
      setLoading(true);
      await fetchForms();
    };
    fetchData();
  }, [authToken, isAuthenticated, navigate, isLoading]);

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Form Management</h1>
      <p className="text-gray-600 mb-6">
        Create and manage forms and categories. Assign categories to forms and
        questions to categories.
      </p>

      {loading && !forms.length ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
          <p>Loading forms...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
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
                  await backendApi.post(
                    "/application_management/create_category/",
                    {
                      name: newCategoryName,
                      description: newDescriptionName,
                    }
                  );
                  setNewCategoryName("");
                  setNewDescriptionName("");
                  setShowCategoryModal(false);
                  setRefreshTrigger((prev) => prev + 1);
                  fetchForms();
                } catch (err) {
                  console.error(err.response?.data || err.message);
                  alert(
                    err.response?.data?.error || "Failed to create category."
                  );
                }
              }}
              onClose={() => setShowCategoryModal(false)}
            />
          )}

          <FormTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <EnhancedFormList
            forms={forms}
            activeTab={activeTab}
            onAssignClick={handleAssignClick}
            key={`form-list-${refreshTrigger}`}
            onAssignQuestionsClick={handleAssignQuestionsClick}
             onUpdateClick={handleUpdateClick} // <-- pass the handler

          />

          
        </>
      )}

      {showAssignModal && (
        <AssignCategoryModal
          open={showAssignModal}
          formId={selectedFormId}
          onClose={handleAssignModalClose}
        />
      )}

      {showQuestionModal && assignFormId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <AssignQuestionToCategoryModal
              open={showQuestionModal}
              formId={assignFormId}
              onClose={handleQuestionModalClose}
            />
          </div>
        </div>
      )}




{showUpdateFormModal && (
  <UpdateFormModal
    formData={formData}
    setFormData={setFormData}
    onUpdate={handleFormUpdate}
    onClose={() => setShowUpdateFormModal(false)}

  />
)}

    </div>
  )
}

