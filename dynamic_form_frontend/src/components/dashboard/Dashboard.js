"use client";

import { useAuth } from "../../../AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";

import Navbar from "@/components/dashboard/Navheader";
import Sidebar from "@/components/dashboard/Sidebar";
import AppLayout from "./Applayout";

import {
  FileText,
  HelpCircle,
  Users,
  Send,
  Clock,
  Inbox,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import StatCard from "@/components/dashboard/StatCard";
import FormsOverviewTable from "./FormsOverViewTable";
import SubmissionsChart from "@/components/dashboard/SubmissionCharts";

const STATS = [
  {
    label: "Total Forms",
    value: "12",
    icon: FileText,
    hint: "3 active forms",
  },
  {
    label: "Pending Reviews",
    value: "8",
    icon: Clock,
    hint: "Awaiting approval",
  },
  {
    label: "Total Users",
    value: "348",
    icon: Users,
    hint: "+23 this week",
  },
  {
    label: "Recent Submissions",
    value: "24",
    icon: Inbox,
    hint: "Last 7 days",
  },
];

const RECENT_SUBMISSIONS = [
  {
    name: "Thabo Nkosi",
    form: "FSP Onboarding",
    date: "2026-05-07",
    status: "Pending",
  },
  {
    name: "Lerato Khumalo",
    form: "NPO Disclosure",
    date: "2026-05-07",
    status: "Under Review",
  },
  {
    name: "Pieter van der Merwe",
    form: "FSP Onboarding",
    date: "2026-05-06",
    status: "Approved",
  },
  {
    name: "Aisha Patel",
    form: "HR Compliance",
    date: "2026-05-06",
    status: "Pending",
  },
];

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(
        "/Components/System_Management_Component/login"
      );
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Checking authentication...
      </p>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
  <AppLayout>

    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Overview of your forms and submissions.
          </p>
        </div>

        <Button asChild>
          <Link href="/invite-user">
            <Send className="w-4 h-4 mr-2" />
            Send Invite
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
          />
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SubmissionsChart />
        <FormsOverviewTable />
      </div>

      {/* Recent Submissions */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Submissions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">
                  Applicant
                </th>

                <th className="px-6 py-3 font-medium">
                  Form
                </th>

                <th className="px-6 py-3 font-medium">
                  Date
                </th>

                <th className="px-6 py-3 font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {RECENT_SUBMISSIONS.map((submission) => (
                <tr
                  key={submission.name}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {submission.name}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {submission.form}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {submission.date}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={submission.status} />
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>

  </AppLayout>
);

  // return (
  //   <div className="min-h-screen bg-slate-50">
  //     {/* Sidebar */}
  //     <Sidebar />

  //     {/* Navbar */}
  //     <Navbar />

  //     {/* Main Content */}
  //     <main className="lg:ml-64 pt-20 p-6">
  //       <div className="max-w-7xl mx-auto space-y-8">

  //         {/* Header */}
  //         <div className="flex flex-wrap items-center justify-between gap-4">
  //           <div>
  //             <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
  //               Dashboard
  //             </h1>

  //             <p className="text-sm text-slate-500 mt-1">
  //               Overview of your forms and submissions.
  //             </p>
  //           </div>

  //                 <Button asChild>
  //         <Link href="/invite-user">
  //           <Send className="w-4 h-4 mr-2" />
  //           Send Invite
  //         </Link>
  //       </Button>
  //         </div>

  //         {/* Stats */}
  //         <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  //           {STATS.map((stat) => (
  //             <StatCard
  //               key={stat.label}
  //               {...stat}
  //             />
  //           ))}
  //         </div>

  //         {/* Analytics */}
  //         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  //           <SubmissionsChart />
  //           <FormsOverviewTable />
  //         </div>

  //         {/* Recent Submissions */}
  //         <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            
  //           {/* Table Header */}
  //           <div className="px-6 py-5 border-b border-slate-100">
  //             <h2 className="text-base font-semibold text-slate-900">
  //               Recent Submissions
  //             </h2>
  //           </div>

  //           {/* Table */}
  //           <div className="overflow-x-auto">
  //             <table className="w-full text-sm">
  //               <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
  //                 <tr>
  //                   <th className="px-6 py-3 font-medium">
  //                     Applicant
  //                   </th>

  //                   <th className="px-6 py-3 font-medium">
  //                     Form
  //                   </th>

  //                   <th className="px-6 py-3 font-medium">
  //                     Date
  //                   </th>

  //                   <th className="px-6 py-3 font-medium">
  //                     Status
  //                   </th>
  //                 </tr>
  //               </thead>

  //               <tbody className="divide-y divide-slate-100">
  //                 {RECENT_SUBMISSIONS.map((submission) => (
  //                   <tr
  //                     key={submission.name}
  //                     className="hover:bg-slate-50 transition-colors"
  //                   >
  //                     <td className="px-6 py-4 font-medium text-slate-900">
  //                       {submission.name}
  //                     </td>

  //                     <td className="px-6 py-4 text-slate-500">
  //                       {submission.form}
  //                     </td>

  //                     <td className="px-6 py-4 text-slate-500">
  //                       {submission.date}
  //                     </td>

  //                     <td className="px-6 py-4">
  //                       <StatusBadge
  //                         status={submission.status}
  //                       />
  //                     </td>
  //                   </tr>
  //                 ))}
  //               </tbody>
  //             </table>
  //           </div>
  //         </div>

  //       </div>
  //     </main>
  //   </div>
  // );
}

function StatusBadge({ status }) {
  const styles = {
    Pending:
      "bg-amber-50 text-amber-700 ring-amber-200",

    "Under Review":
      "bg-blue-50 text-blue-700 ring-blue-200",

    Approved:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",

    Rejected:
      "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span
      className={`
        inline-flex items-center
        rounded-full
        px-2.5 py-1
        text-xs font-medium
        ring-1 ring-inset
        ${
          styles[status] ||
          "bg-slate-100 text-slate-700 ring-slate-200"
        }
      `}
    >
      {status}
    </span>
  );
}


// 'use client';

// import { useAuth } from '../../../AuthContext';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Navbar from '@/components/dashboard/Navheader';
// import Sidebar from '@/components/dashboard/Sidebar';


// export default function Dashboard() {
//   const { isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       router.push('/Components/System_Management_Component/login');
//     }
//   }, [isAuthenticated, isLoading, router]);

//   if (isLoading) {
//     return <p className="text-center mt-10 text-gray-600">Checking authentication...</p>;
//   }

//   if (!isAuthenticated) {
//     return null; // Or show a loading spinner
//   }


//   return (
//         <div>
//           <Navbar />
//           <Sidebar/>
          
//           {/* Your dashboard content here */}
//         </div>
//   )
// }

