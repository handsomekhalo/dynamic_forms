import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function CreateQuestionForm({ questionTypes }) {
  const [questionType, setQuestionType] = useState('');
  const [numberOfOptions, setNumberOfOptions] = useState(0);
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setShowOptions(questionType === 'Checkbox' || questionType === 'Selection');
  }, [questionType]);

  const handleOptionsChange = (e) => {
    const num = parseInt(e.target.value, 10);
    if (num > 25) {
      Swal.fire("Too Many Options", "You cannot enter more than 25 options.", "error");
      return;
    }

    setNumberOfOptions(num);
    setOptions(Array.from({ length: num }, () => ''));
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
    options.forEach(option => formData.append('option[]', option));

    try {
      const response = await fetch('/your-add-question-api-url', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': window.CSRF_TOKEN,
        },
      });
      const result = await response.json();

      if (result.status === 'success') {
        Swal.fire("Success", result.message, "success").then(() => window.location.reload());
      } else {
        Swal.fire("Error", "Something went wrong", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong. Try again.", "error");
    }
  };

  return (
    <form id="add_questions_form" onSubmit={handleSubmit}>
      {/* Question and Number */}
      <div className="row">
        <div className="col">
          <div className="mb-3">
            <label htmlFor="question" className="form-label text-xxs"><strong>Question *</strong></label>
            <input type="text" className="form-control text-xxs" id="question" name="question" placeholder="Is the building occupied?" required />
          </div>
        </div>
        <div className="col">
          <div className="mb-3">
            <label htmlFor="question_number" className="form-label text-xxs"><strong>Question Number *</strong></label>
            <input type="text" className="form-control text-xxs" id="question_number" name="question_number" placeholder="eg. 1" required />
          </div>
        </div>
      </div>

      {/* Type and Mandatory */}
      <div className="row">
        <div className="col mb-3">
          <label htmlFor="question_type" className="form-label text-xxs"><strong>Select Question Type *</strong></label>
          <select name="question_type" id="question_type" className="form-select text-xxs" onChange={(e) => setQuestionType(e.target.value)} required>
            <option hidden>Question Type</option>
            {questionTypes.map(type => (
              <option key={type.question_type} value={type.question_type}>{type.question_type}</option>
            ))}
          </select>
        </div>
        <div className="col mb-3">
          <label htmlFor="mandatory" className="form-label text-xxs"><strong>Is the Question Mandatory? *</strong></label>
          <select name="mandatory" id="mandatory" className="form-select text-xxs" required>
            <option hidden>Select Option</option>
            <option value="False">No</option>
            <option value="True">Yes</option>
          </select>
        </div>
      </div>

      {/* Dynamic Options */}
      {showOptions && (
        <>
          <h6 className="option text-sm">Add Options If Applicable</h6>
          <div className="row">
            <div className="col mb-3">
              <label className="form-label text-xxs"><strong>Enter number of options</strong></label>
              <input type="number" className="form-control text-xxs" min="1" onInput={handleOptionsChange} />
            </div>
            <div className="col mb-3 mt-4">
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="form-control text-xxs mb-1"
                  value={opt}
                  onChange={(e) => handleOptionInput(idx, e.target.value)}
                  required
                  placeholder={`Option ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="row">
            <div className="col mb-3">
              <label htmlFor="other_field" className="form-label text-xxs"><strong>Do you have an extra field for <span>other</span> options? *</strong></label>
              <select name="other_field" id="other_field" className="form-select text-xxs">
                <option hidden value="">Select Option</option>
                <option value="False">No</option>
                <option value="True">Yes</option>
              </select>
            </div>
          </div>
        </>
      )}

      <button type="submit" className="btn btn-primary btn-sm">Create Question</button>
    </form>
  );
}
