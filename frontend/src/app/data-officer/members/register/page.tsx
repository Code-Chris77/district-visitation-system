"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  UserPlus,
  MapPin,
  Save,
  ArrowLeft,
  ArrowRight,
  Navigation,
  RefreshCw,
  AlertTriangle,
  User,
  Phone,
  Check,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function NewMemberRegistrationPage() {
  const router = useRouter();
  const { user, localAssembly, localId } = useCurrentUser();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [standingAtResidence, setStandingAtResidence] = useState(false);

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
    error: string | null;
  }>({
    latitude: null,
    longitude: null,
    accuracy: null,
    capturedAt: null,
    loading: false,
    error: null,
  });

  const hasLocal = !!(localId || user?.localId || user?.local?.id);
  const assemblyName = localAssembly?.name || user?.local?.name || "Unassigned";

  // Auto-trigger GPS acquisition when Step 3 opens
  const autoCaptureGps = () => {
    if (!navigator.geolocation) {
      setGeoState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
        loading: false,
      }));
      return;
    }

    setGeoState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          capturedAt: new Date().toISOString(),
          loading: false,
          error: null,
        });
        toast.success("GPS Location Captured Successfully!");
      },
      (err) => {
        console.error("GPS Error:", err);
        setGeoState((prev) => ({
          ...prev,
          loading: false,
          error: "Permission denied or signal weak. Please enable location.",
        }));
        toast.error("Could not acquire location. Please grant permission.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  useEffect(() => {
    if (currentStep === 3 && !geoState.latitude && hasLocal) {
      autoCaptureGps();
    }
  }, [currentStep, hasLocal]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("Please enter First Name and Last Name.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.phone.trim()) {
        toast.error("Please enter a valid Phone Number.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!geoState.latitude || !geoState.longitude) {
        toast.error("GPS acquisition is required before proceeding.");
        return;
      }
      if (!standingAtResidence) {
        toast.error("Please confirm you are standing at the member's residence.");
        return;
      }
    }
    setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as any) : prev));
  };

  const handleSubmit = async () => {
    const targetLocalId = localId || user?.localId || user?.local?.id;

    if (!targetLocalId) {
      toast.error("Cannot proceed without an assigned Local Assembly.");
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
        latitude: geoState.latitude,
        longitude: geoState.longitude,
        accuracy: geoState.accuracy,
        localId: targetLocalId,
      };

      await api.post("/members", payload);
      toast.success("Member registered with verified GPS residence!");
      router.push("/data-officer/members");
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error(
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(", ")
          : err.response?.data?.message || "Failed to register member."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // 🔴 BLOCK 1: STRICTION UNASSIGNED LOCAL CHECK
  if (!hasLocal) {
    return (
      <DashboardLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#0B1120]">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#151F32] border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mx-auto border border-red-500/20">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-black text-white">
              You have not been assigned to a Local Assembly
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Please contact your <span className="text-white font-bold">District Administrator</span> to assign your account to an assembly before you can register members.
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push("/data-officer/dashboard")}
                className="w-full py-3 rounded-xl bg-[#1E2D4A] hover:bg-[#253759] text-white text-xs font-bold transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const mapPreviewUrl = `https://www.google.com/maps/search/?api=1&query=${geoState.latitude},${geoState.longitude}`;

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
              <UserPlus className="text-emerald-400" size={24} /> New Member Registration
            </h1>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <MapPin size={14} /> Local: {assemblyName}
          </div>
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="grid grid-cols-4 gap-2 border-b border-[#1E2D4A] pb-6">
          {[
            { step: 1, label: "Personal" },
            { step: 2, label: "Contact" },
            { step: 3, label: "GPS Location" },
            { step: 4, label: "Review & Save" },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;

            return (
              <div
                key={item.step}
                className={`p-3 rounded-xl border flex items-center gap-2 transition ${
                  isActive
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-[#151F32] border-[#1E2D4A] text-slate-500"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-[#0B1120] text-slate-400"
                  }`}
                >
                  {isDone ? <Check size={12} /> : item.step}
                </div>
                <span className="text-xs font-bold truncate hidden sm:inline">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-[#1E2D4A] pb-2 flex items-center gap-2">
              <User size={16} className="text-blue-400" /> Step 1: Personal Information
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
                  onChange={handleInputChange}
                  placeholder="e.g. Samuel"
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
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
                  onChange={handleInputChange}
                  placeholder="e.g. Mensah"
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-[#1E2D4A] pb-2 flex items-center gap-2">
              <Phone size={16} className="text-blue-400" /> Step 2: Contact Information
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
                  onChange={handleInputChange}
                  placeholder="e.g. 0240000000"
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="e.g. Near Water Tank, Behind Lorry Station"
                  className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: AUTOMATED GPS CAPTURE */}
        {currentStep === 3 && (
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-5">
            <h3 className="font-bold text-sm text-white border-b border-[#1E2D4A] pb-2 flex items-center gap-2">
              <Navigation size={16} className="text-blue-400" /> Step 3: Location Acquisition
            </h3>

            {geoState.loading ? (
              <div className="p-8 rounded-xl bg-[#0B1120] border border-blue-500/20 text-center space-y-3 animate-pulse">
                <RefreshCw size={24} className="animate-spin text-blue-400 mx-auto" />
                <p className="text-xs font-bold text-white">Detecting current location...</p>
                <p className="text-[11px] text-slate-400">Please accept browser location permissions if prompted.</p>
              </div>
            ) : geoState.latitude ? (
              /* Residence Verified Card */
              <div className="p-5 rounded-2xl bg-[#0B1120] border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                    <h4 className="font-bold text-emerald-400 text-sm">📍 Residence Verified</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    🟢 GPS Captured
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#151F32] border border-[#1E2D4A]">
                    <span className="text-slate-400 block text-[10px] uppercase">Captured At</span>
                    <span className="font-bold text-white text-[11px]">
                      {new Date(geoState.capturedAt!).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#151F32] border border-[#1E2D4A]">
                    <span className="text-slate-400 block text-[10px] uppercase">GPS Precision</span>
                    <span className="font-bold text-emerald-400 text-[11px]">
                      ±{Math.round(geoState.accuracy || 0)} meters
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={autoCaptureGps}
                    className="flex-1 py-2.5 rounded-xl bg-[#151F32] border border-[#1E2D4A] hover:bg-[#1E2D4A] text-xs font-bold text-slate-300 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={12} /> Recapture Location
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
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
                <AlertTriangle size={24} className="text-red-400 mx-auto" />
                <p className="text-xs font-bold text-red-400">{geoState.error || "Location capture failed."}</p>
                <button
                  type="button"
                  onClick={autoCaptureGps}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
                >
                  Retry Location Access
                </button>
              </div>
            )}

            {/* Standing at Residence Confirmation Toggle */}
            <div className="p-4 rounded-xl bg-[#0B1120] border border-[#1E2D4A] space-y-2">
              <p className="text-xs font-bold text-slate-300">
                Are you currently standing at the member's residence? <span className="text-red-400">*</span>
              </p>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                  <input
                    type="radio"
                    name="residenceConfirm"
                    checked={standingAtResidence === true}
                    onChange={() => setStandingAtResidence(true)}
                    className="accent-emerald-500"
                  />
                  ( ) Yes
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-400">
                  <input
                    type="radio"
                    name="residenceConfirm"
                    checked={standingAtResidence === false}
                    onChange={() => setStandingAtResidence(false)}
                    className="accent-emerald-500"
                  />
                  ( ) No
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-4">
            <h3 className="font-bold text-sm text-white border-b border-[#1E2D4A] pb-2 flex items-center gap-2">
              <Save size={16} className="text-emerald-400" /> Step 4: Review & Save
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A] flex justify-between">
                <span className="text-slate-400">Full Name</span>
                <span className="font-bold text-white">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A] flex justify-between">
                <span className="text-slate-400">Gender</span>
                <span className="font-bold text-white">{formData.gender}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A] flex justify-between">
                <span className="text-slate-400">Phone Number</span>
                <span className="font-bold text-white">{formData.phone}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A] flex justify-between">
                <span className="text-slate-400">Landmark</span>
                <span className="font-bold text-white">{formData.landmark || "N/A"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A] flex justify-between">
                <span className="text-slate-400">Assigned Local</span>
                <span className="font-bold text-emerald-400">{assemblyName}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A] flex justify-between">
                <span className="text-slate-400">GPS Accuracy</span>
                <span className="font-bold text-emerald-400">±{Math.round(geoState.accuracy || 0)} m</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-between items-center pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
              className="px-5 py-2.5 rounded-xl border border-[#1E2D4A] text-xs font-bold text-slate-300 hover:bg-[#151F32] transition flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Previous
            </button>
          ) : <div />}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              Next Step <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {submitting ? "Saving Member..." : "Confirm & Save Member"}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}