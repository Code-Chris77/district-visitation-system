"use client";

import { useEffect, useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Calendar,
  CheckCircle2,
  Phone,
  Navigation,
  ChevronUp,
  ExternalLink,
  PlusCircle,
  History,
  MapPin,
  Clock,
  ListOrdered,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface LocalAssembly {
  id: string;
  name: string;
  code: string;
}

interface PlanMemberItem {
  id: string;
  status: "PENDING" | "VISITED" | "SKIPPED";
  member: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  };
}

interface VisitationPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  local: LocalAssembly;
  planMembers: PlanMemberItem[];
}

export default function PastoralPlannerPage() {
  const [locals, setLocals] = useState<LocalAssembly[]>([]);
  const [activePlan, setActivePlan] = useState<VisitationPlan | null>(null);
  const [planHistory, setPlanHistory] = useState<VisitationPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLocalId, setSelectedLocalId] = useState("");
  const [durationDays, setDurationDays] = useState(14); // Default Two Weeks
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [savingPlan, setSavingPlan] = useState(false);

  // Active Visit Drawer State
  const [activePlanMemberId, setActivePlanMemberId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [completing, setCompleting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      const [localsRes, activeRes, historyRes] = await Promise.all([
        api.get("/locals").catch(() => ({ data: [] })),
        api.get("/visits/plan/active").catch(() => ({ data: null })),
        api.get("/visits/plan/history").catch(() => ({ data: [] })),
      ]);

      setLocals(localsRes.data || []);
      setActivePlan(activeRes.data || null);
      setPlanHistory(historyRes.data || []);
    } catch (err) {
      console.error("Failed to load pastoral planner:", err);
      toast.error("Could not load visitation planner.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("GPS issue:", err)
      );
    }
  }, []);

  const remainingMembers = useMemo(() => {
    if (!activePlan?.planMembers) return [];
    return activePlan.planMembers.filter((pm) => pm.status === "PENDING");
  }, [activePlan]);

  const totalMembersCount = activePlan?.planMembers?.length || 0;
  const visitedMembersCount = totalMembersCount - remainingMembers.length;
  const progressPercentage =
    totalMembersCount > 0 ? Math.round((visitedMembersCount / totalMembersCount) * 100) : 0;

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocalId) {
      toast.error("Please select a local assembly.");
      return;
    }

    try {
      setSavingPlan(true);
      const res = await api.post("/visits/plan", {
        localId: selectedLocalId,
        durationDays: Number(durationDays),
        startDate,
      });

      toast.success("Visitation Plan activated!");
      setActivePlan(res.data);
      setIsCreating(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create visitation plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleFinishVisit = async (planMemberId: string, firstName: string) => {
    try {
      setCompleting(true);
      await api.patch(`/visits/plan/member/${planMemberId}/complete`, { notes });

      toast.success(`Visit logged for ${firstName}!`);

      // Optimistic UI removal from active queue
      setActivePlan((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          planMembers: prev.planMembers.map((pm) =>
            pm.id === planMemberId ? { ...pm, status: "VISITED" as const } : pm
          ),
        };
      });

      setActivePlanMemberId(null);
      setNotes("");
    } catch (err) {
      console.error("Failed to complete visit:", err);
      toast.error("Could not record visit.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-slate-400 animate-pulse bg-[#0B1120] min-h-screen">
          Loading Pastoral Visitation Planner...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2D4A] pb-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="text-blue-400" size={24} /> Pastoral Visitation Planner
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Select an assembly, set a duration target, and systematically shepherd your flock.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition self-start md:self-auto"
          >
            <PlusCircle size={16} /> {isCreating ? "View Active Plan" : "Create New Plan"}
          </button>
        </div>

        {/* 1. PASTOR-FRIENDLY CREATE PLAN FORM */}
        {isCreating ? (
          <form
            onSubmit={handleCreatePlan}
            className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-5 shadow-xl max-w-2xl"
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1E2D4A] pb-3">
              Create Visitation Plan
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase block">
                Choose Local Assembly
              </label>
              <select
                value={selectedLocalId}
                onChange={(e) => setSelectedLocalId(e.target.value)}
                className="w-full bg-[#0B1120] border border-[#1E2D4A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="">-- Select Assembly --</option>
                {locals.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} Assembly (CODE: {loc.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Pastor-friendly Duration Radio Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase block">
                Choose Target Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: "○ One Day", value: 1 },
                  { label: "○ Multiple Days (3d)", value: 3 },
                  { label: "○ One Week", value: 7 },
                  { label: "○ Two Weeks", value: 14 },
                  { label: "○ One Month", value: 30 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDurationDays(opt.value)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition text-left ${
                      durationDays === opt.value
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-[#0B1120] border-[#1E2D4A] text-slate-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0B1120] border border-[#1E2D4A] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="pt-3 border-t border-[#1E2D4A] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 rounded-xl border border-[#1E2D4A] text-xs font-bold text-slate-400 hover:bg-[#0B1120]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPlan}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition disabled:opacity-50"
              >
                {savingPlan ? "Creating Plan..." : "Start Plan Queue"}
              </button>
            </div>
          </form>
        ) : (
          /* 2. ACTIVE PLAN & PROGRESS BREAKDOWN */
          activePlan && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2D4A] pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider block">
                      Current Active Plan
                    </span>
                    <h2 className="text-lg font-black text-white">
                      {activePlan.local.name} Local Assembly
                    </h2>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(activePlan.startDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    ➔{" "}
                    {new Date(activePlan.endDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>

                {/* Progress Visual Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">
                      Overall Progress
                    </span>
                    <span className="text-emerald-400">{progressPercentage}%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-[#0B1120] border border-[#1E2D4A] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Enhanced Plan Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Visited</span>
                    <span className="text-lg font-black text-emerald-400">{visitedMembersCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Remaining</span>
                    <span className="text-lg font-black text-blue-400">{remainingMembers.length}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Scope</span>
                    <span className="text-lg font-black text-white">{totalMembersCount}</span>
                  </div>
                </div>
              </div>

              {/* Remaining Roster Queue */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Remaining Members ({remainingMembers.length})
                </h3>

                {remainingMembers.length === 0 ? (
                  <div className="p-10 text-center bg-[#151F32] border border-[#1E2D4A] rounded-2xl space-y-2">
                    <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                    <h4 className="font-black text-base text-white">Plan Complete!</h4>
                    <p className="text-xs text-slate-400">
                      All {totalMembersCount} members in {activePlan.local.name} have been visited.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {remainingMembers.map((pm) => {
                      const m = pm.member;
                      const isActive = activePlanMemberId === pm.id;

                      const originParam = userLocation
                        ? `${userLocation.lat},${userLocation.lng}`
                        : "Current+Location";
                      const mapDirectionsUrl = `https://maps.google.com/maps?saddr=${originParam}&daddr=${m.latitude},${m.longitude}&hl=en&z=15&output=embed`;
                      const mapsAppUrl = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${m.latitude},${m.longitude}&travelmode=driving`;

                      return (
                        <div
                          key={pm.id}
                          className={`rounded-2xl bg-[#151F32] border transition-all overflow-hidden shadow-xl relative ${
                            isActive
                              ? "border-blue-500 ring-2 ring-blue-500/20"
                              : "border-[#1E2D4A] hover:border-blue-500/40"
                          }`}
                        >
                          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md">
                                {m.firstName[0]}
                                {m.lastName[0]}
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-white text-base">
                                  {m.firstName} {m.lastName}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Phone size={12} className="text-emerald-400" />{" "}
                                    {m.phone || "No phone"}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} className="text-emerald-400" />{" "}
                                    {m.landmark || "No landmark"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end md:self-auto">
                              <a
                                href={m.phone ? `tel:${m.phone}` : "#"}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Phone size={14} /> Call
                              </a>

                              <button
                                onClick={() =>
                                  setActivePlanMemberId(isActive ? null : pm.id)
                                }
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
                                  isActive
                                    ? "bg-slate-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <ChevronUp size={14} /> Close
                                  </>
                                ) : (
                                  <>
                                    <Navigation size={14} /> Open & Navigate
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* EXPANDED MAP & NOTES DRAWER */}
                          {isActive && (
                            <div className="border-t border-[#1E2D4A] bg-[#0B1120] p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-ping" />
                                  TURN-BY-TURN ROUTE: {m.firstName.toUpperCase()}'S HOUSE
                                </h5>
                                <a
                                  href={mapsAppUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
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
                                  src={mapDirectionsUrl}
                                  allowFullScreen
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
                                    onClick={() => setActivePlanMemberId(null)}
                                    className="px-4 py-2 rounded-xl border border-[#1E2D4A] text-xs font-bold text-slate-400 hover:bg-[#0B1120]"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFinishVisit(pm.id, m.firstName)}
                                    disabled={completing}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <CheckCircle2 size={16} />
                                    {completing ? "Saving..." : "Finish & Save Visit"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* 3. ENHANCED COMPLETED PLANS ARCHIVE */}
        <div className="pt-6 border-t border-[#1E2D4A] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <History size={14} className="text-purple-400" /> Completed Plans History
          </h3>

          {planHistory.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No past completed plans archived yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {planHistory.map((plan) => {
                const total = plan.planMembers.length;
                const visited = plan.planMembers.filter((m) => m.status === "VISITED").length;

                return (
                  <div
                    key={plan.id}
                    className="p-5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-2 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">
                        ✓ {plan.local.name} Local Assembly
                      </h4>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {visited} / {total} Completed
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                      <Clock size={12} className="text-blue-400" />
                      <span>
                        {new Date(plan.startDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}{" "}
                        ➔{" "}
                        {new Date(plan.endDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}