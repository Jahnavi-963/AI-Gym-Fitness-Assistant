"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";

type Gym = {
  id: number;
  name: string;
  location: string;
  distance: string;
  rating: number;
  programs: string[];
  challenges: string[];
  goalMatch: string;
  description: string;
};

type WorkoutPlanItem = {
  day: string;
  exercise: string;
  sets: number;
  reps: number;
  rest: string;
  duration: string;
  muscle: string;
  intensity: string;
  completed: boolean;
};
const fallbackGyms: Gym[] = [
  // ---------------- VADODARA ----------------
  {
    id: 1,
    name: "Urban Fitness",
    location: "Saiyed Vasna, Vadodara",
    distance: "1.7 km",
    rating: 4.7,
    programs: ["Weight Loss", "Strength Training", "Cardio"],
    challenges: ["30 Day Fitness Challenge", "Weight Loss Challenge"],
    goalMatch: "Weight Loss & Fitness",
    description: "Modern fitness center with strength and cardio training.",
  },
  {
    id: 2,
    name: "Evolve 360 Fitness Club",
    location: "Bhayli, Vadodara",
    distance: "4.7 km",
    rating: 4.9,
    programs: ["Muscle Gain", "Strength Training", "Bodybuilding"],
    challenges: ["Muscle Gain Challenge", "Strength Challenge"],
    goalMatch: "Muscle Gain",
    description: "Strength-focused gym suitable for muscle building.",
  },
  {
    id: 3,
    name: "Gymnation Gym",
    location: "Tandalja, Vadodara",
    distance: "4.1 km",
    rating: 4.9,
    programs: ["Weight Loss", "HIIT", "Cardio"],
    challenges: ["Fat Loss Challenge", "30 Day HIIT"],
    goalMatch: "Weight Loss",
    description: "Fitness center offering cardio and high-intensity workouts.",
  },

  // ---------------- AHMEDABAD ----------------
  {
    id: 4,
    name: "Anytime Fitness Navrangpura",
    location: "Navrangpura, Ahmedabad",
    distance: "2.1 km",
    rating: 4.6,
    programs: ["Muscle Gain", "Strength Training", "Cardio"],
    challenges: ["Strength Challenge", "30 Day Fitness"],
    goalMatch: "Muscle Gain & Strength",
    description: "Gym with strength and cardio training facilities.",
  },
  {
    id: 5,
    name: "BodyForge Gym",
    location: "New Colony, Ahmedabad",
    distance: "3.4 km",
    rating: 4.5,
    programs: ["Muscle Gain", "Bodybuilding", "Strength Training"],
    challenges: ["Bodybuilding Challenge", "Strength Challenge"],
    goalMatch: "Muscle Gain",
    description: "Strength and bodybuilding focused fitness center.",
  },
  {
    id: 6,
    name: "PrimeFit Fitness",
    location: "Satellite, Ahmedabad",
    distance: "5.2 km",
    rating: 4.7,
    programs: ["Weight Loss", "Yoga", "Cardio"],
    challenges: ["Weight Loss Challenge", "Fitness Challenge"],
    goalMatch: "Weight Loss",
    description: "Fitness programs focused on weight management and wellness.",
  },

  // ---------------- SURAT ----------------
  {
    id: 7,
    name: "SweatBox Gym",
    location: "Ring Road, Surat",
    distance: "2.8 km",
    rating: 4.6,
    programs: ["Strength Training", "Cardio", "HIIT"],
    challenges: ["HIIT Challenge", "30 Day Fitness"],
    goalMatch: "Fitness & Weight Loss",
    description: "Training center with cardio and high-intensity workouts.",
  },
  {
    id: 8,
    name: "MuscleZone Fitness",
    location: "Vesu, Surat",
    distance: "4.1 km",
    rating: 4.8,
    programs: ["Muscle Gain", "Bodybuilding", "Strength Training"],
    challenges: ["Muscle Gain Challenge", "Bodybuilding Challenge"],
    goalMatch: "Muscle Gain",
    description: "Muscle building and strength training focused gym.",
  },
  {
    id: 9,
    name: "FitLife Studio",
    location: "Adajan, Surat",
    distance: "3.6 km",
    rating: 4.5,
    programs: ["Weight Loss", "Yoga", "Cardio"],
    challenges: ["Weight Loss Challenge", "Wellness Challenge"],
    goalMatch: "Weight Loss",
    description: "Fitness and wellness studio for general fitness.",
  },

  // ---------------- MUMBAI ----------------
  {
    id: 10,
    name: "FitNation Gym",
    location: "Main Market, Mumbai",
    distance: "2.4 km",
    rating: 4.6,
    programs: ["Muscle Gain", "Strength Training", "Cardio"],
    challenges: ["Strength Challenge", "30 Day Fitness"],
    goalMatch: "Muscle Gain",
    description: "Urban fitness center with strength and group training.",
  },
  {
    id: 11,
    name: "Nitrro Fitness",
    location: "Mumbai",
    distance: "4.3 km",
    rating: 4.7,
    programs: ["Strength Training", "HIIT", "Cardio"],
    challenges: ["HIIT Challenge", "Fitness Challenge"],
    goalMatch: "Fitness & Strength",
    description: "Premium-style fitness training with multiple workout programs.",
  },
  {
    id: 12,
    name: "Strength Gym",
    location: "Mumbai",
    distance: "3.1 km",
    rating: 4.5,
    programs: ["Muscle Gain", "Bodybuilding", "Strength Training"],
    challenges: ["Muscle Gain Challenge", "Bodybuilding Challenge"],
    goalMatch: "Muscle Gain",
    description: "Strength and bodybuilding focused training facility.",
  },

  // ---------------- PUNE ----------------
  {
    id: 13,
    name: "ApexFit Studio",
    location: "Central Avenue, Pune",
    distance: "2.5 km",
    rating: 4.7,
    programs: ["Strength Training", "Cardio", "Muscle Gain"],
    challenges: ["Strength Challenge", "Fitness Challenge"],
    goalMatch: "Muscle Gain",
    description: "Modern fitness studio with strength and cardio programs.",
  },
  {
    id: 14,
    name: "A2B Fitness Club",
    location: "Pune",
    distance: "3.8 km",
    rating: 4.5,
    programs: ["Weight Loss", "Cardio", "HIIT"],
    challenges: ["Weight Loss Challenge", "HIIT Challenge"],
    goalMatch: "Weight Loss",
    description: "Fitness club focused on cardio and weight management.",
  },
  {
    id: 15,
    name: "Nucleus Fitness",
    location: "Pune",
    distance: "4.6 km",
    rating: 4.8,
    programs: ["Muscle Gain", "Bodybuilding", "Strength Training"],
    challenges: ["Muscle Gain Challenge", "Strength Challenge"],
    goalMatch: "Muscle Gain",
    description: "Strength-focused fitness center for progressive training.",
  },

  // ---------------- HYDERABAD ----------------
  {
    id: 16,
    name: "Fitness Edge Gym",
    location: "Kondapur, Hyderabad",
    distance: "2.2 km",
    rating: 4.7,
    programs: ["Strength Training", "Muscle Gain", "Cardio"],
    challenges: ["Strength Challenge", "Muscle Gain Challenge"],
    goalMatch: "Muscle Gain",
    description: "Fitness center offering strength and cardio training.",
  },
  {
    id: 17,
    name: "Core Fitness Gym",
    location: "Madinaguda, Hyderabad",
    distance: "4.0 km",
    rating: 4.6,
    programs: ["Weight Loss", "HIIT", "Cardio"],
    challenges: ["Fat Loss Challenge", "HIIT Challenge"],
    goalMatch: "Weight Loss",
    description: "Cardio and high-intensity training focused gym.",
  },
  {
    id: 18,
    name: "ZenFit Wellness & Gym",
    location: "Hyderabad",
    distance: "5.1 km",
    rating: 4.5,
    programs: ["Yoga", "Cardio", "Fitness Maintenance"],
    challenges: ["Wellness Challenge", "Fitness Challenge"],
    goalMatch: "General Fitness",
    description: "Wellness-focused fitness center for balanced training.",
  },

  // ---------------- BENGALURU ----------------
  {
    id: 19,
    name: "RiseUp Fitness",
    location: "Sector 14, Bengaluru",
    distance: "2.7 km",
    rating: 4.7,
    programs: ["Strength Training", "Muscle Gain", "Cardio"],
    challenges: ["Strength Challenge", "Muscle Gain Challenge"],
    goalMatch: "Muscle Gain",
    description: "Fitness center with personal training and strength programs.",
  },
  {
    id: 20,
    name: "Quadz Fitness",
    location: "Bengaluru",
    distance: "3.5 km",
    rating: 4.6,
    programs: ["Muscle Gain", "Bodybuilding", "Strength Training"],
    challenges: ["Bodybuilding Challenge", "Strength Challenge"],
    goalMatch: "Muscle Gain",
    description: "Strength and bodybuilding focused fitness facility.",
  },
  {
    id: 21,
    name: "Body Station Gym",
    location: "Bengaluru",
    distance: "4.2 km",
    rating: 4.5,
    programs: ["Weight Loss", "Cardio", "HIIT"],
    challenges: ["Weight Loss Challenge", "HIIT Challenge"],
    goalMatch: "Weight Loss",
    description: "Cardio and fitness training center.",
  },

  // ---------------- DELHI ----------------
  {
    id: 22,
    name: "Iron Bar Fitness",
    location: "Delhi",
    distance: "2.9 km",
    rating: 4.7,
    programs: ["Strength Training", "Muscle Gain", "Bodybuilding"],
    challenges: ["Strength Challenge", "Bodybuilding Challenge"],
    goalMatch: "Muscle Gain",
    description: "Strength and bodybuilding oriented fitness center.",
  },
  {
    id: 23,
    name: "Sun Fitness Xpert",
    location: "Delhi",
    distance: "4.0 km",
    rating: 4.6,
    programs: ["Cardio", "Weight Loss", "HIIT"],
    challenges: ["Weight Loss Challenge", "HIIT Challenge"],
    goalMatch: "Weight Loss",
    description: "Cardio and high-intensity fitness programs.",
  },
  {
    id: 24,
    name: "The Body Mechanic Gym",
    location: "Delhi",
    distance: "5.0 km",
    rating: 4.5,
    programs: ["Strength Training", "Fitness Maintenance", "Cardio"],
    challenges: ["Fitness Challenge", "Strength Challenge"],
    goalMatch: "General Fitness",
    description: "General fitness and strength training facility.",
  },

  // ---------------- CHENNAI ----------------
  {
    id: 25,
    name: "MuscleFactory Gym",
    location: "Main Market, Chennai",
    distance: "2.6 km",
    rating: 4.7,
    programs: ["Muscle Gain", "Strength Training", "Bodybuilding"],
    challenges: ["Muscle Gain Challenge", "Bodybuilding Challenge"],
    goalMatch: "Muscle Gain",
    description: "Strength and muscle building focused gym.",
  },
  {
    id: 26,
    name: "ACSES Fitness Studio",
    location: "Adyar, Chennai",
    distance: "3.8 km",
    rating: 4.6,
    programs: ["Weight Loss", "Cardio", "Fitness Maintenance"],
    challenges: ["Weight Loss Challenge", "Fitness Challenge"],
    goalMatch: "Weight Loss",
    description: "Fitness studio with cardio and general fitness programs.",
  },
];

const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const exerciseOptions = [
  "Squats",
  "Push-ups",
  "Bicep Curls",
  "Lunges",
  "Shoulder Press",
  "Cardio",
  "Plank",
];

export default function GymRecommenderPage() {
  const [goal, setGoal] = useState("weight_loss");
  const [location, setLocation] = useState("Vadodara");
  const [program, setProgram] = useState("All Programs");

  const [fitnessLevel, setFitnessLevel] = useState("Beginner");

  const [availableDays, setAvailableDays] = useState<string[]>([
    "Monday",
    "Wednesday",
    "Friday",
  ]);

  const [workoutDuration, setWorkoutDuration] = useState("45");

  const [preferredExercises, setPreferredExercises] = useState<string[]>([
    "Squats",
    "Push-ups",
    "Bicep Curls",
  ]);

  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [showPlanner, setShowPlanner] = useState(false);
  const [joinedChallenge, setJoinedChallenge] = useState("");
  const [matchScore, setMatchScore] = useState(94);

  const [gyms, setGyms] = useState<Gym[]>(fallbackGyms);
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [gymError, setGymError] = useState("");
  const [usingLiveGyms, setUsingLiveGyms] = useState(false);

  const [plan, setPlan] = useState<WorkoutPlanItem[]>([
    {
      day: "Monday",
      exercise: "Squats",
      sets: 3,
      reps: 12,
      rest: "60 sec",
      duration: "15 min",
      muscle: "Legs & Glutes",
      intensity: "Moderate",
      completed: false,
    },
    {
      day: "Wednesday",
      exercise: "Push-ups",
      sets: 3,
      reps: 10,
      rest: "60 sec",
      duration: "15 min",
      muscle: "Chest & Triceps",
      intensity: "Moderate",
      completed: false,
    },
    {
      day: "Friday",
      exercise: "Bicep Curls",
      sets: 3,
      reps: 12,
      rest: "60 sec",
      duration: "15 min",
      muscle: "Biceps",
      intensity: "Moderate",
      completed: false,
    },
  ]);

  const filteredGyms = useMemo(() => {
    return gyms.filter((gym) => {
      const matchesLocation =
        usingLiveGyms ||
        location.trim() === "" ||
        gym.location.toLowerCase().includes(location.trim().toLowerCase());

      const matchesProgram =
        program === "All Programs" ||
        gym.programs.some(
          (item) => item.toLowerCase() === program.toLowerCase()
        );

      return matchesLocation && matchesProgram;
    });
  }, [gyms, location, program, usingLiveGyms]);

  useEffect(() => {
    const savedGoal = localStorage.getItem("fitness_goal");

    if (savedGoal) {
      setGoal(savedGoal);
    }
  }, []);

  useEffect(() => {
    async function fetchGyms() {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const city = location.trim();

      if (!city) {
        setGyms(fallbackGyms);
        setUsingLiveGyms(false);
        setGymError("");
        return;
      }

      setLoadingGyms(true);
      setGymError("");

      try {
        const headers: HeadersInit = {};

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_BASE}/gyms/search?location=${encodeURIComponent(city)}`,
          { headers }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail || "Unable to fetch gym recommendations."
          );
        }

        const backendGyms = Array.isArray(data)
          ? data
          : data?.gyms || data?.results || data?.data || [];

        const normalizedGyms: Gym[] = backendGyms.map(
          (gym: any, index: number) => ({
            id: Number(gym.id ?? gym.place_id ?? index + 1),
            name:
              gym.name ||
              gym.display_name?.split(",")[0] ||
              "Fitness Center",
            location:
              gym.location ||
              gym.address ||
              gym.display_name ||
              city,
            distance:
              gym.distance !== undefined &&
              gym.distance !== null &&
              gym.distance !== ""
                ? `${gym.distance} km`
                : "Nearby",
            rating: Number(gym.rating ?? gym.stars ?? 0) || 0,
            programs:
              Array.isArray(gym.programs) && gym.programs.length > 0
                ? gym.programs
                : ["General Fitness"],
            challenges: Array.isArray(gym.challenges)
              ? gym.challenges
              : [],
            goalMatch:
              gym.goalMatch ||
              gym.goal_match ||
              "Suitable for your fitness goal",
            description:
              gym.description ||
              "Nearby fitness facility found using the gym recommendation service.",
          })
        );

        if (normalizedGyms.length > 0) {
          setGyms(normalizedGyms);
          setUsingLiveGyms(true);
        } else {
          const fallbackForCity = fallbackGyms.filter((gym) =>
            gym.location.toLowerCase().includes(city.toLowerCase())
          );
          setGyms(fallbackForCity.length > 0 ? fallbackForCity : fallbackGyms);
          setUsingLiveGyms(false);
        }
      } catch (error: any) {
        const fallbackForCity = fallbackGyms.filter((gym) =>
          gym.location.toLowerCase().includes(city.toLowerCase())
        );

        setGyms(fallbackForCity.length > 0 ? fallbackForCity : fallbackGyms);
        setUsingLiveGyms(false);
        setGymError(
          error?.message ||
            "Live gym service unavailable. Showing available sample recommendations."
        );
      } finally {
        setLoadingGyms(false);
      }
    }

    fetchGyms();
  }, [location]);

  function getGoalLabel() {
    if (goal === "weight_loss") return "Weight Loss";
    if (goal === "muscle_gain") return "Muscle Gain";
    if (goal === "maintenance") return "Fitness Maintenance";
    return "General Fitness";
  }

  function toggleDay(day: string) {
    setAvailableDays((current) => {
      if (current.includes(day)) {
        return current.filter((item) => item !== day);
      }

      return [...current, day];
    });
  }

  function toggleExercise(exercise: string) {
    setPreferredExercises((current) => {
      if (current.includes(exercise)) {
        return current.filter((item) => item !== exercise);
      }

      return [...current, exercise];
    });
  }

  function generatePlan() {
    let score = 94;

    if (goal === "weight_loss") {
      if (
        program === "Weight Loss" ||
        program === "Cardio" ||
        program === "HIIT"
      ) {
        score = 98;
      } else if (program !== "All Programs") {
        score = 92;
      }
    } else if (goal === "muscle_gain") {
      if (
        program === "Muscle Gain" ||
        program === "Strength Training" ||
        program === "Bodybuilding"
      ) {
        score = 98;
      } else if (program !== "All Programs") {
        score = 92;
      }
    } else if (goal === "maintenance") {
      score = 96;
    }

    if (fitnessLevel === "Advanced") {
      score += 1;
    }

    if (preferredExercises.length >= 3) {
      score += 1;
    }

    setMatchScore(Math.min(score, 100));

    const selectedDays =
      availableDays.length > 0 ? availableDays : ["Monday"];

    const selectedExercises =
      preferredExercises.length > 0 ? preferredExercises : ["Squats"];

    const durationNumber = Number(workoutDuration);

    const newPlan: WorkoutPlanItem[] = selectedDays.map(
      (day, index) => {
        const exercise =
          selectedExercises[index % selectedExercises.length];

        let sets = 3;
        let reps = 12;
        let muscle = "Full Body";
        let intensity = "Moderate";

        if (fitnessLevel === "Beginner") {
          sets = 2;
          reps = 10;
          intensity = "Light";
        } else if (fitnessLevel === "Intermediate") {
          sets = 3;
          reps = 12;
          intensity = "Moderate";
        } else {
          sets = 4;
          reps = 12;
          intensity = "High";
        }

        if (exercise === "Squats") {
          muscle = "Legs & Glutes";
        } else if (exercise === "Push-ups") {
          muscle = "Chest & Triceps";
        } else if (exercise === "Bicep Curls") {
          muscle = "Biceps";
        } else if (exercise === "Lunges") {
          muscle = "Legs & Glutes";
        } else if (exercise === "Shoulder Press") {
          muscle = "Shoulders & Triceps";
        } else if (exercise === "Cardio") {
          muscle = "Cardiovascular";
        } else if (exercise === "Plank") {
          muscle = "Core";
        }

        return {
          day,
          exercise,
          sets,
          reps,
          rest: fitnessLevel === "Advanced" ? "45 sec" : "60 sec",
          duration: `${Math.max(
            10,
            Math.round(durationNumber / selectedDays.length)
          )} min`,
          muscle,
          intensity,
          completed: false,
        };
      }
    );

    setPlan(newPlan);

    localStorage.setItem("fitness_goal", goal);
    localStorage.setItem(
      "fitness_level",
      fitnessLevel
    );
    localStorage.setItem(
      "available_days",
      JSON.stringify(availableDays)
    );
    localStorage.setItem(
      "workout_duration",
      workoutDuration
    );
    localStorage.setItem(
      "preferred_exercises",
      JSON.stringify(preferredExercises)
    );

    setShowPlanner(true);

    setTimeout(() => {
      document
        .getElementById("personalized-plan")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function toggleCompleted(index: number) {
    setPlan((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              completed: !item.completed,
            }
          : item
      )
    );
  }

  const completedCount = plan.filter(
    (item) => item.completed
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-800 bg-slate-900 p-6 lg:block">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-cyan-400">
              FITAI
            </h1>

            <p className="mt-1 text-xs text-slate-400">
              AI Fitness Assistant
            </p>
          </div>

          <nav className="space-y-2">
            <a
              href="/"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Dashboard
            </a>

            <a
              href="/trainer"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              AI Gym Trainer
            </a>

            <a
              href="/diet"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              AI Dietician
            </a>

            <a
              href="/habits"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Habit Tracker
            </a>

            <a
              href="/buddy"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Virtual Gym Buddy
            </a>

            <a
              href="/performance"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Performance
            </a>

            <div className="rounded-xl bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-400">
              Gym Recommender
            </div>

            <a
              href="/smart-gym"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Smart Gym
            </a>

            <a
              href="/analytics"
              className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
            >
              Analytics
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          <div className="mx-auto max-w-7xl p-5 md:p-8">

            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <a
                  href="/"
                  className="mb-3 inline-block text-sm text-cyan-400 hover:text-cyan-300"
                >
                  ← Back to Dashboard
                </a>

                <h2 className="text-3xl font-bold">
                  Gym Recommender & Planner
                </h2>

                <p className="mt-2 text-slate-400">
                  AI-powered gym recommendations and personalized workout
                  planning.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  Current Goal
                </p>

                <p className="mt-1 font-semibold text-cyan-400">
                  {getGoalLabel()}
                </p>
              </div>
            </div>

            {/* AI Recommendation Preferences */}
            <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold">
                  AI Recommendation Preferences
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Configure your fitness preferences to generate a
                  personalized workout plan.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {/* Fitness Goal */}
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Fitness Goal
                  </label>

                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="weight_loss">
                      Weight Loss
                    </option>

                    <option value="muscle_gain">
                      Muscle Gain
                    </option>

                    <option value="maintenance">
                      Fitness Maintenance
                    </option>

                    <option value="general">
                      General Fitness
                    </option>
                  </select>
                </div>

                {/* Fitness Level */}
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Fitness Level
                  </label>

                  <select
                    value={fitnessLevel}
                    onChange={(e) =>
                      setFitnessLevel(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Location
                  </label>

                  <input
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="Enter city"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>

                {/* Preferred Program */}
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Preferred Program
                  </label>

                  <select
                    value={program}
                    onChange={(e) =>
                      setProgram(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option>All Programs</option>
                    <option>Weight Loss</option>
                    <option>Muscle Gain</option>
                    <option>Strength Training</option>
                    <option>Cardio</option>
                    <option>Yoga</option>
                    <option>HIIT</option>
                    <option>Bodybuilding</option>
                  </select>
                </div>

                {/* Workout Duration */}
                <div>
                  <label className="mb-2 block text-sm text-slate-400">
                    Workout Duration
                  </label>

                  <select
                    value={workoutDuration}
                    onChange={(e) =>
                      setWorkoutDuration(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="75">75 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>
              </div>

              {/* Available Days */}
              <div className="mt-6">
                <label className="mb-3 block text-sm text-slate-400">
                  Available Days
                </label>

                <div className="flex flex-wrap gap-2">
                  {allDays.map((day) => {
                    const selected =
                      availableDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                          selected
                            ? "bg-cyan-500 text-slate-950"
                            : "border border-slate-700 bg-slate-800 text-slate-300 hover:border-cyan-500/50"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {day}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Select the days you are available for workouts.
                </p>
              </div>

              {/* Preferred Exercises */}
              <div className="mt-6">
                <label className="mb-3 block text-sm text-slate-400">
                  Preferred Exercises
                </label>

                <div className="flex flex-wrap gap-2">
                  {exerciseOptions.map((exercise) => {
                    const selected =
                      preferredExercises.includes(exercise);

                    return (
                      <button
                        key={exercise}
                        type="button"
                        onClick={() =>
                          toggleExercise(exercise)
                        }
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                          selected
                            ? "bg-cyan-500 text-slate-950"
                            : "border border-slate-700 bg-slate-800 text-slate-300 hover:border-cyan-500/50"
                        }`}
                      >
                        {selected ? "✓ " : ""}
                        {exercise}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Select exercises you prefer to include in your plan.
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generatePlan}
                className="mt-7 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Generate Personalized Plan
              </button>
            </div>

            {/* Recommendation Summary */}
            <div className="mb-8 grid gap-5 md:grid-cols-3">

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  AI Match Score
                </p>

                <p className="mt-2 text-3xl font-bold text-cyan-400">
                  {matchScore}%
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Based on your goal and preferences
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Recommended Gyms
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {filteredGyms.length}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Matching your selected filters
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">
                  Weekly Plan
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {plan.length} Days
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {completedCount} workout
                  {completedCount === 1 ? "" : "s"} completed
                </p>
              </div>
            </div>

            {/* Gym Recommendations */}
            <div className="mb-8">
              <div className="mb-5">
                <h3 className="text-2xl font-semibold">
                  Recommended Gyms Near You
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  AI-ranked gyms based on location, fitness goals,
                  programs and challenges.
                </p>
              </div>

              {filteredGyms.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                  <p className="text-slate-300">
                    No matching gyms found.
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Try changing the location or program filter.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {filteredGyms.map((gym) => (
                    <div
                      key={gym.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500/40"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-semibold">
                            {gym.name}
                          </h4>

                          <p className="mt-1 text-sm text-slate-400">
                            📍 {gym.location} • {gym.distance}
                          </p>
                        </div>

                        <div className="rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
                          ⭐ {gym.rating}
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-400">
                        {gym.description}
                      </p>

                      <div className="mt-4">
                        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                          Programs
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {gym.programs.map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">
                          Challenges
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {gym.challenges.map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm font-medium text-green-400">
                          ✓ {gym.goalMatch}
                        </span>

                        <button
                          onClick={() => setSelectedGym(gym)}
                          className="rounded-xl border border-cyan-500/40 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personalized Weekly Planner */}
            <div
              id="personalized-plan"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">
                    Personalized Weekly Planner
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Personalized schedule based on your goal, fitness
                    level, available days, duration and preferred
                    exercises.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowPlanner(!showPlanner)
                  }
                  className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-medium hover:bg-slate-700"
                >
                  {showPlanner
                    ? "Hide Planner"
                    : "View Planner"}
                </button>
              </div>

              {showPlanner && (
                <div className="mt-6">

                  {/* Planner Summary */}
                  <div className="mb-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Goal
                      </p>

                      <p className="mt-1 font-medium text-cyan-400">
                        {getGoalLabel()}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Fitness Level
                      </p>

                      <p className="mt-1 font-medium">
                        {fitnessLevel}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Available Days
                      </p>

                      <p className="mt-1 font-medium">
                        {availableDays.length}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs text-slate-500">
                        Duration
                      </p>

                      <p className="mt-1 font-medium">
                        {workoutDuration} min
                      </p>
                    </div>
                  </div>

                  {/* Workout Cards */}
                  <div className="space-y-4">
                    {plan.map((item, index) => (
                      <div
                        key={`${item.day}-${index}`}
                        className={`rounded-2xl border p-5 ${
                          item.completed
                            ? "border-green-500/30 bg-green-500/5"
                            : "border-slate-800 bg-slate-950"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-400">
                                {item.day}
                              </span>

                              <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                {item.intensity}
                              </span>

                              {item.completed && (
                                <span className="rounded-lg bg-green-500/10 px-3 py-1 text-xs text-green-400">
                                  ✓ Completed
                                </span>
                              )}
                            </div>

                            <h4 className="mt-3 text-xl font-semibold">
                              {item.exercise}
                            </h4>

                            <p className="mt-1 text-sm text-slate-400">
                              Target Muscle: {item.muscle}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              toggleCompleted(index)
                            }
                            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                              item.completed
                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            }`}
                          >
                            {item.completed
                              ? "✓ Completed"
                              : "Mark as Completed"}
                          </button>
                        </div>

                        {/* Workout Details */}
                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-500">
                              Exercise
                            </p>

                            <p className="mt-1 text-sm font-medium text-cyan-400">
                              {item.exercise}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-500">
                              Sets
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              {item.sets}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-500">
                              Reps
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              {item.reps}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-500">
                              Rest Time
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              {item.rest}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                            <p className="text-xs text-slate-500">
                              Duration
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                              {item.duration}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
                          <p className="text-xs text-slate-500">
                            Target Muscle Group
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-200">
                            {item.muscle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {plan.length === 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-8 text-center">
                      <p className="text-slate-300">
                        No workout days selected.
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Select at least one available day and generate
                        the plan.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fitness Challenges */}
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-5">
                <h3 className="text-2xl font-semibold">
                  Fitness Challenges
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Join challenges to stay consistent and improve your
                  engagement.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {/* Challenge 1 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <div className="text-2xl">
                    🔥
                  </div>

                  <h4 className="mt-3 font-semibold">
                    30-Day Consistency
                  </h4>

                  <p className="mt-2 text-sm text-slate-400">
                    Complete at least 4 workouts every week.
                  </p>

                  <button
                    onClick={() =>
                      setJoinedChallenge(
                        "30-Day Consistency"
                      )
                    }
                    className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    {joinedChallenge ===
                    "30-Day Consistency"
                      ? "✓ Joined"
                      : "Join Challenge"}
                  </button>
                </div>

                {/* Challenge 2 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <div className="text-2xl">
                    💪
                  </div>

                  <h4 className="mt-3 font-semibold">
                    Strength Builder
                  </h4>

                  <p className="mt-2 text-sm text-slate-400">
                    Improve strength through progressive training.
                  </p>

                  <button
                    onClick={() =>
                      setJoinedChallenge(
                        "Strength Builder"
                      )
                    }
                    className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    {joinedChallenge ===
                    "Strength Builder"
                      ? "✓ Joined"
                      : "Join Challenge"}
                  </button>
                </div>

                {/* Challenge 3 */}
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                  <div className="text-2xl">
                    🏃
                  </div>

                  <h4 className="mt-3 font-semibold">
                    Cardio Challenge
                  </h4>

                  <p className="mt-2 text-sm text-slate-400">
                    Build stamina with weekly cardio sessions.
                  </p>

                  <button
                    onClick={() =>
                      setJoinedChallenge(
                        "Cardio Challenge"
                      )
                    }
                    className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    {joinedChallenge ===
                    "Cardio Challenge"
                      ? "✓ Joined"
                      : "Join Challenge"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Gym Details Modal */}
      {selectedGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {selectedGym.name}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  📍 {selectedGym.location} •{" "}
                  {selectedGym.distance}
                </p>
              </div>

              <button
                onClick={() => setSelectedGym(null)}
                className="text-xl text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">

              <div>
                <p className="text-sm text-slate-400">
                  Rating
                </p>

                <p className="mt-1 font-semibold text-yellow-400">
                  ⭐ {selectedGym.rating}/5
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Goal Match
                </p>

                <p className="mt-1 font-semibold text-green-400">
                  ✓ {selectedGym.goalMatch}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Available Programs
                </p>

                <p className="mt-1 text-sm text-slate-200">
                  {selectedGym.programs.join(" • ")}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Challenges
                </p>

                <p className="mt-1 text-sm text-slate-200">
                  {selectedGym.challenges.join(" • ")}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Description
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {selectedGym.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedGym(null)}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}