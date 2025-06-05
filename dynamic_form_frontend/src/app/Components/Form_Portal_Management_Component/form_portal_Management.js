"use client";
import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";


export default function FormPortal_Management() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formDetails, setFormDetails] = useState([]);
  const [formAnswers, setFormAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({});
  const [submittingCategory, setSubmittingCategory] = useState(null);

  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await backendApi.get("/application_management/get_all_forms/");
        console.log("Forms API response:", res.data);
        setForms(res.data.forms || []);
        // setForms(res.data || []);

      } catch (error) {
        console.error("Error fetching forms:", error);
      }
    };

    fetchForms();
  }, []);

  const handleFormSelect = async (formId) => {
    if (formId === selectedFormId) return; // Don't reload the same form

    setSelectedFormId(formId);
    setFormDetails([]);
    setOpenAccordions({}); // Reset open accordions
    setFormAnswers({}); // Reset form answers when switching forms
    
    try {
      const res = await backendApi.get(`/form_portal_management/get_all_form_details/${formId}/`);
      const formDetailsData = res.data.formDetails || res.data || [];
      setFormDetails(formDetailsData);

      // Open the first accordion only
      if (formDetailsData.length > 0) {
        setOpenAccordions({ [formDetailsData[0].id]: true });
      }
    } catch (err) {
      console.error("Error fetching form details:", err);
      setError("Failed to load form details.");
    }
  };

  const handleCategorySubmit = async (formId, categoryId) => {
    // Prevent multiple submissions
    if (submittingCategory === categoryId) return;
    
    setSubmittingCategory(categoryId);
    
    try {
      // Get answers for this specific category
      const categoryAnswers = Object.entries(formAnswers)
        .filter(([key]) => key.startsWith(`${formId}-${categoryId}-`))
        .map(([key, value]) => {
          const questionId = key.split("-")[2];
          return {
            question_id: parseInt(questionId), // Ensure it's a number
            answer: value || "", // Ensure we don't send null/undefined
          };
        })
        .filter(answer => answer.answer.trim() !== ""); // Only send non-empty answers

      if (categoryAnswers.length === 0) {
        // alert("Please answer at least one question in this category before submitting.");
        Swal.fire({
  icon: "error",
  title: "Failed",
  text: "Please answer at least one question in this category before submitting",
  confirmButtonColor: "#3085d6",
});
        return;
      }

      const payload = {
        form_id: parseInt(formId),
        category_id: parseInt(categoryId),
        answers: categoryAnswers,
      };

      console.log("Submitting payload:", payload);

      const res = await backendApi.post("/form_portal_management/submit_category_answers/", 
        {
          headers: { Authorization: `Token ${authToken}`, payload },
        },
        );
      
      console.log("Submit success:", res.data);
      // {
      //     headers: { Authorization: `Token ${authToken}` },
      
      // Show success message
Swal.fire({
  icon: "success",
  title: "Success",
  text: "Category answers submitted successfully!",
  confirmButtonColor: "#3085d6",
});
      
      // Optionally refresh form details to get updated state
      if (res.data.formDetails) {
        setFormDetails(res.data.formDetails);
      }
      
    } catch (error) {
      console.error("Submit error:", error);
      
      // Better error handling
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.response.data.error || "Failed to submit category answers.";
Swal.fire({
  icon: "error",
  title: "Error",
  text: "Failed to submit category answers. Please try again.",
  confirmButtonColor: "#d33",
});
      } else {
        alert("Failed to submit category answers. Please try again.");
      }
    } finally {
      setSubmittingCategory(null);
    }
  };

  const toggleAccordion = (categoryId) => {
    setOpenAccordions((prev) => {
      const isCurrentlyOpen = !!prev[categoryId];
      return isCurrentlyOpen ? {} : { [categoryId]: true };
    });
  };

  const handleInputChange = (formId, categoryId, questionId, value) => {
    const compositeKey = `${formId}-${categoryId}-${questionId}`;
    setFormAnswers((prev) => ({ ...prev, [compositeKey]: value }));
  };

  const renderInputField = (question, formId, categoryId) => {
    const compositeKey = `${formId}-${categoryId}-${question.id}`;
    const value = formAnswers[compositeKey] || "";

    switch (question.input_type) {
      case "text":
      case "number":
      case "date":
      case "email":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label || question.question_text}</label>
            <input
              type={question.input_type}
              className="form-control w-full p-2 border border-gray-300 rounded"
              value={value}
              onChange={(e) => handleInputChange(formId, categoryId, question.id, e.target.value)}
              required={question.is_required}
              placeholder={question.input_type === "email" ? "Enter email address" : ""}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label || question.question_text}</label>
            <textarea
              className="form-control w-full p-2 border border-gray-300 rounded"
              rows={4}
              value={value}
              onChange={(e) => handleInputChange(formId, categoryId, question.id, e.target.value)}
              required={question.is_required}
              placeholder="Enter your response..."
            />
          </div>
        );

      case "checkbox":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label || question.question_text}</label>
            <div className="mt-2">
              {/* This is a simplified checkbox - you might need to expand based on your question options */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={value === "checked"}
                  onChange={(e) => handleInputChange(formId, categoryId, question.id, e.target.checked ? "checked" : "")}
                />
                Yes
              </label>
            </div>
          </div>
        );
case "selection":
  return (
    <div className="mb-3">
      <label className="form-label">{question.label || question.question_text}</label>
      <select
        className="form-control w-full p-2 border border-gray-300 rounded"
        value={value}
        onChange={(e) => handleInputChange(formId, categoryId, question.id, e.target.value)}
        required={question.is_required}
      >
        <option value="">Select an option</option>
        {question.options && question.options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

      case "file":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label || question.question_text}</label>
            <input
              type="file"
              className="form-control w-full p-2 border border-gray-300 rounded"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleInputChange(formId, categoryId, question.id, file.name);
                  // You'll need to handle file upload separately
                }
              }}
              required={question.is_required}
            />
          </div>
        );

      default:
        return (
          <div className="mb-3">
            <label className="form-label">{question.label || question.question_text}</label>
            <input
              type="text"
              className="form-control w-full p-2 border border-gray-300 rounded"
              value={value}
              onChange={(e) => handleInputChange(formId, categoryId, question.id, e.target.value)}
              required={question.is_required}
            />
          </div>
        );
    }
  };

  const sortQuestionsByOrder = (questions) => {
    return [...questions].sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getCategoryAnswerCount = (categoryId) => {
    const categoryAnswers = Object.keys(formAnswers).filter(key => 
      key.startsWith(`${selectedFormId}-${categoryId}-`) && formAnswers[key]?.trim()
    );
    return categoryAnswers.length;
  };

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
          // onChange={(e) => handleFormSelect(e.target.value)}
          onChange={(e) => handleFormSelect(parseInt(e.target.value))}

        >
          <option value="">-- Choose Form --</option>
          {forms?.map?.((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))}
        </select>
      </div>

      {formDetails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Form Categories</h3>
          
          {formDetails.map((category) => {
            const answerCount = getCategoryAnswerCount(category.id);
            const totalQuestions = category.questions?.length || 0;
            
            return (
              <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Accordion Header */}
                <button
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors duration-200"
                  onClick={() => toggleAccordion(category.id)}
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

                {/* Accordion Content */}
                {openAccordions[category.id] && (
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    {category.questions && category.questions.length > 0 ? (
                      <div className="space-y-6">
                        {sortQuestionsByOrder(category.questions).map((question) => (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <label className="block font-medium text-gray-800 flex-1">
                                {question.text || question.question_text}
                                {question.is_required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                              <div className="ml-4 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {question.input_type || 'text'}
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              {renderInputField(question, selectedFormId, category.id)}
                            </div>
                            
                            {question.is_required && (
                              <p className="text-xs text-gray-500 mt-1">This field is required</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No questions available for this category.</p>
                    )}
                    
                    {/* Category Submit Button */}
                    <div className="pt-4 border-t border-gray-200 mt-6">
                      <button
                        className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                          submittingCategory === category.id
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                        onClick={() => handleCategorySubmit(selectedFormId, category.id)}
                        disabled={submittingCategory === category.id}
                      >
                        {submittingCategory === category.id ? "Submitting..." : "Submit Category"}
                      </button>
                      {answerCount > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {answerCount} answer{answerCount !== 1 ? 's' : ''} ready to submit
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Overall Form Submit Button (Optional) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              onClick={() => {
                console.log('All Form Answers:', formAnswers);
                alert('All categories have individual submit buttons. Use those to save each category separately.');
              }}
            >
              View All Answers (Debug)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}