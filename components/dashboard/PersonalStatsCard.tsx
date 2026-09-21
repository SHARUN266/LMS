"use client";

import React from "react";
import Link from "next/link";
import { Info, ArrowUpRight, Flame, Trophy, Clock, Target, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface PersonalStatsCardProps {
  xp?: number;
  level?: number;
  currentStreak?: number;
  longestStreak?: number;
  totalStudyMins?: number;
  targetRole?: string;
}

export function PersonalStatsCard({
  xp = 1450,
  level = 3,
  currentStreak = 12,
  longestStreak = 15,
  totalStudyMins = 2840,
  targetRole = "Business Analyst",
}: PersonalStatsCardProps) {
  const hours = Math.floor(totalStudyMins / 60);
  const mins = totalStudyMins % 60;

  const stats = [
    {
      label: "Discipline Streak",
      value: `${currentStreak} Days`,
      sub: `Best: ${longestStreak} days`,
      icon: Flame,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Time Studied",
      value: `${hours}h ${mins}m`,
      sub: "Total logged in sandbox & lessons",
      icon: Clock,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Target Role",
      value: targetRole,
      sub: "Active Bootcamp Track",
      icon: Target,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Your Mastery & XP</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Your personal skill points, rank and bootcamp discipline level</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            <Trophy className="w-3 h-3" />
            <span>Level {level} • {xp} XP</span>
          </div>
        </div>

        {/* Stats items */}
        <div className="space-y-2.5">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${item.color} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {item.value}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <Link
            href="/analytics"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View Mastery Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[11px] text-muted-foreground font-mono">Synced Live</span>
        </div>
      </CardContent>
    </Card>
  );
}
