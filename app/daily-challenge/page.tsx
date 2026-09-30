"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  Database,
  Terminal,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Loader2,
  Building2,
  BookOpen,
  Brain,
  Layers,
  HelpCircle,
  ShieldAlert,
  Check,
  ChevronRight,
  Eye,
  Lock,
  Compass,
  ArrowRight,
} from "lucide-react";

import { CodeEditor } from "@/components/CodeEditor";

interface ThinkingFramework {
  businessObjective: string;
  dataGrain: { inputGrain: string; outputGrain: string };
  cornerCasesAndTraps: string[];
  recommendedMentalSteps: string[];
}

interface HintLadderItem {
  level: 1 | 2 | 3;
  title: string;
  content: string;
}

interface TestCaseScenario {
  name: string;
  category: "happy_path" | "edge_case" | "scale_integrity";
  description: string;
  trapExplanation: string;
}

interface OptimalAnalysis {
  staffSolution: string;
  suboptimalTraps: string;
  complexityInsight: string;
  interviewFollowUp: string;
}

interface POTDData {
  id: string;
  dateKey: string;
  company: string;
  title: string;
  difficulty: string;
  concept: string;
  scenario: string;
  starterCode: string;
  thinkingFramework: ThinkingFramework;
  hintLadder: HintLadderItem[];
  testScenarios: TestCaseScenario[];
  optimalAnalysis: OptimalAnalysis;
  learnerContextSummary?: {
    currentTopic: string;
    currentModule: string;
    targetedWeakAreas: string[];
    difficultyCalibrated: string;
  };
  isSolved: boolean;
}

type ActiveLeftTab = "scenario" | "framework" | "hints" | "optimal";

export default function DailyChallengePage() {
  const [potd, setPotd] = useState<POTDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveLeftTab>("scenario");
  const [unlockedHints, setUnlockedHints] = useState<number[]>([1]); // Hint 1 unlocked by default
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [showSchema, setShowSchema] = useState(false);

  // Socratic AI Hint State
  const [socraticLoading, setSocraticLoading] = useState(false);
  const [socraticHint, setSocraticHint] = useState<string | null>(null);

  useEffect(() => {
    async function loadPOTD() {
      try {
        setLoading(true);
        const res = await fetch("/api/potd");
        const data = await res.json();
        if (data.potd) {
          setPotd(data.potd);
          setCode(data.potd.starterCode);
          if (data.potd.isSolved) {
            setUnlockedHints([1, 2, 3]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch POTD:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPOTD();
  }, []);

  const handleRunQuery = async () => {
    setIsRunning(true);
    setEvalResult(null);
    try {
      const res = await fetch("/api/sql/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: code }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      setQueryResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!potd) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/potd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedCode: code,
          dateKey: potd.dateKey,
        }),
      });
      const data = await res.json();
      setEvalResult(data);
      if (data.passed) {
        setPotd({ ...potd, isSolved: true });
        setUnlockedHints([1, 2, 3]);
      }
    } catch (err: any) {
      setEvalResult({ passed: false, feedback: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestSocraticHint = async () => {
    if (socraticLoading) return;
    setSocraticLoading(true);
    try {
      const res = await fetch("/api/potd/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCode: code,
          runtimeError: evalResult?.feedback || queryResult?.error || null,
        }),
      });
      const data = await res.json();
      if (data.hint) {
        setSocraticHint(data.hint);
        setActiveTab("hints");
      }
    } catch (err) {
      console.error("Socratic hint error:", err);
    } finally {
      setSocraticLoading(false);
    }
  };

  const unlockHint = (lvl: number) => {
    if (!unlockedHints.includes(lvl)) {
      setUnlockedHints((prev) => [...prev, lvl]);
    }
  };

  const handleReset = () => {
    if (potd?.starterCode) {
      setCode(potd.starterCode);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-muted-foreground font-medium">Loading Axiom Problem-Solving POTD...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Command Center</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Daily Muscle-Memory Engine
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md relative overflow-hidden border border-slate-700/60">
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-purple-500 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-masai-red text-white text-[10px] font-extrabold tracking-wide uppercase shadow-2xs">
                <Flame className="w-3 h-3 fill-current" /> Daily POTD
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-bold border border-white/10">
                <Building2 className="w-3 h-3 text-indigo-300" /> {potd?.company}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {potd?.difficulty}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Date: {potd?.dateKey}</span>
            </div>

            <h1 className="text-xl md:text-2xl font-black tracking-tight">{potd?.title}</h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Target Concept: <strong className="text-indigo-300 font-semibold">{potd?.concept}</strong>.
              Structured problem designed to develop real algorithmic deconstruction and interview edge-case instinct.
            </p>

            {potd?.learnerContextSummary && (
              <div className="flex items-center flex-wrap gap-2 pt-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-medium">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span>Module Sync: <strong>{potd.learnerContextSummary.currentTopic}</strong></span>
                </span>
                {potd.learnerContextSummary.targetedWeakAreas?.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] bg-rose-500/20 text-rose-200 border border-rose-400/30 font-medium">
                    <ShieldAlert className="w-3 h-3 text-rose-300" />
                    <span>Reinforcing Weak Areas: <strong>{potd.learnerContextSummary.targetedWeakAreas.join(", ")}</strong></span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reward</span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 fill-amber-400" /> +50 XP
              </span>
            </div>
            {potd?.isSolved ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center">
                <span className="text-[10px] uppercase font-bold block">Status</span>
                <span className="text-xs font-black flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved Today!
                </span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center">
                <span className="text-[10px] uppercase font-bold block">Mandatory Gate</span>
                <span className="text-xs font-bold flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Unlocks Next Day
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification if passed */}
      {evalResult?.passed && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                🎉 Daily Problem Solved Successfully!
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                +50 XP awarded. Daily streak extended. Next day curriculum is now completely unlocked!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("optimal")}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Staff Solution</span>
            </button>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1"
            >
              <span>Go to Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Split Grid: Left Cognitive Panel vs Right Sandbox Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ── LEFT COLUMN: COGNITIVE HUB (TABS) ────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
            
            {/* Tab Navigation Header */}
            <div className="flex items-center border-b border-border bg-muted/30 px-2 pt-2 gap-1 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveTab("scenario")}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap ${
                  activeTab === "scenario"
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Business Problem</span>
              </button>

              <button
                onClick={() => setActiveTab("framework")}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap ${
                  activeTab === "framework"
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Thinking Framework</span>
              </button>

              <button
                onClick={() => setActiveTab("hints")}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap relative ${
                  activeTab === "hints"
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Hint Ladder</span>
                {socraticHint && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping absolute right-1 top-2" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("optimal")}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap ${
                  activeTab === "optimal"
                    ? "border-primary text-primary bg-card"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Staff Analysis</span>
                {!potd?.isSolved && (
                  <Lock className="w-3 h-3 text-muted-foreground/60" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 space-y-4">
              
              {/* TAB 1: BUSINESS SCENARIO */}
              {activeTab === "scenario" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      {potd?.company} Real Challenge
                    </span>
                    <button
                      onClick={() => setShowSchema(!showSchema)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>{showSchema ? "Hide Schema" : "Inspect Tables"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                    {potd?.scenario}
                  </p>

                  {/* Schema Drawer */}
                  {showSchema && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Available Sandbox Tables & Columns:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <strong className="text-emerald-400">customers:</strong>
                          <p className="text-slate-400">id, name, email, city, country, segment, signup_date</p>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <strong className="text-sky-400">orders:</strong>
                          <p className="text-slate-400">id, customer_id, order_date, total_amount, status</p>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <strong className="text-amber-400">products:</strong>
                          <p className="text-slate-400">id, name, category, price, cost, stock_quantity</p>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                          <strong className="text-purple-400">order_items:</strong>
                          <p className="text-slate-400">id, order_id, product_id, quantity, unit_price</p>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 col-span-1 sm:col-span-2">
                          <strong className="text-rose-400">employees:</strong>
                          <p className="text-slate-400">id, name, department, salary, manager_id, hire_date</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verification Criteria Preview */}
                  <div className="pt-2 border-t border-border space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Verification Test Suite ({potd?.testScenarios.length} Scenarios):
                    </span>
                    <div className="space-y-1.5">
                      {potd?.testScenarios.map((sc, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs flex items-start gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-background border border-border text-foreground shrink-0 mt-0.5">
                            {sc.category === "happy_path" ? "Logic" : sc.category === "edge_case" ? "Trap" : "Scale"}
                          </span>
                          <div>
                            <span className="font-bold text-foreground block text-[11px]">{sc.name}</span>
                            <span className="text-[10px] text-muted-foreground leading-normal">{sc.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: THINKING FRAMEWORK (MENTAL MODEL) */}
              {activeTab === "framework" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      Core Business Objective
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {potd?.thinkingFramework.businessObjective}
                    </p>
                  </div>

                  {/* Grain Deconstruction */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-500" />
                      1. Data Grain Deconstruction
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">Input Grain</span>
                        <p className="text-[11px] text-foreground font-medium mt-0.5">
                          {potd?.thinkingFramework.dataGrain.inputGrain}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Required Output Grain</span>
                        <p className="text-[11px] text-foreground font-medium mt-0.5">
                          {potd?.thinkingFramework.dataGrain.outputGrain}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Corner Cases & Traps */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      2. Common Corner Cases & Traps to Avoid
                    </span>
                    <div className="space-y-1.5">
                      {potd?.thinkingFramework.cornerCasesAndTraps.map((trap, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-xs">
                          <p className="text-[11px] text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                            {trap}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5-Step Mental Blueprint */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-indigo-500" />
                      3. Step-by-Step Mental Blueprint
                    </span>
                    <div className="space-y-1.5">
                      {potd?.thinkingFramework.recommendedMentalSteps.map((step, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-muted/40 border border-border text-[11px] text-foreground font-medium flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HINT LADDER */}
              {activeTab === "hints" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      Socratic Hint Ladder
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Unlock sequentially without spoiling the answer
                    </span>
                  </div>

                  {/* AI Socratic Live Hint Banner */}
                  {socraticHint && (
                    <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Axiom Socratic Diagnostic on your Query:</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-line font-medium">
                        {socraticHint}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {potd?.hintLadder.map((hint) => {
                      const isUnlocked = unlockedHints.includes(hint.level);

                      return (
                        <div
                          key={hint.level}
                          className={`p-3.5 rounded-xl border text-xs transition-all ${
                            isUnlocked
                              ? "bg-muted/40 border-border"
                              : "bg-muted/10 border-border/50 opacity-75"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center">
                                {hint.level}
                              </span>
                              <span>Level {hint.level}: {hint.title}</span>
                            </span>
                            {!isUnlocked && (
                              <button
                                onClick={() => unlockHint(hint.level)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                              >
                                Unlock Hint
                              </button>
                            )}
                          </div>
                          {isUnlocked ? (
                            <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                              {hint.content}
                            </p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground/60 italic pl-5">
                              Hint locked. Click unlock when stuck to receive conceptual guidance.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Ask Axiom Socratic Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleRequestSocraticHint}
                      disabled={socraticLoading}
                      className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {socraticLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>
                        {socraticLoading
                          ? "Axiom is analyzing your code..."
                          : "Ask Axiom Copilot to diagnose my logic"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: STAFF POST-MORTEM & OPTIMAL ANALYSIS */}
              {activeTab === "optimal" && (
                <div className="space-y-4">
                  {!potd?.isSolved ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        Staff Solution Locked
                      </span>
                      <p className="text-[11px] max-w-xs leading-relaxed">
                        To build real muscle-memory and problem-solving grit, solve the problem first or submit an executable attempt.
                      </p>
                      <button
                        onClick={() => {
                          setPotd({ ...potd!, isSolved: true });
                          setUnlockedHints([1, 2, 3]);
                        }}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline pt-2"
                      >
                        I give up, reveal Staff Solution (-50 XP)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Staff Analytics Engineer Solution</span>
                        </div>
                        <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
                          <code>{potd?.optimalAnalysis.staffSolution}</code>
                        </pre>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Production Performance Insight
                        </span>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          {potd?.optimalAnalysis.complexityInsight}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase block">
                          12 LPA Interview Follow-Up Trap
                        </span>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          {potd?.optimalAnalysis.interviewFollowUp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: SANDBOX & VERIFICATION RUNNER ─────────────── */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Code Editor Card */}
          <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm h-[380px]">
            <div className="h-10 px-4 bg-muted/60 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                <Terminal className="w-3.5 h-3.5" /> potd_sandbox.sql
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  title="Reset to starter template"
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-slate-950">
              <CodeEditor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleRunQuery}
              disabled={isRunning || isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 text-emerald-600 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running Sandbox..." : "Run Query Preview"}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isRunning || isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? "Testing All Scenarios..." : "Submit for POTD Verification"}</span>
            </button>
          </div>

          {/* Verification Results Panel */}
          {evalResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2.5 shadow-sm animate-fadeIn ${
                evalResult.passed
                  ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100"
                  : "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {evalResult.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{evalResult.passed ? "All Verification Scenarios Passed!" : "Verification Incomplete"}</span>
                </span>
                <span className="font-mono text-xs">Score: {evalResult.score}%</span>
              </div>
              <p className="text-[11px] leading-relaxed font-medium">{evalResult.feedback}</p>

              {evalResult.testResults && (
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  {evalResult.testResults.map((tr: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded bg-background/50">
                      <span>• {tr.name}</span>
                      <span className={tr.passed ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                        {tr.passed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {evalResult.passed && (
                <div className="pt-3 border-t border-emerald-300 dark:border-emerald-800 flex justify-end">
                  <Link
                    href={`/assignment/daily-1`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <span>Proceed to Step 4: Graded Assignment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Live Query Results Table Preview */}
          {queryResult && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden text-xs">
              <div className="px-4 py-2 bg-muted/60 border-b border-border flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Sandbox Execution Output</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {queryResult.error
                    ? "Execution Error"
                    : `${queryResult.rowCount || (queryResult.rows ? queryResult.rows.length : 0)} rows returned`}
                </span>
              </div>

              {queryResult.error ? (
                <div className="p-3 text-rose-600 dark:text-rose-400 font-mono text-[11px] bg-rose-50/30 dark:bg-rose-950/20">
                  {queryResult.error}
                </div>
              ) : queryResult.rows && queryResult.rows.length > 0 ? (
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-mono sticky top-0">
                      <tr>
                        {queryResult.columns?.map((col: string, i: number) => (
                          <th key={i} className="px-3 py-2 border-b border-border">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono">
                      {queryResult.rows.slice(0, 10).map((row: any[], rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-muted/20">
                          {row.map((val: any, cIdx: number) => (
                            <td key={cIdx} className="px-3 py-1.5 text-foreground/80">
                              {val === null ? <span className="text-amber-500 italic">NULL</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {queryResult.rows.length > 10 && (
                    <div className="p-2 text-center text-[10px] text-muted-foreground border-t border-border">
                      Showing first 10 rows of {queryResult.rows.length} total rows.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground text-xs italic">
                  Query executed successfully but returned 0 rows.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
