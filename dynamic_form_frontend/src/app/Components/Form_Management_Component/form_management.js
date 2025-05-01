'use client';

import React, { useEffect, useState } from 'react';
import backendApi from '../../../../utils/backendApi';
import { useAuth } from '../../../../AuthContext';
import FormList from './form_list';
import CreateButton from './create_button';
import CategoryList from './category_list';


export default function FormManagement() {
  const [forms, setForms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

  const fetchForms = async () => {
    try {
      const res = await backendApi.get('/application_management/get_all_forms/');
      // const res = await backendApi.get('/question_management/get_questions/');

      setForms(res.data.forms || []);

    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await backendApi.get('/application_management/get_all_categories/');
      // setCategories(res.data.data || []);

      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchForms(), fetchCategories()]);
      setLoading(false);
    };

    if (isLoading) {
      console.log('AuthContext still loading...');
      return;
    }

    if (!authToken || !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

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
            <CreateButton />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <FormList forms={forms} />
            <CategoryList categories={categories} />
          </div>
        </>
      )}
    </div>
  );
}
