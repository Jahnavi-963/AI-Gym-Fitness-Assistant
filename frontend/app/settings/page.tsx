"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  age?: number | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  fitness_goal?: string | null;
  activity_level?: string | null;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const data: User = await response.json();

        setUser(data);
        setName(data.name || "");
        setAge(data.age?.toString() || "");
        setGender(data.gender || "");
        setHeight(data.height?.toString() || "");
        setWeight(data.weight?.toString() || "");
        setFitnessGoal(data.fitness_goal || "general_fitness");
        setActivityLevel(data.activity_level || "moderate");
      } catch {
        setError("Unable to load your settings.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      /*
       * The current backend exposes profile information through
       * /auth/me but does not yet provide a dedicated profile-update
       * endpoint.
       *
       * We therefore try the expected PUT endpoint first.
       * If it is not available, the user receives a clear message
       * instead of silently pretending the data was saved.
       */

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          age: age ? Number(age) : null,
          gender: gender || null,
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
          fitness_goal: fitnessGoal,
          activity_level: activityLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ||
            "Profile update API is not available yet in the backend."
        );
      }

      const updatedUser = await response.json();

      setUser(updatedUser);
      setMessage("Profile settings updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update profile settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-slate-300">Loading settings...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to Profile
          </Link>

          <h1 className="text-3xl font-bold mt-3">Settings</h1>

          <p className="text-slate-400 mt-1">
            Manage your personal and fitness preferences.
          </p>
        </div>

        {/* Success */}
        {message && (
          <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-green-300">
            ✓ {message}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={saveSettings} className="space-y-6">
          {/* Account Information */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-5">Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3 text-slate-400 cursor-not-allowed"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Email cannot be changed from this page.
                </p>
              </div>
            </div>
          </section>

          {/* Personal Details */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-5">Personal Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Age
                </label>

                <input
                  type="number"
                  min="10"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Gender
                </label>

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Body Measurements */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-5">Body Measurements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Height (cm)
                </label>

                <input
                  type="number"
                  min="80"
                  max="250"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Weight (kg)
                </label>

                <input
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </section>

          {/* Fitness Preferences */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-5">Fitness Preferences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Fitness Goal
                </label>

                <select
                  value={fitnessGoal}
                  onChange={(e) => setFitnessGoal(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="fitness_maintenance">
                    Fitness Maintenance
                  </option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Activity Level
                </label>

                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none"
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="very_active">Very Active</option>
                </select>
              </div>
            </div>
          </section>

          {/* Personalization */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">
              Personalization Settings
            </h2>

            <p className="text-slate-400 leading-7">
              Your fitness goal, activity level, body measurements and personal
              information are used to personalize workout planning, nutrition
              recommendations, habit insights and fitness analytics.
            </p>
          </section>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-white text-slate-900 px-6 py-3 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href="/profile"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-center hover:bg-slate-900 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}