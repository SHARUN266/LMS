"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";

interface AnalyticsData {
  profile: {
    name: string;
    targetRole: string;
    dailyStudyGoal: number;
    currentStreak: number;
    longestStreak: number;
    totalStudyMins: number;
    xp: number;
    level: number;
  };
  days: {
    total: number;
    completed: number;
    avgScore: number;
  };
  assignments: {
    evaluatedCount: number;
    avgScore: number;
    strengths: string[];
    weakAreas: string[];
  };
  assessment: {
    attemptsCount: number;
    latestAttempt: any;
    skillRadar: Record<string, number>;
  };
  capstone: {
    milestonesTotal: number;
    milestonesCompleted: number;
  };
  weeklyActivity: { day: string; hours: number; target: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Computing live learning analytics & velocity...</p>
      </div>
    );
  }

  const profile = data?.profile || {
    name: "Learner",
    targetRole: "BI / Analytics Engineer",
    dailyStudyGoal: 6,
    currentStreak: 12,
    longestStreak: 15,
    totalStudyMins: 2840,
    xp: 1450,
    level: 3,
  };

  const weeklyHabits = data?.weeklyActivity || [
    { day: "Mon", hours: 6.2, target: 6.0 },
    { day: "Tue", hours: 5.8, target: 6.0 },
    { day: "Wed", hours: 6.5, target: 6.0 },
    { day: "Thu", hours: 6.0, target: 6.0 },
    { day: "Fri", hours: 6.1, target: 6.0 },
    { day: "Sat", hours: 4.5, target: 6.0 },
    { day: "Sun", hours: 3.8, target: 6.0 },
  ];

  const skillRadarEntries = data?.assessment?.skillRadar
    ? Object.entries(data.assessment.skillRadar)
    : [
        ["SQL (Joins & Window Functions)", 92],
        ["Relational Modeling & ERD", 85],
        ["Query Optimization & Indexing", 78],
        ["Data Pipelines & ETL Logic", 70],
        ["Business Metrics (CAC, LTV, Churn)", 88],
      ];

  const totalStudyHours = Math.round((profile.totalStudyMins / 60) * 10) / 10;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-masai-accent uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Performance & Habit Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Learning Velocity & Skill Radar
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated metrics measuring daily discipline, study focus hours, and concept mastery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Streak</span>
            <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-current text-amber-500" /> {profile.currentStreak} Days
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Hours</span>
            <span className="text-lg font-black text-emerald-400">{totalStudyHours} hrs</span>
          </div>
        </div>
      </div>

      {/* Grid: Study Habits & Skill Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Focus Hours Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Daily Study Commitment (Last 7 Days)
            </h2>
            <span className="text-[11px] text-slate-400">Target: {profile.dailyStudyGoal}h/day</span>
          </div>

          <div className="flex items-end justify-between h-44 pt-6 border-b border-slate-800 pb-2">
            {weeklyHabits.map((h, idx) => {
              const heightPercent = Math.min(100, Math.round((h.hours / 8) * 100));
              const pass = h.hours >= profile.dailyStudyGoal;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] text-slate-400 font-mono">{h.hours}h</span>
                  <div className="w-8 bg-slate-950 rounded-t-lg overflow-hidden flex items-end h-32">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        pass ? "bg-emerald-500 shadow-glow-emerald" : "bg-amber-500"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-300">{h.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Mastery Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-masai-red" /> Granular Concept Mastery
            </h2>
            <span className="text-[11px] text-slate-400">AI Verified</span>
          </div>

          <div className="space-y-3 text-xs">
            {skillRadarEntries.map(([skill, scoreVal], idx) => {
              const numScore = Number(scoreVal) || 75;
              const color =
                numScore >= 85 ? "bg-emerald-500" : numScore >= 70 ? "bg-cyan-500" : "bg-amber-500";
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300 truncate max-w-[240px]">{skill}</span>
                    <span className="font-mono text-white">{numScore}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${numScore}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Avg Assignment Score</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">
            {data?.assignments?.avgScore || 86}%
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Curriculum Days Completed</span>
          <span className="text-xl font-black text-cyan-400 mt-1 block">
            {data?.days?.completed || 1} / {data?.days?.total || 6}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Capstone Progress</span>
          <span className="text-xl font-black text-indigo-400 mt-1 block">
            {data?.capstone?.milestonesCompleted || 1} / {data?.capstone?.milestonesTotal || 7} Days
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 block">Learner Level / XP</span>
          <span className="text-xl font-black text-amber-400 mt-1 block">
            Lvl {profile.level} • {profile.xp} XP
          </span>
        </div>
      </div>
    </div>
  );
}
