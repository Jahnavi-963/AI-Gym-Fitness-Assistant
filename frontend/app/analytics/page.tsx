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

type Summary = {
  total_workouts: number;
  total_reps: number;
  total_calories: number;
  average_form_score: number;
  best_form_score: number;
  total_duration_seconds: number;
};

type MonthlyItem = {
  month: string;
  workouts: number;
  reps: number;
  calories: number;
  duration: number;
  score: number;
  scoreCount: number;
  averageScore: number;
};

type WeeklyItem = {
  day: string;
  workouts: number;
  calories: number;
  reps: number;
  duration: number;
  score: number;
  scoreCount: number;
  averageScore: number;
};

export default function AnalyticsPage() {
  const API = API_BASE;
  

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        historyResponse,
        summaryResponse,
        profileResponse,
      ] = await Promise.all([
        fetch(`${API}/workouts/history`, { headers }),
        fetch(`${API}/workouts/summary`, { headers }),
        fetch(`${API}/auth/me`, { headers }),
      ]);

      if (!historyResponse.ok) {
        throw new Error("Failed to load workout history");
      }

      if (!summaryResponse.ok) {
        throw new Error("Failed to load workout summary");
      }

      const historyData = await historyResponse.json();
      const summaryData = await summaryResponse.json();

      setWorkouts(
        Array.isArray(historyData)
          ? historyData
          : []
      );

      setSummary(summaryData);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();

        setWeight(
          profileData.weight ?? null
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * CURRENT WEEK
   *
   * Creates Monday-Sunday data for the
   * current calendar week only.
   */
  const processedWeeklyData = useMemo(() => {
    const days = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];

    const data: WeeklyItem[] = days.map(
      (day) => ({
        day,
        workouts: 0,
        calories: 0,
        reps: 0,
        duration: 0,
        score: 0,
        scoreCount: 0,
        averageScore: 0,
      })
    );

    const now = new Date();

    // Monday of current week
    const currentDay =
      now.getDay();

    const monday = new Date(now);

    const daysFromMonday =
      (currentDay + 6) % 7;

    monday.setDate(
      now.getDate() - daysFromMonday
    );

    monday.setHours(
      0,
      0,
      0,
      0
    );

    // Sunday end of current week
    const nextMonday = new Date(
      monday
    );

    nextMonday.setDate(
      monday.getDate() + 7
    );

    workouts.forEach((workout) => {
      const date = new Date(
        workout.created_at
      );

      if (
        isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      /*
       * Only include workouts from
       * current Monday to next Monday.
       */
      if (
        date < monday ||
        date >= nextMonday
      ) {
        return;
      }

      const dayIndex =
        (date.getDay() + 6) % 7;

      if (!data[dayIndex]) {
        return;
      }

      data[dayIndex].workouts += 1;

      data[dayIndex].calories +=
        Number(
          workout.calories_burned || 0
        );

      data[dayIndex].reps +=
        Number(
          workout.reps || 0
        );

      data[dayIndex].duration +=
        Number(
          workout.duration_seconds || 0
        );

      data[dayIndex].score +=
        Number(
          workout.form_score || 0
        );

      data[dayIndex].scoreCount += 1;
    });

    return data.map((item) => ({
      ...item,

      averageScore:
        item.scoreCount > 0
          ? Math.round(
              item.score /
                item.scoreCount
            )
          : 0,
    }));
  }, [workouts]);

  /*
   * MONTHLY ANALYTICS
   *
   * Last six calendar months,
   * including the current month.
   */
  const monthlyData = useMemo(() => {
    const now = new Date();

    const months: MonthlyItem[] = [];

    for (
      let i = 5;
      i >= 0;
      i--
    ) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      months.push({
        month:
          date.toLocaleString(
            "en-US",
            {
              month: "short",
            }
          ),

        workouts: 0,
        reps: 0,
        calories: 0,
        duration: 0,
        score: 0,
        scoreCount: 0,
        averageScore: 0,
      });
    }

    workouts.forEach((workout) => {
      const date = new Date(
        workout.created_at
      );

      if (
        isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const monthDifference =
        (now.getFullYear() -
          date.getFullYear()) *
          12 +
        (now.getMonth() -
          date.getMonth());

      if (
        monthDifference < 0 ||
        monthDifference > 5
      ) {
        return;
      }

      const index =
        5 - monthDifference;

      if (!months[index]) {
        return;
      }

      months[index].workouts += 1;

      months[index].reps +=
        Number(
          workout.reps || 0
        );

      months[index].calories +=
        Number(
          workout.calories_burned || 0
        );

      months[index].duration +=
        Number(
          workout.duration_seconds || 0
        );

      months[index].score +=
        Number(
          workout.form_score || 0
        );

      months[index].scoreCount += 1;
    });

    return months.map((item) => ({
      ...item,

      averageScore:
        item.scoreCount > 0
          ? Math.round(
              item.score /
                item.scoreCount
            )
          : 0,
    }));
  }, [workouts]);

  /*
   * EXERCISE-WISE ANALYTICS
   */
  const exerciseData = useMemo(() => {
    const map: Record<
      string,
      {
        workouts: number;
        reps: number;
        calories: number;
        score: number;
      }
    > = {};

    workouts.forEach((workout) => {
      const name =
        workout.exercise ||
        "Other";

      if (!map[name]) {
        map[name] = {
          workouts: 0,
          reps: 0,
          calories: 0,
          score: 0,
        };
      }

      map[name].workouts += 1;

      map[name].reps +=
        Number(
          workout.reps || 0
        );

      map[name].calories +=
        Number(
          workout.calories_burned || 0
        );

      map[name].score +=
        Number(
          workout.form_score || 0
        );
    });

    return Object.entries(map).map(
      ([exercise, values]) => ({
        exercise,
        ...values,

        averageScore:
          values.workouts > 0
            ? Math.round(
                values.score /
                  values.workouts
              )
            : 0,
      })
    );
  }, [workouts]);

  /*
   * CURRENT WEEK TOTALS
   */
  const weeklyWorkoutDays = useMemo(() => {
    return processedWeeklyData.filter(
      (item) =>
        item.workouts > 0
    ).length;
  }, [processedWeeklyData]);

  /*
   * Habit consistency:
   *
   * 5 planned workout days per week.
   *
   * Example:
   * 5 days = 100%
   * 4 days = 80%
   * 3 days = 60%
   * 2 days = 40%
   * 1 day  = 20%
   * 0 days = 0%
   */
  const habitConsistency =
    Math.min(
      100,
      Math.round(
        (weeklyWorkoutDays / 5) *
          100
      )
    );

  const maxWorkouts = Math.max(
    1,
    ...processedWeeklyData.map(
      (item) =>
        item.workouts
    )
  );

  const maxCalories = Math.max(
    1,
    ...processedWeeklyData.map(
      (item) =>
        item.calories
    )
  );

  const maxReps = Math.max(
    1,
    ...processedWeeklyData.map(
      (item) =>
        item.reps
    )
  );

  const maxDuration = Math.max(
    1,
    ...processedWeeklyData.map(
      (item) =>
        item.duration
    )
  );

  const maxMonthlyWorkouts =
    Math.max(
      1,
      ...monthlyData.map(
        (item) =>
          item.workouts
      )
    );

  const maxMonthlyReps =
    Math.max(
      1,
      ...monthlyData.map(
        (item) =>
          item.reps
      )
    );

  const maxMonthlyCalories =
    Math.max(
      1,
      ...monthlyData.map(
        (item) =>
          item.calories
      )
    );

  const maxMonthlyDuration =
    Math.max(
      1,
      ...monthlyData.map(
        (item) =>
          item.duration
      )
    );

  const totalDurationMinutes =
    Math.round(
      (summary?.total_duration_seconds ||
        0) / 60
    );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">
            📊
          </div>

          <p className="text-slate-300 text-lg">
            Loading analytics...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden md:block w-64 border-r border-slate-800 bg-slate-900 p-5">

          <div className="mb-8">

            <h1 className="text-2xl font-bold">
              AI Gym
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Fitness Assistant
            </p>

          </div>

          <nav className="space-y-2">

            <a
              href="/"
              className="navItem"
            >
              🏠 Dashboard
            </a>

            <a
              href="/trainer"
              className="navItem"
            >
              🏋️ AI Trainer
            </a>

            <a
              href="/diet"
              className="navItem"
            >
              🥗 AI Dietician
            </a>

            <a
              href="/habits"
              className="navItem"
            >
              🔥 Habit Tracker
            </a>

            <a
              href="/buddy"
              className="navItem"
            >
              🤖 Gym Buddy
            </a>

            <a
              href="/performance"
              className="navItem"
            >
              🎯 Performance
            </a>

            <a
              href="/gyms"
              className="navItem"
            >
              📍 Gyms & Planner
            </a>

            <a
              href="/smart-gym"
              className="navItem"
            >
              ⚙️ Smart Gym
            </a>

            <a
              href="/analytics"
              className="block rounded-lg px-4 py-3 bg-slate-800 text-white"
            >
              📊 Analytics
            </a>

            <a
              href="/notifications"
              className="navItem"
            >
              🔔 Notifications
            </a>

            <a
              href="/profile"
              className="navItem"
            >
              👤 Profile
            </a>

            <a
              href="/settings"
              className="navItem"
            >
              ⚙️ Settings
            </a>

          </nav>

        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 p-5 md:p-8 overflow-y-auto">

          <div className="max-w-7xl mx-auto">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

              <div>

                <p className="text-sm text-blue-400 font-semibold">
                  FITNESS INSIGHTS
                </p>

                <h2 className="text-3xl font-bold mt-1">
                  Progress Analytics
                </h2>

                <p className="text-slate-400 mt-2">
                  Track workouts, calories,
                  reps, performance,
                  duration and consistency.
                </p>

              </div>

              <button
                onClick={loadAnalytics}
                className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500"
              >
                ↻ Refresh Data
              </button>

            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-300">
                {error}
              </div>
            )}

            {/* TOP METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

              <div className="card">

                <p className="label">
                  Workout Sessions
                </p>

                <p className="bigNumber">
                  {summary?.total_workouts ||
                    0}
                </p>

                <p className="smallBlue">
                  Total sessions
                </p>

              </div>

              <div className="card">

                <p className="label">
                  Total Reps
                </p>

                <p className="bigNumber">
                  {summary?.total_reps ||
                    0}
                </p>

                <p className="smallGreen">
                  Training volume
                </p>

              </div>

              <div className="card">

                <p className="label">
                  Calories Burned
                </p>

                <p className="bigNumber">
                  {summary?.total_calories ||
                    0}
                </p>

                <p className="smallOrange">
                  Estimated calories
                </p>

              </div>

              <div className="card">

                <p className="label">
                  Average Performance
                </p>

                <p className="bigNumber">

                  {Math.round(
                    summary?.average_form_score ||
                      0
                  )}

                  <span className="text-lg text-slate-400">
                    /100
                  </span>

                </p>

                <p className="smallPurple">
                  Average form score
                </p>

              </div>

            </div>

            {/* SECONDARY METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

              <div className="card">

                <p className="label">
                  Best Form Score
                </p>

                <p className="text-2xl font-bold mt-2">
                  {Math.round(
                    summary?.best_form_score ||
                      0
                  )}
                  /100
                </p>

              </div>

              <div className="card">

                <p className="label">
                  Workout Duration
                </p>

                <p className="text-2xl font-bold mt-2">
                  {totalDurationMinutes} min
                </p>

              </div>

              <div className="card">

                <p className="label">
                  Habit Consistency
                </p>

                <p className="text-2xl font-bold mt-2">
                  {habitConsistency}%
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {weeklyWorkoutDays}/5 days this week
                </p>

              </div>

              <div className="card">

                <p className="label">
                  Exercises
                </p>

                <p className="text-2xl font-bold mt-2">
                  {exerciseData.length}
                </p>

              </div>

            </div>

            {/* WEEKLY FREQUENCY */}
            <div className="panel mb-6">

              <h3 className="sectionTitle">
                Weekly Workout Frequency
              </h3>

              <p className="description">
                Number of workout sessions
                completed each day this week.
              </p>

              <div className="flex items-end gap-3 h-64 mt-8">

                {processedWeeklyData.map(
                  (item) => {

                    const height =
                      (item.workouts /
                        maxWorkouts) *
                      100;

                    return (
                      <div
                        key={item.day}
                        className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                      >

                        <span className="text-xs text-slate-300">
                          {item.workouts}
                        </span>

                        <div
                          className="w-full max-w-12 bg-blue-500 rounded-t-lg"
                          style={{
                            height: `${Math.max(
                              height,
                              4
                            )}%`,
                          }}
                        />

                        <span className="text-xs text-slate-400">
                          {item.day}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* WEEKLY CALORIES + REPS */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">

              {/* CALORIES */}
              <div className="panel">

                <h3 className="sectionTitle">
                  Weekly Calories
                </h3>

                <p className="description">
                  Estimated calories burned
                  by day this week.
                </p>

                <div className="space-y-4 mt-6">

                  {processedWeeklyData.map(
                    (item) => {

                      const width =
                        (item.calories /
                          maxCalories) *
                        100;

                      return (
                        <div
                          key={item.day}
                        >

                          <div className="flex justify-between text-sm mb-1">

                            <span className="text-slate-400">
                              {item.day}
                            </span>

                            <span>
                              {item.calories} kcal
                            </span>

                          </div>

                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{
                                width: `${width}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* REPS */}
              <div className="panel">

                <h3 className="sectionTitle">
                  Weekly Reps
                </h3>

                <p className="description">
                  Total repetitions completed
                  by day this week.
                </p>

                <div className="space-y-4 mt-6">

                  {processedWeeklyData.map(
                    (item) => {

                      const width =
                        (item.reps /
                          maxReps) *
                        100;

                      return (
                        <div
                          key={item.day}
                        >

                          <div className="flex justify-between text-sm mb-1">

                            <span className="text-slate-400">
                              {item.day}
                            </span>

                            <span>
                              {item.reps} reps
                            </span>

                          </div>

                          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${width}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

            {/* WEEKLY PERFORMANCE */}
            <div className="panel mb-6">

              <h3 className="sectionTitle">
                Weekly Performance Score
              </h3>

              <p className="description">
                Average form score for each
                day this week.
              </p>

              <div className="grid grid-cols-7 gap-3 mt-6">

                {processedWeeklyData.map(
                  (item) => (

                    <div
                      key={item.day}
                      className="text-center"
                    >

                      <div className="relative h-40 bg-slate-800 rounded-lg overflow-hidden flex items-end">

                        <div
                          className="w-full bg-purple-500 rounded-t-lg"
                          style={{
                            height: `${Math.max(
                              item.averageScore,
                              3
                            )}%`,
                          }}
                        />

                      </div>

                      <p className="text-sm font-semibold mt-2">
                        {item.averageScore}/100
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.day}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* WEEKLY DURATION */}
            <div className="panel mb-6">

              <h3 className="sectionTitle">
                Workout Duration
              </h3>

              <p className="description">
                Training time across the
                current week.
              </p>

              <div className="space-y-4 mt-6">

                {processedWeeklyData.map(
                  (item) => {

                    const width =
                      (item.duration /
                        maxDuration) *
                      100;

                    return (
                      <div
                        key={item.day}
                      >

                        <div className="flex justify-between text-sm mb-1">

                          <span className="text-slate-400">
                            {item.day}
                          </span>

                          <span>
                            {Math.round(
                              item.duration /
                                60
                            )}{" "}
                            min
                          </span>

                        </div>

                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{
                              width: `${width}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* MONTHLY TRENDS */}
            <div className="panel mb-6">

              <div className="mb-6">

                <h3 className="sectionTitle">
                  Monthly Progress Trends
                </h3>

                <p className="description">
                  Workout activity and
                  performance trends for
                  the last six months.
                </p>

              </div>

              <div className="grid md:grid-cols-2 gap-6">

                {/* MONTHLY WORKOUTS */}
                <div className="rounded-xl bg-slate-800/40 p-5">

                  <h4 className="font-semibold">
                    Workout Sessions
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Monthly workout frequency
                  </p>

                  <div className="flex items-end gap-3 h-48 mt-6">

                    {monthlyData.map(
                      (item) => {

                        const height =
                          (item.workouts /
                            maxMonthlyWorkouts) *
                          100;

                        return (
                          <div
                            key={item.month}
                            className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                          >

                            <span className="text-xs text-slate-300">
                              {item.workouts}
                            </span>

                            <div
                              className="w-full bg-blue-500 rounded-t-lg"
                              style={{
                                height: `${Math.max(
                                  height,
                                  4
                                )}%`,
                              }}
                            />

                            <span className="text-xs text-slate-500">
                              {item.month}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* MONTHLY REPS */}
                <div className="rounded-xl bg-slate-800/40 p-5">

                  <h4 className="font-semibold">
                    Repetitions
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Monthly training volume
                  </p>

                  <div className="flex items-end gap-3 h-48 mt-6">

                    {monthlyData.map(
                      (item) => {

                        const height =
                          (item.reps /
                            maxMonthlyReps) *
                          100;

                        return (
                          <div
                            key={item.month}
                            className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                          >

                            <span className="text-xs text-slate-300">
                              {item.reps}
                            </span>

                            <div
                              className="w-full bg-green-500 rounded-t-lg"
                              style={{
                                height: `${Math.max(
                                  height,
                                  4
                                )}%`,
                              }}
                            />

                            <span className="text-xs text-slate-500">
                              {item.month}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* MONTHLY CALORIES */}
                <div className="rounded-xl bg-slate-800/40 p-5">

                  <h4 className="font-semibold">
                    Calories Burned
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Monthly estimated calories
                  </p>

                  <div className="flex items-end gap-3 h-48 mt-6">

                    {monthlyData.map(
                      (item) => {

                        const height =
                          (item.calories /
                            maxMonthlyCalories) *
                          100;

                        return (
                          <div
                            key={item.month}
                            className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                          >

                            <span className="text-xs text-slate-300">
                              {item.calories}
                            </span>

                            <div
                              className="w-full bg-orange-500 rounded-t-lg"
                              style={{
                                height: `${Math.max(
                                  height,
                                  4
                                )}%`,
                              }}
                            />

                            <span className="text-xs text-slate-500">
                              {item.month}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* MONTHLY DURATION */}
                <div className="rounded-xl bg-slate-800/40 p-5">

                  <h4 className="font-semibold">
                    Workout Duration
                  </h4>

                  <p className="text-xs text-slate-500 mt-1">
                    Monthly training time
                  </p>

                  <div className="flex items-end gap-3 h-48 mt-6">

                    {monthlyData.map(
                      (item) => {

                        const height =
                          (item.duration /
                            maxMonthlyDuration) *
                          100;

                        return (
                          <div
                            key={item.month}
                            className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                          >

                            <span className="text-xs text-slate-300">
                              {Math.round(
                                item.duration /
                                  60
                              )}m
                            </span>

                            <div
                              className="w-full bg-cyan-500 rounded-t-lg"
                              style={{
                                height: `${Math.max(
                                  height,
                                  4
                                )}%`,
                              }}
                            />

                            <span className="text-xs text-slate-500">
                              {item.month}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* MONTHLY PERFORMANCE TABLE */}
            <div className="panel mb-6">

              <h3 className="sectionTitle">
                Monthly Performance Summary
              </h3>

              <p className="description">
                Combined monthly fitness
                activity and form performance.
              </p>

              <div className="overflow-x-auto mt-6">

                <table className="w-full text-left">

                  <thead>

                    <tr className="border-b border-slate-800 text-sm text-slate-400">

                      <th className="py-3 pr-4">
                        Month
                      </th>

                      <th className="py-3 px-4">
                        Workouts
                      </th>

                      <th className="py-3 px-4">
                        Reps
                      </th>

                      <th className="py-3 px-4">
                        Calories
                      </th>

                      <th className="py-3 px-4">
                        Duration
                      </th>

                      <th className="py-3 pl-4">
                        Avg. Score
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {monthlyData.map(
                      (item) => (

                        <tr
                          key={item.month}
                          className="border-b border-slate-800 last:border-0"
                        >

                          <td className="py-4 pr-4 font-medium">
                            {item.month}
                          </td>

                          <td className="py-4 px-4">
                            {item.workouts}
                          </td>

                          <td className="py-4 px-4">
                            {item.reps}
                          </td>

                          <td className="py-4 px-4">
                            {item.calories} kcal
                          </td>

                          <td className="py-4 px-4">
                            {Math.round(
                              item.duration /
                                60
                            )}{" "}
                            min
                          </td>

                          <td className="py-4 pl-4">

                            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-300">
                              {item.averageScore}/100
                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* EXERCISE PERFORMANCE */}
            <div className="panel mb-6">

              <h3 className="sectionTitle">
                Exercise Performance
              </h3>

              <p className="description">
                Exercise-wise workout and
                performance analysis.
              </p>

              {exerciseData.length ===
              0 ? (

                <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center mt-6">

                  <p className="text-slate-400">
                    No workout data available yet.
                  </p>

                  <a
                    href="/trainer"
                    className="inline-block mt-4 rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-500"
                  >
                    Start Your First Workout
                  </a>

                </div>

              ) : (

                <div className="overflow-x-auto mt-6">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="border-b border-slate-800 text-sm text-slate-400">

                        <th className="py-3 pr-4">
                          Exercise
                        </th>

                        <th className="py-3 px-4">
                          Sessions
                        </th>

                        <th className="py-3 px-4">
                          Reps
                        </th>

                        <th className="py-3 px-4">
                          Calories
                        </th>

                        <th className="py-3 pl-4">
                          Avg. Score
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {exerciseData.map(
                        (item) => (

                          <tr
                            key={item.exercise}
                            className="border-b border-slate-800 last:border-0"
                          >

                            <td className="py-4 pr-4 font-medium capitalize">
                              {item.exercise.replaceAll(
                                "_",
                                " "
                              )}
                            </td>

                            <td className="py-4 px-4">
                              {item.workouts}
                            </td>

                            <td className="py-4 px-4">
                              {item.reps}
                            </td>

                            <td className="py-4 px-4">
                              {item.calories}
                            </td>

                            <td className="py-4 pl-4">

                              <span className="rounded-full bg-purple-500/10 px-3 py-1 text-purple-300">
                                {item.averageScore}/100
                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

            {/* CURRENT WEIGHT */}
            <div className="panel mb-6">

              <h3 className="sectionTitle">
                Current Weight
              </h3>

              <p className="description">
                Current body weight from
                your fitness profile.
              </p>

              <div className="mt-6 rounded-xl bg-slate-800/60 p-6">

                <p className="text-sm text-slate-400">
                  Current Weight
                </p>

                <p className="text-4xl font-bold mt-2">

                  {weight !== null
                    ? weight
                    : "--"}

                  <span className="text-lg text-slate-400 ml-2">
                    kg
                  </span>

                </p>

                <p className="text-xs text-slate-500 mt-2">
                  Update your weight from
                  Settings to keep your
                  profile current.
                </p>

                <a
                  href="/settings"
                  className="inline-block mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                >
                  Update Profile
                </a>

              </div>

            </div>

            {/* AI INSIGHT */}
            <div className="rounded-2xl border border-blue-900/50 bg-blue-950/30 p-6 mb-8">

              <p className="text-sm text-blue-400 font-semibold">
                AI FITNESS INSIGHT
              </p>

              <h3 className="text-xl font-semibold mt-2">
                Your training overview
              </h3>

              <p className="text-slate-300 mt-3 leading-7">

                You have completed{" "}

                <strong>
                  {summary?.total_workouts ||
                    0}
                </strong>{" "}

                workout sessions with{" "}

                <strong>
                  {summary?.total_reps ||
                    0}
                </strong>{" "}

                total repetitions. Your
                average form score is{" "}

                <strong>
                  {Math.round(
                    summary?.average_form_score ||
                      0
                  )}
                </strong>
                /100.

              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-6">

                <div className="rounded-xl bg-slate-900/70 p-4">

                  <p className="text-sm text-slate-400">
                    Training Volume
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {summary?.total_reps ||
                      0}{" "}
                    reps
                  </p>

                </div>

                <div className="rounded-xl bg-slate-900/70 p-4">

                  <p className="text-sm text-slate-400">
                    Energy Burn
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {summary?.total_calories ||
                      0}{" "}
                    kcal
                  </p>

                </div>

                <div className="rounded-xl bg-slate-900/70 p-4">

                  <p className="text-sm text-slate-400">
                    Consistency
                  </p>

                  <p className="text-2xl font-bold mt-1">
                    {habitConsistency}%
                  </p>

                </div>

              </div>

            </div>

            {/* ACTIONS */}
            <div className="grid md:grid-cols-3 gap-4">

              <a
                href="/trainer"
                className="rounded-xl bg-blue-600 p-5 text-center font-medium hover:bg-blue-500"
              >
                Start AI Workout
              </a>

              <a
                href="/performance"
                className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-center font-medium hover:bg-slate-800"
              >
                View Performance Report
              </a>

              <a
                href="/habits"
                className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-center font-medium hover:bg-slate-800"
              >
                Check Habit Progress
              </a>

            </div>

          </div>

        </section>

      </div>

      <style jsx>{`

        .navItem {
          display: block;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          color: rgb(203 213 225);
        }

        .navItem:hover {
          background-color: rgb(30 41 59);
          color: white;
        }

        .card {
          border-radius: 1rem;
          border: 1px solid rgb(30 41 59);
          background-color: rgb(15 23 42);
          padding: 1.25rem;
        }

        .panel {
          border-radius: 1rem;
          border: 1px solid rgb(30 41 59);
          background-color: rgb(15 23 42);
          padding: 1.5rem;
        }

        .label {
          color: rgb(148 163 184);
          font-size: 0.875rem;
        }

        .bigNumber {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 0.5rem;
        }

        .sectionTitle {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .description {
          color: rgb(148 163 184);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .smallBlue {
          color: rgb(96 165 250);
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .smallGreen {
          color: rgb(74 222 128);
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .smallOrange {
          color: rgb(251 146 60);
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .smallPurple {
          color: rgb(192 132 252);
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

      `}</style>

    </main>
  );
}