'use client';

import { useEffect, useState } from "react";
import { useAuth } from "../../../AuthContext";
import backendApi from "../../../utils/backendApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{payload[0].value} submissions</p>
      </div>
    );
  }
  return null;
};

export default function SubmissionsChart() {
  const { authToken } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;
    const fetch = async () => {
      try {
        const res = await backendApi.get(
          '/form_portal_management/get_dashboard_stats/',
          { headers: { Authorization: `Token ${authToken}` } }
        );
        if (res.data.status === 'success') {
          // Build chart data from recent submissions grouped by form
          const submissions = res.data.recent_submissions || [];
          const grouped = {};
          submissions.forEach(s => {
            grouped[s.form] = (grouped[s.form] || 0) + 1;
          });
          setChartData(
            Object.entries(grouped).map(([form, submissions]) => ({ form, submissions }))
          );
        }
      } catch (err) {
        console.error('Chart fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [authToken]);

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Submissions per Form</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">
              Loading chart...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-slate-400">
              No submission data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
                <XAxis
                  dataKey="form"
                  tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 14% 96%)" }} />
                <Bar dataKey="submissions" fill="hsl(234 89% 64%)" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// import React from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const CHART_DATA = [
//   { form: "Z83 Application", submissions: 142 },
//   { form: "Background Check", submissions: 87 },
//   { form: "Skills Assessment", submissions: 64 },
//   { form: "Vetting Form", submissions: 51 },
//   { form: "Reference Check", submissions: 29 },
// ];

// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
//         <p className="text-xs font-medium text-foreground">{label}</p>
//         <p className="text-xs text-muted-foreground">
//           {payload[0].value} submissions
//         </p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function SubmissionsChart() {
//   return (
//     <Card className="border border-border shadow-sm">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-base font-semibold">
//           Submissions per Form
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               data={CHART_DATA}
//               margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
//             >
//               <CartesianGrid
//                 strokeDasharray="3 3"
//                 stroke="hsl(220 13% 91%)"
//                 vertical={false}
//               />
//               <XAxis
//                 dataKey="form"
//                 tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
//                 tickLine={false}
//                 axisLine={false}
//                 interval={0}
//                 angle={-20}
//                 textAnchor="end"
//                 height={60}
//               />
//               <YAxis
//                 tick={{ fontSize: 11, fill: "hsl(220 9% 46%)" }}
//                 tickLine={false}
//                 axisLine={false}
//               />
//               <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(220 14% 96%)" }} />
//               <Bar
//                 dataKey="submissions"
//                 fill="hsl(234 89% 64%)"
//                 radius={[4, 4, 0, 0]}
//                 maxBarSize={48}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }