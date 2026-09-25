"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";
import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

type Exercise =
  | "squat"
  | "pushup"
  | "bicep_curl"
  | "lunge"
  | "shoulder_press";

const exercises: {
  value: Exercise;
  label: string;
}[] = [
  { value: "squat", label: "🏋️ Squats" },
  { value: "pushup", label: "💪 Push-ups" },
  { value: "bicep_curl", label: "💪 Bicep Curls" },
  { value: "lunge", label: "🦵 Lunges" },
  { value: "shoulder_press", label: "🏋️ Shoulder Press" },
];

function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180) / Math.PI);

  if (angle > 180) {
    angle = 360 - angle;
  }

  return Math.round(angle);
}

function getExerciseData(
  exercise: Exercise,
  landmarks: any[]
) {
  const shoulder = landmarks[11];
  const elbow = landmarks[13];
  const wrist = landmarks[15];

  const hip = landmarks[23];
  const knee = landmarks[25];
  const ankle = landmarks[27];

  if (
    !shoulder ||
    !elbow ||
    !wrist ||
    !hip ||
    !knee ||
    !ankle
  ) {
    return {
      angle: 0,
      stage: "unknown",
    };
  }

  let angle = 0;
  let stage = "up";

  // SQUAT
  if (exercise === "squat") {
    angle = calculateAngle(hip, knee, ankle);

    if (angle > 160) {
      stage = "up";
    } else if (angle < 110) {
      stage = "down";
    } else {
      stage = "transition";
    }
  }

  // PUSH-UP
  if (exercise === "pushup") {
    angle = calculateAngle(shoulder, elbow, wrist);

    if (angle > 150) {
      stage = "up";
    } else if (angle < 100) {
      stage = "down";
    } else {
      stage = "transition";
    }
  }

  // BICEP CURL
  if (exercise === "bicep_curl") {
    angle = calculateAngle(shoulder, elbow, wrist);

    if (angle < 60) {
      stage = "up";
    } else if (angle > 130) {
      stage = "down";
    } else {
      stage = "transition";
    }
  }

  // LUNGE
  if (exercise === "lunge") {
    angle = calculateAngle(hip, knee, ankle);

    if (angle > 160) {
      stage = "up";
    } else if (angle < 110) {
      stage = "down";
    } else {
      stage = "transition";
    }
  }

  // SHOULDER PRESS
  if (exercise === "shoulder_press") {
    angle = calculateAngle(elbow, shoulder, hip);

    if (angle < 70) {
      stage = "up";
    } else if (angle > 110) {
      stage = "down";
    } else {
      stage = "transition";
    }
  }

  return {
    angle,
    stage,
  };
}

export default function TrainerPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const poseLandmarkerRef =
    useRef<PoseLandmarker | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const animationRef =
    useRef<number | null>(null);

  const previousStage =
    useRef("up");

  const lastApiCall =
    useRef(0);

  const [cameraOn, setCameraOn] =
    useState(false);

  const [aiReady, setAiReady] =
    useState(false);

  const [loadingAI, setLoadingAI] =
    useState(false);

  const [exercise, setExercise] =
    useState<Exercise>("squat");

  const [reps, setReps] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [angle, setAngle] =
    useState(0);

  const [stage, setStage] =
    useState("Ready");

  const [feedback, setFeedback] =
    useState("Start your workout.");

  const [workoutStartTime, setWorkoutStartTime] =
    useState<number | null>(null);

  const [duration, setDuration] =
    useState(0);

  const [savingWorkout, setSavingWorkout] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  // =========================
  // WORKOUT TIMER
  // =========================

  useEffect(() => {
    if (!cameraOn || !workoutStartTime) {
      return;
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - workoutStartTime) / 1000
      );

      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [cameraOn, workoutStartTime]);

  // =========================
  // START CAMERA
  // =========================

  const startCamera = async () => {
    try {
      setFeedback("Starting camera...");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: 720,
            height: 540,
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();

        setCameraOn(true);

        // Start workout timer
        setWorkoutStartTime(Date.now());
        setDuration(0);

        setSaveMessage("");

        setFeedback(
          "Camera is working. Loading AI..."
        );
      }

      await loadPoseModel();
    } catch (error) {
      console.error(error);

      setFeedback(
        "Camera access failed. Please allow camera permission."
      );
    }
  };

  // =========================
  // LOAD MEDIAPIPE
  // =========================

  const loadPoseModel = async () => {
    try {
      setLoadingAI(true);

      setFeedback(
        "Loading MediaPipe AI..."
      );

      const vision =
        await FilesetResolver.forVisionTasks(
          "/wasm"
        );

      const landmarker =
        await PoseLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "/models/pose_landmarker_lite.task",
              delegate: "CPU",
            },

            runningMode: "VIDEO",

            numPoses: 1,

            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          }
        );

      poseLandmarkerRef.current =
        landmarker;

      setAiReady(true);
      setLoadingAI(false);

      setFeedback(
        "MediaPipe pose detection is active."
      );

      detectPose();
    } catch (error) {
      console.error(
        "MediaPipe error:",
        error
      );

      setLoadingAI(false);
      setAiReady(false);

      setFeedback(
        "AI pose detection could not load."
      );
    }
  };

  // =========================
  // POSE DETECTION
  // =========================

  const detectPose = () => {
    if (
      !videoRef.current ||
      !poseLandmarkerRef.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (video.readyState < 2) {
      animationRef.current =
        requestAnimationFrame(
          detectPose
        );

      return;
    }

    try {
      const timestamp =
        performance.now();

      const result =
        poseLandmarkerRef.current.detectForVideo(
          video,
          timestamp
        );

      if (
        result.landmarks &&
        result.landmarks.length > 0
      ) {
        const landmarks =
          result.landmarks[0];

        const data =
          getExerciseData(
            exercise,
            landmarks
          );

        if (data.angle > 0) {
          setAngle(data.angle);
          setStage(data.stage);

          // REP COUNTING
          if (
            previousStage.current ===
              "down" &&
            data.stage === "up"
          ) {
            setReps(
              (current) =>
                current + 1
            );
          }

          previousStage.current =
            data.stage;

          // BACKEND AI ANALYSIS
          const now = Date.now();

          if (
            now -
              lastApiCall.current >
            500
          ) {
            lastApiCall.current =
              now;

            sendPoseToBackend(
              exercise,
              data.angle,
              data.stage
            );
          }
        }
      }
    } catch (error) {
      console.error(
        "Pose detection error:",
        error
      );
    }

    animationRef.current =
      requestAnimationFrame(
        detectPose
      );
  };

  // =========================
  // SEND TO FASTAPI
  // =========================

  const sendPoseToBackend =
    async (
      currentExercise: Exercise,
      currentAngle: number,
      currentStage: string
    ) => {
      try {
        const response =
          await fetch(
            `${API_BASE}/trainer/analyze`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                exercise:
                  currentExercise,
                angle:
                  currentAngle,
                stage:
                  currentStage,
              }),
            }
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setScore(
          data.form_score
        );

        setFeedback(
          data.feedback
        );
      } catch (error) {
        console.error(
          "Backend connection error:",
          error
        );
      }
    };

  // =========================
  // SAVE WORKOUT
  // =========================

  const saveWorkout = async () => {
    if (reps <= 0) {
      setSaveMessage(
        "Complete at least 1 repetition before saving."
      );
      return;
    }

    try {
      setSavingWorkout(true);
      setSaveMessage("");

      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (!token) {
        setSaveMessage(
          "Please login before saving your workout."
        );
        setSavingWorkout(false);
        return;
      }

      // Calculate actual workout duration
      // from the time the camera/workout started.
      let workoutDuration = duration;

      if (workoutStartTime) {
        workoutDuration = Math.max(
          1,
          Math.floor(
            (Date.now() - workoutStartTime) /
              1000
          )
        );

        // Keep the UI timer in sync.
        setDuration(workoutDuration);
      }

      // Estimated calories burned.
      // This is a simple fitness estimate based
      // on workout duration and repetitions.
      const caloriesBurned = Math.max(
        1,
        Math.round(
          workoutDuration * 0.12 +
            reps * 0.5
        )
      );

      const response =
        await fetch(
          `${API_BASE}/workouts/save`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              exercise,
              reps,
              form_score: score,
              duration_seconds:
                workoutDuration,
              calories_burned:
                caloriesBurned,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to save workout"
        );
      }

      setSaveMessage(
        `Workout saved successfully! 💪 ${workoutDuration}s • ${caloriesBurned} kcal estimated`
      );
    } catch (error) {
      console.error(
        "Workout save error:",
        error
      );

      setSaveMessage(
        "Could not save workout. Please login and try again."
      );
    } finally {
      setSavingWorkout(false);
    }
  };

  // =========================
  // STOP CAMERA
  // =========================

  const stopCamera = () => {
    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current =
        null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current =
        null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    // Update final duration before stopping.
    if (workoutStartTime) {
      const finalDuration =
        Math.max(
          1,
          Math.floor(
            (Date.now() -
              workoutStartTime) /
              1000
          )
        );

      setDuration(finalDuration);
    }

    setCameraOn(false);
    setAiReady(false);
    setWorkoutStartTime(null);

    setStage("Ready");
    setAngle(0);

    setFeedback(
      "Camera stopped. Start again when ready."
    );
  };

  // =========================
  // RESET
  // =========================

  const resetWorkout = () => {
    setReps(0);
    setScore(0);
    setAngle(0);
    setStage("Ready");
    setDuration(0);
    setSaveMessage("");

    previousStage.current =
      "up";

    if (cameraOn) {
      setWorkoutStartTime(
        Date.now()
      );
    }

    setFeedback(
      "Workout reset. Start your exercise."
    );
  };

  // =========================
  // CHANGE EXERCISE
  // =========================

  const changeExercise = (
    newExercise: Exercise
  ) => {
    setExercise(
      newExercise
    );

    setReps(0);
    setScore(0);
    setAngle(0);
    setStage("Ready");

    previousStage.current =
      "up";

    const selected =
      exercises.find(
        (item) =>
          item.value ===
          newExercise
      );

    setFeedback(
      `${selected?.label} selected.`
    );
  };

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      if (
        animationRef.current
      ) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-cyan-400">
                AI Gym Trainer
              </p>

              <h1 className="text-3xl font-bold text-white">
                {
                  exercises.find(
                    (item) =>
                      item.value ===
                      exercise
                  )?.label
                }
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                AI Pose Detection •
                Automatic Rep Counting •
                Form Analysis
              </p>
            </div>

            <div className="flex gap-3">

              {!cameraOn ? (
                <button
                  onClick={
                    startCamera
                  }
                  className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-black hover:bg-cyan-400"
                >
                  ▶ Start Camera
                </button>
              ) : (
                <button
                  onClick={
                    stopCamera
                  }
                  className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
                >
                  ■ Stop Camera
                </button>
              )}

              <button
                onClick={
                  resetWorkout
                }
                className="rounded-xl border border-slate-600 bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Reset
              </button>

              <button
                onClick={
                  saveWorkout
                }
                disabled={
                  savingWorkout ||
                  reps === 0
                }
                className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingWorkout
                  ? "Saving..."
                  : "💾 Save Workout"}
              </button>

            </div>

          </div>

        </div>

        {/* EXERCISE SELECTION */}

        <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">

          <h2 className="mb-4 text-lg font-semibold text-white">
            Choose Exercise
          </h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

            {exercises.map(
              (item) => (
                <button
                  key={
                    item.value
                  }
                  onClick={() =>
                    changeExercise(
                      item.value
                    )
                  }
                  className={
                    exercise ===
                    item.value
                      ? "rounded-xl border border-cyan-400 bg-cyan-400/20 px-4 py-4 text-sm font-semibold text-cyan-300"
                      : "rounded-xl border border-slate-700 bg-slate-800 px-4 py-4 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                  }
                >
                  {item.label}
                </button>
              )
            )}

          </div>

        </div>

        {/* MAIN CONTENT */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* CAMERA */}

          <div className="lg:col-span-2">

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

              <div className="relative aspect-video bg-black">

                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  playsInline
                  muted
                />

                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center">

                    <div className="text-center">

                      <div className="mb-3 text-5xl">
                        📷
                      </div>

                      <p className="font-semibold text-white">
                        Camera is off
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Click Start Camera
                        to begin AI training
                      </p>

                    </div>

                  </div>
                )}

                {/* STATUS */}

                {cameraOn && (
                  <div className="absolute left-4 top-4 flex gap-2">

                    <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-black">
                      ● CAMERA ON
                    </span>

                    {aiReady && (
                      <span className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-black">
                        ● AI TRACKING
                      </span>
                    )}

                  </div>
                )}

                {/* FEEDBACK */}

                {cameraOn && (
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/80 p-4 backdrop-blur">

                    <p className="text-xs font-semibold text-cyan-400">
                      AI FEEDBACK
                    </p>

                    <p className="mt-1 font-semibold text-white">
                      {feedback}
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* STATS */}

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Reps
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {reps}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Completed
              </p>

            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Form Score
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {score}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                AI assessment
              </p>

            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Joint Angle
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {angle}°
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Live measurement
              </p>

            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Stage
              </p>

              <p className="mt-2 text-3xl font-bold capitalize text-white">
                {stage}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Movement position
              </p>

            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Duration
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {Math.floor(
                  duration / 60
                )}
                :
                {String(
                  duration % 60
                ).padStart(
                  2,
                  "0"
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Workout time
              </p>

            </div>

            {/* CALORIE ESTIMATE */}

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

              <p className="text-sm text-slate-400">
                Calories
              </p>

              <p className="mt-2 text-4xl font-bold text-white">
                {Math.max(
                  0,
                  Math.round(
                    duration *
                      0.12 +
                      reps *
                        0.5
                  )
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Estimated kcal
              </p>

            </div>

            {/* AI STATUS */}

            <div className="col-span-2 rounded-2xl border border-cyan-500/40 bg-slate-900 p-5">

              <p className="font-semibold text-cyan-400">
                🧠 AI Trainer
              </p>

              <p className="mt-2 text-sm text-slate-300">

                {loadingAI
                  ? "Loading MediaPipe AI..."
                  : aiReady
                  ? "MediaPipe pose detection is active."
                  : "Start camera to activate AI."}

              </p>

            </div>

          </div>

        </div>

        {/* SAVE MESSAGE */}

        {saveMessage && (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4">

            <p className="text-center font-semibold text-white">
              {saveMessage}
            </p>

          </div>
        )}

        {/* TRAINER TIPS */}

        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="text-xl font-bold text-white">
            Trainer Tips
          </h2>

          <div className="mt-4 grid gap-3 md:grid-cols-2">

            <p className="text-sm text-slate-300">
              ✓ Keep your full body visible.
            </p>

            <p className="text-sm text-slate-300">
              ✓ Perform movements slowly and with control.
            </p>

            <p className="text-sm text-slate-300">
              ✓ Keep your posture aligned.
            </p>

            <p className="text-sm text-slate-300">
              ✓ Make sure the camera has a clear view of your body.
            </p>

          </div>

        </div>

        {/* HOW IT WORKS */}

        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="text-xl font-bold text-white">
            How AI Gym Trainer Works
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-4">

            <div className="rounded-xl bg-slate-800 p-5">

              <div className="text-3xl">
                📷
              </div>

              <h3 className="mt-3 font-semibold text-white">
                Camera
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Captures your workout movement.
              </p>

            </div>

            <div className="rounded-xl bg-slate-800 p-5">

              <div className="text-3xl">
                🧍
              </div>

              <h3 className="mt-3 font-semibold text-white">
                Pose Detection
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                MediaPipe detects body landmarks.
              </p>

            </div>

            <div className="rounded-xl bg-slate-800 p-5">

              <div className="text-3xl">
                🔢
              </div>

              <h3 className="mt-3 font-semibold text-white">
                Rep Counting
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Movement stages are used to count repetitions.
              </p>

            </div>

            <div className="rounded-xl bg-slate-800 p-5">

              <div className="text-3xl">
                🧠
              </div>

              <h3 className="mt-3 font-semibold text-white">
                AI Feedback
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Form score and corrective feedback are generated.
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
