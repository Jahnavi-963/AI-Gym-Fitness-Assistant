"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type Challenge = {
  id: number;
  name: string;
  description: string | null;
  duration_days: number;
  target: string | null;
  is_active: boolean;
  joined: boolean;
  progress: number;
  completed: boolean;
};


export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadChallenges() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(`${API_BASE}/challenges/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load challenges");
      }

      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load challenges.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChallenges();
  }, []);

  async function joinChallenge(challengeId: number) {
    try {
      setUpdatingId(challengeId);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(`${API_BASE}/challenges/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          challenge_id: challengeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to join challenge");
      }

      setMessage("Challenge joined successfully! 🎯");

      await loadChallenges();
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Unable to join challenge.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-slate-300">Loading challenges...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-10">
          <p className="text-sm text-cyan-400 font-semibold mb-2">
            FITNESS CHALLENGES
          </p>

          <h1 className="text-4xl font-bold">
            Challenge Yourself 🏆
          </h1>

          <p className="text-slate-400 mt-3 max-w-2xl">
            Join fitness challenges, track your progress, and stay consistent
            with your workout goals.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-slate-200">
            {message}
          </div>
        )}

        <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-4">
          <p className="text-sm text-cyan-300">
            💡 Challenge progress updates automatically when you complete and
            save workouts.
          </p>
        </div>

        {challenges.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-5xl mb-4">🏋️</div>

            <h2 className="text-2xl font-semibold">
              No active challenges
            </h2>

            <p className="text-slate-400 mt-2">
              New fitness challenges will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const target = Number(challenge.target || 0);

              const percentage =
                target > 0
                  ? Math.min(
                      Math.round(
                        (challenge.progress / target) * 100
                      ),
                      100
                    )
                  : 0;

              return (
                <div
                  key={challenge.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
                >

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {challenge.name}
                      </h2>

                      <p className="text-slate-400 text-sm mt-2">
                        {challenge.description}
                      </p>
                    </div>

                    <div className="text-3xl">
                      🏆
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">

                    <div className="rounded-xl bg-slate-800/70 p-4">
                      <p className="text-xs text-slate-400">
                        Duration
                      </p>

                      <p className="text-lg font-semibold mt-1">
                        {challenge.duration_days} days
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-800/70 p-4">
                      <p className="text-xs text-slate-400">
                        Target
                      </p>

                      <p className="text-lg font-semibold mt-1">
                        {challenge.target || "Flexible"}
                      </p>
                    </div>

                  </div>

                  {challenge.joined && (
                    <div className="mt-6">

                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">
                          Progress
                        </span>

                        <span className="font-semibold">
                          {challenge.progress}
                          {target > 0 ? ` / ${target}` : ""}
                        </span>
                      </div>

                      <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        {percentage}% completed
                      </p>

                    </div>
                  )}

                  <div className="mt-6">

                    {challenge.completed ? (

                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-4 text-center">

                        <p className="text-emerald-400 font-bold">
                          🎉 Challenge Completed!
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          Great work. Keep going!
                        </p>

                      </div>

                    ) : !challenge.joined ? (

                      <button
                        onClick={() => joinChallenge(challenge.id)}
                        disabled={updatingId === challenge.id}
                        className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 transition"
                      >
                        {updatingId === challenge.id
                          ? "Joining..."
                          : "Join Challenge"}
                      </button>

                    ) : (

                      <div className="rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-4 text-center">

                        <p className="text-slate-300 font-semibold">
                          Workout to increase your progress 💪
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Your completed workout reps are added
                          automatically.
                        </p>

                      </div>

                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10">
          <a
            href="/"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Back to Dashboard
          </a>
        </div>

      </div>
    </main>
  );
}