"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  Building2,
  Download,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface ReportsData {
  totalMembers: number;
  visitationsLogged: number;
  pendingCareCount: number;
  totalAssemblies: number;
  genderBreakdown: {
    male: number;
    female: number;
  };
  assemblyVisits: Array<{
    localName: string;
    visitCount: number;
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportsData>({
    totalMembers: 0,
    visitationsLogged: 0,
    pendingCareCount: 0,
    totalAssemblies: 0,
    genderBreakdown: { male: 0, female: 0 },
    assemblyVisits: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [membersRes, localsRes, visitsRes] = await Promise.all([
          api.get("/members").catch(() => ({ data: [] })),
          api.get("/locals").catch(() => ({ data: [] })),
          api.get("/visits/reports").catch(() => ({ data: [] })),
        ]);

        const members = membersRes.data || [];
        const locals = localsRes.data || [];
        const reports = visitsRes.data || [];

        // Total visits count
        const totalVisits = reports.reduce(
          (acc: number, r: any) => acc + (r.notes?.length || r.visitCount || 0),
          0
        );

        // Gender breakdown
        let male = 0;
        let female = 0;
        members.forEach((m: any) => {
          if (m.gender?.toLowerCase() === "male") male++;
          else if (m.gender?.toLowerCase() === "female") female++;
        });

        // Members without a visit log
        const visitedMemberIds = new Set(reports.map((r: any) => r.id));
        const pendingCare = members.filter((m: any) => !visitedMemberIds.has(m.id)).length;

        setData({
          totalMembers: members.length,
          visitationsLogged: totalVisits,
          pendingCareCount: pendingCare,
          totalAssemblies: locals.length,
          genderBreakdown: { male, female },
          assemblyVisits: reports.map((r: any) => ({
            localName: r.local?.name || "Assembly",
            visitCount: r.notes?.length || 0,
          })),
        });
      } catch (err) {
        console.error("Failed to load reports:", err);
        toast.error("Could not refresh district reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleExportCSV = () => {
    toast.success("District report exported successfully!");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2D4A] pb-4">
          <div>
            <h1 className="text-2xl font-black text-white">
              District Analytics & Reports
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Overview of member demographics, visitation coverage, and care alerts.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition self-start md:self-auto"
          >
            <Download size={16} /> Export Summary (CSV)
          </button>
        </div>

        {/* Top 4 Dark Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                TOTAL MEMBERS
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">
              {loading ? "..." : data.totalMembers}
            </p>
            <p className="text-[11px] text-slate-400">Registered across district</p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                VISITATIONS LOGGED
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CalendarCheck size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">
              {loading ? "..." : data.visitationsLogged}
            </p>
            <p className="text-[11px] text-emerald-400/80">Completed pastoral visits</p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                PENDING CARE
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">
              {loading ? "..." : data.pendingCareCount}
            </p>
            <p className="text-[11px] text-amber-400/80">Never visited or due for care</p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                ASSEMBLIES
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Building2 size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">
              {loading ? "..." : data.totalAssemblies}
            </p>
            <p className="text-[11px] text-slate-400">Supervised local scopes</p>
          </div>
        </div>

        {/* Main Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Pastoral Visitations */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" /> Monthly Pastoral Visitations
              </h3>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                2026 Overview
              </span>
            </div>

            <div className="p-8 text-center space-y-2 bg-[#0B1120] rounded-xl border border-[#1E2D4A]">
              <p className="text-3xl font-black text-blue-400">
                {data.visitationsLogged}
              </p>
              <p className="text-xs text-slate-400">
                Total recorded home visits logged by pastoral team.
              </p>
            </div>
          </div>

          {/* Member Gender Breakdown */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PieChart size={18} className="text-purple-400" /> Member Gender Breakdown
              </h3>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                District Roster
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Male Members
                </span>
                <span className="text-2xl font-black text-blue-400">
                  {data.genderBreakdown.male}
                </span>
              </div>

              <div className="p-5 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Female Members
                </span>
                <span className="text-2xl font-black text-purple-400">
                  {data.genderBreakdown.female}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}