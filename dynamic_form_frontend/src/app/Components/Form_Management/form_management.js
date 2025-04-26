"use client";

import React from "react";

export default function Form_Management() {
  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">Form Management</h1>
      <p className="text-gray-600 mb-6">
        Create and manage forms and categories here.
      </p>

      <div className="space-y-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
          Create New Form
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
          Create New Category
        </button>
      </div>
    </div>
  );
}
