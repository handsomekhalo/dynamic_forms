"use client"; // Ensure this is a client component

import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";
// import { useLocation } from "react-router-dom"; // Import useLocation to access the URL
// import { useRouter } from "next/router"; // Import useRouter from next/router
import { useRouter } from 'next/navigation'; // 


// export default function FormPortal_Management() {
 export default function FormPortal_Management({ magicLinkFormId = null, magicLinkUserId = null }) {

  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formDetails, setFormDetails] = useState([]);
  const [formAnswers, setFormAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordions, setOpenAccordions] = useState({});
  const [submittingCategory, setSubmittingCategory] = useState(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [documentList, setDocumentList] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  // const [selectedFileUrl, setSelectedFileUrl] = useState(null);
const [isDocumentLoading, setIsDocumentLoading] = useState(false);



  // const { authToken, isAuthenticated, navigate, isLoading } = useAuth();
    const auth = useAuth() || {};
    const { authToken, isAuthenticated, navigate, isLoading } = auth;  
    const router = useRouter(); // Get the router object

  // const location = useLocation(); // Get the current location

  // const isPublic = new URLSearchParams(location.search).get("public") === "true";
  // Check if the public query parameter is present
    const isPublic = router.query?.public === "true"; // Use optional chaining to avoid errors


//  useEffect(() => {
//     const fetchForms = async () => {
//       try {
//         const res = await backendApi.get(
//           "/application_management/get_all_forms/",
//           {
//             // headers: isPublic ? {} : { Authorization: `Token ${authToken}` }, // Add auth token only if not public
//             headers: (isPublic || magicLinkFormId) ? {} : { Authorization: `Token ${authToken}` },
//           }
//         );
//         console.log("Forms API response:", res.data);
//         setForms(res.data.forms || []);
//       } catch (error) {
//         console.error("Error fetching forms:", error);
//       }
//     };
//     fetchForms();
//   }, [authToken, isPublic]);
 
// Auto-select form when coming from magic link

useEffect(() => {
  const fetchForms = async () => {
    try {
      const res = await backendApi.get(
        "/application_management/get_all_forms/",
        {
          headers: (isPublic || magicLinkFormId) 
            ? {} 
            : { Authorization: `Token ${authToken}` },
        }
      );
      setForms(res.data.forms || []);
    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  // Only fetch forms list if NOT coming from magic link
  // Magic link skips the dropdown entirely
  if (!magicLinkFormId) {
    fetchForms();
  }
}, [authToken, isPublic, magicLinkFormId]);


  const getDocumentUrl = (fileUrl) => {
    if (!fileUrl) return "";

    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }

    if (fileUrl.startsWith("documents/")) {
      return `${
        process.env.REACT_APP_BASE_URL || "http://localhost:8000"
      }/${fileUrl}`;
    }

    return fileUrl;
  };

  

  const fetchDocumentAnswers = async () => {
    setLoadingAnswers(true);
    try {
      const res = await backendApi.get(
        `/form_portal_management/get_all_documents_for_user/`,
        {
          // headers: { Authorization: `Token ${authToken}` },
          headers: authToken ? { Authorization: `Token ${authToken}` } : {},

        }
      );

      if (res.data.status === "success") {
        const documents = res.data.documents || [];
        console.log("Fetched documents:", documents);

        // Build file answers map - only for documents that have question and main_category
        const documentMap = {};

        documents.forEach((doc) => {
          // Only process documents that have valid question and main_category (not null)
          if (doc.question !== null && doc.main_category !== null && doc.file) {
            const compositeKey = `${selectedFormId}-${doc.main_category}-${doc.question}`;

            // Handle different file URL formats
            let fileUrl = doc.file;
            if (fileUrl && typeof fileUrl === "string") {
              // If it's already a full URL, use as is
              if (fileUrl.startsWith("http")) {
                documentMap[compositeKey] = fileUrl;
              }
              // If it's a relative path, you might need to construct the full URL
              else if (fileUrl.startsWith("documents/")) {
                // Adjust this based on your backend URL structure
                documentMap[compositeKey] = `${
                  process.env.REACT_APP_BASE_URL || ""
                }/${fileUrl}`;
              }
              // Skip "Raw content" entries as they're not actual files
              else if (fileUrl !== "Raw content") {
                documentMap[compositeKey] = fileUrl;
              }
            }

            console.log(
              `Document mapping: ${compositeKey} -> ${documentMap[compositeKey]}`
            );
          } else {
            console.log(
              `Skipping document ${doc.id}: question=${doc.question}, main_category=${doc.main_category}`
            );
          }
        });

        console.log("Document map created:", documentMap);

        // Merge with existing form answers
        setFormAnswers((prev) => ({ ...prev, ...documentMap }));

        // Set document list for display (filter out null question/category docs if needed)
        const validDocuments = documents.filter(
          (doc) =>
            doc.question !== null &&
            doc.main_category !== null &&
            doc.file !== "Raw content"
        );
        setDocumentList(validDocuments);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoadingAnswers(false);
    }
  };


  const fetchFormAnswers = async (formId) => {
  setLoadingAnswers(true);
  try {
    const res = await backendApi.get(
      `/form_portal_management/get_form_answers_from_user/${formId}/`,
      {
        // headers: { Authorization: `Token ${authToken}` },
        headers: authToken ? { Authorization: `Token ${authToken}` } : {},

      }
    );

    if (res.data.status === "success") {
      const answers = res.data.data.answers || [];
      console.log("📦 API returns answers response:", answers);

      const answersMap = {};

      answers.forEach((answer) => {
        // Composite key: formId-categoryId-questionId
        const compositeKey = `${formId}-${answer.category_id}-${answer.question_id}`;
        let answerValue = "";

        // Handle file preview links using file_preview_url from backend
        if (answer.input_type === "file") {
          answerValue = answer.file_preview_url || answer.file_upload || "";
        }

        // Handle other input types
        else if (answer.response_text) {
          answerValue = answer.response_text;
        } else if (answer.selected_option_text) {
          answerValue = answer.selected_option_text;
        } else if (answer.response_number !== null) {
          answerValue = answer.response_number.toString();
        } else if (answer.response_date) {
          answerValue = answer.response_date;
        } else if (answer.response_boolean !== null) {
          answerValue = answer.response_boolean ? "checked" : "";
        }

        // Optional: Warn about duplicate keys
        if (answersMap[compositeKey]) {
          console.warn(`⚠️ Duplicate answer for key ${compositeKey}`);
        }

        answersMap[compositeKey] = answerValue;
      });

      // Debug output
      Object.entries(answersMap).forEach(([key, val]) => {
        console.log(`→ ${key}: ${val}`);
      });
      console.log("✅ Final answersMap:", answersMap);

      // Set to state
      setFormAnswers((prevAnswers) => ({ ...prevAnswers, ...answersMap }));
    }
  } catch (error) {
    console.error("❌ Error fetching form answers:", error);
    if (error.response && error.response.status !== 404) {
      console.warn(
        "⚠️ Failed to load existing answers:",
        error.response?.data?.message
      );
    }
  } finally {
    setLoadingAnswers(false);
  }
};


  const handleDocumentUpdate = async (docId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await backendApi.patch(
        `/form_portal_management/update_document/${docId}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200 || res.data.status === "success") {
        Swal.fire("Success", "Document updated successfully!", "success");
        fetchDocumentAnswers(); // Refresh
      }
    } catch (error) {
      console.error("Document update error:", error);
      Swal.fire("Error", "Failed to update document", "error");
    }
  };

  const handleFormSelect = async (formId) => {
    if (formId === selectedFormId) return;

    setSelectedFormId(formId);
    setFormDetails([]);
    setOpenAccordions({});
    setFormAnswers({});

    try {
      const res = await backendApi.get(
        `/form_portal_management/get_all_form_details/${formId}/`
      );
      const formDetailsData = res.data.formDetails || res.data || [];
      setFormDetails(Array.isArray(formDetailsData) ? formDetailsData : []);

      if (formDetailsData.length > 0) {
        setOpenAccordions({ [formDetailsData[0].id]: true });
      }

      // Fetch answers — if 404 (no submission yet) that's fine, just skip
      try {
        await fetchFormAnswers(formId);
      } catch (e) {
        // No prior answers — silent skip
      }

      // Only fetch documents if user has a submission for this form
      try {
        await fetchDocumentAnswers();
      } catch (e) {
        // No documents yet — silent skip  
      }

    } catch (err) {
      console.error("Error fetching form details:", err);
      setError("Failed to load form details.");
    }
  };

  useEffect(() => {
  if (magicLinkFormId) {
    handleFormSelect(magicLinkFormId);
  }
}, [magicLinkFormId]);


  
  // Add this helper function at the top of your component
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update your handleCategorySubmit function
  const handleCategorySubmit = async (formId, categoryId) => {
    // Prevent multiple submissions
    if (submittingCategory === categoryId) return;

    setSubmittingCategory(categoryId);

    try {
      // Get answers for this specific category
      const categoryAnswersRaw = Object.entries(formAnswers)
        .filter(([key]) => key.startsWith(`${formId}-${categoryId}-`))
        .map(([key, value]) => {
          const questionId = key.split("-")[2];
          return {
            question_id: parseInt(questionId),
            answer: value || "",
            key: key, // Keep the key for file processing
          };
        })
        .filter((answer) => answer.answer.toString().trim() !== "");

      if (categoryAnswersRaw.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Please answer at least one question in this category before submitting",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      // Process answers to handle files
      const categoryAnswers = [];
      for (const answer of categoryAnswersRaw) {
        // Check if this is a file field by finding the question in formDetails
        const question = formDetails
          .find((cat) => cat.id === categoryId)
          ?.questions?.find((q) => q.id === answer.question_id);

        if (question?.input_type === "file" && answer.answer instanceof File) {
          // Convert file to base64
          try {
            const base64Data = await fileToBase64(answer.answer);
            categoryAnswers.push({
              question_id: answer.question_id,
              answer: base64Data,
              is_file: true,
              filename: answer.answer.name,
              file_size: answer.answer.size,
              file_type: answer.answer.type,
            });
          } catch (error) {
            console.error(
              `Failed to process file for question ${answer.question_id}:`,
              error
            );
            Swal.fire({
              icon: "error",
              title: "File Error",
              text: `Failed to process file for question ${answer.question_id}. Please try again.`,
              confirmButtonColor: "#d33",
            });
            return;
          }
        } else {
          // Regular answer
          categoryAnswers.push({
            question_id: answer.question_id,
            answer: answer.answer,
          });
        }
      }

      const payload = {
        form_id: parseInt(formId),
        category_id: parseInt(categoryId),
        answers: categoryAnswers,
      };

      console.log("Submitting payload:", payload);

      const res = await backendApi.post(
        "/form_portal_management/submit_category_answers/",
        {
          headers: { Authorization: `Token ${authToken}`, payload },
        }
      );

      console.log("Submit success:", res.data);

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
        const errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          "Failed to submit category answers.";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to submit category answers. Please try again.",
          confirmButtonColor: "#d33",
        });
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
            <label className="form-label">
              {question.label || question.question_text}
            </label>
            <input
              type={question.input_type}
              className="form-control w-full p-2 border border-gray-300 rounded"
              value={value}
              onChange={(e) =>
                handleInputChange(
                  formId,
                  categoryId,
                  question.id,
                  e.target.value
                )
              }
              required={question.is_required}
              placeholder={
                question.input_type === "email" ? "Enter email address" : ""
              }
            />
          </div>
        );

      case "textarea":
        return (
          <div className="mb-3">
            <label className="form-label">
              {question.label || question.question_text}
            </label>
            <textarea
              className="form-control w-full p-2 border border-gray-300 rounded"
              rows={4}
              value={value}
              onChange={(e) =>
                handleInputChange(
                  formId,
                  categoryId,
                  question.id,
                  e.target.value
                )
              }
              required={question.is_required}
              placeholder="Enter your response..."
            />
          </div>
        );

      case "checkbox":
        return (
          <div className="mb-3">
            <label className="form-label">
              {question.label || question.question_text}
            </label>
            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={value === "checked"}
                  onChange={(e) =>
                    handleInputChange(
                      formId,
                      categoryId,
                      question.id,
                      e.target.checked ? "checked" : ""
                    )
                  }
                />
                Yes
              </label>
            </div>
          </div>
        );

      case "selection":
        return (
          <div className="mb-3">
            <label className="form-label">
              {question.label || question.question_text}
            </label>
            <select
              className="form-control w-full p-2 border border-gray-300 rounded"
              value={value}
              onChange={(e) =>
                handleInputChange(
                  formId,
                  categoryId,
                  question.id,
                  e.target.value
                )
              }
              required={question.is_required}
            >
              <option value="">Select an option</option>
              {question.options &&
                question.options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          </div>
        );
     

case "file":
  const fileKey = `${formId}-${categoryId}-${question.id}`;
  const existingFileUrl = formAnswers[fileKey];

  return (
    <div className="mb-3">
      <label className="form-label">
        {question.label || question.question_text}
      </label>

      {/* View Existing File */}
      {existingFileUrl &&
        typeof existingFileUrl === "string" &&
        existingFileUrl.startsWith("http") && (
          <div className="mb-2 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsDocumentLoading(true);
                setSelectedFileUrl(existingFileUrl);
              }}
              className="text-blue-600 underline text-sm"
            >
              View uploaded file
            </button>
          </div>
        )}

      {/* File Input */}
      <input
        type="file"
        className="form-control w-full p-2 border border-gray-300 rounded"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleInputChange(formId, categoryId, question.id, file);
          }
        }}
        required={question.is_required}
      />
    </div>
  );

      default:
        return (
          <div className="mb-3">
            <label className="form-label">
              {question.label || question.question_text}
            </label>
            <input
              type="text"
              className="form-control w-full p-2 border border-gray-300 rounded"
              value={value}
              onChange={(e) =>
                handleInputChange(
                  formId,
                  categoryId,
                  question.id,
                  e.target.value
                )
              }
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
    const categoryAnswers = Object.keys(formAnswers).filter(
      (key) =>
        key.startsWith(`${selectedFormId}-${categoryId}-`) &&
        typeof formAnswers[key] === "string" &&
        formAnswers[key].trim() !== ""
    );
    return categoryAnswers.length;
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-4xl mx-auto">

    <div className="p-6 bg-white shadow-md rounded-xl max-w-4xl mx-auto">
      {/* <h2 className="text-2xl font-bold mb-4">Form Answering Portal</h2> */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
    📄 Form Answering Portal
  </h2>

      {/* {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 border border-red-200">
          {error}
        </div>
      )} */}
      {error && (
  <div className="bg-red-100 text-red-800 p-4 rounded-lg border border-red-200 mb-6">
    {error}
  </div>
)}

      {/* <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">
          Select a Form
        </label>
        <select
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedFormId || ""}
          onChange={(e) => handleFormSelect(parseInt(e.target.value))}
        >
          <option value="">-- Choose Form --</option>
          {forms?.map?.((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))}
        </select>
      </div> */}

<div className="mb-8">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Select a Form
  </label>
  <select
    className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    value={selectedFormId || ""}
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

      {/* {loadingAnswers && (
        <div className="bg-blue-100 text-blue-600 p-3 rounded mb-4 border border-blue-200">
          Loading existing answers...
        </div>
      )}
       */}
      {loadingAnswers && (
  <div className="bg-blue-50 text-blue-700 p-3 rounded border border-blue-200 mb-4">
    ⏳ Loading existing answers...
  </div>
)}



      {formDetails.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Form Categories
          </h3>

          {formDetails.map((category) => {
            const answerCount = getCategoryAnswerCount(category.id);
            const totalQuestions = category.questions?.length || 0;

            return (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Accordion Header */}
                
                
                {/* <button
                  className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  onClick={() => toggleAccordion(category.id)}
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {category.name}
                    </h4>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
                      {answerCount > 0 && (
                        <span className="ml-2 text-green-600">
                          ({answerCount} answered)
                        </span>
                      )}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                      openAccordions[category.id] ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button> */}

<button
  // className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition border-b"
    className="w-full text-left px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium rounded-md transition duration-200 shadow-sm"

  onClick={() => toggleAccordion(category.id)}
>
  <div>
    <h4 className="text-lg font-semibold text-gray-800">{category.name}</h4>
    {category.description && (
      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
    )}
    <p className="text-xs text-gray-500 mt-1">
      {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
      {answerCount > 0 && (
        <span className="ml-2 text-green-600 font-medium">
          ({answerCount} answered)
        </span>
      )}
    </p>
  </div>
  <svg
    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
      openAccordions[category.id] ? "rotate-180" : ""
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
                        {sortQuestionsByOrder(category.questions).map(
                          (question) => {
                            const compositeKey = `${selectedFormId}-${category.id}-${question.id}`;
                            const hasExistingAnswer = formAnswers[compositeKey];

                            return (
                              // 
                              <div
  key={`${category.id}-${question.id}`}
  className={`p-4 rounded-xl transition ${
    hasExistingAnswer
      ? "bg-green-50 border border-green-200"
      : "bg-gray-50 border border-gray-200"
  }`}
>
  <div className="flex items-start justify-between mb-3">
    <label className="block font-medium text-gray-800 text-sm flex-1">
      {question.text || question.question_text}
      {question.is_required && (
        <span className="text-red-500 ml-1">*</span>
      )}
      {hasExistingAnswer && (
        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          Answered
        </span>
      )}
    </label>
    <div className="ml-4 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
      {question.input_type || "text"}
    </div>
  </div>

  <div className="mt-2">{renderInputField(question, selectedFormId, category.id)}</div>
</div>

                            );
                          }
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        No questions available for this category.
                      </p>
                    )}

                    {/* Submit Button */}
                    {/* <div className="pt-4 border-t border-gray-200 mt-6">
                      <button
                        className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                          submittingCategory === category.id
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                        onClick={() =>
                          handleCategorySubmit(selectedFormId, category.id)
                        }
                        disabled={submittingCategory === category.id}
                      >
                        {submittingCategory === category.id
                          ? "Submitting..."
                          : "Submit Category"}
                      </button>
                      {answerCount > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {answerCount} answer{answerCount !== 1 ? "s" : ""}{" "}
                          ready to submit
                        </p>
                      )}
                    </div> */}
                    <div className="pt-4 border-t mt-6">
  <button
    className={`py-2 px-5 font-semibold rounded-lg transition duration-200 shadow ${
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
      ✓ {answerCount} answer{answerCount !== 1 ? "s" : ""} ready to submit
    </p>
  )}
</div>

                  </div>
                )}
              </div>
            );
          })}

          {documentList.length > 0 && (
           
            <div className="mt-10">
  <h3 className="text-2xl font-semibold mb-6 text-gray-800">📎 Uploaded Documents</h3>
  <div className="space-y-4">
    {documentList.map((doc) => (
      <div
        key={doc.id}
        className="flex justify-between items-center p-5 bg-white border border-gray-200 shadow-sm rounded-xl"
      >
        <div>
          <p className="text-sm font-medium text-gray-700">
            Document ID: <span className="font-semibold text-gray-900">{doc.id}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Uploaded at: {new Date(doc.uploaded_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href={getDocumentUrl(doc.file)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            <span className="mr-1">👁️</span> View
          </a>

          <span className="text-xs text-gray-500 max-w-[200px] truncate">
            {getDocumentUrl(doc.file).split("/").pop()}
          </span>

          <label className="flex items-center text-green-600 hover:text-green-800 font-medium text-sm cursor-pointer">
            <span className="mr-1">✏️</span> Update
            <input
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleDocumentUpdate(doc.id, file);
              }}
            />
          </label>
        </div>
      </div>
    ))}
  </div>
</div>

          )}

          {/* Overall Form Submit Button (Optional) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              onClick={() => {
                console.log("All Form Answers:", formAnswers);
                Swal.fire({
                  icon: "info",
                  title: "Debug Info",
                  text: "Check console for all answers. Use individual category submit buttons to save.",
                  confirmButtonColor: "#3085d6",
                });
              }}
            >
              View All Answers (Debug)
            </button> */}
          </div>
        </div>
      )}
      {selectedFormId && formDetails.length === 0 && !loading && (
  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
    This form has no categories configured yet. Please contact your administrator.
  </div>
)}

{selectedFileUrl && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl w-[95%] max-w-5xl p-6 relative">
      <button
        onClick={() => setSelectedFileUrl(null)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
      >
        ✕
      </button>

      <div className="text-center font-bold text-lg mb-4">
        📑 Document Preview
      </div>

      {isDocumentLoading && (
        <div className="text-center text-blue-500 mb-4">
          Loading document...
        </div>
      )}

      <iframe
        id="document_frame"
        src={selectedFileUrl}
        title="Document Preview"
        className="w-full h-[70vh] border rounded"
        onLoad={() => setIsDocumentLoading(false)}
      />

      {!selectedFileUrl.includes(".pdf") && (
        <div className="text-center mt-4">
          <a
            href={selectedFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Open in new tab
          </a>
        </div>
      )}
    </div>
  </div>
)}


      
    </div>
    </div>
  );
}
