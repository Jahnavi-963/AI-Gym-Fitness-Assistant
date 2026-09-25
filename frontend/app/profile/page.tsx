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
  is_admin?: boolean;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
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

        const data = await response.json();
        setUser(data);
      } catch {
        setError("Unable to load profile. Please make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const calculateBMI = () => {
    if (!user?.height || !user?.weight) return null;

    const heightMeters = user.height / 100;
    return user.weight / (heightMeters * heightMeters);
  };

  const bmi = calculateBMI();

  const getBMICategory = (value: number | null) => {
    if (value === null) return "Not available";
    if (value < 18.5) return "Underweight";
    if (value < 25) return "Normal";
    if (value < 30) return "Overweight";
    return "Obesity";
  };

  const formatGoal = (goal?: string | null) => {
    if (!goal) return "Not specified";

    return goal
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatLevel = (level?: string | null) => {
    if (!level) return "Not specified";

    return level
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-3">⏳</div>
          <p className="text-slate-300">Loading your profile...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Profile Error</h1>
          <p className="text-slate-400 mb-5">{error}</p>

          <Link
            href="/"
            className="inline-block rounded-lg bg-white text-slate-900 px-5 py-2 font-semibold"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white transition"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold mt-3">My Profile</h1>

            <p className="text-slate-400 mt-1">
              View your personal information and fitness profile.
            </p>
          </div>

          <Link
            href="/settings"
            className="rounded-xl bg-white text-slate-900 px-5 py-3 font-semibold hover:bg-slate-200 transition text-center"
          >
            ⚙️ Edit Profile
          </Link>
        </div>

        {/* Profile Header Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-slate-400">{user.email}</p>

              {user.is_admin && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm">
                  Administrator
                </span>
              )}
            </div>
          </div>
        </section>

        {/* BMI + Fitness Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">BMI</p>

            <p className="text-3xl font-bold mt-2">
              {bmi !== null ? bmi.toFixed(2) : "--"}
            </p>

            <p className="text-sm text-slate-300 mt-1">
              {getBMICategory(bmi)}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">Fitness Goal</p>

            <p className="text-xl font-bold mt-2">
              {formatGoal(user.fitness_goal)}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Your current training objective
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-sm text-slate-400">Fitness Level</p>

            <p className="text-xl font-bold mt-2">
              {formatLevel(user.activity_level)}
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Used for personalized recommendations
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-5">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard label="Full Name" value={user.name} />
            <InfoCard label="Email" value={user.email} />
            <InfoCard
              label="Age"
              value={user.age ? `${user.age} years` : "Not specified"}
            />
            <InfoCard
              label="Gender"
              value={user.gender || "Not specified"}
            />
          </div>
        </section>

        {/* Body Measurements */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-5">Body Measurements</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard
              label="Height"
              value={user.height ? `${user.height} cm` : "Not specified"}
            />

            <InfoCard
              label="Weight"
              value={user.weight ? `${user.weight} kg` : "Not specified"}
            />

            <InfoCard
              label="BMI"
              value={bmi !== null ? bmi.toFixed(2) : "Not available"}
            />

            <InfoCard
              label="BMI Category"
              value={getBMICategory(bmi)}
            />
          </div>
        </section>

        {/* Fitness Preferences */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-5">Fitness Preferences</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard
              label="Fitness Goal"
              value={formatGoal(user.fitness_goal)}
            />

            <InfoCard
              label="Activity Level"
              value={formatLevel(user.activity_level)}
            />
          </div>
        </section>

        {/* Personalization Info */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-3">
            Personalized Fitness Profile
          </h2>

          <p className="text-slate-400 leading-7">
            Your profile information is used by the AI Gym & Fitness Assistant
            to personalize workout plans, nutrition recommendations, fitness
            analytics and progress insights.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div className="rounded-xl bg-slate-800/60 p-4">
              <div className="text-2xl mb-2">🏋️</div>
              <h3 className="font-semibold">Workout Plans</h3>
              <p className="text-sm text-slate-400 mt-1">
                Plans are adapted to your fitness goal and activity level.
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/60 p-4">
              <div className="text-2xl mb-2">🥗</div>
              <h3 className="font-semibold">Nutrition</h3>
              <p className="text-sm text-slate-400 mt-1">
                BMI and body measurements support calorie recommendations.
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/60 p-4">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold">Progress Analytics</h3>
              <p className="text-sm text-slate-400 mt-1">
                Your profile helps personalize performance insights.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="font-semibold text-slate-100 mt-2">
        {value}
      </p>
    </div>
  );
}