"use client";
import React, { useState, useEffect } from "react";
import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";

export default function FormPortal_Management() {
//   const [forms, setForms] = useState([]);
  const [forms, setForms] = useState([]);

  const [selectedFormId, setSelectedFormId] = useState(null);
  const [formDetails, setFormDetails] = useState([]);
  const [formAnswers, setFormAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();


useEffect(() => {
  const fetchForms = async () => {
    try {
      const res = await backendApi.get("/application_management/get_all_forms/");
      console.log("Forms API response:", res.data);
    //   setForms(res.data); // ✅ res.data is an array already
      setForms(res.data.forms || []);

    } catch (error) {
      console.error("Error fetching forms:", error);
    }
  };

  fetchForms();
}, []);


  const handleFormSelect = async (formId) => {
    setSelectedFormId(formId);
    try {
      const res = await backendApi.get(`/application_management/get_form_details/${formId}/`);
      setFormDetails(res.data || []);
    } catch (err) {
      console.error("Error fetching form details:", err);
      setError("Failed to load form details.");
    }
  };

  const handleInputChange = (questionId, value) => {
    setFormAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const renderInputField = (question) => {
    switch (question.input_type) {
      case "text":
        return (
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={formAnswers[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={formAnswers[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        );
      case "textarea":
        return (
          <textarea
            className="border p-2 rounded w-full"
            value={formAnswers[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={!!formAnswers[question.id]}
            onChange={(e) => handleInputChange(question.id, e.target.checked)}
          />
        );
      default:
        return <p className="text-red-600">Unsupported input type</p>;
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Form Answering Portal</h2>

      {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}

      <div className="mb-6">
        <label className="block mb-2 font-medium">Select a Form</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedFormId || ""}
          onChange={(e) => handleFormSelect(e.target.value)}
        >
          <option value="">-- Choose Form --</option>
          {/* {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.name}
            </option>
          ))} */}
          {forms?.map?.((form) => (
  <option key={form.id} value={form.id}>
    {form.name}
  </option>
))}

        </select>
      </div>

      {formDetails.length > 0 && (
        <div className="space-y-6">
          {formDetails.map((category) => (
            <div key={category.id} className="border-t pt-4">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
              <div className="mt-4 space-y-4">
                {category.questions.map((question) => (
                  <div key={question.id}>
                    <label className="block font-medium mb-1">
                      {question.question_text}
                    </label>
                    {renderInputField(question)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
