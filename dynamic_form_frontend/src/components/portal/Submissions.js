import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "./dashboard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/submissions/")({
  head: () => ({ meta: [{ title: "Submissions — Z83 Dynamic Tool" }] }),
  component: SubmissionsPage,
});

const submissions = [
  { id: "s1", name: "Thabo Nkosi", form: "FSP Onboarding", date: "2026-05-07", status: "Pending" },
  { id: "s2", name: "Lerato Khumalo", form: "NPO Disclosure", date: "2026-05-07", status: "Under Review" },
  { id: "s3", name: "Pieter van der Merwe", form: "FSP Onboarding", date: "2026-05-06", status: "Approved" },
  { id: "s4", name: "Aisha Patel", form: "HR Compliance", date: "2026-05-06", status: "Pending" },
  { id: "s5", name: "Sipho Dlamini", form: "FSP Onboarding", date: "2026-05-05", status: "Rejected" },
  { id: "s6", name: "Anna Botha", form: "NPO Disclosure", date: "2026-05-04", status: "Approved" },
];

function SubmissionsPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
        <p className="text-sm text-muted-foreground">All form submissions across your organization.</p>
      </div>

      <div className="mb-4 flex max-w-sm items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search applicants..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Applicant Name</th>
                  <th className="px-6 py-3 font-medium">Form Name</th>
                  <th className="px-6 py-3 font-medium">Date Submitted</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4 font-medium">{s.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.form}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.date}</td>
                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/submissions/$id" params={{ id: s.id }}>Review</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
