"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Edit2,
  Save,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function ProfilePage() {
  const { user, loading, updateUserData } = useAuth();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setPhoneInput(user.phone);
    }
  }, [user]);

  // 📱 UPDATED PHONE SAVE HANDLER
  const handleSavePhone = async () => {
    if (!phoneInput.trim()) {
      toast.error("Phone contact cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      await api.patch("/users/profile/phone", {
        phone: phoneInput.trim(),
      });

      // Get fresh user from database
      const refreshed = await api.get("/users/me");

      if (updateUserData) {
        updateUserData(refreshed.data);
      }

      toast.success("Phone number updated successfully!");
      setIsEditingPhone(false);
    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message ??
          "Could not update phone number."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-xs font-semibold">
          Loading user profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-[#1E2D4A] pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <User className="text-blue-400" size={24} />
            User Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View your personal credentials, assigned role, and manage your contact details.
          </p>
        </div>

        {/* Main Profile Info Card */}
        <div className="bg-[#151F32] border border-[#1E2D4A] rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Avatar & Role Header */}
          <div className="flex items-center gap-4 border-b border-[#1E2D4A] pb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                  {user?.role || "USER"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                  <ShieldCheck size={11} /> {user?.status || "APPROVED"}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Email Address (Read Only) */}
            <div className="p-4 bg-[#0B1120] rounded-xl border border-[#1E2D4A] space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Mail size={14} className="text-blue-400 shrink-0" /> Email Address
              </div>
              <div className="text-white font-bold text-sm truncate">
                {user?.email || "N/A"}
              </div>
            </div>

            {/* Editable Phone Contact */}
            <div className="p-4 bg-[#0B1120] rounded-xl border border-[#1E2D4A] space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-400 shrink-0" /> Phone Contact
                </div>
                {!isEditingPhone && (
                  <button
                    onClick={() => {
                      setPhoneInput(user?.phone || "");
                      setIsEditingPhone(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                )}
              </div>

              {isEditingPhone ? (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Enter new phone contact..."
                    className="w-full rounded-xl border border-blue-500/50 bg-[#151F32] px-3 py-2 text-xs text-white focus:outline-none font-bold"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsEditingPhone(false)}
                      className="px-3 py-1.5 rounded-lg border border-[#1E2D4A] text-slate-400 hover:text-white font-bold text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePhone}
                      disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={12} /> Save Number
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-white font-bold text-sm">
                  {user?.phone || "No phone contact set"}
                </div>
              )}
            </div>

            {/* Assigned Local Scope */}
            <div className="p-4 bg-[#0B1120] rounded-xl border border-[#1E2D4A] space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-400 shrink-0" /> Assigned Local Assembly
              </div>
              <div className="text-white font-bold text-sm">
                {user?.local?.name || "District Level Scope"}
              </div>
            </div>

            {/* Account Status */}
            <div className="p-4 bg-[#0B1120] rounded-xl border border-[#1E2D4A] space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" /> Account Status
              </div>
              <div className="text-emerald-400 font-bold text-sm uppercase">
                {user?.status || "APPROVED"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}