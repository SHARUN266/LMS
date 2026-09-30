import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Briefcase,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  GitBranch,
  ExternalLink,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjectsHubPage() {
  const projects = await db.project.findMany({
    include: {
      module: true,
      milestones: { orderBy: { dayNumber: "asc" } },
      submissions: {
        include: { evaluation: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const activeProject = projects[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px] font-mono tracking-wide">
              12 LPA GCC PORTFOLIO ENGINE
            </Badge>
            <span className="text-xs text-muted-foreground">• Production Capstones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Month-End 7-Day Capstone Gatekeepers
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Strict 7-day timeline unlocked at the end of each module. Students must submit a production GitHub repository and pass the AI Recruiter review (≥ 75%) before the next module unlocks.
          </p>
        </div>

        {activeProject && (
          <Link href={`/projects/${activeProject.id}`}>
            <Button size="sm" className="gap-2 font-medium shadow-sm">
              <Briefcase className="w-4 h-4" />
              <span>Resume Active Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* 12 LPA Career Role Alignment Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Analytics Engineer</div>
            <div className="text-[11px] text-muted-foreground">dbt, Snowflake, Data Modeling</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Senior BI Engineer</div>
            <div className="text-[11px] text-muted-foreground">Power BI, Advanced DAX, RLS</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Product Data Analyst</div>
            <div className="text-[11px] text-muted-foreground">Cohorts, A/B Testing, CAC/LTV</div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <span>Active & Upcoming Projects</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-mono">{projects.length} Total</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {projects.map((proj, idx) => {
            const latestSub = proj.submissions?.[0];
            const isCompleted = latestSub && latestSub.evaluation && latestSub.evaluation.overallScore >= 70;
            const isFirst = idx === 0;

            return (
              <Card
                key={proj.id}
                className={`transition-all border hover:border-primary/40 ${
                  isFirst
                    ? "border-primary/30 bg-gradient-to-br from-primary/[0.03] via-card to-card shadow-sm"
                    : "border-border/80 bg-card/60"
                }`}
              >
                <CardHeader className="py-3.5 px-5 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isFirst ? "default" : "outline"}
                      className="text-[10px] py-0 h-4 font-mono uppercase"
                    >
                      {isFirst ? "🔥 Active Project" : `Capstone ${idx + 1}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {proj.durationDays} Days Duration
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    {isCompleted ? (
                      <span className="text-emerald-500 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mastered ({latestSub?.evaluation?.overallScore}/100)
                      </span>
                    ) : (
                      <span className="text-amber-500 flex items-center gap-1 font-mono">
                        <Award className="w-3.5 h-3.5" />
                        Recruiter Evaluation Required
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <h3 className="text-base font-bold text-foreground">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {proj.businessBrief}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-primary" />
                        {proj.milestones.length} Daily Milestones
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-muted-foreground" />
                        GitHub Repository & PR Rubric
                      </span>
                      <span>•</span>
                      <span className="text-primary font-medium">
                        Big 4 / GCC Ready
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Link href={`/projects/${proj.id}`}>
                      <Button
                        variant={isFirst ? "default" : "outline"}
                        size="sm"
                        className="w-full sm:w-auto gap-2"
                      >
                        <span>{isCompleted ? "Review Submission" : "View Milestones"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
