'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '../../../../components/dashboard/Applayout';
import { useAuth } from '../../../../AuthContext';

import backendApi from '../../../../utils/backendApi';

export default function FormBuilderPage() {
  const { authToken } = useAuth();
  const params = useParams();
  const formId = params?.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForm = async () => {
    if (!authToken || !formId) return;
    try {
      setLoading(true);
      const res = await backendApi.get(
        `/application_management/get_form_details/${formId}/`,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      setForm(res.data.form);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId && authToken) fetchForm();
  }, [formId, authToken]);

  if (loading) return <div className="p-4">Loading builder...</div>;

  return (
    <AppLayout>
      <h1 className="text-xl font-semibold mb-4">
        Form Builder: {form?.name}
      </h1>

      {form?.categories?.map((cat) => (
        <div key={cat.id} className="border p-4 mb-4 rounded">
          <h2 className="font-bold">{cat.name}</h2>
          <p className="text-sm text-gray-500">{cat.description}</p>

          <div className="mt-3 space-y-2">
            {cat.questions?.length ? (
              cat.questions.map((q) => (
                <div key={q.id} className="border p-2 rounded flex justify-between">
                  <span>{q.text}</span>
                  <span className="text-xs text-blue-500">{q.input_type}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No questions assigned</p>
            )}
          </div>

          <button className="mt-3 text-sm text-blue-600 hover:underline">
            + Assign Questions
          </button>
        </div>
      ))}
    </AppLayout>
  );
}

// import AppLayout from '../../../../components/dashboard/Applayout';

// export default function FormBuilderPage() {
//   const params = useParams();
//   const formId = params?.id;

//   const [form, setForm] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchForm = async () => {
//     try {
//       setLoading(true);

//       const res = await backendApi.get(
//         `/application_management/get_form_details/${formId}/`
//       );

//       setForm(res.data.form);

//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (formId) fetchForm();
//   }, [formId]);

//   if (loading) return <div>Loading builder...</div>;

//   return (
//     <AppLayout>

//       <h1 className="text-xl font-semibold mb-4">
//         Form Builder: {form?.name}
//       </h1>

//       {form?.categories?.map((cat) => (
//         <div key={cat.id} className="border p-4 mb-4">

//           <h2 className="font-bold">
//             {cat.name}
//           </h2>

//           <p className="text-sm text-gray-500">
//             {cat.description}
//           </p>

//           {/* QUESTIONS */}
//           <div className="mt-3 space-y-2">

//             {cat.questions?.length ? (
//               cat.questions.map((q) => (
//                 <div
//                   key={q.id}
//                   className="border p-2 rounded flex justify-between"
//                 >
//                   <span>{q.text}</span>
//                   <span className="text-xs text-blue-500">
//                     {q.input_type}
//                   </span>
//                 </div>
//               ))
//             ) : (
//               <p className="text-sm text-gray-400">
//                 No questions assigned
//               </p>
//             )}

//           </div>

//           {/* ASSIGN BUTTON */}
//           <button className="mt-3 text-sm text-blue-600">
//             + Assign Questions
//           </button>

//         </div>
//       ))}

//     </AppLayout>
//   );
// }