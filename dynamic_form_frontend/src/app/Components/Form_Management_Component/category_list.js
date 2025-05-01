import React, { useState } from 'react';

const CategoryList = ({ categories }) => {
  const [expanded_category_id, setExpandedCategoryId] = useState(null);

  const handleCategoryExpand = (category_id) => {
    setExpandedCategoryId(expanded_category_id === category_id ? null : category_id);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Categories</h2>
      {categories.length === 0 ? (
        <p>No categories available.</p>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 px-4">Category Name</th>
              <th className="border-b py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="border-b py-2 px-4">{category.name}</td>
                <td className="border-b py-2 px-4">
                  <button
                    onClick={() => handleCategoryExpand(category.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {expanded_category_id === category.id ? 'Collapse' : 'Expand'}
                  </button>
                </td>
              </tr>
            ))}
            {expanded_category_id && (
              <tr>
                <td colSpan="2" className="border-b py-2 px-4">
                  {/* Add any expanded content related to the category */}
                  <div>Category details go here...</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CategoryList;
