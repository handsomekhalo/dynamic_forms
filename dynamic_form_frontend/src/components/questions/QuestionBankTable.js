import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import backendApi from "../../../utils/backendApi";


import AppLayout from '../../components/dashboard/Applayout'

import { Button } from "@/components/ui/button";

export default function QuestionBankTable({
  questions,
  loading,
  onRefresh,
}) {
  const [editQuestion, setEditQuestion] = useState(null);

  if (loading) return <div>Loading questions...</div>;

  return (
    <div className="overflow-x-auto border rounded">

      <table className="min-w-full text-sm">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Question</th>
            <th className="p-2">Type</th>
            <th className="p-2">Required</th>
            <th className="p-2">Active</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {questions.map((q) => (
            <tr key={q.id} className="border-t">

              <td className="p-2">{q.text}</td>

              <td className="p-2">{q.input_type}</td>

              <td className="p-2">
                {q.is_required ? "Yes" : "No"}
              </td>

              <td className="p-2">
                {q.is_active ? "Active" : "Inactive"}
              </td>

              <td className="p-2 flex gap-2">

                <button
                  onClick={() => setEditQuestion(q)}
                  className="text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={onRefresh}
                  className="text-red-600"
                >
                  Refresh
                </button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>

      {questions.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No questions found
        </div>
      )}

    </div>
  );
}