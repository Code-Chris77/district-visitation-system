"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";

export interface LocalAssembly {
  id: string;
  name: string;
  districtId?: string;
}

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "PASTOR" | "ELDER" | "DATA_OFFICER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  picture?: string | null;
  localId?: string | null;
  local?: LocalAssembly | null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (!token) {
        setUser(null);
        return;
      }

      const res = await api.get("/auth/me");

      setUser(res.data);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    user,
    loading,
    refresh,
    refreshUser: refresh,
    isAuthenticated: !!user,
    isApproved: user?.status === "APPROVED",
    role: user?.role ?? null,
    localAssembly: user?.local ?? (user?.localId ? { id: user.localId, name: "Assigned Local" } : null),
    localId: user?.localId ?? user?.local?.id ?? null,
    picture: user?.picture ?? null,
    fullName: user ? `${user.firstName} ${user.lastName}`.trim() : "",
  };
}