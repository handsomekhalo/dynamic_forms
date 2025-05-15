// // // // "use client";
// // // // import React, { useState, useEffect } from "react";
// // // // import backendApi from "../../../../utils/backendApi";
// // // // import { useAuth } from "../../../../AuthContext";
// // // // import Swal from "sweetalert2";
// // // // import CreateQuestionForm from "./create_question_form_component";
// // // // import Modal from "react-bootstrap/Modal";
// // // // import Button from "react-bootstrap/Button";
// // // // import Create_Modal_Wrapper from "./create_modal_wrapper";

// // // // export default function ManageQuestions({ formId, questionTypes }) {
// // // //   const { authToken, isLoading } = useAuth();
// // // //   const [questions, setQuestions] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [showModal, setShowModal] = useState(false);

// // // //   useEffect(() => {
// // // //     if (!authToken || isLoading) return;

// // // //     const fetchQuestions = async () => {
// // // //       try {
// // // //         const res = await backendApi.get(
// // // //           "/question_management/get_questions/",
// // // //           {
// // // //             headers: {
// // // //               "Content-Type": "application/json",
// // // //               Authorization: `Token ${authToken}`,
// // // //             },
// // // //           }
// // // //         );

// // // //         const questionData = res.data;

// // // //         setQuestions(
// // // //           Array.isArray(questionData.data.questions)
// // // //             ? questionData.data.questions.map((q) => ({
// // // //                 ...q,
// // // //                 options: Array.isArray(q.options) ? q.options : [],
// // // //               }))
// // // //             : []
// // // //         );
// // // //       } catch (error) {
// // // //         console.error("Error fetching questions:", error);
// // // //         Swal.fire("Error", error.message || "Something went wrong", "error");
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     fetchQuestions();
// // // //   }, [authToken, isLoading]);

// // // //   if (loading) return <div className="p-4">Loading questions...</div>;

// // // //   return (
// // // //     <div className="p-4">
// // // //       <div className="flex justify-between items-center mb-4">
// // // //         <h2 className="text-xl font-semibold">Manage Questions</h2>
// // // //         <button
// // // //           onClick={() => setShowModal(true)}
// // // //           className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
// // // //         >
// // // //           Create Question
// // // //         </button>
// // // //       </div>

// // // //       <div className="overflow-x-auto">
// // // //         <table className="min-w-full text-sm border">
// // // //           <thead className="bg-gray-100 text-left">
// // // //             <tr>
// // // //               <th className="p-2">No.</th>
// // // //               <th className="p-2">Question</th>
// // // //               <th className="p-2">Type</th>
// // // //               <th className="p-2">Options</th>
// // // //               <th className="p-2">Edit</th>
// // // //               <th className="p-2">Action</th>
// // // //             </tr>
// // // //           </thead>
// // // //           <tbody>
// // // //             {questions.map((question) => (
// // // //               <tr key={question.id} className="border-t">
// // // //                 <td className="p-2">{question.id}</td>
// // // //                 <td className="p-2">{question.text}</td>
// // // //                 <td className="p-2">{question.question_type}</td>
// // // //                 <td className="p-2">
// // // //                   <ul className="list-disc list-inside">
// // // //                     {question.options.map((opt, idx) => (
// // // //                       <li key={idx}>{opt.option}</li>
// // // //                     ))}
// // // //                   </ul>
// // // //                 </td>
// // // //                 <td className="p-2">
// // // //                   <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs">
// // // //                     Edit
// // // //                   </button>
// // // //                 </td>
// // // //                 <td className="p-2">
// // // //                   {question.is_active ? (
// // // //                     <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">
// // // //                       Deactivate
// // // //                     </button>
// // // //                   ) : (
// // // //                     <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">
// // // //                       Activate
// // // //                     </button>
// // // //                   )}
// // // //                 </td>
// // // //               </tr>
// // // //             ))}
// // // //           </tbody>
// // // //         </table>
// // // //       </div>

// // // //       <Create_Modal_Wrapper
       
// // // //       >
// // // //         <CreateQuestionForm questionTypes={questionTypes} 
// // // //           centered // <- This makes the modal vertically and horizontally centered
// // // // />
// // // //       </Create_Modal_Wrapper>
// // // //     </div>
// // // //   );
// // // // }
// // // "use client";
// // // import React, { useState, useEffect } from "react";
// // // import backendApi from "../../../../utils/backendApi";
// // // import { useAuth } from "../../../../AuthContext";
// // // import Swal from "sweetalert2";
// // // import CreateQuestionForm from "./create_question_form_component";
// // // import Create_Modal_Wrapper from "./create_modal_wrapper";

// // // export default function ManageQuestions({ formId, questionTypes }) {
// // //   const { authToken, isLoading } = useAuth();
// // //   const [questions, setQuestions] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [showModal, setShowModal] = useState(false);

// // //   useEffect(() => {
// // //     if (!authToken || isLoading) return;

// // //     const fetchQuestions = async () => {
// // //       try {
// // //         const res = await backendApi.get("/question_management/get_questions/", {
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //             Authorization: `Token ${authToken}`,
// // //           },
// // //         });

// // //         const questionData = res.data;

// // //         setQuestions(
// // //           Array.isArray(questionData.data.questions)
// // //             ? questionData.data.questions.map((q) => ({
// // //                 ...q,
// // //                 options: Array.isArray(q.options) ? q.options : [],
// // //               }))
// // //             : []
// // //         );
// // //       } catch (error) {
// // //         console.error("Error fetching questions:", error);
// // //         Swal.fire("Error", error.message || "Something went wrong", "error");
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     fetchQuestions();
// // //   }, [authToken, isLoading]);

// // //   if (loading) return <div className="p-4">Loading questions...</div>;

// // //   return (
// // //     <div className="p-4">
// // //       <div className="flex justify-between items-center mb-4">
// // //         <h2 className="text-xl font-semibold">Manage Questions</h2>
// // //         <button
// // //           onClick={() => setShowModal(true)}
// // //           className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
// // //         >
// // //           Create Question
// // //         </button>
// // //       </div>

// // //       <div className="overflow-x-auto">
// // //         <table className="min-w-full text-sm border">
// // //           <thead className="bg-gray-100 text-left">
// // //             <tr>
// // //               <th className="p-2">No.</th>
// // //               <th className="p-2">Question</th>
// // //               <th className="p-2">Type</th>
// // //               <th className="p-2">Options</th>
// // //               <th className="p-2">Edit</th>
// // //               <th className="p-2">Action</th>
// // //             </tr>
// // //           </thead>
// // //           <tbody>
// // //             {questions.map((question) => (
// // //               <tr key={question.id} className="border-t">
// // //                 <td className="p-2">{question.id}</td>
// // //                 <td className="p-2">{question.text}</td>
// // //                 <td className="p-2">{question.question_type}</td>
// // //                 <td className="p-2">
// // //                   <ul className="list-disc list-inside">
// // //                     {question.options.map((opt, idx) => (
// // //                       <li key={idx}>{opt.option}</li>
// // //                     ))}
// // //                   </ul>
// // //                 </td>
// // //                 <td className="p-2">
// // //                   <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs">
// // //                     Edit
// // //                   </button>
// // //                 </td>
// // //                 <td className="p-2">
// // //                   {question.is_active ? (
// // //                     <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">
// // //                       Deactivate
// // //                     </button>
// // //                   ) : (
// // //                     <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">
// // //                       Activate
// // //                     </button>
// // //                   )}
// // //                 </td>
// // //               </tr>
// // //             ))}
// // //           </tbody>
// // //         </table>
// // //       </div>

// // //       {/* Modal */}
// // //       {showModal && (
// // //         <Create_Modal_Wrapper onClose={() => setShowModal(false)}>
// // //           <CreateQuestionForm questionTypes={questionTypes} />
// // //         </Create_Modal_Wrapper>
// // //       )}
// // //     </div>
// // //   );
// // // }
// // "use client";
// // import React, { useState, useEffect } from "react";
// // import backendApi from "../../../../utils/backendApi";
// // import { useAuth } from "../../../../AuthContext";
// // import Swal from "sweetalert2";
// // import CreateQuestionForm from "./create_question_form_component";
// // import Modal from "react-bootstrap/Modal";
// // import Button from "react-bootstrap/Button";

// // export default function ManageQuestions({ formId, questionTypes }) {
// //   const { authToken, isLoading } = useAuth();
// //   const [questions, setQuestions] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showModal, setShowModal] = useState(false);

// //   useEffect(() => {
// //     if (!authToken || isLoading) return;

// //     const fetchQuestions = async () => {
// //       try {
// //         const res = await backendApi.get(
// //           "/question_management/get_questions/",
// //           {
// //             headers: {
// //               "Content-Type": "application/json",
// //               Authorization: `Token ${authToken}`,
// //             },
// //           }
// //         );

// //         const questionData = res.data;

// //         setQuestions(
// //           Array.isArray(questionData.data.questions)
// //             ? questionData.data.questions.map((q) => ({
// //                 ...q,
// //                 options: Array.isArray(q.options) ? q.options : [],
// //               }))
// //             : []
// //         );
// //       } catch (error) {
// //         console.error("Error fetching questions:", error);
// //         Swal.fire("Error", error.message || "Something went wrong", "error");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchQuestions();
// //   }, [authToken, isLoading]);

// //   const handleClose = () => setShowModal(false);
// //   const handleShow = () => setShowModal(true);

// //   if (loading) return <div className="p-4">Loading questions...</div>;

// //   return (
// //     <div className="p-4">
// //       <div className="flex justify-between items-center mb-4">
// //         <h2 className="text-xl font-semibold">Manage Questions</h2>
// //         <button
// //           onClick={handleShow}
// //           className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
// //         >
// //           Create Question
// //         </button>
// //       </div>

// //       <div className="overflow-x-auto">
// //         <table className="min-w-full text-sm border">
// //           <thead className="bg-gray-100 text-left">
// //             <tr>
// //               <th className="p-2">No.</th>
// //               <th className="p-2">Question</th>
// //               <th className="p-2">Type</th>
// //               <th className="p-2">Options</th>
// //               <th className="p-2">Edit</th>
// //               <th className="p-2">Action</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {questions.map((question) => (
// //               <tr key={question.id} className="border-t">
// //                 <td className="p-2">{question.id}</td>
// //                 <td className="p-2">{question.text}</td>
// //                 <td className="p-2">{question.question_type}</td>
// //                 <td className="p-2">
// //                   <ul className="list-disc list-inside">
// //                     {question.options.map((opt, idx) => (
// //                       <li key={idx}>{opt.option}</li>
// //                     ))}
// //                   </ul>
// //                 </td>
// //                 <td className="p-2">
// //                   <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs">
// //                     Edit
// //                   </button>
// //                 </td>
// //                 <td className="p-2">
// //                   {question.is_active ? (
// //                     <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">
// //                       Deactivate
// //                     </button>
// //                   ) : (
// //                     <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">
// //                       Activate
// //                     </button>
// //                   )}
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Modal with proper background styling */}
// //       <Modal 
// //         show={showModal} 
// //         onHide={handleClose}
// //         centered
// //         backdrop="static" // Prevents closing on clicking outside
// //         backdropClassName="bg-black bg-opacity-50" // This adds semi-transparent background
// //         className="modal-with-shadow"
// //       >
// //         <Modal.Header closeButton>
// //           <Modal.Title>Create New Question</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           <CreateQuestionForm questionTypes={questionTypes} />
// //         </Modal.Body>
// //         <Modal.Footer>
// //           <Button variant="secondary" onClick={handleClose}>
// //             Cancel
// //           </Button>
// //         </Modal.Footer>
// //       </Modal>

// //       {/* Add this CSS to your global styles or component */}
// //       <style jsx global>{`
// //         .modal-with-shadow .modal-content {
// //           box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
// //         }
// //         .modal-backdrop {
// //           opacity: 0.5 !important;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }
// "use client";
// import React, { useState, useEffect } from "react";
// import backendApi from "../../../../utils/backendApi";
// import { useAuth } from "../../../../AuthContext";
// import Swal from "sweetalert2";
// import CreateQuestionForm from "./create_question_form_component";
// import Modal from "react-bootstrap/Modal";
// import Button from "react-bootstrap/Button";
// import Create_Modal_Wrapper from "./create_modal_wrapper";

// export default function ManageQuestions({ formId, questionTypes }) {
//   const { authToken, isLoading } = useAuth();
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     if (!authToken || isLoading) return;

//     const fetchQuestions = async () => {
//       try {
//         const res = await backendApi.get(
//           "/question_management/get_questions/",
//           {
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Token ${authToken}`,
//             },
//           }
//         );

//         const questionData = res.data;

//         setQuestions(
//           Array.isArray(questionData.data.questions)
//             ? questionData.data.questions.map((q) => ({
//                 ...q,
//                 options: Array.isArray(q.options) ? q.options : [],
//               }))
//             : []
//         );
//       } catch (error) {
//         console.error("Error fetching questions:", error);
//         Swal.fire("Error", error.message || "Something went wrong", "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQuestions();
//   }, [authToken, isLoading]);

//   if (loading) return <div className="p-4">Loading questions...</div>;

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Manage Questions</h2>
//         <button
//           onClick={() => setShowModal(true)}
//           className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
//         >
//           Create Question
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="min-w-full text-sm border">
//           <thead className="bg-gray-100 text-left">
//             <tr>
//               <th className="p-2">No.</th>
//               <th className="p-2">Question</th>
//               <th className="p-2">Type</th>
//               <th className="p-2">Options</th>
//               <th className="p-2">Edit</th>
//               <th className="p-2">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {questions.map((question) => (
//               <tr key={question.id} className="border-t">
//                 <td className="p-2">{question.id}</td>
//                 <td className="p-2">{question.text}</td>
//                 <td className="p-2">{question.question_type}</td>
//                 <td className="p-2">
//                   <ul className="list-disc list-inside">
//                     {question.options.map((opt, idx) => (
//                       <li key={idx}>{opt.option}</li>
//                     ))}
//                   </ul>
//                 </td>
//                 <td className="p-2">
//                   <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs">
//                     Edit
//                   </button>
//                 </td>
//                 <td className="p-2">
//                   {question.is_active ? (
//                     <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">
//                       Deactivate
//                     </button>
//                   ) : (
//                     <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">
//                       Activate
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Using your Create_Modal_Wrapper component with proper styling and props */}
//       <Create_Modal_Wrapper
//         show={showModal}
//         onHide={() => setShowModal(false)}
//         centered={true}
//         backdrop="static"
//         backdropClassName="bg-black bg-opacity-50"
//         dialogClassName="modal-with-shadow"
//         size="lg"
//         title="Create New Question"
//       >
//         <CreateQuestionForm questionTypes={questionTypes} />
//       </Create_Modal_Wrapper>

//       {/* Add this CSS to your global styles or component */}
//       <style jsx global>{`
//         .modal-backdrop {
//           opacity: 0.5 !important;
//         }
//         .modal-with-shadow .modal-content {
//           box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
//         }
//       `}</style>
//     </div>
//   );
// }
"use client";
import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";
import CreateQuestionForm from "./create_question_form_component";

export default function ManageQuestions({ formId, questionTypes }) {
  const { authToken, isLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Manage Questions</h2>
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
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs">
                    Edit
                  </button>
                </td>
                <td className="p-2">
                  {question.is_active ? (
                    <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs">
                      Deactivate
                    </button>
                  ) : (
                    <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-xs">
                      Activate
                    </button>
                  )}
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
    </div>
  );
}