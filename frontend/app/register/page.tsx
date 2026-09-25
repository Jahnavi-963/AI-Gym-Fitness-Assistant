"use client";

import { FormEvent, useState } from "react";
import { API_BASE } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fitness_goal: "general_fitness",
    activity_level: "moderate",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

     try {
    const response = await fetch(
    `${API_BASE}/auth/register`,
    {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            age: Number(form.age),
            gender: form.gender,
            height: Number(form.height),
            weight: Number(form.weight),
            fitness_goal: form.fitness_goal,
            activity_level: form.activity_level,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Registration failed"
        );
      }

      setSuccess(
        "✅ Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          
          <div className="mb-8 text-center">
            <div className="mb-3 text-4xl">🏋️</div>

            <h1 className="text-3xl font-bold text-white">
              Create Your Account
            </h1>

            <p className="mt-2 text-slate-400">
              Start your personalized AI fitness journey
            </p>
          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Full Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              />
            </div>

            {/* Age + Gender */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="Age"
                  required
                  min={10}
                  max={100}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Gender
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
                >
                  <option value="">
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Height + Weight */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Height (cm)
                </label>

                <input
                  type="number"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="e.g. 170"
                  required
                  min={50}
                  max={250}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="e.g. 65"
                  required
                  min={20}
                  max={300}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Fitness Goal
              </label>

              <select
                name="fitness_goal"
                value={form.fitness_goal}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="general_fitness">
                  General Fitness
                </option>
                <option value="weight_loss">
                  Weight Loss
                </option>
                <option value="weight_gain">
                  Weight Gain
                </option>
                <option value="muscle_gain">
                  Muscle Gain
                </option>
                <option value="endurance">
                  Endurance
                </option>
              </select>
            </div>

            {/* Activity Level */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Activity Level
              </label>

              <select
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-500"
              >
                <option value="sedentary">
                  Sedentary
                </option>
                <option value="light">
                  Lightly Active
                </option>
                <option value="moderate">
                  Moderately Active
                </option>
                <option value="active">
                  Very Active
                </option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                ❌ {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                {success}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}