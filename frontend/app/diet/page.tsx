"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
type Meal = {
  meal_name: string;
  foods: string[];
  calories: number;
};

type DietPlan = {
  daily_calories: number;
  fitness_goal: string;
  diet_preference: string;
  meals: Meal[];
  grocery_list: string[];
};

type Profile = {
  name?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  fitness_goal?: string;
  activity_level?: string;
};

type NutritionLog = {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
};

type NutritionSummary = {
  success: boolean;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  food_entries: number;
};

export default function DietPage() {
  const [dailyCalories, setDailyCalories] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const [fitnessGoal, setFitnessGoal] =
    useState("weight_loss");

  const [dietPreference, setDietPreference] =
    useState("vegetarian");

  const [mealsPerDay, setMealsPerDay] =
    useState("4");

  const [dietPlan, setDietPlan] =
    useState<DietPlan | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // NUTRITION TRACKING
  // =========================

  const [nutritionLogs, setNutritionLogs] =
    useState<NutritionLog[]>([]);

  const [nutritionSummary, setNutritionSummary] =
    useState<NutritionSummary | null>(null);

  const [foodName, setFoodName] =
    useState("");

  const [foodCalories, setFoodCalories] =
    useState("");

  const [foodProtein, setFoodProtein] =
    useState("");

  const [foodCarbs, setFoodCarbs] =
    useState("");

  const [foodFats, setFoodFats] =
    useState("");

  const [nutritionLoading, setNutritionLoading] =
    useState(false);

  const [nutritionMessage, setNutritionMessage] =
    useState("");

  const [nutritionError, setNutritionError] =
    useState("");

  // =========================
  // LOAD PROFILE
  // =========================

  const loadProfileAndCalories = async (
    token: string
  ) => {
    setProfileLoading(true);

    try {
      const profileResponse = await fetch(
        `${API_BASE}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!profileResponse.ok) {
        return null;
      }

      const profile: Profile =
        await profileResponse.json();

      if (profile.fitness_goal) {
        setFitnessGoal(profile.fitness_goal);
      }

      if (
        profile.height &&
        profile.weight &&
        profile.age &&
        profile.gender &&
        profile.activity_level &&
        profile.fitness_goal
      ) {
        const fitnessResponse = await fetch(
             `${API_BASE}/fitness/calculate`,
             {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              height: profile.height,
              weight: profile.weight,
              age: profile.age,
              gender: profile.gender,
              activity_level:
                profile.activity_level,
              fitness_goal:
                profile.fitness_goal,
            }),
          }
        );

        if (fitnessResponse.ok) {
          const fitnessData =
            await fitnessResponse.json();

          setBmi(fitnessData.bmi);

          setDailyCalories(
            String(
              Math.round(
                fitnessData.daily_calories
              )
            )
          );

          return fitnessData;
        }
      }

      return null;
    } catch (err) {
      console.error(
        "Profile loading error:",
        err
      );

      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================
  // LOAD NUTRITION DATA
  // =========================

  const loadNutritionData = async (
    token: string
  ) => {
    try {
      const [logsResponse, summaryResponse] =
        await Promise.all([
          fetch(
            `${API_BASE}/nutrition/logs`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `${API_BASE}/nutrition/summary`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          ),
        ]);

      if (
        logsResponse.status === 401 ||
        summaryResponse.status === 401
      ) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem("token");

        window.location.href = "/login";

        return;
      }

      if (logsResponse.ok) {
        const logsData =
          await logsResponse.json();

        setNutritionLogs(
          logsData.logs || []
        );
      }

      if (summaryResponse.ok) {
        const summaryData =
          await summaryResponse.json();

        setNutritionSummary(
          summaryData
        );
      }
    } catch (err) {
      console.error(
        "Nutrition loading error:",
        err
      );
    }
  };

  // =========================
  // INITIAL PAGE LOAD
  // =========================

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    loadProfileAndCalories(token);
    loadNutritionData(token);
  }, []);

  // =========================
  // GENERATE DIET PLAN
  // =========================

  const generateDietPlan = async () => {
    setLoading(true);
    setError("");
    setDietPlan(null);

    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      const fitnessData =
        await loadProfileAndCalories(token);

      let calories = dailyCalories;

      if (fitnessData?.daily_calories) {
        calories = String(
          Math.round(
            fitnessData.daily_calories
          )
        );
      }

      if (!calories) {
        calories = "2000";
        setDailyCalories("2000");
      }

      const profileResponse = await fetch(
  `    ${API_BASE}/auth/me`,
         {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            daily_calories:
              Number(calories),

            fitness_goal:
              fitnessGoal,

            diet_preference:
              dietPreference,

            meals_per_day:
              Number(mealsPerDay),
          }),
        }
      );

      const data =
        await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          data.detail ||
            "Failed to generate diet plan"
        );
      }

      setDietPlan(data);

      // Refresh nutrition data
      await loadNutritionData(token);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Unable to generate diet plan. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOG FOOD
  // =========================

  const logFood = async () => {
    setNutritionError("");
    setNutritionMessage("");

    if (!foodName.trim()) {
      setNutritionError(
        "Please enter a food name."
      );
      return;
    }

    if (!foodCalories) {
      setNutritionError(
        "Please enter calories."
      );
      return;
    }

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setNutritionLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/nutrition/log`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            food_name:
              foodName.trim(),

            calories:
              Number(foodCalories),

            protein:
              Number(foodProtein || 0),

            carbs:
              Number(foodCarbs || 0),

            fats:
              Number(foodFats || 0),
          }),
        }
      );

      const data =
        await response.json();

      if (response.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem("token");

        window.location.href = "/login";

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to log food."
        );
      }

      setNutritionMessage(
        "Food logged successfully! ✅"
      );

      setFoodName("");
      setFoodCalories("");
      setFoodProtein("");
      setFoodCarbs("");
      setFoodFats("");

      await loadNutritionData(token);
    } catch (err: any) {
      console.error(err);

      setNutritionError(
        err.message ||
          "Unable to log food."
      );
    } finally {
      setNutritionLoading(false);
    }
  };

  // =========================
  // NUTRITION CALCULATIONS
  // =========================

  const targetCalories =
    Number(
      dietPlan?.daily_calories ||
        dailyCalories ||
        2000
    );

  const consumedCalories =
    nutritionSummary?.total_calories || 0;

  const remainingCalories =
    Math.max(
      targetCalories -
        consumedCalories,
      0
    );

  const progressPercentage =
    targetCalories > 0
      ? Math.min(
          Math.round(
            (consumedCalories /
              targetCalories) *
              100
          ),
          100
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}

      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-cyan-400">
              FITAI
            </p>

            <h1 className="text-2xl font-bold">
              AI Dietician & Calorie Coach
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Personalized nutrition plans based on your fitness goal.
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
          >
            ← Dashboard
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-3">

        {/* Input Section */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-1">

          <h2 className="text-xl font-bold">
            Create Your Diet Plan
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Your profile information is used to calculate BMI and daily calorie requirements.
          </p>

          {/* BMI / Calories */}

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Your BMI
              </p>

              <p className="mt-1 text-xl font-bold text-cyan-400">
                {bmi !== null
                  ? bmi.toFixed(2)
                  : "--"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs text-slate-400">
                Daily Calories
              </p>

              <p className="mt-1 text-xl font-bold text-green-400">
                {dailyCalories || "--"}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">

            {/* Calories */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Daily Calories
              </label>

              <input
                type="number"
                value={dailyCalories}
                onChange={(e) =>
                  setDailyCalories(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-cyan-400"
                min="1000"
                max="5000"
                placeholder="Auto calculated"
              />

              <p className="mt-1 text-xs text-slate-500">
                Automatically calculated from your fitness profile.
              </p>
            </div>

            {/* Goal */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Fitness Goal
              </label>

              <select
                value={fitnessGoal}
                onChange={(e) =>
                  setFitnessGoal(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-cyan-400"
              >
                <option value="weight_loss">
                  Weight Loss
                </option>

                <option value="muscle_gain">
                  Muscle Gain
                </option>

                <option value="maintenance">
                  Maintenance
                </option>

                <option value="general_fitness">
                  General Fitness
                </option>
              </select>
            </div>

            {/* Diet Preference */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Diet Preference
              </label>

              <select
                value={dietPreference}
                onChange={(e) =>
                  setDietPreference(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-cyan-400"
              >
                <option value="vegetarian">
                  Vegetarian
                </option>

                <option value="vegan">
                  Vegan
                </option>

                <option value="non_vegetarian">
                  Non-Vegetarian
                </option>
              </select>
            </div>

            {/* Meals */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Meals Per Day
              </label>

              <select
                value={mealsPerDay}
                onChange={(e) =>
                  setMealsPerDay(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-cyan-400"
              >
                <option value="3">
                  3 Meals
                </option>

                <option value="4">
                  4 Meals
                </option>

                <option value="5">
                  5 Meals
                </option>
              </select>
            </div>

            {/* Generate Button */}

            <button
              onClick={generateDietPlan}
              disabled={
                loading ||
                profileLoading
              }
              className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Generating Plan..."
                : profileLoading
                ? "Calculating Calories..."
                : "Generate AI Diet Plan"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>
        </section>

        {/* Results */}

        <section className="lg:col-span-2">

          {!dietPlan && !loading && (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
              <div>
                <div className="text-6xl">
                  🥗
                </div>

                <h2 className="mt-5 text-2xl font-bold">
                  Your Personalized Diet Plan
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-slate-400">
                  Your BMI and daily calorie requirement will be calculated from your profile before generating your personalized nutrition plan.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
              <div className="text-center">

                <div className="text-5xl">
                  🤖
                </div>

                <p className="mt-4 font-semibold">
                  AI is preparing your nutrition plan...
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Calculating BMI, calories, meals and grocery recommendations.
                </p>
              </div>
            </div>
          )}

          {dietPlan && !loading && (
            <div className="space-y-6">

              {/* Summary */}

              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                  <div>
                    <p className="text-sm font-semibold text-cyan-400">
                      AI GENERATED PLAN
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      Personalized Nutrition Plan
                    </h2>
                  </div>

                  <div className="rounded-xl bg-cyan-500/10 px-5 py-3 text-center">

                    <p className="text-xs text-slate-400">
                      Daily Target
                    </p>

                    <p className="text-2xl font-bold text-cyan-400">
                      {dietPlan.daily_calories} kcal
                    </p>

                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">

                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">
                    🎯{" "}
                    {dietPlan.fitness_goal.replace(
                      /_/g,
                      " "
                    )}
                  </span>

                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">
                    🥗{" "}
                    {dietPlan.diet_preference.replace(
                      /_/g,
                      " "
                    )}
                  </span>

                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">
                    🍽️{" "}
                    {dietPlan.meals.length} Meals
                  </span>

                  {bmi !== null && (
                    <span className="rounded-full bg-slate-800 px-4 py-2 text-sm">
                      ⚖️ BMI{" "}
                      {bmi.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Meals */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-xl font-bold">
                  Daily Meal Plan
                </h2>

                <div className="mt-5 space-y-4">

                  {dietPlan.meals.map(
                    (meal, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-4 rounded-xl bg-slate-800 p-5 md:flex-row md:items-center md:justify-between"
                      >

                        <div className="flex items-center gap-4">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl">
                            {index === 0
                              ? "🌅"
                              : index === 1
                              ? "🍛"
                              : index === 2
                              ? "🥗"
                              : "🌙"}
                          </div>

                          <div>

                            <p className="font-bold">
                              {meal.meal_name}
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                              {meal.foods.join(
                                ", "
                              )}
                            </p>

                          </div>
                        </div>

                        <span className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold">
                          {meal.calories} kcal
                        </span>

                      </div>
                    )
                  )}

                </div>
              </div>

              {/* Grocery List */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <h2 className="text-xl font-bold">
                  🛒 Grocery List
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Ingredients recommended for your personalized plan.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  {dietPlan.grocery_list.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-slate-800 px-4 py-3 text-sm"
                      >
                        ✓ {item}
                      </div>
                    )
                  )}

                </div>
              </div>

              {/* ========================= */}
              {/* NUTRITION TRACKING */}
              {/* ========================= */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                  <div>
                    <h2 className="text-xl font-bold">
                      📊 Nutrition Tracking
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      Track your daily food intake and progress toward your calorie target.
                    </p>
                  </div>

                  <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
                    {nutritionSummary?.food_entries || 0} entries today
                  </span>

                </div>

                {/* Progress */}

                <div className="mt-6">

                  <div className="mb-2 flex justify-between text-sm">

                    <span className="text-slate-400">
                      Daily calorie progress
                    </span>

                    <span className="font-semibold text-cyan-400">
                      {progressPercentage}%
                    </span>

                  </div>

                  <div className="h-4 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{
                        width:
                          `${progressPercentage}%`,
                      }}
                    />

                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3 text-center">

                    <div className="rounded-xl bg-slate-800 p-3">

                      <p className="text-xs text-slate-500">
                        Consumed
                      </p>

                      <p className="mt-1 font-bold text-cyan-400">
                        {Math.round(
                          consumedCalories
                        )} kcal
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-800 p-3">

                      <p className="text-xs text-slate-500">
                        Target
                      </p>

                      <p className="mt-1 font-bold text-green-400">
                        {Math.round(
                          targetCalories
                        )} kcal
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-800 p-3">

                      <p className="text-xs text-slate-500">
                        Remaining
                      </p>

                      <p className="mt-1 font-bold text-yellow-400">
                        {Math.round(
                          remainingCalories
                        )} kcal
                      </p>

                    </div>

                  </div>
                </div>

                {/* Macros */}

                <div className="mt-5 grid grid-cols-3 gap-3">

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">

                    <p className="text-xs text-slate-500">
                      Protein
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {nutritionSummary?.total_protein || 0} g
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">

                    <p className="text-xs text-slate-500">
                      Carbs
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {nutritionSummary?.total_carbs || 0} g
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center">

                    <p className="text-xs text-slate-500">
                      Fats
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {nutritionSummary?.total_fats || 0} g
                    </p>

                  </div>

                </div>

                {/* Log Food Form */}

                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">

                  <h3 className="font-bold">
                    ➕ Log Food Intake
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the food you consumed today.
                  </p>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">

                    <input
                      type="text"
                      value={foodName}
                      onChange={(e) =>
                        setFoodName(
                          e.target.value
                        )
                      }
                      placeholder="Food name"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                    />

                    <input
                      type="number"
                      value={foodCalories}
                      onChange={(e) =>
                        setFoodCalories(
                          e.target.value
                        )
                      }
                      placeholder="Calories (kcal)"
                      min="0"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                    />

                    <input
                      type="number"
                      value={foodProtein}
                      onChange={(e) =>
                        setFoodProtein(
                          e.target.value
                        )
                      }
                      placeholder="Protein (g)"
                      min="0"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                    />

                    <input
                      type="number"
                      value={foodCarbs}
                      onChange={(e) =>
                        setFoodCarbs(
                          e.target.value
                        )
                      }
                      placeholder="Carbs (g)"
                      min="0"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                    />

                    <input
                      type="number"
                      value={foodFats}
                      onChange={(e) =>
                        setFoodFats(
                          e.target.value
                        )
                      }
                      placeholder="Fats (g)"
                      min="0"
                      className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
                    />

                  </div>

                  <button
                    onClick={logFood}
                    disabled={
                      nutritionLoading
                    }
                    className="mt-4 w-full rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {nutritionLoading
                      ? "Saving Food..."
                      : "Log Food"}
                  </button>

                  {nutritionMessage && (
                    <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                      {nutritionMessage}
                    </div>
                  )}

                  {nutritionError && (
                    <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                      {nutritionError}
                    </div>
                  )}

                </div>

                {/* Recent Food Logs */}

                <div className="mt-6">

                  <div className="flex items-center justify-between">

                    <h3 className="font-bold">
                      🍽️ Recent Food Intake
                    </h3>

                    <span className="text-xs text-slate-500">
                      Database records
                    </span>

                  </div>

                  {nutritionLogs.length === 0 ? (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-500">
                      No food entries yet. Log your first meal above.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">

                      {nutritionLogs
                        .slice(0, 5)
                        .map((log) => (
                          <div
                            key={log.id}
                            className="flex flex-col gap-3 rounded-xl bg-slate-800 p-4 md:flex-row md:items-center md:justify-between"
                          >

                            <div>

                              <p className="font-semibold">
                                {log.food_name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Protein{" "}
                                {log.protein}g
                                {" • "}
                                Carbs{" "}
                                {log.carbs}g
                                {" • "}
                                Fats{" "}
                                {log.fats}g
                              </p>

                            </div>

                            <div className="text-left md:text-right">

                              <p className="font-bold text-cyan-400">
                                {log.calories} kcal
                              </p>

                              <p className="text-xs text-slate-500">
                                {new Date(
                                  log.created_at
                                ).toLocaleString()}
                              </p>

                            </div>

                          </div>
                        ))}

                    </div>
                  )}

                </div>

              </div>

              {/* AI Dietician Tips */}

              <div className="rounded-2xl border border-green-500/20 bg-slate-900 p-6">

                <div className="flex gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xl">
                    🥗
                  </div>

                  <div>

                    <h2 className="font-bold">
                      AI Dietician Tips
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Stay consistent with your meals, drink enough water, include protein and vegetables, and adjust your nutrition plan based on your fitness progress.
                    </p>

                  </div>
                </div>
              </div>

            </div>
          )}

        </section>
      </div>
    </main>
  );
}