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

const FORMS = [
  { name: "Z83 Application", categories: 3, questions: 24, status: "Active" },
  { name: "Background Check", categories: 2, questions: 18, status: "Active" },
  { name: "Skills Assessment", categories: 4, questions: 32, status: "Inactive" },
  { name: "Vetting Form", categories: 2, questions: 15, status: "Active" },
  { name: "Reference Check", categories: 1, questions: 10, status: "Inactive" },
];

export default function FormsOverviewTable() {
  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Forms Overview</CardTitle>
          <button className="text-xs text-primary font-medium hover:underline">
            Manage Forms
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Form Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Questions
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FORMS.map((form, i) => (
                <TableRow
                  key={i}
                  className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}
                >
                  <TableCell className="text-sm font-medium">{form.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {form.categories} assigned
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {form.questions} questions
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${
                        form.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      {form.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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