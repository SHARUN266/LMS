"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Code2,
  FileCheck2,
  Award,
  ArrowRight,
  CalendarCheck,
  Briefcase,
  Sparkles,
  Clock,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WorkflowPhase } from "@/lib/workflow";

interface MissionHeroCardProps {
  currentPhase: WorkflowPhase;
  stepNumber: 0 | 1 | 2 | 3 | 4;
  ctaText: string;
  ctaHref: string;
  ctaDescription: string;
  nextPreview: string;
  dayNumber: number;
  dayTitle: string;
  currentStreak: number;
  backlogCount: number;
  hasBacklog: boolean;
}

const PHASE_CONFIG: Record<
  WorkflowPhase,
  {
    icon: any;
    label: string;
    gradient: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    ctaBg: string;
    bgImage: string;
  }
> = {
  LEARN: {
    icon: BookOpen,
    label: "Study Lesson",
    gradient: "from-indigo-50/70 via-white to-white",
    borderColor: "border-indigo-200",
    badgeBg: "bg-indigo-50 border border-indigo-200",
    badgeText: "text-indigo-700",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    ctaBg: "bg-indigo-600 hover:bg-indigo-500",
    bgImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
  },
  PRACTICE: {
    icon: Code2,
    label: "Practice Drills",
    gradient: "from-emerald-50/70 via-white to-white",
    borderColor: "border-emerald-200",
    badgeBg: "bg-emerald-50 border border-emerald-200",
    badgeText: "text-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    ctaBg: "bg-emerald-600 hover:bg-emerald-500",
    bgImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
  },
  ASSIGNMENT: {
    icon: FileCheck2,
    label: "Graded Assignment",
    gradient: "from-amber-50/70 via-white to-white",
    borderColor: "border-amber-200",
    badgeBg: "bg-amber-50 border border-amber-200",
    badgeText: "text-amber-800",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    ctaBg: "bg-amber-600 hover:bg-amber-500",
    bgImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80",
  },
  EVALUATION: {
    icon: Award,
    label: "View Scorecard",
    gradient: "from-purple-50/70 via-white to-white",
    borderColor: "border-purple-200",
    badgeBg: "bg-purple-50 border border-purple-200",
    badgeText: "text-purple-700",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    ctaBg: "bg-purple-600 hover:bg-purple-500",
    bgImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80",
  },
  ASSESSMENT: {
    icon: CalendarCheck,
    label: "Weekly Assessment",
    gradient: "from-rose-50/70 via-white to-white",
    borderColor: "border-rose-200",
    badgeBg: "bg-rose-50 border border-rose-200",
    badgeText: "text-rose-700",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    ctaBg: "bg-rose-600 hover:bg-rose-500",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
  },
  PROJECT: {
    icon: Briefcase,
    label: "Capstone Project",
    gradient: "from-amber-50/70 via-orange-50/30 to-white",
    borderColor: "border-amber-300",
    badgeBg: "bg-amber-50 border border-amber-200",
    badgeText: "text-amber-800",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    ctaBg: "bg-amber-600 hover:bg-amber-500",
    bgImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
  },
  ALL_DONE: {
    icon: Sparkles,
    label: "All Caught Up!",
    gradient: "from-emerald-50/70 via-white to-white",
    borderColor: "border-emerald-200",
    badgeBg: "bg-emerald-50 border border-emerald-200",
    badgeText: "text-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    ctaBg: "bg-indigo-600 hover:bg-indigo-500",
    bgImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
  },
};

export function MissionHeroCard({
  currentPhase,
  stepNumber,
  ctaText,
  ctaHref,
  ctaDescription,
  nextPreview,
  dayNumber,
  dayTitle,
  currentStreak,
  backlogCount,
  hasBacklog,
}: MissionHeroCardProps) {
  const config = PHASE_CONFIG[currentPhase];
  const Icon = config.icon;

  return (
    <div
      className={`relative rounded-2xl border-2 ${config.borderColor} bg-white p-6 md:p-8 shadow-xs overflow-hidden transition-all`}
    >
      {/* Background Image Layer (Soft right-aligned fade to preserve pure light theme) */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-7/12 pointer-events-none overflow-hidden z-0">
        <Image
          src={config.bgImage}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-20"
        />
        {/* Multi-gradient wash for seamless integration into pure white card */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10 sm:from-white sm:via-white/70 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-white/30" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="flex-1 space-y-3">
          {/* Phase badge row */}
          <div className="flex items-center flex-wrap gap-2">
            <Badge
              className={`${config.badgeBg} ${config.badgeText} border-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 gap-1.5`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>
                {stepNumber > 0
                  ? `Step ${stepNumber} of 4 — ${config.label}`
                  : config.label}
              </span>
            </Badge>

            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Day {dayNumber} of 120
            </span>

            {currentStreak > 1 && (
              <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                {currentStreak} day streak
              </span>
            )}
          </div>

          {/* Main title */}
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight leading-tight">
              {ctaText}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-lg leading-relaxed">
              {ctaDescription}
            </p>
          </div>

          {/* Next preview */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/70">Up Next:</span>
            <span>{nextPreview}</span>
          </div>

          {/* Backlog warning */}
          {hasBacklog && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                {backlogCount} remedial item{backlogCount !== 1 ? "s" : ""}{" "}
                pending in your backlog
              </span>
            </div>
          )}
        </div>

        {/* Right: CTA Button */}
        <div className="flex-shrink-0">
          <Link href={ctaHref}>
            <Button
              size="lg"
              className={`${config.ctaBg} text-white font-bold text-sm gap-2.5 rounded-xl shadow-lg shadow-primary/15 h-12 px-6 transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <Icon className="w-5 h-5" />
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom: 4-Step Progress Indicator (inline mini-stepper) */}
      {stepNumber > 0 && (
        <div className="relative z-10 mt-6 pt-5 border-t border-border/50">
          <div className="grid grid-cols-4 gap-2">
            {[
              { step: 1, label: "Theory", icon: BookOpen },
              { step: 2, label: "Practice", icon: Code2 },
              { step: 3, label: "Assignment", icon: FileCheck2 },
              { step: 4, label: "Scorecard", icon: Award },
            ].map((s) => {
              const isDone = s.step < stepNumber;
              const isCurrent = s.step === stepNumber;
              const isPending = s.step > stepNumber;
              const StepIcon = s.icon;

              return (
                <div
                  key={s.step}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    isCurrent
                      ? "bg-primary/10 border border-primary/30"
                      : isDone
                      ? "bg-emerald-50 border border-emerald-200/60"
                      : "bg-muted/30 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? "✓" : s.step}
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-semibold block truncate ${
                        isCurrent
                          ? "text-foreground"
                          : isDone
                          ? "text-emerald-700"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {isDone ? "Done" : isCurrent ? "Current" : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
