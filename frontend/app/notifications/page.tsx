"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NotificationType =
  | "workout_reminder"
  | "missed_workout"
  | "habit_reminder"
  | "motivation"
  | "achievement"
  | "nutrition_reminder"
  | "ai_insight";

type Notification = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: "high" | "normal";
  read: boolean;
};

type UserSummary = {
  total_workouts: number;
  total_reps: number;
  total_calories: number;
  average_form_score: number;
  days_since_workout: number | null;
};

type DeliveryChannels = {
  in_app: boolean;
  browser: boolean;
  email: boolean;
  push: boolean;
};

type NotificationResponse = {
  success: boolean;
  count: number;
  unread_count: number;
  high_priority_count: number;
  user_summary: UserSummary;
  notifications: Notification[];
  delivery_channels: DeliveryChannels;
  generated_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [channels, setChannels] =
    useState<DeliveryChannels | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async (
    showRefresh = false
  ) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        `${API_BASE}/notifications/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");

        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        setError("You do not have permission to view notifications.");
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load notifications"
        );
      }

      const data: NotificationResponse =
        await response.json();

      setNotifications(data.notifications || []);
      setSummary(data.user_summary || null);
      setChannels(data.delivery_channels || null);

    } catch (err) {
      console.error(
        "Notification error:",
        err
      );

      setError(
        "Unable to load notifications from backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const highPriorityCount = notifications.filter(
    (notification) =>
      notification.priority === "high"
  ).length;

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (
    type: NotificationType
  ) => {
    switch (type) {
      case "workout_reminder":
        return "🏋️";

      case "missed_workout":
        return "⚠️";

      case "habit_reminder":
        return "🔥";

      case "motivation":
        return "💪";

      case "achievement":
        return "🏆";

      case "nutrition_reminder":
        return "🥗";

      case "ai_insight":
        return "🤖";

      default:
        return "🔔";
    }
  };

  const getIconBackground = (
    type: NotificationType
  ) => {
    switch (type) {
      case "workout_reminder":
        return "bg-cyan-500/10 border-cyan-500/20";

      case "missed_workout":
        return "bg-red-500/10 border-red-500/20";

      case "habit_reminder":
        return "bg-orange-500/10 border-orange-500/20";

      case "motivation":
        return "bg-blue-500/10 border-blue-500/20";

      case "achievement":
        return "bg-yellow-500/10 border-yellow-500/20";

      case "nutrition_reminder":
        return "bg-green-500/10 border-green-500/20";

      case "ai_insight":
        return "bg-purple-500/10 border-purple-500/20";

      default:
        return "bg-slate-500/10 border-slate-500/20";
    }
  };

  const getPriorityStyle = (
    priority: Notification["priority"]
  ) => {
    if (priority === "high") {
      return "border-red-500/30 bg-red-500/10 text-red-300";
    }

    return "border-slate-700 bg-slate-900 text-slate-400";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <main className="min-h-screen bg-[#020817] text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-[#071225]">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-5">

          <div>
            <Link
              href="/"
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-bold">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Stay updated with your fitness journey.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:block rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2">
              <span className="text-sm text-cyan-300">
                🔔 {unreadCount} unread
              </span>
            </div>

            <Link
              href="/"
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
            >
              Dashboard
            </Link>

          </div>

        </div>

      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

            <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
              <p className="text-sm text-slate-400">
                Workouts
              </p>

              <p className="mt-2 text-2xl font-bold">
                {summary.total_workouts}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Total recorded
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
              <p className="text-sm text-slate-400">
                Total Reps
              </p>

              <p className="mt-2 text-2xl font-bold">
                {summary.total_reps}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Across workouts
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
              <p className="text-sm text-slate-400">
                Calories
              </p>

              <p className="mt-2 text-2xl font-bold">
                {Math.round(
                  summary.total_calories
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Estimated burned
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
              <p className="text-sm text-slate-400">
                Form Score
              </p>

              <p className="mt-2 text-2xl font-bold">
                {Math.round(
                  summary.average_form_score
                )}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Average performance
              </p>
            </div>

          </div>
        )}

        {/* Notification Controls */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#0b162b] p-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-bold">
              Fitness Updates
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Workout reminders, missed-workout alerts,
              habit nudges, achievements and AI insights.
            </p>

            {highPriorityCount > 0 && (
              <p className="mt-2 text-xs text-red-400">
                ⚠️ {highPriorityCount} high-priority notification
                {highPriorityCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                loadNotifications(true)
              }
              disabled={refreshing}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✓ Mark all read
            </button>

            <button
              onClick={clearAll}
              disabled={notifications.length === 0}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear all
            </button>

          </div>

        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-12 text-center">

            <div className="text-4xl animate-pulse">
              🔄
            </div>

            <h3 className="mt-4 font-bold">
              Loading notifications...
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Connecting to the AI Gym backend.
            </p>

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">

            <div className="text-4xl">
              ⚠️
            </div>

            <h3 className="mt-4 font-bold text-red-300">
              Notification Error
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              {error}
            </p>

            <button
              onClick={() =>
                loadNotifications()
              }
              className="mt-5 rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-400"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Notification List */}
        {!loading && !error && (
          <div className="space-y-4">

            {notifications.length === 0 ? (

              <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-12 text-center">

                <div className="text-5xl">
                  🔕
                </div>

                <h3 className="mt-4 text-lg font-bold">
                  No notifications
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  You are all caught up.
                </p>

              </div>

            ) : (

              notifications.map(
                (notification) => (

                  <div
                    key={notification.id}
                    className={`rounded-2xl border p-5 transition ${
                      notification.read
                        ? "border-slate-800 bg-[#0b162b]"
                        : notification.priority === "high"
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-cyan-500/30 bg-[#0d1b32]"
                    }`}
                  >

                    <div className="flex items-start gap-4">

                      {/* Icon */}
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-xl ${getIconBackground(
                          notification.type
                        )}`}
                      >
                        {getIcon(
                          notification.type
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-bold">
                              {notification.title}
                            </h3>

                            {!notification.read && (
                              <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                                NEW
                              </span>
                            )}

                            {notification.priority === "high" && (
                              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-300">
                                HIGH PRIORITY
                              </span>
                            )}

                          </div>

                          <span
                            className={`w-fit rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase ${getPriorityStyle(
                              notification.priority
                            )}`}
                          >
                            {notification.priority}
                          </span>

                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {notification.message}
                        </p>

                        <div className="mt-4 flex items-center gap-4">

                          {!notification.read ? (

                            <button
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                            >
                              Mark as read
                            </button>

                          ) : (

                            <span className="text-xs font-medium text-green-400">
                              ✓ Read
                            </span>

                          )}

                          <span className="text-xs text-slate-600">
                            In-app notification
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>
        )}

        {/* Delivery Channels */}
        {channels && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-[#0b162b] p-6">

            <div className="mb-5">
              <h2 className="text-xl font-bold">
                Notification Channels
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Current notification delivery architecture.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-semibold">
                  In-App
                </p>

                <p
                  className={`mt-2 text-xs font-medium ${
                    channels.in_app
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {channels.in_app
                    ? "Ready"
                    : "Disabled"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-semibold">
                  Browser
                </p>

                <p
                  className={`mt-2 text-xs font-medium ${
                    channels.browser
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {channels.browser
                    ? "Ready"
                    : "Disabled"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-semibold">
                  Email
                </p>

                <p className="mt-2 text-xs font-medium text-cyan-400">
                  Integration Ready
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <p className="font-semibold">
                  Push
                </p>

                <p className="mt-2 text-xs font-medium text-cyan-400">
                  Integration Ready
                </p>
              </div>

            </div>

          </section>
        )}

        {/* Categories */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
            <div className="text-2xl">
              🏋️
            </div>

            <h3 className="mt-3 font-bold">
              Workout
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Workout and missed-workout reminders.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
            <div className="text-2xl">
              🥗
            </div>

            <h3 className="mt-3 font-bold">
              Nutrition
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Meal tracking and calorie reminders.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
            <div className="text-2xl">
              🔥
            </div>

            <h3 className="mt-3 font-bold">
              Habits
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Consistency reminders and motivational nudges.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0b162b] p-5">
            <div className="text-2xl">
              🏆
            </div>

            <h3 className="mt-3 font-bold">
              Achievements
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Progress milestones and AI fitness insights.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 pb-4 text-center text-xs text-slate-500">
          AI Gym & Fitness Assistant • Smart Notification Center
        </div>

      </section>

    </main>
  );
}