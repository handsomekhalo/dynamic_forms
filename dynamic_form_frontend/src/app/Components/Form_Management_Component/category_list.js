'use client';
import React, { useState } from 'react';
import backendApi from '../../../../utils/backendApi';

export default function CategoryList({ categories, onCheckboxChange, onAssignCategory }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Categories</h2>
      <ul className="space-y-4">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={category.isChecked}  // Bind to the 'isChecked' state
              onChange={() => onCheckboxChange(category.id)}  // Toggle the checkbox
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span>{category.name}</span>
          </li>
        ))}
      </ul>

      {/* Button to assign selected categories */}
      <button
        onClick={() => {
          const selectedCategories = categories.filter(category => category.isChecked);
          selectedCategories.forEach(category => {
            onAssignCategory(category.id);  // Assign each selected category
          });
        }}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Assign Selected Categories
      </button>
    </div>
  );
}

