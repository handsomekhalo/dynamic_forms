import React from 'react';

export default function CategoryList({ categories, onCheckboxChange, onAssignCategory }) {
  // If no categories are available, show a message
  if (!categories || categories.length === 0) {
    return (
      <div className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Unassigned Categories</h2>
        <p className="text-gray-500">Select a form first to view available categories.</p>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Unassigned Categories</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={category.isChecked}
                onChange={() => onCheckboxChange(category.id)}
                className="mr-3 h-4 w-4"
              />
              <label htmlFor={`category-${category.id}`} className="cursor-pointer">
                {category.name}
              </label>
            </div>
            <button
              onClick={() => onAssignCategory(category.id)}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Assign
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}