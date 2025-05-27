"use client";
import React, { useState } from "react";
import backendApi from "../../../../utils/backendApi";
import Swal from "sweetalert2";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CategoryAccordion({ 
  category, 
  questions, 
  formId, 
  authToken,
  assignedIds,
  onAssignmentUpdate,
  onBulkAssignmentUpdate
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleQuestion = async (questionId) => {
    const isCurrentlyAssigned = assignedIds.has(questionId);
    const assign = !isCurrentlyAssigned;
    
    // Optimistically update the UI
    onAssignmentUpdate(category.id, questionId, assign);
    setIsSaving(true);

    try {
      const url = assign
        ? "/question_management/add_or_assign_questions_to_category/"
        : "/question_management/remove_assigned_question/";
      const payload = assign
        ? { category_id: category.id, question_ids: [questionId], form_type_id: formId }
        : { main_category_id: category.id, question_id: questionId, form_type_id: formId };

      await backendApi.post(url, payload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      
    } catch (err) {
      console.error("Error updating question assignment:", err);
      Swal.fire("Error", `Could not ${assign ? "assign" : "unassign"} question`, "error");
      // Revert the optimistic update on error
      onAssignmentUpdate(category.id, questionId, !assign);
    } finally {
      setIsSaving(false);
    }
  };

  const bulkUpdate = async (assign = true) => {
    const targetQuestions = questions.filter((q) => 
      assign ? !assignedIds.has(q.id) : assignedIds.has(q.id)
    );
    const ids = targetQuestions.map((q) => q.id);
    
    if (ids.length === 0) return;

    // Optimistically update the UI
    onBulkAssignmentUpdate(category.id, ids, assign);
    setIsSaving(true);

    try {
      if (assign) {
        await backendApi.post(
          "/question_management/add_or_assign_questions_to_category/",
          { category_id: category.id, question_ids: ids, form_type_id: formId },
          { headers: { Authorization: `Token ${authToken}`, "Content-Type": "application/json" } }
        );
      } else {
        await Promise.all(
          ids.map((id) =>
            backendApi.post(
              "/question_management/remove_assigned_question/",
              { main_category_id: category.id, question_id: id, form_type_id: formId },
              { headers: { Authorization: `Token ${authToken}`, "Content-Type": "application/json" } }
            )
          )
        );
      }
    } catch (err) {
      console.error("Error in bulk update:", err);
      Swal.fire("Error", `Bulk ${assign ? "assignment" : "removal"} failed`, "error");
      // Revert the optimistic update on error
      onBulkAssignmentUpdate(category.id, ids, !assign);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-4 border border-gray-200 rounded-lg">
      <button
        className="w-full px-4 py-2 bg-gray-100 flex justify-between items-center hover:bg-gray-200 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="font-semibold">{category.name}</span>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end space-x-2 mb-4">
            <button
              onClick={() => bulkUpdate(true)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSaving}
            >
              Select All
            </button>
            <button
              onClick={() => bulkUpdate(false)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSaving}
            >
              Deselect All
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {questions.map((question) => (
              <label 
                key={question.id} 
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={assignedIds.has(question.id)}
                  onChange={() => toggleQuestion(question.id)}
                  disabled={isSaving}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{question.text}</span>
              </label>
            ))}
          </div>
          
          {isSaving && (
            <div className="mt-2 text-sm text-blue-600 text-center">
              Saving changes...
            </div>
          )}
        </div>
      )}
    </div>
  );
} 