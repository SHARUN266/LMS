"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Play, Pause, RotateCcw, Clock, Flame } from "lucide-react";

export function StudyTimer() {
  const { isTimerRunning, studySeconds, streak, dailyGoalHours, startTimer, pauseTimer, resetTimer, tickTimer } =
    useAppStore();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    } else if (!isTimerRunning && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  const hours = Math.floor(studySeconds / 3600);
  const minutes = Math.floor((studySeconds % 3600) / 60);
  const seconds = studySeconds % 60;

  const totalGoalSeconds = dailyGoalHours * 3600;
  const progressPercent = Math.min(100, Math.round((studySeconds / totalGoalSeconds) * 100));

  return (
    <div className="flex items-center gap-3">
      {/* Streak Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-glow">
        <Flame className="w-4 h-4 text-amber-500 animate-bounce" />
        <span>{streak} Day Streak</span>
      </div>

      {/* Live Study Stopwatch */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60 shadow-inner">
        <Clock className={`w-4 h-4 ${isTimerRunning ? "text-emerald-400 animate-spin" : "text-slate-400"}`} />
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            <span className="text-[10px] text-slate-400 font-normal ml-1">/ {dailyGoalHours}h Goal ({progressPercent}%)</span>
          </span>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-masai-accent h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 ml-1">
          {isTimerRunning ? (
            <button
              onClick={pauseTimer}
              className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
              title="Pause Study Timer"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
              title="Start Study Session"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
          <button
            onClick={resetTimer}
            className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
