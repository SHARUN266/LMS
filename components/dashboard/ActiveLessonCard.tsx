"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ChevronRight,
  Info,
  BookOpen,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ActiveLessonCardProps {
  dayNumber?: number;
  title?: string;
  estimatedMins?: number;
  streakCount?: number;
  thumbnailUrl?: string;
  href?: string;
}

export function ActiveLessonCard({
  dayNumber = 2,
  title = "Analytical Window Functions & Running Totals",
  estimatedMins = 180,
  streakCount = 12,
  thumbnailUrl = "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&auto=format&fit=crop&q=80",
  href = "/learn",
}: ActiveLessonCardProps) {
  const hours = Math.floor(estimatedMins / 60);
  const mins = estimatedMins % 60;

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Current Study Focus</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Your daily active curriculum milestone</TooltipContent>
            </Tooltip>
          </div>
          <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
            Day {dayNumber} of 120
          </span>
        </div>

        {/* Content Body */}
        <div className="flex items-start justify-between gap-4 pt-1">
          <div className="space-y-2 max-w-[62%]">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-sky-500/30 flex-shrink-0 bg-sky-500/10 flex items-center justify-center">
                {thumbnailUrl ? (
                  <Image
                    src={thumbnailUrl}
                    alt="Course Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <BookOpen className="w-4 h-4 text-sky-400" />
                )}
              </div>
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                Module 1 • SQL & Analytics
              </span>
            </div>

            <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
              {title}
            </h3>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              <span>{streakCount} day study streak active</span>
            </div>
          </div>

          {/* Right Metrics & Sparkline */}
          <div className="flex flex-col items-end justify-between self-stretch">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {hours}h {mins > 0 ? `${mins}m` : ""}
                </span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">estimated</span>
            </div>

            {/* Sparkline SVG curve */}
            <div className="w-24 h-9 mt-2">
              <svg viewBox="0 0 100 36" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="activeSparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,28 Q15,32 30,22 T60,16 T85,8 T100,12"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,28 Q15,32 30,22 T60,16 T85,8 T100,12 L100,36 L0,36 Z"
                  fill="url(#activeSparkGrad)"
                />
                <circle cx="100" cy="12" r="3" fill="#10b981" />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
          <Link
            href={href}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors group"
          >
            <span>Resume Today's Lesson</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
          <Sparkles className="w-3.5 h-3.5 text-sky-400/60" />
        </div>
      </CardContent>
    </Card>
  );
}
