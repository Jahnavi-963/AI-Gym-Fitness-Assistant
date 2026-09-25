"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

const API_URL = API_BASE;
type Exercise = {
  id: number;
  day: string;
  exercise: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  duration_minutes: number;
  target_muscle_group: string;
  is_completed: boolean;
};

type WorkoutPlan = {
  id: number;
  fitness_goal: string;
  fitness_level: string;
  available_days: string;
  workout_duration: number;
  preferred_exercises: string;
  plan_data: string;
  exercises: Exercise[];
};

export default function PlannerPage() {
  const [goal, setGoal] = useState("Weight Loss");
  const [level, setLevel] = useState("Beginner");
  const [days, setDays] = useState<string[]>([
    "Monday",
    "Wednesday",
    "Friday",
  ]);
  const [duration, setDuration] = useState(30);

  const [selectedExercises, setSelectedExercises] = useState<string[]>([
    "Squats",
    "Push-ups",
    "Lunges",
  ]);

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const exerciseOptions = [
    "Squats",
    "Push-ups",
    "Bicep Curls",
    "Lunges",
    "Shoulder Press",
  ];

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  function getToken() {
    return localStorage.getItem("token");
  }

  function toggleDay(day: string) {
    setDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  }

  function toggleExercise(exercise: string) {
    setSelectedExercises((current) =>
      current.includes(exercise)
        ? current.filter((item) => item !== exercise)
        : [...current, exercise]
    );
  }

  async function loadPlans() {
    try {
      const token = getToken();

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(`${API_URL}/planner/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load workout plans.");
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load workout plans.");
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function createPlan() {
    if (days.length === 0) {
      setMessage("Please select at least one workout day.");
      return;
    }

    if (selectedExercises.length === 0) {
      setMessage("Please select at least one exercise.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      // Step 1: Create workout plan
      const planResponse = await fetch(`${API_URL}/planner/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fitness_goal: goal,
          fitness_level: level,
          available_days: days.join(", "),
          workout_duration: duration,
          preferred_exercises: selectedExercises,
          plan_data: `${days.length}-day ${level.toLowerCase()} workout plan`,
        }),
      });

      if (!planResponse.ok) {
        throw new Error("Unable to create workout plan.");
      }

      const planData = await planResponse.json();
      const planId = planData.plan.id;

      // Step 2: Add exercises to the plan
      const dayCount = days.length;

      for (let index = 0; index < selectedExercises.length; index++) {
        const exercise = selectedExercises[index];

        const day = days[index % dayCount];

        const exerciseResponse = await fetch(
          `${API_URL}/planner/plans/${planId}/exercises`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              day,
              exercise,
              sets: 3,
              reps: level === "Beginner" ? 10 : 12,
              rest_seconds: 60,
              duration_minutes: Math.max(
                5,
                Math.floor(duration / selectedExercises.length)
              ),
              target_muscle_group: getMuscleGroup(exercise),
            }),
          }
        );

        if (!exerciseResponse.ok) {
          throw new Error(`Unable to add ${exercise}.`);
        }
      }

      setMessage("Workout plan created successfully!");

      await loadPlans();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while creating the plan.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleCompletion(
    exerciseId: number,
    currentStatus: boolean
  ) {
    try {
      const token = getToken();

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(
        `${API_URL}/planner/exercises/${exerciseId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_completed: !currentStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to update exercise.");
      }

      setMessage(
        !currentStatus
          ? "Workout exercise completed!"
          : "Workout exercise marked incomplete."
      );

      await loadPlans();
    } catch (error) {
      console.error(error);
      setMessage("Unable to update workout completion.");
    }
  }

  function getMuscleGroup(exercise: string) {
    switch (exercise) {
      case "Squats":
      case "Lunges":
        return "Legs";

      case "Push-ups":
        return "Chest & Triceps";

      case "Bicep Curls":
        return "Biceps";

      case "Shoulder Press":
        return "Shoulders";

      default:
        return "Full Body";
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Workout Planner</h1>

          <p className="mt-2 text-slate-400">
            Create a personalized weekly workout plan and track completed
            exercises.
          </p>
        </div>

        {/* Planner Form */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
          <h2 className="mb-5 text-xl font-semibold">
            Create Your Workout Plan
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Goal */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Fitness Goal
              </label>

              <select
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
              >
                <option>Weight Loss</option>
                <option>Muscle Gain</option>
                <option>Strength</option>
                <option>General Fitness</option>
                <option>Endurance</option>
              </select>
            </div>

            {/* Fitness Level */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Fitness Level
              </label>

              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Workout Duration: {duration} minutes
              </label>

              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={duration}
                onChange={(event) =>
                  setDuration(Number(event.target.value))
                }
                className="w-full"
              />
            </div>

            {/* Available Days */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Available Days
              </label>

              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      days.includes(day)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Exercises */}
          <div className="mt-6">
            <label className="mb-3 block text-sm font-medium text-slate-300">
              Preferred Exercises
            </label>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {exerciseOptions.map((exercise) => (
                <button
                  key={exercise}
                  type="button"
                  onClick={() => toggleExercise(exercise)}
                  className={`rounded-lg border px-4 py-3 text-left ${
                    selectedExercises.includes(exercise)
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-slate-700 bg-slate-800 text-slate-300"
                  }`}
                >
                  {selectedExercises.includes(exercise) ? "✓ " : ""}
                  {exercise}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            type="button"
            onClick={createPlan}
            disabled={loading}
            className="mt-7 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Plan..." : "Generate Workout Plan"}
          </button>

          {/* Message */}
          {message && (
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300">
              {message}
            </div>
          )}
        </section>

        {/* Saved Plans */}
        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-semibold">My Workout Plans</h2>

          {plans.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              No workout plans yet. Create your first personalized plan above.
            </div>
          ) : (
            <div className="space-y-6">
              {plans.map((plan) => {
                const completedCount = plan.exercises.filter(
                  (exercise) => exercise.is_completed
                ).length;

                const totalCount = plan.exercises.length;

                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    {/* Plan Header */}
                    <div className="flex flex-col justify-between gap-4 md:flex-row">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {plan.fitness_goal} Plan
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {plan.fitness_level} • {plan.workout_duration} min
                          workouts
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {plan.available_days}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-800 px-4 py-3 text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {completedCount}/{totalCount}
                        </div>

                        <div className="text-xs text-slate-400">
                          Exercises completed
                        </div>
                      </div>
                    </div>

                    {/* Exercises */}
                    <div className="mt-6 space-y-3">
                      {plan.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className={`rounded-xl border p-4 ${
                            exercise.is_completed
                              ? "border-green-700 bg-green-900/20"
                              : "border-slate-700 bg-slate-800"
                          }`}
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {exercise.exercise}
                                </h4>

                                {exercise.is_completed && (
                                  <span className="text-sm text-green-400">
                                    ✓ Completed
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-slate-400">
                                {exercise.day} • {exercise.target_muscle_group}
                              </p>

                              <p className="mt-1 text-sm text-slate-400">
                                {exercise.sets} sets × {exercise.reps} reps •
                                {" "}
                                {exercise.rest_seconds}s rest •{" "}
                                {exercise.duration_minutes} min
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleCompletion(
                                  exercise.id,
                                  exercise.is_completed
                                )
                              }
                              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                exercise.is_completed
                                  ? "bg-slate-700 text-slate-200"
                                  : "bg-green-600 text-white hover:bg-green-500"
                              }`}
                            >
                              {exercise.is_completed
                                ? "Mark Incomplete"
                                : "Mark Completed"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
