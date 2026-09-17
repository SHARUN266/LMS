"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

export function StudyTimer() {
  const { isTimerRunning, studySeconds, dailyGoalHours, startTimer, pauseTimer, resetTimer, tickTimer } =
    useAppStore();

  const unsavedSecondsRef = useRef(0);
  const [expanded, setExpanded] = useState(false);

  const syncStudySession = async (mins: number) => {
    if (mins < 1) return;
    try {
      await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMins: mins, notes: "Focused learning session" }),
      });
    } catch {}
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
        unsavedSecondsRef.current += 1;
        if (unsavedSecondsRef.current >= 60) {
          syncStudySession(1);
          unsavedSecondsRef.current = 0;
        }
      }, 1000);
    } else if (!isTimerRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  const handlePause = () => {
    if (unsavedSecondsRef.current >= 30) {
      syncStudySession(1);
      unsavedSecondsRef.current = 0;
    }
    pauseTimer();
  };

  const hours = Math.floor(studySeconds / 3600);
  const minutes = Math.floor((studySeconds % 3600) / 60);
  const seconds = studySeconds % 60;

  return (
    <div
      className="relative flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Timer icon with state color */}
      <Clock
        className={`w-3.5 h-3.5 flex-shrink-0 ${
          isTimerRunning ? "text-emerald-400" : "text-slate-500"
        }`}
      />

      {/* Compact time display */}
      <span className="font-mono font-semibold text-slate-200 tabular-nums">
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
        <span className="text-slate-500">:{String(seconds).padStart(2, "0")}</span>
      </span>

      {/* Play/Pause — always visible */}
      {isTimerRunning ? (
        <button
          onClick={(e) => { e.stopPropagation(); handlePause(); }}
          className="p-0.5 rounded text-amber-400 hover:text-amber-300 transition-colors"
          title="Pause"
        >
          <Pause className="w-3 h-3" />
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); startTimer(); }}
          className="p-0.5 rounded text-emerald-400 hover:text-emerald-300 transition-colors"
          title="Start"
        >
          <Play className="w-3 h-3 fill-current" />
        </button>
      )}

      {/* Reset — only on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); resetTimer(); }}
        className={`p-0.5 rounded text-slate-500 hover:text-slate-300 transition-all ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
        title="Reset"
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      {/* Expanded tooltip with goal info */}
      {expanded && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 shadow-lg text-[11px] text-slate-400 whitespace-nowrap z-50">
          <div className="flex items-center justify-between gap-4">
            <span>Daily Goal</span>
            <span className="text-slate-200 font-semibold">{dailyGoalHours}h</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span>Progress</span>
            <span className="text-emerald-400 font-semibold">
              {Math.min(100, Math.round((studySeconds / (dailyGoalHours * 3600)) * 100))}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((studySeconds / (dailyGoalHours * 3600)) * 100))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
