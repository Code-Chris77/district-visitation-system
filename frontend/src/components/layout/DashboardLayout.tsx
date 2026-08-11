"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#0B1120] text-white flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-[#0B1120] text-slate-100 p-4 sm:p-6 pt-16 md:pt-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}