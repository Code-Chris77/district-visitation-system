"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReportService, ReportSummary } from "@/features/reports/services/report.service";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, CalendarCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#ec4899", "#f59e0b", "#10b981"];

export default function ReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const summary = await ReportService.getSummary();
        setData(summary);
      } catch (err) {
        console.error("Failed to load reports:", err);
        toast.error("Failed to load reports summary.");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const exportToCSV = () => {
    if (!data) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Metric,Value",
        `Total Members,${data.totalMembers}`,
        `Total Local Assemblies,${data.totalLocals}`,
        `Total Visitations Logged,${data.totalVisitations}`,
        `Completed Visitations,${data.completedVisitations}`,
        `Pending Visitations,${data.pendingVisitations}`
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `District_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report CSV exported successfully!");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-gray-500">Generating analytics summary...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">District Analytics & Reports</h1>
            <p className="text-sm text-gray-500">
              Overview of member demographics, visitation coverage, and care alerts.
            </p>
          </div>
          <Button onClick={exportToCSV} className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Download size={16} /> Export Summary (CSV)
          </Button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium uppercase tracking-wider">Total Members</span>
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data?.totalMembers}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium uppercase tracking-wider">Visitations Logged</span>
              <CalendarCheck size={18} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data?.totalVisitations}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium uppercase tracking-wider">Pending Care</span>
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-600">{data?.pendingVisitations}</p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-xs font-medium uppercase tracking-wider">Assemblies</span>
              <FileText size={18} className="text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{data?.totalLocals}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Visitation Trends */}
          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Monthly Pastoral Visitations</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.visitationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Gender Ratio */}
          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">Member Gender Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.genderDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="gender"
                    label
                  >
                    {data?.genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pastoral Care Alert Section */}
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <AlertTriangle className="text-amber-500" size={20} />
            <h3 className="font-bold text-gray-900">Unvisited Members / Care Attention List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">Member Name</th>
                  <th className="p-3">Local Assembly</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Status Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.unvisitedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      All members have received recent pastoral visits!
                    </td>
                  </tr>
                ) : (
                  data?.unvisitedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-semibold text-gray-900">
                        {m.firstName} {m.lastName}
                      </td>
                      <td className="p-3 text-gray-600">{m.localName}</td>
                      <td className="p-3 text-gray-600">{m.phone || "—"}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          Requires Visit
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}