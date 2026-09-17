import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AssessmentsHubPage() {
  const assessments = await db.assessment.findMany({
    include: {
      week: true,
      questions: true,
      attempts: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const activeAssessment = assessments[0] || {
    id: "week-1",
    title: "Monday Weekly Assessment: SQL Mastery & Analytical Querying",
    durationMins: 90,
    passingScore: 70,
    questions: [],
    attempts: [],
  };

  const hasAttempt = activeAssessment.attempts && activeAssessment.attempts.length > 0;
  const lastAttempt = hasAttempt ? activeAssessment.attempts[0] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px] font-mono">
              WEEKLY ASSESSMENTS
            </Badge>
            <span className="text-xs text-muted-foreground">• Timed Weekly Checkpoint Exams</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Weekly Assessment Hall
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            90-minute timed milestone exams. Combines MCQs, edge-case analysis, and live SQL coding drills.
          </p>
        </div>

        <Link href={`/assessment/${activeAssessment.id}`}>
          <Button size="sm" className="gap-2 font-medium">
            <CalendarCheck className="w-4 h-4" />
            <span>{hasAttempt ? "Retake Assessment" : "Enter Exam Hall"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Featured Assessment Card */}
      <Card className="border-primary/40 bg-gradient-to-br from-primary/[0.06] via-card/80 to-card shadow-md">
        <CardHeader className="py-4 px-5 border-b border-border/80 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-[10px] py-0 h-4 font-mono">
              WEEK 1 MILESTONE EXAM
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Passing: {activeAssessment.passingScore}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{activeAssessment.durationMins} Minutes Timed</span>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-base font-bold text-foreground">
              {activeAssessment.title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Strictly proctored weekly evaluation covering relational joins, window functions, CTE recursion, and query optimization.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
              <span>{activeAssessment.questions.length || 15} Questions (MCQs + Coding)</span>
              <span>•</span>
              <span>Single Sitting Recommended</span>
              <span>•</span>
              <span>Adaptive Skill Radar Generated</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {hasAttempt && (
              <Link href={`/assessment/${activeAssessment.id}/report?attemptId=${lastAttempt?.id}`}>
                <Button variant="outline" className="w-full sm:w-auto gap-2 border-border">
                  <span>View Latest Report</span>
                </Button>
              </Link>
            )}
            <Link href={`/assessment/${activeAssessment.id}`}>
              <Button className="w-full sm:w-auto gap-2">
                <span>{hasAttempt ? "Retake Exam" : "Start 90m Exam"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
