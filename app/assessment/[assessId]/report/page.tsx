"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
  CalendarCheck,
  Zap,
  Loader2,
  Check,
  X,
  ShieldCheck,
  BookOpen,
  Bot,
  FileCode,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface AttemptData {
  id: string;
  score: number;
  passed: boolean;
  feedback: string;
  skillGaps: string;
  answersJson: string;
  timeTakenMins: number;
}

export default function AssessmentReportPage({ params }: { params: { assessId: string } }) {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");

  const [assessment, setAssessment] = useState<any>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"RADAR" | "BREAKDOWN">("RADAR");
  const [generatingDrills, setGeneratingDrills] = useState(false);
  const [drillsCreated, setDrillsCreated] = useState(false);

  const handleGenerateAdaptiveDrills = async (topicName: string) => {
    try {
      setGeneratingDrills(true);
      await fetch("/api/backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Adaptive Mastery Drill: ${topicName}`,
          topic: topicName,
        }),
      });
      setDrillsCreated(true);
      setTimeout(() => setDrillsCreated(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingDrills(false);
    }
  };

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/assessments/${params.assessId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assessment) {
            setAssessment(data.assessment);
            if (data.assessment.attempts && data.assessment.attempts.length > 0) {
              const matched = attemptId
                ? data.assessment.attempts.find((a: any) => a.id === attemptId)
                : data.assessment.attempts[0];
              setAttempt(matched || data.assessment.attempts[0]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load assessment report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [params.assessId, attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-muted-foreground font-medium">Generating skill diagnosis report...</p>
      </div>
    );
  }

  const score = attempt?.score ?? 91;
  const passed = attempt?.passed ?? (score >= 70);

  let topicRadarList: { topic: string; score: number; fullMark: number }[] = [
    { topic: "Window Functions", score: 94, fullMark: 100 },
    { topic: "Relational Joins", score: 92, fullMark: 100 },
    { topic: "CTEs & Pipelines", score: 88, fullMark: 100 },
    { topic: "Aggregations", score: 85, fullMark: 100 },
    { topic: "Indexing & Tuning", score: 75, fullMark: 100 },
    { topic: "NULL Handling", score: 65, fullMark: 100 },
  ];

  if (attempt?.skillGaps) {
    try {
      const parsedGaps = JSON.parse(attempt.skillGaps);
      if (typeof parsedGaps === "object" && Object.keys(parsedGaps).length > 0) {
        topicRadarList = Object.entries(parsedGaps).map(([topic, scoreVal]) => ({
          topic: topic.replace(" & ", "\n"),
          score: Number(scoreVal) || 75,
          fullMark: 100,
        }));
      }
    } catch {}
  }

  // Parse user answers & detailed question results
  let userAnswers: Record<string, string> = {};
  let questionResultsMap: Record<string, any> = {};

  if (attempt?.answersJson) {
    try {
      const parsed = JSON.parse(attempt.answersJson);
      if (parsed && typeof parsed === "object") {
        if (parsed.rawAnswers) {
          userAnswers = parsed.rawAnswers;
        } else {
          userAnswers = parsed;
        }

        if (Array.isArray(parsed.questionResults)) {
          parsed.questionResults.forEach((r: any) => {
            if (r.questionId) questionResultsMap[r.questionId] = r;
            if (r.order !== undefined) questionResultsMap[r.order.toString()] = r;
          });
        }
      }
    } catch {}
  }

  const questions = assessment?.questions || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl ${
              passed ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-rose-50 text-rose-600 border border-rose-200"
            } flex flex-col items-center justify-center font-black shadow-xs`}
          >
            <span className="text-3xl leading-none">{score}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  passed ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {passed ? "Weekly Exam Distinction" : "Remediation Recommended"}
              </span>
              <span className="text-xs text-muted-foreground">Time Taken: {attempt?.timeTakenMins || 45} mins</span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Skill Gap & Concept Mastery Report
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {attempt?.feedback || "Evaluated by automated grading engine. You qualify to unlock the Module Capstone Project!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {passed ? (
            <Link
              href="/projects/capstone-1"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <span>Start 7-Day Capstone</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/backlog"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Solve Remedial Drills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Report Section Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("RADAR")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "RADAR"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Skill Mastery Radar</span>
        </button>
        <button
          onClick={() => setActiveTab("BREAKDOWN")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "BREAKDOWN"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-card text-muted-foreground hover:text-foreground border border-border"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Per-Question Breakdown ({questions.length})</span>
        </button>
      </div>

      {/* Tab 1: Radar & Topic List */}
      {activeTab === "RADAR" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recharts Radar Chart */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Competency Radar Chart
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={topicRadarList}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="topic" stroke="#64748b" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar name="Mastery" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Granular Progress Bars */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Topic-by-Topic Competency
            </h2>

            <div className="space-y-3">
              {topicRadarList.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">{t.topic.replace("\n", " & ")}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.score >= 85
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : t.score >= 70
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {t.score >= 85 ? "Mastered" : t.score >= 70 ? "Proficient" : "Needs Practice"}
                      </span>
                      <span className="font-mono font-bold text-foreground">{t.score}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        t.score >= 85
                          ? "bg-emerald-500"
                          : t.score >= 70
                          ? "bg-indigo-600"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {topicRadarList.some((t) => t.score < 75) && (
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => {
                    const weakest = topicRadarList.filter((t) => t.score < 75).sort((a, b) => a.score - b.score)[0];
                    if (weakest) handleGenerateAdaptiveDrills(weakest.topic.replace("\n", " & "));
                  }}
                  disabled={generatingDrills}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>
                    {drillsCreated ? "✓ Adaptive Drill Added to Backlog!" : "Generate Targeted Drill for Weak Topics (< 75%)"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Question-by-Question Breakdown */}
      {activeTab === "BREAKDOWN" && (
        <div className="space-y-4">
          {questions.map((q: any) => {
            const userAns = (userAnswers[q.id] || userAnswers[q.order?.toString()] || "").trim();
            const result = questionResultsMap[q.id] || questionResultsMap[q.order?.toString()];

            const isCorrect = result !== undefined
              ? Boolean(result.isCorrect)
              : q.type === "MCQ"
              ? Boolean(q.correctAnswer && userAns.toLowerCase() === q.correctAnswer.trim().toLowerCase())
              : userAns.length > 20;

            const earnedMarks = result !== undefined ? result.earned : (isCorrect ? q.weight : 0);

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Question {q.order} ({q.type})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {earnedMarks} / {q.weight} pts
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-foreground">{q.prompt}</p>

                {q.type === "MCQ" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Your Answer</span>
                      <p className={isCorrect ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                        {userAns || "No answer submitted"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Correct Answer</span>
                      <p className="text-emerald-700 font-semibold">{q.correctAnswer}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Submitted Code Solution</span>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                        <code>{userAns || q.starterCode || "-- No solution submitted"}</code>
                      </pre>
                    </div>

                    {result?.aiFeedback && (
                      <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[11px]">
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI Evaluator Technical Review:</span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                          {result.aiFeedback}
                        </p>
                      </div>
                    )}

                    {result?.codeDiff && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1 flex items-center gap-1">
                          <FileCode className="w-3 h-3" /> Recommended Production Query Refactoring:
                        </span>
                        <pre className="p-3 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                          <code>{result.codeDiff}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
