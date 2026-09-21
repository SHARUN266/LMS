"use client";

import React from "react";
import Link from "next/link";
import {
  FileCheck2,
  ChevronRight,
  Info,
  Code2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface PersonalAssignmentCardProps {
  completedCount?: number;
  totalCount?: number;
  href?: string;
  practiceHref?: string;
}

export function PersonalAssignmentCard({
  completedCount = 8,
  totalCount = 12,
  href = "/assignment",
  practiceHref = "/practice",
}: PersonalAssignmentCardProps) {
  const remaining = Math.max(0, totalCount - completedCount);
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Assignment & Sandbox Track</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Your personal graded assignment progress for this module</TooltipContent>
            </Tooltip>
          </div>
          <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
            {percentage}% Completed
          </span>
        </div>

        {/* Big Metric & Subtitle */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {completedCount} of {totalCount}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                passed
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {remaining} remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-border/50">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Bottom tag indicator */}
          <div className="flex items-center gap-2 pt-1">
            <span className="p-1 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Code2 className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-foreground">
              Practice Sandbox Step 2 Ready
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <Link
            href={href}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group"
          >
            <span>Open Graded Assignments</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Link
            href={practiceHref}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sandbox →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
