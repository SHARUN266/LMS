"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface POTDData {
  id: string;
  dateKey: string;
  company: string;
  title: string;
  difficulty: string;
  concept: string;
  scenario: string;
  starterCode: string;
  testScenarios: { name: string; description: string }[];
  isSolved: boolean;
}

export default function DailyChallengePage() {
  const [potd, setPotd] = useState<POTDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [showSchema, setShowSchema] = useState(false);

  useEffect(() => {
    async function loadPOTD() {
      try {
        setLoading(true);
        const res = await fetch("/api/potd");
        const data = await res.json();
        if (data.potd) {
          setPotd(data.potd);
          setCode(data.potd.starterCode);
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
      }
    } catch (err: any) {
      setEvalResult({ passed: false, feedback: err.message });
    } finally {
      setIsSubmitting(false);
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
        <p className="text-xs text-slate-400 font-medium">Loading Masai Daily Foundation POTD...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16">
      {/* Back to Dashboard Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Command Center</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Masai Dual-Track: Foundation Track
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
              Core Concept: <strong className="text-indigo-300 font-semibold">{potd?.concept}</strong>.
              Daily muscle-memory problem designed to build speed, structural precision, and interview confidence.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Reward</span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 fill-amber-400" /> +50 XP
              </span>
            </div>
            {potd?.isSolved && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center">
                <span className="text-[10px] uppercase font-bold block">Status</span>
                <span className="text-xs font-black flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Solved Today!
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification if passed */}
      {evalResult?.passed && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                🎉 Daily Challenge Solved Successfully!
              </span>
              <span className="text-[11px] text-emerald-700">
                +50 XP awarded to your profile. Daily muscle-memory streak extended!
              </span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
          >
            Go to Command Center
          </Link>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Col: Problem Context & Scenarios */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Business Challenge Scenario
              </span>
              <button
                onClick={() => setShowSchema(!showSchema)}
                className="text-[11px] font-semibold text-slate-500 hover:text-foreground flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span>{showSchema ? "Hide Schema" : "Inspect Schema"}</span>
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {potd?.scenario}
            </p>

            {/* Schema Drawer */}
            {showSchema && (
              <div className="p-3 rounded-xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Available Tables:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <strong className="text-emerald-400">customers:</strong>
                    <p className="text-slate-400">id, name, email, city, segment</p>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <strong className="text-sky-400">orders:</strong>
                    <p className="text-slate-400">id, customer_id, order_date, total_amount, status</p>
                  </div>
                </div>
              </div>
            )}

            {/* Test Scenarios */}
            <div className="pt-2 border-t border-border space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">
                Verification Criteria:
              </span>
              <div className="space-y-1.5">
                {potd?.testScenarios.map((sc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block text-[11px]">{sc.name}</span>
                    <span className="text-[10px] text-slate-600">{sc.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Test Evaluation Feedback */}
          {evalResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2.5 shadow-sm ${
                evalResult.passed
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  : "bg-rose-50/70 border-rose-200 text-rose-950"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {evalResult.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{evalResult.passed ? "All Criteria Satisfied" : "Verification Failed"}</span>
                </span>
                <span>Score: {evalResult.score}%</span>
              </div>
              <p className="text-[11px] leading-relaxed">{evalResult.feedback}</p>

              {evalResult.testResults && (
                <div className="space-y-1 pt-1 border-t border-slate-200/60">
                  {evalResult.testResults.map((tr: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                      <span>• {tr.name}</span>
                      <span className={tr.passed ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                        {tr.passed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Editor & Query Results */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm h-[380px]">
            <div className="h-10 px-4 bg-muted/60 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5 font-mono text-indigo-600 font-bold">
                <Terminal className="w-3.5 h-3.5" /> potd_solution.sql (Monaco Sandbox)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  title="Reset to starter template"
                  className="p-1 rounded hover:bg-muted text-slate-500 hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleRunQuery}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 text-emerald-600 ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running..." : "Run Query"}</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-masai-red hover:bg-masai-red/90 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Against Tests...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit POTD (+50 XP)</span>
                </>
              )}
            </button>
          </div>

          {/* Sandbox Query Output */}
          {queryResult && (
            <div className="p-3.5 rounded-xl bg-card border border-border text-xs shadow-sm space-y-2 max-h-56 overflow-auto">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pb-1 border-b border-border">
                <span>Output Preview</span>
                <span>{queryResult.rowCount !== undefined ? `${queryResult.rowCount} rows` : ""}</span>
              </div>

              {queryResult.error ? (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px]">
                  {queryResult.error}
                </div>
              ) : queryResult.rows && queryResult.rows.length > 0 ? (
                <div className="overflow-x-auto rounded border border-border">
                  <table className="w-full text-left font-mono text-[10px]">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-border">
                      <tr>
                        {queryResult.columns.map((c: string, idx: number) => (
                          <th key={idx} className="p-1.5">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queryResult.rows.slice(0, 5).map((r: any, rI: number) => (
                        <tr key={rI} className="hover:bg-slate-50">
                          {queryResult.columns.map((c: string, cI: number) => (
                            <td key={cI} className="p-1.5">
                              {r[c] !== null && r[c] !== undefined ? String(r[c]) : "NULL"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-2 text-[11px]">Query executed with 0 rows returned.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
