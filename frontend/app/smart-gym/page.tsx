"use client";

import { useEffect, useState } from "react";

type Equipment = {
  id: number;
  name: string;
  type: string;
  status: "Active" | "Idle" | "Maintenance";
  resistance: number;
  heartRate: number;
  intensity: "Low" | "Moderate" | "High";
  temperature: number;
};

const initialEquipment: Equipment[] = [
  {
    id: 1,
    name: "Smart Treadmill",
    type: "Cardio",
    status: "Active",
    resistance: 6,
    heartRate: 128,
    intensity: "Moderate",
    temperature: 38,
  },
  {
    id: 2,
    name: "Smart Exercise Bike",
    type: "Cardio",
    status: "Idle",
    resistance: 4,
    heartRate: 0,
    intensity: "Low",
    temperature: 31,
  },
  {
    id: 3,
    name: "Smart Leg Press",
    type: "Strength",
    status: "Active",
    resistance: 8,
    heartRate: 136,
    intensity: "High",
    temperature: 35,
  },
  {
    id: 4,
    name: "Smart Chest Press",
    type: "Strength",
    status: "Maintenance",
    resistance: 5,
    heartRate: 0,
    intensity: "Low",
    temperature: 29,
  },
];

export default function SmartGymPage() {
  const [equipment, setEquipment] =
    useState<Equipment[]>(initialEquipment);

  const [selectedId, setSelectedId] = useState(1);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState("Just now");

  const selectedEquipment =
    equipment.find((item) => item.id === selectedId) ||
    equipment[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setEquipment((current) =>
        current.map((item) => {
          if (item.status !== "Active") {
            return item;
          }

          const heartRateChange =
            Math.floor(Math.random() * 7) - 3;

          return {
            ...item,
            heartRate: Math.max(
              80,
              item.heartRate + heartRateChange
            ),
            temperature: Number(
              Math.max(
                25,
                item.temperature +
                  (Math.random() * 0.6 - 0.3)
              ).toFixed(1)
            ),
          };
        })
      );

      setLastUpdate("A few seconds ago");
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const updateResistance = (value: number) => {
    setEquipment((current) =>
      current.map((item) =>
        item.id === selectedId
          ? {
              ...item,
              resistance: value,
              intensity:
                value <= 3
                  ? "Low"
                  : value <= 7
                  ? "Moderate"
                  : "High",
            }
          : item
      )
    );
  };

  const activeCount = equipment.filter(
    (item) => item.status === "Active"
  ).length;

  const idleCount = equipment.filter(
    (item) => item.status === "Idle"
  ).length;

  const maintenanceCount = equipment.filter(
    (item) => item.status === "Maintenance"
  ).length;

  const averageHeartRate =
    Math.round(
      equipment
        .filter((item) => item.heartRate > 0)
        .reduce(
          (total, item) => total + item.heartRate,
          0
        ) /
        Math.max(
          equipment.filter((item) => item.heartRate > 0)
            .length,
          1
        )
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a
              href="/"
              className="mb-3 inline-block text-sm text-slate-400 hover:text-white"
            >
              ← Back to Dashboard
            </a>

            <h1 className="text-3xl font-bold">
              Smart Gym Assistant 🤖
            </h1>

            <p className="mt-2 text-slate-400">
              AI + IoT powered gym equipment monitoring,
              performance assistance and intelligent workout
              control.
            </p>
          </div>

          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              isConnected
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {isConnected
              ? "● IoT Connected"
              : "● IoT Disconnected"}
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Connected Equipment
            </p>
            <p className="mt-2 text-3xl font-bold">
              {equipment.length}
            </p>
            <p className="mt-1 text-xs text-emerald-400">
              IoT devices monitored
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Active Equipment
            </p>
            <p className="mt-2 text-3xl font-bold">
              {activeCount}
            </p>
            <p className="mt-1 text-xs text-blue-400">
              Currently in use
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Average Heart Rate
            </p>
            <p className="mt-2 text-3xl font-bold">
              {averageHeartRate}
              <span className="ml-1 text-sm font-normal">
                BPM
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Live workout monitoring
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              System Status
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              Operational
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Last update: {lastUpdate}
            </p>
          </div>
        </div>

        {/* Equipment Monitoring */}
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              📡 Equipment Monitoring
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Real-time simulated IoT equipment data.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {equipment.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`rounded-2xl border p-5 text-left transition ${
                  selectedId === item.id
                    ? "border-blue-500 bg-slate-900"
                    : "border-slate-800 bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {item.type}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : item.status === "Idle"
                        ? "bg-yellow-500/15 text-yellow-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-800/70 p-3">
                    <p className="text-xs text-slate-400">
                      Resistance
                    </p>
                    <p className="mt-1 font-semibold">
                      {item.resistance}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800/70 p-3">
                    <p className="text-xs text-slate-400">
                      Heart Rate
                    </p>
                    <p className="mt-1 font-semibold">
                      {item.heartRate || "--"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-800/70 p-3">
                    <p className="text-xs text-slate-400">
                      Intensity
                    </p>
                    <p className="mt-1 font-semibold">
                      {item.intensity}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* AI Equipment Assistant */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              🧠 AI Equipment Assistant
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Intelligent recommendations based on workout
              intensity and live equipment data.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-800/70 p-5">
              <p className="text-sm font-semibold text-blue-400">
                AI Recommendation
              </p>

              <p className="mt-3 leading-7 text-slate-200">
                {selectedEquipment.status === "Maintenance"
                  ? "This equipment is currently under maintenance. Please choose another available machine."
                  : selectedEquipment.status === "Idle"
                  ? "Equipment is ready. Start with a comfortable resistance and gradually increase intensity."
                  : selectedEquipment.heartRate > 140
                  ? "Heart rate is elevated. Consider reducing resistance and taking a short recovery break."
                  : "Your current intensity is suitable. Maintain controlled movements and consistent breathing."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 p-4">
                <p className="text-xs text-slate-400">
                  Suggested Rest
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {selectedEquipment.heartRate > 140
                    ? "90 sec"
                    : "60 sec"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 p-4">
                <p className="text-xs text-slate-400">
                  Workout Intensity
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {selectedEquipment.intensity}
                </p>
              </div>
            </div>
          </div>

          {/* Resistance Control */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              ⚙️ Smart Resistance Control
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Simulated equipment control. In a real gym,
              this can be connected to MQTT/IoT hardware.
            </p>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  {selectedEquipment.name}
                </span>

                <span className="text-2xl font-bold">
                  {selectedEquipment.resistance}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={selectedEquipment.resistance}
                disabled={
                  selectedEquipment.status === "Maintenance"
                }
                onChange={(e) =>
                  updateResistance(Number(e.target.value))
                }
                className="mt-6 w-full"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-300">
                Current intensity
              </p>
              <p className="mt-1 text-lg font-semibold">
                {selectedEquipment.intensity}
              </p>
            </div>

            <button
              disabled={
                selectedEquipment.status === "Maintenance"
              }
              onClick={() =>
                alert(
                  "Resistance command sent to the simulated IoT equipment."
                )
              }
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send IoT Resistance Command
            </button>
          </div>
        </section>

        {/* Performance */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">
            ❤️ Live Performance Monitoring
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">
                Heart Rate
              </p>
              <p className="mt-2 text-2xl font-bold">
                {selectedEquipment.heartRate || "--"} BPM
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">
                Resistance
              </p>
              <p className="mt-2 text-2xl font-bold">
                Level {selectedEquipment.resistance}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">
                Intensity
              </p>
              <p className="mt-2 text-2xl font-bold">
                {selectedEquipment.intensity}
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/70 p-4">
              <p className="text-sm text-slate-400">
                Temperature
              </p>
              <p className="mt-2 text-2xl font-bold">
                {selectedEquipment.temperature}°C
              </p>
            </div>
          </div>
        </section>

        {/* IoT Architecture */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">
            🔌 IoT Integration Architecture
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Smart Gym is designed as an MQTT-ready architecture.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 p-4 text-center">
              <div className="text-3xl">🏋️</div>
              <p className="mt-2 font-semibold">
                Gym Equipment
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Sensors & machines
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4 text-center">
              <div className="text-3xl">📡</div>
              <p className="mt-2 font-semibold">
                MQTT Layer
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Real-time messages
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4 text-center">
              <div className="text-3xl">🧠</div>
              <p className="mt-2 font-semibold">
                AI Engine
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Analyze performance
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 p-4 text-center">
              <div className="text-3xl">📊</div>
              <p className="mt-2 font-semibold">
                Fitness Dashboard
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Insights & controls
              </p>
            </div>
          </div>
        </section>

        {/* System Summary */}
        <section className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <h2 className="text-xl font-bold">
            📊 Smart Gym System Summary
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-400">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {activeCount}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Idle
              </p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {idleCount}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Maintenance
              </p>
              <p className="mt-1 text-2xl font-bold text-red-400">
                {maintenanceCount}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}