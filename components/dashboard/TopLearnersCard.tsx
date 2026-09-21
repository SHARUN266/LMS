"use client";

import React from "react";
import Link from "next/link";
import { Info, ArrowUpRight, Flame, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function TopLearnersCard() {
  const learners = [
    {
      rank: "#1",
      name: "Arif Brata",
      role: "Jr UI/UX Designer",
      points: 100,
      avatarColor: "from-amber-500 to-orange-600",
      initials: "AB",
      coinColor: "text-amber-400",
      rankBadge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      rank: "#2",
      name: "Ardhi Irwandi",
      role: "Sr UI/UX Designer",
      points: 80,
      avatarColor: "from-slate-500 to-slate-700",
      initials: "AI",
      coinColor: "text-slate-300",
      rankBadge: "text-slate-300 bg-slate-500/10 border-slate-500/20",
    },
    {
      rank: "#3",
      name: "Friza Dipa",
      role: "Jr Animation",
      points: 100,
      avatarColor: "from-indigo-500 to-purple-600",
      initials: "FD",
      coinColor: "text-amber-400",
      rankBadge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Top Learner</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Top students by XP and assignment completion</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Trophy className="w-3 h-3" />
            <span>Leaderboard</span>
          </div>
        </div>

        {/* Learners List */}
        <div className="space-y-3">
          {learners.map((learner) => (
            <div
              key={learner.name}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-all group"
            >
              {/* Rank + Avatar + Name Info */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-md border ${learner.rankBadge}`}
                >
                  {learner.rank}
                </span>

                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-tr ${learner.avatarColor} text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0`}
                >
                  {learner.initials}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {learner.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{learner.role}</p>
                </div>
              </div>

              {/* Points Coin Badge */}
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground bg-muted/80 px-2.5 py-1 rounded-lg border border-border/60">
                <Flame className={`w-3.5 h-3.5 ${learner.coinColor}`} />
                <span className="font-mono">{learner.points}pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <Link
            href="/evaluation"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <span className="text-[11px] text-muted-foreground">Updated hourly</span>
        </div>
      </CardContent>
    </Card>
  );
}
