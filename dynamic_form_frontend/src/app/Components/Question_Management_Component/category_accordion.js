"use client";

import React, { useEffect, useState } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";
import CategoryAccordion from "./category_accordion";

export default function AssignQuestionToCategoryModal({ formId, onClose }) {
  const { authToken } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

        setQuestions(questionsRes.data?.data?.questions || []);
        setCategories(formCategoriesRes.data?.category_details || []);
      } catch (err) {
        console.error("Error fetching data", err);
        setError("Failed to load questions or categories.");
      } finally {
        setLoading(false);
      }
    };

    if (formId) fetchData();
  }, [authToken, formId]);

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSave = async (categoryId) => {
    if (!categoryId || selectedQuestionIds.length === 0) {
      Swal.fire(
        "Validation",
        "Please select a category and at least one question.",
        "warning"
      );
      return;
    }

    try {
      setSaving(true);
      await backendApi.post(
        "/question_management/assign_or_update_question_api/",
        {
          category_id: categoryId,
          question_ids: selectedQuestionIds,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      Swal.fire("Success", "Questions assigned to category", "success").then(() => {
        onClose(true);
      });
    } catch (err) {
      console.error("Failed to assign questions", err);
      Swal.fire("Error", "Failed to assign questions", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={() => onClose()}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Questions to Category</h2>
          <button
            onClick={() => onClose()}
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div>
            {categories.map((category) => (
              <CategoryAccordion
                key={category.id}
                category={category}
                isOpen={activeCategoryId === category.id}
                onToggle={() =>
                  setActiveCategoryId(
                    activeCategoryId === category.id ? null : category.id
                  )
                }
                questions={questions}
                selectedQuestionIds={selectedQuestionIds}
                toggleQuestionSelection={toggleQuestionSelection}
                onSave={handleSave}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
