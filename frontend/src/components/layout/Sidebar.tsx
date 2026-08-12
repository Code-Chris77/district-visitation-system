"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, type UserRole } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  MapPin,
  ShieldCheck,
  UserPlus,
  LogOut,
  User as UserIcon,
  FileText,
  Calendar,
  Menu,
  ChevronLeft,
  CheckSquare,
  MessageSquare,
  GraduationCap,
  Building2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Reset drawer state when window resizes to desktop (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return <aside className="hidden md:block w-72 min-h-screen bg-[#0B1120] border-r border-[#1E2D4A]" />;
  }

  // Role-based navigation matrix with custom color accents for each item
  const getNavItems = (role: UserRole | null): NavItem[] => {
    switch (role) {
      case "ADMIN":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/15" },
          { label: "Users & Security", href: "/admin/users", icon: ShieldCheck, colorClass: "text-rose-400", bgClass: "bg-rose-500/15" },
          { label: "Members Directory", href: "/members", icon: Users, colorClass: "text-amber-400", bgClass: "bg-amber-500/15" },
          { label: "Local Assemblies", href: "/locals", icon: MapPin, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/15" },
          { label: "Reports & Analytics", href: "/reports", icon: FileText, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/15" },
        ];
      case "PASTOR":
        return [
          { label: "Dashboard", href: "/pastor/dashboard", icon: LayoutDashboard, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/15" },
          { label: "Pastoral Planner", href: "/pastor/planner", icon: Calendar, colorClass: "text-amber-400", bgClass: "bg-amber-500/15" },
          { label: "Members Directory", href: "/members", icon: Users, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/15" },
          { label: "Visitations & Reports", href: "/reports", icon: FileText, colorClass: "text-cyan-400", bgClass: "bg-cyan-500/15" },
        ];
      case "ELDER":
        return [
          { label: "Dashboard", href: "/elder/dashboard", icon: LayoutDashboard, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/15" },
          { label: "Assembly Roster", href: "/members", icon: Users, colorClass: "text-amber-400", bgClass: "bg-amber-500/15" },
          { label: "My Profile", href: "/profile", icon: UserIcon, colorClass: "text-purple-400", bgClass: "bg-purple-500/15" },
        ];
      case "DATA_OFFICER":
        return [
          { label: "Dashboard", href: "/data-officer/dashboard", icon: LayoutDashboard, colorClass: "text-indigo-400", bgClass: "bg-indigo-500/15" },
          { label: "Register Member", href: "/data-officer/members/register", icon: UserPlus, colorClass: "text-emerald-400", bgClass: "bg-emerald-500/15" },
          { label: "My Registered Members", href: "/data-officer/members", icon: Users, colorClass: "text-amber-400", bgClass: "bg-amber-500/15" },
          { label: "My Profile", href: "/profile", icon: UserIcon, colorClass: "text-purple-400", bgClass: "bg-purple-500/15" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems((user?.role as UserRole) ?? null);

  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "User";

  const firstNameOnly = user?.firstName || "User";

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <>
      {/* 📱 Mobile Top Navigation Header (< 768px) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#1E2D4A] z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-xl bg-[#151F32] border border-[#1E2D4A] text-white active:scale-95 transition"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="font-black text-lg text-blue-500">
            Shepherd
          </Link>
        </div>

        <Link href="/profile" className="flex items-center gap-2">
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={fullName}
              width={34}
              height={34}
              className="rounded-full ring-2 ring-blue-500/50 object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/50">
              {initials}
            </div>
          )}
        </Link>
      </div>

      {/* 📱 Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 z-50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 🖥️ Desktop Sticky Sidebar / 📱 Mobile Slide-in Drawer */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-[290px] max-w-[85vw] md:w-72 bg-[#0B1120] border-r border-[#1E2D4A]/80 p-5 flex flex-col justify-between text-white select-none transition-transform duration-300 ease-in-out shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* 1. TOP PROFILE HEADER (Matches exact layout in image) */}
          <div className="flex items-center gap-3.5 pt-2">
            <Link href="/profile" className="relative shrink-0">
              {user?.picture ? (
                <Image
                  src={user.picture}
                  alt={fullName}
                  width={52}
                  height={52}
                  className="rounded-full ring-2 ring-blue-500 object-cover aspect-square"
                />
              ) : (
                <div className="h-13 w-13 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center ring-2 ring-blue-500">
                  {initials}
                </div>
              )}
            </Link>

            <div className="overflow-hidden space-y-0.5">
              <h3 className="font-bold text-base text-white truncate leading-tight">
                {firstNameOnly}
              </h3>
              <Link
                href="/profile"
                className="text-xs text-slate-400 hover:text-blue-400 transition block font-medium"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* 2. NAVIGATION MATRIX WITH ROUNDED COLOR ICON SQUARES */}
          <nav className="space-y-2 pt-2">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  pathname.startsWith(item.href) &&
                  !navItems.some(
                    (other) =>
                      other.href !== item.href &&
                      other.href.length > item.href.length &&
                      pathname.startsWith(other.href)
                  ));

              return (
                <div key={item.href}>
                  {/* Divider line before lower menu tier */}
                  {index === 3 && (
                    <div className="my-3 border-t border-[#1E2D4A]/60" />
                  )}

                  <Link
                    href={item.href}
                    className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all ${
                      isActive
                        ? "bg-[#151F32] border border-[#1E2D4A] shadow-md"
                        : "hover:bg-[#151F32]/60"
                    }`}
                  >
                    {/* Color Accent Icon Box */}
                    <div
                      className={`h-10 w-10 rounded-xl ${item.bgClass} ${item.colorClass} flex items-center justify-center shrink-0 shadow-inner`}
                    >
                      <Icon size={20} />
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        isActive ? `${item.colorClass}` : "text-slate-300"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* 3. BOTTOM ACTIONS (Close Menu / Sign Out) */}
        <div className="pt-4 border-t border-[#1E2D4A]/80 space-y-2">
          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <ChevronLeft size={16} /> Close Menu
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-98 transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}