"use client";

import { useEffect, useState, useMemo } from "react";
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
  ExternalLink,
  ChevronUp,
  Calendar,
  X,
  Clock,
  User,
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
  visitDate?: string;
  durationMinutes?: number | null;
  pastor?: { firstName: string; lastName: string } | null;
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

interface VisitHistoryReport {
  id: string;
  firstName: string;
  lastName: string;
  lastVisitDate?: string | null;
  notes: Array<{
    id: string;
    visitDate: string;
    notes: string;
    durationMinutes?: number | null;
    pastor?: { firstName: string; lastName: string } | null;
  }>;
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
  const [reports, setReports] = useState<VisitHistoryReport[]>([]);
  const [todaysRouteIds, setTodaysRouteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedLocal, setSelectedLocal] = useState<LocalAssembly | null>(null);
  const [search, setSearch] = useState("");

  // Route State
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // History & Profile Modal States
  const [historyMember, setHistoryMember] = useState<Member | null>(null);
  const [profileMember, setProfileMember] = useState<Member | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [localsRes, membersRes, reportsRes, routeRes] = await Promise.all([
        api.get("/locals").catch(() => ({ data: [] })),
        api.get("/members").catch(() => ({ data: [] })),
        api.get("/visits/reports").catch(() => ({ data: [] })),
        api.get("/visits/todays-route").catch(() => ({ data: [] })),
      ]);
      setLocals(localsRes.data || []);
      setMembers(membersRes.data || []);
      setReports(reportsRes.data || []);

      const activeRouteSet = new Set<string>(
        (routeRes.data || []).map((r: any) => r.memberId)
      );
      setTodaysRouteIds(activeRouteSet);

      // AUTO-SCOPE: Lock Elder / Data Officer to assigned local
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

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.warn("GPS issue:", err)
      );
    }
  }, [user]);

  const memberReportMap = useMemo(() => {
    const map = new Map<string, VisitHistoryReport>();
    reports.forEach((report) => map.set(report.id, report));
    return map;
  }, [reports]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Never Visited";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getVisitationStatus = (member: Member) => {
    const report = memberReportMap.get(member.id);
    const lastVisit = report?.lastVisitDate;
    const isScheduledToday = todaysRouteIds.has(member.id);

    const todayStr = new Date().toISOString().split("T")[0];
    const visitedToday =
      lastVisit && new Date(lastVisit).toISOString().split("T")[0] === todayStr;

    if (visitedToday) {
      return {
        badge: "✅ Visited Today",
        badgeStyle: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        stripColor: "bg-emerald-500",
      };
    }

    if (isScheduledToday) {
      return {
        badge: "🔵 Scheduled Today",
        badgeStyle: "bg-blue-500/10 border-blue-500/30 text-blue-400",
        stripColor: "bg-blue-500",
      };
    }

    if (lastVisit || (member.visits && member.visits.length > 0)) {
      return {
        badge: "🟡 Visited Previously",
        badgeStyle: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        stripColor: "bg-amber-500",
      };
    }

    return {
      badge: "⚪ Never Visited",
      badgeStyle: "bg-slate-500/10 border-slate-500/30 text-slate-400",
      stripColor: "bg-slate-500",
    };
  };

  const toggleRoute = (memberId: string) => {
    if (activeMemberId === memberId) {
      setActiveMemberId(null);
    } else {
      setActiveMemberId(memberId);
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

  const displayedMembers = members.filter((m) => {
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

        {/* TIER 1: ASSEMBLY SELECTOR (EXACT MATCH FOR image_b18b1b.png) */}
        {!isElder && !isDataOfficer && !selectedLocal && !search && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              SELECT LOCAL ASSEMBLY
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
                    className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] hover:border-blue-500/50 cursor-pointer flex flex-col justify-between min-h-[140px] shadow-xl transition group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Left Avatar Box */}
                      <div className="h-14 w-14 rounded-xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md">
                        {loc.name[0]}
                      </div>

                      {/* Assembly Info */}
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition">
                          {loc.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono tracking-wider">
                          CODE: {loc.code}
                        </p>
                      </div>
                    </div>

                    {/* Total Members Count Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#1E2D4A]/60 text-xs mt-2">
                      <span className="text-slate-400 font-medium">
                        Total Members:
                      </span>
                      <span className="font-bold text-white text-sm">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TIER 2: MEMBER ROSTER */}
        {(isElder || isDataOfficer || selectedLocal || search) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ROSTER ({displayedMembers.length} MEMBERS)
              </span>

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
                  const status = getVisitationStatus(m);
                  const report = memberReportMap.get(m.id);

                  // TURN-BY-TURN ROUTE: Dynamic origin using live user coordinates to destination
                  const originParam = userLocation
                    ? `${userLocation.lat},${userLocation.lng}`
                    : "Current+Location";
                  const mapDirectionsUrl = `https://maps.google.com/maps?saddr=${originParam}&daddr=${m.latitude},${m.longitude}&hl=en&z=15&output=embed`;
                  const mapsAppUrl = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${m.latitude},${m.longitude}&travelmode=driving`;

                  return (
                    <div
                      key={m.id}
                      className={`rounded-2xl bg-[#151F32] border transition-all overflow-hidden shadow-xl relative ${
                        isActive
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-[#1E2D4A] hover:border-blue-500/40"
                      }`}
                    >
                      {/* Left Status Bar Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.stripColor}`} />

                      {/* Card Row Header */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md">
                            {m.firstName[0]}
                            {m.lastName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-white text-base">
                                {m.firstName} {m.lastName}
                              </h3>

                              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-extrabold text-[10px]">
                                {m.local?.name || currentScopeName}
                              </span>

                              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold ${status.badgeStyle}`}>
                                {status.badge}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Phone size={12} className="text-emerald-400" /> {m.phone || "No phone"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-emerald-400" />{" "}
                                {m.landmark || "No landmark specified"}
                              </span>
                              <span>•</span>
                              <span className="text-slate-400">
                                Last Visit: <strong className="text-slate-200">{formatDate(report?.lastVisitDate)}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* HORIZONTAL ACTION BUTTONS */}
                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                          {isPastor && (
                            <>
                              <a
                                href={m.phone ? `tel:${m.phone}` : "#"}
                                onClick={(e) => {
                                  if (!m.phone) {
                                    e.preventDefault();
                                    toast.error("No phone number on record.");
                                  }
                                }}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Phone size={14} /> Call
                              </a>

                              <button
                                onClick={() => toggleRoute(m.id)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
                                  isActive
                                    ? "bg-slate-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <ChevronUp size={14} /> Close Route
                                  </>
                                ) : (
                                  <>
                                    <Navigation size={14} /> Start Navigation
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => setHistoryMember(m)}
                                className="px-4 py-2.5 rounded-xl bg-purple-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-600/20 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Calendar size={14} /> History
                              </button>

                              <button
                                onClick={() => setProfileMember(m)}
                                className="px-4 py-2.5 rounded-xl bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:bg-slate-700/50 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <User size={14} /> Profile
                              </button>
                            </>
                          )}

                          {(isAdmin || isDataOfficer) && (
                            <>
                              <button
                                onClick={() => router.push(`/members/${m.id}`)}
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

                      {/* EXPANDED ROUTE MAP SECTION ONLY */}
                      {isPastor && isActive && (
                        <div className="border-t border-[#1E2D4A] bg-[#0B1120] p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
                              TURN-BY-TURN ROUTE: {m.firstName.toUpperCase()}'S HOUSE
                            </h4>
                            <a
                              href={mapsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                            >
                              Open Maps App <ExternalLink size={12} />
                            </a>
                          </div>

                          <div className="w-full h-80 rounded-2xl overflow-hidden border border-[#1E2D4A] bg-[#151F32]">
                            <iframe
                              title={`Turn-by-turn route to ${m.firstName}`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              src={mapDirectionsUrl}
                              allowFullScreen
                            />
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

        {/* 📜 MODAL 1: VISITATION HISTORY */}
        {historyMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-[#151F32] border border-[#1E2D4A] rounded-2xl p-6 space-y-4 shadow-2xl text-white max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3 shrink-0">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2 text-white">
                    <Calendar size={18} className="text-purple-400" /> Pastoral Visit History
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {historyMember.firstName} {historyMember.lastName} • {historyMember.local?.name}
                  </p>
                </div>
                <button
                  onClick={() => setHistoryMember(null)}
                  className="p-1 rounded-lg hover:bg-[#1E2D4A] text-slate-400 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {(() => {
                  const report = memberReportMap.get(historyMember.id);
                  const logs = report?.notes || [];

                  if (logs.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No recorded visits found for this member yet.
                      </div>
                    );
                  }

                  return logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-[#0B1120] border border-[#1E2D4A] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 font-mono">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Calendar size={12} /> {formatDate(log.visitDate)}
                        </span>
                        {log.durationMinutes && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={12} /> {log.durationMinutes} mins
                          </span>
                        )}
                      </div>

                      <p className="text-slate-200 leading-relaxed italic bg-[#151F32]/60 p-2.5 rounded-lg border border-[#1E2D4A]/80">
                        "{log.notes}"
                      </p>

                      {log.pastor && (
                        <p className="text-[10px] text-slate-500 text-right">
                          Logged by: Rev. {log.pastor.firstName} {log.pastor.lastName}
                        </p>
                      )}
                    </div>
                  ));
                })()}
              </div>

              <div className="pt-2 border-t border-[#1E2D4A] flex justify-end shrink-0">
                <button
                  onClick={() => setHistoryMember(null)}
                  className="px-4 py-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-300 font-bold text-xs hover:bg-[#1E2D4A] transition"
                >
                  Close History
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 👤 MODAL 2: MEMBER CARE PROFILE */}
        {profileMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#151F32] border border-[#1E2D4A] rounded-2xl p-6 space-y-5 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <User className="text-blue-400" size={18} /> Member Care Profile
                </h3>
                <button
                  onClick={() => setProfileMember(null)}
                  className="p-1 rounded-lg hover:bg-[#1E2D4A] text-slate-400 hover:text-white transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-4 bg-[#0B1120] p-4 rounded-xl border border-[#1E2D4A]">
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0">
                    {profileMember.firstName[0]}
                    {profileMember.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {profileMember.firstName} {profileMember.lastName}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {profileMember.local?.name || currentScopeName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-[#0B1120] p-4 rounded-xl border border-[#1E2D4A]">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Phone Contact
                    </span>
                    <span className="text-slate-200 font-mono">
                      {profileMember.phone || "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Gender
                    </span>
                    <span className="text-slate-200 capitalize">
                      {profileMember.gender || "Not specified"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Landmark Residence
                    </span>
                    <span className="text-slate-200">
                      {profileMember.landmark || "Coordinates set"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      GPS Coordinates
                    </span>
                    <span className="text-slate-200 font-mono text-[11px]">
                      {profileMember.latitude.toFixed(4)}, {profileMember.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setProfileMember(null)}
                  className="px-4 py-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-300 font-bold text-xs hover:bg-[#1E2D4A] transition"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}