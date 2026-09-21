"use client";

import React from "react";
import Link from "next/link";
import {
  FileCheck2,
  ChevronRight,
  Info,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface AssignmentCardProps {
  submittedCount?: number;
  remainingCount?: number;
  totalAssignments?: number;
  href?: string;
}

export function AssignmentCard({
  submittedCount = 80,
  remainingCount = 100,
  totalAssignments = 40,
  href = "/assignment",
}: AssignmentCardProps) {
  const total = submittedCount + remainingCount;
  const percentage = Math.round((submittedCount / total) * 100);

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Assignment</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Cohort assignment submission rate</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Active Batch</span>
          </div>
        </div>

        {/* Big Metric & Subtitle */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {submittedCount}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                submitted
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {remainingCount} remaining
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
              <FileCheck2 className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-foreground">
              {totalAssignments} Assignments Available
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <Link
            href={href}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group"
          >
            <span>See all assignments</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
          <span className="text-[11px] font-bold text-indigo-400">{percentage}% finished</span>
        </div>
      </CardContent>
    </Card>
  );
}
