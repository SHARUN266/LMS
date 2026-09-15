"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  Circle,
  Calendar,
  FileCode,
  Github,
  Upload,
  ArrowRight,
  ShieldCheck,
  Database,
  Award,
  Loader2,
  Sparkles,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
} from "lucide-react";

interface Milestone {
  id: string;
  dayNumber: number;
  title: string;
  deliverable: string;
  isCompleted: boolean;
}

interface ProjectData {
  id: string;
  title: string;
  businessBrief: string;
  durationDays: number;
  milestones: Milestone[];
  submissions?: {
    id: string;
    createdAt: string;
    githubUrl?: string;
    evaluation?: {
      overallScore: number;
      technicalScore: number;
      businessScore: number;
    };
  }[];
}

export default function CapstoneProjectPage({ params }: { params: { projId: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  const [repoUrl, setRepoUrl] = useState("https://github.com/learner/ecommerce-analytics-lakehouse");
  const [summaryText, setSummaryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingMilestone, setTogglingMilestone] = useState(false);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${params.projId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            setProject(data.project);
            // Set active day to first incomplete milestone or Day 1
            const firstIncomplete = data.project.milestones.find((m: Milestone) => !m.isCompleted);
            if (firstIncomplete) {
              setActiveDay(firstIncomplete.dayNumber);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [params.projId]);

  const handleToggleMilestone = async (m: Milestone) => {
    setTogglingMilestone(true);
    try {
      const res = await fetch(`/api/projects/${project?.id || params.projId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: m.id,
          isCompleted: !m.isCompleted,
        }),
      });
      if (res.ok) {
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            milestones: prev.milestones.map((item) =>
              item.id === m.id ? { ...item, isCompleted: !m.isCompleted } : item
            ),
          };
        });
      }
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
    } finally {
      setTogglingMilestone(false);
    }
  };

  const handleSubmitFinalProject = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${project?.id || params.projId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUrl: repoUrl,
          summaryText:
            summaryText ||
            `Completed all 7-Day capstone deliverables: schema audit, customer cohort CTEs, retention matrix, LTV segmentation, and executive summary mart.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/projects/${project?.id || params.projId}/evaluation`);
      }
    } catch (err) {
      console.error("Failed to submit project:", err);
      router.push(`/projects/${project?.id || params.projId}/evaluation`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-slate-400 font-medium">Loading 7-Day Capstone Project Workspace...</p>
      </div>
    );
  }

  const milestones = project?.milestones || [];
  const completedCount = milestones.filter((m) => m.isCompleted).length;
  const currentMilestone = milestones[activeDay - 1] || milestones[0];
  const latestEvaluation = project?.submissions?.[0]?.evaluation;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-glow flex items-center justify-center">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Module 1 Capstone • 7-Day Sprint
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Deadline: 7 Days from Enrollment
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {project?.title || "E-Commerce Customer Retention & Revenue Analytics Lakehouse"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {project?.businessBrief ||
                "Build a production data mart and executive analytics pipeline tracking CAC, Retention Cohorts, and Lifetime Value (LTV)."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {latestEvaluation ? (
            <Link
              href={`/projects/${project?.id || params.projId}/evaluation`}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-black shadow-glow transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>View Recruiter Scorecard ({latestEvaluation.overallScore}%)</span>
            </Link>
          ) : (
            <Link
              href={`/projects/${project?.id || params.projId}/evaluation`}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <span>Scorecard Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300">Milestones Completed:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {completedCount} of {milestones.length} Days ({Math.round((completedCount / (milestones.length || 1)) * 100)}%)
          </span>
        </div>
        <div className="flex-1 max-w-md bg-slate-950 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500"
            style={{ width: `${(completedCount / (milestones.length || 7)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Left 7-Day Milestones vs Right Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: 7-Day Milestones List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> 7-Day Milestone Progression
          </h2>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveDay(m.dayNumber)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeDay === m.dayNumber
                    ? "bg-indigo-600/20 border-indigo-500 shadow-glow text-white"
                    : m.isCompleted
                    ? "bg-slate-900/60 border-emerald-500/30 text-slate-300"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">Day {m.dayNumber}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMilestone(m);
                    }}
                    className={`text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                      m.isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {m.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </>
                    ) : (
                      "Mark Complete"
                    )}
                  </button>
                </div>
                <h4 className="text-xs font-bold truncate text-slate-200">{m.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Active Day Deliverable & Submission */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Deliverable Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Milestone Day {activeDay} Deliverable
              </span>
              <span className="text-xs text-slate-400">Due: Day {activeDay} End of Day</span>
            </div>

            <h3 className="text-base font-bold text-white">{currentMilestone?.title}</h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentMilestone?.deliverable}. Test your queries on the local SQLite sandbox tables (<code className="text-cyan-400 font-mono">customers</code>, <code className="text-cyan-400 font-mono">orders</code>, <code className="text-cyan-400 font-mono">order_items</code>, <code className="text-cyan-400 font-mono">products</code>) before pushing to your GitHub branch.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-400 text-[11px] block uppercase">Schema Tables Available:</span>
              <p className="font-mono text-slate-300 text-[11px]">
                • <span className="text-cyan-300">customers</span>(id, name, email, city, country, segment, signup_date)<br />
                • <span className="text-cyan-300">orders</span>(id, customer_id, order_date, total_amount, status)<br />
                • <span className="text-cyan-300">order_items</span>(id, order_id, product_id, quantity, unit_price)<br />
                • <span className="text-cyan-300">products</span>(id, name, category, price, cost, stock_quantity)
              </p>
            </div>
          </div>

          {/* Submission Form Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-400" /> Submit Deliverables & Trigger AI Recruiter Evaluation
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Qwen 2.5 Coder Grading</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  GitHub Repository / Branch URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/analytics-lakehouse"
                    className="flex-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Architecture Summary & Business Insights Dossier
                </label>
                <textarea
                  rows={4}
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Summarize the SQL models created, CTE architecture, cohort retention matrices calculated, and key commercial recommendations for executive stakeholders..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Passing score triggers Recruiter Portfolio Dossier & Certificate badge.
                </span>

                <button
                  onClick={handleSubmitFinalProject}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-cyan-500 hover:to-indigo-600 text-white text-xs font-black shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Qwen is Evaluating Portfolio...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Submit Capstone for Recruiter Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
