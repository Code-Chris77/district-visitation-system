"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  Phone,
  MapPin,
  Building2,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LocalAssembly {
  id: string;
  name: string;
  code: string;
}

interface VisitRecord {
  id: string;
  notes?: string;
  createdAt: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  landmark?: string;
  residence?: string;
  gender: string;
  localId?: string;
  local?: LocalAssembly;
  visits?: VisitRecord[];
}

export default function DataOfficerMembersPage() {
  const router = useRouter();
  const { user } = useAuth(); // Logged-in officer session context

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/members");
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
      toast.error("Could not load member roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Delete Member Action
  const handleDeleteMember = async (member: Member) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.firstName} ${member.lastName}?`
    );
    if (!confirmed) return;

    try {
      // Optimistic state update
      setMembers((prev) => prev.filter((m) => m.id !== member.id));

      await api.delete(`/members/${member.id}`);
      toast.success(`Member ${member.firstName} ${member.lastName} removed.`);
    } catch (err) {
      console.error("Failed to delete member:", err);
      toast.error("Could not delete member.");
      fetchMembers(); // Rollback on error
    }
  };

  // Filter members strictly based on assigned local coverage for Data Officers/Elders
  const filteredMembers = members.filter((m) => {
    // 1. Role Scope Filter
    if (
      user?.role === "DATA_OFFICER" ||
      user?.role === "ELDER"
    ) {
      const userLocalId = user.localId || user.local?.id;
      const memberLocalId = m.localId || m.local?.id;

      if (userLocalId && memberLocalId !== userLocalId) {
        return false;
      }
    }

    // 2. Search Filter
    const searchLower = search.toLowerCase();
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      m.phone?.toLowerCase().includes(searchLower) ||
      m.landmark?.toLowerCase().includes(searchLower) ||
      m.residence?.toLowerCase().includes(searchLower) ||
      m.local?.name?.toLowerCase().includes(searchLower)
    );
  });

  const totalAssignedMembers = filteredMembers.length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2D4A] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.back()}
                className="p-1.5 rounded-xl bg-[#151F32] border border-[#1E2D4A] text-slate-400 hover:text-white transition"
              >
                <ArrowLeft size={16} />
              </button>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Users className="text-blue-400" size={24} />
                Assembly Member Roster
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {user?.local?.name ? (
                <span>
                  Scope:{" "}
                  <strong className="text-emerald-400">{user.local.name}</strong> •
                  Manage member profiles & residence details.
                </span>
              ) : (
                "Manage local member profiles, landmarks, and contact info."
              )}
            </p>
          </div>

          <Link
            href="/data-officer/members/register"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 self-start md:self-auto"
          >
            <Plus size={16} /> Register New Member
          </Link>
        </div>

        {/* Search Bar & Total Counter */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or landmark..."
              className="w-full rounded-2xl border border-[#1E2D4A] bg-[#151F32] pl-11 pr-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none font-medium shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="p-3 px-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] flex items-center gap-3 shrink-0">
              <UserCheck size={18} className="text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  Local Roster
                </span>
                <span className="text-base font-black text-white">
                  {totalAssignedMembers} Members
                </span>
              </div>
            </div>

            <button
              onClick={fetchMembers}
              className="p-3.5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] text-slate-400 hover:text-white transition"
              title="Refresh List"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* TABULAR SCROLLING LIST VIEW */}
        <div className="rounded-2xl bg-[#151F32] border border-[#1E2D4A] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D4A] bg-[#0B1120]/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Phone Contact</th>
                  <th className="py-3.5 px-4">Landmark / Residence</th>
                  <th className="py-3.5 px-4">Local Assembly</th>
                  <th className="py-3.5 px-4">Visits Logged</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1E2D4A]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading member roster...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No members found in {user?.local?.name || "your local assembly"}.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const visitsCount = m.visits?.length || 0;
                    const locationText = m.landmark || m.residence || "Not specified";

                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-[#1A263E]/50 transition"
                      >
                        {/* Member Name */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl font-black text-xs bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                              {m.firstName?.[0]}
                              {m.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">
                                {m.firstName} {m.lastName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium uppercase">
                                {m.gender || "Member"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone Contact */}
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone size={13} className="text-blue-400 shrink-0" />
                            <span>{m.phone}</span>
                          </div>
                        </td>

                        {/* Landmark / Residence */}
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex items-center gap-1.5 font-medium">
                            <MapPin size={13} className="text-emerald-400 shrink-0" />
                            <span>{locationText}</span>
                          </div>
                        </td>

                        {/* Local Assembly */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <Building2 size={13} className="text-indigo-400 shrink-0" />
                            <span>{m.local?.name || user?.local?.name || "Assembly Member"}</span>
                          </div>
                        </td>

                        {/* Visits Count */}
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                            {visitsCount} Visit(s)
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Call Button */}
                            <a
                              href={`tel:${m.phone}`}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition flex items-center gap-1"
                            >
                              <Phone size={12} /> Call
                            </a>

                            {/* Edit Profile Link */}
                            <Link
                              href={`/data-officer/members/edit?id=${m.id}`}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 text-xs font-bold transition flex items-center gap-1"
                            >
                              <Edit2 size={12} /> Edit Profile
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteMember(m)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30 text-xs font-bold transition flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}