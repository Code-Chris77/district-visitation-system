"use client";

import { LocalAssembly } from "../services/local.service";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, Phone } from "lucide-react";

interface LocalTableProps {
  locals: LocalAssembly[];
  onEdit?: (local: LocalAssembly) => void;
  onDelete?: (local: LocalAssembly) => void;
}

export default function LocalTable({
  locals = [],
  onEdit,
  onDelete,
}: LocalTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1E2D4A] bg-[#151F32] shadow-xl">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#0B1120] border-b border-[#1E2D4A] text-slate-300 font-bold uppercase tracking-wider">
          <tr>
            <th className="p-4">Assembly Name</th>
            <th className="p-4">Assembly Leader</th>
            <th className="p-4">Leader Phone</th>
            <th className="p-4">Members</th>
            <th className="p-4">Visits (Month)</th>
            <th className="p-4">Coverage</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E2D4A] text-slate-200">
          {locals.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-slate-400">
                No local assemblies found.
              </td>
            </tr>
          ) : (
            locals.map((local: any) => (
              <tr key={local.id} className="hover:bg-[#1E2D4A]/50 transition">
                <td className="p-4 font-bold text-white">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-blue-400" />
                    <span>{local.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-300 font-medium">
                  {local.leader || "Elder Appointed"}
                </td>
                <td className="p-4 text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-500" />
                    <span>{local.leaderPhone || "0240000000"}</span>
                  </div>
                </td>
                <td className="p-4 font-bold text-white">{local._count?.members || 0}</td>
                <td className="p-4 text-blue-400 font-bold">{local.visitsMonth || 0}</td>
                <td className="p-4">
                  <div className="w-24 bg-[#0B1120] rounded-full h-2 border border-[#1E2D4A] overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${local.coverage || 75}%` }}
                    />
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(local)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-[#1E2D4A]"
                      >
                        <Pencil size={14} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(local)}
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
  );
}