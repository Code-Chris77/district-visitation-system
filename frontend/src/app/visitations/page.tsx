"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddVisitationDialog from "@/features/visitations/components/AddVisitationDialog";
import VisitationMapModal from "@/components/visitations/VisitationMapModal";
import { VisitationService } from "@/features/visitations/services/visitation.service";
import { Visitation } from "@/features/visitations/types/visitation.types";
import { Navigation, Phone, CheckCircle2, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function VisitationsPage() {
  const [visitations, setVisitations] = useState<Visitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Map Preview
  const [selectedMapMember, setSelectedMapMember] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const data = await VisitationService.getAll();
      setVisitations(data);
    } catch (error) {
      console.error("Failed to load visitations:", error);
      toast.error("Failed to fetch visitation queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const openPhoneCall = (phone?: string | null) => {
    if (!phone) return toast.error("Phone number not on record.");
    window.open(`tel:${phone}`, "_self");
  };

  // Open Map Preview Modal with Member Details
  const handleOpenMap = (visit: Visitation) => {
    const name = visit.member
      ? `${visit.member.firstName} ${visit.member.lastName}`
      : "Member Visit";

    // Use GPS coordinates if available on the member record, else default to Kumasi scope
    const lat = (visit.member as any)?.latitude || 6.6885;
    const lng = (visit.member as any)?.longitude || -1.6244;

    setSelectedMapMember({
      name,
      lat,
      lng,
    });
  };

  const handleMarkComplete = async (id: string) => {
    try {
      await VisitationService.update(id, { status: "COMPLETED" });
      toast.success("Visit marked as Completed!");
      await reload();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today's Visitation Queue</h1>
            <p className="text-sm text-gray-500">Execute pastoral visits, navigate, call, and log outcomes.</p>
          </div>
          <AddVisitationDialog reload={reload} />
        </div>

        {/* Action Cards Queue */}
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading daily queue...</div>
        ) : visitations.length === 0 ? (
          <div className="p-12 text-center rounded-xl border bg-white text-gray-500">
            No visits queued for today. Click "Log New Visit" to add one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visitations.map((visit) => {
              const memberName = visit.member
                ? `${visit.member.firstName} ${visit.member.lastName}`
                : "Member Visit";
              const isCompleted = visit.status === "COMPLETED";

              return (
                <div
                  key={visit.id}
                  className={`rounded-xl border p-5 shadow-sm bg-white space-y-4 transition ${
                    isCompleted ? "border-green-300 bg-green-50/20" : "hover:border-blue-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{memberName}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {visit.member?.address || "Address pending"}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        isCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {visit.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border">
                    <p className="font-semibold text-gray-800">Purpose: {visit.purpose}</p>
                    {visit.notes && <p className="italic">"{visit.notes}"</p>}
                    <p className="flex items-center gap-1 pt-1 text-gray-500">
                      <Calendar size={12} /> Date: {new Date(visit.visitDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleOpenMap(visit)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Navigation size={14} className="text-blue-600" /> Navigate
                    </button>

                    <button
                      onClick={() => openPhoneCall(visit.member?.phone)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Phone size={14} className="text-green-600" /> Call
                    </button>

                    {!isCompleted && (
                      <button
                        onClick={() => handleMarkComplete(visit.id)}
                        className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Complete Visit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Turn-by-Turn Route Preview Modal */}
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