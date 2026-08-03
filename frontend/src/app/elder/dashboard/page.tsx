"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Users,
  Building2,
  CalendarCheck,
  Search,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  landmark?: string;
  residence?: string;
  gender?: string;
  localId?: string;
  local?: { id: string; name: string };
  visits?: any[];
}

export default function ElderDashboardPage() {
  const { user, localAssembly } = useCurrentUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const res = await api.get("/members");
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to load elder dashboard roster:", err);
      toast.error("Could not load assembly roster.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, []);

  // Filter strictly for members belonging to the Elder's assigned local assembly
  const assignedLocalId = user?.localId || user?.local?.id || localAssembly?.id;

  const localMembers = members.filter((m) => {
    if (!assignedLocalId) return true;
    const memberLocalId = m.localId || m.local?.id;
    return memberLocalId === assignedLocalId;
  });

  const filteredMembers = localMembers.filter((m) => {
    const searchLower = search.toLowerCase();
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      m.phone?.toLowerCase().includes(searchLower) ||
      m.landmark?.toLowerCase().includes(searchLower) ||
      m.residence?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate total visits across assigned local members
  const totalPastoralVisits = localMembers.reduce(
    (acc, m) => acc + (m.visits?.length || 0),
    0
  );

  const assemblyName = user?.local?.name || localAssembly?.name || "Assigned Local";

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Top Metric Cards (3 Cards Layout matching screenshot) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Assigned Local Members */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Assigned Local Members</span>
              <Users size={18} className="text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">
              {loading ? "..." : localMembers.length}
            </div>
          </div>

          {/* Card 2: Pastoral Visits Logged */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Pastoral Visits Logged</span>
              <CalendarCheck size={18} className="text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {loading ? "..." : totalPastoralVisits}
            </div>
          </div>

          {/* Card 3: Assembly Scope */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Assembly Scope</span>
              <Building2 size={18} className="text-indigo-400" />
            </div>
            <div className="text-xl font-black text-white truncate">
              {assemblyName}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roster by member name, phone, or landmark..."
              className="w-full rounded-2xl border border-[#1E2D4A] bg-[#151F32] pl-11 pr-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none font-medium shadow-inner"
            />
          </div>

          <button
            onClick={fetchRoster}
            className="p-3.5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] text-slate-400 hover:text-white transition"
            title="Refresh Roster"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Local Roster Oversight Table (Matching Screenshot View) */}
        <div className="rounded-2xl bg-[#151F32] border border-[#1E2D4A] overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-[#1E2D4A] font-bold text-xs text-slate-300">
            Local Roster Oversight
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D4A] bg-[#0B1120]/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Landmark / Residence</th>
                  <th className="py-3.5 px-4 text-right">Pastoral Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D4A]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      Loading local roster...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No members found under {assemblyName}.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => {
                    const visitsCount = m.visits?.length || 0;
                    const locationText = m.landmark || m.residence || "Not recorded";

                    return (
                      <tr key={m.id} className="hover:bg-[#1A263E]/50 transition">
                        {/* Member Name with Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl font-black text-xs bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
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

                        {/* Phone */}
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

                        {/* Pastoral Visits Badge */}
                        <td className="py-4 px-4 text-right">
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                            {visitsCount} Visit(s)
                          </span>
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