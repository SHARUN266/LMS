import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = (await db.userProfile.findFirst()) || {
    id: "user_default",
    name: "Learner",
    targetRole: "BI / Analytics Engineer",
    dailyStudyGoal: 6,
    currentStreak: 12,
    longestStreak: 15,
    totalStudyMins: 2840,
    activeModuleId: null as string | null,
    activeDayId: null as string | null,
    xp: 1450,
    level: 3,
  };

  let activeDay = null;
  if (profile.activeDayId) {
    activeDay = await db.day.findUnique({
      where: { id: profile.activeDayId },
      include: {
        lesson: true,
        practice: true,
        assignments: true,
      },
    });
  }

  if (!activeDay) {
    activeDay = await db.day.findFirst({
      where: { isCompleted: false, isUnlocked: true },
      orderBy: { dayNumber: "asc" },
      include: {
        lesson: true,
        practice: true,
        assignments: true,
      },
    });
  }

  if (!activeDay) {
    activeDay = await db.day.findFirst({
      where: { dayNumber: 2 },
      include: {
        lesson: true,
        practice: true,
        assignments: true,
      },
    });
  }

  const backlogItems = await db.backlogItem.findMany({
    where: { isCompleted: false },
  });

  const studyHours = Math.floor(profile.totalStudyMins / 60);
  const studyMins = profile.totalStudyMins % 60;

  const dayNumber = activeDay?.dayNumber || 2;
  const learnHref = activeDay ? `/learn/module-1/${activeDay.id}` : "/learn";
  const practiceHref = activeDay ? `/practice/${activeDay.id}` : "/practice";
  const assignmentHref = activeDay?.assignments?.[0]
    ? `/assignment/${activeDay.assignments[0].id}`
    : `/assignment/daily-${dayNumber}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Day {dayNumber} of 120
            </h1>
            <Badge variant="outline" className="text-[11px] font-normal border-primary/30 text-primary">
              Cohort Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Focus: <span className="text-foreground/90 font-medium">{activeDay?.title || "Analytical Window Functions & Running Totals"}</span>
          </p>
        </div>
        <Link href={practiceHref}>
          <Button size="sm" className="gap-2 font-medium shadow-sm">
            Resume Practice (Step 2)
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Stats Strip — ShadCN Card */}
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center divide-x divide-border text-center">
            {/* Streak */}
            <div className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2">
              <Flame className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-foreground">{profile.currentStreak}</span>
                <span className="text-muted-foreground ml-1 hidden sm:inline">day streak</span>
              </div>
            </div>

            {/* Time Studied */}
            <div className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2">
              <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-foreground">{studyHours}h {studyMins}m</span>
                <span className="text-muted-foreground ml-1 hidden sm:inline">studied</span>
              </div>
            </div>

            {/* Module Progress */}
            <div className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2">
              <BookOpen className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-foreground">33%</span>
                <span className="text-muted-foreground ml-1 hidden sm:inline">Module 1</span>
              </div>
            </div>

            {/* Exam Countdown */}
            <div className="flex-1 flex items-center justify-center gap-2 py-1.5 px-2">
              <Calendar className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-foreground">4 days</span>
                <span className="text-muted-foreground ml-1 hidden sm:inline">to exam</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Tasks Card — Primary Focus */}
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardHeader className="py-3 px-5 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-semibold">Today's Curriculum Tasks</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Mandatory daily roadmap checkpoint</p>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            1 of 4 Completed
          </Badge>
        </CardHeader>

        <div className="divide-y divide-border">
          {/* Task 1: Theory — Completed */}
          <Link
            href={learnHref}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 flex-shrink-0" />
              <span className="text-xs font-medium text-muted-foreground line-through decoration-muted-foreground/50">
                Step 1: Theory — Window Functions, Partitions & Framing
              </span>
            </div>
            <Badge variant="success" className="text-[10px] font-medium">
              Completed
            </Badge>
          </Link>

          {/* Task 2: Practice — Active */}
          <Link
            href={practiceHref}
            className="flex items-center justify-between px-5 py-3.5 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-[18px] h-[18px] rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Step 2: Hands-on Practice Sandbox (Active)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="text-[10px] font-medium">
                In Progress
              </Badge>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          {/* Task 3: Assignment — Locked / Upcoming */}
          <Link
            href={assignmentHref}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Circle className="w-[18px] h-[18px] text-muted-foreground/60 flex-shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">
                Step 3: Graded Assignment — Industry Exam
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Due Today</span>
          </Link>

          {/* Task 4: AI Review — Evaluation */}
          <Link
            href="/evaluation"
            className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Circle className="w-[18px] h-[18px] text-muted-foreground/40 flex-shrink-0" />
              <span className="text-xs font-medium text-muted-foreground/60">
                Step 4: AI Scorecard & Remediation
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
              Evaluation
            </Badge>
          </Link>
        </div>
      </Card>

      {/* Backlog Alert — ShadCN Card */}
      {backlogItems.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.05] transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">
                  <span className="font-bold text-amber-400">{backlogItems.length}</span> backlog item{backlogItems.length !== 1 ? "s" : ""} pending review
                </p>
                <p className="text-[11px] text-muted-foreground">Resolve backlog tasks to protect your attendance streak</p>
              </div>
            </div>
            <Link href="/backlog">
              <Button variant="outline" size="sm" className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                View Backlog
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
