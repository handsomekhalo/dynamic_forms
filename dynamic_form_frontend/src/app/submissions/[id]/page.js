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

  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);

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
      
      console.log("Fetched submission detail:", res.data);
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
        `/form_portal_management/update_submission_status/${id}/`,
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

        

        {/* <div>
          <p className="text-sm text-gray-500">
            Response
          </p>

          {response.file_upload ? (
            <button
              onClick={() => {
                setIsDocumentLoading(true);

                setSelectedFileUrl(
                  encodeURI(
                    response.file_upload.startsWith('http')
            ? response.file_upload
            : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/${response.file_upload}`)
                );
              }}
              className="text-blue-600 underline text-sm"
            >
              View Uploaded File
            </button>
          ) : (
            <p className="text-gray-700">
              {response.response_text ||
                response.response_number ||
                response.response_date ||
                (response.response_boolean !== null
                  ? response.response_boolean
                    ? "Yes"
                    : "No"
                  : "-")}
            </p>
          )}
        </div> */}

        <div>
  <p className="text-sm text-gray-500">Response</p>
  {response.file_upload ? (
    // --- ADDED '<a' HERE ---
    <a
      href={response.file_upload}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline text-sm"
    >
      View Document
    </a>
  ) : (
    <p className="text-gray-700">
      {response.response_text ||
        response.response_number ||
        response.response_date ||
        (response.response_boolean !== null
          ? response.response_boolean
            ? "Yes"
            : "No"
          : "-")}
    </p>
  )}
</div>

        

      </CardContent>
    </Card>
  ))}
</div>

{selectedFileUrl && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl w-[95%] max-w-5xl p-6 relative">

      <button
        onClick={() => setSelectedFileUrl(null)}
        className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
      >
        ✕
      </button>

      <div className="text-center font-bold text-lg mb-4">
        Document Preview
      </div>

      {isDocumentLoading && (
        <div className="text-center text-blue-500 mb-4">
          Loading document...
        </div>
      )}

      <iframe
        src={selectedFileUrl}
        title="Document Preview"
        className="w-full h-[70vh] border rounded"
        onLoad={() => setIsDocumentLoading(false)}
      />

      <div className="text-center mt-4">
        <a
          href={selectedFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          Open in new tab
        </a>
      </div>

    </div>
  </div>
)}
{/* 
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
        </div> */}
      </div>
      
    </AppLayout>
  );
}