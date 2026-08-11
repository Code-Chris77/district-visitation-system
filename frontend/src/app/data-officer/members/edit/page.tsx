"use client";

export const dynamic = "force-dynamic";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Pencil,
  MapPin,
  Save,
  ArrowLeft,
  Navigation,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

function EditMemberContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");
  const { localAssembly, user } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "MALE",
    landmark: "",
  });

  const [geoState, setGeoState] = useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    capturedAt: string | null;
    loading: boolean;
  }>({
    latitude: null,
    longitude: null,
    accuracy: null,
    capturedAt: null,
    loading: false,
  });

  // Load existing member details
  useEffect(() => {
    async function loadMember() {
      if (!memberId) return;

      try {
        setLoading(true);
        const res = await api.get(`/members/${memberId}`);
        const data = res.data;

        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          gender: data.gender || "MALE",
          landmark: data.landmark || data.residence || "",
        });

        if (data.latitude !== undefined && data.longitude !== undefined) {
          setGeoState({
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy || null,
            capturedAt:
              data.capturedAt || data.updatedAt || new Date().toISOString(),
            loading: false,
          });
        }
      } catch (err: any) {
        console.error("Failed to load member:", err);
        const errorMsg =
          err.response?.status === 403
            ? "Access denied: You cannot edit members outside your assigned local assembly."
            : "Could not load member details.";
        toast.error(errorMsg);
        router.push("/data-officer/members");
      } finally {
        setLoading(false);
      }
    }

    loadMember();
  }, [memberId, router]);

  // High-accuracy Re-detect GPS Location Handler
  const handleRecaptureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setGeoState((prev) => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
          loading: false,
        });
        toast.success("GPS location updated successfully!");
      },
      (error) => {
        console.error("GPS Error:", error);
        setGeoState((prev) => ({ ...prev, loading: false }));
        toast.error(
          "Failed to acquire location. Ensure GPS/permissions are enabled."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error("Please fill in First Name, Last Name, and Phone Number.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        landmark: formData.landmark || undefined,
        residence: formData.landmark || undefined,
        latitude: geoState.latitude ?? undefined,
        longitude: geoState.longitude ?? undefined,
        accuracy: geoState.accuracy ?? undefined,
        // 🕒 2. INCLUDED CAPTURED AT TIMESTAMP
        capturedAt: geoState.capturedAt ?? undefined,
      };

      await api.patch(`/members/${memberId}`, payload);
      toast.success("Member details updated successfully!");
      router.push("/data-officer/members");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(", ")
          : err.response?.data?.message || "Failed to update member."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const assemblyName =
    localAssembly?.name || user?.local?.name || "Assigned Local";

  // 🗺️ 3. OPTIMIZED DIRECT GOOGLE MAPS LINK
  const mapPreviewUrl = geoState.latitude
    ? `https://www.google.com/maps?q=${geoState.latitude},${geoState.longitude}`
    : "#";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-400 font-semibold">
          Loading member profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-4">
          <div className="space-y-1">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition mb-1"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Pencil className="text-blue-400" size={24} /> Edit Member Information
            </h1>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold flex items-center gap-2">
            <MapPin size={14} /> Local: {assemblyName}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white border-b border-[#1E2D4A] pb-2 flex items-center gap-2">
              <User size={16} className="text-blue-400" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information & Landmark */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white border-b border-[#1E2D4A] pb-2 flex items-center gap-2">
              <Phone size={16} className="text-blue-400" /> Contact Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Landmark / Residence (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  placeholder="e.g. Near Water Tank, Behind Lorry Station"
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* GPS Residence Status Card */}
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white border-b border-[#1E2D4A] pb-2 flex items-center gap-2">
              <Navigation size={16} className="text-emerald-400" /> Location Status
            </h3>

            {geoState.loading ? (
              <div className="p-6 rounded-xl bg-[#0B1120] border border-blue-500/20 text-center space-y-2 animate-pulse">
                <RefreshCw
                  size={20}
                  className="animate-spin text-blue-400 mx-auto"
                />
                <p className="text-xs font-bold text-white">
                  Re-detecting location...
                </p>
              </div>
            ) : geoState.latitude ? (
              <div className="p-5 rounded-2xl bg-[#0B1120] border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h4 className="font-bold text-emerald-400 text-xs">
                      🟢 Residence Verified
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={12} /> GPS Recorded
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#151F32] border border-[#1E2D4A]">
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Captured At
                    </span>
                    <span className="font-bold text-white text-[11px]">
                      {geoState.capturedAt
                        ? new Date(geoState.capturedAt).toLocaleString()
                        : "Recently Recorded"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#151F32] border border-[#1E2D4A]">
                    <span className="text-slate-400 block text-[10px] uppercase">
                      Accuracy
                    </span>
                    <span className="font-bold text-emerald-400 text-[11px]">
                      {geoState.accuracy
                        ? `±${Math.round(geoState.accuracy)} m`
                        : "Standard Precision"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRecaptureLocation}
                    disabled={geoState.loading}
                    className="flex-1 py-2.5 rounded-xl bg-[#151F32] border border-[#1E2D4A] hover:bg-[#1E2D4A] text-xs font-bold text-slate-300 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw
                      size={12}
                      className={geoState.loading ? "animate-spin" : ""}
                    />
                    Recapture Location
                  </button>
                  <a
                    href={mapPreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-bold text-blue-400 transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={12} /> View on Map
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <AlertCircle size={16} /> 🔴 Residence Not Verified (No GPS)
                </span>
                <button
                  type="button"
                  onClick={handleRecaptureLocation}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition"
                >
                  Capture GPS Now
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-[#1E2D4A] text-xs font-bold text-slate-400 hover:bg-[#151F32] hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {submitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function EditMemberPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="p-12 text-center text-white">
            Loading...
          </div>
        </DashboardLayout>
      }
    >
      <EditMemberContent />
    </Suspense>
  );
}