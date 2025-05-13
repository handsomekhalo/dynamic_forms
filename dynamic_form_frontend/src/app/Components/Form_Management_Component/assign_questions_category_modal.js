'use client';
import React, { useEffect, useState } from 'react';
import backendApi from '../../../../utils/backendApi';

export default function QuestionModal({ categoryId, formId, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId || !formId) return;
      
      try {
        setLoading(true);
        console.log(`Fetching questions for category: ${categoryId}`);
        
        // Get category details for the title
        const categoryRes = await backendApi.get(`/application_management/get_category/${categoryId}/`);
        if (categoryRes.data && categoryRes.data.category) {
          setCategoryName(categoryRes.data.category.name);
        }
        
        // Get all questions for this category
        const questionsRes = await backendApi.get(`/application_management/get_questions_for_category/${categoryId}/`);
        console.log('Questions data:', questionsRes.data);
        setQuestions(questionsRes.data.questions || []);
        
        // Get questions already assigned to this category in this form
        const assignedRes = await backendApi.get(
          `/application_management/get_assigned_questions/${formId}/${categoryId}/`
        );
        if (assignedRes.data && assignedRes.data.assigned_questions) {
          setSelectedQuestionIds(assignedRes.data.assigned_questions.map(q => q.id));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId, formId]);

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleSave = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      console.log(`Saving questions for category ${categoryId} in form ${formId}:`, selectedQuestionIds);
      
      await backendApi.post(`/application_management/form/${formId}/assign_questions/`, {
        category_id: categoryId,
        question_ids: selectedQuestionIds,
      });
      
      console.log('Questions assigned successfully');
      setSaving(false);
      onClose(true); // Pass true to indicate successful save
    } catch (err) {
      console.error('Failed to assign questions:', err);
      setError('Failed to save question assignments.');
      setSaving(false);
    }
  };

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Select all questions
  const selectAllQuestions = () => {
    setSelectedQuestionIds(questions.map(q => q.id));
  };

  // Deselect all questions
  const deselectAllQuestions = () => {
    setSelectedQuestionIds([]);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {categoryName ? `Questions for ${categoryName}` : 'Assign Questions to Category'}
          </h2>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
            <p>Loading questions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : questions.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No questions available for this category.</p>
        ) : (
          <>
            <div className="flex justify-between mb-2">
              <button 
                onClick={selectAllQuestions}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button 
                onClick={deselectAllQuestions}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Deselect All
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto border rounded-md">
              {questions.map((q) => (
                <div 
                  key={q.id} 
                  className={`p-3 border-b last:border-b-0 ${
                    selectedQuestionIds.includes(q.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id={`question-${q.id}`}
                      checked={selectedQuestionIds.includes(q.id)}
                      onChange={() => toggleQuestionSelection(q.id)}
                      className="mt-1 mr-3"
                    />
                    <label htmlFor={`question-${q.id}`} className="select-none cursor-pointer">
                      {q.text}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={() => onClose()} 
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className={`px-4 py-2 ${
              loading || saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded flex items-center`}
          >
            {saving && (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}