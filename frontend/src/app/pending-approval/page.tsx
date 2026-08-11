"use client";

import { useRouter } from "next/navigation";

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center shadow-xl">
        <div className="mb-6 text-5xl">⏳</div>

        <h1 className="mb-4 text-3xl font-bold text-white">
          Account Pending Approval
        </h1>

        <p className="mb-6 text-slate-300">
          Your Google account has been authenticated successfully.
          <br />
          <br />
          Your account is awaiting approval from a system administrator.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}