"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
//import api from "@/lib/axios";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      setLoading(true);

      console.log(data);
      const res = await axios.post(
  "http://127.0.0.1:3001/auth/login",
  data
);

      localStorage.setItem("token", res.data.access_token);

      router.push("/dashboard");
    } catch (err: unknown) {
  console.log(err);

  if (axios.isAxiosError(err)) {
    console.log(err.response);
    console.log(err.response?.data);
  }

  alert("Invalid credentials");
} finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 p-8">
          <div>
            <h1 className="text-3xl font-bold">Shepherd</h1>
            <p className="text-muted-foreground">
              Sign in to continue
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <Input
                placeholder="Email"
                {...register("email")}
              />
              <p className="text-sm text-red-500">
                {errors.email?.message}
              </p>
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              <p className="text-sm text-red-500">
                {errors.password?.message}
              </p>
            </div>

            <Button
              className="w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}