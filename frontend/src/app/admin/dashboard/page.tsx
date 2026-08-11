"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users,
  ShieldCheck,
  Building2,
  Clock,
  UserCheck,
  ArrowRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/axios";

interface LocalAssembly {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  isApproved?: boolean;
}

interface Member {
  id: string;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [locals, setLocals] = useState<LocalAssembly[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, localsRes, membersRes] = await Promise.all([
        api.get("/users"),
        api.get("/locals"),
        api.get("/members"),
      ]);
      setUsers(usersRes.data);
      setLocals(localsRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
      toast.error("Could not fetch dashboard analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Correct calculation logic matching backend approval states
  const pendingApprovalsCount = users.filter((u) => {
    const isApproved = u.status === "APPROVED" || u.isApproved === true;
    return !isApproved;
  }).length;

  const activeUsersCount = users.filter((u) => {
    return u.status === "APPROVED" || u.isApproved === true;
  }).length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Top Header Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Metric 1: Pending Approvals */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                Pending Approvals
              </span>
              <Clock className="text-amber-400" size={20} />
            </div>
            <div className="text-3xl font-black text-white">
              {loading ? "..." : pendingApprovalsCount}
            </div>
            <p className="text-[11px] font-medium text-amber-400">
              Users awaiting role assignment
            </p>
          </div>

          {/* Metric 2: Active Users */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                Active Users
              </span>
              <UserCheck className="text-emerald-400" size={20} />
            </div>
            <div className="text-3xl font-black text-white">
              {loading ? "..." : activeUsersCount}
            </div>
            <p className="text-[11px] font-medium text-emerald-400">
              Verified system accounts
            </p>
          </div>

          {/* Metric 3: Total Members */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Members
              </span>
              <Users className="text-blue-400" size={20} />
            </div>
            <div className="text-3xl font-black text-white">
              {loading ? "..." : members.length}
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              Registered district members
            </p>
          </div>

          {/* Metric 4: Assemblies */}
          <div className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                Assemblies
              </span>
              <Building2 className="text-indigo-400" size={20} />
            </div>
            <div className="text-3xl font-black text-white">
              {loading ? "..." : locals.length}
            </div>
            <p className="text-[11px] font-medium text-indigo-400">
              Local assembly locations
            </p>
          </div>
        </div>

        {/* Action Callouts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Access Control Card */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    User Access Control & Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Approve sign-ins and assign local scope.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2">
                When officers or pastors sign in via Google, their access remains restricted until an administrator assigns a system role (ADMIN, PASTOR, ELDER, DEACON, DATA_OFFICER) and assembly scope.
              </p>
            </div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition pt-2"
            >
              Open User Approval Queue <ArrowRight size={14} />
            </Link>
          </div>

          {/* Assemblies Management Card */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Assemblies Management
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage local district assembly scopes.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2">
                View assembly coverage across the district, update geographic boundaries, and assign data officers and pastors to local units.
              </p>
            </div>
            {/* FIXED ROUTE TO /locals HERE */}
            <Link
              href="/locals"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition pt-2"
            >
              View District Assemblies <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}