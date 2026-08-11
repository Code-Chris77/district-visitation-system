"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserPlus, MapPin, CheckCircle2 } from "lucide-react";
import api from "@/lib/axios";

export default function DataOfficerDashboard() {
  const { user, fullName, localAssembly } = useCurrentUser();
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fallback to user.local.name if localAssembly is an object or string
  const assemblyName =
    localAssembly?.name || user?.local?.name || "Assigned Local";

 useEffect(() => {
  if (!user) return;

  async function loadStats() {
    try {
      setLoading(true);

      const res = await api.get("/members");

      const members = Array.isArray(res.data) ? res.data : [];

     if (!user) return;

const filteredMembers = members.filter(
  (member: any) => member.localId === user.localId,
);

      setTotalMembers(filteredMembers.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  loadStats();
}, [user]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white">
        {/* Header */}
        <div className="border-b border-[#1E2D4A] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-2">
              <MapPin size={14} /> Scope: {assemblyName}
            </div>
            <h1 className="text-2xl font-black text-white">Data Officer Portal</h1>
            <p className="text-xs text-slate-400">
              Welcome back, {fullName || "Officer"}. Register and manage members for your local.
            </p>
          </div>

          <Link
            href="/data-officer/members/register"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition self-start md:self-auto"
          >
            <UserPlus size={16} /> + Register New Member
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ASSIGNED LOCAL
            </span>
            <p className="text-xl font-black text-white truncate">
              {assemblyName}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              LOCAL MEMBERS
            </span>
            <p className="text-2xl font-black text-white">
              {loading ? "..." : totalMembers}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              STATUS
            </span>
            <p className="text-xl font-black text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 size={18} /> Active Officer
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}