// StatusChangeModal.jsx
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import Swal from "sweetalert2";

export default function StatusChangeModal({ questionId, newStatus, onClose }) {
  const { authToken } = useAuth();

  const handleStatusChange = async () => {
    try {
      const res = await backendApi.put(
        `/question_management/toggle_status/${questionId}/`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      Swal.fire("Success", "Status changed", "success").then(() =>
        window.location.reload()
      );
    } catch (error) {
      console.error("Failed to change status", error);
      Swal.fire("Error", "Failed to change status", "error");
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold mb-4">
        {newStatus ? "Activate" : "Deactivate"} Question?
      </h2>
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
          Cancel
        </button>
        <button
          onClick={handleStatusChange}
          className={`px-4 py-2 ${
            newStatus ? "bg-green-600" : "bg-red-600"
          } text-white rounded`}
        >
          {newStatus ? "Activate" : "Deactivate"}
        </button>
      </div>
    </div>
  );
}
