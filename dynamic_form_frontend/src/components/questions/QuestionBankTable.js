'use client';

import { useState } from 'react';
import EditQuestionModal from './EditQuestionModal';

export default function QuestionBankTable({ questions, loading, onRefresh }) {
  const [editQuestion, setEditQuestion] = useState(null);

  if (loading) return <div className="p-4">Loading questions...</div>;

  return (
    <div className="overflow-x-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Question</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Required</th>
            <th className="p-2 text-left">Active</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id} className="border-t">
              <td className="p-2">{q.text}</td>
              <td className="p-2">{q.input_type}</td>
              <td className="p-2">{q.is_required ? 'Yes' : 'No'}</td>
              <td className="p-2">{q.is_active ? 'Active' : 'Inactive'}</td>
              <td className="p-2 flex gap-2">
                <button
                  onClick={() => setEditQuestion(q)}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={onRefresh}
                  className="text-gray-500 hover:underline text-xs"
                >
                  Refresh
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {questions.length === 0 && (
        <div className="p-4 text-center text-gray-500">No questions found</div>
      )}

      {editQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <EditQuestionModal
              question={editQuestion}
              onClose={() => setEditQuestion(null)}
              onUpdate={() => { setEditQuestion(null); onRefresh(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}