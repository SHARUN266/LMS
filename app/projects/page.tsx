import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  Briefcase,
  Award,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ProjectsHubPage() {
  const projects = await db.project.findMany({
    include: {
      milestones: { orderBy: { dayNumber: "asc" } },
      submissions: {
        include: { evaluation: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const activeProject = projects[0] || {
    id: "capstone-1",
    title: "E-Commerce Customer Retention & Revenue Analytics",
    businessBrief: "Build an end-to-end analytics mart and cohort retention matrix evaluating customer lifetime value and churn velocity.",
    durationDays: 7,
    milestones: [],
    submissions: [],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-primary border-primary/30 text-[11px] font-mono">
              CAPSTONE PROJECTS
            </Badge>
            <span className="text-xs text-muted-foreground">• Evaluated by Hiring Manager Rubric</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Industry Capstone Projects
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            Real-world 7-day portfolio projects. Build production data models, GitHub repositories, and analytics pipelines.
          </p>
        </div>

        <Link href={`/projects/${activeProject.id}`}>
          <Button size="sm" className="gap-2 font-medium">
            <Briefcase className="w-4 h-4" />
            <span>Open Module 1 Capstone</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Featured Project Card */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-card/80 to-card shadow-md">
        <CardHeader className="py-4 px-5 border-b border-border/80 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-[10px] py-0 h-4 font-mono">
              ACTIVE MODULE 1 CAPSTONE
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">7 Days Duration</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>Recruiter Graded</span>
          </div>
        </CardHeader>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="text-base font-bold text-foreground">
              {activeProject.title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeProject.businessBrief}
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
              <span>7 Daily Milestones</span>
              <span>•</span>
              <span>GitHub Delivery Required</span>
              <span>•</span>
              <span>Evaluator: Gemini AI Recruiter</span>
            </div>
          </div>

          <Link href={`/projects/${activeProject.id}`}>
            <Button className="w-full sm:w-auto gap-2 border-amber-500/40">
              <span>View Milestones & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
