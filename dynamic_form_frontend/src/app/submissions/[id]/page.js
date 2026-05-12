"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

import backendApi from "../../../../utils/backendApi";
import { useAuth } from "../../../../AuthContext";
import AppLayout from "../../../components/dashboard/Applayout";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params?.id;

  const auth = useAuth() || {};
  const { authToken } = auth;

  const [submission, setSubmission] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchSubmission();
    }
  }, [id]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);

      const res = await backendApi.get(
        `/form_portal_management/get_submission_detail/${id}/`,
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      setSubmission(res.data.submission);
    } catch (error) {
      console.error("Failed to fetch submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await backendApi.patch(
        `/form_management/update_submission_status/${id}/`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        }
      );

      fetchSubmission();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div>Loading submission...</div>
      </AppLayout>
    );
  }

  if (!submission) {
    return (
      <AppLayout>
        <div>Submission not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Submission Review
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Review applicant responses and documents.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm text-gray-500">
                Applicant
              </p>

              <p className="font-medium">
                {submission.applicant_name}
              </p>

              <p className="text-sm text-gray-500">
                {submission.applicant_email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Form
              </p>

              <p className="font-medium">
                {submission.form_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="font-medium capitalize">
                {submission.status?.replace("_", " ")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={() => updateStatus("approved")}
              >
                Approve
              </Button>

              <Button
                variant="destructive"
                onClick={() => updateStatus("rejected")}
              >
                Reject
              </Button>

              <Button
                variant="outline"
                onClick={() => updateStatus("under_review")}
              >
                Under Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Responses
          </h2>

          {submission.responses?.map((response) => (
            <Card key={response.id}>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Category
                  </p>

                  <p className="font-medium">
                    {response.category_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Question
                  </p>

                  <p className="font-medium">
                    {response.question_text}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Response
                  </p>

                  {response.file_upload ? (
                    <a
                      href={response.file_upload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Uploaded File
                    </a>
                  ) : (
                    <p className="text-gray-700">
                      {response.response_text || "-"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}