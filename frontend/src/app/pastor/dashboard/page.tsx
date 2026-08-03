"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import TodaysRouteCard from "@/features/visitations/components/TodaysRouteCard";
import {
  Users,
  MapPin,
  ClipboardList,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/axios";

interface PastorStats {
  totalMembers: number;
  totalAssemblies: number;
  recentVisits: number;
}

export default function PastorDashboard() {
  const { fullName } = useCurrentUser();
  const [stats, setStats] = useState<PastorStats>({
    totalMembers: 0,
    totalAssemblies: 0,
    recentVisits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPastorStats() {
      try {
        setLoading(true);
        const [membersRes, assembliesRes] = await Promise.all([
          api.get("/members").catch(() => ({ data: [] })),
          api.get("/locals").catch(() => ({ data: [] })),
        ]);

        setStats({
          totalMembers: membersRes.data?.length || 0,
          totalAssemblies: assembliesRes.data?.length || 0,
          recentVisits: 0,
        });
      } catch (err) {
        console.error("Failed to load Pastor stats:", err);
      } finally {
        setLoading(false);
      }
    }

    loadPastorStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white">
        {/* Header Banner */}
        <div className="border-b border-[#1E2D4A] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold mb-2">
              <HeartHandshake size={14} /> Pastoral Oversight Workspace
            </div>
            <h1 className="text-2xl font-black text-white">
              Good Day, {fullName || "Pastor"}
            </h1>
            <p className="text-xs text-slate-400">
              District shepherd care, visitation mapping, and member spiritual health tracking.
            </p>
          </div>

          <Link
            href="/pastor/visits"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition self-start md:self-auto"
          >
            <ClipboardList size={16} /> Plan New Visit Route
          </Link>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2">
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                District Flock
              </span>
              <Users size={18} />
            </div>
            <p className="text-2xl font-black text-white">
              {loading ? "..." : stats.totalMembers}
            </p>
            <p className="text-[11px] text-blue-400/80 font-medium">
              Total registered district members
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Assemblies
              </span>
              <MapPin size={18} />
            </div>
            <p className="text-2xl font-black text-white">
              {loading ? "..." : stats.totalAssemblies}
            </p>
            <p className="text-[11px] text-purple-400/80 font-medium">
              Supervised local assembly scopes
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completed Visits
              </span>
              <TrendingUp size={18} />
            </div>
            <p className="text-2xl font-black text-white">
              {loading ? "..." : stats.recentVisits}
            </p>
            <p className="text-[11px] text-emerald-400/80 font-medium">
              Pastoral visitations this month
            </p>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visitation Route Planner Card */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#1E2D4A] pb-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Shepherd Visit Planner</h3>
                <p className="text-xs text-slate-400">Map and schedule household visitations.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Use geographic coordinates and assembly clusters to organize home visits, follow up on missing members, and assign elder companions.
            </p>

            <Link
              href="/pastor/visits"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 pt-2"
            >
              Open Visit Planner <ArrowRight size={14} />
            </Link>
          </div>
          

          {/* Members Roster Card */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4">
            <div className="flex items-center gap-3 border-b border-[#1E2D4A] pb-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">District Member Directory</h3>
                <p className="text-xs text-slate-400">Filter members by local assembly.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Access complete member profiles, emergency contact information, and attendance health across all district assemblies.
            </p>

            <Link
              href="/members"
              className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 pt-2"
            >
              Explore Members Directory <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}