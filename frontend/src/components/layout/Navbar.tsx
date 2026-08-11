"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Search, Bell, LogOut, ShieldCheck, MapPin, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "User";

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.info(`Searching for "${searchQuery}"...`);
    router.push(`/members?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="relative flex h-16 w-full items-center justify-between border-b border-[#1E2D4A] bg-[#0B1120] px-6 text-white shadow-md z-40">
      {/* Global Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-72 md:w-96">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search members, Locals..."
  className="w-full rounded-xl border border-[#1E2D4A] bg-[#151F32] py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
/>
      </form>

      {/* Right Toolbar */}
      <div className="flex items-center gap-3 relative">
        {/* Scope Indicator Badge */}
<div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151F32] border border-[#1E2D4A] text-slate-300 text-xs font-bold">
  <MapPin size={13} className="text-blue-400" />
  <span>
    {user?.role === "PASTOR" && !user?.local
      ? "District Scope"
      : user?.local?.name || "Unassigned Scope"}
  </span>
</div>
        )

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#1E2D4A] bg-[#151F32] text-slate-300 transition hover:bg-[#1E2D4A] hover:text-white ${
              showNotifications ? "border-blue-500 text-white bg-[#1E2D4A]" : ""
            }`}
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-[#1E2D4A] bg-[#151F32] p-4 shadow-2xl z-50 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Bell size={14} className="text-blue-400" /> System Notifications
                </h4>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-300 text-[11px] space-y-1">
                <p className="font-bold text-white flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-400" /> Authenticated Session
                </p>
                <p>Logged in as <span className="text-blue-400 font-bold">{fullName}</span> ({user?.role})</p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-xs text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 border border-blue-400/30 overflow-hidden ${
              showProfileMenu ? "ring-2 ring-blue-400" : ""
            }`}
          >
            {user?.picture ? (
              <Image
                src={user.picture}
                alt={fullName}
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            ) : (
              getInitials(fullName)
            )}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-[#1E2D4A] bg-[#151F32] p-3 shadow-2xl z-50 text-xs space-y-3">
              <div className="p-2.5 rounded-xl bg-[#0B1120] border border-[#1E2D4A] flex items-center gap-3">
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt={fullName}
                    width={32}
                    height={32}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                    <UserIcon size={14} />
                  </div>
                )}
                <div className="overflow-hidden space-y-0.5">
                  <p className="font-bold text-white truncate">{fullName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E2D4A]">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}