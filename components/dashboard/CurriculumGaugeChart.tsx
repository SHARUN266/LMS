"use client";

import React, { useState } from "react";
import { Info, ChevronDown, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function CurriculumGaugeChart() {
  const [filter, setFilter] = useState("Module 1 (Active)");

  const statuses = [
    { label: "Completed & Mastered", value: 35, color: "#6366f1", dotClass: "bg-indigo-500" },
    { label: "In Progress (Today)", value: 5, color: "#14b8a6", dotClass: "bg-teal-500" },
    { label: "Backlog / Remedial", value: 8, color: "#f43f5e", dotClass: "bg-rose-500" },
    { label: "Remaining Roadmap", value: 52, color: "#94a3b8", dotClass: "bg-slate-400" },
  ];

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden flex flex-col justify-between">
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header with filter dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Curriculum Mastery Gauge</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Your personal completion across the 120-day bootcamp syllabus</TooltipContent>
            </Tooltip>
          </div>

          <button
            onClick={() => setFilter(filter === "Module 1 (Active)" ? "Full 120-Day Track" : "Module 1 (Active)")}
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

              {/* Segment 1: Completed (35% -> ~63 deg) */}
              <path
                d="M 15 80 A 65 65 0 0 1 70 17"
                fill="none"
                stroke="#6366f1"
                strokeWidth="14"
                strokeLinecap="round"
                className="transition-all duration-700 hover:opacity-80"
              />

              {/* Segment 2: In Progress (5%) */}
              <path
                d="M 70 17 A 65 65 0 0 1 85 15"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="14"
                className="transition-all duration-700 hover:opacity-80"
              />

              {/* Segment 3: Backlog (8%) */}
              <path
                d="M 85 15 A 65 65 0 0 1 105 20"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="14"
                className="transition-all duration-700 hover:opacity-80"
              />

              {/* Segment 4: Remaining (52%) */}
              <path
                d="M 105 20 A 65 65 0 0 1 145 80"
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
                Progress
              </span>
              <span className="text-2xl font-black text-foreground tracking-tight leading-none mt-0.5">
                40%
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
            Active on Module 1 (Day 2/120)
          </span>
          <span className="text-[11px] font-semibold text-primary">On Schedule</span>
        </div>
      </CardContent>
    </Card>
  );
}
