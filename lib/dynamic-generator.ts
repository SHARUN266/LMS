import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai";
import { detectWeakTopics } from "@/lib/adaptive";

export type AssignmentModality =
  | "SQL"
  | "PYTHON"
  | "EXCEL"
  | "POWER_BI"
  | "BRD"
  | "PROMPT_ENG"
  | "COMPLIANCE"
  | "PRODUCT_ANALYTICS"
  | "CONSULTING_CASE"
  | "DBT_GIT"
  | "CLOUD_ARCHITECTURE"
  | "AUTOMATION"
  | "STATISTICS"
  | "INTERVIEW_PREP";

/**
 * Submission types a learner can provide back to the platform.
 */
export type SubmissionType =
  | "CODE_EDITOR"       // Monaco in-platform (SQL, DAX text, prompts, docs)
  | "FILE_UPLOAD"       // .xlsx, .pbix, .ipynb, .pdf, .zip
  | "URL_LINK"          // GitHub repo, Colab notebook, Power BI published dashboard
  | "SCREENSHOT"        // Image proof of external tool work
  | "TEXT_SUMMARY";     // Architectural/methodology explanation

/**
 * Tool guidance metadata for each modality — drives the 5 clarity blocks in the UI.
 */
export interface ToolGuidance {
  primaryTool: string;
  toolIcon: string;
  toolColor: string;
  worksInPlatform: boolean;
  externalToolUrl?: string;
  externalToolSetup?: string;
  submissionTypes: SubmissionType[];
  evaluationMethod: string;
  mandatoryFields: string[];    // What MUST be provided to submit
  skillCategory: string;
}

/**
 * Maps each curriculum module order (0-14) to its correct primary modality.
 * MUST match the actual curriculum in curriculum-data.mjs.
 */
export function getModuleModality(moduleOrder: number): AssignmentModality {
  switch (moduleOrder) {
    case 0:  return "EXCEL";                // Module 0: Excel + Business Productivity
    case 1:  return "SQL";                  // Module 1: Production SQL & Analytical Problem Solving
    case 2:  return "SQL";                  // Module 2: Data Modeling & Data Warehousing (DDL + diagrams)
    case 3:  return "POWER_BI";             // Module 3: Enterprise Power BI + Advanced DAX
    case 4:  return "PYTHON";               // Module 4: Python for Analytics & Automation
    case 5:  return "PYTHON";               // Module 5: ETL/ELT & Data Pipelines (Python-based)
    case 6:  return "DBT_GIT";              // Module 6: Analytics Engineering with dbt
    case 7:  return "PRODUCT_ANALYTICS";    // Module 7: Business & Product Analytics (SQL + Presentation)
    case 8:  return "AUTOMATION";           // Module 8: Power Platform & Workflow Automation
    case 9:  return "PROMPT_ENG";           // Module 9: AI for Analytics (Prompts + Python)
    case 10: return "CLOUD_ARCHITECTURE";   // Module 10: Cloud & Modern Data Platforms
    case 11: return "COMPLIANCE";           // Module 11: Data Governance, Quality & Security
    case 12: return "BRD";                  // Module 12: Business Analysis & Stakeholder Engineering
    case 13: return "STATISTICS";           // Module 13: Statistics, Experimentation & Commercial Analytics
    case 14: return "INTERVIEW_PREP";       // Module 14: Big 4 Interview + Case Study + Job Engine
    default: return "SQL";
  }
}

/**
 * Returns tool guidance for a given modality — tells the UI what tool learner should use,
 * what they must submit, and how evaluation works. This powers the 5 clarity blocks.
 */
export function getToolGuidance(modality: AssignmentModality): ToolGuidance {
  switch (modality) {
    case "SQL":
      return {
        primaryTool: "Platform SQL Sandbox",
        toolIcon: "database",
        toolColor: "indigo",
        worksInPlatform: true,
        submissionTypes: ["CODE_EDITOR", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: SQL execution against sandbox + reference output comparison + AI rubric scoring",
        mandatoryFields: ["code"],
        skillCategory: "SQL & Data Analysis",
      };
    case "EXCEL":
      return {
        primaryTool: "Microsoft Excel / Google Sheets",
        toolIcon: "table",
        toolColor: "emerald",
        worksInPlatform: false,
        externalToolUrl: "https://docs.google.com/spreadsheets",
        externalToolSetup: "Open Microsoft Excel or Google Sheets. Download the data template if provided, build your model, then upload the completed file.",
        submissionTypes: ["FILE_UPLOAD", "SCREENSHOT", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: File uploaded + structure check • AI: Explanation quality review • Self-check: Dashboard rubric",
        mandatoryFields: ["file", "screenshot", "explanation"],
        skillCategory: "Excel & Business Productivity",
      };
    case "POWER_BI":
      return {
        primaryTool: "Power BI Desktop (Free Download)",
        toolIcon: "bar-chart-3",
        toolColor: "amber",
        worksInPlatform: false,
        externalToolUrl: "https://powerbi.microsoft.com/desktop/",
        externalToolSetup: "Download Power BI Desktop (free) from Microsoft. Build your data model and dashboard, then submit your DAX measures, published URL, and dashboard screenshots.",
        submissionTypes: ["CODE_EDITOR", "URL_LINK", "SCREENSHOT", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: DAX syntax validation + URL domain check • AI: Measure logic + explanation review • Self-check: Dashboard design rubric",
        mandatoryFields: ["code", "screenshot", "explanation"],
        skillCategory: "Power BI & DAX",
      };
    case "PYTHON":
      return {
        primaryTool: "Jupyter Notebook / Google Colab (Free)",
        toolIcon: "code",
        toolColor: "blue",
        worksInPlatform: false,
        externalToolUrl: "https://colab.research.google.com/",
        externalToolSetup: "Open Google Colab (free, no install needed) or run Jupyter locally. Write and execute your pipeline, then submit the notebook link or file.",
        submissionTypes: ["URL_LINK", "FILE_UPLOAD", "CODE_EDITOR", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: Notebook/link submitted + code structure analysis • AI: Pipeline logic + code quality review",
        mandatoryFields: ["notebook_or_link", "explanation"],
        skillCategory: "Python & Data Engineering",
      };
    case "DBT_GIT":
      return {
        primaryTool: "VS Code + dbt CLI + GitHub",
        toolIcon: "git-branch",
        toolColor: "purple",
        worksInPlatform: false,
        externalToolUrl: "https://github.com/new",
        externalToolSetup: "Install dbt-core locally, create a GitHub repository, build your dbt project in VS Code, and push to GitHub.",
        submissionTypes: ["URL_LINK", "SCREENSHOT", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: GitHub repo exists + README check + folder structure check • AI: Architecture + model quality review",
        mandatoryFields: ["github_url", "explanation"],
        skillCategory: "Analytics Engineering & dbt",
      };
    case "AUTOMATION":
      return {
        primaryTool: "Power Automate / n8n",
        toolIcon: "workflow",
        toolColor: "orange",
        worksInPlatform: false,
        externalToolUrl: "https://make.powerautomate.com/",
        externalToolSetup: "Sign in to Power Automate (free Microsoft account) or use n8n. Build your automation flow, take screenshots of the completed workflow.",
        submissionTypes: ["SCREENSHOT", "URL_LINK", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: Screenshots uploaded + URL check • AI: Workflow design + explanation review",
        mandatoryFields: ["screenshot", "explanation"],
        skillCategory: "Workflow Automation",
      };
    case "CLOUD_ARCHITECTURE":
      return {
        primaryTool: "Cloud Console (Snowflake / Azure Free Trial)",
        toolIcon: "cloud",
        toolColor: "cyan",
        worksInPlatform: false,
        externalToolUrl: "https://signup.snowflake.com/",
        externalToolSetup: "Sign up for Snowflake free trial (30 days, no credit card). Complete the architecture tasks and capture screenshots of your work.",
        submissionTypes: ["SCREENSHOT", "FILE_UPLOAD", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: Evidence uploaded • AI: Architecture document + explanation review",
        mandatoryFields: ["screenshot_or_file", "explanation"],
        skillCategory: "Cloud Data Platforms",
      };
    case "COMPLIANCE":
      return {
        primaryTool: "Platform SQL Sandbox + Document Editor",
        toolIcon: "shield-check",
        toolColor: "red",
        worksInPlatform: true,
        submissionTypes: ["CODE_EDITOR", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: SQL masking queries executed • AI: Compliance document + policy review",
        mandatoryFields: ["code", "explanation"],
        skillCategory: "Data Governance & Security",
      };
    case "BRD":
      return {
        primaryTool: "Platform Editor + Google Docs / draw.io",
        toolIcon: "file-text",
        toolColor: "slate",
        worksInPlatform: true,
        externalToolUrl: "https://app.diagrams.net/",
        externalToolSetup: "Write your BRD/FRD in the platform editor. For BPMN diagrams, use draw.io (free) and upload the diagram as a screenshot.",
        submissionTypes: ["CODE_EDITOR", "SCREENSHOT", "FILE_UPLOAD", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: Document structure check (headings, sections, length) • AI: Content quality + framework usage review",
        mandatoryFields: ["document", "explanation"],
        skillCategory: "Business Analysis",
      };
    case "PRODUCT_ANALYTICS":
      return {
        primaryTool: "Platform SQL Sandbox + Presentation Tool",
        toolIcon: "trending-up",
        toolColor: "violet",
        worksInPlatform: true,
        submissionTypes: ["CODE_EDITOR", "FILE_UPLOAD", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: SQL execution + result validation • AI: Analysis depth + business insight review",
        mandatoryFields: ["code", "explanation"],
        skillCategory: "Product & Business Analytics",
      };
    case "PROMPT_ENG":
      return {
        primaryTool: "Platform Editor + Jupyter / Google Colab",
        toolIcon: "sparkles",
        toolColor: "pink",
        worksInPlatform: true,
        externalToolUrl: "https://colab.research.google.com/",
        externalToolSetup: "Design prompts in the platform editor. For RAG or API-calling tasks, use Google Colab to test.",
        submissionTypes: ["CODE_EDITOR", "URL_LINK", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: Prompt structure check • AI: Prompt quality + output review",
        mandatoryFields: ["code", "explanation"],
        skillCategory: "AI & Prompt Engineering",
      };
    case "STATISTICS":
      return {
        primaryTool: "Jupyter / Google Colab + Excel",
        toolIcon: "calculator",
        toolColor: "teal",
        worksInPlatform: false,
        externalToolUrl: "https://colab.research.google.com/",
        externalToolSetup: "Use Google Colab (free) or Jupyter to run statistical computations. Submit your notebook and explain your methodology.",
        submissionTypes: ["URL_LINK", "FILE_UPLOAD", "CODE_EDITOR", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: Notebook/link submitted + structure check • AI: Statistical methodology + conclusion review",
        mandatoryFields: ["notebook_or_link", "explanation"],
        skillCategory: "Statistics & Experimentation",
      };
    case "INTERVIEW_PREP":
      return {
        primaryTool: "Platform SQL + Google Docs + GitHub",
        toolIcon: "briefcase",
        toolColor: "amber",
        worksInPlatform: true,
        submissionTypes: ["CODE_EDITOR", "URL_LINK", "FILE_UPLOAD", "TEXT_SUMMARY"],
        evaluationMethod: "Auto: SQL execution • AI: Resume review + case answer quality + portfolio completeness",
        mandatoryFields: ["code_or_file", "explanation"],
        skillCategory: "Interview & Career Readiness",
      };
    default:
      return {
        primaryTool: "Platform SQL Sandbox",
        toolIcon: "database",
        toolColor: "indigo",
        worksInPlatform: true,
        submissionTypes: ["CODE_EDITOR"],
        evaluationMethod: "Auto: SQL execution + AI rubric",
        mandatoryFields: ["code"],
        skillCategory: "Data Analytics",
      };
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
  "referenceSolution": string (The ideal gold-standard solution query, script, or model implementation that achieves a 100% score),
  "skillsTested": string[] (Array of 3-4 specific analytical/technical competencies tested, e.g. ["XLOOKUP", "FILTER", "Dynamic Arrays"]),
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
          : modality === "EXCEL"
          ? `/* Day ${day.dayNumber} Excel Graded Mission */\n// Formula 1: =XLOOKUP(Target_Cell, Lookup_Range, Return_Range, "Not Found")\n// Formula 2: =FILTER(Orders_Range, Condition_Range="Criteria")`
          : modality === "POWER_BI"
          ? `// DAX Measure Blueprint\nTotal Metric = SUM(FactSales[amount])`
          : `# Business Requirements Document (BRD)\n## Executive Summary\n\n## In-Scope vs Out-of-Scope\n\n## Acceptance Criteria (Gherkin BDD)`,
      referenceSolution:
        modality === "SQL"
          ? `SELECT c.city, COUNT(DISTINCT o.id) AS total_orders, ROUND(SUM(o.total_amount), 2) AS total_revenue\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.status = 'COMPLETED'\nGROUP BY c.city\nHAVING COUNT(DISTINCT o.id) > 0\nORDER BY total_revenue DESC;`
          : modality === "PYTHON"
          ? `import pandas as pd\n\ndef run_pipeline(df: pd.DataFrame) -> pd.DataFrame:\n    df_clean = df.dropna(subset=['order_id', 'total_amount'])\n    summary = df_clean.groupby('city').agg(total_orders=('order_id', 'nunique'), total_revenue=('total_amount', 'sum')).reset_index()\n    return summary.sort_values(by='total_revenue', ascending=False)`
          : modality === "EXCEL"
          ? `=XLOOKUP(A2, Products!A:A, Products!D:D, "Unknown SKU")\n=FILTER(Orders!A2:G500, Orders!E2:E500="Tier 1")`
          : modality === "POWER_BI"
          ? `Total Revenue = CALCULATE(SUM(Orders[total_amount]), Orders[status] = "COMPLETED")`
          : null,
      skillsTested: [getToolGuidance(modality).skillCategory],
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
  const guidanceData = getToolGuidance(modality);

  if (!targetAssignment) {
    targetAssignment = await (db.assignment as any).create({
      data: {
        dayId: day.id,
        title: parsed.title || `Graded Mission: Day ${day.dayNumber}`,
        type: modality,
        description: parsed.description || "12 LPA Graded Industry Mission",
        deadlineHours: 24,
        rubric: JSON.stringify(parsed.rubric || { correctness: 40, edgeCases: 25, performance: 20, executiveTranslation: 15 }),
        toolGuidance: JSON.stringify(guidanceData),
        skillsTested: JSON.stringify(parsed.skillsTested || [guidanceData.skillCategory]),
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
        referenceSolution: parsed.referenceSolution || null,
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
    await (db.assignment as any).update({
      where: { id: targetAssignment.id },
      data: {
        title: parsed.title,
        type: modality,
        description: parsed.description,
        rubric: JSON.stringify(parsed.rubric),
        toolGuidance: JSON.stringify(guidanceData),
        skillsTested: JSON.stringify(parsed.skillsTested || [guidanceData.skillCategory]),
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
          referenceSolution: parsed.referenceSolution || null,
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
          referenceSolution: parsed.referenceSolution || null,
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
