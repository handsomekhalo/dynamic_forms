'use client';

import React, { useEffect, useState } from 'react';
import backendApi from '../../../../utils/backendApi';
// import Sidebar from '../dashboard/SideBarComponent/sidebar';
import { useAuth } from '../../../../AuthContext';

export default function FormManagement() {
  const [forms, setForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();





  const fetchForms = async () => {
    try {
      const res = await backendApi.get('/question_management/get_questions/');
      setForms(res.data.forms || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions.');
    }
  };

  // const fetchCategories = async () => {
  //   try {
  //     const r     es = await backendApi.get('/form_management/get_categories/');
  //     setCategories(res.data.categories || []);
  //   } catch (err) {
  //     console.error('Error fetching categories:', err);
  //     setError('Failed to load categories.');
  //   }
  // };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchForms(), 
        // fetchCategories()

      ]);
      setLoading(false);
    };
  
    if (isLoading) {
      console.log('AuthContext still loading...');
      return;
    }
  
    if (!authToken || !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      console.log('Auth state:', { authToken, isAuthenticated });
      navigate('/login');
      return;
    }
  
    console.log('Starting data fetch with auth token:', authToken);
    
    // Only fetch data if authenticated
    fetchData();
  }, [authToken, isAuthenticated, navigate, isLoading]);
  
  

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h1 className="text-2xl font-bold mb-4">Form Management</h1>
      <p className="text-gray-600 mb-6">
        Create and manage forms and categories here.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              Create New Form
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
              Create New Category
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Forms</h2>
              {forms.length === 0 ? (
                <p>No forms available.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {forms.map((form) => (
                    <li key={form.id}>{form.name}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Categories</h2>
              {categories.length === 0 ? (
                <p>No categories available.</p>
              ) : (
                <ul className="list-disc pl-5">
                  {categories.map((category) => (
                    <li key={category.id}>{category.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
