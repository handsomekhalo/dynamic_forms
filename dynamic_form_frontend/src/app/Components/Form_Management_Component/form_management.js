'use client';
import React, { useState, useEffect } from 'react';
import backendApi from '../../../../utils/backendApi';
import { useAuth } from '../../../../AuthContext';

import FormList from './form_list';
import CreateButton from './create_button';
import FormModal from './form_modal';
import QuestionModal from './assign_questions_category_modal';
import CategoryModal from './category_modal';
import FormTabs from './Form_tabs_modal';
import { EnhancedFormList } from './Form_tabs_modal';
import AssignCategoryModal from './assign_caregories_modal';

export default function FormManagement() {
  const [forms, setForms] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [assignFormId, setAssignFormId] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDescriptionName, setNewDescriptionName] = useState('');
  const [categories, setCategories] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

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

  // Handle assignment modal open
  const handleAssignClick = (formId) => {
    setSelectedFormId(formId);
    setShowAssignModal(true);
  };
  
  // Handle question modal close
  const handleQuestionModalClose = (refreshNeeded = false) => {
    setShowQuestionModal(false);
    setCurrentCategoryId(null);
    
    // Optionally refresh data if changes were made
    if (refreshNeeded) {
      // Refresh list
      fetchForms();
    }
  };

  // Handle assign modal close with potential refresh
  const handleAssignModalClose = (refreshNeeded = false) => {
    setShowAssignModal(false);
    
    // If changes were made, refresh the forms list
    if (refreshNeeded) {
      fetchForms();
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Handle category assignment/unassignment
  const handleCategoryUpdate = () => {
    // Increment refresh trigger to force child components to refresh
    setRefreshTrigger(prev => prev + 1);
    fetchForms();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading) return;
      if (!authToken || !isAuthenticated) return navigate('/login');
      
      setLoading(true);
      await fetchForms();
    };

    fetchData();
  }, [authToken, isAuthenticated, navigate, isLoading]);

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Form Management</h1>
      <p className="text-gray-600 mb-6">
        Create and manage forms and categories. Assign categories to forms and questions to categories.
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
                  await backendApi.post('/application_management/create_category/', {
                    name: newCategoryName,
                    description: newDescriptionName,
                  });
                  setNewCategoryName('');
                  setNewDescriptionName('');
                  setShowCategoryModal(false);
                  // Refresh to show the new category
                  setRefreshTrigger(prev => prev + 1);
                  fetchForms();
                } catch (err) {
                  console.error(err.response?.data || err.message);
                  alert(err.response?.data?.error || 'Failed to create category.');
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
          />
        </>
      )}

      {/* Question Assignment Modal */}
      {showQuestionModal && assignFormId && currentCategoryId && (
        <QuestionModal
          categoryId={currentCategoryId}
          formId={assignFormId}
          onClose={handleQuestionModalClose}
        />
      )}

      {/* Category Assignment Modal */}
      {showAssignModal && (
        <AssignCategoryModal
          open={showAssignModal}
          formId={selectedFormId}
          onClose={handleAssignModalClose}
        />
      )}
    </div>
  );
}