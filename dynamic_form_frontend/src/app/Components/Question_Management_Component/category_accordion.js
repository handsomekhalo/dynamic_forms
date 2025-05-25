"use client";
import React, { useEffect, useState } from "react";
import backendApi from "../../../../utils/backendApi";
import Swal from "sweetalert2";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CategoryAccordion({ category, questions, formId, authToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const endpoint = `/question_management/get_questions_assigned_to_category/${formId}/categories/${category.id}/questions/?detail=true`;
        const res = await backendApi.get(endpoint, {
          headers: { Authorization: `Token ${authToken}` },
        });
        const data = res.data?.data?.assigned_questions || [];
  
 
        setAssignedIds(new Set(data.map((q) => q.id)));
      } catch (err) {
        console.error(`Error fetching assignments for category ${category.id}:`, err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAssigned();
  }, [authToken, category.id, formId]);
  
  const toggleQuestion = async (id) => {
    const assign = !assignedIds.has(id);
    const updated = new Set(assignedIds);
    assign ? updated.add(id) : updated.delete(id);
    setAssignedIds(updated);
    setIsSaving(true);

    try {
      const url = assign
        ? "/question_management/add_or_assign_questions_to_category/"
        : "/question_management/remove_assigned_question/";
      const payload = assign
        ? { category_id: category.id, question_ids: [id], form_type_id: formId }
        : { main_category_id: category.id, question_id: id, form_type_id: formId };

      await backendApi.post(url, payload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      Swal.fire("Error", `Could not ${assign ? "assign" : "unassign"} question`, "error");
      assign ? updated.delete(id) : updated.add(id); // revert
      setAssignedIds(new Set(updated));
    } finally {
      setIsSaving(false);
    }
  };

  const bulkUpdate = async (assign = true) => {
    const target = questions.filter((q) => assign !== assignedIds.has(q.id));
    const ids = target.map((q) => q.id);
    if (ids.length === 0) return;

    const updated = new Set(assignedIds);
    ids.forEach((id) => (assign ? updated.add(id) : updated.delete(id)));
    setAssignedIds(updated);
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
      Swal.fire("Error", `Bulk ${assign ? "assignment" : "removal"} failed`, "error");
      ids.forEach((id) => (assign ? updated.delete(id) : updated.add(id)));
      setAssignedIds(new Set(updated));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-4 border border-gray-200 rounded-lg">
      <button
        className="w-full px-4 py-2 bg-gray-100 flex justify-between items-center"
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
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isSaving}
            >
              Select All
            </button>
            <button
              onClick={() => bulkUpdate(false)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={isSaving}
            >
              Deselect All
            </button>
          </div>

          {isLoading ? (
            <p>Loading questions...</p>
          ) : (
            <ul className="space-y-2">
              {questions.map((q) => (
                <li key={q.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={assignedIds.has(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                    disabled={isSaving}
                  />
                  <label className="text-sm">{q.text}</label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
