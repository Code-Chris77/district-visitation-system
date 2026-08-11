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
  setLoading(true);

  try {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    const res = await api.get("/users/me");

    setUser(res.data);

    // keep local cache fresh
    localStorage.setItem(
      "user",
      JSON.stringify(res.data),
    );
  } catch (err) {
    console.error("Authentication failed", err);

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setUser(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  const cachedUser = localStorage.getItem("user");

  if (cachedUser) {
    try {
      setUser(JSON.parse(cachedUser));
    } catch {
      localStorage.removeItem("user");
    }
  }

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

  const newUser = {
    ...previousUser,
    ...updatedUser,
  };

  localStorage.setItem(
    "user",
    JSON.stringify(newUser),
  );

  return newUser;
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

    window.location.replace("/login");
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