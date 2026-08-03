"use client";

import { useState } from "react";
import { Member } from "../types";
import { LocalAssembly } from "@/features/locals/services/local.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";

interface MemberTableProps {
  members: Member[];
  locals?: LocalAssembly[];
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
  onView?: (member: Member) => void;
}

export default function MemberTable({
  members,
  locals = [],
  onEdit,
  onDelete,
  onView,
}: MemberTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocal, setSelectedLocal] = useState("ALL");

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      `${member.firstName} ${member.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (member.phone && member.phone.includes(searchTerm));

    const matchesLocal =
      selectedLocal === "ALL" ||
      member.localId === selectedLocal ||
      member.local?.id === selectedLocal;

    return matchesSearch && matchesLocal;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <Input
            placeholder="Search member name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#151F32] border-[#1E2D4A] text-white placeholder-slate-400 rounded-xl"
          />
        </div>

        <select
          value={selectedLocal}
          onChange={(e) => setSelectedLocal(e.target.value)}
          className="w-full sm:w-auto rounded-xl border border-[#1E2D4A] bg-[#151F32] px-3 py-2 text-xs font-bold text-white focus:outline-none"
        >
          <option value="ALL">All Local Assemblies</option>
          {locals.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dark Table Wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-[#1E2D4A] bg-[#151F32] shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0B1120] border-b border-[#1E2D4A] text-slate-300 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-4">Member</th>
              <th className="p-4">Status</th>
              <th className="p-4">Assembly</th>
              <th className="p-4">Phone</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2D4A] text-slate-200">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No member records found.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#1E2D4A]/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 font-bold text-xs border border-blue-500/30">
                        {member.firstName?.[0]}
                        {member.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {member.occupation || "Member"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-300">
                    {member.local?.name || "Wioso Assembly"}
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{member.phone || "—"}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onView && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onView(member)}
                          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-[#1E2D4A]"
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(member)}
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-[#1E2D4A]"
                        >
                          <Pencil size={14} />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(member)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-[#1E2D4A]"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
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