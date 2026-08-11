"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VisitationMapModal from "@/components/visitations/VisitationMapModal";
import {
  FileText,
  Phone,
  Navigation,
  ChevronDown,
  ChevronUp,
  Calendar,
  UserCheck,
  Search,
  Eye,
  EyeOff,
  History,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

// Improved Pastoral Note Interface
interface PastoralNote {
  id: string;
  visitDate: string;
  notes?: string;
  purpose?: string;
  pastor?: {
    firstName: string;
    lastName: string;
  };
}

interface MemberVisitsReport {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  visitCount: number;
  firstVisitDate?: string;
  lastVisitDate?: string;
  notes: PastoralNote[];
}

export default function PastorVisitsPage() {
  const [reports, setReports] = useState<MemberVisitsReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Expandable Timeline State
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Map Modal State for "Re-visit & Route"
  const [selectedMapMember, setSelectedMapMember] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Dedicated endpoint for Visit Reports
      const res = await api.get("/visits/reports");
      setReports(res.data);
    } catch (err: any) {
      console.error("Failed to fetch visitation reports:", err);
      // Enhanced Error Refinement
      const errorMessage =
        err.response?.data?.message || "Could not load visitation history.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleReportVisibility = (memberId: string) => {
    setExpandedMemberId((prev) => (prev === memberId ? null : memberId));
  };

  const handlePhoneCall = (phone?: string) => {
    if (!phone) return toast.error("No phone contact on record.");
    window.open(`tel:${phone}`, "_self");
  };

  const handleOpenMap = (member: MemberVisitsReport) => {
    const lat = member.latitude || 6.6885;
    const lng = member.longitude || -1.6244;
    setSelectedMapMember({
      name: `${member.firstName} ${member.lastName}`,
      lat,
      lng,
    });
  };

  // Dynamic Visit Count Badge Colors
  const renderVisitBadge = (count: number) => {
    if (count === 1) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
          🟢 New Visit (1 Visit)
        </span>
      );
    }
    if (count <= 3) {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] inline-flex items-center gap-1">
          🔵 Active Care ({count} Visits)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[10px] inline-flex items-center gap-1">
        🟣 Frequent Care ({count} Visits)
      </span>
    );
  };

  const filteredReports = reports.filter((r) => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
    const query = search.toLowerCase();
    return (
      fullName.includes(query) ||
      r.phone?.toLowerCase().includes(query) ||
      r.location?.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-[#1E2D4A] pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <History className="text-blue-400" size={24} />
              Pastoral Visit History & Timelines
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review historical visitation timelines, minister observations, and follow-up schedules.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report timeline by member name, phone, or local area..."
            className="w-full rounded-2xl border border-[#1E2D4A] bg-[#151F32] pl-11 pr-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none font-medium shadow-inner"
          />
        </div>

        {/* Reports Grid */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading pastoral care journal...</div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#151F32] border border-[#1E2D4A] text-slate-400">
              No visitation history found matching search query.
            </div>
          ) : (
            filteredReports.map((member) => {
              const isExpanded = expandedMemberId === member.id;

              return (
                <div
                  key={member.id}
                  className="rounded-2xl bg-[#151F32] border border-[#1E2D4A] overflow-hidden shadow-xl transition-all"
                >
                  {/* Summary Bar */}
                  <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md">
                        {member.firstName?.[0]}
                        {member.lastName?.[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-white">
                            {member.firstName} {member.lastName}
                          </h3>
                          {renderVisitBadge(member.visitCount)}
                        </div>

                        {/* First and Last Visit Audit Counters */}
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-1">
                          {member.firstVisitDate && (
                            <span>
                              First Visit:{" "}
                              <strong className="text-slate-200">
                                {new Date(member.firstVisitDate).toLocaleDateString()}
                              </strong>
                            </span>
                          )}
                          {member.lastVisitDate && (
                            <span>
                              Last Visit:{" "}
                              <strong className="text-blue-400">
                                {new Date(member.lastVisitDate).toLocaleDateString()}
                              </strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePhoneCall(member.phone)}
                        className="px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <Phone size={14} /> Call Member
                      </button>

                      <button
                        onClick={() => toggleReportVisibility(member.id)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                          isExpanded
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "bg-[#0B1120] border border-[#1E2D4A] text-slate-300 hover:text-white hover:bg-[#1E2D4A]"
                        }`}
                      >
                        {isExpanded ? (
                          <>
                            <EyeOff size={14} /> Hide Timeline
                            <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            <Eye size={14} /> View Timeline ({member.notes?.length || 0})
                            <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Chronological Visit Timeline Section */}
                  {isExpanded && (
                    <div className="border-t border-[#1E2D4A] bg-[#0B1120]/70 p-5 space-y-4 transition-all">
                      {/* Top Timeline Bar with Re-visit Option */}
                      <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Clock size={14} className="text-blue-400" /> Chronological Pastoral Journal
                        </h4>

                        <button
                          onClick={() => handleOpenMap(member)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs hover:bg-blue-600/30 transition flex items-center gap-1.5"
                        >
                          <Navigation size={13} /> Re-visit & Route
                        </button>
                      </div>

                      {/* Empty State or Timeline List */}
                      {!member.notes || member.notes.length === 0 ? (
                        <div className="p-4 rounded-xl bg-[#151F32] border border-[#1E2D4A] text-xs text-slate-400 space-y-1">
                          <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                            ✓ Member has been visited.
                          </p>
                          <p className="text-slate-400">
                            No additional pastoral observations or notes were recorded during previous visits.
                          </p>
                        </div>
                      ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 font-medium before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1E2D4A]">
                          {member.notes.map((note) => {
                            const pastorName = note.pastor
                              ? `Pr. ${note.pastor.firstName} ${note.pastor.lastName}`
                              : "District Pastoral Team";

                            return (
                              <div key={note.id} className="relative space-y-2">
                                {/* Timeline Dot */}
                                <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-[#0B1120]" />

                                <div className="p-4 rounded-xl bg-[#151F32] border border-[#1E2D4A] space-y-2 shadow-md">
                                  <div className="flex items-center justify-between text-xs border-b border-[#1E2D4A]/50 pb-2">
                                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                                      <Calendar size={13} />
                                      {new Date(note.visitDate).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                    <span className="text-slate-400 text-[11px] font-semibold">
                                      By {pastorName}
                                    </span>
                                  </div>

                                  {note.purpose && (
                                    <p className="text-[11px] text-slate-400 font-semibold">
                                      Purpose: <span className="text-slate-200">{note.purpose}</span>
                                    </p>
                                  )}

                                  {note.notes && (
                                    <p className="text-xs text-slate-200 font-medium leading-relaxed italic bg-[#0B1120]/50 p-2.5 rounded-lg border border-[#1E2D4A]">
                                      "{note.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Map Routing Modal */}
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
    </DashboardLayout>
  );
}