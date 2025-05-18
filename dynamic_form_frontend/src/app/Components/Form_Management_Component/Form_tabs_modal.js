  // UI Additions for Filters and Assignment Status
  import React, { useState } from 'react';

  export default function FormTabs({ activeTab, onTabChange }) {
    const tabs = [
      { key: 'all', label: 'All Forms' },
      { key: 'assigned', label: 'With Assigned Categories' },
      { key: 'unassigned', label: 'Without Assigned Categories' },
    ];

    return (
      <div className="flex space-x-4 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // Enhanced FormList Component
  export function EnhancedFormList({ forms, activeTab, onAssignClick, onAssignQuestionsClick }) {
    const filteredForms = forms.filter((form) => {
      const hasCategories = form.categories && form.categories.length > 0;
      if (activeTab === 'assigned') return hasCategories;
      if (activeTab === 'unassigned') return !hasCategories;
      return true;
    });
  
    if (!filteredForms.length) return <p className="text-gray-500">No forms found for selected filter.</p>;
  
    return (
      <div className="grid gap-4">
        {filteredForms.map((form) => (
          <div
            key={form.id}
            className="border rounded-xl p-4 shadow hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{form.name}</h2>
                <p className="text-sm text-gray-500">{form.description}</p>
                <p className="mt-1 text-sm">
                  <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                    form.categories?.length
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {form.categories?.length
                      ? `${form.categories.length} Categories Assigned`
                      : 'No Categories Assigned'}
                  </span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onAssignClick(form.id)}
                  className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700"
                >
                  Assign Categories
                </button>
                <button
                  onClick={() => onAssignQuestionsClick(form.id)}
                  className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                >
                  Assign Questions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // export function EnhancedFormList({ forms, activeTab, onAssignClick }) {
  //   const filteredForms = forms.filter((form) => {
  //     const hasCategories = form.categories && form.categories.length > 0;
  //     if (activeTab === 'assigned') return hasCategories;
  //     if (activeTab === 'unassigned') return !hasCategories;
  //     return true;
  //   });

  //   if (!filteredForms.length) return <p className="text-gray-500">No forms found for selected filter.</p>;

  //   return (
  //     <div className="grid gap-4">
  //       {filteredForms.map((form) => (
  //         <div
  //           key={form.id}
  //           className="border rounded-xl p-4 shadow hover:shadow-md transition-all"
  //         >
  //           <div className="flex justify-between items-center">
  //             <div>
  //               <h2 className="text-lg font-semibold">{form.name}</h2>
  //               <p className="text-sm text-gray-500">{form.description}</p>
  //               <p className="mt-1 text-sm">
  //                 <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
  //                   form.categories?.length
  //                     ? 'bg-green-100 text-green-700'
  //                     : 'bg-yellow-100 text-yellow-700'
  //                 }`}>
  //                   {form.categories?.length
  //                     ? `${form.categories.length} Categories Assigned`
  //                     : 'No Categories Assigned'}
  //                 </span>
  //               </p>
  //             </div>
  //             <button
  //               onClick={() => onAssignClick(form.id)}
  //               className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-blue-700"
  //             >
  //               Assign Categories
  //             </button>
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }