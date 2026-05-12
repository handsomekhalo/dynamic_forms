"use client";

import React, { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import backendApi from "../../../utils/backendApi";
import { useAuth } from "../../../AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search } from "lucide-react";

const StatusBadge = ({ status }) => {
  const styles = {
    submitted: "bg-blue-100 text-blue-800",
    under_review: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    returned: "bg-orange-100 text-orange-800",
    draft: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        styles[status] || styles.draft
      }`}
    >
      {status?.replace("_", " ")}
    </span>
  );
};

export default function SubmissionTable({ formId }) {
  const auth = useAuth() || {};
  const { authToken } = auth;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (formId) {
      fetchSubmissions();
    }
  }, [formId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const res = await backendApi.get(
        `form_portal_management/get_all_submissions/${formId}/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      setSubmissions(res.data.submissions || []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const value = search.toLowerCase();

      return (
        submission.applicant_name
          ?.toLowerCase()
          .includes(value) ||
        submission.applicant_email
          ?.toLowerCase()
          .includes(value) ||
        submission.form_name
          ?.toLowerCase()
          .includes(value)
      );
    });
  }, [submissions, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Form Submissions
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Review and manage submitted forms.
        </p>
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            placeholder="Search applicants..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Form</th>
                  <th className="px-6 py-4">
                    Date Submitted
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Loading submissions...
                    </td>
                  </tr>
                ) : filteredSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">
                            {submission.applicant_name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {submission.applicant_email}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {submission.form_name}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {new Date(
                          submission.submitted_at
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={submission.status}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link
                            href={`/submissions/${submission.id}`}
                          >
                            Review
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}