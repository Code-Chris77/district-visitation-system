"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useMembers } from "@/features/members/hooks/useMembers";

export default function MembersPage() {
  const { members, loading } = useMembers();

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Members
        </h1>

        <button className="rounded-lg bg-black px-5 py-2 text-white">
          Add Member
        </button>
      </div>

      <div className="rounded-xl border bg-white p-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <pre>
            {JSON.stringify(members, null, 2)}
          </pre>
        )}
      </div>
    </DashboardLayout>
  );
}