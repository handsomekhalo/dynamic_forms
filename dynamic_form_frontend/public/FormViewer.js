// public/FormViewer.jsx (or .js if not JSX)
import React, { useEffect, useState } from "react";

const FormViewer = () => {
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const form_id = urlParams.get("form_id");
    const user_id = urlParams.get("user_id");

    if (!form_id || !user_id) {
      setError("Missing form_id or user_id");
      return;
    }

    fetch(`http://52.14.111.23/form_portal_management/get_form_answers_from_user/${form_id}/${user_id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Form not found or API failed");
        return res.json();
      })
      .then((data) => setFormData(data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!formData) return <p>Loading form...</p>;

  return (
    <div>
      <h2>{formData.title || "Dynamic Form"}</h2>
      {/* Render the form dynamically here */}
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
};

export default FormViewer;
