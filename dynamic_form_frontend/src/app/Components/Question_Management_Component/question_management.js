"use client";
import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";
import CreateQuestionForm from "./create_question_form_component";
import EditQuestionModal from "./edit_question_modal";
import StatusChangeModal from "./status_change_modal";
import AssignQuestionToCategoryModal from "./assign_questions_to_category_modal";

export default function ManageQuestions({ formId, questionTypes }) {
  // const { authToken, isLoading } = useAuth();
  const { authToken, isLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuestionData, setEditQuestionData] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Centralized function to fetch questions
  const fetchQuestions = async () => {
    if (!authToken || isLoading) return;

    try {
      setLoading(true);
      const res = await backendApi.get(
        "/question_management/get_questions/",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,

          },
        }
      );

      console.log('res',res)
      const questionData = res.data;

      console.log("Fetched question data:", questionData); // Debug log

      const processedQuestions = Array.isArray(questionData.data.questions)
        ? questionData.data.questions.map((q) => {
            console.log(`Question ${q.id}:`, {
              text: q.text,
              input_type: q.input_type,
              question_type: q.question_type,
              is_required: q.is_required,
              is_active: q.is_active
            }); // Debug log for each question
            return {
              ...q,
              options: Array.isArray(q.options) ? q.options : [],
            };
          })
        : [];
        

      setQuestions(processedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      Swal.fire("Error", error.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [authToken, isLoading]);

  // Handler for refreshing questions after updates
  const handleQuestionsUpdate = async () => {
    console.log("Refreshing questions after update..."); // Debug log
    await fetchQuestions();
  };

  // Handler for closing edit modal and refreshing
  const handleEditClose = () => {
    setShowEditModal(false);
    setEditQuestionData(null);
    // Don't refresh here - let the EditQuestionModal handle it via onUpdate
  };

  // Handler for closing status modal and refreshing
  const handleStatusClose = () => {
    setShowStatusModal(false);
    setStatusModalData(null);
    fetchQuestions(); // Refresh after status change
  };

  if (loading) return <div className="p-4">Loading questions...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-xl font-semibold">Manage Questions</h2>

        {/* <button
          onClick={() => setShowAssignModal(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Assign To Category
        </button> */}

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
              <th className="p-2">Input Type</th>
              <th className="p-2">Required</th>
              <th className="p-2">Active</th>
              <th className="p-2">Options</th>
              <th className="p-2">Edit</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id} className="border-t">
                <td className="p-2">{question.id}</td>
                <td className="p-2" title={question.text}>
                  {question.text.length > 50 
                    ? `${question.text.substring(0, 50)}...` 
                    : question.text}
                </td>
                <td className="p-2">
                  {question.question_type?.name || question.question_type || 'N/A'}
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    question.input_type === 'radio' ? 'bg-blue-100 text-blue-800' :
                    question.input_type === 'checkbox' ? 'bg-green-100 text-green-800' :
                    question.input_type === 'text' ? 'bg-gray-100 text-gray-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {question.input_type || 'N/A'}
                  </span>
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    question.is_required 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {question.is_required ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    question.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {question.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-2">
                  {question.options.length > 0 ? (
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:text-blue-800">
                        {question.options.length} options
                      </summary>
                      <ul className="list-disc list-inside mt-1 text-xs">
                        {question.options.map((opt, idx) => (
                          <li key={idx}>{opt.option || opt.text}</li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <span className="text-gray-400">No options</span>
                  )}
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
                  <button
                    onClick={() => {
                      setStatusModalData({
                        questionId: question.id,
                        newStatus: !question.is_active,
                      });
                      setShowStatusModal(true);
                    }}
                    className={`px-3 py-1 rounded text-xs hover:brightness-90 text-white ${
                      question.is_active
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {question.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions found. Create your first question!
          </div>
        )}
      </div>

      {/* Create Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create New Question</h3>

            <CreateQuestionForm 
              questionTypes={questionTypes} 
              onSuccess={handleQuestionsUpdate}
            />

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

      {/* Edit Question Modal */}
      {showEditModal && editQuestionData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <EditQuestionModal
              question={editQuestionData}
              onClose={handleEditClose}
              onUpdate={handleQuestionsUpdate} // Pass the refresh function
            />
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && statusModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <StatusChangeModal
              questionId={statusModalData.questionId}
              newStatus={statusModalData.newStatus}
              onClose={handleStatusClose} // This will refresh after status change
            />
          </div>
        </div>
      )}

      {/* Assign Questions Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <AssignQuestionToCategoryModal 
              onClose={() => setShowAssignModal(false)} 
              onSuccess={handleQuestionsUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
}