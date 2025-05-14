"use client";
import { useEffect, useState } from "react";

export default function QuestionOptionInput({ numberOfOptions, onOptionsChange }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!numberOfOptions || numberOfOptions > 25) {
      setOptions([]);
      return;
    }

    const newOptions = Array.from({ length: numberOfOptions }, (_, index) => ({
      id: index + 1,
      value: "",
    }));
    setOptions(newOptions);
  }, [numberOfOptions]);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].value = value;
    setOptions(updated);
    onOptionsChange(updated.map(opt => opt.value));
  };

  if (!numberOfOptions || numberOfOptions > 25) return null;

  return (
    <div>
      {options.map((option, index) => (
        <div key={option.id} className="mt-2">
          <input
            type="text"
            required
            className="form-control text-xxs"
            placeholder={`Option ${option.id}`}
            value={option.value}
            onChange={(e) => handleOptionChange(index, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
