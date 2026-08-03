"use client";

import { useMemo, useState } from "react";
import { Calendar, User, FileText, Trash2 } from "lucide-react";
import { Visitation } from "../types/visitation.types";

interface Props {
  visitations: Visitation[];
  onDelete: (visitation: Visitation) => void;
}

export default function VisitationTable({ visitations, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredVisitations = useMemo(() => {
    return visitations.filter((v) => {
      const memberName = v.member
        ? `${v.member.firstName} ${v.member.lastName}`.toLowerCase()
        : "";
      const matchesSearch =
        memberName.includes(search.toLowerCase()) ||
        v.purpose.toLowerCase().includes(search.toLowerCase()) ||
        (v.visitorName ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || v.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [visitations, search, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">Completed</span>;
      case "PENDING":
        return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">Pending</span>;
      case "CANCELLED":
        return <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">Cancelled</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Bar & Status Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full sm:w-72 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search member name, purpose, shepherd..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Styled Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-700 font-medium">
            <tr>
              <th className="p-3">Member Visited</th>
              <th className="p-3">Purpose</th>
              <th className="p-3">Visited By</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredVisitations.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No visitation records found.
                </td>
              </tr>
            ) : (
              filteredVisitations.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3 font-semibold text-gray-900">
                    {v.member ? `${v.member.firstName} ${v.member.lastName}` : "Member ID: " + v.memberId}
                  </td>
                  <td className="p-3 text-gray-700 flex items-center gap-1.5">
                    <FileText size={14} className="text-gray-400" />
                    {v.purpose}
                  </td>
                  <td className="p-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-gray-400" />
                      <span>{v.visitorName || "Pastoral Team"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{new Date(v.visitDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-3">{getStatusBadge(v.status)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onDelete(v)}
                      title="Delete Record"
                      className="rounded-md bg-red-600 p-2 text-white hover:bg-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}