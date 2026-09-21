import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  FileCheck2,
  Award,
  BarChart3,
  Flame,
  Clock,
  Zap,
  Target,
  TrendingUp,
  CalendarCheck,
  Briefcase,
  AlertTriangle,
  Sparkles,
  Bot,
  Map,
} from "lucide-react";
import { getWorkflowState } from "@/lib/workflow";
import { MissionHeroCard } from "@/components/dashboard/MissionHeroCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const wf = await getWorkflowState();

  // Dynamic greeting based on time of day
  const hours = new Date().getHours();
  let greetingText = "Good morning";
  if (hours >= 12 && hours < 17) greetingText = "Good afternoon";
  else if (hours >= 17) greetingText = "Good evening";

  const totalStudyHours = Math.round((wf.profile.totalStudyMins / 60) * 10) / 10;
  const progressPct =
    wf.progress.totalDays > 0
      ? Math.round((wf.progress.completedDays / wf.progress.totalDays) * 100)
      : 0;

  // Build contextual quick links based on workflow state
  const dayId = wf.activeDay?.id || `day-${wf.activeDay?.dayNumber || 2}`;
  const moduleSlug = wf.activeModule ? `module-${wf.activeModule.order}` : "module-1";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Compact Greeting */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            {greetingText}, {wf.profile.name}{" "}
            <span className="inline-block animate-bounce text-lg">👋</span>
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Day {wf.progress.currentDayNumber} of {wf.progress.totalDays} •{" "}
            {wf.profile.targetRole}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO: "What should I do right now?" Card    */}
      {/* ═══════════════════════════════════════════ */}
      <MissionHeroCard
        currentPhase={wf.currentPhase}
        stepNumber={wf.stepNumber}
        ctaText={wf.ctaText}
        ctaHref={wf.ctaHref}
        ctaDescription={wf.ctaDescription}
        nextPreview={wf.nextPreview}
        dayNumber={wf.progress.currentDayNumber}
        dayTitle={wf.activeDay?.title || ""}
        currentStreak={wf.profile.currentStreak}
        backlogCount={wf.backlogCount}
        hasBacklog={wf.hasBacklog}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* Quick Navigation Row                         */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href={`/learn/${moduleSlug}/${dayId}`}>
          <div className="group p-3.5 rounded-xl border border-border bg-card hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer card-hover">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Today&apos;s Lesson
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Day {wf.progress.currentDayNumber} Theory
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href={`/practice/${dayId}`}>
          <div className="group p-3.5 rounded-xl border border-border bg-card hover:border-emerald-300 hover:bg-emerald-50/50 transition-all cursor-pointer card-hover">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Practice Sandbox
                </span>
                <span className="text-[10px] text-muted-foreground">
                  SQL Drills
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/assignment">
          <div className="group p-3.5 rounded-xl border border-border bg-card hover:border-amber-300 hover:bg-amber-50/50 transition-all cursor-pointer card-hover">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Assignment
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Graded Submission
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/mentor">
          <div className="group p-3.5 rounded-xl border border-border bg-card hover:border-purple-300 hover:bg-purple-50/50 transition-all cursor-pointer card-hover">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">
                  AI Mentor
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Ask anything
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* Stats + Upcoming Grid                        */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Quick Stats (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Streak */}
          <Card className="bg-card border-border shadow-xs">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
                <Flame className="w-4.5 h-4.5 fill-amber-500" />
              </div>
              <span className="text-xl font-black text-foreground">
                {wf.profile.currentStreak}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Day Streak
              </span>
            </CardContent>
          </Card>

          {/* XP / Level */}
          <Card className="bg-card border-border shadow-xs">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-black text-foreground">
                {wf.profile.xp}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                XP (Lvl {wf.profile.level})
              </span>
            </CardContent>
          </Card>

          {/* Study Hours */}
          <Card className="bg-card border-border shadow-xs">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-black text-foreground">
                {totalStudyHours}h
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Total Study
              </span>
            </CardContent>
          </Card>

          {/* Module Progress */}
          <Card className="bg-card border-border shadow-xs">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
                <Target className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-black text-foreground">
                {progressPct}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Curriculum
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Right: What's Coming Up */}
        <Card className="bg-card border-border shadow-xs">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Coming Up</span>
            </div>

            <div className="space-y-2.5">
              {/* Curriculum Roadmap link */}
              <Link
                href="/roadmap"
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Map className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground block">
                    Curriculum Roadmap
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {wf.progress.completedDays} of {wf.progress.totalDays} days
                    completed
                  </span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              {/* Weekly Assessment */}
              <Link
                href={`/assessment/${wf.assessmentId || "week-1"}`}
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    wf.assessmentAvailable
                      ? "bg-rose-100 text-rose-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground block">
                    Weekly Assessment
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {wf.assessmentAvailable ? (
                      <span className="text-rose-600 font-semibold">
                        Ready to take!
                      </span>
                    ) : (
                      "Complete all days first"
                    )}
                  </span>
                </div>
                {wf.assessmentAvailable && (
                  <Badge className="bg-rose-100 text-rose-600 border-0 text-[10px] py-0 h-4">
                    Ready
                  </Badge>
                )}
              </Link>

              {/* Backlog / Remediation */}
              <Link
                href="/backlog"
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                    wf.hasBacklog
                      ? "bg-amber-100 text-amber-600"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground block">
                    Remedial Backlog
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {wf.hasBacklog
                      ? `${wf.backlogCount} pending item${wf.backlogCount !== 1 ? "s" : ""}`
                      : "All caught up!"}
                  </span>
                </div>
                {wf.hasBacklog && (
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] py-0 h-4">
                    {wf.backlogCount}
                  </Badge>
                )}
              </Link>

              {/* Analytics */}
              <Link
                href="/analytics"
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground block">
                    Analytics & Progress
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Study habits & skill mastery
                  </span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Progress Bar */}
      <Card className="bg-card border-border shadow-xs">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {wf.activeModule?.title || "Module 1: Advanced SQL"}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] py-0 h-4 border-primary/30 text-primary font-mono"
              >
                {wf.progress.moduleProgress}% Complete
              </Badge>
            </div>
            <Link href="/roadmap">
              <span className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View Full Roadmap
                <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, wf.progress.moduleProgress)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
            <span>
              {wf.progress.completedDays} of {wf.progress.totalDays} days
              completed
            </span>
            <span>
              Day {wf.progress.currentDayNumber} active
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
