"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type ExerciseUsage = {
  exercise: string;
  sessions: number;
  reps: number;
  average_score: number;
};

type DietUsage = {
  nutrition_logs: number;
  users_tracking_nutrition: number;
  total_logged_calories: number;
};

type GoalUsage = {
  fitness_goal: string;
  users: number;
};

type ActivityLevelUsage = {
  activity_level: string;
  users: number;
};

type PerformanceTrend = {
  date: string;
  form_score: number;
  exercise: string;
};

type RecentActivity = {
  user_name: string;
  exercise: string;
  reps: number;
  form_score: number;
  calories_burned: number;
  duration_seconds: number;
  created_at: string;
};

type SystemActivity = {
  total_users: number;
  total_workouts: number;
  total_nutrition_logs: number;
  total_exercises: number;
  admin_access: boolean;
};

type IoTStatus = {
  total_equipment: number;
  active: number;
  idle: number;
  maintenance: number;
  integration: string;
};

type AdminData = {
  total_users: number;
  active_users: number;
  total_workouts: number;
  total_reps: number;
  total_calories: number;
  average_form_score: number;
  best_form_score: number;
  total_duration_seconds: number;
  exercise_usage: ExerciseUsage[];
  diet_usage: DietUsage;
  fitness_goal_usage: GoalUsage[];
  activity_level_usage: ActivityLevelUsage[];
  performance_trend: PerformanceTrend[];
  recent_activity: RecentActivity[];
  system_activity: SystemActivity;
  iot_equipment_status: IoTStatus;
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAdminDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        setError("Your session has expired. Please login again.");
        return;
      }

      if (response.status === 403) {
        setError("Admin access required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load admin dashboard");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load admin dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminDashboard();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes} min`;
    }

    return `${seconds}s`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const formatExercise = (exercise: string) => {
    return exercise.replaceAll("_", " ");
  };

  const getMaxSessions = () => {
    if (!data || data.exercise_usage.length === 0) {
      return 1;
    }

    return Math.max(
      ...data.exercise_usage.map((item) => item.sessions),
      1
    );
  };

  const getMaxPerformance = () => {
    if (!data || data.performance_trend.length === 0) {
      return 100;
    }

    return Math.max(
      ...data.performance_trend.map((item) => item.form_score),
      100
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">⚙️</div>
          <p className="text-slate-300">
            Loading Admin Dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <h1 className="text-2xl font-bold text-red-300">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-slate-300">
              {error}
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => loadAdminDashboard()}
                className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
              >
                Try Again
              </button>

              <a
                href="/login"
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const maxSessions = getMaxSessions();
  const maxPerformance = getMaxPerformance();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-sm text-cyan-400 font-medium">
              AI GYM & FITNESS ASSISTANT
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Admin Dashboard
            </h1>

            <p className="text-slate-400 mt-2">
              System-wide fitness activity and platform analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAdminDashboard(true)}
              disabled={refreshing}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-xs text-emerald-300">
                ACCESS
              </p>

              <p className="font-semibold text-emerald-200">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">

          {/* Total Users */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Users
            </p>

            <p className="text-3xl font-bold mt-2">
              {data.total_users}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Registered users
            </p>
          </div>

          {/* Active Users */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Active Users
            </p>

            <p className="text-3xl font-bold mt-2">
              {data.active_users}
            </p>

            <p className="text-xs text-emerald-400 mt-2">
              Last 30 days
            </p>
          </div>

          {/* Workouts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Workouts
            </p>

            <p className="text-3xl font-bold mt-2">
              {data.total_workouts}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Recorded sessions
            </p>
          </div>

          {/* Reps */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Reps
            </p>

            <p className="text-3xl font-bold mt-2">
              {data.total_reps}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Across exercises
            </p>
          </div>

          {/* Calories */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Calories
            </p>

            <p className="text-3xl font-bold mt-2">
              {Math.round(data.total_calories)}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Estimated burned
            </p>
          </div>

          {/* Average Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Avg Form
            </p>

            <p className="text-3xl font-bold mt-2">
              {Math.round(data.average_form_score)}%
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Overall form quality
            </p>
          </div>

        </section>

        {/* Second Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Best Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Best Form Score
            </p>

            <p className="text-3xl font-bold mt-2">
              {Math.round(data.best_form_score)}%
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Highest recorded score
            </p>
          </div>

          {/* Workout Duration */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Workout Time
            </p>

            <p className="text-3xl font-bold mt-2">
              {formatDuration(data.total_duration_seconds)}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Total duration
            </p>
          </div>

          {/* Nutrition Logs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Nutrition Logs
            </p>

            <p className="text-3xl font-bold mt-2">
              {data.diet_usage.nutrition_logs}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Food entries recorded
            </p>
          </div>

          {/* Exercises */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Exercises Used
            </p>

            <p className="text-3xl font-bold mt-2">
              {data.system_activity.total_exercises}
            </p>

            <p className="text-xs text-slate-500 mt-2">
              Exercise types
            </p>
          </div>

        </section>

        {/* Exercise + System */}
        <section className="grid lg:grid-cols-2 gap-6 mb-8">

          {/* Exercise Usage */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Exercise Usage
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Platform-wide exercise activity.
              </p>
            </div>

            {data.exercise_usage.length === 0 ? (
              <div className="rounded-xl bg-slate-950 p-6 text-center text-slate-400">
                No workout data available.
              </div>
            ) : (
              <div className="space-y-5">
                {data.exercise_usage.map((item) => (
                  <div key={item.exercise}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold capitalize">
                        {formatExercise(item.exercise)}
                      </span>

                      <span className="text-sm text-cyan-400">
                        {item.sessions} sessions
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.sessions / maxSessions) * 100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>
                        {item.reps} reps
                      </span>

                      <span>
                        Avg form: {Math.round(item.average_score)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Overview */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              System Overview
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-6">
              Current platform status.
            </p>

            <div className="space-y-4">

              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div>
                  <p className="font-medium">
                    Authentication
                  </p>

                  <p className="text-xs text-slate-500">
                    JWT protected access
                  </p>
                </div>

                <span className="text-emerald-400 text-sm font-medium">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div>
                  <p className="font-medium">
                    Database
                  </p>

                  <p className="text-xs text-slate-500">
                    SQLite + SQLAlchemy
                  </p>
                </div>

                <span className="text-emerald-400 text-sm font-medium">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div>
                  <p className="font-medium">
                    AI Trainer
                  </p>

                  <p className="text-xs text-slate-500">
                    Pose detection and workout analysis
                  </p>
                </div>

                <span className="text-emerald-400 text-sm font-medium">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-4">
                <div>
                  <p className="font-medium">
                    Admin Authorization
                  </p>

                  <p className="text-xs text-slate-500">
                    Protected administrator endpoint
                  </p>
                </div>

                <span className="text-emerald-400 text-sm font-medium">
                  Enabled
                </span>
              </div>

            </div>
          </div>

        </section>

        {/* Diet + User Preferences */}
        <section className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* Diet Usage */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Diet & Nutrition Usage
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-6">
              Nutrition tracking activity.
            </p>

            <div className="space-y-4">

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Nutrition Logs
                </p>

                <p className="text-2xl font-bold mt-1">
                  {data.diet_usage.nutrition_logs}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Users Tracking Nutrition
                </p>

                <p className="text-2xl font-bold mt-1">
                  {data.diet_usage.users_tracking_nutrition}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Logged Calories
                </p>

                <p className="text-2xl font-bold mt-1">
                  {Math.round(
                    data.diet_usage.total_logged_calories
                  )}{" "}
                  kcal
                </p>
              </div>

            </div>
          </div>

          {/* Fitness Goals */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Fitness Goals
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-6">
              User goal distribution.
            </p>

            {data.fitness_goal_usage.length === 0 ? (
              <p className="text-slate-500">
                No goal data available.
              </p>
            ) : (
              <div className="space-y-4">
                {data.fitness_goal_usage.map((item) => (
                  <div
                    key={item.fitness_goal}
                    className="flex items-center justify-between rounded-xl bg-slate-950 p-4"
                  >
                    <span className="capitalize">
                      {formatExercise(item.fitness_goal)}
                    </span>

                    <span className="font-bold text-cyan-400">
                      {item.users}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Levels */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Activity Levels
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-6">
              User activity-level distribution.
            </p>

            {data.activity_level_usage.length === 0 ? (
              <p className="text-slate-500">
                No activity data available.
              </p>
            ) : (
              <div className="space-y-4">
                {data.activity_level_usage.map((item) => (
                  <div
                    key={item.activity_level}
                    className="flex items-center justify-between rounded-xl bg-slate-950 p-4"
                  >
                    <span className="capitalize">
                      {formatExercise(item.activity_level)}
                    </span>

                    <span className="font-bold text-cyan-400">
                      {item.users}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* Performance Trend */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-8">

          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Performance Trend
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Recent workout form scores across the platform.
            </p>
          </div>

          {data.performance_trend.length === 0 ? (
            <div className="rounded-xl bg-slate-950 p-8 text-center text-slate-400">
              No performance data available.
            </div>
          ) : (
            <div className="space-y-4">
              {data.performance_trend.map((item, index) => (
                <div
                  key={`${item.date}-${index}`}
                  className="rounded-xl bg-slate-950 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">

                    <div>
                      <p className="font-semibold capitalize">
                        {formatExercise(item.exercise)}
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatDate(item.date)}
                      </p>
                    </div>

                    <span className="font-bold text-cyan-400">
                      {Math.round(item.form_score)}%
                    </span>

                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${Math.min(
                          100,
                          (item.form_score / maxPerformance) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

        {/* IoT Equipment */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

            <div>
              <h2 className="text-xl font-bold">
                IoT Equipment Status
              </h2>

              <p className="text-sm text-slate-400 mt-1">
                Smart gym equipment monitoring layer.
              </p>
            </div>

            <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
              {data.iot_equipment_status.integration}
            </span>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Total Equipment
              </p>

              <p className="text-2xl font-bold mt-2">
                {data.iot_equipment_status.total_equipment}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Active
              </p>

              <p className="text-2xl font-bold text-emerald-400 mt-2">
                {data.iot_equipment_status.active}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Idle
              </p>

              <p className="text-2xl font-bold text-yellow-400 mt-2">
                {data.iot_equipment_status.idle}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                Maintenance
              </p>

              <p className="text-2xl font-bold text-red-400 mt-2">
                {data.iot_equipment_status.maintenance}
              </p>
            </div>

          </div>

        </section>

        {/* Recent Activity */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-bold">
              Recent Workout Activity
            </h2>

            <p className="text-sm text-slate-400 mt-1">
              Latest workout sessions recorded in the system.
            </p>
          </div>

          {data.recent_activity.length === 0 ? (
            <div className="rounded-xl bg-slate-950 p-8 text-center text-slate-400">
              No recent workout activity.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-slate-800 text-sm text-slate-400">
                    <th className="py-3 pr-4">
                      User
                    </th>

                    <th className="py-3 pr-4">
                      Exercise
                    </th>

                    <th className="py-3 pr-4">
                      Reps
                    </th>

                    <th className="py-3 pr-4">
                      Form
                    </th>

                    <th className="py-3 pr-4">
                      Calories
                    </th>

                    <th className="py-3 pr-4">
                      Duration
                    </th>

                    <th className="py-3">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.recent_activity.map(
                    (activity, index) => (
                      <tr
                        key={`${activity.created_at}-${index}`}
                        className="border-b border-slate-800/70"
                      >
                        <td className="py-4 pr-4 font-medium">
                          {activity.user_name}
                        </td>

                        <td className="py-4 pr-4 capitalize">
                          {formatExercise(activity.exercise)}
                        </td>

                        <td className="py-4 pr-4">
                          {activity.reps}
                        </td>

                        <td className="py-4 pr-4">
                          {Math.round(
                            activity.form_score
                          )}
                          %
                        </td>

                        <td className="py-4 pr-4">
                          {Math.round(
                            activity.calories_burned
                          )}{" "}
                          kcal
                        </td>

                        <td className="py-4 pr-4">
                          {activity.duration_seconds}s
                        </td>

                        <td className="py-4 text-sm text-slate-400 whitespace-nowrap">
                          {formatDate(
                            activity.created_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

              </table>
            </div>
          )}

        </section>

        {/* System Activity */}
        <section className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              System Activity
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-5">
              Platform activity summary.
            </p>

            <div className="space-y-3">

              <div className="flex justify-between bg-slate-950 rounded-lg p-3">
                <span className="text-slate-400">
                  Users
                </span>

                <span className="font-semibold">
                  {data.system_activity.total_users}
                </span>
              </div>

              <div className="flex justify-between bg-slate-950 rounded-lg p-3">
                <span className="text-slate-400">
                  Workouts
                </span>

                <span className="font-semibold">
                  {data.system_activity.total_workouts}
                </span>
              </div>

              <div className="flex justify-between bg-slate-950 rounded-lg p-3">
                <span className="text-slate-400">
                  Nutrition Logs
                </span>

                <span className="font-semibold">
                  {data.system_activity.total_nutrition_logs}
                </span>
              </div>

              <div className="flex justify-between bg-slate-950 rounded-lg p-3">
                <span className="text-slate-400">
                  Admin Access
                </span>

                <span className="text-emerald-400 font-semibold">
                  {data.system_activity.admin_access
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              Platform Modules
            </h2>

            <p className="text-sm text-slate-400 mt-1 mb-5">
              Major system components.
            </p>

            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-medium">
                  AI Trainer
                </p>

                <p className="text-xs text-emerald-400 mt-1">
                  Active
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-medium">
                  AI Dietician
                </p>

                <p className="text-xs text-emerald-400 mt-1">
                  Active
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-medium">
                  Gym Recommender
                </p>

                <p className="text-xs text-emerald-400 mt-1">
                  Active
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-medium">
                  Virtual Gym Buddy
                </p>

                <p className="text-xs text-emerald-400 mt-1">
                  Active
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-medium">
                  Analytics
                </p>

                <p className="text-xs text-emerald-400 mt-1">
                  Active
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-medium">
                  IoT Layer
                </p>

                <p className="text-xs text-cyan-400 mt-1">
                  MQTT Ready
                </p>
              </div>

            </div>
          </div>

        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 pb-4">
          AI Gym & Fitness Assistant • Administrator Console
        </div>

      </div>
    </main>
  );
}