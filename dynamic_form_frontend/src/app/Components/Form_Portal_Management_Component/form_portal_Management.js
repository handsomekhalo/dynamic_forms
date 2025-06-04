"use client";
import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";

export default function FormPortal_Management() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formDetails, setFormDetails] = useState([]);
  const [formAnswers, setFormAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({});

  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await backendApi.get("/application_management/get_all_forms/");
        console.log("Forms API response:", res.data);
        setForms(res.data.forms || []);
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

  // const handleFormSelect = async (formId) => {
  //   setSelectedFormId(formId);
  //   setOpenAccordions({}); // Reset accordion states
  //   try {
  //     const res = await backendApi.get(`/form_portal_management/get_all_form_details/${formId}/`);
  //     console.log("Full API response:", res.data);
      
  //     // Extract the formDetails array from the response
  //     const formDetailsData = res.data.formDetails || res.data || [];
  //     setFormDetails(formDetailsData);
      
  //     // Auto-open all accordions when form is selected
  //     const initialAccordionState = {};
  //     if (Array.isArray(formDetailsData)) {
  //       formDetailsData.forEach(category => {
  //         initialAccordionState[category.id] = true;
  //       });
  //     }
  //     setOpenAccordions(initialAccordionState);
  //   } catch (err) {
  //     console.error("Error fetching form details:", err);
  //     setError("Failed to load form details.");
  //   }
  // };

  // const toggleAccordion = (categoryId) => {
  //   setOpenAccordions(prev => ({
  //     ...prev,
  //     [categoryId]: !prev[categoryId]
  //   }));
  // };
  const toggleAccordion = (categoryId) => {
  setOpenAccordions((prev) => {
    const isCurrentlyOpen = !!prev[categoryId];
    return isCurrentlyOpen ? {} : { [categoryId]: true };
  });
};


  const handleInputChange = (questionId, value) => {
    setFormAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // const renderInputField = (question) => {
  //   const commonClasses = "border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    
  //   switch (question.input_type) {
  //     case "text":
  //       return (
  //         <input
  //           type="text"
  //           className={commonClasses}
  //           value={formAnswers[question.id] || ""}
  //           onChange={(e) => handleInputChange(question.id, e.target.value)}
  //           required={question.is_required}
  //           placeholder="Enter text..."
  //         />
  //       );
      
  //     case "number":
  //       return (
  //         <input
  //           type="number"
  //           className={commonClasses}
  //           value={formAnswers[question.id] || ""}
  //           onChange={(e) => handleInputChange(question.id, e.target.value)}
  //           required={question.is_required}
  //           placeholder="Enter number..."
  //         />
  //       );
      
  //     case "textarea":
  //       return (
  //         <textarea
  //           className={`${commonClasses} h-24 resize-vertical`}
  //           value={formAnswers[question.id] || ""}
  //           onChange={(e) => handleInputChange(question.id, e.target.value)}
  //           required={question.is_required}
  //           placeholder="Enter your response..."
  //         />
  //       );
      
  //     case "checkbox":
  //       if (question.options && question.options.length > 0) {
  //         // Multiple checkbox options
  //         return (
  //           <div className="space-y-2">
  //             {question.options.map((option) => (
  //               <label key={option.id} className="flex items-center space-x-2">
  //                 <input
  //                   type="checkbox"
  //                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  //                   checked={formAnswers[question.id]?.includes(option.id) || false}
  //                   onChange={(e) => {
  //                     const currentValues = formAnswers[question.id] || [];
  //                     if (e.target.checked) {
  //                       handleInputChange(question.id, [...currentValues, option.id]);
  //                     } else {
  //                       handleInputChange(question.id, currentValues.filter(id => id !== option.id));
  //                     }
  //                   }}
  //                 />
  //                 <span>{option.text}</span>
  //               </label>
  //             ))}
  //           </div>
  //         );
  //       } else {
  //         // Single checkbox
  //         return (
  //           <label className="flex items-center space-x-2">
  //             <input
  //               type="checkbox"
  //               className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  //               checked={!!formAnswers[question.id]}
  //               onChange={(e) => handleInputChange(question.id, e.target.checked)}
  //             />
  //             <span>Yes</span>
  //           </label>
  //         );
  //       }
      
  //     case "select":
  //       return (
  //         <select
  //           className={commonClasses}
  //           value={formAnswers[question.id] || ""}
  //           onChange={(e) => handleInputChange(question.id, e.target.value)}
  //           required={question.is_required}
  //         >
  //           <option value="">-- Select an option --</option>
  //           {question.options?.map((option) => (
  //             <option key={option.id} value={option.id}>
  //               {option.text}
  //             </option>
  //           ))}
  //         </select>
  //       );
      
  //     case "file":
  //       return (
  //         <input
  //           type="file"
  //           className="border p-2 rounded w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  //           onChange={(e) => handleInputChange(question.id, e.target.files[0])}
  //           required={question.is_required}
  //         />
  //       );
      
  //     case "date":
  //       return (
  //         <input
  //           type="date"
  //           className={commonClasses}
  //           value={formAnswers[question.id] || ""}
  //           onChange={(e) => handleInputChange(question.id, e.target.value)}
  //           required={question.is_required}
  //         />
  //       );
      
  //     case "email":
  //       return (
  //         <input
  //           type="email"
  //           className={commonClasses}
  //           value={formAnswers[question.id] || ""}
  //           onChange={(e) => handleInputChange(question.id, e.target.value)}
  //           required={question.is_required}
  //           placeholder="Enter email address..."
  //         />
  //       );
      
  //     case "":
  //     case null:
  //     case undefined:
  //       return (
  //         <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
  //           <p className="text-yellow-800 text-sm">
  //             ⚠️ Input type not specified for this question
  //           </p>
  //           <input
  //             type="text"
  //             className={`${commonClasses} mt-2`}
  //             value={formAnswers[question.id] || ""}
  //             onChange={(e) => handleInputChange(question.id, e.target.value)}
  //             placeholder="Default text input..."
  //           />
  //         </div>
  //       );
      
  //     default:
  //       return (
  //         <div className="bg-red-50 border border-red-200 rounded p-3">
  //           <p className="text-red-600 text-sm">
  //             ❌ Unsupported input type: {question.input_type}
  //           </p>
  //         </div>
  //       );
  //   }
  // };

  const renderInputField = (question) => {
  const value = formAnswers[question.id] || "";

  const getField = () => {
    switch (question.input_type) {
      case "text":
      case "number":
      case "date":
      case "email":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label}</label>
            <input
              type={question.input_type}
              className="form-control"
              value={value}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.is_required}
            />
          </div>
        );

      case "textarea":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label}</label>
            <textarea
              className="form-control"
              rows={4}
              value={value}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.is_required}
            />
          </div>
        );

      case "file":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label}</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => handleInputChange(question.id, e.target.files[0])}
              required={question.is_required}
            />
          </div>
        );

      case "select":
        return (
          <div className="mb-3">
            <label className="form-label">{question.label}</label>
            <select
              className="form-select"
              value={value}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              required={question.is_required}
            >
              <option value="">-- Select --</option>
              {question.options?.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.text}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return <div>Unsupported input type</div>;
    }
  };

  // Full width for textarea and file, half for others
  const colClass =
    question.input_type === "textarea" || question.input_type === "file"
      ? "col-12"
      : "col-md-6";

  return <div className={colClass}>{getField()}</div>;
};


  const sortQuestionsByOrder = (questions) => {
    return [...questions].sort((a, b) => a.order - b.order);
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
          onChange={(e) => handleFormSelect(e.target.value)}
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
          
          {formDetails.map((category) => (
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
                    {category.questions.length} question{category.questions.length !== 1 ? 's' : ''}
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
                  {category.questions.length > 0 ? (
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
                            {renderInputField(question)}
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
                </div>
              )}
            </div>
          ))}
          
          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              onClick={() => {
                console.log('Form Answers:', formAnswers);
                // Add your submit logic here
              }}
            >
              Submit Form
            </button>
          </div>
        </div>
      )}
    </div>
  );
}