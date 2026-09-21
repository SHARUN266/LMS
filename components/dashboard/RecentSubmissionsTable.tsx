"use client";

import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Info,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Award,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function RecentSubmissionsTable() {
  const submissions = [
    {
      id: 1,
      title: "Analytical Window Functions & Running Totals",
      category: "SQL Assignment",
      tasksCount: "4 complex queries",
      score: 92,
      passed: true,
      feedback: "Strong partitioning logic, optimized execution plan",
      href: "/evaluation",
    },
    {
      id: 2,
      title: "Advanced Aggregations & Grouping Sets",
      category: "Practice Sandbox",
      tasksCount: "3 code challenges",
      score: 88,
      passed: true,
      feedback: "Accurate HAVING clauses, minor whitespace difference",
      href: "/evaluation",
    },
    {
      id: 3,
      title: "Week 1 Comprehensive Analytics Exam",
      category: "Weekly Assessment",
      tasksCount: "10 MCQ & SQL problems",
      score: 85,
      passed: true,
      feedback: "Passed benchmark threshold (70%) with distinction",
      href: "/evaluation",
    },
  ];

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Your Recent Submissions & AI Evaluations</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Your automated rubric scorecards and AI mentor code evaluations</TooltipContent>
            </Tooltip>
          </div>
          <Link
            href="/evaluation"
            className="text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>Full Scorecard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5 font-medium pl-2 w-8">#</th>
                <th className="pb-2.5 font-medium">Topic & Module</th>
                <th className="pb-2.5 font-medium">Scope</th>
                <th className="pb-2.5 font-medium">AI Score</th>
                <th className="pb-2.5 font-medium text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {submissions.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/40 transition-colors group"
                >
                  {/* Index */}
                  <td className="py-3.5 pl-2 font-mono text-muted-foreground font-semibold">
                    {index + 1}
                  </td>

                  {/* Topic */}
                  <td className="py-3.5 pr-4 font-semibold text-foreground group-hover:text-primary transition-colors max-w-[280px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-normal line-clamp-1">
                        {item.feedback}
                      </p>
                    </div>
                  </td>

                  {/* Scope */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md w-fit border border-border/50">
                      <HelpCircle className="w-3 h-3 text-muted-foreground" />
                      <span>{item.tasksCount}</span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit border border-emerald-500/20">
                      <Award className="w-3.5 h-3.5" />
                      <span>{item.score}/100</span>
                    </div>
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 pr-2 text-right">
                    <Link href={item.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold px-3 border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all shadow-xs"
                      >
                        View Scorecard
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
