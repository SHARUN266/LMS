"use client";

import React from "react";
import Link from "next/link";
import { Zap, Sparkles, Bot, Flame, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudyGoalCardProps {
  goalHours?: number;
  completedMins?: number;
  currentStreak?: number;
}

export function StudyGoalCard({
  goalHours = 6,
  completedMins = 255, // 4h 15m
  currentStreak = 12,
}: StudyGoalCardProps) {
  const goalMins = goalHours * 60;
  const percentage = Math.min(100, Math.round((completedMins / goalMins) * 100));
  const currentHours = Math.floor(completedMins / 60);
  const remainingMins = completedMins % 60;

  return (
    <Card className="card-hover border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-md overflow-hidden relative">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <CardContent className="p-5 space-y-4 relative z-10">
        {/* Title & Goal Target */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-foreground tracking-tight">
              Daily Discipline Goal
            </h3>
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-foreground">
              {currentHours}h {remainingMins}m
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              / {goalHours}h target
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground text-[11px]">Today's Target</span>
            <span className="text-amber-400 font-mono text-[11px]">{percentage}%</span>
          </div>
          <div className="w-full bg-muted/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Maintain your 6-hour daily study target to safeguard your {currentStreak}-day active cohort streak.
        </p>

        {/* AI Mentor launcher */}
        <Link href="/mentor" className="block w-full">
          <Button
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs h-9 rounded-xl shadow-lg shadow-amber-500/20 gap-1.5 transition-all active:scale-[0.98]"
          >
            <Bot className="w-3.5 h-3.5 fill-slate-950" />
            <span>Chat with AI Mentor</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
