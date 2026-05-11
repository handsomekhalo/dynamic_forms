"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import backendApi from "../../../utils/backendApi";
import { useAuth } from "../../../AuthContext";

// export default function CreateQuestionForm() {
 export default function CreateQuestionForm({
  onSuccess,
  onClose,
}) {
  const { authToken, isLoading } = useAuth();

  const [questionType, setQuestionType] = useState(""); // stores selected question_type ID
  const [questionTypes, setQuestionTypes] = useState([]);
  const [numberOfOptions, setNumberOfOptions] = useState(0);
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editQuestionData, setEditQuestionData] = useState(null); // For passing the question to edit
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState(null); //


  useEffect(() => {
    if (!authToken || isLoading) return;

    const fetchQuestionsTypes = async () => {
      try {
        const res = await backendApi.get("/question_management/get_questions/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${authToken}`,
          },
        });

        const questionData = res.data;
        if (
          questionData?.data?.question_types &&
          Array.isArray(questionData.data.question_types)
        ) {
          setQuestionTypes(questionData.data.question_types);
        }
      } catch (error) {
        console.error("Error fetching question types:", error);
        Swal.fire("Error", error.message || "Something went wrong", "error");
      }
    };

    fetchQuestionsTypes();
  }, [authToken, isLoading]);

  // Show options input if selected question type's name is "Checkbox" or "Selection"
  useEffect(() => {
    if (!questionType) {
      setShowOptions(false);
      return;
    }
    const selectedType = questionTypes.find((type) => String(type.id) === String(questionType));
    setShowOptions(
      selectedType &&
      (selectedType.name === "Checkbox" || selectedType.name === "Selection")
    );
  }, [questionType, questionTypes]);

  const handleOptionsChange = (e) => {
    const num = parseInt(e.target.value, 10) || 0;
    if (num > 25) {
      Swal.fire(
        "Too Many Options",
        "You cannot enter more than 25 options.",
        "error"
      );
      return;
    }
    setNumberOfOptions(num);
    setOptions(Array.from({ length: num }, () => ""));
  };

  const handleOptionInput = (idx, val) => {
    const newOptions = [...options];
    newOptions[idx] = val;
    setOptions(newOptions);
  };

  const validateForm = (formData) => {
    const errors = {};
    
    // Validate question text
    if (!formData.get("question").trim()) {
      errors.question = "Question text is required";
    }
    
    // Validate question number - ensure it's a number
    const questionNumber = formData.get("question_number");
    if (questionNumber) {
      if (isNaN(Number(questionNumber))) {
        errors.question_number = "Question number must be a valid number";
      }
    }
    
    // Validate question type
    if (!formData.get("question_type")) {
      errors.question_type = "Question type is required";
    }
    
    // Validate options for checkbox or selection types
    if (showOptions && options.filter(opt => opt.trim()).length === 0) {
      errors.options = "At least one option is required";
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Form validation
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Clear any previous validation errors
    setValidationErrors({});

    const payload = {
      question: formData.get("question"),
      question_number: formData.get("question_number") || "0", // Default to 0 if empty
      question_type: formData.get("question_type"),
      mandatory: formData.get("mandatory") === "True",
      other_field: formData.get("other_field") === "True",
      options: options.filter((opt) => opt.trim() !== ""),
    };

    try {
      const response = await backendApi.post(
        "/question_management/add_questions/",
        payload,
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (result.status === "success") {
              Swal.fire(
          "Success",
          result.message || "Question created successfully",
          "success"
        );
        if (onSuccess) {
  await onSuccess();
}

if (onClose) {
  onClose();
}

      } else {
        // Handle server validation errors
        if (result.errors) {
          setValidationErrors(result.errors);
        } else {
          Swal.fire("Error", result.message || "Something went wrong", "error");
        }
      }
    } catch (err) {
      console.error("Question submission failed:", err);
      
      // Handle server response errors
      if (err.response && err.response.data && err.response.data.errors) {
        setValidationErrors(err.response.data.errors);
      } else {
        Swal.fire("Error", "Something went wrong. Try again.", "error");
      }
    }
  };

  return (
    <form id="add_questions_form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Question *</label>
          <input
            type="text"
            name="question"
            className={`w-full border rounded px-2 py-1 text-sm ${
              validationErrors.question ? "border-red-500" : ""
            }`}
            placeholder="Is the building occupied?"
            required
          />
          {validationErrors.question && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.question}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">Question Number</label>
          <input
            type="number"
            name="question_number"
            className={`w-full border rounded px-2 py-1 text-sm ${
              validationErrors.question_number ? "border-red-500" : ""
            }`}
            placeholder="1"
            min="0"
            defaultValue="0"
          />
          {validationErrors.question_number ? (
            <p className="text-red-500 text-xs mt-1">{validationErrors.question_number}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              Enter a number to set the display order
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Select Question Type *
          </label>
          <select
            name="question_type"
            className={`w-full border rounded px-2 py-1 text-sm ${
              validationErrors.question_type ? "border-red-500" : ""
            }`}
            onChange={(e) => setQuestionType(e.target.value)}
            required
            value={questionType}
          >
            <option hidden value="">
              Question Type
            </option>
            {questionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {validationErrors.question_type && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.question_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">
            Is the Question Mandatory? *
          </label>
          <select
            name="mandatory"
            className="w-full border rounded px-2 py-1 text-sm"
            required
          >
            <option hidden>Select Option</option>
            <option value="False">No</option>
            <option value="True">Yes</option>
          </select>
        </div>
      </div>

      {showOptions && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Add Options</p>
          <div>
            <label className="block text-sm font-medium">
              Enter number of options
            </label>
            <input
              type="number"
              min="1"
              className="w-full border rounded px-2 py-1 text-sm"
              onChange={handleOptionsChange}
              value={numberOfOptions}
            />
          </div>

          {options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              className={`w-full border rounded px-2 py-1 text-sm ${
                validationErrors.options ? "border-red-500" : ""
              }`}
              value={opt}
              onChange={(e) => handleOptionInput(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
            />
          ))}
          
          {validationErrors.options && (
            <p className="text-red-500 text-xs">{validationErrors.options}</p>
          )}

          <div>
            <label className="block text-sm font-medium">
              Extra field for other option?
            </label>
            <select
              name="other_field"
              className="w-full border rounded px-2 py-1 text-sm"
              defaultValue="False"
            >
              <option value="False">No</option>
              <option value="True">Yes</option>
            </select>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700"
      >
        Create Question
      </button>
    </form>
  );
}