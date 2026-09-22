"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  Target,
  Flame,
  Award,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnalyticsData } from "@/lib/analytics";

interface DashboardAnalyticsSectionProps {
  analytics: AnalyticsData;
}

export function DashboardAnalyticsSection({ analytics }: DashboardAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState<"habits" | "skills">("habits");

  const { profile, days, assignments, assessment, capstone, weeklyActivity } = analytics;
  const totalStudyHours = Math.round((profile.totalStudyMins / 60) * 10) / 10;
  const dailyGoal = profile.dailyStudyGoal || 6;

  const skillEntries = Object.entries(assessment.skillRadar);

  // Calculate weekly consistency
  const daysHittingTarget = weeklyActivity.filter((d) => d.hours >= dailyGoal).length;
  const consistencyPct = Math.round((daysHittingTarget / weeklyActivity.length) * 100);

  return (
    <section id="analytics" className="space-y-4 pt-2 scroll-mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
            <TrendingUp className="w-4 h-4" />
            <span>Telemetry & Performance Intelligence</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Learning Velocity & Concept Mastery
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time telemetry measuring your daily study discipline, focus hours, and AI-graded concept proficiency.
          </p>
        </div>

        {/* Quick summary metrics */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-2xs flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <div>
              <span className="text-[10px] text-muted-foreground block font-semibold leading-none">Streak</span>
              <span className="text-xs font-extrabold text-amber-600 font-mono leading-none">
                {profile.currentStreak} Days
              </span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border shadow-2xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-muted-foreground block font-semibold leading-none">Study Hours</span>
              <span className="text-xs font-extrabold text-emerald-600 font-mono leading-none">
                {totalStudyHours}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Weekly Study Commitment Bar Chart */}
        <Card className="bg-card border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Daily Study Commitment
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                Target: {dailyGoal}h / day • {consistencyPct}% consistency
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono font-bold text-indigo-600 border-indigo-200 bg-indigo-50/50">
              Last 7 Days
            </Badge>
          </CardHeader>

          <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
            {/* Bars Visualization */}
            <div className="flex items-end justify-between h-40 pt-4 border-b border-border/60 pb-2.5">
              {weeklyActivity.map((h, idx) => {
                const maxBarHours = 8;
                const heightPercent = Math.min(100, Math.round((h.hours / maxBarHours) * 100));
                const hitsTarget = h.hours >= dailyGoal;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground transition-transform group-hover:scale-110">
                      {h.hours}h
                    </span>
                    <div className="w-7 sm:w-8 bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-28 relative">
                      {/* Target dashed marker */}
                      <div
                        className="absolute left-0 right-0 border-b border-dashed border-slate-400/40 z-10 pointer-events-none"
                        style={{ bottom: `${(dailyGoal / maxBarHours) * 100}%` }}
                      />
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          hitsTarget
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm"
                            : "bg-gradient-to-t from-amber-600 to-amber-400 shadow-sm"
                        } group-hover:brightness-110`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        h.day.includes("Today") ? "text-indigo-600 font-extrabold" : "text-slate-600"
                      }`}
                    >
                      {h.day.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Target Legend */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                  Goal Met (&gt;={dailyGoal}h)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                  Under Target
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold text-slate-700">
                {daysHittingTarget > 0 ? `${daysHittingTarget} of 7 days on pace` : "0 of 7 days (Start timer to log)"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right: Concept Mastery Skill Radar */}
        <Card className="bg-card border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Granular Concept Mastery
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                Evaluated across SQL drills, quizzes & assignments
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Live Telemetry
            </span>
          </CardHeader>

          <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {skillEntries.map(([skill, scoreVal], idx) => {
                const score = Number(scoreVal) || 0;
                const isUnassessed = score === 0;
                const isHigh = score >= 85;
                const isMedium = score >= 70;

                const barColor = isUnassessed
                  ? "bg-slate-200 dark:bg-slate-700"
                  : isHigh
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : isMedium
                  ? "bg-gradient-to-r from-indigo-500 to-blue-400"
                  : "bg-gradient-to-r from-amber-500 to-orange-400";

                const badgeClass = isUnassessed
                  ? "text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  : isHigh
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : isMedium
                  ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                  : "text-amber-700 bg-amber-50 border-amber-200";

                const badgeText = isUnassessed
                  ? "Unassessed"
                  : score >= 85
                  ? "Proficient"
                  : score >= 70
                  ? "Competent"
                  : "Needs Review";

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground truncate max-w-[210px] sm:max-w-[260px]">
                        {skill}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${badgeClass}`}>
                          {badgeText}
                        </span>
                        <span className="font-mono font-extrabold text-foreground w-9 text-right">
                          {score}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${Math.max(score, isUnassessed ? 0 : 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Updated automatically after AI code reviews</span>
              <Link
                href="/evaluation"
                className="text-indigo-600 hover:underline font-semibold flex items-center gap-0.5"
              >
                View scorecard <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold">Avg Assignment</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {assignments.evaluatedCount > 0 ? `${assignments.avgScore}%` : "0%"}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {assignments.evaluatedCount} submissions graded
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold">Curriculum Days</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <span className="text-xl font-black text-indigo-600 mt-1 block">
            {days.completed} / {days.total}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {days.completed > 0 ? `Avg Score: ${days.avgScore}%` : "Not started"}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold">Capstone Milestones</span>
            <Zap className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <span className="text-xl font-black text-purple-600 mt-1 block">
            {capstone.milestonesCompleted} / {capstone.milestonesTotal}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">Production lakehouse</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold">Weekly Goal Adherence</span>
            <Target className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-xl font-black text-amber-600 mt-1 block">
            {consistencyPct}%
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            {daysHittingTarget} of 7 days above goal
          </span>
        </div>
      </div>
    </section>
  );
}
