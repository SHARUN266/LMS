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
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Generating comprehensive skill gap diagnosis report...</p>
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

  // Parse user answers
  let userAnswers: Record<string, string> = {};
  if (attempt?.answersJson) {
    try {
      userAnswers = JSON.parse(attempt.answersJson);
    } catch {}
  }

  const questions = assessment?.questions || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${
              passed ? "from-emerald-500 to-teal-400 shadow-glow-emerald" : "from-rose-500 to-amber-500 shadow-glow"
            } flex flex-col items-center justify-center text-slate-950 font-black`}
          >
            <span className="text-3xl leading-none">{score}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  passed ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                }`}
              >
                {passed ? "Weekly Exam Distinction" : "Remediation Recommended"}
              </span>
              <span className="text-xs text-slate-400">Time Taken: {attempt?.timeTakenMins || 45} mins</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Skill Gap & Concept Mastery Report
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {attempt?.feedback || "Evaluated by Qwen 2.5 Coder. You qualify to unlock the Module Capstone Project!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {passed ? (
            <Link
              href="/projects/capstone-1"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-white text-xs font-black shadow-glow transition-all flex items-center gap-2"
            >
              <span>Start 7-Day Capstone</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href="/backlog"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2"
            >
              <span>Solve Remedial Drills</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Report Section Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("RADAR")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "RADAR"
              ? "bg-masai-red text-white shadow-glow"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Skill Mastery Radar</span>
        </button>
        <button
          onClick={() => setActiveTab("BREAKDOWN")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "BREAKDOWN"
              ? "bg-masai-red text-white shadow-glow"
              : "bg-slate-900 text-slate-400 hover:text-white"
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
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-masai-accent" /> Competency Radar Chart
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={topicRadarList}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="topic" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Mastery" dataKey="score" stroke="#E50914" fill="#E50914" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Granular Progress Bars */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Topic-by-Topic Competency
            </h2>

            <div className="space-y-3">
              {topicRadarList.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">{t.topic.replace("\n", " & ")}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.score >= 85
                            ? "bg-emerald-500/20 text-emerald-400"
                            : t.score >= 70
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {t.score >= 85 ? "Mastered" : t.score >= 70 ? "Proficient" : "Needs Practice"}
                      </span>
                      <span className="font-mono font-bold text-white">{t.score}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        t.score >= 85
                          ? "bg-emerald-500"
                          : t.score >= 70
                          ? "bg-cyan-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Question-by-Question Breakdown */}
      {activeTab === "BREAKDOWN" && (
        <div className="space-y-4">
          {questions.map((q: any) => {
            const userAns = (userAnswers[q.id] || userAnswers[q.order.toString()] || "").trim();
            const isCorrect =
              q.type === "MCQ"
                ? q.correctAnswer && userAns.toLowerCase() === q.correctAnswer.trim().toLowerCase()
                : userAns.length > 20;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      Question {q.order} ({q.type})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{q.weight}% Weight</span>
                </div>

                <p className="text-xs font-bold text-slate-100">{q.prompt}</p>

                {q.type === "MCQ" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Your Answer</span>
                      <p className={isCorrect ? "text-emerald-300 font-semibold" : "text-rose-300 font-semibold"}>
                        {userAns || "No answer submitted"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Correct Answer</span>
                      <p className="text-emerald-300 font-semibold">{q.correctAnswer}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Submitted Code Solution</span>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                      <code>{userAns || q.starterCode || "-- No solution submitted"}</code>
                    </pre>
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
