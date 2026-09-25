"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { useRouter } from "next/navigation";

const modules = [
  {
    title: "AI Gym Trainer",
    description:
      "Real-time workout detection, rep counting and form correction.",
    icon: "🏋️",
    path: "/trainer",
  },
  {
    title: "AI Dietician",
    description:
      "Personalized diet plans, calories and grocery recommendations.",
    icon: "🥗",
    path: "/diet",
  },
  {
    title: "Habit Tracker",
    description:
      "Track workouts, predict missed sessions and stay consistent.",
    icon: "📅",
    path: "/habits",
  },
  {
    title: "Virtual Gym Buddy",
    description:
      "AI fitness companion for motivation and personalized guidance.",
    icon: "💬",
    path: "/buddy",
  },
  {
    title: "Pose Performance",
    description:
      "Analyze movement efficiency and generate performance scores.",
    icon: "🧘",
    path: "/performance",
  },
  {
    title: "Gym Recommender",
    description:
      "Discover gyms, programs and fitness challenges for your goals.",
    icon: "📍",
    path: "/gyms",
  },
  {
    title: "Smart Gym",
    description:
      "IoT-enabled equipment monitoring and workout assistance.",
    icon: "🤖",
    path: "/smart-gym",
  },
  {
    title: "Analytics",
    description:
      "View fitness progress, workout statistics and reports.",
    icon: "📊",
    path: "/analytics",
  },
];

export default function Home() {
  const router = useRouter();

  // Authentication state
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState("Fitness User");

  // Dashboard state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [workoutSummary, setWorkoutSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // --------------------------------------------------
  // Validate login token with backend
  // --------------------------------------------------
  useEffect(() => {
    const validateToken = async () => {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      // No token -> Login page
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Invalid or expired token
        if (!response.ok) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");

          router.replace("/login");
          return;
        }

        const userData = await response.json();

        if (userData?.name) {
          setUserName(userData.name);
        }

        setAuthChecked(true);
      } catch (error) {
        console.error(
          "Authentication validation error:",
          error
        );

        localStorage.removeItem("access_token");
        localStorage.removeItem("token");

        router.replace("/login");
      }
    };

    validateToken();
  }, [router]);

  // --------------------------------------------------
  // Logout
  // --------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");

    setAuthChecked(false);

    router.replace("/login");
  };

  // --------------------------------------------------
  // Fetch workout history
  // --------------------------------------------------
  useEffect(() => {
    if (!authChecked) {
      return;
    }

    const fetchWorkoutHistory = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE}/workouts/history`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Token became invalid while page was open
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to fetch workout history"
          );
        }

        const data = await response.json();

        setWorkoutHistory(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Workout history error:",
          error
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchWorkoutHistory();
  }, [authChecked, router]);

  // --------------------------------------------------
  // Fetch workout summary
  // --------------------------------------------------
  useEffect(() => {
    if (!authChecked) {
      return;
    }

    const fetchWorkoutSummary = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE}/workouts/summary`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Token became invalid while page was open
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to fetch workout summary"
          );
        }

        const data = await response.json();

        setWorkoutSummary(data);
      } catch (error) {
        console.error(
          "Workout summary error:",
          error
        );
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchWorkoutSummary();
  }, [authChecked, router]);

  // --------------------------------------------------
  // Authentication loading screen
  // --------------------------------------------------
  if (!authChecked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mb-4 text-4xl">🤖</div>

          <p className="text-slate-400">
            Checking login...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // Dashboard
  // --------------------------------------------------
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } hidden border-r border-slate-800 bg-slate-900 transition-all duration-300 md:block`}
        >
          <div className="flex h-full flex-col">

            {/* Logo */}
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold">
                    Fit<span className="text-cyan-400">AI</span>
                  </h1>

                  <p className="text-xs text-slate-500">
                    AI Fitness Assistant
                  </p>
                </div>
              )}

              <button
                onClick={() =>
                  setSidebarOpen(!sidebarOpen)
                }
                className="rounded-lg bg-slate-800 px-3 py-2 hover:bg-slate-700"
              >
                ☰
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">

              <a
                href="/"
                className="flex items-center gap-3 rounded-xl bg-cyan-500/10 px-4 py-3 text-cyan-400"
              >
                <span>🏠</span>

                {sidebarOpen && (
                  <span>Dashboard</span>
                )}
              </a>

              <a
                href="/trainer"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>🏋️</span>

                {sidebarOpen && (
                  <span>AI Trainer</span>
                )}
              </a>

              <a
                href="/diet"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>🥗</span>

                {sidebarOpen && (
                  <span>Dietician</span>
                )}
              </a>

              <a
                href="/habits"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>📅</span>

                {sidebarOpen && (
                  <span>Habit Tracker</span>
                )}
              </a>

              <a
                href="/buddy"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>💬</span>

                {sidebarOpen && (
                  <span>Gym Buddy</span>
                )}
              </a>

              <a
                href="/analytics"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>📊</span>

                {sidebarOpen && (
                  <span>Analytics</span>
                )}
              </a>

              <a
                href="/profile"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>👤</span>

                {sidebarOpen && (
                  <span>Profile</span>
                )}
              </a>

              <a
                href="/settings"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>⚙️</span>

                {sidebarOpen && (
                  <span>Settings</span>
                )}
              </a>

              <a
                href="/admin"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
              >
                <span>🛡️</span>

                {sidebarOpen && (
                  <span>Admin Dashboard</span>
                )}
              </a>

            </nav>

            {/* User + Logout */}
            <div className="border-t border-slate-800 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500 font-bold text-slate-950">
                  {userName.charAt(0).toUpperCase()}
                </div>

                {sidebarOpen && (
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {userName}
                    </p>

                    <p className="text-xs text-slate-500">
                      Personal Account
                    </p>
                  </div>
                )}

              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
              >
                {sidebarOpen
                  ? "🚪 Logout"
                  : "🚪"}
              </button>

            </div>

          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1">

          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-5 backdrop-blur">

            <div>
              <p className="text-sm text-slate-400">
                Welcome back 👋
              </p>

              <h2 className="text-2xl font-bold">
                Your Fitness Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">

              <button className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 hover:bg-slate-800">
                🔔
              </button>

              <a
                href="/trainer"
                className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Start Workout
              </a>

            </div>

          </header>

          <div className="p-6">

            {/* Hero */}
            <div className="mb-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-slate-900 to-slate-900 p-8">

              <div className="max-w-3xl">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  AI Powered Fitness Ecosystem
                </p>

                <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
                  Train smarter.
                  <br />
                  Live stronger.
                </h1>

                <p className="mb-6 text-slate-400">
                  Your unified AI fitness assistant for workouts,
                  nutrition, habits, motivation and performance tracking.
                </p>

                <div className="flex flex-wrap gap-3">

                  <a
                    href="/trainer"
                    className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Start AI Trainer →
                  </a>

                  <a
                    href="/diet"
                    className="rounded-xl border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800"
                  >
                    Build Diet Plan
                  </a>

                </div>

              </div>

            </div>

            {/* Stats */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Weekly Workouts */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Weekly Workouts
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loadingSummary
                    ? "..."
                    : workoutSummary
                    ? workoutSummary.total_workouts
                    : 0}
                </p>

                <p className="mt-2 text-sm text-green-400">
                  ↑ 20% this week
                </p>

              </div>

              {/* Calories */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Calories Burned
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loadingSummary
                    ? "..."
                    : workoutSummary
                    ? Math.round(
                        workoutSummary.total_calories
                      ).toLocaleString()
                    : 0}
                </p>

                <p className="mt-2 text-sm text-cyan-400">
                  This week
                </p>

              </div>

              {/* Current Streak */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Current Streak
                </p>

                <p className="mt-2 text-3xl font-bold">
                  7 days
                </p>

                <p className="mt-2 text-sm text-orange-400">
                  🔥 Keep going
                </p>

              </div>

              {/* Fitness Score */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Fitness Score
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {loadingSummary
                    ? "..."
                    : workoutSummary
                    ? Math.round(
                        workoutSummary.average_form_score
                      )
                    : 0}
                </p>

                <p className="mt-2 text-sm text-green-400">
                  Excellent
                </p>

              </div>

            </div>

            {/* Workout History */}
            <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h2 className="text-2xl font-bold">
                    Workout History
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Your recently saved AI Trainer workouts
                  </p>
                </div>

                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                  {workoutHistory.length} Sessions
                </span>

              </div>

              {loadingHistory ? (

                <div className="rounded-xl bg-slate-800 p-5 text-center text-slate-400">
                  Loading workout history...
                </div>

              ) : workoutHistory.length === 0 ? (

                <div className="rounded-xl bg-slate-800 p-5 text-center">

                  <p className="font-semibold">
                    No workouts saved yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Complete a workout in AI Trainer and click Save Workout.
                  </p>

                  <a
                    href="/trainer"
                    className="mt-4 inline-block rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Start AI Trainer →
                  </a>

                </div>

              ) : (

                <div className="space-y-3">

                  {workoutHistory
                    .slice(0, 5)
                    .map((workout) => (

                    <div
                      key={workout.id}
                      className="flex flex-col gap-3 rounded-xl bg-slate-800 p-4 md:flex-row md:items-center md:justify-between"
                    >

                      <div className="flex items-center gap-4">

                        <span className="text-2xl">
                          🏋️
                        </span>

                        <div>

                          <p className="font-semibold capitalize">
                            {workout.exercise.replace(
                              "_",
                              " "
                            )}
                          </p>

                          <p className="text-sm text-slate-400">
                            {new Date(
                              workout.created_at
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-3 text-sm">

                        <span className="rounded-lg bg-slate-700 px-3 py-2">
                          Reps:{" "}
                          <b>{workout.reps}</b>
                        </span>

                        <span className="rounded-lg bg-slate-700 px-3 py-2">
                          Form:{" "}
                          <b>
                            {Math.round(
                              workout.form_score
                            )}
                            %
                          </b>
                        </span>

                        <span className="rounded-lg bg-slate-700 px-3 py-2">
                          🔥{" "}
                          {Math.round(
                            workout.calories_burned
                          )}{" "}
                          kcal
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* Modules */}
            <div className="mb-5">

              <h2 className="text-2xl font-bold">
                AI Fitness Modules
              </h2>

              <p className="mt-1 text-slate-400">
                Everything you need for your personalized fitness journey.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

              {modules.map((module) => (

                <a
                  key={module.title}
                  href={module.path}
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-800"
                >

                  <div className="mb-5 flex items-center justify-between">

                    <div className="text-4xl">
                      {module.icon}
                    </div>

                    <span className="text-slate-600 transition group-hover:text-cyan-400">
                      →
                    </span>

                  </div>

                  <h3 className="mb-2 text-lg font-bold">
                    {module.title}
                  </h3>

                  <p className="text-sm leading-6 text-slate-400">
                    {module.description}
                  </p>

                </a>

              ))}

            </div>

            {/* Today's Plan */}
            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">

              {/* Plan */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">

                <div className="mb-5 flex items-center justify-between">

                  <div>
                    <h2 className="text-xl font-bold">
                      Today's Plan
                    </h2>

                    <p className="text-sm text-slate-400">
                      Personalized activities for today
                    </p>
                  </div>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                    AI Recommended
                  </span>

                </div>

                <div className="space-y-3">

                  {/* Workout */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

                    <div className="flex items-center gap-4">

                      <span className="text-2xl">
                        🏋️
                      </span>

                      <div>
                        <p className="font-semibold">
                          Upper Body Workout
                        </p>

                        <p className="text-sm text-slate-400">
                          35 minutes • Medium intensity
                        </p>
                      </div>

                    </div>

                    <span className="text-green-400">
                      ✓
                    </span>

                  </div>

                  {/* Nutrition */}
                  <a
                    href="/diet"
                    className="flex items-center justify-between rounded-xl bg-slate-800 p-4 hover:bg-slate-700"
                  >

                    <div className="flex items-center gap-4">

                      <span className="text-2xl">
                        🥗
                      </span>

                      <div>
                        <p className="font-semibold">
                          Nutrition Target
                        </p>

                        <p className="text-sm text-slate-400">
                          1,742 kcal recommended
                        </p>
                      </div>

                    </div>

                    <span className="text-cyan-400">
                      →
                    </span>

                  </a>

                  {/* Activity */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

                    <div className="flex items-center gap-4">

                      <span className="text-2xl">
                        🚶
                      </span>

                      <div>
                        <p className="font-semibold">
                          Daily Activity
                        </p>

                        <p className="text-sm text-slate-400">
                          Target 8,000 steps
                        </p>
                      </div>

                    </div>

                    <span className="text-cyan-400">
                      →
                    </span>

                  </div>

                </div>

              </div>

              {/* AI Assistant */}
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

                <div className="mb-4 text-4xl">
                  🤖
                </div>

                <h2 className="text-xl font-bold">
                  AI Fitness Assistant
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Need help with your workout, nutrition or fitness goals?
                  Your AI assistant is ready.
                </p>

                <a
                  href="/buddy"
                  className="mt-6 block rounded-xl bg-cyan-500 px-5 py-3 text-center font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Chat with AI Buddy
                </a>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}