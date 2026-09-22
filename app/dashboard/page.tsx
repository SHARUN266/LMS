import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { getAnalyticsData } from "@/lib/analytics";
import { getTodayPOTD, hasSolvedTodayPOTD } from "@/lib/potd";
import { MissionHeroCard } from "@/components/dashboard/MissionHeroCard";
import { DashboardAnalyticsSection } from "@/components/dashboard/DashboardAnalyticsSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [wf, analytics, potd] = await Promise.all([
    getWorkflowState(),
    getAnalyticsData(),
    getTodayPOTD(),
  ]);

  const hasSolvedPOTD = await hasSolvedTodayPOTD(potd.dateKey);

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

  const todayActivity = analytics.weeklyActivity[analytics.weeklyActivity.length - 1];
  const todayHours = todayActivity ? todayActivity.hours : 0;
  const dailyGoal = wf.profile.dailyStudyGoal || 6;
  const todayGoalPct = Math.min(100, Math.round((todayHours / dailyGoal) * 100));
  const daysHittingTarget = analytics.weeklyActivity.filter((d) => d.hours >= dailyGoal).length;
  const weeklyPct = Math.round((daysHittingTarget / Math.max(1, analytics.weeklyActivity.length)) * 100);
  const nextLevelXp = wf.profile.level * 500;
  const xpLeft = Math.max(0, nextLevelXp - wf.profile.xp);
  const xpPct = Math.min(100, Math.round((wf.profile.xp / Math.max(1, nextLevelXp)) * 100));

  // Build contextual quick links based on workflow state
  const dayId = wf.activeDay?.id || `day-${wf.activeDay?.dayNumber || 1}`;
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

      {/* ═════════════════════════════════════════════════════ */}
      {/* MASAI DUAL-TRACK: Daily Foundation Track (POTD)      */}
      {/* ═════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
        {/* Soft background watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-rose-500 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-black bg-masai-red text-white flex items-center gap-1 shadow-2xs">
                <Flame className="w-3 h-3 fill-current" /> Dual-Track Foundation
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-indigo-200 border border-white/10">
                {potd.company}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {potd.difficulty}
              </span>
              {hasSolvedPOTD ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 flex items-center gap-1">
                  ✓ Solved Today
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Daily Muscle-Memory
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold text-white tracking-tight">
              Problem of the Day: {potd.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Masai dual-track system keeps your problem-solving sharp with a daily standalone interview challenge running side-by-side with your curriculum module.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Reward</span>
              <span className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end">
                <Zap className="w-3.5 h-3.5 fill-amber-400" /> +50 XP
              </span>
            </div>

            <Link
              href="/daily-challenge"
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                hasSolvedPOTD
                  ? "bg-white/15 hover:bg-white/20 text-white border border-white/20"
                  : "bg-masai-red hover:bg-masai-red/90 text-white"
              }`}
            >
              <span>{hasSolvedPOTD ? "Review Today's POTD" : "Solve Today's POTD →"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* Quick Navigation Row                         */}
      {/* ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href={`/learn/${moduleSlug}/${dayId}`}>
          <div className="group relative overflow-hidden p-3.5 rounded-xl border border-border/80 bg-white hover:border-indigo-400/80 hover:shadow-md transition-all duration-300 cursor-pointer card-hover">
            {/* Soft photographic watermark fade */}
            <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none overflow-hidden opacity-25 group-hover:opacity-40 transition-opacity">
              <Image
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80"
                alt=""
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-2xs flex-shrink-0">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-foreground block truncate">
                  Today&apos;s Lesson
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  Day {wf.progress.currentDayNumber} Theory
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href={`/practice/${dayId}`}>
          <div className="group relative overflow-hidden p-3.5 rounded-xl border border-border/80 bg-white hover:border-emerald-400/80 hover:shadow-md transition-all duration-300 cursor-pointer card-hover">
            {/* Soft photographic watermark fade */}
            <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none overflow-hidden opacity-25 group-hover:opacity-40 transition-opacity">
              <Image
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80"
                alt=""
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs flex-shrink-0">
                <Code2 className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-foreground block truncate">
                  SQL Sandbox
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  Day {wf.progress.currentDayNumber} Drills
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href={`/assignment/${dayId}`}>
          <div className="group relative overflow-hidden p-3.5 rounded-xl border border-border/80 bg-white hover:border-amber-400/80 hover:shadow-md transition-all duration-300 cursor-pointer card-hover">
            {/* Soft photographic watermark fade */}
            <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none overflow-hidden opacity-25 group-hover:opacity-40 transition-opacity">
              <Image
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"
                alt=""
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs flex-shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-foreground block truncate">
                  24h Assignment
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  AI-Graded Mission
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/mentor">
          <div className="group relative overflow-hidden p-3.5 rounded-xl border border-border/80 bg-white hover:border-purple-400/80 hover:shadow-md transition-all duration-300 cursor-pointer card-hover">
            {/* Soft photographic watermark fade */}
            <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none overflow-hidden opacity-25 group-hover:opacity-40 transition-opacity">
              <Image
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80"
                alt=""
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-2xs flex-shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-extrabold text-foreground block truncate">
                  AI Mentor
                </span>
                <span className="text-[10px] text-muted-foreground font-medium block">
                  Ask anything 24/7
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
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Streak */}
          <Card className="bg-white border-border/80 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shadow-2xs">
                  <Flame className="w-4.5 h-4.5 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-mono">
                  {wf.profile.currentStreak > 0 ? "Active" : "Ready"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-foreground font-mono block tracking-tight">
                  {wf.profile.currentStreak}
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  Day Streak
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <span>7-Day Habit</span>
                <span className="text-amber-600 font-bold font-mono">
                  {wf.profile.currentStreak > 0 ? `${wf.profile.currentStreak}d on track` : "Start today"}
                </span>
              </div>
              {/* Mini 7-day dot indicator based on real activity */}
              <div className="flex items-center justify-between gap-1">
                {analytics.weeklyActivity.map((act, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[9px] text-slate-400 font-bold">{act.day.slice(0, 1)}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        act.hours > 0 ? "bg-amber-500 shadow-xs shadow-amber-500/50" : "bg-slate-200"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Card 2: XP / Level */}
          <Card className="bg-white border-border/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                  Lvl {wf.profile.level}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-foreground font-mono block tracking-tight">
                  {wf.profile.xp.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  Earned XP
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <span>Next: Level {wf.profile.level + 1}</span>
                <span className="font-mono font-bold text-indigo-600">{xpLeft} XP left</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(wf.profile.xp > 0 ? 4 : 0, xpPct)}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block pt-0.5">
                {wf.profile.xp > 0 ? `⚡ ${wf.profile.xp} XP total` : "⚡ Complete Day 1 to earn XP"}
              </span>
            </div>
          </Card>

          {/* Card 3: Total Study */}
          <Card className="bg-white border-border/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shadow-2xs">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
                  {dailyGoal}h Goal
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-foreground font-mono block tracking-tight">
                  {totalStudyHours}h
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  Total Study
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <span>Today&apos;s Focus</span>
                <span className="font-mono font-bold text-emerald-600">{todayHours}h / {dailyGoal}.0h</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${todayGoalPct}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-600 font-bold block pt-0.5">
                ⏱️ {weeklyPct}% weekly consistency
              </span>
            </div>
          </Card>

          {/* Card 4: Curriculum Progress */}
          <Card className="bg-white border-border/80 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/60 text-purple-600 flex items-center justify-center shadow-2xs">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 font-mono">
                  Module 1
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl font-black text-foreground font-mono block tracking-tight">
                  {progressPct}%
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  Curriculum
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                <span>Milestone</span>
                <span className="font-mono font-bold text-purple-600">
                  {wf.progress.completedDays} / {wf.progress.totalDays} Days
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(4, progressPct)}%` }}
                />
              </div>
              <span className="text-[10px] text-purple-600 font-bold block pt-0.5">
                🎯 {wf.progress.totalDays - wf.progress.completedDays} days to completion
              </span>
            </div>
          </Card>
        </div>

        {/* Right: What's Coming Up */}
        <Card className="bg-white border-border/80 shadow-xs flex flex-col justify-between p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Upcoming Milestones</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Pipeline
            </span>
          </div>

          <div className="space-y-2 pt-3">
            {/* Curriculum Roadmap link */}
            <Link
              href="/roadmap"
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <Map className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground block">
                    Curriculum Roadmap
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  {wf.progress.completedDays} of {wf.progress.totalDays} days completed
                </span>
              </div>
            </Link>

            {/* Weekly Assessment */}
            <Link
              href={`/assessment/${wf.assessmentId || "week-1"}`}
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-rose-50/40 hover:border-rose-200 transition-all group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs ${
                  wf.assessmentAvailable
                    ? "bg-rose-100 text-rose-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground block">
                    Weekly Assessment
                  </span>
                  {wf.assessmentAvailable ? (
                    <Badge className="bg-rose-500 text-white border-0 text-[9px] py-0 h-4 font-mono font-bold">
                      Ready
                    </Badge>
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-rose-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  {wf.assessmentAvailable ? (
                    <span className="text-rose-600 font-semibold">Ready to take now!</span>
                  ) : (
                    "Complete all days in week"
                  )}
                </span>
              </div>
            </Link>

            {/* Backlog / Remediation */}
            <Link
              href="/backlog"
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-amber-50/40 hover:border-amber-200 transition-all group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs ${
                  wf.hasBacklog
                    ? "bg-amber-100 text-amber-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground block">
                    Remedial Backlog
                  </span>
                  {wf.hasBacklog && (
                    <Badge className="bg-amber-500 text-white border-0 text-[9px] py-0 h-4 font-mono font-bold">
                      {wf.backlogCount} Pending
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  {wf.hasBacklog
                    ? `${wf.backlogCount} item${wf.backlogCount !== 1 ? "s" : ""} to clear`
                    : "Zero backlog items"}
                </span>
              </div>
            </Link>

            {/* Analytics */}
            <Link
              href="#analytics"
              className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground block">
                    Telemetry & Analytics
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-[10px] text-muted-foreground block">
                  Study habits & concept radar
                </span>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Module Progress Bar */}
      <Card className="relative overflow-hidden bg-white border-border/80 shadow-xs">
        {/* Soft active module photo watermark on right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none overflow-hidden opacity-20 hidden sm:block">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
            alt=""
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>
        <CardContent className="p-4 relative z-10">
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

      {/* Embedded Live Learning Analytics Section */}
      <DashboardAnalyticsSection analytics={analytics} />
    </div>
  );
}
