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
  Youtube,
  ExternalLink,
  Search,
  ListChecks,
  Play,
} from "lucide-react";
import { DailyStepper } from "@/components/DailyStepper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuickQuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface CuratedVideo {
  title: string;
  channel: string;
  duration: string;
  url: string;
}

interface ResourcesData {
  query?: string;
  url?: string;
  videos?: CuratedVideo[];
  checklist?: string[];
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
    videoSearchQuery?: string;
    resources?: string;
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

  // ── QuickQuiz & Dynamic AI Quiz state ─────────────────────
  const [dynamicQuizList, setDynamicQuizList] = useState<QuickQuizItem[] | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({});
  const [prereqWarnings, setPrereqWarnings] = useState<any[]>([]);

  // ── Axiom Inline Mentor state ─────────────────────────────
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [mentorInput, setMentorInput] = useState("");
  const [mentorMessages, setMentorMessages] = useState<
    { sender: string; message: string }[]
  >([
    {
      sender: "mentor",
      message:
        "Hello! I am Axiom, your Staff Analytics Copilot. Ask me anything about today's lesson, query execution plans, or architectural best practices!",
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
          if (data.prerequisiteWarnings) {
            setPrereqWarnings(data.prerequisiteWarnings);
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



  // ── Handle Dynamic AI Quiz Generation ─────────────────────
  const handleGenerateAIQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const res = await fetch("/api/lessons/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: dayData?.id || params.dayId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setDynamicQuizList(data.questions);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setQuizPassed(false);
        }
      }
    } catch (err) {
      console.error("Quiz gen error:", err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // ── Send to Axiom Mentor ──────────────────────────────────
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
          mode: "socratic",
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading lesson curriculum from database...</p>
      </div>
    );
  }

  // Parse default quickQuiz JSON
  let defaultQuizList: QuickQuizItem[] = [
    {
      question: "Which SQL clause partitions rows for analytical window functions?",
      options: ["ORDER BY", "PARTITION BY", "GROUP BY", "WHERE"],
      correctAnswer: "PARTITION BY",
      explanation: "PARTITION BY divides the result set into distinct partitions without collapsing rows like GROUP BY does.",
    },
  ];

  if (dayData?.lesson?.quickQuiz) {
    try {
      const parsed = JSON.parse(dayData.lesson.quickQuiz);
      if (Array.isArray(parsed) && parsed.length > 0) {
        defaultQuizList = parsed;
      }
    } catch {}
  }

  const activeQuizList = dynamicQuizList || defaultQuizList;

  const markTheoryComplete = () => {
    if (dayData?.id) {
      fetch(`/api/days/${dayData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theoryCompleted: true }),
      }).catch(console.error);
    }
  };

  const handleVerifyQuiz = () => {
    let allCorrect = true;
    for (let i = 0; i < activeQuizList.length; i++) {
      const item = activeQuizList[i];
      if (quizAnswers[i] !== item.correctAnswer) {
        allCorrect = false;
      }
    }
    setQuizSubmitted(true);
    setQuizPassed(allCorrect);
    if (allCorrect) {
      markTheoryComplete();
    }
  };

  const dayNumber = dayData?.dayNumber || 2;
  const practiceUrl = `/practice/${dayData?.id || `day-${dayNumber}`}`;
  const cheatSheetCode = dayData?.lesson?.cheatSheet || "-- Quick syntax cheat sheet";

  // Parse Curated YouTube Resources
  let resourcesData: ResourcesData = {};
  if (dayData?.lesson?.resources) {
    try {
      resourcesData = JSON.parse(dayData.lesson.resources);
    } catch {}
  }

  const searchQuery =
    resourcesData.query ||
    dayData?.lesson?.videoSearchQuery ||
    `${dayData?.title || "Data Analytics"} interview tutorial`;

  const searchUrl =
    resourcesData.url ||
    `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

  const videoList =
    resourcesData.videos && resourcesData.videos.length > 0
      ? resourcesData.videos
      : [
          {
            title: `${dayData?.title || "Analytical Masterclass"} Complete Walkthrough`,
            channel: "Ankit Bansal",
            duration: "25 mins",
            url: searchUrl,
          },
          {
            title: "Real-world Analytics Case Studies & Interview Scenarios",
            channel: "Alex The Analyst",
            duration: "20 mins",
            url: searchUrl,
          },
          {
            title: "Production Best Practices & Traps",
            channel: "Maven Analytics",
            duration: "18 mins",
            url: searchUrl,
          },
        ];

  const checklistItems =
    resourcesData.checklist && resourcesData.checklist.length > 0
      ? resourcesData.checklist
      : [
          "Task 1: Watch the curated video tutorial and take structured architectural notes.",
          "Task 2: Code the problem solution step-by-step in the interactive sandbox.",
          "Task 3: Execute edge-case unit tests and submit the daily graded mission.",
        ];

  const currentDisplayedContent = dayData?.lesson?.content || "No lesson content available.";

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
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Link href="/roadmap" className="hover:text-foreground transition-colors">
              {dayData?.week?.module?.title || "Module 1 (SQL)"}
            </Link>
            <span>/</span>
            <span className="text-primary font-bold">
              Day {dayNumber} {dayData?.isCompleted ? "(Completed)" : "(Active)"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">
            {dayData?.title || `Day ${dayNumber}: Analytical Window Functions`}
          </h1>
          {dayData?.objective && (
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{dayData.objective}</p>
          )}

          {(dayData as any)?.skills && (dayData as any).skills.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Target Skills:</span>
              {(dayData as any).skills.map((sk: any) => (
                <Badge
                  key={sk.id}
                  variant="secondary"
                  className="text-[10px] py-0.5 px-2 font-medium bg-muted text-foreground border border-border"
                >
                  ⚡ {sk.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMentorOpen(!isMentorOpen)}
            className="gap-2 text-xs border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Axiom Copilot</span>
          </Button>

          <Link href={practiceUrl}>
            <Button size="sm" className="gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
              <span>Start Practice Drills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 🧠 Knowledge Graph Prerequisite Advisory */}
      {prereqWarnings.length > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 flex items-start gap-3 text-xs shadow-2xs">
          <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              Knowledge Graph Advisory:
            </span>{" "}
            <span className="text-amber-800 dark:text-amber-300">
              This lesson builds upon foundational skills:{" "}
              <strong>{prereqWarnings.map((w: any) => w.name).join(", ")}</strong>. Review these concepts if you encounter blockers with today&apos;s drills.
            </span>
          </div>
        </div>
      )}



      {/* 📺 Today's Curated Video Masterclass & YouTube Study Guide */}
      <Card className="border border-red-200/90 dark:border-red-900/60 bg-card shadow-xs overflow-hidden rounded-xl">
        <div className="bg-red-50/60 dark:bg-red-950/20 px-6 py-4 border-b border-red-100 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-foreground tracking-tight">
                  📺 Today&apos;s Curated Video Masterclass & YouTube Study Guide
                </h2>
                <Badge variant="outline" className="text-[10px] bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 font-bold">
                  12 LPA Industry Curated
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exact YouTube queries, educator masterclasses, and 3-step execution plan for Day {dayNumber}
              </p>
            </div>
          </div>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search YouTube</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Exact YouTube Search Query Box */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-red-500" /> Exact YouTube Search Query
              </div>
              <div className="font-mono text-xs font-semibold text-foreground bg-card px-3 py-1.5 rounded border border-border inline-block shadow-2xs">
                {searchQuery}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCode(searchQuery)}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                <span>{copied ? "Copied!" : "Copy Query"}</span>
              </button>
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Curated Top Videos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Top Educator Recommendations (Pick 1-2 to watch)
              </h3>
              <span className="text-[11px] text-muted-foreground">Curated for 12 LPA technical interviews</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {videoList.map((vid, vIdx) => (
                <a
                  key={vIdx}
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3.5 rounded-xl border border-border bg-card hover:border-red-300 hover:shadow-xs transition-all relative"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] font-bold text-red-600 border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30">
                      {vid.channel}
                    </Badge>
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {vid.duration}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground group-hover:text-red-600 transition-colors line-clamp-2 mb-2">
                    {vid.title}
                  </h4>
                  <div className="flex items-center text-[11px] font-semibold text-red-600 gap-1 mt-auto">
                    <span>Watch Tutorial</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 3-Step Daily Practical Checklist */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-indigo-600" /> 3-Step Practical Execution Checklist
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                {Object.values(checkedTasks).filter(Boolean).length} of {checklistItems.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {checklistItems.map((task, tIdx) => {
                const isChecked = !!checkedTasks[tIdx];
                return (
                  <label
                    key={tIdx}
                    onClick={() => setCheckedTasks((prev) => ({ ...prev, [tIdx]: !prev[tIdx] }))}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${
                      isChecked
                        ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-foreground"
                        : "bg-card border-border text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={isChecked ? "line-through text-muted-foreground" : "font-medium"}>
                      {task}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── MAIN THEORY CARD ─────────────── */}
      <Card className="shadow-xs border-border">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {dayData?.lesson?.title || "Lesson Notes & Theory"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Core conceptual deep-dive & industry application notes
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMentorOpen(true)}
              className="gap-1.5 text-xs self-start sm:self-auto h-7"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ask Axiom about this section</span>
            </Button>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-sm space-y-3 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentDisplayedContent}
            </ReactMarkdown>
          </div>

          {/* CheatSheet Code Box */}
          {dayData?.lesson?.cheatSheet && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 my-4 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5 text-indigo-400">
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

          {/* ── MICRO-KNOWLEDGE CHECK WIDGET (DYNAMIC AI READY) ───── */}
          <div className="p-5 rounded-xl bg-muted/30 border border-border mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-border gap-2">
              <div className="flex items-center gap-2 text-foreground text-xs font-semibold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-primary" /> Micro-Knowledge Check ({activeQuizList.length} Questions)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAIQuiz}
                  disabled={generatingQuiz}
                  className="h-7 text-[11px] gap-1 px-2.5 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  {generatingQuiz ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>{generatingQuiz ? "Synthesizing Quiz..." : "✨ Generate AI Quiz"}</span>
                </Button>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Validate concepts before practice
                </span>
              </div>
            </div>

            {activeQuizList.map((item, qIdx) => (
              <div key={qIdx} className="space-y-2">
                <h3 className="text-xs font-bold text-foreground">
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
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                              : quizSubmitted && !isCorrect
                              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300"
                              : "bg-primary/10 border-primary text-foreground"
                            : "bg-card border-border text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on submit */}
                {quizSubmitted && item.explanation && (
                  <div className="p-2 rounded-md bg-muted/50 text-[11px] text-muted-foreground border border-border/80">
                    💡 <span className="font-semibold text-foreground">Why:</span> {item.explanation}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border">
              <Button
                onClick={handleVerifyQuiz}
                disabled={Object.keys(quizAnswers).length < activeQuizList.length}
                size="sm"
                className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Verify Understanding
              </Button>

              {quizSubmitted && (
                <div className="flex items-center gap-2">
                  {quizPassed ? (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Passed! Ready for hands-on practice.
                    </span>
                  ) : (
                    <span className="text-xs text-rose-600 font-bold flex items-center gap-1.5">
                      Review incorrect items and try again!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SLIDE-OVER AXIOM MENTOR DRAWER ──────────────────────── */}
      {isMentorOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground">Axiom Copilot</h3>
                <p className="text-[10px] text-muted-foreground">Active Context: Day {dayNumber} Theory</p>
              </div>
            </div>
            <button
              onClick={() => setIsMentorOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {mentorMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 text-xs ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                      : "bg-muted text-foreground rounded-tl-none border border-border"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.message}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {mentorSending && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Axiom is typing...</span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={mentorInput}
              onChange={(e) => setMentorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMentor()}
              placeholder="Ask about this lesson..."
              className="flex-1 text-xs bg-muted/50 border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button
              size="sm"
              onClick={handleSendMentor}
              disabled={mentorSending || !mentorInput.trim()}
              className="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
