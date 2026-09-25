"use client";

import { FormEvent, useState } from "react";
import { API_BASE } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(
        `${API_BASE}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Invalid email or password"
        );
      }

      // Save JWT token for authenticated API requests
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      // Also keep "token" for compatibility
      localStorage.setItem(
        "token",
        data.access_token
      );

      router.push("/");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          
          <div className="mb-8 text-center">
            <div className="mb-4 text-4xl">🏋️</div>

            <h1 className="text-3xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-slate-400">
              Login to your AI Gym & Fitness Assistant
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            AI Gym & Fitness Assistant
          </div>
        </div>
      </div>
    </main>
  );
}