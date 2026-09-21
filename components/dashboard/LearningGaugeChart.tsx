"use client";

import React, { useState } from "react";
import { Info, ChevronDown, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function LearningGaugeChart() {
  const [filter, setFilter] = useState("By status");

  const statuses = [
    { label: "Passed", value: 84, color: "#6366f1", dotClass: "bg-indigo-500" },
    { label: "Failed", value: 4, color: "#eab308", dotClass: "bg-yellow-500" },
    { label: "Overdue", value: 4, color: "#f43f5e", dotClass: "bg-rose-500" },
    { label: "In Progress", value: 4, color: "#14b8a6", dotClass: "bg-teal-500" },
    { label: "Not Started", value: 4, color: "#94a3b8", dotClass: "bg-slate-400" },
  ];

  const totalCount = 140;

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header with filter dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Learning Content</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Curriculum items breakdown by status</TooltipContent>
            </Tooltip>
          </div>

          <button
            onClick={() => setFilter(filter === "By status" ? "All Modules" : "By status")}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-lg border border-border/50 transition-colors"
          >
            <span>{filter}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* Gauge & Legend Body */}
        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Semi-circle Gauge SVG */}
          <div className="relative w-40 h-24 flex items-end justify-center">
            <svg viewBox="0 0 160 90" className="w-full h-full overflow-visible">
              {/* Background Arc */}
              <path
                d="M 15 80 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="currentColor"
                className="text-muted/40"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Segment 1: Passed (84% of 180 deg = ~151 deg) */}
              <path
                d="M 15 80 A 65 65 0 0 1 126 28"
                fill="none"
                stroke="#6366f1"
                strokeWidth="14"
                strokeLinecap="round"
                className="transition-all duration-700 hover:opacity-80"
              />

              {/* Segment 2: Failed (4%) */}
              <path
                d="M 126 28 A 65 65 0 0 1 133 37"
                fill="none"
                stroke="#eab308"
                strokeWidth="14"
                className="transition-all duration-700 hover:opacity-80"
              />

              {/* Segment 3: Overdue (4%) */}
              <path
                d="M 133 37 A 65 65 0 0 1 139 48"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="14"
                className="transition-all duration-700 hover:opacity-80"
              />

              {/* Segment 4: In Progress (4%) */}
              <path
                d="M 139 48 A 65 65 0 0 1 143 62"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="14"
                className="transition-all duration-700 hover:opacity-80"
              />

              {/* Segment 5: Not Started (4%) */}
              <path
                d="M 143 62 A 65 65 0 0 1 145 80"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="14"
                strokeLinecap="round"
                className="transition-all duration-700 hover:opacity-80"
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute bottom-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Contents
              </span>
              <span className="text-2xl font-black text-foreground tracking-tight leading-none mt-0.5">
                {totalCount}
              </span>
            </div>
          </div>

          {/* Legend List */}
          <div className="flex-1 space-y-1.5 pl-2">
            {statuses.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-xs group hover:bg-muted/40 p-1 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.dotClass}`} />
                  <span className="text-muted-foreground group-hover:text-foreground text-[11px] font-medium transition-colors">
                    {item.label}
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            84% Mastery threshold met
          </span>
          <span className="text-[11px] font-semibold text-primary">Track 1</span>
        </div>
      </CardContent>
    </Card>
  );
}
