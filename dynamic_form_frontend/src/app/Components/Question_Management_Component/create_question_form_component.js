import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function CreateQuestionForm({ questionTypes = [] }) {
  const [questionType, setQuestionType] = useState("");
  const [numberOfOptions, setNumberOfOptions] = useState(0);
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setShowOptions(questionType === "Checkbox" || questionType === "Selection");
  }, [questionType]);

  const handleOptionsChange = (e) => {
    const num = parseInt(e.target.value, 10);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    options.forEach((option) => formData.append("option[]", option));

    try {
      const response = await fetch("/your-add-question-api-url", {
        method: "POST",
        body: formData,
        headers: { "X-CSRFToken": window.CSRF_TOKEN },
      });
      const result = await response.json();

      if (result.status === "success") {
        Swal.fire("Success", result.message, "success").then(() =>
          window.location.reload()
        );
      } else {
        Swal.fire("Error", "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong. Try again.", "error");
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
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Is the building occupied?"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Question Number *</label>
          <input
            type="text"
            name="question_number"
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="e.g. 1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">
            Select Question Type *
          </label>
          <select
            name="question_type"
            className="w-full border rounded px-2 py-1 text-sm"
            onChange={(e) => setQuestionType(e.target.value)}
            required
          >
            <option hidden>Question Type</option>
            {questionTypes.map((type) => (
              <option key={type.question_type} value={type.question_type}>
                {type.question_type}
              </option>
            ))}
          </select>
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
          <p className="text-sm font-semibold">Add Options If Applicable</p>
          <div>
            <label className="block text-sm font-medium">
              Enter number of options
            </label>
            <input
              type="number"
              min="1"
              className="w-full border rounded px-2 py-1 text-sm"
              onInput={handleOptionsChange}
            />
          </div>

          {options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              className="w-full border rounded px-2 py-1 text-sm"
              value={opt}
              onChange={(e) => handleOptionInput(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              required
            />
          ))}

          <div>
            <label className="block text-sm font-medium">
              Extra field for Other option? *
            </label>
            <select
              name="other_field"
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option hidden value="">
                Select Option
              </option>
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
