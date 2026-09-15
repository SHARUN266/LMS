import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  Award,
  ChevronRight,
  Database,
  Code,
  LineChart,
  Boxes,
  Briefcase,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const track = await db.track.findFirst({
    include: {
      modules: {
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
      },
    },
  });

  const allModules = [
    { title: "Module 1: Advanced SQL for Analytics Engineering", days: 6, weeks: 1, status: "IN_PROGRESS", icon: Database, progress: 33 },
    { title: "Module 2: Python, Pandas & Data Wrangling", days: 12, weeks: 2, status: "LOCKED", icon: Code, progress: 0 },
    { title: "Module 3: Relational Data Modeling & Normalization", days: 6, weeks: 1, status: "LOCKED", icon: Layers, progress: 0 },
    { title: "Module 4: Power BI, DAX & Enterprise Dashboarding", days: 12, weeks: 2, status: "LOCKED", icon: LineChart, progress: 0 },
    { title: "Module 5: Modern Data Stack (dbt, Snowflake, ELT)", days: 12, weeks: 2, status: "LOCKED", icon: Boxes, progress: 0 },
    { title: "Module 6: Capstone Lakehouse & Mock Interviews", days: 12, weeks: 2, status: "LOCKED", icon: Briefcase, progress: 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-masai-accent uppercase tracking-wider mb-1">
          <span>Career Progression Path</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Curriculum Tree & Milestone Roadmap
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Structured 20-week Masai bootcamp hierarchy: <span className="text-slate-200">Track → Module → Week → Day → Capstone</span>.
        </p>
      </div>

      {/* Module 1 Drill Down */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-masai-red/20 text-masai-red border border-masai-red/40">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-masai-red">Active Module 1</span>
              <h2 className="text-lg font-bold text-white">Advanced SQL for Analytics Engineering</h2>
              <p className="text-xs text-slate-400">Week 1 of 1 • 6 Study Days • 1 Capstone Project</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-400 font-bold">2 of 6 Days Unlocked</span>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
              <div className="bg-emerald-500 h-full w-[33%]" />
            </div>
          </div>
        </div>

        {/* Days List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(
            track?.modules[0]?.weeks[0]?.days || [
              { id: "d1", dayNumber: 1, title: "Joins & Complex Aggregations", isCompleted: true, isUnlocked: true, score: 88 },
              { id: "d2", dayNumber: 2, title: "Analytical Window Functions", isCompleted: false, isUnlocked: true, score: null },
              { id: "d3", dayNumber: 3, title: "CTEs & Recursive Pipelines", isCompleted: false, isUnlocked: true, score: null },
              { id: "d4", dayNumber: 4, title: "Conditional Aggregates & NULLs", isCompleted: false, isUnlocked: false, score: null },
              { id: "d5", dayNumber: 5, title: "Query Optimization & B-Trees", isCompleted: false, isUnlocked: false, score: null },
              { id: "d6", dayNumber: 6, title: "Monday Assessment Prep", isCompleted: false, isUnlocked: false, score: null },
            ]
          ).map((d) => {
            const isCompleted = d.isCompleted;
            const isUnlocked = d.isUnlocked;
            const isActive = !isCompleted && isUnlocked && (d.dayNumber === 2 || d.dayNumber === 1);

            return (
              <div
                key={d.id || d.dayNumber}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? "bg-slate-800/80 border-masai-accent shadow-glow-cyan"
                    : isCompleted
                    ? "bg-slate-900/60 border-emerald-500/40"
                    : isUnlocked
                    ? "bg-slate-900/60 border-slate-700 hover:border-slate-500"
                    : "bg-slate-950/40 border-slate-800/60 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-400">Day {d.dayNumber}</span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passed ({d.score ? `${d.score}/100` : "Done"})
                    </span>
                  )}
                  {isActive && (
                    <span className="flex items-center gap-1 text-masai-accent font-bold text-[11px] animate-pulse">
                      <PlayCircle className="w-3.5 h-3.5" /> Today&apos;s Focus
                    </span>
                  )}
                  {!isCompleted && !isActive && isUnlocked && (
                    <span className="text-slate-400 font-semibold text-[11px]">Unlocked</span>
                  )}
                  {!isUnlocked && (
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{d.title}</h3>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    href={isUnlocked ? `/learn/module-1/${d.id || `day-${d.dayNumber}`}` : "#"}
                    className={`text-xs font-semibold flex items-center gap-1 ${
                      isUnlocked
                        ? "text-masai-accent hover:text-white"
                        : "text-slate-600 pointer-events-none"
                    }`}
                  >
                    View Day Agenda <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Module 1 Capstone Card */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Module 1 Capstone</span>
              <h4 className="text-sm font-bold text-white">E-Commerce Customer Retention & Revenue Analytics (7 Days)</h4>
            </div>
          </div>
          <Link
            href="/projects/capstone-1"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Open Capstone
          </Link>
        </div>
      </div>

      {/* Upcoming Modules in Career Track */}
      <div>
        <h3 className="text-base font-bold text-slate-300 mb-4">Remaining Modules in Career Track</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allModules.slice(1).map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-75">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{m.title}</h4>
                    <p className="text-[11px] text-slate-500">{m.weeks} Weeks • {m.days} Study Days • Capstone Included</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
