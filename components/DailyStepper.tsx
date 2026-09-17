"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Code2, FileCheck2, Award, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  dayNumber: number;
  dayId?: string;
  moduleId?: string;
  assignmentId?: string;
  submissionId?: string;
  className?: string;
}

export function DailyStepper({
  currentStep,
  dayNumber,
  dayId = `day-${dayNumber}`,
  moduleId = "module-1",
  assignmentId,
  submissionId = "latest",
  className,
}: DailyStepperProps) {
  const steps = [
    {
      step: 1,
      name: "Concept Theory",
      shortName: "Theory",
      desc: "Notes & Micro-quiz",
      icon: BookOpen,
      href: `/learn/${moduleId}/${dayId}`,
    },
    {
      step: 2,
      name: "Hands-on Practice",
      shortName: "Practice",
      desc: "SQL Drills & Hints",
      icon: Code2,
      href: `/practice/${dayId}`,
    },
    {
      step: 3,
      name: "Graded Assignment",
      shortName: "Assignment",
      desc: "Strict Rubric Exam",
      icon: FileCheck2,
      href: `/assignment/${assignmentId || `daily-${dayNumber}`}`,
    },
    {
      step: 4,
      name: "Evaluation & Scorecard",
      shortName: "Scorecard",
      desc: "Feedback & Next Day",
      icon: Award,
      href: `/evaluation/${submissionId}`,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-3 sm:p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Daily Learning Track
          </span>
          <span className="text-xs font-black text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            Day {dayNumber}
          </span>
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Step <span className="font-bold text-foreground">{currentStep}</span> of 4
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 relative">
        {steps.map((s) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          const isPending = s.step > currentStep;
          const Icon = s.icon;

          return (
            <Link
              key={s.step}
              href={s.href}
              className={cn(
                "group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all select-none",
                isCurrent &&
                  "bg-primary/10 border-primary/40 text-foreground shadow-sm ring-1 ring-primary/20",
                isCompleted &&
                  "bg-emerald-500/10 border-emerald-500/30 text-muted-foreground hover:text-foreground hover:bg-emerald-500/15",
                isPending &&
                  "bg-background/40 border-border/40 text-muted-foreground/70 hover:text-muted-foreground hover:border-border"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-transform group-hover:scale-105",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm",
                  isCompleted && "bg-emerald-500 text-slate-950 font-black",
                  isPending && "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-xs font-bold truncate",
                      isCurrent && "text-foreground",
                      isCompleted && "text-emerald-400",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {s.name}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {isCompleted ? "Completed" : isCurrent ? "Active Step" : s.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
