"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Loader2,
  Circle,
} from "lucide-react";

interface BacklogItem {
  id: string;
  title: string;
  topic: string;
  dueOriginal: string;
  scheduledFor: string;
  isCompleted: boolean;
}

interface RemedialDrill {
  id: string;
  topic: string;
  title: string;
  difficulty: string;
  problem: string;
  starterCode?: string;
  solution: string;
  isCompleted: boolean;
}

export default function BacklogPage() {
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [remedialDrills, setRemedialDrills] = useState<RemedialDrill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBacklog() {
      try {
        setLoading(true);
        const res = await fetch("/api/backlog");
        if (res.ok) {
          const data = await res.json();
          setBacklogItems(data.backlogItems || []);
          setRemedialDrills(data.remedialDrills || []);
        }
      } catch (err) {
        console.error("Failed to load backlog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBacklog();
  }, []);

  const handleToggle = async (type: "backlog" | "drill", id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/backlog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          id,
          isCompleted: !currentStatus,
        }),
      });
      if (res.ok) {
        if (type === "backlog") {
          setBacklogItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isCompleted: !currentStatus } : item))
          );
        } else {
          setRemedialDrills((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isCompleted: !currentStatus } : item))
          );
        }
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Loading backlog and remedial queue...</p>
      </div>
    );
  }

  const pendingBacklogCount = backlogItems.filter((i) => !i.isCompleted).length;
  const pendingDrillsCount = remedialDrills.filter((d) => !d.isCompleted).length;
  const totalPending = pendingBacklogCount + pendingDrillsCount;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Discipline & Recovery Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Backlog Management & Remedial Center
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Missed assignments and weak areas automatically populate here. Solve remedial drills to maintain your streak and pace.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center flex items-center gap-4">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Active Remedials</span>
            <span className="text-xl font-black text-amber-400">{totalPending} Tasks</span>
          </div>
        </div>
      </div>

      {/* Remedial Drills Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" /> AI-Generated Remedial Drills
        </h2>

        {remedialDrills.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No remedial drills required! You are on track.
          </div>
        ) : (
          <div className="space-y-3">
            {remedialDrills.map((drill) => (
              <div
                key={drill.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  drill.isCompleted
                    ? "bg-slate-900/40 border-slate-800 opacity-60"
                    : "bg-slate-900/80 border-slate-800 hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle("drill", drill.id, drill.isCompleted)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {drill.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                        {drill.topic}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {drill.difficulty}
                      </span>
                    </div>
                    <h3 className={`text-xs font-bold mt-0.5 ${drill.isCompleted ? "line-through text-slate-500" : "text-white"}`}>
                      {drill.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{drill.problem}</p>
                  </div>
                </div>

                <Link
                  href="/practice/day-2"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Solve Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Backlog Items */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <History className="w-4 h-4 text-cyan-400" /> Missed Exercises & Daily Backlog
        </h2>

        {backlogItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No backlog items recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {backlogItems.map((t) => (
              <div
                key={t.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  t.isCompleted
                    ? "bg-slate-900/40 border-slate-800 opacity-60"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle("backlog", t.id, t.isCompleted)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    {t.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t.topic}
                    </span>
                    <h3 className={`text-xs font-bold mt-0.5 ${t.isCompleted ? "line-through text-slate-500" : "text-white"}`}>
                      {t.title}
                    </h3>
                  </div>
                </div>

                <Link
                  href="/practice/day-2"
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
