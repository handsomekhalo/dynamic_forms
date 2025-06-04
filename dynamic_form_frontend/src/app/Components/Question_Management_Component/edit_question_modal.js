"use client";
import { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import Swal from "sweetalert2";
import { useAuth } from "../../../../AuthContext";

export default function EditQuestionModal({ question, onClose, onUpdate }) {
  const { authToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    question: "",
    question_number: 0,
    input_type: "", // This is what we actually want to update
    question_type_id: null, // Keep track of the question_type ID
    mandatory: false,
    other_field: false,
  });

  const [debugData, setDebugData] = useState(null);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (question?.id && authToken) {
        try {
          setLoading(true);
          const res = await backendApi.get(
            `/question_management/get_question_detail/${question.id}/`,
            {
              headers: { Authorization: `Token ${authToken}` },
            }
          );

          setDebugData(res.data);
          const backendData = res.data.data;

          console.log("Backend data:", backendData); // Debug log

          setFormData({
            question: backendData.text ?? "",
            question_number: backendData.order ?? 0,
            input_type: backendData.input_type ?? "", // Use input_type directly
            question_type_id: backendData.question_type?.id ?? null, // Store the ID
            mandatory: backendData.is_required ?? false,
            other_field: backendData.allow_other_option ?? false,
          });
        } catch (err) {
          console.error("Error fetching question detail:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestionDetails();
  }, [question?.id, authToken]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data exactly as backend expects
    const backendFormData = {
      text: formData.question,
      order: parseInt(formData.question_number, 10) || 0,
      input_type: formData.input_type, // Send the input_type choice
      question_type: formData.question_type_id, // Send the question_type ID
      is_required: formData.mandatory,
      allow_other_option: formData.other_field,
      is_active: true,
    };

    console.log("Sending to backend:", backendFormData); // Debug log

    try {
      const response = await backendApi.put(
        `/question_management/update_question/${question.id}/`,
        backendFormData,
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Backend response:", response.data); // Debug log
      
      Swal.fire("Updated", "Question updated successfully", "success").then(async () => {
        if (onUpdate) {
          console.log("Calling onUpdate to refresh parent data..."); // Debug log
          await onUpdate();  // Wait for refresh to complete
        }
        onClose();  // Close modal after refresh
      });
      
    } catch (err) {
      console.error("Error updating question:", err);
      console.error("Error response:", err.response?.data); // Debug log
      Swal.fire(
        "Error",
        "Failed to update question: " + (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

  return (
    <div className="w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-4">Edit Question</h2>

      {loading ? (
        <div className="text-center py-4">Loading question data...</div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order/Number</label>
              <input
                type="number"
                name="question_number"
                value={formData.question_number}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
              <select
                name="input_type"
                value={formData.input_type}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option hidden value="">Select Input Type</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
                <option value="email">Email</option>
                <option value="date">Date</option>
                <option value="file">File</option>
                <option value="select">Dropdown Selection</option>
                <option value="textarea">Long Text Area</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                Current selected type: {formData.input_type || "None"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Question?</label>
              <select
                name="mandatory"
                value={formData.mandatory ? "True" : "False"}
                onChange={(e) => setFormData({ ...formData, mandatory: e.target.value === "True" })}
                className="w-full border rounded px-2 py-1"
              >
                <option value="True">Yes</option>
                <option value="False">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allow Other Option?</label>
              <select
                name="other_field"
                value={formData.other_field ? "True" : "False"}
                onChange={(e) => setFormData({ ...formData, other_field: e.target.value === "True" })}
                className="w-full border rounded px-2 py-1"
              >
                <option value="True">Yes</option>
                <option value="False">No</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </form>

          <details className="mt-8 border-t pt-4">
            <summary className="cursor-pointer text-sm text-gray-500">Debug Data</summary>
            <div className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
              <h4 className="font-bold">Original API Response:</h4>
              <pre>{JSON.stringify(debugData, null, 2)}</pre>

              <h4 className="font-bold mt-4">Current Form Data:</h4>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
              
              <h4 className="font-bold mt-4">What will be sent to backend:</h4>
              <pre>{JSON.stringify({
                text: formData.question,
                order: parseInt(formData.question_number, 10) || 0,
                input_type: formData.input_type,
                question_type: formData.question_type_id,
                is_required: formData.mandatory,
                allow_other_option: formData.other_field,
                is_active: true,
              }, null, 2)}</pre>
            </div>
          </details>
        </>
      )}
    </div>
  );
}



// "use client";
// import { useState, useEffect } from "react";
// import backendApi from "../../../../utils/backendApi";
// import Swal from "sweetalert2";
// import { useAuth } from "../../../../AuthContext";

// export default function EditQuestionModal({ question, onClose,onUpdate  }) {
//   const { authToken } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [formData, setFormData] = useState({
//     question: "",
//     question_number: 0,
//     question_type: "",
//     mandatory: false,
//     other_field: false,
//   });

//   const [debugData, setDebugData] = useState(null);

//   useEffect(() => {
//     const fetchQuestionDetails = async () => {
//       if (question?.id && authToken) {
//         try {
//           setLoading(true);
//           const res = await backendApi.get(
//             `/question_management/get_question_detail/${question.id}/`,
//             {
//               headers: { Authorization: `Token ${authToken}` },
//             }
//           );

//           setDebugData(res.data);
//           const backendData = res.data.data;

//           const questionType =
//             backendData.question_type?.name?.toLowerCase() ||
//             backendData.input_type ||
//             "";

//           setFormData({
//             question: backendData.text ?? "",
//             question_number: backendData.order ?? 0,
//             question_type: questionType,
//             mandatory: backendData.is_required ?? false,
//             other_field: backendData.allow_other_option ?? false,
//           });
//         } catch (err) {
//           console.error("Error fetching question detail:", err);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchQuestionDetails();
//   }, [question?.id, authToken]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const backendFormData = {
//       text: formData.question,
//       order: parseInt(formData.question_number, 10) || 0,
//       input_type: formData.question_type,
//       is_required: formData.mandatory,
//       allow_other_option: formData.other_field,
//       is_active: true,
//     };

//     try {
//       await backendApi.put(
//         `/question_management/update_question/${question.id}/`,
//         backendFormData,
//         {
//           headers: {
//             Authorization: `Token ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       Swal.fire("Updated", "Question updated successfully", "success").then(() => {
//         if (onUpdate) onUpdate();  // Notify parent to refresh
//         onClose();                 // Close modal
//       });
      
//     } catch (err) {
//       console.error("Error updating question:", err);
//       Swal.fire(
//         "Error",
//         "Failed to update question: " + (err.response?.data?.message || err.message),
//         "error"
//       );
//     }
//   };

//   return (
//     <div className="w-full max-w-lg">
//       <h2 className="text-lg font-semibold mb-4">Edit Question</h2>

//       {loading ? (
//         <div className="text-center py-4">Loading question data...</div>
//       ) : (
//         <>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
//               <input
//                 type="text"
//                 name="question"
//                 value={formData.question}
//                 onChange={handleChange}
//                 className="w-full border rounded px-2 py-1"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Order/Number</label>
//               <input
//                 type="number"
//                 name="question_number"
//                 value={formData.question_number}
//                 onChange={handleChange}
//                 className="w-full border rounded px-2 py-1"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
//               <select
//                 name="question_type"
//                 value={formData.question_type}
//                 onChange={handleChange}
//                 className="w-full border rounded px-2 py-1"
//                 required
//               >
//                 <option hidden value="">Select Question Type</option>
//                 <option value="text">Text</option>
//                 <option value="number">Number</option>
//                 <option value="radio">Radio</option>
//                 <option value="checkbox">Checkbox</option>
//                 <option value="email">Email</option>
//                 <option value="date">Date</option>
//                 <option value="file">File</option> {/* ✅ ADD THIS LINE */}

//               </select>
//               <div className="text-xs text-gray-500 mt-1">
//                 Current selected type: {formData.question_type || "None"}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Required Question?</label>
//               <select
//                 name="mandatory"
//                 value={formData.mandatory ? "True" : "False"}
//                 onChange={(e) => setFormData({ ...formData, mandatory: e.target.value === "True" })}
//                 className="w-full border rounded px-2 py-1"
//               >
//                 <option value="True">Yes</option>
//                 <option value="False">No</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Allow Other Option?</label>
//               <select
//                 name="other_field"
//                 value={formData.other_field ? "True" : "False"}
//                 onChange={(e) => setFormData({ ...formData, other_field: e.target.value === "True" })}
//                 className="w-full border rounded px-2 py-1"
//               >
//                 <option value="True">Yes</option>
//                 <option value="False">No</option>
//               </select>
//             </div>

//             <div className="flex justify-end space-x-2 pt-2">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Update
//               </button>
//             </div>
//           </form>

//           <details className="mt-8 border-t pt-4">
//             <summary className="cursor-pointer text-sm text-gray-500">Debug Data</summary>
//             <div className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-64">
//               <h4 className="font-bold">Original API Response:</h4>
//               <pre>{JSON.stringify(debugData, null, 2)}</pre>

//               <h4 className="font-bold mt-4">Current Form Data:</h4>
//               <pre>{JSON.stringify(formData, null, 2)}</pre>
//             </div>
//           </details>
//         </>
//       )}
//     </div>
//   );
// }
