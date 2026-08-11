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
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // D. Automatically close mobile drawer when the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // 4. Reset drawer state when window resizes to desktop breakpoint (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading placeholder
  if (loading) {
    return <aside className="hidden md:block w-72 min-h-screen bg-[#0B1120] border-r border-[#1E2D4A]" />;
  }

  // Role-based navigation matrix
  const getNavItems = (role: UserRole | null): NavItem[] => {
    switch (role) {
      case "ADMIN":
        return [
          { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Users", href: "/admin/users", icon: ShieldCheck },
          { label: "Members", href: "/members", icon: Users },
          { label: "Locals", href: "/locals", icon: MapPin },
          { label: "Reports", href: "/reports", icon: FileText },
          { label: "Profile", href: "/profile", icon: UserIcon },
        ];
      case "PASTOR":
        return [
          { label: "Dashboard", href: "/pastor/dashboard", icon: LayoutDashboard },
          { label: "Pastoral Planner", href: "/pastor/planner", icon: Calendar },
          { label: "Members Directory", href: "/members", icon: Users },
          { label: "Visitations & Reports", href: "/reports", icon: FileText },
        ];
      case "ELDER":
        return [
          { label: "Dashboard", href: "/elder/dashboard", icon: LayoutDashboard },
          { label: "Members", href: "/members", icon: Users },
          { label: "Profile", href: "/profile", icon: UserIcon },
        ];
      case "DATA_OFFICER":
        return [
          { label: "Dashboard", href: "/data-officer/dashboard", icon: LayoutDashboard },
          { label: "Register Member", href: "/data-officer/members/register", icon: UserPlus },
          { label: "My Members", href: "/data-officer/members", icon: Users },
          { label: "Profile", href: "/profile", icon: UserIcon },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems((user?.role as UserRole) ?? null);

  // F. Robust full name fallback
  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || "User"
    : "User";

  // G. Robust initials generation
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
      {/* 📱 Mobile Top Header Toggle Bar (< 768px) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#1E2D4A] z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-[#151F32] border border-[#1E2D4A] text-white active:scale-95 transition"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* H. Clickable Brand Logo */}
          <Link href="/" className="font-black text-base text-blue-500 hover:text-blue-400 transition">
            Shepherd
          </Link>
        </div>
      </div>

      {/* 📱 Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 z-50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* 🖥️ Desktop Sticky Sidebar / 📱 Mobile Slide-in Drawer */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-[280px] max-w-[85vw] md:w-72 bg-[#0B1120] border-r border-[#1E2D4A] p-4 flex flex-col justify-between text-white select-none transition-transform duration-300 ease-in-out shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="px-3 pt-2 flex items-center justify-between">
            <div>
              {/* H. Clickable Brand Logo on Sidebar */}
              <Link
                href="/"
                className="font-black text-xl tracking-wider text-blue-500 hover:text-blue-400 transition flex items-center gap-2"
              >
                Shepherd
              </Link>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                Buoho District
              </p>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-[#151F32] text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Dynamic Authenticated User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-[#151F32] border border-[#1E2D4A] flex items-center gap-3">
            {user?.picture ? (
              <Image
                src={user.picture}
                alt={fullName}
                width={40}
                height={40}
                className="rounded-xl border border-blue-500/30 object-cover aspect-square"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-sm text-white shrink-0">
                {initials}
              </div>
            )}

            <div className="overflow-hidden space-y-0.5">
              <h4 className="font-bold text-xs text-white truncate">{fullName}</h4>
              <span className="inline-block text-[9px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                {user?.role ? user.role.replace("_", " ") : "GUEST"}
              </span>
            </div>
          </div>

          {/* E. Navigation Items with Active Route State */}
          <nav className="space-y-1">
            {navItems.map((item) => {
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
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:bg-[#151F32] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* I. Sign Out Button */}
        <div className="pt-4 border-t border-[#1E2D4A]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}