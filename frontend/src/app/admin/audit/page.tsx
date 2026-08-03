"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { History, Shield, User, MapPin } from "lucide-react";

export default function AuditLogsPage() {
  const logs = [
    {
      id: "1",
      date: "July 28, 2026 - 01:52 PM",
      actor: "Christian",
      action: "Assigned Role",
      target: "John Mensah",
      role: "Local Deacon",
      scope: "Akroma Assembly",
    },
    {
      id: "2",
      date: "July 28, 2026 - 11:20 AM",
      actor: "Andy",
      action: "Approved User",
      target: "Christian Antwi Boasiako",
      role: "District Pastor",
      scope: "Entire District",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white">
        <div className="border-b border-[#1E2D4A] pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold mb-2">
            <History size={12} /> Administration Module
          </div>
          <h1 className="text-2xl font-black text-white">System Audit Trail</h1>
          <p className="text-xs text-slate-400">Immutable log of administrative security events and role modifications.</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#1E2D4A] bg-[#151F32] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1120] border-b border-[#1E2D4A] text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Actor</th>
                <th className="p-4">Action Performed</th>
                <th className="p-4">Target User</th>
                <th className="p-4">Assigned Role & Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A] text-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1E2D4A]/50 transition">
                  <td className="p-4 text-slate-400">{log.date}</td>
                  <td className="p-4 font-bold text-white flex items-center gap-1.5">
                    <User size={14} className="text-blue-400" /> {log.actor}
                  </td>
                  <td className="p-4 font-bold text-emerald-400">{log.action}</td>
                  <td className="p-4 font-bold text-white">{log.target}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                      <MapPin size={12} /> {log.role} ({log.scope})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}