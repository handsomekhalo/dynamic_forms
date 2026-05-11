"use client";

import React from 'react';
import QuestionManagement from '@/components/questions/QuestionManagement';
// export default function Page() { return <QuestionManagement />; }
import AppLayout from '../../components/dashboard/Applayout'
import { Button } from "@/components/ui/button";
import QuestionBankTable from '../../components/questions/QuestionBankTable';
import { useAuth } from '../../../AuthContext';

import { useEffect, useState } from 'react';
import backendApi from '../../../utils/backendApi';

export default function QuestionsPage() {
  const { authToken, isLoading } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuestions = async () => {
    if (!authToken || isLoading) return;

    try {
      setLoading(true);

      const res = await backendApi.get(
        `/question_management/get_questions/?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      const data = res.data;

      setQuestions(data.results || data.data?.questions || []);
      setTotalPages(data.total_pages || 1);

    } catch (err) {
      console.error("Failed loading questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, authToken]);

  return (
    <AppLayout>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Question Bank</h1>

        <Button>Create Question</Button>
      </div>

      <QuestionBankTable
        questions={questions}
        loading={loading}
        onRefresh={fetchQuestions}
      />

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        <Button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </Button>

        <span className="px-3 py-2 text-sm">
          Page {page} / {totalPages}
        </span>

        <Button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </AppLayout>
  );
}