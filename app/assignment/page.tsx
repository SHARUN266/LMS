import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const assignments = await db.assignment.findMany({
    include: {
      day: true,
      questions: true,
      submissions: {
        include: {
          evaluation: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { day: { dayNumber: "asc" } },
  });

  const activeAssignment = assignments.find((a) => a.day?.dayNumber === 2) || assignments[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px] font-mono">
              DAILY ASSIGNMENTS
            </Badge>
            <span className="text-xs text-muted-foreground">• Graded by Gemini 2.0 Flash AI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Assignments & Coding Evaluations
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Strict Masai-style daily problem sets. Submit your SQL queries before 11:59 PM for instant rubric evaluation.
          </p>
        </div>

        {activeAssignment && (
          <Link href={`/assignment/${activeAssignment.id}`}>
            <Button size="sm" className="gap-2 font-medium shadow-sm">
              <FileCode className="w-4 h-4" />
              <span>Solve Day 2 Assignment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Featured / Active Assignment Card */}
      {activeAssignment && (
        <Card className="border-primary/40 bg-gradient-to-br from-primary/[0.06] via-card/80 to-card shadow-md">
          <CardHeader className="py-4 px-5 border-b border-border/80 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="text-[10px] py-0 h-4 font-mono">
                TODAY'S MANDATORY SUBMISSION
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Day {activeAssignment.day?.dayNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Due in {activeAssignment.deadlineHours}h (11:59 PM)</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-base font-bold text-foreground">
                {activeAssignment.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeAssignment.description}
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                <span>{activeAssignment.questions.length} Problem{activeAssignment.questions.length !== 1 ? "s" : ""}</span>
                <span>•</span>
                <span>Weight: 100% of Daily Score</span>
                <span>•</span>
                <span>Evaluator: Gemini AI Rubric</span>
              </div>
            </div>

            <Link href={`/assignment/${activeAssignment.id}`}>
              <Button className="w-full sm:w-auto gap-2">
                <span>Open in SQL Editor</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* All Assignments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Module 1 Curriculum Assignments
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {assignments.filter((a) => a.submissions.length > 0).length} of {assignments.length} Submitted
          </span>
        </div>

        <div className="space-y-2">
          {assignments.map((a) => {
            const dayNum = a.day?.dayNumber || 1;
            const hasSubmission = a.submissions && a.submissions.length > 0;
            const lastSub = hasSubmission ? a.submissions[0] : null;
            const score = lastSub?.evaluation?.score;
            const isToday = dayNum === 2;
            const isUnlocked = dayNum <= 3;

            return (
              <Card
                key={a.id}
                className={`transition-all ${
                  isToday
                    ? "bg-card border-primary/40 shadow-sm"
                    : isUnlocked
                    ? "bg-card/60 border-border hover:border-border/80"
                    : "bg-card/25 border-border/40 opacity-60"
                }`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold ${
                        hasSubmission
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : isToday
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : isUnlocked
                          ? "bg-muted text-muted-foreground border border-border"
                          : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {hasSubmission ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isUnlocked ? (
                        <span>D0{dayNum}</span>
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground font-bold">
                          DAY {dayNum}
                        </span>
                        {hasSubmission && (
                          <Badge variant="success" className="text-[10px] py-0 h-4">
                            Score: {score ?? 88}/100
                          </Badge>
                        )}
                        {isToday && !hasSubmission && (
                          <Badge variant="warning" className="text-[10px] py-0 h-4">
                            Active (Due Tonight)
                          </Badge>
                        )}
                        {!isUnlocked && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 text-muted-foreground border-border">
                            Locked
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-foreground mt-0.5">
                        {a.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {a.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasSubmission ? (
                      <Link href={`/evaluation/${lastSub?.id || "latest"}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border">
                          <Award className="w-3.5 h-3.5 text-emerald-500" />
                          <span>View Score & Report</span>
                        </Button>
                      </Link>
                    ) : isUnlocked ? (
                      <Link href={`/assignment/${a.id}`}>
                        <Button
                          variant={isToday ? "default" : "outline"}
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                        >
                          <span>{isToday ? "Solve Assignment" : "Open"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="ghost" size="sm" disabled className="h-8 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3 mr-1" />
                        Locked
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
