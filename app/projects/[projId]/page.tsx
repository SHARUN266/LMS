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

  const [repoUrl, setRepoUrl] = useState("");
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-muted-foreground font-medium">Loading 7-Day Capstone Project Workspace...</p>
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
      <div className="p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                Module 1 Capstone • 7-Day Sprint
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Deadline: 7 Days from Enrollment
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {project?.title || "E-Commerce Customer Retention & Revenue Analytics Lakehouse"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {project?.businessBrief ||
                "Build a production data mart and executive analytics pipeline tracking CAC, Retention Cohorts, and Lifetime Value (LTV)."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {latestEvaluation ? (
            <Link
              href={`/projects/${project?.id || params.projId}/evaluation`}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>View Recruiter Scorecard ({latestEvaluation.overallScore}%)</span>
            </Link>
          ) : (
            <Link
              href={`/projects/${project?.id || params.projId}/evaluation`}
              className="px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-bold transition-all border border-border flex items-center gap-1.5"
            >
              <span>Scorecard Preview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-foreground">Milestones Completed:</span>
          <span className="text-xs font-mono font-bold text-emerald-600">
            {completedCount} of {milestones.length} Days ({Math.round((completedCount / (milestones.length || 1)) * 100)}%)
          </span>
        </div>
        <div className="flex-1 max-w-md bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / (milestones.length || 7)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Left 7-Day Milestones vs Right Active Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: 7-Day Milestones List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" /> 7-Day Milestone Progression
          </h2>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => setActiveDay(m.dayNumber)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeDay === m.dayNumber
                    ? "bg-indigo-50/80 border-indigo-600 text-foreground ring-1 ring-indigo-600 shadow-xs"
                    : m.isCompleted
                    ? "bg-emerald-50/40 border-emerald-200 text-foreground"
                    : "bg-card border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-foreground">Day {m.dayNumber}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMilestone(m);
                    }}
                    className={`text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                      m.isCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                      </>
                    ) : (
                      "Mark Complete"
                    )}
                  </button>
                </div>
                <h4 className="text-xs font-bold truncate text-foreground">{m.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Active Day Deliverable & Submission */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active Deliverable Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Milestone Day {activeDay} Deliverable
              </span>
              <span className="text-xs text-muted-foreground">Due: Day {activeDay} End of Day</span>
            </div>

            <h3 className="text-base font-bold text-foreground">{currentMilestone?.title}</h3>

            <p className="text-xs text-slate-700 leading-relaxed">
              {currentMilestone?.deliverable}. Test your queries on the local SQLite sandbox tables (<code className="text-indigo-600 font-mono bg-indigo-50 px-1 rounded">customers</code>, <code className="text-indigo-600 font-mono bg-indigo-50 px-1 rounded">orders</code>, <code className="text-indigo-600 font-mono bg-indigo-50 px-1 rounded">order_items</code>, <code className="text-indigo-600 font-mono bg-indigo-50 px-1 rounded">products</code>) before pushing to your GitHub branch.
            </p>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
              <span className="font-bold text-muted-foreground text-[11px] block uppercase">Schema Tables Available:</span>
              <p className="font-mono text-slate-700 text-[11px] space-y-0.5">
                • <span className="text-indigo-600 font-semibold">customers</span>(id, name, email, city, country, segment, signup_date)<br />
                • <span className="text-indigo-600 font-semibold">orders</span>(id, customer_id, order_date, total_amount, status)<br />
                • <span className="text-indigo-600 font-semibold">order_items</span>(id, order_id, product_id, quantity, unit_price)<br />
                • <span className="text-indigo-600 font-semibold">products</span>(id, name, category, price, cost, stock_quantity)
              </p>
            </div>
          </div>

          {/* Submission Form Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" /> Submit Deliverables & Trigger AI Recruiter Evaluation
              </h3>
              <span className="text-[11px] text-muted-foreground font-mono">Automated Evaluation Engine</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  GitHub Repository / Branch URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-lg bg-muted border border-border text-muted-foreground">
                    <Github className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/analytics-lakehouse"
                    className="flex-1 p-2.5 rounded-lg bg-muted/30 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Architecture Summary & Business Insights Dossier
                </label>
                <textarea
                  rows={4}
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  placeholder="Summarize the SQL models created, CTE architecture, cohort retention matrices calculated, and key commercial recommendations for executive stakeholders..."
                  className="w-full p-2.5 rounded-lg bg-muted/30 border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Passing score triggers Recruiter Portfolio Dossier & Certificate badge.
                </span>

                <button
                  onClick={handleSubmitFinalProject}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Portfolio...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Submit Capstone for Evaluation</span>
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
