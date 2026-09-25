"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";

type Workout = {
  id: number;
  exercise: string;
  reps: number;
  form_score: number;
  duration_seconds: number;
  calories_burned: number;
  created_at: string;
};

export default function PerformancePage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPerformance() {
      try {
        const token =
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        if (!token) {
          setError("Please login first to view your performance.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE}/workouts/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load workout history.");
        }

        const data = await response.json();
        setWorkouts(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadPerformance();
  }, []);

  const totalWorkouts = workouts.length;

  const totalReps = useMemo(
    () => workouts.reduce((sum, workout) => sum + workout.reps, 0),
    [workouts]
  );

  const averageScore = useMemo(() => {
    if (workouts.length === 0) return 0;

    return Math.round(
      workouts.reduce(
        (sum, workout) => sum + workout.form_score,
        0
      ) / workouts.length
    );
  }, [workouts]);

  const totalCalories = useMemo(
    () =>
      Math.round(
        workouts.reduce(
          (sum, workout) => sum + workout.calories_burned,
          0
        )
      ),
    [workouts]
  );

  const bestScore = useMemo(() => {
    if (workouts.length === 0) return 0;

    return Math.round(
      Math.max(...workouts.map((workout) => workout.form_score))
    );
  }, [workouts]);

  const performanceLevel =
    averageScore >= 85
      ? "Excellent"
      : averageScore >= 70
      ? "Good"
      : averageScore >= 50
      ? "Needs Improvement"
      : "Getting Started";

  const improvementMessage =
    averageScore >= 85
      ? "Excellent movement quality. Keep maintaining controlled and efficient movements."
      : averageScore >= 70
      ? "Good performance. Focus on consistency and small improvements in exercise form."
      : averageScore >= 50
      ? "Your form is improving. Focus on controlled movements and correct posture."
      : "Start slowly and focus on learning correct exercise technique.";

  const exerciseStats = useMemo(() => {
    const stats: Record<
      string,
      {
        sessions: number;
        reps: number;
        score: number;
      }
    > = {};

    workouts.forEach((workout) => {
      if (!stats[workout.exercise]) {
        stats[workout.exercise] = {
          sessions: 0,
          reps: 0,
          score: 0,
        };
      }

      stats[workout.exercise].sessions += 1;
      stats[workout.exercise].reps += workout.reps;
      stats[workout.exercise].score += workout.form_score;
    });

    return Object.entries(stats)
      .map(([exercise, data]) => ({
        exercise,
        sessions: data.sessions,
        reps: data.reps,
        averageScore: Math.round(data.score / data.sessions),
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [workouts]);

  const getScoreLabel = (score: number) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button
            onClick={() => (window.location.href = "/")}
            className="mb-5 text-sm text-slate-400 hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            AI Performance Analytics
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Pose-to-Performance Analyzer 📊
          </h1>

          <p className="mt-2 max-w-3xl text-slate-400">
            Analyze your workout performance using AI form scores,
            movement efficiency, repetitions and workout history.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-5xl">📊</div>
            <p className="mt-4 font-semibold">
              Analyzing your performance...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              AI is reviewing your workout history and form scores.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
            {error}
          </div>
        ) : (
          <>
            {/* Main Performance Score */}
            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
              <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
                <div className="text-center lg:text-left">
                  <p className="text-sm font-semibold text-cyan-400">
                    OVERALL PERFORMANCE SCORE
                  </p>

                  <div className="mt-3 text-7xl font-bold">
                    {averageScore}
                    <span className="text-3xl text-slate-500">/100</span>
                  </div>

                  <p className="mt-2 text-xl font-semibold text-cyan-400">
                    {performanceLevel}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {improvementMessage}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <div className="mb-3 flex justify-between text-sm">
                    <span className="text-slate-400">
                      Movement Quality
                    </span>
                    <span className="font-semibold">
                      {averageScore}%
                    </span>
                  </div>

                  <div className="h-5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all"
                      style={{
                        width: `${Math.min(averageScore, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-slate-800 p-4">
                      <p className="text-2xl font-bold">
                        {bestScore}%
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Best Form Score
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-800 p-4">
                      <p className="text-2xl font-bold">
                        {totalReps}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Total Reps
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-800 p-4">
                      <p className="text-2xl font-bold">
                        {totalWorkouts}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Sessions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats */}
            <section className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Total Sessions
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {totalWorkouts}
                </p>
                <p className="mt-2 text-sm text-cyan-400">
                  AI tracked workouts
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Total Repetitions
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {totalReps}
                </p>
                <p className="mt-2 text-sm text-purple-400">
                  Movement volume
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Average Form
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {averageScore}%
                </p>
                <p className="mt-2 text-sm text-green-400">
                  AI posture analysis
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Calories Burned
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {totalCalories}
                </p>
                <p className="mt-2 text-sm text-orange-400">
                  Total tracked kcal
                </p>
              </div>
            </section>

            {/* Performance Analysis */}
            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-bold">
                  🧠 AI Movement Analysis
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl bg-slate-800 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        Motion Efficiency
                      </p>
                      <span className="text-cyan-400">
                        {averageScore}%
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      AI evaluates the quality and consistency of
                      your exercise movements.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">
                        Form Quality
                      </p>
                      <span className="text-green-400">
                        {getScoreLabel(averageScore)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      Your form score is calculated from the posture
                      analysis performed by the AI Trainer.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800 p-4">
                    <p className="font-semibold">
                      Performance Recommendation
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {improvementMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Report */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-bold">
                  📈 Progress Report
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Summary of your recorded AI workout performance.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
                    <div>
                      <p className="font-semibold">
                        Workout Sessions
                      </p>
                      <p className="text-sm text-slate-400">
                        Total recorded sessions
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-cyan-400">
                      {totalWorkouts}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
                    <div>
                      <p className="font-semibold">
                        Total Reps
                      </p>
                      <p className="text-sm text-slate-400">
                        All recorded exercises
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-purple-400">
                      {totalReps}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
                    <div>
                      <p className="font-semibold">
                        Average Performance
                      </p>
                      <p className="text-sm text-slate-400">
                        AI form score
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-green-400">
                      {averageScore}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">
                    <div>
                      <p className="font-semibold">
                        Best Performance
                      </p>
                      <p className="text-sm text-slate-400">
                        Highest recorded form score
                      </p>
                    </div>

                    <span className="text-2xl font-bold text-orange-400">
                      {bestScore}%
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Exercise Breakdown */}
            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    🏋️ Exercise Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Performance breakdown by exercise.
                  </p>
                </div>

                <a
                  href="/trainer"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-center text-sm font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Start AI Trainer
                </a>
              </div>

              {exerciseStats.length === 0 ? (
                <div className="mt-5 rounded-xl bg-slate-800 p-8 text-center">
                  <div className="text-4xl">🏋️</div>

                  <p className="mt-3 font-semibold">
                    No performance data yet
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Complete an AI Trainer workout to generate your
                    performance report.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="px-4 py-3">
                          Exercise
                        </th>
                        <th className="px-4 py-3">
                          Sessions
                        </th>
                        <th className="px-4 py-3">
                          Reps
                        </th>
                        <th className="px-4 py-3">
                          Avg Form
                        </th>
                        <th className="px-4 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {exerciseStats.map((item) => (
                        <tr
                          key={item.exercise}
                          className="border-b border-slate-800"
                        >
                          <td className="px-4 py-4 font-semibold capitalize">
                            {item.exercise.replaceAll("_", " ")}
                          </td>

                          <td className="px-4 py-4">
                            {item.sessions}
                          </td>

                          <td className="px-4 py-4">
                            {item.reps}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {item.averageScore}%
                          </td>

                          <td className="px-4 py-4">
                            <span className="rounded-lg bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                              {getScoreLabel(item.averageScore)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* AI Report */}
            <section className="mt-6 rounded-2xl border border-purple-500/20 bg-slate-900 p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="text-5xl">🤖</div>

                <div>
                  <p className="text-sm font-semibold text-purple-400">
                    AI WEEKLY PERFORMANCE INSIGHT
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {totalWorkouts === 0
                      ? "Your performance journey starts here."
                      : `You have completed ${totalWorkouts} workout ${
                          totalWorkouts === 1
                            ? "session"
                            : "sessions"
                        } with an average form score of ${averageScore}%.`}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {totalWorkouts === 0
                      ? "Start an AI Trainer session to generate personalized movement and performance insights."
                      : improvementMessage}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}