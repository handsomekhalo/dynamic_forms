'use client';
import React, { useState, useEffect } from 'react';
import backendApi from '../../../../utils/backendApi';
import { useAuth } from '../../../../AuthContext';
import Swal from 'sweetalert2';

export default function ManageQuestions({ formId }) {
  const { authToken, isLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken || isLoading) return;

    const fetchQuestions = async () => {
      try {
        const questionsRes = await backendApi.get('/question_management/get_questions/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${authToken}`,
          },
        });

        const questionData = questionsRes.data;

        if (questionData.status !== 'success') {
          throw new Error(questionData.message || 'Failed to fetch questions');
        }

        setQuestions(Array.isArray(questionData.data.questions) ? questionData.data.questions : []);
      } catch (error) {
        console.error('Error fetching questions:', error);
        Swal.fire('Error', error.message || 'Something went wrong', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [authToken, isLoading]);

  if (loading) {
    return <div className="p-4">Loading questions...</div>;
  }

  return (
    <div className="row">
      <div className="table-responsive">
        <table className="table align-items-center mb-0 text-xxs data-table">
          <thead className="bg-primary">
            <tr>
              <th className="text-white text-xs">No.</th>
              <th className="text-white text-xs">Question</th>
              <th className="text-white text-xs">Type</th>
              <th className="text-white text-xs">Options</th>
              <th className="text-white text-xs">Edit</th>
              <th className="text-white text-xs">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question.id}>
                <td>{question.id}</td>
                
                {/* <td>{question.question}</td> */}
                <td>{question.text}</td>
                <td>{question.question_type}</td>
                <td>
                  <ul>
                    {question.options?.map((opt, idx) => (
                      <li key={idx}>{opt.option}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target={`#editQuestionModal_${question.id}`}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  {question.is_active ? (
                    <button className="btn btn-danger btn-sm deactivate_question" data-id={question.id}>
                      Deactivate
                    </button>
                  ) : (
                    <button className="btn btn-success btn-sm activate_question" data-id={question.id}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
