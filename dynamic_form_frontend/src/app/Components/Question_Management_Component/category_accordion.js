"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react"; // Lucide icons
import { useAuth } from "../../../../AuthContext";
import backendApi from "../../../../utils/backendApi";

export default function CategoryAccordion({
  category,
  isOpen,
  onToggle,
  questions,
  selectedQuestionIds,
  toggleQuestionSelection,
  onSave,
  saving,
}) {
  const { authToken } = useAuth();
  const [categoryDetails, setCategoryDetails] = useState(null);

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        const res = await backendApi.get(
          `/application_management/get_form_categories/${category.form_id}/`,
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );
        setCategoryDetails(res.data); // Adjust if specific structure is expected
      } catch (err) {
        console.error("Failed to fetch category details", err);
      }
    };

    if (isOpen && category?.form_id) fetchCategoryDetails();
  }, [authToken, category?.form_id, isOpen]);

  return (
    <div className="border rounded mb-2">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 font-medium flex justify-between items-center"
      >
        <span>{category.name}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4 bg-white border-t space-y-2">
          <div className="flex justify-between mb-2">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => questions.forEach((q) => toggleQuestionSelection(q.id))}
            >
              Select All
            </button>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => questions.forEach((q) => toggleQuestionSelection(q.id))}
            >
              Deselect All
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto border rounded">
            {questions.map((q) => (
              <div
                key={q.id}
                className={`p-2 border-b cursor-pointer ${
                  selectedQuestionIds.includes(q.id)
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => toggleQuestionSelection(q.id)}
              >
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuestionIds.includes(q.id)}
                    onChange={() => toggleQuestionSelection(q.id)}
                    className="mt-1"
                  />
                  <span>{q.text}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => onSave(category.id)}
              disabled={saving}
              className={`px-4 py-2 text-white rounded ${
                saving
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Assign Questions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
