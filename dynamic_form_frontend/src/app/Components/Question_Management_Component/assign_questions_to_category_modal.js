"use client";
import React, { useEffect, useState } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";
import CategoryAccordion from "./category_accordion";

export default function AssignQuestionToCategoryModal({ formId, onClose }) {
  const { authToken } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [questionsRes, categoriesRes] = await Promise.all([
          backendApi.get("/question_management/get_questions/", {
            headers: { Authorization: `Token ${authToken}` },
          }),
          backendApi.get(`/application_management/get_form_categories/${formId}/`, {
            headers: { Authorization: `Token ${authToken}` },
          }),
        ]);

        setQuestions(questionsRes.data?.data?.questions ?? []);
        setCategories(categoriesRes.data?.category_details ?? []);
      } catch (err) {
        console.error("Data fetching failed:", err);
        setError("Failed to load questions or categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, formId]);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={() => onClose(true)}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Questions to Categories</h2>
          <button
            onClick={() => onClose(true)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-6 w-6 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No categories available.</p>
        ) : (
          categories.map((category) => (
            <CategoryAccordion
              key={category.id}
              category={category}
              questions={questions}
              formId={formId}
              // authToken={authToken}
            />
          ))
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={() => onClose(true)}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}



// import React, { useEffect, useState } from "react";
// import backendApi from "../../../../utils/backendApi";
// import { useAuth } from "../../../../AuthContext";
// import Swal from "sweetalert2";
// import CategoryAccordion from "./category_accordion";

// export default function AssignQuestionToCategoryModal({ formId, onClose }) {
//   const { authToken } = useAuth();
//   const [questions, setQuestions] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [questionsRes, categoriesRes] = await Promise.all([
//           backendApi.get(`/question_management/get_questions/`, {
//             headers: { Authorization: `Token ${authToken}` },
//           }),
//           backendApi.get(`/application_management/get_form_categories/${formId}/`, {
//             headers: { Authorization: `Token ${authToken}` },
//           }),
//         ]);
//         setQuestions(questionsRes.data?.data?.questions || []);
//         setCategories(categoriesRes.data?.category_details || []);
//       } catch (err) {
//         setError("Failed to load data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (formId) {
//       fetchData();
//     }
//   }, [authToken, formId]);

//   const handleClose = () => {
//     onClose(true);
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50"
//       onClick={handleClose}
//     >
//       <div
//         className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] overflow-auto"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Assign Questions to Categories</h2>
//           <button
//             onClick={handleClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
//             aria-label="Close"
//           >
//             &times;
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center py-6">
//             <div className="inline-block animate-spin h-6 w-6 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
//             <p>Loading...</p>
//           </div>
//         ) : error ? (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             <p className="font-bold">Error:</p>
//             <p>{error}</p>
//           </div>
//         ) : (
//           <div className="mb-4 max-h-96 overflow-auto">
//             {categories.length === 0 ? (
//               <p className="p-4 text-center text-gray-500">No categories available.</p>
//             ) : (
//               categories.map((category) => (
//                 <CategoryAccordion
//                   key={category.id}
//                   category={category}
//                   questions={questions}
//                   formId={formId}
//                   authToken={authToken}
//                 />
//               ))
//             )}
//           </div>
//         )}

//         <div className="flex justify-end items-center mt-6">
//           <button
//             onClick={handleClose}
//             className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
//             type="button"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
