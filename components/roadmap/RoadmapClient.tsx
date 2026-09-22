"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  FileSpreadsheet,
  Workflow,
  TrendingUp,
  Target,
  BookOpen,
  Check,
  ChevronDown,
  Network,
  FileText,
  Brain,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface DayItem {
  id: string;
  dayNumber: number;
  title: string;
  objective: string;
  estimatedMins: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  score: number | null;
  practiceCount?: number;
}

export interface ModuleItem {
  num: number;
  id: string;
  title: string;
  weeks: string;
  duration: string;
  status: "COMPLETED" | "IN_PROGRESS" | "UNLOCKED" | "LOCKED";
  iconName: string;
  bgImage: string;
  desc: string;
  keySkills: string[];
  capstoneTitle: string;
  capstoneDesc: string;
  progress: number;
  days: DayItem[];
}

export interface RoadmapClientProps {
  initialTrackTitle?: string;
  initialRole?: string;
  initialModules?: ModuleItem[];
  userProgress?: {
    xp: number;
    level: number;
    activeDayNumber: number;
    activeDayId?: string;
  };
}

export const BUSINESS_ANALYST_MODULES: ModuleItem[] = [
  {
    num: 1,
    id: "module-1",
    title: "Module 1: Advanced Excel & Business Financial Modeling",
    weeks: "Weeks 1-3",
    duration: "20 Days",
    status: "IN_PROGRESS",
    iconName: "excel",
    bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    desc: "Master lookup algorithms (XLOOKUP, INDEX/MATCH), dynamic array formulas, nested logic, Pivot Tables, Scenario Modeling, and financial forecasting.",
    keySkills: ["XLOOKUP & Nested Logic", "Pivot Tables & Slicers", "What-If Analysis & Goal Seek", "DCF & Cash Flow Modeling", "Power Query ETL"],
    capstoneTitle: "E-Commerce Financial & Unit Economics Forecasting Model",
    capstoneDesc: "Build an interactive multi-sheet dynamic financial model forecasting 3-year P&L, customer churn, and cash runway.",
    progress: 33,
    days: [
      {
        id: "day-1",
        dayNumber: 1,
        title: "Day 1: Advanced Lookup Formulas (XLOOKUP, INDEX/MATCH) & Data Hygiene",
        objective: "Master XLOOKUP with exact/approx match, multi-criteria INDEX/MATCH, and data validation rules.",
        estimatedMins: 240,
        isCompleted: true,
        isUnlocked: true,
        score: 88,
        practiceCount: 3,
      },
      {
        id: "day-2",
        dayNumber: 2,
        title: "Day 2: Multi-Dimensional Pivot Tables, Slicers & Calculated Fields",
        objective: "Design automated reporting matrices, custom calculated fields, timeline slicers, and summary aggregations.",
        estimatedMins: 240,
        isCompleted: true,
        isUnlocked: true,
        score: 86,
        practiceCount: 3,
      },
      {
        id: "day-3",
        dayNumber: 3,
        title: "Day 3: Financial Modeling: Cash Flow, CAGR, DCF & NPV",
        objective: "Build 3-statement financial models, compound annual growth rate calculations, and Net Present Value scenarios.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: true,
        score: null,
        practiceCount: 3,
      },
      {
        id: "day-4",
        dayNumber: 4,
        title: "Day 4: Scenario Planning, Goal Seek, Sensitivity Tables & What-If Analysis",
        objective: "Run dual-variable data tables, Goal Seek break-even solver, and dynamic scenario managers for executive leadership.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "day-5",
        dayNumber: 5,
        title: "Day 5: Power Query Transformations & Automated Data Cleaning",
        objective: "Extract, unpivot, clean, and merge multi-source CSV files using Power Query M transformations.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "day-6",
        dayNumber: 6,
        title: "Day 6: Executive Dashboard Design, Synthesis & Module 1 Capstone",
        objective: "Assemble an interactive KPI dashboard with dynamic charts, sparklines, conditional formatting, and executive summary.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
    ],
  },
  {
    num: 2,
    id: "module-2",
    title: "Module 2: SQL & Database Querying for Business Intelligence",
    weeks: "Weeks 4-7",
    duration: "20 Days",
    status: "UNLOCKED",
    iconName: "database",
    bgImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
    desc: "Extract business insights using complex relational multi-table joins, subqueries, CTEs, analytical window functions, and cohort retention calculations.",
    keySkills: ["Multi-Table Joins (INNER, LEFT, OUTER)", "Aggregate KPI Functions", "Window Functions (ROW_NUMBER, RANK, LAG/LEAD)", "CTEs & Recursive Pipelines", "Cohort Retention Modeling"],
    capstoneTitle: "Customer Retention & Revenue Analytics Lakehouse in SQL",
    capstoneDesc: "Write production-grade modular SQL data marts analyzing cohort retention, revenue leakage, and customer lifetime value.",
    progress: 0,
    days: [
      {
        id: "m2-day-1",
        dayNumber: 7,
        title: "Day 1: Relational Data Modeling, Keys & Multi-Table Joins",
        objective: "Understand 1-to-many cardinality, primary/foreign keys, and prevent fan-out in multi-table financial queries.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: true,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m2-day-2",
        dayNumber: 8,
        title: "Day 2: Analytical Window Functions (ROW_NUMBER, DENSE_RANK, LAG/LEAD)",
        objective: "Calculate month-over-month revenue growth, period offsets, running totals, and partitioned customer order ranks.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: true,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m2-day-3",
        dayNumber: 9,
        title: "Day 3: Common Table Expressions (CTEs) & Modular Business Logic",
        objective: "Structure complex nested reporting queries into readable, clean CTEs with reusable intermediate aggregations.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: true,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m2-day-4",
        dayNumber: 10,
        title: "Day 4: Customer Cohort Analysis & Retention Matrices in SQL",
        objective: "Build monthly customer acquisition cohorts and compute Month-1, Month-3, and Month-6 retention rates.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m2-day-5",
        dayNumber: 11,
        title: "Day 5: Query Execution Plans, B-Tree Indexing & Performance Optimization",
        objective: "Profile query bottlenecks, analyze EXPLAIN plans, and apply indexing strategies on high-volume tables.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m2-day-6",
        dayNumber: 12,
        title: "Day 6: Advanced SQL Synthesis & Business Mart Capstone",
        objective: "Integrate all SQL techniques into an end-to-end commercial revenue mart tracking CAC and LTV.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
    ],
  },
  {
    num: 3,
    id: "module-3",
    title: "Module 3: Power BI & Tableau: Executive Dashboards & Data Storytelling",
    weeks: "Weeks 8-11",
    duration: "20 Days",
    status: "UNLOCKED",
    iconName: "chart",
    bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    desc: "Build automated interactive BI cockpits, Star Schema data models, complex DAX measures, parameters, and persuasive executive visual narratives.",
    keySkills: ["Star Schema Dimensional Modeling", "DAX (CALCULATE, Time Intelligence, Filters)", "Interactive Drill-Throughs & Bookmarks", "Tableau Visual Storyboarding", "Row-Level Security (RLS)"],
    capstoneTitle: "Enterprise SaaS Executive KPI Cockpit",
    capstoneDesc: "Design a full executive dashboard in Power BI / Tableau tracking MRR, Churn, LTV, and Regional sales performance.",
    progress: 0,
    days: [
      {
        id: "m3-day-1",
        dayNumber: 13,
        title: "Day 1: BI Data Modeling: Star Schemas, Fact & Dimension Relationships",
        objective: "Model 1-to-many dimensional relationships, handle bi-directional filtering traps, and configure date tables.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: true,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m3-day-2",
        dayNumber: 14,
        title: "Day 2: Mastering DAX: CALCULATE, Filter Context & Aggregations",
        objective: "Write custom DAX measures modifying filter context with CALCULATE, ALL, FILTER, and ALLEXCEPT.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: true,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m3-day-3",
        dayNumber: 15,
        title: "Day 3: Time Intelligence DAX: YTD, MTD, YoY Growth & Rolling Averages",
        objective: "Implement TOTALYTD, SAMEPERIODLASTYEAR, and 30-day rolling average KPI cards.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: true,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m3-day-4",
        dayNumber: 16,
        title: "Day 4: Interactive Dashboard UX: Drill-Throughs, Slicers & Tooltips",
        objective: "Create drill-through detail pages, customized tooltip pages, and synchronized cross-filtering.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m3-day-5",
        dayNumber: 17,
        title: "Day 5: Tableau Storytelling, Level of Detail (LOD) & Visual Best Practices",
        objective: "Build Tableau FIXED / INCLUDE LOD expressions and structure narrative storyboards for executives.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m3-day-6",
        dayNumber: 18,
        title: "Day 6: Executive BI Capstone: SaaS Revenue & Sales Cockpit",
        objective: "Publish an enterprise-ready dashboard with Row-Level Security, scheduled refresh, and automated alert cards.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
    ],
  },
  {
    num: 4,
    id: "module-4",
    title: "Module 4: Business Process Modeling, Requirements & Agile / Scrum",
    weeks: "Weeks 12-14",
    duration: "18 Days",
    status: "LOCKED",
    iconName: "workflow",
    bgImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
    desc: "Master the core BA skillset: BRD/FRD writing, stakeholder elicitation, BPMN 2.0 workflow diagrams, User Stories, Gherkin acceptance criteria, and Jira / Agile sprint management.",
    keySkills: ["BRD & FRD Authoring", "BPMN 2.0 Process Mapping", "User Stories & Gherkin (BDD)", "Agile Scrum / Jira Sprints", "Gap & Root Cause Analysis (5 Whys, Fishbone)"],
    capstoneTitle: "Fintech Digital Transformation BRD & Process Optimization",
    capstoneDesc: "Author a complete Business Requirements Document with BPMN 2.0 As-Is vs To-Be process maps and Jira backlog ready for dev kickoff.",
    progress: 0,
    days: [
      {
        id: "m4-day-1",
        dayNumber: 19,
        title: "Day 1: Stakeholder Elicitation & BRD / FRD Requirements Architecture",
        objective: "Conduct structured stakeholder interviews, separate business vs functional requirements, and write complete BRDs.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m4-day-2",
        dayNumber: 20,
        title: "Day 2: Business Process Modeling: BPMN 2.0 & As-Is vs To-Be Workflows",
        objective: "Diagram standard BPMN 2.0 process flows with swimlanes, gateway decisions, exception handling, and handoffs.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m4-day-3",
        dayNumber: 21,
        title: "Day 3: User Stories, Acceptance Criteria (Gherkin/BDD) & Epics",
        objective: "Write INVEST-compliant user stories with Given-When-Then acceptance criteria and split epics into sprint-sized increments.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m4-day-4",
        dayNumber: 22,
        title: "Day 4: Agile Scrum Framework, Sprint Ceremonies & Jira Backlog Grooming",
        objective: "Manage product backlogs in Jira, estimate story points (Planning Poker), and participate in Sprint Planning & Retrospectives.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m4-day-5",
        dayNumber: 23,
        title: "Day 5: Gap Analysis, Root Cause Analysis & Risk Matrix Engineering",
        objective: "Execute 5-Whys, Ishikawa Fishbone diagrams, and create probability-impact risk registers for IT initiatives.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m4-day-6",
        dayNumber: 24,
        title: "Day 6: Digital Transformation BRD & Process Optimization Capstone",
        objective: "Package a comprehensive BRD with swimlane diagrams, traceability matrix (RTM), and executive sign-off sheet.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
    ],
  },
  {
    num: 5,
    id: "module-5",
    title: "Module 5: Product & Commercial Analytics, A/B Testing & Unit Economics",
    weeks: "Weeks 15-17",
    duration: "18 Days",
    status: "LOCKED",
    iconName: "trending",
    bgImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    desc: "Drive commercial impact through AARRR growth funnels, customer acquisition cost (CAC), lifetime value (LTV), unit economics, pricing elasticity, and statistical A/B test design.",
    keySkills: ["AARRR Pirate Metrics Funnel", "CAC, LTV & Payback Economics", "A/B Testing & Statistical Significance", "RFM Customer Segmentation", "Pricing Strategy & Elasticity"],
    capstoneTitle: "D2C Growth Strategy, Conversion Funnel & Pricing Optimization",
    capstoneDesc: "Analyze checkout drop-offs, design randomized controlled A/B test experiments, and formulate data-backed pricing recommendations.",
    progress: 0,
    days: [
      {
        id: "m5-day-1",
        dayNumber: 25,
        title: "Day 1: Product Metrics: The AARRR Funnel (Acquisition to Revenue)",
        objective: "Map out conversion funnels, calculate step drop-off ratios, and identify customer activation bottlenecks.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m5-day-2",
        dayNumber: 26,
        title: "Day 2: Unit Economics: CAC, LTV, Gross Margin & Payback Period",
        objective: "Calculate blended vs paid CAC, cohort-based LTV, and evaluate sustainable LTV:CAC ratios (> 3:1).",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m5-day-3",
        dayNumber: 27,
        title: "Day 3: A/B Testing: Hypothesis Testing, Sample Sizing & P-Values",
        objective: "Formulate null/alternative hypotheses, calculate required sample size, and interpret p-values and confidence intervals.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m5-day-4",
        dayNumber: 28,
        title: "Day 4: Pricing Strategies, Elasticity & Monetization Modeling",
        objective: "Model price elasticity of demand, tier-based packaging, and simulate revenue impact under tiered price shifts.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m5-day-5",
        dayNumber: 29,
        title: "Day 5: Customer Segmentation & Recency, Frequency, Monetary (RFM) Analysis",
        objective: "Segment customer databases into Champions, Loyalists, At Risk, and Hibernating tiers with targeted retention playbooks.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m5-day-6",
        dayNumber: 30,
        title: "Day 6: Product Growth & A/B Testing Commercial Capstone",
        objective: "Build an executive commercial strategy proposal combining funnel analytics, A/B test results, and ROI projections.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
    ],
  },
  {
    num: 6,
    id: "module-6",
    title: "Module 6: Business Case Studies & Management Consulting Capstone",
    weeks: "Weeks 18-20",
    duration: "20 Days",
    status: "LOCKED",
    iconName: "briefcase",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    desc: "Solve real-world corporate strategy case studies using McKinsey Pyramid Principle, SWOT, PESTLE, Market Sizing (TAM/SAM/SOM), Cost-Benefit Analysis, and C-Suite presentations.",
    keySkills: ["Strategic Frameworks (SWOT, 5 Forces, BCG)", "Market Sizing (TAM, SAM, SOM)", "Cost-Benefit & ROI Analysis", "McKinsey Pyramid Storytelling", "Executive Stakeholder Interviews"],
    capstoneTitle: "Enterprise Consulting Engagement & Executive Pitch Deck",
    capstoneDesc: "Deliver an end-to-end strategic turnaround plan for a struggling multi-million dollar business with data marts, BRD, and pitch deck.",
    progress: 0,
    days: [
      {
        id: "m6-day-1",
        dayNumber: 31,
        title: "Day 1: Strategic Problem Solving Frameworks (SWOT, Porter's 5 Forces, BCG Matrix)",
        objective: "Evaluate market attractiveness, competitive advantages, and portfolio positioning using top-tier consulting frameworks.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m6-day-2",
        dayNumber: 32,
        title: "Day 2: Market Sizing & Go-to-Market (GTM) Strategy (TAM, SAM, SOM)",
        objective: "Estimate Total Addressable Market top-down and bottom-up, and formulate Go-to-Market expansion roadmaps.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m6-day-3",
        dayNumber: 33,
        title: "Day 3: Cost-Benefit Analysis (CBA), ROI & Capital Allocation Modeling",
        objective: "Quantify tangible and intangible benefits, NPV, payback period, and present high-conviction ROI models.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m6-day-4",
        dayNumber: 34,
        title: "Day 4: Executive Communication & Pyramid Principle Storyboarding",
        objective: "Structure executive proposals lead with key recommendations, backed by MECE structured data arguments.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m6-day-5",
        dayNumber: 35,
        title: "Day 5: Behavioral & Technical Interview Mastery for Business Analysts",
        objective: "Master STAR behavioral responses, guesstimate estimation cases, SQL technical grilling, and stakeholder objection handling.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
      {
        id: "m6-day-6",
        dayNumber: 36,
        title: "Day 6: Final Comprehensive Consulting Capstone & Recruiter Portfolio",
        objective: "Package full portfolio dossier: Excel Financial Model, SQL Data Mart, Power BI Dashboard, BRD, and Executive Presentation.",
        estimatedMins: 240,
        isCompleted: false,
        isUnlocked: false,
        score: null,
        practiceCount: 3,
      },
    ],
  },
];

function getModuleIcon(name: string) {
  switch (name) {
    case "excel":
      return FileSpreadsheet;
    case "database":
      return Database;
    case "code":
      return Code;
    case "network":
      return Network;
    case "chart":
    case "line-chart":
      return LineChart;
    case "file-text":
      return FileText;
    case "sparkles":
      return Sparkles;
    case "brain":
      return Brain;
    case "shield-check":
      return ShieldCheck;
    case "users":
      return Users;
    case "workflow":
      return Workflow;
    case "trending":
    case "trending-up":
      return TrendingUp;
    case "briefcase":
    default:
      return Briefcase;
  }
}

export function RoadmapClient({
  initialTrackTitle,
  initialRole,
  initialModules,
  userProgress,
}: RoadmapClientProps) {
  const modulesList = initialModules && initialModules.length > 0 ? initialModules : BUSINESS_ANALYST_MODULES;
  const [selectedModuleNum, setSelectedModuleNum] = useState<number>(() => {
    if (userProgress?.activeDayNumber) {
      const activeMod = modulesList.find((m) =>
        m.days.some((d) => d.dayNumber === userProgress.activeDayNumber)
      );
      if (activeMod) return activeMod.num;
    }
    return 1;
  });
  const [expandedAll, setExpandedAll] = useState<boolean>(false);

  const activeModule = modulesList.find((m) => m.num === selectedModuleNum) || modulesList[0];
  const ModuleIcon = getModuleIcon(activeModule.iconName);

  const completedDaysCount = activeModule.days.filter((d) => d.isCompleted).length;
  const totalDaysInModule = activeModule.days.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-indigo-600 bg-indigo-50 border-indigo-200 text-[11px] font-bold">
              CAREER TRACK CURRICULUM
            </Badge>
            <span className="text-xs text-muted-foreground">• 120 Days • 6 Comprehensive Modules</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {initialTrackTitle || "Business Analyst (BA) Career Path"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Complete end-to-end curriculum mastering Excel Financial Modeling, SQL Analytics, Power BI Dashboards, BPMN & BRD Requirements Engineering, Product Analytics, and Consulting Case Studies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedAll(!expandedAll)}
            className="text-xs border-border gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{expandedAll ? "Focus Active Module" : "View All 6 Modules"}</span>
          </Button>

          <Link href="/learn">
            <Button size="sm" className="gap-2 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              <PlayCircle className="w-4 h-4" />
              <span>Resume Day {userProgress?.activeDayNumber || 2}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 6-Module Interactive Milestone Selector Cards */}
      <Card className="bg-card border border-border shadow-xs">
        <CardHeader className="py-3.5 px-5 border-b border-border bg-slate-50/50">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-indigo-600" /> All 6 Career Modules (Click any module to inspect syllabus)
            </span>
            <span className="text-indigo-600 font-mono text-[11px] font-bold">
              Module {selectedModuleNum} of 6 Selected
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {modulesList.map((m) => {
              const Icon = getModuleIcon(m.iconName);
              const isSelected = selectedModuleNum === m.num;
              const isCompleted = m.status === "COMPLETED";
              const isInProgress = m.status === "IN_PROGRESS";

              return (
                <button
                  key={m.num}
                  onClick={() => {
                    setSelectedModuleNum(m.num);
                    setExpandedAll(false);
                  }}
                  className={`group relative overflow-hidden p-3.5 rounded-xl text-left transition-all duration-300 flex flex-col justify-between min-h-[145px] shadow-sm hover:shadow-xl cursor-pointer select-none border ${
                    isSelected
                      ? "border-indigo-400 ring-2 ring-indigo-500 shadow-indigo-500/25 scale-[1.02]"
                      : isInProgress
                      ? "border-indigo-500/40 hover:border-indigo-400/80 hover:scale-[1.01]"
                      : "border-white/10 hover:border-white/30 hover:scale-[1.01]"
                  }`}
                >
                  {/* Background Image Layer */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                      src={m.bgImage}
                      alt={m.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110"
                      priority={m.num <= 2}
                    />
                    {/* Dark gradient & color overlay for superb contrast & readability */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        isSelected
                          ? "bg-gradient-to-t from-slate-950 via-slate-950/85 to-indigo-950/60"
                          : isInProgress
                          ? "bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/65 group-hover:from-slate-950/95 group-hover:via-slate-950/75"
                          : "bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/70 group-hover:from-slate-950/95 group-hover:via-slate-950/75"
                      }`}
                    />
                    {/* Inner subtle glow for selected card */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/10 mix-blend-screen pointer-events-none" />
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col justify-between h-full w-full">
                    {/* Top Row: Icon + Module Code */}
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs backdrop-blur-md transition-colors ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/50"
                            : isInProgress
                            ? "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30"
                            : "bg-white/15 text-white/90 border border-white/20 group-hover:bg-white/25"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded backdrop-blur-md bg-black/40 text-slate-300 border border-white/10">
                        MOD 0{m.num}
                      </span>
                    </div>

                    {/* Middle: Title + Duration */}
                    <div className="my-1.5">
                      <span
                        className={`text-xs font-bold leading-snug line-clamp-2 block transition-colors ${
                          isSelected
                            ? "text-white font-black drop-shadow-md"
                            : "text-slate-100 group-hover:text-white drop-shadow-sm"
                        }`}
                      >
                        {m.title.replace(`Module ${m.num}: `, "")}
                      </span>
                      <span className="text-[10px] text-slate-300/80 font-medium block mt-1 drop-shadow-xs">
                        {m.weeks} • {m.days.length} Days
                      </span>
                    </div>

                    {/* Bottom Row: Status Badge & Pulse Indicator */}
                    <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between w-full">
                      <span
                        className={`text-[9px] py-0.5 h-4 font-mono font-bold px-2 rounded-full inline-flex items-center gap-1 backdrop-blur-md transition-all ${
                          isSelected
                            ? "bg-indigo-500 text-white shadow-sm shadow-indigo-500/40"
                            : isInProgress
                            ? "bg-emerald-500/80 text-white border border-emerald-400/40"
                            : "bg-white/15 text-slate-200 border border-white/20 group-hover:bg-white/25"
                        }`}
                      >
                        {isInProgress ? "Active (33%)" : isSelected ? "Viewing" : "Ready"}
                      </span>
                      {isSelected ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ring-4 ring-indigo-400/30" />
                      ) : isInProgress ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Single Focused Module View OR Expanded All View */}
      {expandedAll ? (
        /* Render All 6 Modules Sequentially */
        <div className="space-y-8">
          {modulesList.map((mod) => (
            <ModuleDetailSection key={mod.num} mod={mod} activeDayNumber={userProgress?.activeDayNumber} />
          ))}
        </div>
      ) : (
        /* Render Selected Module Detailed Breakdown */
        <ModuleDetailSection mod={activeModule} isFocused activeDayNumber={userProgress?.activeDayNumber} />
      )}
    </div>
  );
}

function ModuleDetailSection({
  mod,
  isFocused = false,
  activeDayNumber,
}: {
  mod: ModuleItem;
  isFocused?: boolean;
  activeDayNumber?: number;
}) {
  const ModuleIcon = getModuleIcon(mod.iconName);
  const completedDaysCount = mod.days.filter((d) => d.isCompleted).length;
  const totalDaysInModule = mod.days.length;

  return (
    <div className="space-y-5">
      {/* Module Overview Banner */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtle decorative image watermark on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none overflow-hidden opacity-15 hidden sm:block">
          <Image
            src={mod.bgImage}
            alt=""
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent" />
        </div>

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs flex-shrink-0">
            <ModuleIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Module {mod.num} • {mod.weeks}
              </span>
              <span className="text-xs text-muted-foreground">{mod.duration} of Curriculum</span>
            </div>
            <h2 className="text-base font-extrabold text-foreground">{mod.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl leading-relaxed">{mod.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-foreground block">
              {completedDaysCount} / {totalDaysInModule} Days Completed
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {Math.round((completedDaysCount / (totalDaysInModule || 1)) * 100)}% Mastered
            </span>
          </div>
          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${(completedDaysCount / (totalDaysInModule || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Key Skills Tags */}
      <div className="flex items-center flex-wrap gap-1.5 px-1">
        <span className="text-xs font-bold text-muted-foreground mr-1">Skills Taught:</span>
        {mod.keySkills.map((skill, idx) => (
          <span
            key={idx}
            className="text-[11px] font-medium bg-muted/60 text-slate-700 border border-border px-2.5 py-0.5 rounded-md"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Day-by-Day Vertical Roadmap Timeline */}
      <div className="relative pl-6 space-y-3.5 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {mod.days.map((d) => {
          const isCompleted = d.isCompleted;
          const isCurrent = !isCompleted && d.isUnlocked && (activeDayNumber ? d.dayNumber === activeDayNumber : d.dayNumber === 2);
          const isUnlocked = d.isUnlocked;

          return (
            <div key={d.id || d.dayNumber} className="relative group">
              {/* Node Icon */}
              <div
                className={`absolute -left-6 top-3.5 w-6 h-6 rounded-full flex items-center justify-center text-xs -translate-x-1/2 transition-transform ${
                  isCompleted
                    ? "bg-emerald-500 text-white ring-4 ring-background"
                    : isCurrent
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse"
                    : isUnlocked
                    ? "bg-card text-foreground ring-4 ring-background border border-border font-bold text-[10px]"
                    : "bg-muted text-muted-foreground ring-4 ring-background text-[10px]"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <PlayCircle className="w-3.5 h-3.5" />
                ) : (
                  <span>{d.dayNumber}</span>
                )}
              </div>

              {/* Day Card */}
              <Card
                className={`transition-all border ${
                  isCompleted
                    ? "bg-emerald-50/20 border-emerald-200/80 shadow-xs"
                    : isCurrent
                    ? "bg-indigo-50/50 border-indigo-300 shadow-xs ring-1 ring-indigo-500/20"
                    : isUnlocked
                    ? "bg-card border-border hover:border-slate-300 shadow-xs"
                    : "bg-card/40 border-border/60 opacity-60"
                }`}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                        DAY {d.dayNumber < 10 ? `0${d.dayNumber}` : d.dayNumber}
                      </span>
                      {isCompleted && d.score && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono font-bold py-0 h-4">
                          Passed ({d.score}/100)
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-indigo-600 text-white text-[10px] font-bold py-0 h-4 animate-pulse">
                          Current Focus
                        </Badge>
                      )}
                      {!isUnlocked && (
                        <Badge variant="secondary" className="text-[10px] py-0 h-4 text-muted-foreground">
                          Locked
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {Math.round(d.estimatedMins / 60)}h Study Time
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground">{d.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{d.objective}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-medium">
                      <span>• Concept Reading & Cheat Sheet</span>
                      <span>• 3 Hands-on Practice Drills</span>
                      <span>• Graded Assignment with AI Evaluation</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isCompleted ? (
                      <Link href={`/learn/${mod.id}/${d.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-border">
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : isUnlocked ? (
                      <Link href={`/learn/${mod.id}/${d.id}`}>
                        <Button size="sm" className="h-8 text-xs gap-1.5 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                          <span>Start Lesson</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="ghost" size="sm" disabled className="h-8 text-xs gap-1.5 opacity-50">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        {/* Milestone Capstone Project Card */}
        <div className="relative group">
          <div className="absolute -left-6 top-3.5 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs -translate-x-1/2 ring-4 ring-background shadow-xs">
            <Award className="w-3.5 h-3.5" />
          </div>

          <Card className="bg-amber-50/40 border-amber-200/80 shadow-xs">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-bold py-0 h-4 uppercase">
                    Module {mod.num} Capstone Project
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">7 Days Duration • Recruiter Portfolio Deliverable</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{mod.capstoneTitle}</h3>
                <p className="text-xs text-muted-foreground max-w-2xl">{mod.capstoneDesc}</p>
              </div>

              <Link href={`/projects/capstone-${mod.num}`}>
                <Button size="sm" variant="outline" className="border-amber-400 text-amber-800 hover:bg-amber-100 h-8 text-xs font-bold gap-1.5 flex-shrink-0">
                  <span>View Project Specs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
