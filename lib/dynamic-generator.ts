import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai";
import { detectWeakTopics } from "@/lib/adaptive";

export type AssignmentModality =
  | "SQL"
  | "PYTHON"
  | "API"
  | "POWER_BI"
  | "BRD"
  | "PROMPT_ENG"
  | "AI_PRD"
  | "COMPLIANCE"
  | "CHANGE_MGMT"
  | "PRODUCT_ANALYTICS"
  | "CONSULTING_CASE";

/**
 * Maps each module order (1-11) to its primary technical and business modality.
 */
export function getModuleModality(moduleOrder: number): AssignmentModality {
  switch (moduleOrder) {
    case 1:
      return "SQL";
    case 2:
      return "PYTHON";
    case 3:
      return "API";
    case 4:
      return "POWER_BI";
    case 5:
      return "BRD";
    case 6:
      return "PROMPT_ENG";
    case 7:
      return "AI_PRD";
    case 8:
      return "COMPLIANCE";
    case 9:
      return "CHANGE_MGMT";
    case 10:
      return "PRODUCT_ANALYTICS";
    case 11:
      return "CONSULTING_CASE";
    default:
      return "SQL";
  }
}

const COMPANY_CONTEXTS = [
  "Swiggy (Hyperlocal Food Delivery & Logistics)",
  "Zepto (10-Minute Instant Quick Commerce)",
  "Razorpay (FinTech Payment Gateway & Merchant Banking)",
  "Netflix (Subscription Streaming & User Engagement)",
  "Uber (Dynamic Real-Time Mobility & Ride Dispatch)",
  "Zomato (Restaurant Aggregator & Blinkit Dark Store Logistics)",
  "Cred (FinTech Credit Card Rewards & High-Trust Cohorts)",
  "McKinsey & Company (Global C-Suite Strategy Practice)",
  "Bain & Company (Digital Transformation Advisory)",
  "Flipkart (Enterprise E-Commerce Logistics & Festive Sales)",
];

/**
 * Retrieves an existing assignment for a day, or dynamically synthesizes a fresh,
 * adaptive assignment using Gemini 2.5 Flash tailored to the learner's profile.
 */
export async function getOrGenerateAssignment(
  dayId: string,
  userId: string = "user_default",
  options?: { forceRegenerate?: boolean; difficulty?: "standard" | "hard" }
) {
  // 1. Fetch Day with Week and Module context
  let day = await db.day.findUnique({
    where: { id: dayId },
    include: {
      lesson: true,
      week: {
        include: {
          module: true,
        },
      },
      assignments: {
        include: {
          questions: true,
          submissions: {
            include: { evaluation: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  // Fallback by dayNumber if dayId is numeric or slug
  if (!day) {
    const match = dayId.match(/\d+/);
    const dayNum = match ? parseInt(match[0], 10) : 1;
    day = await db.day.findFirst({
      where: { dayNumber: dayNum },
      include: {
        lesson: true,
        week: {
          include: {
            module: true,
          },
        },
        assignments: {
          include: {
            questions: true,
            submissions: {
              include: { evaluation: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    });
  }

  if (!day) {
    throw new Error(`Day not found: ${dayId}`);
  }

  // If assignment already exists and forceRegenerate is not requested, return it
  if (
    day.assignments &&
    day.assignments.length > 0 &&
    !options?.forceRegenerate
  ) {
    return day.assignments[0];
  }

  // 2. Determine learner context & weak areas
  const user = await db.userProfile.findFirst();
  let weakTopicsList: string[] = [];
  try {
    const topics = await detectWeakTopics(user?.id || userId);
    weakTopicsList = topics
      .filter((t) => t.status === "Needs Practice")
      .map((t) => t.topic);
  } catch {}

  const moduleOrder = day.week?.module?.order || 1;
  const moduleTitle = day.week?.module?.title || "Data Analytics";
  const modality = getModuleModality(moduleOrder);
  const randomCompany =
    COMPANY_CONTEXTS[(day.dayNumber - 1) % COMPANY_CONTEXTS.length];
  const difficulty = options?.difficulty || "standard";

  const systemPrompt = `You are a Principal Technical & Strategic Business Analyst Instructor at a top-tier 12 LPA tech bootcamp.
Synthesize an authentic, highly realistic industry assignment for a student based on today's learning objective.
Return ONLY valid JSON matching this exact schema:
{
  "title": string (e.g. "Zepto Peak Delivery Surge Attribution & Margin Modeling"),
  "company": string,
  "description": string (Executive summary of the business situation in 2-3 sentences),
  "prompt": string (Comprehensive assignment mission with business context, explicit technical requirements, acceptance criteria, and edge cases),
  "starterCode": string (Starter template appropriate for the modality: SQL query template, Python snippet, JSON/cURL contract, DAX measure block, or structured Markdown BRD template),
  "rubric": {
    "correctness": number (e.g. 40),
    "edgeCases": number (e.g. 25),
    "performance": number (e.g. 20),
    "executiveTranslation": number (e.g. 15)
  },
  "adaptiveReason": string (1-2 sentences explaining why this mission was tailored to their growth goals)
}`;

  const userPrompt = `
Generate a Day ${day.dayNumber} Assignment for:
- Module: ${moduleTitle}
- Day Title: ${day.title}
- Core Learning Objective: ${day.objective}
- Modality: ${modality}
- Company Context: ${randomCompany}
- Difficulty: ${difficulty === "hard" ? "12 LPA Top-Tier Hard Mode (Complex edge cases, non-trivial constraints)" : "12 LPA Standard Benchmark"}
- Student Target Role: ${user?.targetRole || "Business Analyst & Analytics Engineer"}
- Student Prior Weak Areas to Reinforce: ${weakTopicsList.length > 0 ? weakTopicsList.join(", ") : "Core Architectural Rigor and Defensive Logic"}

Ensure the mission feels like a REAL task assigned by a VP of Engineering, Chief Product Officer, or McKinsey Engagement Manager.`;

  let parsed: any = null;
  try {
    const aiResponse = await callGemini(userPrompt, systemPrompt, true);
    parsed = JSON.parse(aiResponse);
  } catch (err) {
    console.warn("AI dynamic assignment generation fallback:", err);
    // Deterministic fallback if offline
    parsed = {
      title: `Industry Mission: ${day.title.replace(/^Day \d+:\s*/, "")}`,
      company: randomCompany,
      description: `Production industry benchmark for ${day.title}. Solve the core analytical and business requirements under tier-1 company constraints.`,
      prompt: `You are leading an analytics initiative at ${randomCompany}.\n\n### Objective:\n${day.objective}\n\n### Business Scenario:\nDue to rapid scaling, our leadership team requires a production-grade deliverable addressing ${day.title}. Ensure your solution is mathematically sound, reproducible, and accounts for missing values and edge cases.`,
      starterCode:
        modality === "SQL"
          ? `-- Day ${day.dayNumber}: ${day.title}\n-- Target: ${randomCompany}\nSELECT * FROM orders LIMIT 10;`
          : modality === "PYTHON"
          ? `# Day ${day.dayNumber}: Python Pipeline\nimport pandas as pd\n\ndef run_pipeline():\n    pass`
          : modality === "API"
          ? `// REST API Payload Contract for ${randomCompany}\n{\n  "endpoint": "/api/v1/resource",\n  "method": "POST"\n}`
          : modality === "POWER_BI"
          ? `// DAX Measure Blueprint\nTotal Metric = SUM(FactSales[amount])`
          : `# Business Requirements Document (BRD)\n## Executive Summary\n\n## In-Scope vs Out-of-Scope\n\n## Acceptance Criteria (Gherkin BDD)`,
      rubric: {
        correctness: 40,
        edgeCases: 25,
        performance: 20,
        executiveTranslation: 15,
      },
      adaptiveReason: `Dynamically generated 12 LPA benchmark mission targeting ${day.title} at ${randomCompany}.`,
    };
  }

  // 3. Persist into Database
  let targetAssignment: any = day.assignments?.[0];

  if (!targetAssignment) {
    targetAssignment = await db.assignment.create({
      data: {
        dayId: day.id,
        title: parsed.title || `Graded Mission: Day ${day.dayNumber}`,
        type: modality,
        description: parsed.description || "12 LPA Graded Industry Mission",
        deadlineHours: 24,
        rubric: JSON.stringify(parsed.rubric || { correctness: 40, edgeCases: 25, performance: 20, executiveTranslation: 15 }),
      },
      include: {
        questions: true,
        day: { include: { week: true } },
        submissions: { include: { evaluation: true } },
      },
    });

    await db.assignmentQuestion.create({
      data: {
        assignmentId: targetAssignment.id,
        order: 1,
        category: modality,
        prompt: parsed.prompt,
        starterCode: parsed.starterCode,
        sampleData: JSON.stringify({
          company: parsed.company || randomCompany,
          tables: ["customers", "orders", "order_items", "products", "employees"],
        }),
        weight: 100,
        isAdaptive: true,
        adaptiveReason: parsed.adaptiveReason,
      },
    });
  } else {
    // Update existing assignment with fresh AI generation
    await db.assignment.update({
      where: { id: targetAssignment.id },
      data: {
        title: parsed.title,
        type: modality,
        description: parsed.description,
        rubric: JSON.stringify(parsed.rubric),
      },
    });

    const question = targetAssignment.questions?.[0];
    if (question) {
      await db.assignmentQuestion.update({
        where: { id: question.id },
        data: {
          category: modality,
          prompt: parsed.prompt,
          starterCode: parsed.starterCode,
          isAdaptive: true,
          adaptiveReason: parsed.adaptiveReason,
        },
      });
    } else {
      await db.assignmentQuestion.create({
        data: {
          assignmentId: targetAssignment.id,
          order: 1,
          category: modality,
          prompt: parsed.prompt,
          starterCode: parsed.starterCode,
          sampleData: JSON.stringify({ company: parsed.company || randomCompany }),
          weight: 100,
          isAdaptive: true,
          adaptiveReason: parsed.adaptiveReason,
        },
      });
    }
  }

  // Reload fresh assignment
  const freshAssignment = await db.assignment.findUnique({
    where: { id: targetAssignment.id },
    include: {
      questions: true,
      day: {
        include: {
          week: true,
        },
      },
      submissions: {
        include: { evaluation: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return freshAssignment!;
}

/**
 * Dynamically synthesizes a comprehensive 7-Day Capstone Project & 7 Milestones
 * for a completed module, tailored to the learner's demonstrated strengths and weaknesses.
 */
export async function getOrGenerateCapstone(
  moduleId: string,
  userId: string = "user_default"
) {
  const moduleRecord = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      projects: {
        include: {
          milestones: { orderBy: { dayNumber: "asc" } },
          submissions: { include: { evaluation: true }, take: 1 },
        },
      },
      weeks: {
        include: {
          days: {
            include: {
              assignments: {
                include: {
                  submissions: {
                    include: { evaluation: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!moduleRecord) {
    throw new Error(`Module not found: ${moduleId}`);
  }

  // If project exists with 7 milestones, return it
  if (
    moduleRecord.projects &&
    moduleRecord.projects.length > 0 &&
    moduleRecord.projects[0].milestones.length === 7
  ) {
    return moduleRecord.projects[0];
  }

  const user = await db.userProfile.findFirst();
  const modality = getModuleModality(moduleRecord.order);

  const systemPrompt = `You are a Chief Technology Officer and Hiring Director evaluating portfolio deliverables for a ₹12,00,000+ PA career track.
Synthesize a comprehensive 7-Day Capstone Project for a module.
Return ONLY valid JSON matching this exact schema:
{
  "title": string,
  "businessBrief": string (Detailed enterprise scenario with problem statement, business stakes, and target deliverables),
  "milestones": [
    {
      "dayNumber": 1,
      "title": string,
      "deliverable": string
    },
    ... (total 7 milestones for Days 1 through 7)
  ]
}`;

  const userPrompt = `
Generate an enterprise Capstone Project for:
- Module ${moduleRecord.order}: ${moduleRecord.title}
- Modality: ${modality}
- Learner Target Role: ${user?.targetRole || "Business Analyst & Analytics Engineer"}
- Target Salary Benchmark: 12 LPA+ Tier-1 Product & Consulting Standards

Milestone Structure:
- Day 1: Problem Definition, Stakeholder Elicitation & BRD/Architecture Blueprint
- Day 2: Data Discovery, Ingestion & Schema Pipeline
- Day 3: Core Analytical Modeling / System Specification
- Day 4: Deep Optimization, Validation & Edge-Case Guardrails
- Day 5: Visualization, Executive Dashboarding or Integration Testing
- Day 6: User Acceptance Testing (UAT) & Change Management Strategy
- Day 7: Final C-Suite Executive Presentation Deck & GitHub Portfolio Release`;

  let parsed: any = null;
  try {
    const aiResponse = await callGemini(userPrompt, systemPrompt, true);
    parsed = JSON.parse(aiResponse);
  } catch (err) {
    console.warn("AI dynamic capstone fallback:", err);
    parsed = {
      title: `${moduleRecord.title} 12 LPA Enterprise Capstone`,
      businessBrief: `Deliver an end-to-end industry portfolio deliverable addressing ${moduleRecord.title} under real-world company constraints.`,
      milestones: [
        { dayNumber: 1, title: "Milestone 1: Business Context & Technical Blueprint", deliverable: "Submit architectural overview and requirements scope document." },
        { dayNumber: 2, title: "Milestone 2: Data Schema & Ingestion Framework", deliverable: "Set up data sources, validation rules, and schema structures." },
        { dayNumber: 3, title: "Milestone 3: Core Analytical & System Implementation", deliverable: "Implement core business algorithms and data models." },
        { dayNumber: 4, title: "Milestone 4: Edge-Case Handling & Performance Optimization", deliverable: "Benchmark execution times and eliminate data bottlenecks." },
        { dayNumber: 5, title: "Milestone 5: Executive Reporting & Metrics Dashboard", deliverable: "Build interactive visual reports and KPI cards." },
        { dayNumber: 6, title: "Milestone 6: UAT Test Suite & User Documentation", deliverable: "Run comprehensive acceptance test cases and document user SOPs." },
        { dayNumber: 7, title: "Milestone 7: Executive Deck & Portfolio Defense", deliverable: "Publish complete reproducible GitHub repository and 10-slide C-suite presentation." },
      ],
    };
  }

  // Create Project in Database
  let project: any = moduleRecord.projects?.[0];
  if (!project) {
    project = await db.project.create({
      data: {
        moduleId: moduleRecord.id,
        title: parsed.title,
        businessBrief: parsed.businessBrief,
        durationDays: 7,
      },
      include: { milestones: true, submissions: { include: { evaluation: true } } },
    });
  } else {
    await db.project.update({
      where: { id: project.id },
      data: {
        title: parsed.title,
        businessBrief: parsed.businessBrief,
      },
    });
    await db.projectMilestone.deleteMany({ where: { projectId: project.id } });
  }

  // Create 7 Milestones
  for (const m of parsed.milestones || []) {
    await db.projectMilestone.create({
      data: {
        projectId: project.id,
        dayNumber: m.dayNumber,
        title: m.title,
        deliverable: m.deliverable,
        isCompleted: false,
      },
    });
  }

  return await db.project.findUnique({
    where: { id: project.id },
    include: {
      milestones: { orderBy: { dayNumber: "asc" } },
      submissions: { include: { evaluation: true }, take: 1 },
    },
  });
}
