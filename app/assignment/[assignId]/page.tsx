"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Send,
  Sparkles,
  Bot,
  Clock,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  FileCode,
  Loader2,
  AlertCircle,
  History,
  Award,
} from "lucide-react";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface AssignmentQuestion {
  id: string;
  order: number;
  category: string;
  prompt: string;
  starterCode?: string;
  weight: number;
}

interface AssignmentData {
  id: string;
  title: string;
  type: string;
  description: string;
  deadlineHours: number;
  day?: {
    id: string;
    dayNumber: number;
    title: string;
  };
  questions: AssignmentQuestion[];
  submissions?: {
    id: string;
    createdAt: string;
    submittedCode: string;
    evaluation?: {
      id: string;
      score: number;
      passed: boolean;
    };
  }[];
}

export default function AssignmentPage({ params }: { params: { assignId: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQIdx, setSelectedQIdx] = useState(0);

  // Store code per question
  const [questionCodes, setQuestionCodes] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAssignment() {
      try {
        setLoading(true);
        const res = await fetch(`/api/assignments/${params.assignId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assignment) {
            setAssignment(data.assignment);
            const initialCodes: Record<string, string> = {};
            data.assignment.questions?.forEach((q: AssignmentQuestion) => {
              if (q.starterCode) {
                initialCodes[q.id] = q.starterCode;
              }
            });
            setQuestionCodes(initialCodes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignment();
  }, [params.assignId]);

  const questions = assignment?.questions || [];
  const currentQuestion = questions[selectedQIdx] || questions[0];
  const activeCode = currentQuestion ? questionCodes[currentQuestion.id] || currentQuestion.starterCode || "-- Write solution SQL query here" : "";

  const handleCodeChange = (val: string | undefined) => {
    if (currentQuestion) {
      setQuestionCodes((prev) => ({ ...prev, [currentQuestion.id]: val || "" }));
    }
  };

  const handleSubmit = async () => {
    if (!activeCode.trim()) {
      setErrorMessage("Please enter your SQL code before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment?.id || params.assignId,
          submittedCode: activeCode,
          notes: notes,
        }),
      });

      const data = await res.json();
      if (data.submissionId) {
        router.push(`/evaluation/${data.submissionId}`);
      } else {
        router.push(`/evaluation/latest`);
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      router.push(`/evaluation/latest`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Loading graded assignment requirements...</p>
      </div>
    );
  }

  const dayNum = assignment?.day?.dayNumber || 2;
  const submissions = assignment?.submissions || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Day {dayNum} Graded Evaluation</span>
            <span>•</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Due in {assignment?.deadlineHours || 24}h
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            {assignment?.title || "Daily Graded Assignment"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-white text-xs font-black shadow-glow transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Qwen 2.5 Coder is Evaluating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit for Strict AI Rubric Grading</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Problem Brief & Monaco Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Problem Requirements & Strict Rubric */}
        <div className="space-y-4">
          {/* Question Selector if multiple */}
          {questions.length > 1 && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assignment Problems:</span>
              <div className="flex gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQIdx(idx)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedQIdx === idx
                        ? "bg-masai-red text-white shadow-glow"
                        : "bg-slate-950 text-slate-400 hover:text-white"
                    }`}
                  >
                    Question {idx + 1} ({q.weight}%)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-masai-red flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Assignment Objectives
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {assignment?.description || "Solve the business case using production-standard SQL patterns."}
            </p>

            {currentQuestion?.prompt && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
                <span className="font-bold text-amber-300 block mb-1">
                  Question {selectedQIdx + 1} ({currentQuestion.weight}% Weight):
                </span>
                <p className="leading-relaxed whitespace-pre-line">{currentQuestion.prompt}</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800">
              <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-2">Grading Rubric Breakdown:</h4>
              <div className="space-y-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Correct Output & Math:</span>
                  <span className="font-bold text-slate-200">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Query Logic & CTE structure:</span>
                  <span className="font-bold text-slate-200">20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Edge Cases (NULL handling):</span>
                  <span className="font-bold text-slate-200">15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance & Indexability:</span>
                  <span className="font-bold text-slate-200">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Naming & Style:</span>
                  <span className="font-bold text-slate-200">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Explanation & Notes:</span>
                  <span className="font-bold text-slate-200">5%</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/20 border border-masai-red/30 text-[11px] text-rose-300">
              <span className="font-bold">Masai Standard:</span> Passing score is <strong>70%</strong>. Submissions below 70% automatically trigger remediation drills.
            </div>
          </div>

          {/* Learner Notes Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Architectural Notes / Explanation (5% Weight)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain your approach, choice of window framing, and how edge cases were addressed..."
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-masai-red resize-none"
            />
          </div>

          {/* Past Submissions History */}
          {submissions.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Prior Attempts ({submissions.length})
              </span>
              <div className="space-y-1.5">
                {submissions.map((sub, idx) => (
                  <div
                    key={sub.id}
                    onClick={() => router.push(`/evaluation/${sub.id}`)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between cursor-pointer hover:border-slate-700"
                  >
                    <span className="text-slate-400">Attempt #{submissions.length - idx}</span>
                    {sub.evaluation ? (
                      <span className={`font-bold ${sub.evaluation.passed ? "text-emerald-400" : "text-amber-400"}`}>
                        Score: {sub.evaluation.score}%
                      </span>
                    ) : (
                      <span className="text-slate-500">Evaluated</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Cols: Monaco Editor */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl h-[580px]">
          <div className="h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 font-mono text-masai-red">
              <FileCode className="w-4 h-4" /> solution_{selectedQIdx + 1}.sql (Production Code Submission)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Qwen 2.5 Coder Evaluation Engine</span>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              defaultLanguage="sql"
              theme="vs-dark"
              value={activeCode}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "Fira Code, monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                padding: { top: 14 },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
