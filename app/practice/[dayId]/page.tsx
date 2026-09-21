"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Play,
  CheckCircle2,
  HelpCircle,
  Database,
  Terminal,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { DailyStepper } from "@/components/DailyStepper";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface PracticeItem {
  id: string;
  order: number;
  title: string;
  difficulty: string;
  problem: string;
  starterCode?: string;
  solution?: string;
  hints?: string;
}

interface DayData {
  id: string;
  dayNumber: number;
  title: string;
  practice: PracticeItem[];
  assignments: { id: string; title: string }[];
}

export default function PracticePage({ params }: { params: { dayId: string } }) {
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExerciseIdx, setSelectedExerciseIdx] = useState(0);

  const [code, setCode] = useState(`-- Practice Drill
SELECT * FROM orders LIMIT 10;`);

  const [isRunning, setIsRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [hintStep, setHintStep] = useState(0);
  const [completedDrills, setCompletedDrills] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadDay() {
      try {
        setLoading(true);
        const res = await fetch(`/api/days/${params.dayId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.day) {
            setDayData(data.day);
            if (data.day.practice && data.day.practice.length > 0) {
              const firstEx = data.day.practice[0];
              if (firstEx.starterCode) {
                setCode(firstEx.starterCode);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch day practice:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDay();
  }, [params.dayId]);

  const currentExercise = dayData?.practice?.[selectedExerciseIdx] || {
    id: "p1",
    order: 1,
    title: "Drill 1: Analytical SQL Practice",
    difficulty: "Intermediate",
    problem: "Write a SQL query addressing the business scenario.",
    hints: JSON.stringify([
      "Break down the query into Common Table Expressions (CTEs).",
      "Check column names and aliases before executing.",
    ]),
  };

  let parsedHints: string[] = [];
  try {
    if (currentExercise.hints) {
      parsedHints = typeof currentExercise.hints === "string" ? JSON.parse(currentExercise.hints) : currentExercise.hints;
    }
  } catch (e) {
    parsedHints = ["Break down the query using CTEs and verify column types."];
  }

  const handleSelectExercise = (idx: number) => {
    setSelectedExerciseIdx(idx);
    setHintStep(0);
    setQueryResult(null);
    const ex = dayData?.practice?.[idx];
    if (ex?.starterCode) {
      setCode(ex.starterCode);
    }
  };

  const handleRunQuery = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/sql/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: code }),
      });
      const data = await res.json();
      setQueryResult(data);

      // If query ran without error and returned rows, mark drill completed
      if (data.rows && data.rows.length > 0) {
        setCompletedDrills((prev) => ({ ...prev, [selectedExerciseIdx]: true }));
      }
    } catch (err: any) {
      setQueryResult({ error: err.message, columns: [], rows: [] });
    } finally {
      setIsRunning(false);
    }
  };

  const dayNumber = dayData?.dayNumber || 2;
  const assignmentHref = `/assignment/${dayData?.assignments?.[0]?.id || `daily-${dayNumber}`}`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Loading practice sandbox environment...</p>
      </div>
    );
  }

  const practiceCount = dayData?.practice?.length || 1;

  return (
    <div className="space-y-4 pb-8">
      {/* Daily Progress Stepper */}
      <DailyStepper
        currentStep={2}
        dayNumber={dayNumber}
        dayId={dayData?.id || params.dayId}
      />

      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted text-foreground border border-border">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Day {dayNumber} Practice Sandbox</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {currentExercise.difficulty || "Intermediate"} Difficulty
              </span>
            </div>
            <h1 className="text-sm font-bold text-foreground truncate max-w-xl">
              {currentExercise.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Exercise Tabs for all practice drills */}
          {practiceCount > 1 && (
            <div className="flex rounded-lg bg-card border border-border p-0.5 mr-1">
              {dayData?.practice?.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectExercise(i)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    selectedExerciseIdx === i
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Drill {i + 1}</span>
                  {completedDrills[i] && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}

          {/* Progressive Hint Button */}
          {parsedHints.length > 0 && (
            <button
              onClick={() => setHintStep((prev) => Math.min(parsedHints.length, prev + 1))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border text-xs font-medium transition-all shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{hintStep === 0 ? "Socratic Hint" : `Hint ${hintStep}/${parsedHints.length}`}</span>
            </button>
          )}

          {/* Run SQL */}
          <button
            onClick={handleRunQuery}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Executing..." : "Run Query"}</span>
          </button>

          <Link
            href={assignmentHref}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Graded Assignment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Problem statement banner */}
      <div className="p-3.5 rounded-xl bg-card border border-border text-xs text-foreground shadow-sm">
        <span className="font-bold text-indigo-600 uppercase tracking-wider text-[11px] block mb-1">Problem Statement:</span>
        <p className="text-slate-700 leading-relaxed">{currentExercise.problem}</p>
      </div>

      {/* Progressive Hint Box */}
      {hintStep > 0 && parsedHints[hintStep - 1] && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 flex items-start gap-2.5 shadow-sm animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-700">AI Socratic Hint {hintStep}: </span>
            <span className="text-amber-800">{parsedHints[hintStep - 1]}</span>
          </div>
        </div>
      )}

      {/* Main Split Pane: Left Monaco Editor, Right Table Schema & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 h-[480px]">
        {/* Left: Monaco SQL Editor */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-border bg-card shadow-sm h-full">
          <div className="h-9 px-4 bg-muted/60 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5 font-mono text-indigo-600 font-bold">
              <Database className="w-3.5 h-3.5" /> drill_{selectedExerciseIdx + 1}.sql (Monaco Sandbox)
            </span>
            <span className="text-[11px] text-muted-foreground">PostgreSQL / SQLite Sandbox</span>
          </div>
          <div className="flex-1 min-h-0 bg-slate-950">
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "Fira Code, monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* Right: Results / Output Pane */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-border bg-card shadow-sm">
          <div className="h-9 px-4 bg-muted/60 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
            <span className="flex items-center gap-1.5 font-mono text-emerald-600 font-bold">
              <Terminal className="w-3.5 h-3.5" /> Execution Results
            </span>
            {queryResult && (
              <span className="text-[11px] text-muted-foreground">
                {queryResult.rowCount !== undefined ? `${queryResult.rowCount} rows returned` : ""}
              </span>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-auto p-4 bg-white">
            {isRunning ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Executing query on in-memory dataset...</span>
              </div>
            ) : queryResult?.error ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-rose-900">Query Execution Error:</span>
                  <span className="font-mono text-rose-700">{queryResult.error}</span>
                </div>
              </div>
            ) : queryResult?.rows && queryResult.rows.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Query Executed Successfully ({queryResult.rows.length} rows returned)</span>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-border">
                      <tr>
                        {queryResult.columns.map((col: string, i: number) => (
                          <th key={i} className="p-2.5 font-mono">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-mono text-[11px]">
                      {queryResult.rows.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                          {queryResult.columns.map((col: string, cIdx: number) => (
                            <td key={cIdx} className="p-2.5">
                              {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-400">NULL</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                <Database className="w-8 h-8 text-slate-300" />
                <p className="font-medium text-slate-600">Click &ldquo;Run Query&rdquo; to execute and see SQL results</p>
                <p className="text-[11px] text-slate-400">Sample tables available: <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">customers</code>, <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">orders</code>, <code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded">products</code></p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next Step Transition Banner */}
      <div className="p-5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Finished Practice Drills?</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Step 3: Graded Assignment & Strict Rubric
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Test your problem solving against realistic industry criteria. Submit your final code for automated evaluation and scorecards.
          </p>
        </div>
        <Link
          href={assignmentHref}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <span>Continue to Step 3: Assignment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
