import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  CheckCircle2,
  Lock,
  PlayCircle,
  Award,
  ChevronRight,
  Database,
  Code,
  LineChart,
  Boxes,
  Briefcase,
  Layers,
  ArrowRight,
  Sparkles,
  Milestone,
  Clock,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const track = await db.track.findFirst({
    include: {
      modules: {
        include: {
          weeks: {
            include: {
              days: {
                orderBy: { dayNumber: "asc" },
              },
              assessments: true,
            },
          },
          projects: true,
        },
      },
    },
  });

  const modulesList = [
    {
      num: 1,
      title: "Advanced SQL for Analytics Engineering",
      weeks: "Weeks 1-3",
      days: 6,
      status: "IN_PROGRESS",
      icon: Database,
      desc: "Window functions, CTEs, complex aggregations, query optimization & analytical schemas",
      capstone: "E-Commerce Retention & Revenue Analytics",
      progress: 33,
    },
    {
      num: 2,
      title: "Python, Pandas & Data Wrangling",
      weeks: "Weeks 4-7",
      days: 12,
      status: "LOCKED",
      icon: Code,
      desc: "Data ingestion, vector operations, data cleansing, automated ETL scripts",
      capstone: "Automated Data Ingestion & Transformation Pipeline",
      progress: 0,
    },
    {
      num: 3,
      title: "Relational Data Modeling & Normalization",
      weeks: "Weeks 8-10",
      days: 6,
      status: "LOCKED",
      icon: Layers,
      desc: "Star & Snowflake schemas, 3NF normalization, dimensional modeling, slowly changing dimensions",
      capstone: "Enterprise Data Warehouse Schema Design",
      progress: 0,
    },
    {
      num: 4,
      title: "Power BI, DAX & Executive Dashboards",
      weeks: "Weeks 11-14",
      days: 12,
      status: "LOCKED",
      icon: LineChart,
      desc: "Data modeling in Power BI, complex DAX measures, row-level security, executive storytelling",
      capstone: "SaaS Executive KPI Dashboard with DAX",
      progress: 0,
    },
    {
      num: 5,
      title: "Modern Data Stack (dbt, Snowflake, ELT)",
      weeks: "Weeks 15-17",
      days: 12,
      status: "LOCKED",
      icon: Boxes,
      desc: "Cloud warehousing, dbt models, testing & documentation, CI/CD for analytics code",
      capstone: "Production dbt Warehouse with Automated Tests",
      progress: 0,
    },
    {
      num: 6,
      title: "Capstone Lakehouse & Job-Ready Portfolio",
      weeks: "Weeks 18-20",
      days: 12,
      status: "LOCKED",
      icon: Briefcase,
      desc: "End-to-end portfolio project, system design interviews, resume grading & mock interviews",
      capstone: "Full-Stack Industry Capstone & Mock Review",
      progress: 0,
    },
  ];

  const daysData = track?.modules[0]?.weeks[0]?.days || [
    { id: "d1", dayNumber: 1, title: "Joins & Complex Aggregations", isCompleted: true, isUnlocked: true, score: 88 },
    { id: "d2", dayNumber: 2, title: "Analytical Window Functions & Partitions", isCompleted: false, isUnlocked: true, score: null },
    { id: "d3", dayNumber: 3, title: "CTEs & Recursive Pipelines", isCompleted: false, isUnlocked: true, score: null },
    { id: "d4", dayNumber: 4, title: "Conditional Aggregates & Data Cleaning", isCompleted: false, isUnlocked: false, score: null },
    { id: "d5", dayNumber: 5, title: "Query Optimization, Indexing & B-Trees", isCompleted: false, isUnlocked: false, score: null },
    { id: "d6", dayNumber: 6, title: "Module Assessment & Capstone Kickoff", isCompleted: false, isUnlocked: false, score: null },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px] font-mono">
              CURRICULUM ROADMAP
            </Badge>
            <span className="text-xs text-muted-foreground">• 120 Days • 6 Modules</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            BI & Analytics Engineering Career Path
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Step-by-step progression from foundational SQL to production data warehousing and job placement.
          </p>
        </div>

        <Link href="/learn/module-1/day-2">
          <Button size="sm" className="gap-2 font-medium">
            <PlayCircle className="w-4 h-4" />
            <span>Continue Day 2</span>
          </Button>
        </Link>
      </div>

      {/* Track Milestones Timeline (Horizontal Pipeline View) */}
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardHeader className="py-3 px-5 border-b border-border">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Career Milestones Overview</span>
            <span className="text-primary font-mono text-[11px]">Module 1 of 6 Active</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {modulesList.map((m) => {
              const Icon = m.icon;
              const isActive = m.status === "IN_PROGRESS";
              return (
                <div
                  key={m.num}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[110px] ${
                    isActive
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : "bg-muted/30 border-border/60 opacity-60"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 text-xs">
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      MOD 0{m.num}
                    </span>
                    <span className={`text-[11px] font-semibold leading-tight line-clamp-2 mt-0.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {m.title.split(":")[0].replace("Module ", "")}
                    </span>
                  </div>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-[9px] py-0 h-4 mt-2 font-mono"
                  >
                    {isActive ? "Active (33%)" : "Locked"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Module 1: Detailed Timeline View (Not Just Disconnected Boxes) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Module 1: Advanced SQL for Analytics Engineering
                <Badge variant="success" className="text-[10px] py-0 h-4">
                  In Progress
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">Week 1 of 1 • 6 Days of Graded Practice & Evaluation</p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium text-foreground">
            Day 2 / 6
          </span>
        </div>

        {/* Step-by-Step Vertical Path with Connecting Line */}
        <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {daysData.map((d) => {
            const isCompleted = d.isCompleted;
            const isCurrent = !isCompleted && d.isUnlocked && d.dayNumber === 2;
            const isUnlocked = d.isUnlocked;

            return (
              <div key={d.id || d.dayNumber} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 top-3.5 w-6 h-6 rounded-full flex items-center justify-center text-xs -translate-x-1/2 transition-transform ${
                    isCompleted
                      ? "bg-emerald-500 text-white ring-4 ring-background"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                      : isUnlocked
                      ? "bg-muted text-foreground ring-4 ring-background border border-border"
                      : "bg-muted/80 text-muted-foreground ring-4 ring-background"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <PlayCircle className="w-3.5 h-3.5" />
                  ) : isUnlocked ? (
                    <span className="text-[10px] font-bold font-mono">{d.dayNumber}</span>
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>

                {/* Day Card */}
                <Card
                  className={`transition-all ${
                    isCurrent
                      ? "bg-card border-primary/50 shadow-md ring-1 ring-primary/30"
                      : isCompleted
                      ? "bg-card/50 border-border/80"
                      : isUnlocked
                      ? "bg-card/40 border-border hover:border-border/90"
                      : "bg-card/20 border-border/40 opacity-50"
                  }`}
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-muted-foreground">
                          DAY 0{d.dayNumber}
                        </span>
                        {isCompleted && (
                          <Badge variant="success" className="text-[10px] py-0 h-4">
                            Passed {d.score ? `(${d.score}/100)` : ""}
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="warning" className="text-[10px] py-0 h-4">
                            Today's Target
                          </Badge>
                        )}
                        {!isUnlocked && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 text-muted-foreground border-border">
                            Locked
                          </Badge>
                        )}
                      </div>
                      <h3 className={`text-xs font-semibold ${isCurrent ? "text-foreground" : "text-foreground/90"}`}>
                        {d.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        Includes: Concept Theory • 3 Practice Drills • 1 Graded Assignment
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isUnlocked ? (
                        <Link href={`/learn/module-1/${d.id || `day-${d.dayNumber}`}`}>
                          <Button
                            variant={isCurrent ? "default" : "outline"}
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                          >
                            <span>{isCompleted ? "Review" : isCurrent ? "Resume" : "Start"}</span>
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
              </div>
            );
          })}

          {/* Milestone Capstone Node */}
          <div className="relative group pt-2">
            <div className="absolute -left-6 top-5 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center -translate-x-1/2 ring-4 ring-background">
              <Award className="w-3.5 h-3.5" />
            </div>
            <Card className="bg-gradient-to-r from-amber-500/[0.08] to-primary/[0.08] border-amber-500/30">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px] font-mono py-0 h-4">
                      MODULE 1 CAPSTONE PROJECT
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">7 Days Duration</span>
                  </div>
                  <h3 className="text-xs font-bold text-foreground">
                    E-Commerce Customer Retention & Revenue Analytics
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    End-to-end analytical case study evaluated against Masai recruiter rubric.
                  </p>
                </div>
                <Link href="/projects/capstone-1">
                  <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-8 text-xs gap-1.5 flex-shrink-0">
                    <span>View Project</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Subsequent Modules Pipeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Milestone className="w-3.5 h-3.5" />
          <span>Next Career Modules (Unlocks sequentially as you advance)</span>
        </h3>

        <div className="space-y-2">
          {modulesList.slice(1).map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.num} className="bg-card/40 border-border/60 opacity-65 hover:opacity-85 transition-opacity">
                <CardContent className="p-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground">
                          MODULE {m.num}
                        </span>
                        <span className="text-[11px] text-muted-foreground">• {m.weeks}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-foreground">
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{m.desc}</p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] text-muted-foreground border-border flex items-center gap-1 flex-shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>Prerequisite Required</span>
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
