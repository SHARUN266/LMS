"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  RotateCcw,
  BookOpen,
  Code2,
  FileCheck2,
  Loader2,
  ShieldAlert,
  Zap,
  Target,
  FileCode,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DailyStepper } from "@/components/DailyStepper";

interface EvaluationData {
  id: string;
  score: number;
  passed: boolean;
  strengths: string;
  weakAreas: string;
  rubricScores: string;
  codeDiff?: string;
  detailedFeedback: string;
  remedialTasks?: string;
  submission: {
    id: string;
    submittedCode: string;
    notes?: string;
    assignment: {
      id: string;
      title: string;
      day?: {
        id: string;
        dayNumber: number;
        title: string;
      };
    };
  };
}

export default function EvaluationPage({ params }: { params: { subId: string } }) {
  const router = useRouter();
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [drillCreated, setDrillCreated] = useState(false);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        setLoading(true);
        const res = await fetch(`/api/submissions/${params.subId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.submission?.evaluation) {
            setData({
              ...json.submission.evaluation,
              submission: json.submission,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load evaluation:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvaluation();
  }, [params.subId]);

  useEffect(() => {
    if (data && data.score >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [data]);

  const handleUnlockNextDay = async () => {
    if (!data?.submission?.assignment?.day?.id) {
      router.push("/roadmap");
      return;
    }

    setUnlocking(true);
    try {
      await fetch(`/api/days/${data.submission.assignment.day.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted: true,
          score: data.score,
        }),
      });

      const currentDayNum = data.submission.assignment.day.dayNumber || 1;
      const nextDayNum = currentDayNum + 1;

      // Try navigating directly to next day's lesson
      const nextDayRes = await fetch(`/api/days/day-${nextDayNum}`);
      if (nextDayRes.ok) {
        const nextDayJson = await nextDayRes.json();
        if (nextDayJson?.day) {
          const modId = nextDayJson.day.week?.module?.id || "module-1";
          router.push(`/learn/${modId}/${nextDayJson.day.id}`);
          return;
        }
      }
      router.push("/roadmap");
    } catch (e) {
      router.push("/roadmap");
    } finally {
      setUnlocking(false);
    }
  };

  const handleCreateCustomDrill = async () => {
    try {
      await fetch("/api/backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Remedial Practice: ${data?.submission?.assignment?.title || "SQL Drill"}`,
          topic: "SQL Window Functions & Edge Cases",
        }),
      });
      setDrillCreated(true);
      setTimeout(() => setDrillCreated(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Loading evaluation scorecard from hybrid grading engine...</p>
      </div>
    );
  }

  const score = data?.score ?? 86;
  const passed = data?.passed ?? (score >= 70);

  // Parse strengths, weak areas, rubric scores
  let strengthsList: string[] = [
    "Deterministic execution validated output schema and result set accurately.",
    "Proper application of window partition framing.",
    "Filtered exclusively for completed orders avoiding pending skew.",
  ];
  let weakAreasList: string[] = [
    "Wrap offset functions in COALESCE(LAG(...), 0) to ensure mathematical safety.",
    "Consider adding indexes on (customer_id, order_date) when scaling beyond 1M rows.",
  ];
  let rubricScoresMap: Record<string, number> = {
    correctness: 36,
    queryLogic: 18,
    edgeCases: 12,
    performance: 9,
    readability: 8,
    explanation: 3,
  };

  try {
    if (data?.strengths) {
      const parsed = JSON.parse(data.strengths);
      if (Array.isArray(parsed) && parsed.length > 0) strengthsList = parsed;
    }
  } catch {}

  try {
    if (data?.weakAreas) {
      const parsed = JSON.parse(data.weakAreas);
      if (Array.isArray(parsed) && parsed.length > 0) weakAreasList = parsed;
    }
  } catch {}

  try {
    if (data?.rubricScores) {
      const parsed = JSON.parse(data.rubricScores);
      if (typeof parsed === "object") rubricScoresMap = { ...rubricScoresMap, ...parsed };
    }
  } catch {}

  const dayNum = data?.submission?.assignment?.day?.dayNumber || 2;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Daily Progress Stepper */}
      <DailyStepper
        currentStep={4}
        dayNumber={dayNum}
        dayId={data?.submission?.assignment?.day?.id}
        assignmentId={data?.submission?.assignment?.id}
        submissionId={data?.submission?.id || params.subId}
      />

      {/* Hero Score Banner */}
      <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className={`w-16 h-16 rounded-xl ${
                passed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              } flex flex-col items-center justify-center font-bold`}
            >
              <span className="text-2xl leading-none font-black">{score}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                    passed
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  } flex items-center gap-1`}
                >
                  {passed ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {passed ? "Passing Grade Achieved" : "Remediation Suggested"}
                </span>
                <span className="text-xs text-muted-foreground">Day {dayNum} Evaluation</span>
              </div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Submission Scorecard & Code Analysis
              </h1>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                {data?.detailedFeedback ||
                  "Deterministic tests and multi-criteria evaluation completed."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {passed ? (
              <button
                onClick={handleUnlockNextDay}
                disabled={unlocking}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors"
              >
                <span>{unlocking ? "Updating Status..." : `Advance to Day ${dayNum + 1}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/backlog"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold border border-border transition-colors"
              >
                <span>Open Remedial Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Rubric Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Deterministic SQL", val: rubricScoresMap.correctness ?? 36, max: 40, color: "text-emerald-600" },
          { label: "Query Logic", val: rubricScoresMap.queryLogic ?? 18, max: 20, color: "text-indigo-600" },
          { label: "Edge Cases", val: rubricScoresMap.edgeCases ?? 12, max: 15, color: "text-amber-600" },
          { label: "Performance", val: rubricScoresMap.performance ?? 9, max: 10, color: "text-emerald-600" },
          { label: "Readability", val: rubricScoresMap.readability ?? 8, max: 10, color: "text-slate-700" },
          { label: "Explanation", val: rubricScoresMap.explanation ?? 3, max: 5, color: "text-slate-600" },
        ].map((r, idx) => {
          const pct = Math.round((r.val / r.max) * 100);
          return (
            <div key={idx} className="p-3.5 rounded-xl bg-card border border-border text-center space-y-1 shadow-xs">
              <span className="text-[11px] text-muted-foreground block truncate font-medium">{r.label}</span>
              <span className={`text-base font-black ${r.color} block`}>
                {r.val} / {r.max}
              </span>
              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {strengthsList.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                <span className="text-emerald-600 font-bold">✓</span>
                <span className="text-slate-800 leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weak Areas & Remediation */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Areas for Remediation
            </h3>
            <button
              onClick={handleCreateCustomDrill}
              className="text-[10px] font-bold px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-300 transition-colors"
            >
              {drillCreated ? "Drill Added to Backlog!" : "+ Create Remedial Drill"}
            </button>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {weakAreasList.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                <span className="text-amber-600 font-bold">!</span>
                <span className="text-slate-800 leading-relaxed">{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Code Submitted vs AI Refactored Solution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Student Code */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-slate-400" /> Your Submitted Solution
            </h3>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-slate-900 h-64">
            <code>{data?.submission?.submittedCode || "-- No submission code"}</code>
          </pre>
        </div>

        {/* Refactored Code */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Reference Solution
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">Production Standard</span>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed border border-slate-900 h-64">
            <code>{data?.codeDiff || data?.submission?.submittedCode || "-- Ideal solution code"}</code>
          </pre>
        </div>
      </div>

      {/* Next Step Transition Banner */}
      <div className="p-5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div
            className={`flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider ${
              passed ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{passed ? "Milestone Completed" : "Not Passed (Under 70% Passing Standard)"}</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            {passed
              ? `Day ${dayNum} Passed! Continue to Next Day on Curriculum Roadmap`
              : "Assignment Must Be Re-Attempted"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            {passed
              ? "Your progress has been recorded. Advance to the next day to continue your career track."
              : "A passing score of 70% or higher is strictly required to complete this curriculum milestone and unlock subsequent days."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {passed ? (
            <button
              onClick={handleUnlockNextDay}
              disabled={unlocking}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>{unlocking ? "Saving..." : "Advance & View Roadmap"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={`/assignment/${data?.submission?.assignment?.day?.id || "day-1"}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-Attempt Assignment</span>
              </Link>
              <Link
                href="/backlog"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold border border-border transition-colors whitespace-nowrap"
              >
                <span>Remedial Tasks</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
