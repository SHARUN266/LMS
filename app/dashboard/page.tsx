import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ArrowRight,
  BookOpen,
  Code2,
  FileCheck2,
  Calendar,
  AlertTriangle,
  Award,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = (await db.userProfile.findFirst()) || {
    id: "user_default",
    name: "Learner",
    targetRole: "BI / Analytics Engineer",
    dailyStudyGoal: 6,
    currentStreak: 12,
    longestStreak: 15,
    totalStudyMins: 2840,
    activeModuleId: null as string | null,
    activeDayId: null as string | null,
    xp: 1450,
    level: 3,
  };

  const module1 = await db.module.findFirst({
    include: {
      weeks: {
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
          },
          assessments: true,
        },
      },
      projects: true,
    },
  });

  let activeDay = null;
  if (profile.activeDayId) {
    activeDay = await db.day.findUnique({
      where: { id: profile.activeDayId },
      include: {
        lesson: true,
        practice: true,
        assignments: true,
      },
    });
  }

  if (!activeDay) {
    activeDay = await db.day.findFirst({
      where: { isCompleted: false, isUnlocked: true },
      orderBy: { dayNumber: "asc" },
      include: {
        lesson: true,
        practice: true,
        assignments: true,
      },
    });
  }

  if (!activeDay) {
    activeDay = await db.day.findFirst({
      where: { dayNumber: 2 },
      include: {
        lesson: true,
        practice: true,
        assignments: true,
      },
    });
  }

  const backlogItems = await db.backlogItem.findMany({
    where: { isCompleted: false },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Welcome & Discipline Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-masai-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-masai-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-masai-red/20 text-masai-red border border-masai-red/40">
                Masai Training Day 2 of 120
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-masai-accent" /> Target: {profile.targetRole}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Good Morning, {profile.name}! 🚀
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Today's Focus: <span className="text-masai-accent font-semibold">Analytical Window Functions & Running Totals</span>. Complete all 4 tasks before 11:59 PM to maintain your 12-day streak.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/learn/module-1/day-2"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-white text-xs font-bold shadow-glow transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              Resume Day 2 Plan
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bootcamp Consistency</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{profile.currentStreak} Days</span>
            <span className="text-xs text-emerald-400 font-semibold">Top 5%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Best: {profile.longestStreak} days continuous</p>
        </div>

        {/* Daily Study Commitment */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Daily Study Target</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">3h 58m</span>
            <span className="text-xs text-slate-400">/ 6h 00m</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full w-[66%]" />
          </div>
        </div>

        {/* Module 1 Progress */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Module 1 (SQL)</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">33%</span>
            <span className="text-xs text-cyan-400">2 / 6 Days</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-cyan-500 h-full w-[33%]" />
          </div>
        </div>

        {/* Weekly Evaluation Readiness */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monday Assessment</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">4 Days</span>
            <span className="text-xs text-rose-400 font-semibold">90 Min Exam</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Passing threshold: 70% required</p>
        </div>
      </div>

      {/* Main Grid: Today's Agenda vs Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Daily Agenda Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-masai-red" />
                  Today's Execution Agenda (Day 2)
                </h2>
                <p className="text-xs text-slate-400">
                  Follow the Masai lifecycle: Learn → Practice → Submit → AI Evaluation.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                1 of 4 Completed
              </span>
            </div>

            <div className="space-y-3">
              {/* Task 1: Theory */}
              <Link
                href="/learn/module-1/day-2"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-emerald-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                      1. Study: Window Functions, Partitions & Framing
                    </span>
                    <p className="text-[11px] text-slate-400">Read notes, cheat-sheet & passed 3 micro-quizzes</p>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                  Completed (+50 XP)
                </span>
              </Link>

              {/* Task 2: Code Practice */}
              <Link
                href="/practice/day-2"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-masai-accent/40 shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-masai-accent flex items-center justify-center flex-shrink-0 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-masai-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-masai-accent transition-colors">
                        2. Practice: Top 2 Products per Category Drill
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        In Progress
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Monaco SQL Sandbox with live schema and hints</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-masai-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Sandbox <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              {/* Task 3: Graded Assignment */}
              <Link
                href="/assignment/daily-2"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                      3. Assignment: Running Totals & Order Velocity
                    </span>
                    <p className="text-[11px] text-slate-400">Submit SQL solution for strict AI Rubric Evaluation</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Due 11:59 PM</span>
              </Link>

              {/* Task 4: AI Review & Remedial Drill */}
              <Link
                href="/evaluation/latest"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Circle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                      4. AI Feedback Review & Weak-Topic Remediation
                    </span>
                    <p className="text-[11px] text-slate-400">Qwen 2.5 Coder Rubric & auto-generated remedial drills</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">Locked</span>
              </Link>
            </div>
          </div>

          {/* 7-Day Capstone Project Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/70 border border-indigo-500/30 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    Module 1 Capstone Project (7 Days)
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    E-Commerce Customer Retention & Revenue Analytics
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Day 1 Milestone: Schema Exploration & ERD Mapping completed.
                  </p>
                </div>
              </div>
              <Link
                href="/projects/capstone-1"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                Project Workspace
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Backlog Alert & Quick Tools */}
        <div className="space-y-4">
          {/* Backlog Alert Box */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Discipline & Backlog Center
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {backlogItems.length} Task Pending
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Missed tasks become backlog. The smart balancer spreads them out without burning you out.
            </p>

            <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate">NULL Value Edge Case Practice</span>
                <span className="text-amber-400 font-bold text-[11px]">Due Today</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">From Day 1 remediation</p>
            </div>

            <Link
              href="/backlog"
              className="mt-3 block text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              Manage Backlog & Recovery
            </Link>
          </div>

          {/* AI Mentor Quick Launch */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-masai-accent">
              <Zap className="w-4 h-4" />
              <h3 className="text-xs font-bold">AI Career Coach (Qwen 2.5)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stuck on CTEs or Window Functions? Ask your local coach for Socratic hints, business logic, or interview drills.
            </p>
            <Link
              href="/mentor"
              className="mt-3 inline-flex items-center justify-center w-full py-2 rounded-lg bg-masai-accent/20 hover:bg-masai-accent/30 text-cyan-300 border border-masai-accent/40 text-xs font-bold transition-colors"
            >
              Open AI Mentor Studio
            </Link>
          </div>

          {/* Weekly Assessment Schedule */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <Calendar className="w-4 h-4" />
              <h3 className="text-xs font-bold">Next Monday Assessment</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>SQL Mastery Exam #1</span>
                <span className="text-rose-400">Monday 9:00 AM</span>
              </div>
              <p className="text-[11px] text-slate-400">10 MCQs • 5 Coding Problems • 1 Case Study</p>
            </div>
            <Link
              href="/assessment/week-1"
              className="mt-3 block text-center py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors"
            >
              View Assessment Hall
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
