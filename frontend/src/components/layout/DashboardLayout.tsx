"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B1120] text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-[#0B1120] text-slate-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}