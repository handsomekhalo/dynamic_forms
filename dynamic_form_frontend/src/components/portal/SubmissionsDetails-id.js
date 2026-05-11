import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, FileText, Download } from "lucide-react";

export const Route = createFileRoute("/submissions/$id")({
  head: () => ({ meta: [{ title: "Submission Review — Z83 Dynamic Tool" }] }),
  component: SubmissionDetail,
});

const answers = [
  { q: "Full legal name", a: "Thabo Joseph Nkosi" },
  { q: "South African ID number", a: "8503125012086" },
  { q: "Annual gross income", a: "R 480,000" },
  { q: "Source of funds", a: "Salary from full-time employment as a financial advisor at ABC Holdings (Pty) Ltd." },
  { q: "Have you been declared insolvent?", a: "No" },
];

const documents = [
  { name: "ID_Document.pdf", size: "1.2 MB" },
  { name: "Proof_of_Address.pdf", size: "780 KB" },
  { name: "Bank_Statement_April.pdf", size: "2.1 MB" },
];

function SubmissionDetail() {
  const { id } = Route.useParams();
  return (
    <AppLayout>
      <Link to="/submissions" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to submissions
      </Link>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-start justify-between gap-6 p-6">
          <div>
            <h1 className="text-xl font-semibold">Thabo Joseph Nkosi</h1>
            <p className="text-sm text-muted-foreground">thabo.nkosi@example.co.za · +27 82 123 4567</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Form: <span className="font-medium text-foreground">FSP Onboarding</span> · Submission #{id}
            </p>
            <p className="text-sm text-muted-foreground">Submitted: 2026-05-07 14:32</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">Status</label>
            <Select defaultValue="pending">
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">Save Status</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Answers</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            {answers.map((a, i) => (
              <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{a.q}</p>
                <p className="mt-1 text-sm">{a.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Uploaded Documents</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {documents.map((d) => (
              <a
                key={d.name}
                href="#"
                className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.size}</p>
                  </div>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
