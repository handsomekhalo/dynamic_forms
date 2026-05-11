import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

const SUBMISSIONS = [
  { name: "Thabo Mokoena", form: "Z83 Application", category: "Government", status: "Submitted", date: "2026-04-24" },
  { name: "Naledi Khumalo", form: "Background Check", category: "Compliance", status: "Under Review", date: "2026-04-23" },
  { name: "Johan van Wyk", form: "Z83 Application", category: "Government", status: "Approved", date: "2026-04-22" },
  { name: "Sipho Ndlovu", form: "Skills Assessment", category: "HR", status: "Rejected", date: "2026-04-21" },
  { name: "Ayanda Dlamini", form: "Z83 Application", category: "Government", status: "Under Review", date: "2026-04-20" },
  { name: "Pieter Botha", form: "Vetting Form", category: "Security", status: "Submitted", date: "2026-04-19" },
];

export default function RecentSubmissionsTable() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Submissions</CardTitle>
          <button className="text-xs text-primary font-medium hover:underline">
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Applicant Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Form Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date Submitted
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUBMISSIONS.map((row, i) => (
                <TableRow
                  key={i}
                  className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}
                >
                  <TableCell className="text-sm font-medium">{row.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.form}</TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{row.category}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${STATUS_STYLES[row.status]}`}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}