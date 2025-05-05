// // 'use client';
// // import React, { useState, useEffect } from 'react';
// // import { Dialog } from '@headlessui/react';

// // export default function AssignModal({ isOpen, onClose, form_id, backendApi }) {
// //   const [categories, setCategories] = useState([]);
// //   const [questions, setQuestions] = useState([]);
// //   const [selectedCategories, setSelectedCategories] = useState([]);
// //   const [answers, setAnswers] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       if (!form_id) return;
      
// //       setLoading(true);
// //       setError(null);
      
// //       try {
// //         // Call the API with the correct endpoint
// //         const res = await backendApi.get(`/application_management/get_categories_with_form_id/${form_id}/`);
        
// //         // Check if the API returns a success status
// //         if (res.data.status === 'success') {
// //           // The API returns categories in res.data.categories
// //           setCategories(res.data.categories || []);
          
// //           // If you have a separate API for questions, call it here
// //           // For now, we'll assume questions are empty or need to be fetched separately
// //           setQuestions([]); // Replace with actual questions if available
// //         } else {
// //           setError(res.data.message || 'Failed to load categories');
// //         }
// //       } catch (err) {
// //         console.error('Error loading assign data:', err);
// //         setError('Failed to load categories. Please try again.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
    
// //     if (isOpen) {
// //       fetchData();
// //     }
// //   }, [form_id, isOpen, backendApi]);

// //   const fetchCategories = async () => {
// //     try {
// //       const res = await backendApi.get(`/application_management/get_categories_with_form_id/${form_id}/`);
// //       setCategories(res.data.categories); // Assuming you store them in state here or higher up
// //     } catch (err) {
// //       console.error('Failed to fetch categories:', err);
// //     }
// //   };
  
// //   const handleCategoryToggle = (category_id) => {
// //     setSelectedCategories(prev =>
// //       prev.includes(category_id) ? prev.filter(id => id !== category_id) : [...prev, category_id]
// //     );
// //   };

// //   const handleAnswerChange = (questionId, value) => {
// //     setAnswers(prev => ({ ...prev, [questionId]: value }));
// //   };

// //   const handleSubmit = async () => {
// //     try {
// //       const assignments = selectedCategories.map(category_id => {
// //         const catQuestions = questions.filter(q => q.category_id === category_id);
// //         return {
// //           category_id: category_id,
// //           questions: catQuestions.map(q => ({ question_id: q.id, answer: answers[q.id] || '' }))
// //         };
// //       });

// //       await backendApi.post(`/application_management/form/${form_id}/assign/`, { assignments });
// //       onClose();
// //     } catch (err) {
// //       console.error('Error assigning form:', err);
// //       setError('Failed to assign form. Please try again.');
// //     }
// //   };

// //   return (
// //     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
// //       <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
// //       <div className="fixed inset-0 flex items-center justify-center p-4">
// //         <Dialog.Panel className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
// //           <Dialog.Title className="text-xl font-semibold mb-4">Assign Categories and Questions</Dialog.Title>
          
// //           {loading && <p className="text-gray-500">Loading categories...</p>}
          
// //           {error && <p className="text-red-500 mb-4">{error}</p>}

// //           {!loading && !error && (
// //             <>
// //               <div className="mb-4">
// //                 <p className="font-medium mb-2">Select Categories:</p>
// //                 {categories.length > 0 ? (
// //                   categories.map(cat => (
// //                     <label key={cat.id} className="block">
// //                       <input
// //                         type="checkbox"
// //                         checked={selectedCategories.includes(cat.id)}
// //                         onChange={() => handleCategoryToggle(cat.id)}
// //                         className="mr-2"
// //                       />
// //                       {cat.name}
// //                     </label>
// //                   ))
// //                 ) : (
// //                   <p className="text-gray-500">No categories available.</p>
// //                 )}
// //               </div>

// //               {selectedCategories.map(category_id => {
// //                 const cat = categories.find(c => c.id === category_id);
// //                 const catQuestions = questions.filter(q => q.category_id === category_id);
// //                 return (
// //                   <div key={category_id} className="mb-4 border-t pt-3">
// //                     <h4 className="font-semibold mb-2">{cat?.name} Questions</h4>
// //                     {catQuestions.length > 0 ? (
// //                       catQuestions.map(q => (
// //                         <div key={q.id} className="mb-2">
// //                           <label className="block text-sm font-medium mb-1">{q.text}</label>
// //                           <input
// //                             type="text"
// //                             className="w-full border px-3 py-2 rounded-md"
// //                             value={answers[q.id] || ''}
// //                             onChange={(e) => handleAnswerChange(q.id, e.target.value)}
// //                           />
// //                         </div>
// //                       ))
// //                     ) : (
// //                       <p className="text-gray-500">No questions available for this category.</p>
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </>
// //           )}

// //           <div className="mt-6 flex justify-end space-x-2">
// //             <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
// //             <button 
// //               onClick={handleSubmit} 
// //               className="px-4 py-2 bg-blue-600 text-white rounded"
// //               disabled={loading || selectedCategories.length === 0}
// //             >
// //               Assign
// //             </button>
// //           </div>
// //         </Dialog.Panel>
// //       </div>
// //     </Dialog>
// //   );
// // }
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Dialog } from '@headlessui/react';

// export default function AssignModal({ isOpen, onClose, form_id, backendApi }) {
//   const [categories, setCategories] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchCategories = async () => {
//     if (!form_id) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const res = await backendApi.get(`/application_management/get_categories_with_form_id/${form_id}/`);
//       if (res.data.status === 'success') {
//         setCategories(res.data.categories || []);
//         setQuestions([]); // Assuming you want to load questions here too (adjust if needed)
//       } else {
//         setError(res.data.message || 'Failed to load categories');
//       }
//     } catch (err) {
//       console.error('Error loading categories:', err);
//       setError('Failed to load categories. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isOpen) {
//       fetchCategories(); // Use fetchCategories here to load data
//     }
//   }, [form_id, isOpen, backendApi, fetchCategories]);

//   const handleCategoryToggle = (category_id) => {
//     setSelectedCategories(prev =>
//       prev.includes(category_id) ? prev.filter(id => id !== category_id) : [...prev, category_id]
//     );
//   };

//   const handleAnswerChange = (questionId, value) => {
//     setAnswers(prev => ({ ...prev, [questionId]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       const assignments = selectedCategories.map(category_id => {
//         const catQuestions = questions.filter(q => q.category_id === category_id);
//         return {
//           category_id: category_id,
//           questions: catQuestions.map(q => ({ question_id: q.id, answer: answers[q.id] || '' }))
//         };
//       });

//       await backendApi.post(`/application_management/form/${form_id}/assign/`, { assignments });
//       onClose();
//     } catch (err) {
//       console.error('Error assigning form:', err);
//       setError('Failed to assign form. Please try again.');
//     }
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
//           <Dialog.Title className="text-xl font-semibold mb-4">Assign Categories and Questions</Dialog.Title>
          
//           {loading && <p className="text-gray-500">Loading categories...</p>}
          
//           {error && <p className="text-red-500 mb-4">{error}</p>}

//           {!loading && !error && (
//             <>
//               <div className="mb-4">
//                 <p className="font-medium mb-2">Select Categories:</p>
//                 {categories.length > 0 ? (
//                   categories.map(cat => (
//                     <label key={cat.id} className="block">
//                       <input
//                         type="checkbox"
//                         checked={selectedCategories.includes(cat.id)}
//                         onChange={() => handleCategoryToggle(cat.id)}
//                         className="mr-2"
//                       />
//                       {cat.name}
//                     </label>
//                   ))
//                 ) : (
//                   <p className="text-gray-500">No categories available.</p>
//                 )}
//               </div>

//               {selectedCategories.map(category_id => {
//                 const cat = categories.find(c => c.id === category_id);
//                 const catQuestions = questions.filter(q => q.category_id === category_id);
//                 return (
//                   <div key={category_id} className="mb-4 border-t pt-3">
//                     <h4 className="font-semibold mb-2">{cat?.name} Questions</h4>
//                     {catQuestions.length > 0 ? (
//                       catQuestions.map(q => (
//                         <div key={q.id} className="mb-2">
//                           <label className="block text-sm font-medium mb-1">{q.text}</label>
//                           <input
//                             type="text"
//                             className="w-full border px-3 py-2 rounded-md"
//                             value={answers[q.id] || ''}
//                             onChange={(e) => handleAnswerChange(q.id, e.target.value)}
//                           />
//                         </div>
//                       ))
//                     ) : (
//                       <p className="text-gray-500">No questions available for this category.</p>
//                     )}
//                   </div>
//                 );
//               })}
//             </>
//           )}

//           <div className="mt-6 flex justify-end space-x-2">
//             <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
//             <button 
//               onClick={handleSubmit} 
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//               disabled={loading || selectedCategories.length === 0}
//             >
//               Assign
//             </button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// }
'use client';
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';

export default function AssignModal({ isOpen, onClose, form_id, backendApi }) {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();  // Fetch categories and questions when the modal opens
    }
  }, [form_id, isOpen]);

  const fetchCategories = async () => {
    if (!form_id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await backendApi.get(`/application_management/get_categories_with_form_id/${form_id}/`);
      if (res.data.status === 'success') {
        setCategories(res.data.categories || []);
        setQuestions([]);  // Assuming no questions are initially fetched (update as needed)
      } else {
        setError(res.data.message || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category_id) => {
    setSelectedCategories((prev) =>
      prev.includes(category_id)
        ? prev.filter((id) => id !== category_id)
        : [...prev, category_id]
    );
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      const assignments = selectedCategories.map((category_id) => {
        const catQuestions = questions.filter((q) => q.category_id === category_id);
        return {
          category_id,
          questions: catQuestions.map((q) => ({
            question_id: q.id,
            answer: answers[q.id] || '',
          })),
        };
      });

      await backendApi.post(`/application_management/form/${form_id}/assign/`, { assignments });
      onClose();  // Close the modal after successful submission
    } catch (err) {
      console.error('Error assigning form:', err);
      setError('Failed to assign form. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold mb-4">Assign Categories and Questions</Dialog.Title>

          {loading && <p className="text-gray-500">Loading categories...</p>}

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mb-4">
                <p className="font-medium mb-2">Select Categories:</p>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <label key={cat.id} className="block">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="mr-2"
                      />
                      {cat.name}
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">No categories available.</p>
                )}
              </div>

              {selectedCategories.map((category_id) => {
                const cat = categories.find((c) => c.id === category_id);
                const catQuestions = questions.filter((q) => q.category_id === category_id);
                return (
                  <div key={category_id} className="mb-4 border-t pt-3">
                    <h4 className="font-semibold mb-2">{cat?.name} Questions</h4>
                    {catQuestions.length > 0 ? (
                      catQuestions.map((q) => (
                        <div key={q.id} className="mb-2">
                          <label className="block text-sm font-medium mb-1">{q.text}</label>
                          <input
                            type="text"
                            className="w-full border px-3 py-2 rounded-md"
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No questions available for this category.</p>
                    )}
                  </div>
                );
              })}
            </>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={loading || selectedCategories.length === 0}
            >
              Assign
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
