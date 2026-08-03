"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, Users, Navigation, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface LocalAssembly {
  id: string;
  name: string;
  code: string;
  leaderName?: string;
  leaderPhone?: string;
  members?: any[];
}

export default function LocalsPage() {
  const [locals, setLocals] = useState<LocalAssembly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocals() {
      try {
        setLoading(true);
        const res = await api.get("/locals");
        setLocals(res.data);
      } catch (err) {
        console.error("Failed to load local assemblies:", err);
        toast.error("Could not fetch local assembly directory.");
      } finally {
        setLoading(false);
      }
    }
    fetchLocals();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 bg-[#0B1120] min-h-screen text-white max-w-7xl mx-auto">
        {/* Summary Metric Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-1 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Assemblies
            </span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-white">{locals.length}</span>
              <Building2 className="text-blue-400" size={24} />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-1 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              District Oversight
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-emerald-400">Active Oversight</span>
              <ShieldCheck className="text-emerald-400" size={24} />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#151F32] border border-[#1E2D4A] space-y-1 shadow-xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              System Scope
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-blue-400">BUOHO DISTRICT</span>
              <Navigation className="text-blue-400" size={24} />
            </div>
          </div>
        </div>

        {/* Dynamic Assemblies Table */}
        <div className="rounded-2xl bg-[#151F32] border border-[#1E2D4A] overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#1E2D4A] flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Building2 size={18} className="text-blue-400" /> Local Assemblies Directory
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {locals.length} Registered Locals
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading assemblies...</div>
          ) : locals.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No assemblies registered in system.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B1120] text-slate-400 uppercase font-bold border-b border-[#1E2D4A]">
                  <tr>
                    <th className="p-4">Assembly Name</th>
                    <th className="p-4">Code</th>
                    <th className="p-4">Assembly Leader</th>
                    <th className="p-4">Leader Phone</th>
                    <th className="p-4 text-right">Members</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D4A] text-slate-200">
                  {locals.map((loc) => (
                    <tr key={loc.id} className="hover:bg-[#1A263E]/50 transition">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        {loc.name}
                      </td>
                      <td className="p-4 font-mono font-bold text-blue-400">{loc.code}</td>
                      <td className="p-4 text-slate-300">{loc.leaderName || "Elder Appointed"}</td>
                      <td className="p-4 text-slate-400">{loc.leaderPhone || "N/A"}</td>
                      <td className="p-4 text-right font-black text-white">
                        {loc.members ? loc.members.length : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}