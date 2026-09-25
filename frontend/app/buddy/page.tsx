"use client";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

type Message = {
  role: "user" | "buddy";
  text: string;
};

type BuddyResponse = {
  response: string;
  sentiment?: string;
};

export default function BuddyPage() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "buddy",
      text: "Hey! 👋 I'm your Virtual Gym Buddy. Tell me how you're feeling or what you need help with today!",
    },
  ]);

  const [mood, setMood] = useState("😊 Motivated");
  const [motivation, setMotivation] = useState(82);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const trimmed = message.trim();

    if (!trimmed || loading) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Please login first to use your Virtual Gym Buddy.");
      return;
    }

    setError("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmed,
      },
    ]);

    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/buddy/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: trimmed,
          }),
        }
      );

      const data: BuddyResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          (data as any).detail ||
            "Unable to connect with Virtual Gym Buddy."
        );
      }

      // Sentiment / emotional-state analysis
      const sentiment = data.sentiment?.toLowerCase();

      if (sentiment === "positive") {
        setMood("😄 Positive");
        setMotivation((prev) => Math.min(prev + 3, 100));
      } else if (sentiment === "negative") {
        setMood("😔 Low / Stressed");
        setMotivation((prev) => Math.max(prev - 5, 20));
      } else {
        setMood("😊 Neutral");
      }

      // Add AI Buddy response
      setMessages((prev) => [
        ...prev,
        {
          role: "buddy",
          text: data.response,
        },
      ]);
    } catch (err: any) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleQuickMessage(text: string) {
    setMessage(text);
  }

  function clearChat() {
    setMessages([
      {
        role: "buddy",
        text: "Chat cleared! 👋 I'm ready to support your fitness journey. How are you feeling today?",
      },
    ]);

    setMood("😊 Motivated");
    setMotivation(82);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => (window.location.href = "/")}
            className="mb-5 text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Dashboard
          </button>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-purple-400">
            AI Fitness Companion
          </p>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-bold">
                Virtual Gym Buddy 🤖💬
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Your AI-powered fitness companion for motivation,
                emotional support, personalized guidance and
                fitness conversations.
              </p>
            </div>

            <button
              onClick={clearChat}
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Chat Section */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Chat with your Buddy
                </h2>

                <p className="text-sm text-slate-400">
                  Ask anything about your fitness journey.
                </p>
              </div>

              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                ● Online
              </div>
            </div>

            {/* Messages */}
            <div className="mb-5 h-[430px] space-y-4 overflow-y-auto rounded-xl bg-slate-950 p-4">

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-400">
                    Buddy is thinking... 🤖
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quick prompts
              </p>

              <div className="flex flex-wrap gap-2">

                <button
                  onClick={() =>
                    handleQuickMessage(
                      "I need workout motivation"
                    )
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  💪 Motivate me
                </button>

                <button
                  onClick={() =>
                    handleQuickMessage(
                      "I am feeling tired"
                    )
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  😴 Feeling tired
                </button>

                <button
                  onClick={() =>
                    handleQuickMessage(
                      "Help me with my workout"
                    )
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  🏋️ Workout help
                </button>

                <button
                  onClick={() =>
                    handleQuickMessage(
                      "Help me with diet"
                    )
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  🥗 Diet help
                </button>

                <button
                  onClick={() =>
                    handleQuickMessage(
                      "I feel stressed and need motivation"
                    )
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  🧘 Feeling stressed
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-3">

              <input
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Tell your buddy how you're feeling..."
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-purple-500 disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={loading || !message.trim()}
                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send"}
              </button>

            </div>
          </section>

          {/* Right Side */}
          <aside className="space-y-6">

            {/* Emotional State */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <h2 className="text-lg font-bold">
                Emotional State
              </h2>

              <div className="mt-4 rounded-xl bg-slate-950 p-5 text-center">

                <div className="text-5xl">
                  {mood.split(" ")[0]}
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  Current mood
                </p>

                <p className="mt-1 font-semibold text-purple-400">
                  {mood.substring(mood.indexOf(" ") + 1)}
                </p>

              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                AI analyzes the sentiment of your messages and
                adapts motivational responses accordingly.
              </p>

            </section>

            {/* Motivation Level */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Motivation Level
                </h2>

                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
                  AI Score
                </span>
              </div>

              <div className="mt-5">

                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-400">
                    Current level
                  </span>

                  <span className="font-semibold text-emerald-400">
                    {motivation}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{
                      width: `${motivation}%`,
                    }}
                  />
                </div>

              </div>

              <p className="mt-4 text-sm text-slate-400">
                Keep your consistency high and complete today's
                workout.
              </p>

            </section>

            {/* Personalized Guidance */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <h2 className="text-lg font-bold">
                Personalized Guidance
              </h2>

              <div className="mt-4 space-y-3">

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="font-semibold">
                    💪 Workout Guidance
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Get help with exercises, form, workout
                    routines and fitness goals.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="font-semibold">
                    🥗 Nutrition Support
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Ask for diet suggestions, healthy food choices
                    and nutrition guidance.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="font-semibold">
                    🔥 Motivation
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Receive motivational support when your
                    energy or consistency is low.
                  </p>
                </div>

              </div>
            </section>

            {/* AI Buddy Features */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <h2 className="text-lg font-bold">
                AI Buddy Features
              </h2>

              <div className="mt-4 space-y-3">

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="font-semibold">
                    💬 Conversational AI
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Fitness-focused conversations and guidance.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="font-semibold">
                    ❤️ Sentiment Analysis
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Detects positive, stressed and
                    low-motivation messages.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="font-semibold">
                    🎯 Personalized Guidance
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Provides fitness and nutrition guidance
                    based on your conversation.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="font-semibold">
                    🔥 Motivation
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Personalized motivational nudges to
                    keep you active.
                  </p>
                </div>

              </div>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}