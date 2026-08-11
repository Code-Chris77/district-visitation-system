"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  UserX,
  UserCheck,
  Building2,
  ShieldAlert,
  Phone,
  Mail,
  RefreshCw,
  UserCog,
  X,
  Clock,
  Check,
  Ban,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface LocalAssembly {
  id: string;
  name: string;
  code: string;
}

interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  picture?: string;
  role: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "DISABLED";
  isActive?: boolean;
  localId?: string;
  local?: LocalAssembly;
  lastLogin?: string;
  createdAt?: string;
}

type SortOption = "NEWEST" | "OLDEST" | "ALPHABETICAL" | "LAST_LOGIN";

function formatLastLogin(dateString?: string) {
  if (!dateString) return "Never";
  const loginDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - loginDate.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return loginDate.toLocaleDateString();
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [locals, setLocals] = useState<LocalAssembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");

  // Status Filter Tabs
  const [statusTab, setStatusTab] = useState<
    "ALL" | "ACTIVE" | "PENDING" | "DISABLED" | "REJECTED"
  >("ALL");

  // Modal State
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [modalRole, setModalRole] = useState<string>("DATA_OFFICER");
  const [modalLocalId, setModalLocalId] = useState<string>("");
  const [modalPhone, setModalPhone] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, localsRes] = await Promise.all([
        api.get("/users"),
        api.get("/locals"),
      ]);
      setUsers(usersRes.data);
      setLocals(localsRes.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Could not load user accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🎨 Role Badge Color Helper
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px] tracking-wider uppercase">
            ADMIN
          </span>
        );
      case "PASTOR":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[10px] tracking-wider uppercase">
            PASTOR
          </span>
        );
      case "ELDER":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] tracking-wider uppercase">
            ELDER
          </span>
        );
      case "DATA_OFFICER":
        return (
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] tracking-wider uppercase">
            DATA OFFICER
          </span>
        );
      case "UNASSIGNED":
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Awaiting Assignment
          </span>
        );
    }
  };

  const handleOpenReassignModal = (user: UserAccount) => {
    setSelectedUser(user);
    setModalRole(
      user.role === "UNASSIGNED" ? "DATA_OFFICER" : user.role || "DATA_OFFICER"
    );
    setModalLocalId(user.localId || user.local?.id || "");
    setModalPhone(user.phone || "");
  };

  // 3. Save Reassignment with Phone Validation & Double-click Protection
  const handleSaveReassignment = async () => {
    if (!selectedUser || submitting) return;

    // Phone format validation
    if (modalPhone.trim() && modalPhone.trim().length < 8) {
      toast.error("Please enter a valid phone number (at least 8 digits).");
      return;
    }

    try {
      setSubmitting(true);
      const targetLocal = locals.find((l) => l.id === modalLocalId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                role: modalRole,
                status: "APPROVED",
                isActive: true,
                phone: modalPhone,
                localId: modalLocalId || undefined,
                local: targetLocal || undefined,
              }
            : u
        )
      );

      await api.patch(`/users/${selectedUser.id}/approve`, {
        role: modalRole,
        localId: modalLocalId || null,
        phone: modalPhone,
      });

      toast.success(
        `User ${selectedUser.firstName} ${selectedUser.lastName} updated and approved successfully!`
      );
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to reassign user:", err);
      toast.error("Could not update user details.");
      fetchData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickApprove = (user: UserAccount) => {
    handleOpenReassignModal(user);
  };

  // 1 & 8. Accept Previously Rejected User with Direct Patch & Payload
  const handleAcceptUser = async (user: UserAccount) => {
    const confirmed = window.confirm(
      `Are you sure you want to accept and reactivate ${user.firstName} ${user.lastName}?`
    );
    if (!confirmed) return;

    try {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: "APPROVED", isActive: true } : u
        )
      );

      // 🎯 Passing empty object payload ensures Axios does not fail on PATCH
      await api.patch(`/users/${user.id}/accept`, {});
      toast.success(`Accepted ${user.firstName}'s account.`);
    } catch (err: any) {
      console.error("Failed to accept user:", err);
      toast.error(err.response?.data?.message || "Acceptance failed.");
      fetchData();
    }
  };

  // 8. Reject with Confirmation Prompt
  const handleReject = async (user: UserAccount) => {
    const confirmed = window.confirm(
      `Reject the registration application for ${user.firstName} ${user.lastName}?`
    );
    if (!confirmed) return;

    try {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: "REJECTED", isActive: false } : u
        )
      );

      await api.patch(`/users/${user.id}/reject`, {});
      toast.info(`Account application rejected for ${user.firstName}.`);
    } catch (err: any) {
      console.error("Failed to reject user:", err);
      toast.error(err.response?.data?.message || "Rejection failed.");
      fetchData();
    }
  };

  // 2 & 8. Disable/Enable with Specific Endpoints and Confirmation
  const handleToggleDisable = async (user: UserAccount) => {
    // 14. Self-disable protection
    if (user.id === currentUser?.id) {
      toast.error("You cannot disable your own active Admin account!");
      return;
    }

    const isCurrentlyDisabled = user.status === "DISABLED";
    const actionName = isCurrentlyDisabled ? "Enable" : "Disable";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionName.toLowerCase()} ${user.firstName} ${user.lastName}?`
    );
    if (!confirmed) return;

    const newStatus = isCurrentlyDisabled ? "APPROVED" : "DISABLED";
    const newIsActive = isCurrentlyDisabled;

    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id
          ? { ...item, status: newStatus, isActive: newIsActive }
          : item
      )
    );

    try {
      if (isCurrentlyDisabled) {
        await api.patch(`/users/${user.id}/activate`, {});
        toast.success(`User ${user.firstName} has been enabled.`);
      } else {
        await api.patch(`/users/${user.id}/disable`, {});
        toast.success(`User ${user.firstName} has been disabled.`);
      }
    } catch (err: any) {
      console.error("Failed to update user status:", err);
      toast.error(err.response?.data?.message || "Could not update user status.");
      fetchData();
    }
  };

  // 6 & 7. Filter and Sort Logic (Including Search by ID & Sorting Options)
  const filteredAndSortedUsers = users
    .filter((u) => {
      if (statusTab === "ACTIVE") {
        if (u.status !== "APPROVED" || u.isActive === false) return false;
      } else if (statusTab === "PENDING") {
        if (u.status !== "PENDING") return false;
      } else if (statusTab === "DISABLED") {
        if (u.status !== "DISABLED") return false;
      } else if (statusTab === "REJECTED") {
        if (u.status !== "REJECTED") return false;
      }

      const searchLower = search.toLowerCase();
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.phone?.toLowerCase().includes(searchLower) ||
        u.local?.name.toLowerCase().includes(searchLower) ||
        u.role.toLowerCase().includes(searchLower) ||
        u.id.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === "NEWEST") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      if (sortBy === "OLDEST") {
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      }
      if (sortBy === "ALPHABETICAL") {
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        );
      }
      if (sortBy === "LAST_LOGIN") {
        return (
          new Date(b.lastLogin || 0).getTime() -
          new Date(a.lastLogin || 0).getTime()
        );
      }
      return 0;
    });

  // Counters
  const totalCount = users.length;
  const activeCount = users.filter(
    (u) => u.status === "APPROVED" && u.isActive !== false
  ).length;
  const pendingCount = users.filter((u) => u.status === "PENDING").length;
  const disabledCount = users.filter((u) => u.status === "DISABLED").length;
  const rejectedCount = users.filter((u) => u.status === "REJECTED").length;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="border-b border-[#1E2D4A] pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="text-blue-400" size={24} />
            District User Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Assign roles, phone details, status control, and local assembly
            coverage across the district.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151F32] p-2 rounded-2xl border border-[#1E2D4A]">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setStatusTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                statusTab === "ALL"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-[#1E2D4A]"
              }`}
            >
              <Users size={14} /> All Accounts ({totalCount})
            </button>

            <button
              onClick={() => setStatusTab("ACTIVE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                statusTab === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "text-slate-400 hover:text-white hover:bg-[#1E2D4A]"
              }`}
            >
              <UserCheck size={14} /> Active / Logged In ({activeCount})
            </button>

            <button
              onClick={() => setStatusTab("PENDING")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                statusTab === "PENDING"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
                  : "text-slate-400 hover:text-white hover:bg-[#1E2D4A]"
              }`}
            >
              <ShieldAlert size={14} /> Pending Approval ({pendingCount})
            </button>

            <button
              onClick={() => setStatusTab("DISABLED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                statusTab === "DISABLED"
                  ? "bg-slate-700 text-white shadow-lg shadow-slate-900/30"
                  : "text-slate-400 hover:text-white hover:bg-[#1E2D4A]"
              }`}
            >
              <UserX size={14} /> Disabled ({disabledCount})
            </button>

            <button
              onClick={() => setStatusTab("REJECTED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                statusTab === "REJECTED"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                  : "text-slate-400 hover:text-white hover:bg-[#1E2D4A]"
              }`}
            >
              <Ban size={14} /> Rejected ({rejectedCount})
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-400 hover:text-white transition shrink-0"
            title="Refresh List"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Search Bar & Sorting */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, email, phone, ID, or local assembly..."
              className="w-full rounded-2xl border border-[#1E2D4A] bg-[#151F32] pl-11 pr-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none font-medium shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-2xl border border-[#1E2D4A] bg-[#151F32] px-4 py-3 text-xs text-white focus:border-blue-500 focus:outline-none font-semibold w-full md:w-auto"
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="OLDEST">Sort: Oldest First</option>
              <option value="ALPHABETICAL">Sort: Alphabetical (A-Z)</option>
              <option value="LAST_LOGIN">Sort: Recent Login</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-[#151F32] border border-[#1E2D4A] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D4A] bg-[#0B1120]/50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Email & Phone</th>
                  <th className="py-3.5 px-4">Assigned Position</th>
                  <th className="py-3.5 px-4">Scope / Local</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1E2D4A]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading district users...
                    </td>
                  </tr>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No users found matching filter or search query.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedUsers.map((u) => {
                    const isDisabled = u.status === "DISABLED";
                    const isRejected = u.status === "REJECTED";
                    const isPending = u.status === "PENDING";
                    const isSelf = u.id === currentUser?.id;
                    const dimRow = isDisabled || isRejected;

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-[#1A263E]/50 transition ${
                          dimRow ? "opacity-60 bg-slate-900/40" : ""
                        }`}
                      >
                        {/* User Details & Avatar */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {u.picture ? (
                              <img
                                src={u.picture}
                                alt={`${u.firstName} avatar`}
                                className="h-10 w-10 rounded-xl object-cover border border-[#1E2D4A] shrink-0 shadow-md"
                              />
                            ) : (
                              <div
                                className={`h-10 w-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-md ${
                                  dimRow
                                    ? "bg-slate-800 text-slate-400"
                                    : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                                }`}
                              >
                                {u.firstName?.[0] || "U"}
                                {u.lastName?.[0] || ""}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                {u.firstName} {u.lastName}
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {u.id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email & Phone */}
                        <td className="py-4 px-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Mail size={12} className="text-blue-400 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Phone size={12} className="text-emerald-400 shrink-0" />
                            <span>{u.phone || "No phone set"}</span>
                          </div>
                        </td>

                        {/* Colored Role Badges */}
                        <td className="py-4 px-4">{renderRoleBadge(u.role)}</td>

                        {/* Local Scope */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <Building2 size={13} className="text-indigo-400 shrink-0" />
                            <span>{u.local?.name || "All Assemblies (District)"}</span>
                          </div>
                        </td>

                        {/* Last Login */}
                        <td className="py-4 px-4 text-slate-400">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium">
                            <Clock size={12} className="text-slate-500 shrink-0" />
                            <span>{formatLastLogin(u.lastLogin)}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          {isRejected ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px] inline-flex items-center gap-1">
                              <Ban size={11} /> Rejected
                            </span>
                          ) : isDisabled ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 font-bold text-[10px] inline-flex items-center gap-1">
                              <XCircle size={11} /> Disabled
                            </span>
                          ) : isPending ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px] inline-flex items-center gap-1">
                              <ShieldAlert size={11} /> Pending
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 size={11} /> Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => handleQuickApprove(u)}
                                  className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition flex items-center gap-1"
                                >
                                  <Check size={12} /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(u)}
                                  className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30 transition flex items-center gap-1"
                                >
                                  <Ban size={12} /> Reject
                                </button>
                              </>
                            ) : isRejected ? (
                              /* Accept Direct Handler & Reassign Modal Options */
                              <>
                                <button
                                  onClick={() => handleAcceptUser(u)}
                                  className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition flex items-center gap-1"
                                >
                                  <UserCheck size={12} /> Accept
                                </button>

                                <button
                                  onClick={() => handleOpenReassignModal(u)}
                                  className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition flex items-center gap-1"
                                >
                                  <UserCog size={13} /> Reassign & Edit
                                </button>
                              </>
                            ) : (
                              /* Disable & Reassign Buttons */
                              <>
                                <button
                                  onClick={() => handleOpenReassignModal(u)}
                                  className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition flex items-center gap-1"
                                >
                                  <UserCog size={13} /> Reassign & Edit
                                </button>

                                <button
                                  onClick={() => handleToggleDisable(u)}
                                  disabled={isSelf}
                                  title={
                                    isSelf
                                      ? "You cannot disable your own active account"
                                      : ""
                                  }
                                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1 ${
                                    isSelf
                                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                                      : isDisabled
                                      ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30"
                                      : "bg-slate-600/20 border border-slate-500/30 text-slate-400 hover:bg-slate-600/30"
                                  }`}
                                >
                                  {isDisabled ? (
                                    <>
                                      <UserCheck size={13} /> Enable
                                    </>
                                  ) : (
                                    <>
                                      <UserX size={13} /> Disable
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reassign & Edit Modal */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-md bg-[#151F32] border border-[#1E2D4A] rounded-2xl p-6 space-y-5 shadow-2xl text-white max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3 sticky top-0 bg-[#151F32] z-10">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <UserCog className="text-blue-400" size={18} /> Reassign & Edit Profile
                </h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 rounded-lg hover:bg-[#1E2D4A] text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    User Account
                  </label>
                  <div className="p-3 bg-[#0B1120] rounded-xl border border-[#1E2D4A] font-bold text-slate-200">
                    {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Role Position
                  </label>
                  <select
                    value={modalRole}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setModalRole(newRole);
                      if (newRole === "PASTOR" || newRole === "ADMIN") {
                        setModalLocalId("");
                      }
                    }}
                    className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-semibold"
                  >
                    <option value="DATA_OFFICER">DATA_OFFICER</option>
                    <option value="ELDER">ELDER</option>
                    <option value="PASTOR">PASTOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="UNASSIGNED">UNASSIGNED (Awaiting Assignment)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Assigned Local Assembly Scope
                  </label>
                  <select
                    value={modalLocalId}
                    disabled={modalRole === "PASTOR" || modalRole === "ADMIN"}
                    onChange={(e) => setModalLocalId(e.target.value)}
                    className={`w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-semibold ${
                      modalRole === "PASTOR" || modalRole === "ADMIN"
                        ? "opacity-60 cursor-not-allowed text-blue-400"
                        : ""
                    }`}
                  >
                    <option value="">All Assemblies (District Scope)</option>
                    {locals.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.code})
                      </option>
                    ))}
                  </select>
                  {(modalRole === "PASTOR" || modalRole === "ADMIN") && (
                    <p className="text-[10px] text-blue-400 mt-1 font-medium">
                      * Pastors and Admins oversee all district assemblies automatically.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={modalPhone}
                    onChange={(e) => setModalPhone(e.target.value)}
                    placeholder="Enter official phone number..."
                    className="w-full rounded-xl border border-[#1E2D4A] bg-[#0B1120] p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E2D4A]">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-300 font-bold hover:bg-[#1E2D4A]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReassignment}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : "Confirm & Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}