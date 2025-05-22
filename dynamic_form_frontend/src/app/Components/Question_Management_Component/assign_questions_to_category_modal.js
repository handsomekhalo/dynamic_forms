"use client";

import React, { useEffect, useState } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";

export default function AssignQuestionToCategoryModal({ formId, onClose }) {
  const { authToken } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingChanges, setSavingChanges] = useState(false);
  const [error, setError] = useState(null);
  const [categoryQuestionAssignments, setCategoryQuestionAssignments] = useState({});

  // Fetch initial data when component mounts or formId changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [questionsRes, formCategoriesRes] = await Promise.all([
          backendApi.get(`/question_management/get_questions/`, {
            headers: { Authorization: `Token ${authToken}` },
          }),
          backendApi.get(`/application_management/get_form_categories/${formId}/`, {
            headers: { Authorization: `Token ${authToken}` },
          }),
        ]);

        const allQuestions = questionsRes.data?.data?.questions || [];
        const formCategories = formCategoriesRes.data?.category_details || [];
        
        setQuestions(allQuestions);
        setCategories(formCategories);
        
        // Initialize the assignment tracking object
        const assignments = {};
        
        // For each category, fetch its assigned questions
        const assignmentsPromises = formCategories.map(async (category) => {
          try {
            const categoryQuestionsRes = await backendApi.get(
              `/question_management/get_questions_assigned_to_category/${formId}/categories/${category.id}/questions/`,
              {
                headers: { Authorization: `Token ${authToken}` },
              }
            );
        
            const questionIds = (categoryQuestionsRes.data?.questions || []).map(q => q.id);
            assignments[category.id] = new Set(questionIds);
          } catch (err) {
            console.error(`Failed to fetch questions for category ${category.id}:`, err);
            assignments[category.id] = new Set();
          }
        });
        
        // const assignmentsPromises = formCategories.map(async (category) => {
        //   try {
        //     const categoryQuestionsRes = await backendApi.get(
        //       `/question_management/get_category_questions/${category.id}/`,
        //       {
        //         headers: { Authorization: `Token ${authToken}` },
        //       }
        //     );
            
        //     // Extract question IDs based on the response structure
        //     const questionIds = (categoryQuestionsRes.data?.questions || []).map(q => q.id);
        //     assignments[category.id] = new Set(questionIds);
        //   } catch (err) {
        //     console.error(`Failed to fetch questions for category ${category.id}:`, err);
        //     assignments[category.id] = new Set();
        //   }
        // });
        
        await Promise.all(assignmentsPromises);
        setCategoryQuestionAssignments(assignments);
        
      } catch (err) {
        console.error("Error fetching data", err);
        setError("Failed to load questions or categories.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchData();
    }
  }, [authToken, formId]);

  const handleCategoryClick = (categoryId) => {
    // If clicking on the same category, collapse it
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
    } else {
      setExpandedCategoryId(categoryId);
    }
  };

  const handleCheckboxChange = async (questionId, categoryId, checked) => {
    // Update local state immediately for responsiveness
    setCategoryQuestionAssignments(prev => {
      const newAssignments = { ...prev };
      
      // Create the set if it doesn't exist
      if (!newAssignments[categoryId]) {
        newAssignments[categoryId] = new Set();
      }
      
      // Update the set based on the checkbox status
      if (checked) {
        newAssignments[categoryId].add(questionId);
      } else {
        newAssignments[categoryId].delete(questionId);
      }
      
      return newAssignments;
    });
    
    // Make the API call to update the assignment
    setSavingChanges(true);
    try {
      if (checked) {
        // Assign the question to the category
        await backendApi.post(
          "/question_management/add_or_assign_questions_to_category/",
          {
            category_id: categoryId,
            question_ids: [questionId],
            form_type_id: formId,
          },
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          }
        );
      } else {
        // Remove the question from the category
        await backendApi.post(
          "/question_management/remove_assigned_question/",
          {
            main_category_id: categoryId,
            question_id: questionId,
            form_type_id:formId
          },
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          }
        );
      }
      
      // No need to show success message for every change to avoid annoying the user
      console.log(`Question ${questionId} ${checked ? 'assigned to' : 'removed from'} category ${categoryId}`);
      
    } catch (err) {
      console.error("Failed to update question assignment", err);
      
      // Revert local state if API call fails
      setCategoryQuestionAssignments(prev => {
        const newAssignments = { ...prev };
        
        if (checked) {
          newAssignments[categoryId].delete(questionId);
        } else {
          newAssignments[categoryId].add(questionId);
        }
        
        return newAssignments;
      });
      
      Swal.fire("Error", "Failed to update question assignment", "error");
    } finally {
      setSavingChanges(false);
    }
  };

  const isQuestionAssigned = (questionId, categoryId) => {
    return categoryQuestionAssignments[categoryId]?.has(questionId) || false;
  };
  
  const getAssignedQuestionCount = (categoryId) => {
    return categoryQuestionAssignments[categoryId]?.size || 0;
  };
  
  const handleClose = () => {
    // Call parent component's onClose with a refresh flag
    onClose(true);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Questions to Categories</h2>
          {savingChanges && (
            <span className="text-sm text-blue-600">(Saving changes...)</span>
          )}
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin h-6 w-6 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                // Re-trigger the useEffect by forcing a re-render
                const timer = setTimeout(() => {
                  setLoading(false);
                }, 500);
                return () => clearTimeout(timer);
              }}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Categories as accordion */}
            <div className="mb-4 border rounded max-h-72 overflow-auto">
              {categories.length === 0 ? (
                <p className="p-4 text-center text-gray-500">No categories available.</p>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category.id)}
                      className="w-full text-left px-4 py-2 flex justify-between items-center bg-gray-100 hover:bg-gray-200"
                    >
                      <span>{category.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {getAssignedQuestionCount(category.id)} questions
                        </span>
                        <span>{expandedCategoryId === category.id ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {expandedCategoryId === category.id && (
                      <div className="p-4 bg-white border-t">
                        {questions.length === 0 ? (
                          <p className="text-gray-500">No questions available.</p>
                        ) : (
                          questions.map((q) => (
                            <div
                              key={q.id}
                              className={`p-2 rounded ${
                                isQuestionAssigned(q.id, category.id)
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isQuestionAssigned(q.id, category.id)}
                                  onChange={(e) => 
                                    handleCheckboxChange(q.id, category.id, e.target.checked)
                                  }
                                  className="mt-1"
                                />
                                <span>{q.text}</span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer with close button */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Click checkboxes to assign/unassign questions
              </div>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                type="button"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}