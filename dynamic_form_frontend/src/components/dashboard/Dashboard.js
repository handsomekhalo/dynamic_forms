'use client';

import { useAuth } from "../../../AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import backendApi from "../../../utils/backendApi";
import AppLayout from "./Applayout";
import StatCard from "@/components/dashboard/StatCard";
import SubmissionsChart from "@/components/dashboard/SubmissionCharts";
import FormsOverviewTable from "./FormsOverViewTable";
import { FileText, Users, Clock, Inbox, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace('_', ' ') || 'Unknown'}
    </span>
  );
}

export default function Dashboard() {
  const { isAuthenticated, isLoading, authToken } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!authToken) return;
    const fetchDashboard = async () => {
      try {
        setLoadingData(true);
        const res = await backendApi.get(
          '/form_portal_management/get_dashboard_stats/',
          { headers: { Authorization: `Token ${authToken}` } }
        );
        if (res.data.status === 'success') {
          setStats(res.data.stats);
          setRecentSubmissions(res.data.recent_submissions || []);
        }
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchDashboard();
  }, [authToken]);

  if (isLoading) return <p className="text-center mt-10 text-gray-600">Checking authentication...</p>;
  if (!isAuthenticated) return null;

  const STATS = [
    { label: 'Total Forms', value: loadingData ? '...' : String(stats?.total_forms ?? 0), icon: FileText, hint: 'Forms in your organisation' },
    { label: 'Pending Reviews', value: loadingData ? '...' : String(stats?.pending_reviews ?? 0), icon: Clock, hint: 'Awaiting approval' },
    { label: 'Total Users', value: loadingData ? '...' : String(stats?.total_users ?? 0), icon: Users, hint: 'In your organisation' },
    { label: 'Recent Submissions', value: loadingData ? '...' : String(stats?.recent_submissions_count ?? 0), icon: Inbox, hint: 'Last 7 days' },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of your forms and submissions.</p>
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
            <StatCard key={stat.label} {...stat} />
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
            <h2 className="text-base font-semibold text-slate-900">Recent Submissions</h2>
          </div>

          <div className="overflow-x-auto">
            {loadingData ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">Loading submissions...</div>
            ) : recentSubmissions.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">No submissions yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Applicant</th>
                    <th className="px-6 py-3 font-medium">Form</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSubmissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{s.applicant_name}</td>
                      <td className="px-6 py-4 text-slate-500">{s.form}</td>
                      <td className="px-6 py-4 text-slate-500">{s.date}</td>
                      <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/submissions/${s.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
} 