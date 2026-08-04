"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Navigation,
  Phone,
  CheckCircle2,
  MapPin,
  Clock,
  Car,
  Building2,
  ChevronDown,
  ChevronUp,
  Award,
  SkipForward,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import VisitationMapModal from "@/components/visitations/VisitationMapModal";

interface ScheduledVisit {
  scheduledVisitId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  assembly: string;
  landmark: string;
  latitude: number;
  longitude: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "CANCELLED";
  routeOrder: number;
  notes?: string;
  startedAt?: string;
  completedAt?: string;
}

export default function TodaysRouteCard() {
  const [stops, setStops] = useState<ScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [showCompletedList, setShowCompletedList] = useState(false);

  // Completion Modal State
  const [completingStop, setCompletingStop] = useState<ScheduledVisit | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");

  // Map Navigation Modal
  const [selectedMapMember, setSelectedMapMember] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  const fetchRoute = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/visits/todays-route");
      setStops(res.data);
    } catch (err: any) {
      console.error("Failed to load route:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  const handleStartStop = async (stop: ScheduledVisit) => {
    try {
      setActioningId(stop.scheduledVisitId);
      if (stop.status !== "IN_PROGRESS") {
        await api.patch(`/visits/todays-route/${stop.scheduledVisitId}/start`);
        toast.info(`Navigation started for ${stop.firstName} ${stop.lastName}`);
        fetchRoute();
      }
      setSelectedMapMember({
        name: `${stop.firstName} ${stop.lastName}`,
        lat: stop.latitude,
        lng: stop.longitude,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start navigation.");
    } finally {
      setActioningId(null);
    }
  };

  const submitCompletion = async () => {
    if (!completingStop) return;
    try {
      setActioningId(completingStop.scheduledVisitId);
      await api.patch(`/visits/todays-route/${completingStop.scheduledVisitId}/complete`, {
        notes: completionNotes,
      });
      toast.success(`Visit completed for ${completingStop.firstName} ${completingStop.lastName}!`);
      setCompletingStop(null);
      setCompletionNotes("");
      fetchRoute();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete visit.");
    } finally {
      setActioningId(null);
    }
  };

  const handleSkipStop = async (id: string, name: string) => {
    try {
      setActioningId(id);
      await api.patch(`/visits/todays-route/${id}/skip`, {
        reason: "Pastor skipped stop during route execution.",
      });
      toast.warning(`Skipped visit for ${name}`);
      fetchRoute();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to skip stop.");
    } finally {
      setActioningId(null);
    }
  };

  const activeStops = stops.filter(
    (s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS"
  );
  const completedStops = stops.filter((s) => s.status === "COMPLETED");

  const totalCount = stops.length;
  const completedCount = completedStops.length;
  const remainingCount = activeStops.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Static distance/time metrics
  const totalDistanceKm = (totalCount * 2.8).toFixed(1);
  const estRemainingMins = remainingCount * 14;

  if (loading) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#151F32] border border-[#1E2D4A] text-slate-400 animate-pulse">
        Loading today's pastoral route...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TODAY'S MINISTRY SUMMARY CARD */}
      <div className="rounded-2xl bg-[#151F32] border border-[#1E2D4A] p-6 shadow-xl text-white space-y-5">
        <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-4">
          <div>
            <h2 className="text-lg font-black flex items-center gap-2 text-white">
              <Car className="text-blue-400" size={22} /> Today's Ministry Route
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs flex items-center gap-1.5">
            <Clock size={12} /> {remainingCount} Stops Remaining
          </span>
        </div>

        {/* 4 Stat Summary Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-[#0B1120] rounded-xl border border-[#1E2D4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Distance
            </span>
            <span className="text-xl font-black text-white">{totalDistanceKm} km</span>
          </div>

          <div className="p-3.5 bg-[#0B1120] rounded-xl border border-[#1E2D4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Est. Remaining
            </span>
            <span className="text-xl font-black text-blue-400">
              ~{estRemainingMins} min
            </span>
          </div>

          <div className="p-3.5 bg-[#0B1120] rounded-xl border border-[#1E2D4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed
            </span>
            <span className="text-xl font-black text-emerald-400">{completedCount}</span>
          </div>

          <div className="p-3.5 bg-[#0B1120] rounded-xl border border-[#1E2D4A]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Remaining
            </span>
            <span className="text-xl font-black text-amber-400">{remainingCount}</span>
          </div>
        </div>

        {/* ROUTE PROGRESS BAR */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Route Progress</span>
            <span className="text-emerald-400">
              {completedCount} / {totalCount} Visits Completed ({progressPct}%)
            </span>
          </div>
          <div className="w-full bg-[#0B1120] rounded-full h-3 overflow-hidden border border-[#1E2D4A]">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ACTIVE QUEUE */}
      {activeStops.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#151F32] border border-[#1E2D4A] text-slate-400 space-y-2">
          <Award size={32} className="mx-auto text-emerald-400" />
          <h3 className="font-bold text-white text-base">All Scheduled Visits Completed!</h3>
          <p className="text-xs text-slate-400">
            Great job pastor! Today's visitation route has been executed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Next Stop In Line
          </h3>

          {activeStops.map((stop, index) => {
            const isFirst = index === 0;
            const isInProgress = stop.status === "IN_PROGRESS";

            return (
              <div
                key={stop.scheduledVisitId}
                className={`rounded-2xl bg-[#151F32] border p-5 shadow-xl transition-all ${
                  isInProgress
                    ? "border-emerald-500/80 ring-2 ring-emerald-500/20"
                    : isFirst
                    ? "border-blue-500/50 ring-2 ring-blue-500/20"
                    : "border-[#1E2D4A] opacity-80"
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-md ${
                        isInProgress
                          ? "bg-emerald-600 text-white"
                          : isFirst
                          ? "bg-blue-600 text-white"
                          : "bg-[#0B1120] text-slate-400 border border-[#1E2D4A]"
                      }`}
                    >
                      #{stop.routeOrder}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">
                          {stop.firstName} {stop.lastName}
                        </h4>
                        {isInProgress ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-[9px]">
                            IN PROGRESS
                          </span>
                        ) : isFirst ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-extrabold text-[9px]">
                            NEXT UP
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 size={12} className="text-indigo-400" /> {stop.assembly}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-400" /> {stop.landmark}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (stop.phone) window.open(`tel:${stop.phone}`, "_self");
                        else toast.error("No phone number on record.");
                      }}
                      className="p-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 text-xs font-bold transition"
                    >
                      <Phone size={14} />
                    </button>

                    {/* Start/Continue Navigation */}
                    <button
                      onClick={() => handleStartStop(stop)}
                      disabled={actioningId === stop.scheduledVisitId}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                    >
                      <Navigation size={14} />
                      {isInProgress ? "Continue Navigation" : "Start Navigation"}
                    </button>

                    {/* Open Confirmation Modal */}
                    <button
                      onClick={() => {
                        setCompletingStop(stop);
                        setCompletionNotes(stop.notes || "");
                      }}
                      disabled={actioningId === stop.scheduledVisitId}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> Mark Complete
                    </button>

                    {/* Skip Stop */}
                    <button
                      onClick={() =>
                        handleSkipStop(stop.scheduledVisitId, `${stop.firstName} ${stop.lastName}`)
                      }
                      disabled={actioningId === stop.scheduledVisitId}
                      className="p-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] hover:bg-[#1E2D4A] text-slate-400 hover:text-white transition"
                      title="Skip Stop"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COLLAPSED COMPLETED TODAY */}
      {completedStops.length > 0 && (
        <div className="rounded-2xl bg-[#151F32] border border-[#1E2D4A] overflow-hidden shadow-lg">
          <button
            onClick={() => setShowCompletedList((prev) => !prev)}
            className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-[#1E2D4A]/50 transition"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Completed Today ({completedStops.length})
            </span>
            {showCompletedList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showCompletedList && (
            <div className="border-t border-[#1E2D4A] bg-[#0B1120]/50 p-4 space-y-2">
              {completedStops.map((stop) => (
                <div
                  key={stop.scheduledVisitId}
                  className="p-3 rounded-xl bg-[#151F32] border border-[#1E2D4A] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-black">✔</span>
                    <span className="font-bold text-white">
                      {stop.firstName} {stop.lastName}
                    </span>
                    <span className="text-slate-500">({stop.assembly})</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono">
                    {stop.completedAt
                      ? new Date(stop.completedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Completed"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL FOR COMPLETING VISIT */}
      {completingStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#151F32] border border-[#1E2D4A] rounded-2xl p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" size={18} /> Visit Completed?
              </h3>
              <button
                onClick={() => setCompletingStop(null)}
                className="p-1 rounded-lg hover:bg-[#1E2D4A] text-slate-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Log confidential pastoral observations for{" "}
              <strong className="text-white">
                {completingStop.firstName} {completingStop.lastName}
              </strong>
              .
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <FileText size={12} /> Pastoral Notes & Prayer Requests
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Enter pastoral observations, prayer points, or follow-up notes..."
                rows={4}
                className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCompletingStop(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-300 font-bold text-xs hover:bg-[#1E2D4A] transition"
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
                disabled={actioningId === completingStop.scheduledVisitId}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {actioningId === completingStop.scheduledVisitId
                  ? "Saving..."
                  : "Complete Visit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Navigation Modal */}
      {selectedMapMember && (
        <VisitationMapModal
          isOpen={!!selectedMapMember}
          onClose={() => setSelectedMapMember(null)}
          memberName={selectedMapMember.name}
          memberLat={selectedMapMember.lat}
          memberLng={selectedMapMember.lng}
        />
      )}
    </div>
  );
}