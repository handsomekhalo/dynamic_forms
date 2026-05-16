'use client';

import { useEffect, useState } from "react";
import { useAuth } from "../../../AuthContext";
import backendApi from "../../../utils/backendApi";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function FormsOverviewTable() {
  const { authToken } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;
    const fetchForms = async () => {
      try {
        const res = await backendApi.get(
          '/application_management/get_all_forms/',
          { headers: { Authorization: `Token ${authToken}` } }
        );
        const data = res.data;
        const formsArray = Array.isArray(data)
          ? data
          : Array.isArray(data.forms)
          ? data.forms
          : [];
        setForms(formsArray);
      } catch (err) {
        console.error('Forms overview fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [authToken]);

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Forms Overview</CardTitle>
          <Link href="/forms" className="text-xs text-primary font-medium hover:underline">
            Manage Forms
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">Loading forms...</div>
          ) : forms.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">No forms found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Form Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Questions</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form, i) => {
                  const categoryCount = form.categories?.length || 0;
                  const questionCount = form.categories?.reduce(
                    (total, cat) => total + (cat.questions?.length || 0), 0
                  ) || 0;

                  return (
                    <TableRow key={form.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                      <TableCell className="text-sm font-medium">
                        <Link href={`/forms/${form.id}`} className="hover:text-blue-600 hover:underline">
                          {form.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {categoryCount} assigned
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {questionCount} questions
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            form.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {form.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// import React from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";

// const FORMS = [
//   { name: "Z83 Application", categories: 3, questions: 24, status: "Active" },
//   { name: "Background Check", categories: 2, questions: 18, status: "Active" },
//   { name: "Skills Assessment", categories: 4, questions: 32, status: "Inactive" },
//   { name: "Vetting Form", categories: 2, questions: 15, status: "Active" },
//   { name: "Reference Check", categories: 1, questions: 10, status: "Inactive" },
// ];

// export default function FormsOverviewTable() {
//   return (
//     <Card className="border border-border shadow-sm">
//       <CardHeader className="pb-3">
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-base font-semibold">Forms Overview</CardTitle>
//           <button className="text-xs text-primary font-medium hover:underline">
//             Manage Forms
//           </button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/50">
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Form Name
//                 </TableHead>
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Categories
//                 </TableHead>
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Questions
//                 </TableHead>
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Status
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {FORMS.map((form, i) => (
//                 <TableRow
//                   key={i}
//                   className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}
//                 >
//                   <TableCell className="text-sm font-medium">{form.name}</TableCell>
//                   <TableCell className="text-sm text-muted-foreground">
//                     {form.categories} assigned
//                   </TableCell>
//                   <TableCell className="text-sm text-muted-foreground">
//                     {form.questions} questions
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant="outline"
//                       className={`text-xs font-medium ${
//                         form.status === "Active"
//                           ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//                           : "bg-slate-50 text-slate-500 border-slate-200"
//                       }`}
//                     >
//                       {form.status}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// import React from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";

// const FORMS = [
//   { name: "Z83 Application", categories: 3, questions: 24, status: "Active" },
//   { name: "Background Check", categories: 2, questions: 18, status: "Active" },
//   { name: "Skills Assessment", categories: 4, questions: 32, status: "Inactive" },
//   { name: "Vetting Form", categories: 2, questions: 15, status: "Active" },
//   { name: "Reference Check", categories: 1, questions: 10, status: "Inactive" },
// ];

// export default function FormsOverviewTable() {
//   return (
//     <Card className="border border-border shadow-sm">
//       <CardHeader className="pb-3">
//         <div className="flex items-center justify-between">
//           <CardTitle className="text-base font-semibold">Forms Overview</CardTitle>
//           <button className="text-xs text-primary font-medium hover:underline">
//             Manage Forms
//           </button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/50">
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Form Name
//                 </TableHead>
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Categories
//                 </TableHead>
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Questions
//                 </TableHead>
//                 <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
//                   Status
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {FORMS.map((form, i) => (
//                 <TableRow
//                   key={i}
//                   className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}
//                 >
//                   <TableCell className="text-sm font-medium">{form.name}</TableCell>
//                   <TableCell className="text-sm text-muted-foreground">
//                     {form.categories} assigned
//                   </TableCell>
//                   <TableCell className="text-sm text-muted-foreground">
//                     {form.questions} questions
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant="outline"
//                       className={`text-xs font-medium ${
//                         form.status === "Active"
//                           ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//                           : "bg-slate-50 text-slate-500 border-slate-200"
//                       }`}
//                     >
//                       {form.status}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }