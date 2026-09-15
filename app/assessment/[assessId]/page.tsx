"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface AssessmentQuestion {
  id: string;
  order: number;
  type: string; // "MCQ" | "CODE"
  prompt: string;
  options?: string;
  starterCode?: string;
  weight: number;
}

interface AssessmentData {
  id: string;
  title: string;
  durationMins: number;
  passingScore: number;
  week?: {
    title: string;
  };
  questions: AssessmentQuestion[];
}

export default function AssessmentHallPage({ params }: { params: { assessId: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [filterType, setFilterType] = useState<"ALL" | "MCQ" | "CODE">("ALL");

  const [timeLeftSeconds, setTimeLeftSeconds] = useState(5400); // 90 mins
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    async function loadAssessment() {
      try {
        setLoading(true);
        const res = await fetch(`/api/assessments/${params.assessId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assessment) {
            setAssessment(data.assessment);
            setTimeLeftSeconds((data.assessment.durationMins || 90) * 60);

            // Restore from localStorage if draft exists
            const storageKey = `lms_exam_${params.assessId}_draft`;
            const savedDraft = localStorage.getItem(storageKey);
            let restoredAnswers: Record<string, string> = {};

            if (savedDraft) {
              try {
                restoredAnswers = JSON.parse(savedDraft);
              } catch {}
            }

            // Populate starter codes for CODE questions if not yet answered
            data.assessment.questions.forEach((q: AssessmentQuestion) => {
              if (q.type === "CODE" && !restoredAnswers[q.id] && q.starterCode) {
                restoredAnswers[q.id] = q.starterCode;
              }
            });

            setAnswers(restoredAnswers);
          }
        }
      } catch (err) {
        console.error("Failed to load assessment:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, [params.assessId]);

  // Exam timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Periodic Auto-save to localStorage
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(answersRef.current).length > 0) {
        localStorage.setItem(`lms_exam_${params.assessId}_draft`, JSON.stringify(answersRef.current));
        setAutoSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    }, 20000);
    return () => clearInterval(autoSaveInterval);
  }, [params.assessId]);

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isUrgent = timeLeftSeconds < 600; // < 10 mins

  const handleFinishExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const durationTotal = assessment?.durationMins || 90;
      const timeSpent = Math.max(1, durationTotal - Math.round(timeLeftSeconds / 60));

      const res = await fetch(`/api/assessments/${assessment?.id || params.assessId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersRef.current,
          timeTakenMins: timeSpent,
        }),
      });

      const data = await res.json();
      localStorage.removeItem(`lms_exam_${params.assessId}_draft`);

      if (data.attemptId) {
        router.push(`/assessment/${params.assessId}/report?attemptId=${data.attemptId}`);
      } else {
        router.push(`/assessment/${params.assessId}/report`);
      }
    } catch (err) {
      console.error("Exam submission failed:", err);
      router.push(`/assessment/${params.assessId}/report`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Entering Monday Exam Hall & initializing proctored session...</p>
      </div>
    );
  }

  const allQuestions = assessment?.questions || [];
  const filteredQuestions = allQuestions.filter((q) => {
    if (filterType === "MCQ") return q.type === "MCQ";
    if (filterType === "CODE") return q.type === "CODE";
    return true;
  });

  const currentQuestion = allQuestions[activeQIdx] || allQuestions[0];
  const isCurrentAnswered = Boolean(answers[currentQuestion?.id]?.trim());

  // Parse MCQ options if current is MCQ
  let currentOptions: string[] = [];
  if (currentQuestion?.type === "MCQ" && currentQuestion.options) {
    try {
      currentOptions = JSON.parse(currentQuestion.options);
    } catch {}
  }

  const answeredCount = allQuestions.filter((q) => Boolean(answers[q.id]?.trim())).length;

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-16">
      {/* Top Header with Live Proctored Timer */}
      <div
        className={`p-5 rounded-2xl bg-gradient-to-r ${
          isUrgent ? "from-rose-950 via-slate-900 to-rose-950 border-rose-500 animate-pulse" : "from-slate-900 via-slate-800 to-slate-900 border-slate-700"
        } border shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Proctored Monday Exam Hall
              </span>
              <span className="text-xs text-slate-400">{assessment?.week?.title || "Week 1 Assessment"}</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight mt-0.5">
              {assessment?.title || "SQL Mastery & Analytical Querying Comprehensive Exam"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {autoSavedTime && (
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Save className="w-3 h-3 text-emerald-400" /> Auto-saved {autoSavedTime}
            </span>
          )}

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border font-mono text-sm font-bold ${
              isUrgent ? "border-rose-500 text-rose-400 shadow-glow" : "border-slate-800 text-cyan-300"
            }`}
          >
            <Clock className={`w-4 h-4 ${isUrgent ? "animate-spin text-rose-400" : ""}`} />
            <span>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={handleFinishExam}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-white text-xs font-black shadow-glow transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Grading Exam...
              </span>
            ) : (
              `Submit Exam (${answeredCount}/${allQuestions.length})`
            )}
          </button>
        </div>
      </div>

      {/* Main Layout: Left Question Navigator (1 Col) & Right Active Question (3 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Question Grid Navigator */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Questions ({answeredCount}/{allQuestions.length})
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">
              {Math.round((answeredCount / allQuestions.length) * 100)}% Answered
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-bold text-center">
            <button
              onClick={() => setFilterType("ALL")}
              className={`py-1 rounded ${filterType === "ALL" ? "bg-slate-800 text-white" : "text-slate-400"}`}
            >
              All (15)
            </button>
            <button
              onClick={() => setFilterType("MCQ")}
              className={`py-1 rounded ${filterType === "MCQ" ? "bg-slate-800 text-white" : "text-slate-400"}`}
            >
              MCQ (10)
            </button>
            <button
              onClick={() => setFilterType("CODE")}
              className={`py-1 rounded ${filterType === "CODE" ? "bg-slate-800 text-white" : "text-slate-400"}`}
            >
              SQL (5)
            </button>
          </div>

          {/* Question Grid Pills */}
          <div className="grid grid-cols-5 gap-2">
            {allQuestions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]?.trim());
              const isCurrent = activeQIdx === idx;
              const matchesFilter =
                filterType === "ALL" ||
                (filterType === "MCQ" && q.type === "MCQ") ||
                (filterType === "CODE" && q.type === "CODE");

              if (!matchesFilter) return null;

              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQIdx(idx)}
                  className={`h-9 rounded-lg font-bold text-xs transition-all relative flex items-center justify-center ${
                    isCurrent
                      ? "bg-masai-red text-white shadow-glow border border-masai-red"
                      : isAnswered
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <span>{q.order}</span>
                  {q.type === "CODE" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Answered Question</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-masai-red" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Coding Question (Monaco)</span>
            </div>
          </div>
        </div>

        {/* Right 3 Columns: Active Question Card */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between min-h-[580px]">
          <div className="space-y-4">
            {/* Top Question Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    currentQuestion.type === "CODE"
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {currentQuestion.type === "CODE" ? "Practical SQL Code" : "Conceptual MCQ"}
                </span>
                <span className="text-xs text-slate-400">
                  Question {currentQuestion.order} of {allQuestions.length} ({currentQuestion.weight}% Weight)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveQIdx((prev) => Math.max(0, prev - 1))}
                  disabled={activeQIdx === 0}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveQIdx((prev) => Math.min(allQuestions.length - 1, prev + 1))}
                  disabled={activeQIdx === allQuestions.length - 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt */}
            <h2 className="text-sm font-bold text-slate-100 leading-relaxed whitespace-pre-line">
              {currentQuestion.prompt}
            </h2>

            {/* MCQ Options Rendering */}
            {currentQuestion.type === "MCQ" && (
              <div className="space-y-2.5 pt-2">
                {currentOptions.map((optText, optIdx) => {
                  const isSelected = answers[currentQuestion.id] === optText;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optText }))}
                      className={`w-full text-left p-3.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-rose-500/20 border-rose-500 text-rose-200 shadow-glow"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                            isSelected ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{optText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* CODE Monaco Editor Rendering */}
            {currentQuestion.type === "CODE" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono text-cyan-400">
                    <FileCode className="w-3.5 h-3.5" /> solution_{currentQuestion.order}.sql
                  </span>
                  <span>PostgreSQL / SQLite Sandbox</span>
                </div>
                <div className="h-80 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <Editor
                    height="100%"
                    defaultLanguage="sql"
                    theme="vs-dark"
                    value={answers[currentQuestion.id] || currentQuestion.starterCode || "-- Write query here"}
                    onChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val || "" }))}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "Fira Code, monospace",
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      padding: { top: 10 },
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Status:{" "}
              {isCurrentAnswered ? (
                <span className="text-emerald-400 font-bold">Answered ✓</span>
              ) : (
                <span className="text-slate-500">Unanswered</span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveQIdx((prev) => Math.max(0, prev - 1))}
                disabled={activeQIdx === 0}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30"
              >
                Previous
              </button>

              {activeQIdx < allQuestions.length - 1 ? (
                <button
                  onClick={() => setActiveQIdx((prev) => prev + 1)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleFinishExam}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-xs font-black text-white shadow-glow transition-all"
                >
                  Finish & Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
