"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type Workout = {
  id: number;
  exercise: string;
  reps: number;
  form_score: number;
  calories_burned: number;
  duration_seconds?: number;
  created_at: string;
};

type HabitSummary = {
  total_workouts: number;
  workout_frequency: number;
  current_streak: number;
  habit_status: string;
  skip_risk: string;
  engagement_score: number;
  days_since_last_workout?: number;
  message: string;
};

type Nudge = {
  type: string;
  title: string;
  message: string;
};

type Schedule = {
  recommended_days: number;
  recommended_duration: number;
  intensity: string;
  reason: string;
};

export default function HabitsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [habitSummary, setHabitSummary] =
    useState<HabitSummary | null>(null);

  const [nudge, setNudge] = useState<Nudge | null>(null);

  const [schedule, setSchedule] =
    useState<Schedule | null>(null);

  // ==========================================
  // FETCH HABIT DATA
  // ==========================================

  const fetchHabitData = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login first to view your fitness habit data."
        );

        setLoading(false);
        setRefreshing(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        workoutsRes,
        summaryRes,
        nudgeRes,
        scheduleRes,
      ] = await Promise.all([
        fetch(
          `${API_BASE}/workouts/history`,
          {
            headers,
          }
        ),

        fetch(
          `${API_BASE}/habits/summary`,
          {
            headers,
          }
        ),

        fetch(
        `${API_BASE}/habits/nudge`,
          {
            headers,
          }
        ),

        fetch(
          `${API_BASE}/habits/schedule`,
          {
            headers,
          }
        ),
      ]);

      if (!workoutsRes.ok) {
        throw new Error(
          "Failed to load workout history."
        );
      }

      const workoutsData =
        await workoutsRes.json();

      setWorkouts(
        Array.isArray(workoutsData)
          ? workoutsData
          : []
      );

      if (summaryRes.ok) {
        const summaryData =
          await summaryRes.json();

        setHabitSummary(summaryData);
      }

      if (nudgeRes.ok) {
        const nudgeData =
          await nudgeRes.json();

        setNudge(nudgeData);
      }

      if (scheduleRes.ok) {
        const scheduleData =
          await scheduleRes.json();

        setSchedule(scheduleData);
      }
    } catch (err: any) {
      console.error(
        "Habit tracker error:",
        err
      );

      setError(
        err.message ||
          "Unable to load habit tracker data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHabitData();
  }, []);

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const totalWorkouts =
    habitSummary?.total_workouts ??
    workouts.length;

  const totalCalories = Math.round(
    workouts.reduce(
      (total, workout) =>
        total +
        Number(
          workout.calories_burned || 0
        ),
      0
    )
  );

  const averageForm =
    totalWorkouts > 0
      ? Math.round(
          workouts.reduce(
            (total, workout) =>
              total +
              Number(
                workout.form_score || 0
              ),
            0
          ) / totalWorkouts
        )
      : 0;

  const weeklyGoal = 5;

  const weeklyWorkouts =
    habitSummary?.workout_frequency ??
    0;

  const weeklyProgress = Math.min(
    Math.round(
      (weeklyWorkouts / weeklyGoal) * 100
    ),
    100
  );

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const getMotivation = () => {
    if (totalWorkouts === 0) {
      return "Start your first workout today. Small steps create strong habits!";
    }

    if (totalWorkouts < 3) {
      return "Great start! Keep training consistently to build your habit.";
    }

    if (totalWorkouts < 5) {
      return "You're doing well! A few more workouts will strengthen your weekly routine.";
    }

    return "Excellent consistency! Keep maintaining your fitness routine.";
  };

  const getConsistencyStatus = () => {
    if (totalWorkouts === 0) {
      return "Not Started";
    }

    if (totalWorkouts < 3) {
      return "Getting Started";
    }

    if (totalWorkouts < 5) {
      return "Consistent";
    }

    return "Excellent";
  };

  const getRiskStyle = (
    risk?: string
  ) => {
    const value =
      risk?.toLowerCase();

    if (value === "high") {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (value === "medium") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }

    return "border-green-500/30 bg-green-500/10 text-green-400";
  };

  const getRiskIcon = (
    risk?: string
  ) => {
    const value =
      risk?.toLowerCase();

    if (value === "high") {
      return "🔴";
    }

    if (value === "medium") {
      return "🟡";
    }

    return "🟢";
  };

  const getIntensityStyle = (
    intensity?: string
  ) => {
    const value =
      intensity?.toLowerCase();

    if (value?.includes("high")) {
      return "bg-red-500/10 text-red-400";
    }

    if (value?.includes("moderate")) {
      return "bg-yellow-500/10 text-yellow-400";
    }

    return "bg-cyan-500/10 text-cyan-400";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          HEADER
      ======================================= */}

      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">

          <div>

            <p className="text-sm font-semibold text-cyan-400">
              FITAI
            </p>

            <h1 className="text-2xl font-bold">
              AI Fitness Habit Tracker
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track your behavior, consistency and
              workout engagement.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                fetchHabitData(true)
              }
              disabled={refreshing}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <a
              href="/"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              ← Dashboard
            </a>

          </div>

        </div>

      </header>

      {/* ======================================
          MAIN CONTENT
      ======================================= */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">

            <p className="font-semibold text-red-400">
              ⚠️ Habit Tracker Error
            </p>

            <p className="mt-2 text-sm text-red-300">
              {error}
            </p>

            <button
              onClick={() =>
                fetchHabitData()
              }
              className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ====================================
            LOADING
        ===================================== */}

        {loading ? (

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

            <div className="text-5xl">
              🤖
            </div>

            <p className="mt-4 font-semibold">
              Analyzing your fitness habits...
            </p>

            <p className="mt-2 text-sm text-slate-400">
              AI is reviewing your workout history,
              consistency and engagement.
            </p>

          </div>

        ) : (

          <>

            {/* ==================================
                AI MOTIVATIONAL NUDGE
            =================================== */}

            <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="max-w-4xl">

                  <p className="text-sm font-semibold text-cyan-400">
                    AI MOTIVATIONAL NUDGE
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {nudge?.message ||
                      getMotivation()}
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">

                    {nudge?.title && (
                      <>
                        <span className="font-semibold text-cyan-400">
                          {nudge.title}
                        </span>

                        {" • "}
                      </>
                    )}

                    Your current consistency status:

                    <span className="font-semibold text-white">
                      {" "}
                      {habitSummary?.habit_status ||
                        getConsistencyStatus()}
                    </span>

                  </p>

                </div>

                <div className="text-6xl">
                  💪
                </div>

              </div>

            </section>

            {/* ==================================
                STATS
            =================================== */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              {/* Total Workouts */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Total Workouts
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalWorkouts}
                </p>

                <p className="mt-2 text-sm text-cyan-400">
                  Completed sessions
                </p>

              </div>

              {/* Calories */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Calories Burned
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {totalCalories}
                </p>

                <p className="mt-2 text-sm text-orange-400">
                  kcal burned
                </p>

              </div>

              {/* Average Form */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Average Form
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {averageForm}%
                </p>

                <p className="mt-2 text-sm text-green-400">
                  AI posture score
                </p>

              </div>

              {/* Streak */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Current Streak
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {habitSummary?.current_streak ||
                    0}
                </p>

                <p className="mt-2 text-sm text-purple-400">
                  consecutive days
                </p>

              </div>

              {/* Engagement */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <p className="text-sm text-slate-400">
                  Engagement
                </p>

                <p className="mt-2 text-3xl font-bold text-cyan-400">
                  {habitSummary?.engagement_score ||
                    0}
                </p>

                <p className="mt-2 text-sm text-cyan-400">
                  AI score / 100
                </p>

              </div>

            </section>

            {/* ==================================
                WEEKLY ENGAGEMENT
            =================================== */}

            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Weekly Engagement
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    AI tracks your workout consistency
                    against your weekly target.
                  </p>

                </div>

                <span className="text-2xl font-bold text-cyan-400">
                  {weeklyProgress}%
                </span>

              </div>

              <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{
                    width: `${weeklyProgress}%`,
                  }}
                />

              </div>

              <div className="mt-3 flex justify-between text-xs text-slate-400">

                <span>
                  {weeklyWorkouts} workouts
                </span>

                <span>
                  Goal: {weeklyGoal} workouts
                </span>

              </div>

            </section>

            {/* ==================================
                HABIT ANALYSIS
            =================================== */}

            <section className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* Behavior Analysis */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-xl font-bold">
                  🧠 AI Behavior Analysis
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  AI analyzes your recent activity to
                  understand consistency and missed-workout
                  behavior.
                </p>

                <div className="mt-5 space-y-4">

                  {/* Habit Status */}

                  <div className="rounded-xl bg-slate-800 p-4">

                    <div className="flex items-center justify-between gap-3">

                      <p className="font-semibold">
                        Habit Status
                      </p>

                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
                        {habitSummary?.habit_status ||
                          getConsistencyStatus()}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                      Your current fitness routine is
                      being evaluated from workout
                      frequency and consistency.
                    </p>

                  </div>

                  {/* Workout Engagement */}

                  <div className="rounded-xl bg-slate-800 p-4">

                    <div className="flex items-center justify-between">

                      <p className="font-semibold">
                        Workout Engagement
                      </p>

                      <span className="font-bold text-cyan-400">
                        {habitSummary?.engagement_score ||
                          0}
                        /100
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-slate-400">

                      {habitSummary?.habit_status
                        ? `${habitSummary.habit_status} engagement detected.`
                        : totalWorkouts >= 5
                        ? "High engagement detected. You are maintaining a strong routine."
                        : totalWorkouts >= 3
                        ? "Moderate engagement detected. Keep building consistency."
                        : "Low engagement detected. Start with short, manageable workouts."}

                    </p>

                  </div>

                  {/* Skip Risk */}

                  <div className="rounded-xl bg-slate-800 p-4">

                    <div className="flex items-center justify-between gap-3">

                      <p className="font-semibold">
                        Missed Workout Risk
                      </p>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRiskStyle(
                          habitSummary?.skip_risk
                        )}`}
                      >
                        {getRiskIcon(
                          habitSummary?.skip_risk
                        )}{" "}
                        {habitSummary?.skip_risk ||
                          "Unknown"}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-slate-400">

                      {habitSummary?.skip_risk
                        ? `${habitSummary.skip_risk} risk based on your recent workout behavior.`
                        : "AI is analyzing your workout behavior."}

                    </p>

                    {habitSummary?.days_since_last_workout !==
                      undefined && (
                      <p className="mt-2 text-xs text-slate-500">
                        Last workout:{" "}
                        {habitSummary.days_since_last_workout}{" "}
                        day
                        {habitSummary.days_since_last_workout ===
                        1
                          ? ""
                          : "s"}{" "}
                        ago
                      </p>
                    )}

                  </div>

                  {/* AI Recommendation */}

                  <div className="rounded-xl bg-slate-800 p-4">

                    <p className="font-semibold">
                      AI Recommendation
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      {schedule?.reason ||
                        habitSummary?.message ||
                        "Schedule your next workout and maintain a regular training routine."}
                    </p>

                  </div>

                </div>

              </div>

              {/* ==================================
                  DYNAMIC SCHEDULE
              =================================== */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-xl font-bold">
                  📅 Dynamic Workout Schedule
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  AI-generated schedule based on your
                  current engagement and behavior.
                </p>

                <div className="mt-5 space-y-3">

                  {/* Today */}

                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

                    <div>

                      <p className="font-semibold">
                        Today
                      </p>

                      <p className="text-sm text-slate-400">
                        {schedule
                          ? `${schedule.intensity} Training`
                          : "Strength Training"}
                      </p>

                    </div>

                    <span
                      className={`rounded-lg px-3 py-2 text-sm ${getIntensityStyle(
                        schedule?.intensity
                      )}`}
                    >
                      {schedule?.recommended_duration ||
                        30}{" "}
                      min
                    </span>

                  </div>

                  {/* Tomorrow */}

                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

                    <div>

                      <p className="font-semibold">
                        Tomorrow
                      </p>

                      <p className="text-sm text-slate-400">
                        Cardio & Mobility
                      </p>

                    </div>

                    <span className="rounded-lg bg-cyan-500/10 px-3 py-2 text-sm text-cyan-400">
                      {schedule
                        ? Math.max(
                            schedule.recommended_duration -
                              5,
                            15
                          )
                        : 25}{" "}
                      min
                    </span>

                  </div>

                  {/* Next Session */}

                  <div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">

                    <div>

                      <p className="font-semibold">
                        Next Session
                      </p>

                      <p className="text-sm text-slate-400">
                        Full Body Workout
                      </p>

                    </div>

                    <span className="rounded-lg bg-cyan-500/10 px-3 py-2 text-sm text-cyan-400">
                      {schedule
                        ? schedule.recommended_duration +
                          10
                        : 40}{" "}
                      min
                    </span>

                  </div>

                </div>

                {/* AI Schedule Summary */}

                {schedule && (

                  <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">

                    <p className="text-sm font-semibold text-cyan-400">
                      AI Schedule Plan
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        {schedule.recommended_days}{" "}
                        workout days/week
                      </span>

                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                        {schedule.recommended_duration}{" "}
                        min/session
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${getIntensityStyle(
                          schedule.intensity
                        )}`}
                      >
                        {schedule.intensity}
                      </span>

                    </div>

                    <p className="mt-3 text-sm text-slate-300">
                      {schedule.reason}
                    </p>

                  </div>

                )}

              </div>

            </section>

            {/* ==================================
                WORKOUT ACTIVITY
            =================================== */}

            <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Recent Workout Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Your recent training behavior and
                    performance history.
                  </p>

                </div>

                <a
                  href="/trainer"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-center text-sm font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Start Workout
                </a>

              </div>

              {workouts.length === 0 ? (

                <div className="mt-5 rounded-xl bg-slate-800 p-8 text-center">

                  <div className="text-4xl">
                    🏋️
                  </div>

                  <p className="mt-3 font-semibold">
                    No workout activity yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Complete your first AI Trainer
                    workout to start tracking your
                    fitness habits.
                  </p>

                  <a
                    href="/trainer"
                    className="mt-5 inline-block rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Start Your First Workout
                  </a>

                </div>

              ) : (

                <div className="mt-5 space-y-3">

                  {workouts
                    .slice(0, 8)
                    .map((workout) => (

                      <div
                        key={workout.id}
                        className="flex flex-col gap-4 rounded-xl bg-slate-800 p-4 md:flex-row md:items-center md:justify-between"
                      >

                        <div>

                          <p className="font-semibold capitalize">
                            {workout.exercise.replace(
                              "_",
                              " "
                            )}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {new Date(
                              workout.created_at
                            ).toLocaleString()}
                          </p>

                        </div>

                        <div className="flex flex-wrap gap-2 text-sm">

                          <span className="rounded-lg bg-slate-700 px-3 py-2">
                            Reps:{" "}
                            <b>
                              {workout.reps}
                            </b>
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
                              workout.calories_burned ||
                                0
                            )}{" "}
                            kcal
                          </span>

                        </div>

                      </div>

                    ))}

                </div>

              )}

            </section>

            {/* ==================================
                HABIT TRACKING EXPLANATION
            =================================== */}

            <section className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <div className="text-3xl">
                  📈
                </div>

                <h3 className="mt-3 font-semibold">
                  Behavior Tracking
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  AI analyzes workout frequency,
                  streaks and engagement to understand
                  your fitness behavior.
                </p>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <div className="text-3xl">
                  🔔
                </div>

                <h3 className="mt-3 font-semibold">
                  Smart Motivation
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Personalized motivational nudges help
                  you stay consistent and reduce skipped
                  workouts.
                </p>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <div className="text-3xl">
                  🗓️
                </div>

                <h3 className="mt-3 font-semibold">
                  Dynamic Scheduling
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Workout duration, frequency and
                  intensity are adjusted according to
                  your current engagement.
                </p>

              </div>

            </section>

          </>

        )}

      </div>

    </main>
  );
}