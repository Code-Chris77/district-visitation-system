"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function authenticate() {
      const token = searchParams.get("token");

      if (!token) {
        router.replace("/login?error=NoToken");
        return;
      }

      // Save token
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);

      try {
        const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://district-visitation-system-taek.onrender.com";

const res = await fetch(`${API_URL}/auth/me`, {
  headers: {
    Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error();
        }

        const user = await res.json();

        // Save fresh user details
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role || "");
        localStorage.setItem(
          "userName",
          `${user.firstName || ""} ${user.lastName || ""}`.trim()
        );

        // 🔒 CHECK STATUS FIRST: Intercept PENDING users
        if (user.status === "PENDING" || user.status === "REJECTED") {
          router.replace("/pending-approval");
          return;
        }

        // 🚀 ONLY APPROVED USERS ROUTE TO DASHBOARDS
        switch (user.role) {
          case "ADMIN":
            router.replace("/admin/dashboard");
            break;

          case "PASTOR":
            router.replace("/pastor/dashboard");
            break;

          case "ELDER":
            router.replace("/elder/dashboard");
            break;

          case "DATA_OFFICER":
            router.replace("/data-officer/dashboard");
            break;

          default:
            router.replace("/pending-approval");
        }
      } catch {
        localStorage.clear();
        router.replace("/login");
      }
    }

    authenticate();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-white">
      Authenticating...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-white">
          Loading...
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}