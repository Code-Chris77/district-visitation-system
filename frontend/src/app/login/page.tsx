"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, LogIn } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE", response.data);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "userRole",
        user.role
      );

      localStorage.setItem(
        "userName",
        `${user.firstName} ${user.lastName}`
      );

      toast.success("Signed in successfully!");

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
          router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);

      const message =
        err.response?.data?.message ??
        "Invalid email or password.";

      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-[#1E2D4A] bg-[#151F32] p-8 shadow-2xl">

        {/* Header */}

        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-500 border border-blue-500/30">
            <Shield size={28} />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            Buoho District Portal
          </h1>

          <p className="text-xs text-slate-400">
            The Church of Pentecost • Member Visitation System
          </p>
        </div>

        {/* Login Form */}

        <form
          onSubmit={handlePasswordLogin}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-semibold text-slate-300"
            >
              Email Address
            </Label>

            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-slate-400"
                size={16}
              />

              <Input
                id="email"
                type="email"
                placeholder="pastor@church.org"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="pl-9 bg-[#0B1120] border-[#1E2D4A] text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-semibold text-slate-300"
            >
              Password
            </Label>

            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-slate-400"
                size={16}
              />

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="pl-9 bg-[#0B1120] border-[#1E2D4A] text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs rounded-xl transition"
          >
            <LogIn
              size={16}
              className="mr-2"
            />

            {loading
              ? "Authenticating..."
              : "Sign In to System"}
          </Button>
        </form>

        {/* Divider */}

        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-[#1E2D4A]" />

          <span className="absolute bg-[#151F32] px-3 text-[10px] text-slate-400 font-bold uppercase">
            Or
          </span>
        </div>

        {/* Google */}

        <Button
          type="button"
          onClick={() => {
            window.location.href =
              `${
                process.env.NEXT_PUBLIC_API_URL ??
                "http://localhost:3001"
              }/auth/google`;
          }}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-gray-900 font-bold py-3 text-xs rounded-xl shadow-md transition"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1C7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
            />
          </svg>

          Sign In with Google
        </Button>
      </div>
    </div>
  );
}