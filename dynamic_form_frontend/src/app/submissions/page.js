"use client";

import AppLayout from "../../components/dashboard/Applayout"; 
import SubmissionTable from "@/components/submissions/SubmissionTable";

export default function SubmissionsPage() {
  // TEMPORARY
  // later this can come from params or selected form
  const formId = 1;

  return (
    <AppLayout>
      <SubmissionTable formId={formId} />
    </AppLayout>
  );
}