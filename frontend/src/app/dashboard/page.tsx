"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }

      switch (user.role) {
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        case "PASTOR":
          router.push("/pastor/dashboard");
          break;
        case "ELDER":
          router.push("/elder/dashboard");
          break;
        case "DATA_OFFICER":
          router.push("/data-officer/dashboard");
          break;
        default:
          router.push("/login");
          break;
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white text-xs">
      Loading your workspace...
    </div>
  );
}