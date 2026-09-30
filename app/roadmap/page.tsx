import React from "react";
import { db } from "@/lib/db";
import { RoadmapClient, ModuleItem } from "@/components/roadmap/RoadmapClient";

export const dynamic = "force-dynamic";

const MODULE_BG_IMAGES: Record<number, string> = {
  0: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  1: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  2: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
  3: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
  4: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
  5: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  6: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
  7: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
  8: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  9: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
  10: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  11: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  12: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
  13: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  14: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
};

const MODULE_WEEKS: Record<number, string> = {
  0: "Orientation",
  1: "Weeks 1–2",
  2: "Weeks 3–4",
  3: "Weeks 5–6",
  4: "Weeks 7–8",
  5: "Weeks 9–10",
  6: "Weeks 11–12",
  7: "Weeks 13–14",
  8: "Weeks 15–16",
  9: "Weeks 17–18",
  10: "Weeks 19–20",
  11: "Weeks 21–22",
  12: "Weeks 23–24",
  13: "Weeks 25–26",
  14: "Weeks 27–28",
};

const MODULE_KEY_SKILLS: Record<number, string[]> = {
  0: ["XLOOKUP & Dynamic Arrays", "Power Query ETL", "INDEX/MATCH & SUMIFS", "Executive PowerPoint Decks", "Data Hygiene"],
  1: ["Multi-Table Joins & Anti-Joins", "Window Functions (RANK, DENSE_RANK)", "CTEs & Recursive SQL", "Cohort Retention Modeling", "Query Optimization & Indexing"],
  2: ["Kimball Star Schema Modeling", "Grain & Fact/Dimension Design", "Slowly Changing Dimensions (SCD Type 1 & 2)", "Surrogate Keys & Conformed Dims", "OLAP vs OLTP Architectures"],
  3: ["DAX Evaluation Context & CALCULATE", "Time Intelligence (YoY, YTD)", "Row-Level Security (RLS)", "Tabular Semantic Models", "Power BI Executive Storytelling"],
  4: ["Pandas DataFrames & Vectorization", "Data Cleaning & Imputation", "REST APIs & JSON Extraction", "GroupBy & Pivot Reshaping", "Automated ETL Pipelines"],
  5: ["Data Ingestion & Staging", "Incremental Loads & Watermarking", "Data Validation & Quality Checks", "Pipeline Orchestration", "System Webhooks & APIs"],
  6: ["dbt Core Models & Jinja", "Automated Schema Testing (Unique/Not Null)", "Data Lineage & Documentation", "Reusable Analytic SQL", "Git CI/CD Workflows"],
  7: ["AARRR Pirate Funnel Architecture", "CAC & Payback Period Modeling", "Customer Lifetime Value (LTV:CAC)", "Cohort Retention & Churn", "RFM Customer Segmentation"],
  8: ["Power Automate Workflows", "Power Apps Basics", "Automated Anomaly Alerting", "n8n Webhook Pipelines", "Enterprise Incident Workflows"],
  9: ["LLMs for Analytics", "Text-to-SQL Query Copilots", "AI Autonomous Agents", "RAG & Document Embeddings", "Structured JSON Outputs"],
  10: ["Microsoft Fabric Architecture", "Snowflake Virtual Warehouses", "Medallion Lakehouse (Bronze/Silver/Gold)", "Azure Data Factory (ADF)", "Cloud Storage vs Compute"],
  11: ["Data Quality Scorecards & DAMA", "Personally Identifiable Information (PII)", "Dynamic Data Masking", "India DPDP Act 2023 Compliance", "GDPR & Audit Lineage"],
  12: ["Stakeholder Elicitation & Gap Analysis", "BRD & FRD Document Architecture", "BPMN 2.0 Process Swimlanes", "User Stories & Gherkin BDD", "Agile Scrum & Jira Grooming"],
  13: ["Hypothesis Testing & P-Values", "A/B Testing Sample Sizing & Power", "Minimum Detectable Effect (MDE)", "SRM Validity Diagnostics", "Unit Economics Forecasting"],
  14: ["McKinsey Minto Pyramid Principle", "Live SQL Coding Rounds Grilling", "Power BI / DAX Architecture Defense", "Consulting Case Study Teardowns", "ATS-Optimized 12 LPA Portfolio"],
};

export default async function RoadmapPage() {
  const [user, track, dbModules] = await Promise.all([
    db.userProfile.findFirst().catch(() => null),
    db.track.findFirst().catch(() => null),
    db.module.findMany({
      include: {
        weeks: {
          include: {
            days: {
              include: {
                practice: true,
                assignments: {
                  include: {
                    submissions: {
                      include: { evaluation: true },
                      orderBy: { createdAt: "desc" },
                      take: 1,
                    },
                  },
                },
              },
              orderBy: { dayNumber: "asc" },
            },
          },
          orderBy: { weekNumber: "asc" },
        },
        projects: {
          include: {
            milestones: true,
            submissions: {
              include: { evaluation: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  let activeDay = user?.activeDayId
    ? await db.day.findUnique({ where: { id: user.activeDayId } }).catch(() => null)
    : null;

  if (!activeDay) {
    activeDay = await db.day
      .findFirst({
        where: { isCompleted: false, isUnlocked: true },
        orderBy: { dayNumber: "asc" },
      })
      .catch(() => null);
  }

  const modules: ModuleItem[] = dbModules.map((m) => {
    // Flatten days across weeks in this module
    const allDays = m.weeks.flatMap((w) => w.days);
    const completedDays = allDays.filter((d) => d.isCompleted);
    const progress = allDays.length > 0 ? Math.round((completedDays.length / allDays.length) * 100) : 0;

    let status: "COMPLETED" | "IN_PROGRESS" | "UNLOCKED" | "LOCKED" = "LOCKED";
    if (progress === 100) {
      status = "COMPLETED";
    } else if (completedDays.length > 0) {
      status = "IN_PROGRESS";
    } else if (allDays.some((d) => d.isUnlocked)) {
      status = "UNLOCKED";
    } else if (m.order === 0 || m.order === 1) {
      status = "UNLOCKED";
    }

    const firstProject = m.projects[0];

    return {
      num: m.order,
      id: m.id,
      title: m.title,
      weeks: MODULE_WEEKS[m.order] || `Module ${m.order}`,
      duration: `${allDays.length} Days`,
      status,
      iconName: m.icon,
      bgImage: MODULE_BG_IMAGES[m.order] || MODULE_BG_IMAGES[1],
      desc: m.description,
      keySkills: MODULE_KEY_SKILLS[m.order] || ["Core Competencies", "Analytical Methods", "Executive Presentation"],
      capstoneTitle: firstProject?.title || `${m.title} Capstone`,
      capstoneDesc: firstProject?.businessBrief || "Deliver a comprehensive industry capstone deliverable.",
      progress,
      days: allDays.map((d) => {
        const lastSub = d.assignments?.[0]?.submissions?.[0];
        const evaluatedScore = lastSub?.evaluation?.score ?? null;
        return {
          id: d.id,
          dayNumber: d.dayNumber,
          title: d.title,
          objective: d.objective,
          estimatedMins: d.estimatedMins,
          isCompleted: d.isCompleted,
          isUnlocked: d.isUnlocked,
          score: d.score ?? evaluatedScore,
          practiceCount: d.practice.length,
        };
      }),
    };
  });

  return (
    <RoadmapClient
      initialTrackTitle={track?.title || "Data Analyst & Analytics Engineering (12 LPA GCC Track)"}
      initialRole={user?.targetRole || "Analytics Engineer / BI Engineer"}
      initialModules={modules}
      userProgress={{
        xp: user?.xp || 0,
        level: user?.level || 1,
        activeDayNumber: activeDay?.dayNumber || 1,
        activeDayId: activeDay?.id || "day-1",
      }}
    />
  );
}
