"use client";
import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";
import CreateQuestionForm from "./create_question_form_component";
import EditQuestionModal from "./edit_question_modal";
import StatusChangeModal from "./status_change_modal";
// import showEditModal

export default function ManageQuestions({ formId, questionTypes }) {
  const { authToken, isLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuestionData, setEditQuestionData] = useState(null); // For passing the question to edit
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState(null); // Contains question ID and status


  useEffect(() => {
    if (!authToken || isLoading) return;

    const fetchQuestions = async () => {
      try {
        const res = await backendApi.get(
          "/question_management/get_questions/",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authToken}`,
            },
          }
        );

        const questionData = res.data;

        setQuestions(
          Array.isArray(questionData.data.questions)
            ? questionData.data.questions.map((q) => ({
                ...q,
                options: Array.isArray(q.options) ? q.options : [],
              }))
            : []
        );
      } catch (error) {
        console.error("Error fetching questions:", error);
        Swal.fire("Error", error.message || "Something went wrong", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [authToken, isLoading]);

  if (loading) return <div className="p-4">Loading questions...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-xl font-semibold">Manage Questions</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Assign To Category
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
        >
          Create Question
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">No.</th>
              <th className="p-2">Question</th>
              <th className="p-2">Type</th>
              <th className="p-2">Options</th>
              <th className="p-2">Edit</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-t">
                <td className="p-2">{question.id}</td>
                <td className="p-2">{question.text}</td>
                <td className="p-2">{question.question_type}</td>
                <td className="p-2">
                  <ul className="list-disc list-inside">
                    {question.options.map((opt, idx) => (
                      <li key={idx}>{opt.option}</li>
                    ))}
                  </ul>
                </td>
                <td className="p-2">
                  <button 
                    onClick={() => {
                      setEditQuestionData(question);
                      setShowEditModal(true);
                    }}
                     className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs"
                  >
                    Edit
                  </button>
                </td>
                <td className="p-2">
                  <button  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                    onClick={() => {
                      setStatusModalData({
                        questionId: question.id,
                        newStatus: !question.is_active,
                      });
                      setShowStatusModal(true);
                    }}
                  >
                    {question.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom modal implementation matching CategoryModal pattern */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Question</h3>

            <CreateQuestionForm questionTypes={questionTypes} />

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {showEditModal && editQuestionData && (
        <EditQuestionModal
          question={editQuestionData}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showStatusModal && statusModalData && (
        <StatusChangeModal
          questionId={statusModalData.questionId}
          newStatus={statusModalData.newStatus}
          onClose={() => setShowStatusModal(false)}
        />
      )} */}
      {showEditModal && editQuestionData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
      <EditQuestionModal
        question={editQuestionData}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  </div>
)}

{showStatusModal && statusModalData && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
      <StatusChangeModal
        questionId={statusModalData.questionId}
        newStatus={statusModalData.newStatus}
        onClose={() => setShowStatusModal(false)}
      />
    </div>
  </div>
)}

    </div>
  );
}
