"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen,
  Code2,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Bot,
  Copy,
  Check,
  Zap,
  Loader2,
  X,
  Send,
  Lock,
} from "lucide-react";
import { DailyStepper } from "@/components/DailyStepper";

interface QuickQuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface LessonData {
  id: string;
  dayNumber: number;
  title: string;
  objective: string;
  isCompleted: boolean;
  lesson?: {
    id: string;
    title: string;
    content: string;
    cheatSheet?: string;
    quickQuiz?: string;
  };
  practice?: any[];
  assignments?: any[];
  week?: {
    title: string;
    module?: {
      id: string;
      title: string;
    };
  };
}

export default function LearnDayPage({
  params,
}: {
  params: { moduleId: string; dayId: string };
}) {
  const [dayData, setDayData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // QuickQuiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // AI Mentor state
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [mentorInput, setMentorInput] = useState("");
  const [mentorMessages, setMentorMessages] = useState<
    { sender: string; message: string }[]
  >([
    {
      sender: "mentor",
      message:
        "Namaste! I am your AI Technical Mentor. Ask me anything about today's lesson, query syntax, or architectural best practices!",
    },
  ]);
  const [mentorSending, setMentorSending] = useState(false);

  useEffect(() => {
    async function loadDay() {
      try {
        setLoading(true);
        const res = await fetch(`/api/days/${params.dayId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.day) {
            setDayData(data.day);
          }
        }
      } catch (err) {
        console.error("Failed to load day:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDay();
  }, [params.dayId]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMentor = async () => {
    if (!mentorInput.trim() || mentorSending) return;
    const userMsg = mentorInput.trim();
    setMentorInput("");
    setMentorMessages((prev) => [...prev, { sender: "user", message: userMsg }]);
    setMentorSending(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: `Lesson: ${dayData?.title || params.dayId}. Objective: ${dayData?.objective || ""}`,
        }),
      });
      const data = await res.json();
      if (data.message) {
        setMentorMessages((prev) => [
          ...prev,
          { sender: "mentor", message: data.message },
        ]);
      }
    } catch (e) {
      setMentorMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          message: "Keep practicing! Break your problem down into smaller Common Table Expressions (CTEs).",
        },
      ]);
    } finally {
      setMentorSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Loading lesson curriculum from database...</p>
      </div>
    );
  }

  // Parse quickQuiz JSON
  let quickQuizList: QuickQuizItem[] = [
    {
      question: "If two records tie for 1st place with identical metrics, what rank will DENSE_RANK() assign to the next record?",
      options: [
        "Rank 3 (it leaves a gap for ties)",
        "Rank 2 (it assigns consecutive rankings without gaps)",
        "Rank 1 (it replaces ties with 0)",
      ],
      correctAnswer: "Rank 2 (it assigns consecutive rankings without gaps)",
    },
  ];

  if (dayData?.lesson?.quickQuiz) {
    try {
      const parsed = JSON.parse(dayData.lesson.quickQuiz);
      if (Array.isArray(parsed) && parsed.length > 0) {
        quickQuizList = parsed;
      }
    } catch {}
  }

  const handleVerifyQuiz = () => {
    let allCorrect = true;
    for (let i = 0; i < quickQuizList.length; i++) {
      const item = quickQuizList[i];
      if (quizAnswers[i] !== item.correctAnswer) {
        allCorrect = false;
      }
    }
    setQuizSubmitted(true);
    setQuizPassed(allCorrect);
  };

  const dayNumber = dayData?.dayNumber || 2;
  const practiceUrl = `/practice/${dayData?.id || `day-${dayNumber}`}`;
  const cheatSheetCode = dayData?.lesson?.cheatSheet || "-- Quick syntax cheat sheet";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 relative">
      {/* Daily Progress Stepper */}
      <DailyStepper
        currentStep={1}
        dayNumber={dayNumber}
        dayId={dayData?.id || params.dayId}
        moduleId={params.moduleId}
      />

      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/roadmap" className="hover:text-white transition-colors">
              {dayData?.week?.module?.title || "Module 1 (SQL)"}
            </Link>
            <span>/</span>
            <span className="text-masai-accent font-bold">
              Day {dayNumber} {dayData?.isCompleted ? "(Completed)" : "(Active)"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            {dayData?.title || `Day ${dayNumber}: Analytical Window Functions`}
          </h1>
          {dayData?.objective && (
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{dayData.objective}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMentorOpen(!isMentorOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-medium transition-colors shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Technical Mentor</span>
          </button>

          <Link
            href={practiceUrl}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Start Practice Drills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Theory Card with Markdown Rendering */}
      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
          {dayData?.lesson?.title || "Lesson Notes & Theory"}
        </h2>

        {/* Markdown Content */}
        <div className="prose prose-invert max-w-none text-slate-300 text-xs sm:text-sm space-y-3 leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {dayData?.lesson?.content || "No lesson content available."}
          </ReactMarkdown>
        </div>

        {/* CheatSheet Code Box */}
        {dayData?.lesson?.cheatSheet && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 my-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Code2 className="w-4 h-4" /> Production Syntax & Cheat Sheet
              </span>
              <button
                onClick={() => copyCode(cheatSheetCode)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy SQL"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-slate-900 font-mono text-xs text-cyan-300 overflow-x-auto">
              <code>{cheatSheetCode}</code>
            </pre>
          </div>
        )}

        {/* Micro-Knowledge Check Widget */}
        <div className="p-5 rounded-xl bg-card border border-border mt-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-border">
            <div className="flex items-center gap-2 text-foreground text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-primary" /> Micro-Knowledge Check ({quickQuizList.length} Questions)
            </div>
            <span className="text-[11px] text-slate-400">Validate concepts before practice</span>
          </div>

          {quickQuizList.map((item, qIdx) => (
            <div key={qIdx} className="space-y-2">
              <h3 className="text-xs font-bold text-white">
                {qIdx + 1}. {item.question}
              </h3>

              <div className="space-y-1.5">
                {item.options.map((opt, optIdx) => {
                  const isSelected = quizAnswers[qIdx] === opt;
                  const isCorrect = opt === item.correctAnswer;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: opt }))}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? quizSubmitted && isCorrect
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                            : quizSubmitted && !isCorrect
                            ? "bg-rose-500/20 border-rose-500 text-rose-300"
                            : "bg-masai-red/20 border-masai-red text-white"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
            <button
              onClick={handleVerifyQuiz}
              disabled={Object.keys(quizAnswers).length < quickQuizList.length}
              className="px-4 py-2 rounded-lg bg-masai-red hover:bg-rose-600 disabled:opacity-40 text-white text-xs font-bold transition-colors shadow-glow"
            >
              Verify Understanding
            </button>

            {quizSubmitted && (
              <div className="flex items-center gap-2">
                {quizPassed ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Passed! Ready for hands-on practice.
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 font-bold">
                    Review incorrect answers above to strengthen conceptual clarity.
                  </span>
                )}
                <Link
                  href={practiceUrl}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>Go to Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next Step Transition Card */}
      <div className="p-5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Ready for Hands-on Code?</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Step 2: Interactive Practice Drills Sandbox
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Execute SQL queries against in-memory datasets with instant feedback, schema viewer, and progressive Socratic hints.
          </p>
        </div>
        <Link
          href={practiceUrl}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          <span>Continue to Step 2: Practice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Slide-out Technical Mentor Drawer */}
      {isMentorOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card border-l border-border z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Bot className="w-4 h-4 text-primary" />
              <span>Praxis Technical Mentor</span>
            </div>
            <button
              onClick={() => setIsMentorOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {mentorMessages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs ${
                  m.sender === "user"
                    ? "bg-masai-red/20 text-slate-100 ml-6 border border-masai-red/30"
                    : "bg-slate-900 text-slate-300 mr-6 border border-slate-800"
                }`}
              >
                <span className="text-[10px] font-bold block uppercase mb-1 text-slate-400">
                  {m.sender === "user" ? "You" : "Mentor"}
                </span>
                <p className="whitespace-pre-wrap">{m.message}</p>
              </div>
            ))}
            {mentorSending && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Mentor is analyzing question...</span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={mentorInput}
                onChange={(e) => setMentorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMentor()}
                placeholder="Ask about this SQL lesson..."
                className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSendMentor}
                disabled={mentorSending}
                className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
