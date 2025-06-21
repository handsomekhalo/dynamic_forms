"use client";
import React from "react";
import UseFormPortalManagement from "./form_portal_Management";
const FormPortal = () => {
  const {
    forms,
    selectedFormId,
    formDetails,
    formAnswers,
    loading,
    error,
    openAccordions,
    setOpenAccordions, // Make sure this is included
    submittingCategory,
    loadingAnswers,
    documentList,
    handleFormSelect,
  } = UseFormPortalManagement();

  const getCategoryAnswerCount = (categoryId) => {
    return Object.keys(formAnswers).filter(key => 
      key.startsWith(`${selectedFormId}-${categoryId}-`) && 
      typeof formAnswers[key] === 'string' &&
      formAnswers[key].trim() !== ""
    ).length;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-md rounded-xl max-w-4xl mx-auto">
        <div className="bg-blue-100 text-blue-600 p-3 rounded mb-4 border border-blue-200">
          Loading forms...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Form Answering Portal</h2>

      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">Select a Form</label>
        <select
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedFormId || ""}
          onChange={(e) => handleFormSelect(parseInt(e.target.value))}
        >
          <option value="">-- Choose Form --</option>
          {forms && forms.length > 0 && forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))}
        </select>
      </div>

      {loadingAnswers && (
        <div className="bg-blue-100 text-blue-600 p-3 rounded mb-4 border border-blue-200">
          Loading existing answers...
        </div>
      )}

      {formDetails && formDetails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Form Categories</h3>
          
          {formDetails.map((category) => {
            const answerCount = getCategoryAnswerCount(category.id);
            const totalQuestions = category.questions?.length || 0;
            
            return (
              <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Category header with accordion toggle */}
                <button
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors duration-200"
                  onClick={() => setOpenAccordions(prev => ({
                    ...prev,
                    [category.id]: !prev[category.id]
                  }))}
                >
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-gray-800">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {totalQuestions} question{totalQuestions !== 1 ? 's' : ''} 
                      {answerCount > 0 && (
                        <span className="ml-2 text-green-600">({answerCount} answered)</span>
                      )}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      openAccordions[category.id] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Category content (shown when accordion is open) */}
                {openAccordions[category.id] && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    {/* Render questions here */}
                    {category.questions && category.questions.length > 0 ? (
                      <div className="space-y-4">
                        {category.questions.map(question => (
                          <div key={question.id} className="p-4 bg-gray-50 rounded">
                            <h5 className="font-medium">{question.text}</h5>
                            {/* Render appropriate input field based on question type */}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No questions in this category</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormPortal;