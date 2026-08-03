"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Users,
  Search,
  Phone,
  MapPin,
  Navigation,
  Building2,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface LocalAssembly {
  id: string;
  name: string;
  code: string;
}

interface VisitRecord {
  id: string;
  notes?: string;
  createdAt?: string;
  date?: string;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  localId?: string;
  local?: { id: string; name: string };
  visits?: VisitRecord[];
}

export default function MembersPage() {
  const router = useRouter();
  const { user, localAssembly } = useCurrentUser();

  const isPastor = user?.role === "PASTOR";
  const isAdmin = user?.role === "ADMIN";
  const isElder = user?.role === "ELDER";
  const isDataOfficer = user?.role === "DATA_OFFICER";

  const [locals, setLocals] = useState<LocalAssembly[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocal, setSelectedLocal] = useState<LocalAssembly | null>(null);
  const [search, setSearch] = useState("");

  // Route & Visit State
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState("");
  const [completing, setCompleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [localsRes, membersRes] = await Promise.all([
        api.get("/locals"),
        api.get("/members"),
      ]);
      setLocals(localsRes.data);
      setMembers(membersRes.data);

      // 🔒 AUTO-SCOPE: If ELDER or DATA_OFFICER, automatically lock to their local assembly
      const userLocal = user?.local || localAssembly;
      if (isElder || isDataOfficer) {
        if (userLocal) {
          setSelectedLocal(userLocal as LocalAssembly);
        }
      }
    } catch (err) {
      console.error("Failed to load roster:", err);
      toast.error("Could not load district members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("GPS issue:", err)
      );
    }
  }, [user]);

  const toggleRoute = (memberId: string) => {
    if (activeMemberId === memberId) {
      setActiveMemberId(null);
    } else {
      setActiveMemberId(memberId);
      setNotes("");
    }
  };

  const handleFinishVisit = async (member: Member) => {
    try {
      setCompleting(true);
      await api.post("/visits", {
        memberId: member.id,
        notes: notes.trim() !== "" ? notes : "Pastoral residence visit completed.",
      });

      toast.success(`Visit logged for ${member.firstName} ${member.lastName}!`);
      setActiveMemberId(null);
      setNotes("");

      await loadData();
    } catch (err) {
      console.error("Visit submission failed:", err);
      toast.error("Failed to record visit.");
    } finally {
      setCompleting(false);
    }
  };

  const handleDeleteMember = async (member: Member) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.firstName} ${member.lastName}?`
    );
    if (!confirmed) return;

    try {
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      await api.delete(`/members/${member.id}`);
      toast.success(`Member ${member.firstName} ${member.lastName} deleted.`);
    } catch (err) {
      console.error("Failed to delete member:", err);
      toast.error("Could not delete member.");
      loadData();
    }
  };

  // Filter members strictly by assigned local for Elder/Data Officer and search input
  const displayedMembers = members.filter((m) => {
    // 1. Enforce local assembly lock for Elders/Data Officers
    if (isElder || isDataOfficer) {
      const assignedLocalId = user?.localId || user?.local?.id || localAssembly?.id;
      const memberLocalId = m.localId || m.local?.id;
      if (assignedLocalId && memberLocalId !== assignedLocalId) {
        return false;
      }
    } else if (selectedLocal) {
      const matchesLocal = m.localId === selectedLocal.id || m.local?.id === selectedLocal.id;
      if (!matchesLocal) return false;
    }

    // 2. Search Filter
    const matchesSearch = `${m.firstName} ${m.lastName} ${m.phone} ${m.landmark || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch;
  });

  const currentScopeName =
    selectedLocal?.name || user?.local?.name || localAssembly?.name || "Local Roster";

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2D4A] pb-4">
          <div>
            <div className="flex items-center gap-2">
              {/* Back button only for Admin / Pastor who can switch assemblies */}
              {selectedLocal && (isAdmin || isPastor) && (
                <button
                  onClick={() => setSelectedLocal(null)}
                  className="p-1.5 rounded-xl bg-[#151F32] border border-[#1E2D4A] text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Users className="text-blue-400" size={24} />
                {(isElder || isDataOfficer) || selectedLocal
                  ? `${currentScopeName} Roster`
                  : "District Local Assemblies"}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {(isElder || isDataOfficer) || selectedLocal
                ? `Overseeing registered members in ${currentScopeName}`
                : "Select an assembly scope to view member rosters."}
            </p>
          </div>

          {/* Switch local option hidden for Elders and Data Officers */}
          {selectedLocal && (isAdmin || isPastor) && (
            <button
              onClick={() => setSelectedLocal(null)}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition flex items-center gap-1.5"
            >
              <Building2 size={14} /> Switch Local Assembly
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by name, phone, or landmark..."
            className="w-full rounded-2xl border border-[#1E2D4A] bg-[#151F32] pl-11 pr-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none font-medium shadow-inner"
          />
        </div>

        {/* TIER 1: ASSEMBLY SELECTOR (ONLY FOR ADMIN & PASTOR) */}
        {!isElder && !isDataOfficer && !selectedLocal && !search && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={14} className="text-blue-400" /> Select Local Assembly
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {locals.map((loc) => {
                const count = members.filter(
                  (m) => m.localId === loc.id || m.local?.id === loc.id
                ).length;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocal(loc)}
                    className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] hover:border-blue-500/50 cursor-pointer space-y-4 shadow-xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center">
                        {loc.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{loc.name}</h3>
                        <span className="text-[10px] text-slate-400 font-bold">CODE: {loc.code}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#1E2D4A] flex justify-between text-xs text-slate-400">
                      <span>Total Members:</span>
                      <span className="font-bold text-white">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TIER 2: MEMBER ROSTER (DIRECTLY SHOWN TO ELDERS / DATA OFFICERS) */}
        {(isElder || isDataOfficer || selectedLocal || search) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Roster ({displayedMembers.length} Members)
              </span>

              {/* View all assemblies button hidden for Elders */}
              {(isAdmin || isPastor) && selectedLocal && (
                <button
                  onClick={() => setSelectedLocal(null)}
                  className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                >
                  View All Assemblies <ChevronRight size={14} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Loading assembly roster...
                </div>
              ) : displayedMembers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-[#151F32] rounded-2xl border border-[#1E2D4A]">
                  No members registered under {currentScopeName}.
                </div>
              ) : (
                displayedMembers.map((m) => {
                  const isActive = activeMemberId === m.id;
                  const isVisited = m.visits && m.visits.length > 0;
                  const mapUrl = `https://maps.google.com/maps?saddr=${
                    userLocation?.lat || ""
                  },${userLocation?.lng || ""}&daddr=${m.latitude},${m.longitude}&output=embed`;

                  return (
                    <div
                      key={m.id}
                      className={`rounded-2xl bg-[#151F32] border transition-all overflow-hidden shadow-xl ${
                        isActive
                          ? "border-blue-500/60 ring-1 ring-blue-500/30"
                          : isVisited
                          ? "border-emerald-500/40 bg-[#122329]/40"
                          : "border-[#1E2D4A]"
                      }`}
                    >
                      {/* Card Summary Header */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-12 w-12 rounded-2xl font-black text-base flex items-center justify-center shrink-0 shadow-md ${
                              isVisited
                                ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white"
                                : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                            }`}
                          >
                            {m.firstName[0]}
                            {m.lastName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-base">
                                {m.firstName} {m.lastName}
                              </h3>
                              {isVisited ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Visited ({m.visits?.length})
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                                  {m.local?.name || currentScopeName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Phone size={12} className="text-blue-400" /> {m.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-emerald-400" />{" "}
                                {m.landmark || "No landmark specified"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CONDITIONAL ACTION BUTTONS */}
                        <div className="flex items-center gap-2.5">
                          {isPastor && (
                            <>
                              <a
                                href={`tel:${m.phone}`}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition flex items-center gap-1.5 hover:bg-emerald-600/30"
                              >
                                <Phone size={13} /> Call
                              </a>

                              <button
                                onClick={() => toggleRoute(m.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
                                  isActive
                                    ? "bg-slate-700 text-white"
                                    : isVisited
                                    ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30"
                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <ChevronUp size={14} /> Close Route
                                  </>
                                ) : isVisited ? (
                                  <>
                                    <CheckCircle2 size={14} /> Re-visit Route
                                  </>
                                ) : (
                                  <>
                                    <Navigation size={14} /> Start Navigation
                                  </>
                                )}
                              </button>
                            </>
                          )}

                          {(isAdmin || isDataOfficer) && (
                            <>
                              <button
                                onClick={() => {
                                  router.push(`/members/${m.id}`);
                                }}
                                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteMember(m)}
                                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {isElder && (
                            <span className="px-3.5 py-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-400 text-xs font-bold">
                              Assembly Member
                            </span>
                          )}
                        </div>
                      </div>

                      {/* MAP SECTION RESTRICTED strictly to Pastor */}
                      {isPastor && isActive && (
                        <div className="border-t border-[#1E2D4A] bg-[#0B1120] p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
                              Turn-by-Turn Route: {m.firstName}'s House
                            </h4>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${m.latitude},${m.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-slate-400 hover:text-blue-400 flex items-center gap-1"
                            >
                              Open Maps App <ExternalLink size={12} />
                            </a>
                          </div>

                          <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#1E2D4A] bg-[#151F32]">
                            <iframe
                              title={`Route to ${m.firstName}`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              src={mapUrl}
                            />
                          </div>

                          <div className="p-4 rounded-xl bg-[#151F32] border border-[#1E2D4A] space-y-3">
                            <label className="block text-xs font-bold text-slate-400">
                              Pastoral Visit Notes
                            </label>
                            <input
                              type="text"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Type notes for this visit..."
                              className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                            />
                            <div className="flex justify-end gap-3 pt-1">
                              <button
                                type="button"
                                onClick={() => setActiveMemberId(null)}
                                className="px-4 py-2 rounded-xl border border-[#1E2D4A] text-xs font-bold text-slate-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFinishVisit(m)}
                                disabled={completing}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                              >
                                <CheckCircle2 size={16} />{" "}
                                {completing ? "Saving Visit..." : "Finish & Save Visit"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}