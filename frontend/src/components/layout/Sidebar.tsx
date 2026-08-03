"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  MapPin,
  ClipboardList,
  ShieldCheck,
  UserPlus,
  LogOut,
  User as UserIcon,
  FileText,
  Map,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  // 8. Show loading placeholder
  if (loading) {
    return <aside className="w-64 min-h-screen bg-[#0B1120] border-r border-[#1E2D4A]" />;
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
          { label: "Members", href: "/members", icon: Users },
          { label: "Visitations & Reports", href: "/pastor/visits", icon: FileText },
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

  const navItems = getNavItems(user?.role ?? null);
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "User";

  // 9. Dynamic Initials Fallback
  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : "U";

  // 10. Explicit Logout Handler
  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-[#1E2D4A] p-4 flex flex-col justify-between min-h-screen text-white select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-3 pt-2">
          <div className="font-black text-xl tracking-wider text-blue-500 flex items-center gap-2">
            Shepherd
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
            Buoho District
          </p>
        </div>

        {/* Dynamic Authenticated User Profile Card */}
        <div className="p-3 rounded-2xl bg-[#151F32] border border-[#1E2D4A] flex items-center gap-3">
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={fullName}
              width={40}
              height={40}
              className="rounded-xl border border-blue-500/30 object-cover aspect-square"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-sm text-white">
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

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            
           // Active route calculation
const isActive =
  pathname === item.href ||
  (item.href !== "/" &&
    pathname.startsWith(item.href) &&
    !navItems.some(
      (other) => other.href !== item.href && other.href.length > item.href.length && pathname.startsWith(other.href)
    ));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-[#151F32] hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sign Out Button */}
      <div className="pt-4 border-t border-[#1E2D4A]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}