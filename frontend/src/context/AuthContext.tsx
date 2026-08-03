"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "@/lib/axios";

export interface LocalAssembly {
  id: string;
  name: string;
  code?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;

  email: string;

  role:
    | "UNASSIGNED"
    | "ADMIN"
    | "PASTOR"
    | "ELDER"
    | "DATA_OFFICER";

  status:
    | "APPROVED"
    | "PENDING"
    | "REJECTED";

  picture?: string | null;
  phone?: string | null;

  localId?: string | null;
  local?: LocalAssembly | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;

  logout: () => void;

  refetchUser: () => Promise<void>;

  updateUserData: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,

  logout: () => {},

  refetchUser: async () => {},

  updateUserData: () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  const fetchCurrentUser = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await api.get("/users/me");

      setUser(res.data);
    } catch (err) {
      console.error("Authentication failed", err);

      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // =====================================================
  // UPDATE USER LOCALLY
  // =====================================================

  const updateUserData = (
    updatedUser: Partial<User>,
  ) => {
    setUser((previousUser) => {
      if (!previousUser) return null;

      return {
        ...previousUser,
        ...updatedUser,
      };
    });
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    setUser(null);

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        logout,

        refetchUser: fetchCurrentUser,

        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);