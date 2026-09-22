import React from "react";
import { db } from "@/lib/db";
import { RoadmapClient, ModuleItem } from "@/components/roadmap/RoadmapClient";

export const dynamic = "force-dynamic";

const MODULE_BG_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  2: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
  3: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
  4: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
  5: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
  6: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  7: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
  8: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
  9: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  10: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
  11: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
};

const MODULE_WEEKS: Record<number, string> = {
  1: "Weeks 1–3",
  2: "Weeks 4–6",
  3: "Weeks 7–8",
  4: "Weeks 9–11",
  5: "Weeks 12–14",
  6: "Weeks 15–16",
  7: "Weeks 17–18",
  8: "Weeks 19–20",
  9: "Weeks 21–22",
  10: "Weeks 23–25",
  11: "Weeks 26–28",
};

const MODULE_KEY_SKILLS: Record<number, string[]> = {
  1: ["Multi-Table Joins & Anti-Joins", "Window Functions (RANK, DENSE_RANK)", "CTEs & Recursive SQL", "Cohort Retention Modeling", "Query Optimization & Indexing"],
  2: ["Pandas DataFrames & Vectorization", "Data Cleaning & Imputation", "GroupBy & Pivot Reshaping", "Multi-Source Reconciliations", "Automated ETL Pipelines"],
  3: ["Client-Server 3-Tier Architecture", "RESTful API Conventions", "JSON Schema Data Contracts", "Postman & cURL Testing", "Mermaid Relational ERDs"],
  4: ["Kimball Star Schema Modeling", "DAX Evaluation Context & CALCULATE", "Time Intelligence (YoY, YTD)", "Semi-Additive Balances", "Power BI Executive Storytelling"],
  5: ["Stakeholder Elicitation & Gap Analysis", "BRD & FRD Document Architecture", "BPMN 2.0 Process Swimlanes", "User Stories & Gherkin BDD", "Agile Scrum & Jira Grooming"],
  6: ["Prompt Engineering (Few-Shot & Personas)", "Meeting Transcript Synthesis", "AI User Story & Gherkin Generation", "Reverse-Engineering Legacy Code", "Automated Traceability Matrix (RTM)"],
  7: ["Supervised vs Unsupervised ML", "Confusion Matrix & ROC-AUC ROI", "Problem Formulation Canvas", "LLM Architectures & RAG", "GenAI PRD & Token Cost Modeling"],
  8: ["Data Quality Scorecards & DAMA", "PII Discovery & Dynamic Masking", "India DPDP Act 2023 Compliance", "GDPR, CCPA & Cross-Border Flows", "EU AI Act & Ethical Bias Auditing"],
  9: ["Prosci ADKAR Adoption Model", "Stakeholder Power-Interest Matrix", "Executive Resistance Overcoming", "Strategic Communication Cascades", "Value Realization Dashboards"],
  10: ["AARRR Pirate Funnel Architecture", "CAC & Payback Period Modeling", "Customer Lifetime Value (LTV:CAC)", "A/B Testing Hypothesis & Power", "Z-Tests, P-Values & RFM Segmentation"],
  11: ["McKinsey Minto Pyramid Principle", "TAM / SAM / SOM Market Sizing", "Profitability Issue Trees & Fishbone", "Boardroom C-Suite Storyboarding", "Socratic 12 LPA Interview Grilling"],
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
    } else if (m.order === 1) {
      status = "UNLOCKED";
    }

    const firstProject = m.projects[0];

    return {
      num: m.order,
      id: m.id,
      title: m.title,
      weeks: MODULE_WEEKS[m.order] || `Weeks ${(m.order - 1) * 3 + 1}–${m.order * 3}`,
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
      initialTrackTitle={track?.title || "Business Analyst (BA) Career Track"}
      initialRole={user?.targetRole || "Business Analyst"}
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
