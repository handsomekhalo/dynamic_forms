"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import backendApi from "../../../utils/backendApi";
import { useAuth } from "../../../AuthContext";
import Swal from "sweetalert2";

export default function AssignQuestionToCategoryModal({ formId, onClose }) {
  const { authToken } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryAssignments, setCategoryAssignments] = useState({});
  const [openAccordions, setOpenAccordions] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!formId || !authToken) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [questionsRes, categoriesRes] = await Promise.all([
          backendApi.get("/question_management/get_questions/", {
            // headers: { Authorization: `Bearer ${authToken}` },
                        headers: { Authorization: `Token ${authToken}` },

            
          }),
          backendApi.get(`/application_management/get_form_categories/${formId}/`, {
            // headers: { Authorization: `Bearer ${authToken}` },
            headers: { Authorization: `Token ${authToken}` },

          }),
        ]);

        const fetchedQuestions = questionsRes.data?.data?.questions ?? [];
        const fetchedCategories = categoriesRes.data?.category_details ?? [];

        setQuestions(fetchedQuestions);
        setCategories(fetchedCategories);

        // Fetch assignments for each category
        const assignments = {};
        await Promise.all(
          fetchedCategories.map(async (category) => {
            try {
              const endpoint = `/question_management/get_questions_assigned_to_category/${formId}/categories/${category.id}/questions/?detail=true`;

              const res = await backendApi.get(endpoint, {
                // headers: { Authorization: `Bearer ${authToken}` },
                headers: { Authorization: `Token ${authToken}` },

              });

              // Backend returns assigned_questions under data
              const assignedQuestions = res.data?.data?.assigned_questions || [];
              assignments[category.id] = new Set(assignedQuestions.map((q) => q.id));
            } catch (err) {
              console.error(`Error fetching assignments for category ${category.id}:`, err);
              assignments[category.id] = new Set();
            }
          })
        );

        setCategoryAssignments(assignments);
      } catch (err) {
        console.error("Data fetching failed:", err);
        setError("Failed to load questions or categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, formId]);

  const updateCategoryAssignment = (categoryId, questionId, isAssigned) => {
    setCategoryAssignments((prev) => {
      const newAssignments = { ...prev };
      const categorySet = new Set(prev[categoryId] || []);

      if (isAssigned) {
        categorySet.add(questionId);
      } else {
        categorySet.delete(questionId);
      }

      newAssignments[categoryId] = categorySet;
      return newAssignments;
    });
  };

  const updateCategoryAssignmentsBulk = (categoryId, questionIds, isAssigned) => {
    setCategoryAssignments((prev) => {
      const newAssignments = { ...prev };
      const categorySet = new Set(prev[categoryId] || []);

      questionIds.forEach((questionId) => {
        if (isAssigned) {
          categorySet.add(questionId);
        } else {
          categorySet.delete(questionId);
        }
      });

      newAssignments[categoryId] = categorySet;
      return newAssignments;
    });
  };

  const toggleQuestion = async (categoryId, questionId) => {
    const assignedIds = categoryAssignments[categoryId] || new Set();
    const isCurrentlyAssigned = assignedIds.has(questionId);
    const assign = !isCurrentlyAssigned;

    // Optimistic UI update
    updateCategoryAssignment(categoryId, questionId, assign);
    setIsSaving(true);

    try {
      const url = assign
        ? "/question_management/add_or_assign_questions_to_category/"
        : "/question_management/remove_assigned_question/";

      const payload = assign
        ? { category_id: categoryId, question_ids: [questionId], form_type_id: formId }
        : { main_category_id: categoryId, question_id: questionId, form_type_id: formId };

      await backendApi.post(url, payload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      

      });
    } catch (err) {
      console.error("Error updating question assignment:", err);
      Swal.fire("Error", `Could not ${assign ? "assign" : "unassign"} question`, "error");
      // Revert on error
      updateCategoryAssignment(categoryId, questionId, !assign);
    } finally {
      setIsSaving(false);
    }
  };

  const bulkUpdate = async (categoryId, assign = true) => {
    const assignedIds = categoryAssignments[categoryId] || new Set();
    const targetQuestions = questions.filter((q) =>
      assign ? !assignedIds.has(q.id) : assignedIds.has(q.id)
    );
    const ids = targetQuestions.map((q) => q.id);

    if (ids.length === 0) return;

    // Optimistic UI update
    updateCategoryAssignmentsBulk(categoryId, ids, assign);
    setIsSaving(true);

    try {
      if (assign) {
        await backendApi.post(
          "/question_management/add_or_assign_questions_to_category/",
          { category_id: categoryId, question_ids: ids, form_type_id: formId },
          { headers: { Authorization: `Token ${authToken}`, "Content-Type": "application/json" } }
        );
      } else {
        await Promise.all(
          ids.map((id) =>
            backendApi.post(
              "/question_management/remove_assigned_question/",
              { main_category_id: categoryId, question_id: id, form_type_id: formId },
              { headers: { Authorization: `Token ${authToken}`, "Content-Type": "application/json" } }
            )
          )
        );
      }
    } catch (err) {
      console.error("Error in bulk update:", err);
      Swal.fire("Error", `Bulk ${assign ? "assignment" : "removal"} failed`, "error");
      // Revert on error
      updateCategoryAssignmentsBulk(categoryId, ids, !assign);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAccordion = (categoryId) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={() => onClose(true)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-questions-title"
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="assign-questions-title" className="text-xl font-semibold">
            Assign Questions to Categories
          </h2>
          <button
            onClick={() => onClose(true)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-6 w-6 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2 mx-auto"></div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No categories available.</p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const assignedIds = categoryAssignments[category.id] || new Set();
              const isOpen = openAccordions.has(category.id);

              return (
                <div key={category.id} className="border border-gray-200 rounded-lg">
                  <button
                    className="w-full px-4 py-2 bg-gray-100 flex justify-between items-center hover:bg-gray-200 transition-colors"
                    onClick={() => toggleAccordion(category.id)}
                    aria-expanded={isOpen}
                    aria-controls={`category-panel-${category.id}`}
                    type="button"
                  >
                    <span className="font-semibold">{category.name}</span>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {isOpen && (
                    <div
                      id={`category-panel-${category.id}`}
                      className="p-4 border-t border-gray-200"
                    >
                      <div className="flex justify-end space-x-2 mb-4">
                        <button
                          onClick={() => bulkUpdate(category.id, true)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={isSaving}
                          type="button"
                        >
                          Assign All
                        </button>
                        <button
                          onClick={() => bulkUpdate(category.id, false)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          disabled={isSaving}
                          type="button"
                        >
                          Remove All
                        </button>
                      </div>

                      {questions.length === 0 ? (
                        <p className="text-gray-500">No questions available.</p>
                      ) : (
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                          {questions.map((question) => {
                            const isChecked = assignedIds.has(question.id);
                            return (
                              <li key={question.id}>
                                <label className="flex items-center space-x-3 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isSaving}
                                    onChange={() => toggleQuestion(category.id, question.id)}
                                    className="form-checkbox h-5 w-5 text-blue-600"
                                    aria-checked={isChecked}
                                  />
                                  <span>{question.text || question.name || question.id}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
