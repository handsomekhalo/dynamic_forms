'use client';



import { useParams } from 'next/navigation';
import AppLayout from '../../../../components/dashboard/Applayout';
import { useAuth } from '../../../../../AuthContext';
import backendApi from '../../../../../utils/backendApi';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Swal from 'sweetalert2';

export default function FormBuilderPage() {
  const { authToken } = useAuth();
  const params = useParams();
  const formId = params?.id;

  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [categoryAssignments, setCategoryAssignments] = useState({});
  const [openAccordions, setOpenAccordions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    if (!authToken || !formId) return;
    try {
      setLoading(true);

      const [formRes, questionsRes] = await Promise.all([
        backendApi.get(`/application_management/get_form_details/${formId}/`, {
          headers: { Authorization: `Token ${authToken}` },
        }),
        backendApi.get('/question_management/get_questions/', {
          headers: { Authorization: `Token ${authToken}` },
        }),
      ]);

      const fetchedForm = formRes.data.form;
      const fetchedQuestions = questionsRes.data?.data?.questions ?? [];

      setForm(fetchedForm);
      setQuestions(fetchedQuestions);

      // Fetch existing assignments per category
      const assignments = {};
      await Promise.all(
        (fetchedForm.categories || []).map(async (category) => {
          try {
            const res = await backendApi.get(
              `/question_management/get_questions_assigned_to_category/${formId}/categories/${category.id}/questions/?detail=true`,
              { headers: { Authorization: `Token ${authToken}` } }
            );
            const assigned = res.data?.data?.assigned_questions || [];
            assignments[category.id] = new Set(assigned.map((q) => q.id));
          } catch {
            assignments[category.id] = new Set();
          }
        })
      );

      setCategoryAssignments(assignments);
    } catch (err) {
      console.error('Builder fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formId, authToken]);

  const updateAssignment = (categoryId, questionId, isAssigned) => {
    setCategoryAssignments((prev) => {
      const updated = { ...prev };
      const set = new Set(prev[categoryId] || []);
      isAssigned ? set.add(questionId) : set.delete(questionId);
      updated[categoryId] = set;
      return updated;
    });
  };

  const toggleQuestion = async (categoryId, questionId) => {
    const isCurrently = (categoryAssignments[categoryId] || new Set()).has(questionId);
    const assign = !isCurrently;
    updateAssignment(categoryId, questionId, assign);
    setIsSaving(true);
    try {
      const url = assign
        ? '/question_management/add_or_assign_questions_to_category/'
        : '/question_management/remove_assigned_question/';
      const payload = assign
        ? { category_id: categoryId, question_ids: [questionId], form_type_id: formId }
        : { main_category_id: categoryId, question_id: questionId, form_type_id: formId };
      await backendApi.post(url, payload, {
        headers: { Authorization: `Token ${authToken}`, 'Content-Type': 'application/json' },
      });
    } catch {
      Swal.fire('Error', `Could not ${assign ? 'assign' : 'unassign'} question`, 'error');
      updateAssignment(categoryId, questionId, !assign);
    } finally {
      setIsSaving(false);
    }
  };

  const bulkUpdate = async (categoryId, assign = true) => {
    const assignedIds = categoryAssignments[categoryId] || new Set();
    const targets = questions.filter((q) =>
      assign ? !assignedIds.has(q.id) : assignedIds.has(q.id)
    );
    const ids = targets.map((q) => q.id);
    if (!ids.length) return;

    ids.forEach((id) => updateAssignment(categoryId, id, assign));
    setIsSaving(true);
    try {
      if (assign) {
        await backendApi.post(
          '/question_management/add_or_assign_questions_to_category/',
          { category_id: categoryId, question_ids: ids, form_type_id: formId },
          { headers: { Authorization: `Token ${authToken}` } }
        );
      } else {
        await Promise.all(
          ids.map((id) =>
            backendApi.post(
              '/question_management/remove_assigned_question/',
              { main_category_id: categoryId, question_id: id, form_type_id: formId },
              { headers: { Authorization: `Token ${authToken}` } }
            )
          )
        );
      }
    } catch {
      Swal.fire('Error', `Bulk ${assign ? 'assignment' : 'removal'} failed`, 'error');
      ids.forEach((id) => updateAssignment(categoryId, id, !assign));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAccordion = (categoryId) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });
  };

  if (loading) return <AppLayout><div className="py-20 text-center">Loading builder...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{form?.name} — Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Assign questions to each category. Changes save instantly.
        </p>
      </div>

      {isSaving && (
        <div className="mb-4 text-sm text-blue-600 font-medium">Saving...</div>
      )}

      <div className="space-y-4">
        {(form?.categories || []).map((category) => {
          const assignedIds = categoryAssignments[category.id] || new Set();
          const isOpen = openAccordions.has(category.id);

          return (
            <div key={category.id} className="border border-slate-200 rounded-lg">

              {/* Category header */}
              <button
                className="w-full px-5 py-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 rounded-t-lg transition-colors"
                onClick={() => toggleAccordion(category.id)}
              >
                <div className="text-left">
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {assignedIds.size} question{assignedIds.size !== 1 ? 's' : ''} assigned
                  </p>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {/* Category body */}
              {isOpen && (
                <div className="p-5 border-t border-slate-200">

                  {/* Bulk actions */}
                  <div className="flex gap-2 mb-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => bulkUpdate(category.id, true)}
                    >
                      Assign All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => bulkUpdate(category.id, false)}
                    >
                      Remove All
                    </Button>
                  </div>

                  {/* Question list */}
                  {questions.length === 0 ? (
                    <p className="text-sm text-slate-400">No questions in bank yet.</p>
                  ) : (
                    <ul className="space-y-2 max-h-72 overflow-y-auto">
                      {questions.map((question) => {
                        const isChecked = assignedIds.has(question.id);
                        return (
                          <li
                            key={question.id}
                            className="flex items-center gap-3 p-2 rounded border border-slate-100 hover:bg-slate-50"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isSaving}
                              onChange={() => toggleQuestion(category.id, question.id)}
                              className="h-4 w-4 text-blue-600"
                            />
                            <div>
                              <p className="text-sm font-medium">{question.text}</p>
                              <p className="text-xs text-slate-400">{question.input_type}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import AppLayout from '../../../../components/dashboard/Applayout';
// import { useAuth } from '../../../../../AuthContext';
// import backendApi from '../../../../../utils/backendApi';


// export default function FormBuilderPage() {
//   const { authToken } = useAuth();
//   const params = useParams();
//   const formId = params?.id;

//   const [form, setForm] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchForm = async () => {
//     if (!authToken || !formId) return;
//     try {
//       setLoading(true);
//       const res = await backendApi.get(
//         `/application_management/get_form_details/${formId}/`,
//         { headers: { Authorization: `Token ${authToken}` } }
//       );
//       setForm(res.data.form);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (formId && authToken) fetchForm();
//   }, [formId, authToken]);

//   if (loading) return <div className="p-4">Loading builder...</div>;

//   return (
//     <AppLayout>
//       <h1 className="text-xl font-semibold mb-4">
//         Form Builder: {form?.name}
//       </h1>

//       {form?.categories?.map((cat) => (
//         <div key={cat.id} className="border p-4 mb-4 rounded">
//           <h2 className="font-bold">{cat.name}</h2>
//           <p className="text-sm text-gray-500">{cat.description}</p>

//           <div className="mt-3 space-y-2">
//             {cat.questions?.length ? (
//               cat.questions.map((q) => (
//                 <div key={q.id} className="border p-2 rounded flex justify-between">
//                   <span>{q.text}</span>
//                   <span className="text-xs text-blue-500">{q.input_type}</span>
//                 </div>
//               ))
//             ) : (
//               <p className="text-sm text-gray-400">No questions assigned</p>
//             )}
//           </div>

//           <button className="mt-3 text-sm text-blue-600 hover:underline">
//             + Assign Questions
//           </button>
//         </div>
//       ))}
//     </AppLayout>
//   );
// }
