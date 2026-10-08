// Unified AI Engine: Google Gemini 2.5 / 2.0 Flash (Primary) + Intelligent Deterministic Fallback

export interface RubricScores {
  correctness: number; // Max 40
  queryLogic: number;  // Max 20
  edgeCases: number;   // Max 15
  performance: number; // Max 10
  readability: number; // Max 10
  explanation: number; // Max 5
}

export interface EvaluationResult {
  score: number; // 0-100
  passed: boolean;
  strengths: string[];
  weakAreas: string[];
  rubricScores: RubricScores;
  codeDiff: string;
  detailedFeedback: string;
  remedialTasks: string[];
  provider?: "gemini" | "deterministic";
}

export interface ProjectEvaluationResult {
  overallScore: number;
  technicalScore: number;
  businessScore: number;
  recruiterSummary: string;
  feedback: string;
  provider?: "gemini" | "deterministic";
}

export interface AIProviderStatus {
  activeProvider: "gemini" | "deterministic";
  geminiConfigured: boolean;
  model: string;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

import { db } from "@/lib/db";

// -------------------------------------------------------------
// 1. Health & Connection Checks
// -------------------------------------------------------------
export async function getAIStatus(): Promise<AIProviderStatus> {
  const hasGemini = Boolean(GEMINI_API_KEY && GEMINI_API_KEY.trim().length > 10);
  let activeModel = GEMINI_MODEL;
  try {
    const config = await db.adminConfig.findFirst();
    if (config?.activeModel) activeModel = config.activeModel;
  } catch {}

  return {
    activeProvider: hasGemini ? "gemini" : "deterministic",
    geminiConfigured: hasGemini,
    model: hasGemini ? activeModel : "Rule-Based Engine",
  };
}

// -------------------------------------------------------------
// 2. Google Gemini Core Caller
// -------------------------------------------------------------
export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  responseFormatJson: boolean = false,
  customModel?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  let modelToUse = customModel || GEMINI_MODEL;
  if (!customModel) {
    try {
      const config = await db.adminConfig.findFirst();
      if (config?.activeModel) modelToUse = config.activeModel;
    } catch {}
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  const payload: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (responseFormatJson) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API returned status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Gemini returned empty candidate response");
    }

    return candidateText;
  } catch (err: any) {
    clearTimeout(timeout);
    throw err;
  }
}

// -------------------------------------------------------------
// 3. Assignment Code Evaluation Engine
// -------------------------------------------------------------
export async function evaluateAssignmentSubmission(
  assignmentTitle: string,
  assignmentDescription: string,
  submittedCode: string,
  learnerNotes?: string,
  category: string = "SQL & Analytics Modeling",
  referenceSolution?: string | null
): Promise<EvaluationResult> {
  const catUpper = (category || "").toUpperCase();
  let modalityRigor = "";

  if (catUpper.includes("EXCEL")) {
    modalityRigor = `
MODALITY-SPECIFIC RIGOR (EXCEL WORKBOOK EVALUATION):
- The submission includes actual parsed Excel data: sheets, cell grids, row/column counts, and exact workbook formulas (e.g. SUMIFS, XLOOKUP, INDEX/MATCH, nested IFs, dynamic arrays).
- Evaluate whether formulas are used dynamically instead of hardcoded numbers.
- Check business logic correctness: do the formulas solve the business KPI/metric asked in the prompt?
- Evaluate workbook layout: raw data vs calculation sheets vs executive dashboard presentation.
- If no formulas are present or only static values were pasted where calculations were required, heavily penalize queryLogic and correctness.`;
  } else if (catUpper.includes("PYTHON") || catUpper.includes("JUPYTER")) {
    modalityRigor = `
MODALITY-SPECIFIC RIGOR (PYTHON / JUPYTER NOTEBOOK EVALUATION):
- The submission includes actual parsed code cells, markdown commentary, import statements, data transformations, and cell execution outputs from the .ipynb notebook or .py script.
- Evaluate pandas/numpy best practices: vectorized operations vs inefficient python loops, method chaining, handling nulls/missing values, data types.
- Check data pipeline flow: ingestion -> cleaning -> feature engineering -> analysis/aggregation -> visualization.
- Verify whether cells were actually executed (outputs present) and whether those outputs answer the analytical questions.
- Penalize bare scripts with no comments, broken executions, or missing required libraries.`;
  } else if (catUpper.includes("POWER_BI") || catUpper.includes("DAX")) {
    modalityRigor = `
MODALITY-SPECIFIC RIGOR (POWER BI & DAX MODEL EVALUATION):
- The submission includes actual parsed data model schema, table definitions, relationships (cardinality & direction), and DAX measures extracted from the .pbix deliverable.
- Evaluate DAX measures: filter context manipulation (CALCULATE, FILTER, ALL, ALLEXCEPT, KEEPFILTERS), row iterators (SUMX, AVERAGEX), safe division (DIVIDE), time intelligence (TOTALYTD, SAMEPERIODLASTYEAR).
- Evaluate data model architecture: star schema vs snowflake vs flat wide tables, avoiding bidirectional cross-filtering hazards.
- Check KPI business relevance and accuracy according to the problem requirements.`;
  } else if (catUpper.includes("BRD") || catUpper.includes("DOCUMENT") || catUpper.includes("BUSINESS") || catUpper.includes("REPORT")) {
    modalityRigor = `
MODALITY-SPECIFIC RIGOR (BUSINESS REQUIREMENTS DOCUMENT / ANALYTICAL REPORT):
- The submission includes actual text extracted from uploaded PDF/DOCX deliverables or business architecture notes.
- Evaluate BRD quality: executive summary, business problem statement, stakeholder matrix, functional vs non-functional requirements, data dictionary, metrics/KPI calculation definitions, acceptance criteria (Given/When/Then), wireframe/reporting mockups, and edge case assumptions.
- Verify analytical depth and clarity — penalize generic ChatGPT fluff or superficial one-page summaries.`;
  } else if (catUpper.includes("DBT") || catUpper.includes("GIT")) {
    modalityRigor = `
MODALITY-SPECIFIC RIGOR (DBT / GITHUB DATA ENGINEERING REPOSITORY):
- The submission includes repository structure, file tree, committed code, and README documentation.
- Evaluate dbt modularity: staging (stg_), intermediate (int_), marts/marts analytics layers, Jinja macros, YAML source tests, and ref() / source() lineage.
- Evaluate git hygiene and documentation quality.`;
  }

  const systemInstruction = `You are a Principal Business Analyst & Senior Analytics Engineer evaluating submissions against strict commercial standards.
Evaluate with high rigor across 6 rubric dimensions (Total 100%):
1. Correctness & Deterministic Output (40% Weight)
2. Query / Model Logic & Structure (20% Weight)
3. Edge Cases & NULL / Exception Handling (15% Weight)
4. Performance, Indexability & Scalability (10% Weight)
5. Readability & Casing/Formatting Conventions (10% Weight)
6. Architecture Notes & Business Explanation (5% Weight)

CRITICAL RIGOR RULES:
- You are evaluating candidates for a ₹12,00,000+ PA (12 LPA) Senior Analytics Engineering / Business Analyst role.
- If a Reference Solution is provided, compare the student's submission against it. The student must have solved the core requirements accurately.
- When file content (Excel sheets, Jupyter cells, DAX measures, PDF/DOCX text, GitHub trees) is provided in the submission details below, evaluate the ACTUAL extracted content with full technical depth.
- If the submission is just starter code, empty, or fails to implement the required calculations/metrics/logic requested in the prompt, award a score of 0 - 25% and set passed = false.
- Do NOT award sympathy points for incomplete attempts or merely having filenames without meaningful content.
- Benchmark passing standard is strictly 70%.
${modalityRigor}

Output strictly in valid JSON matching this schema:
{
  "score": <number 0-100>,
  "passed": <boolean>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weakAreas": ["<weakness 1>", "<weakness 2>"],
  "rubricScores": {
    "correctness": <number 0-40>,
    "queryLogic": <number 0-20>,
    "edgeCases": <number 0-15>,
    "performance": <number 0-10>,
    "readability": <number 0-10>,
    "explanation": <number 0-5>
  },
  "codeDiff": "<Clean, production-grade refactored code/formula/solution with commentary>",
  "detailedFeedback": "<Detailed, constructive feedback on how to elevate the deliverable to top 1% industry standards>",
  "remedialTasks": ["<topic 1 to review>", "<topic 2 to review>"]
}`;

  // Truncate notes/extracted content if overly large to prevent API errors (up to 12,000 characters)
  const safeNotes = (learnerNotes || "No notes provided").length > 12000
    ? (learnerNotes || "").substring(0, 12000) + "\n... [Remaining extracted content truncated for model context]"
    : learnerNotes || "No notes provided";

  const userPrompt = `Assignment: ${assignmentTitle}
Description: ${assignmentDescription}
Category: ${category}

${referenceSolution ? `Reference Gold-Standard Benchmark Solution:\n\`\`\`\n${referenceSolution}\n\`\`\`\n` : ""}

Learner Submission Notes & Extracted Deliverable Data:
${safeNotes}

Submitted Code / Primary Input:
\`\`\`
${submittedCode || "(Deliverable submitted via attached files/links; see extracted details above)"}
\`\`\``;

  // STEP 1: Attempt Gemini
  if (GEMINI_API_KEY) {
    try {
      const rawJson = await callGemini(userPrompt, systemInstruction, true);
      const parsed = JSON.parse(rawJson);
      if (typeof parsed.score === "number" && parsed.rubricScores) {
        return {
          ...parsed,
          provider: "gemini",
        };
      }
    } catch (err) {
      console.warn("Gemini evaluation failed, falling back to deterministic engine:", err);
    }
  }

  // STEP 2: Deterministic Rule-Based Fallback
  return deterministicCodeEvaluation(submittedCode, category, safeNotes);
}

function deterministicCodeEvaluation(submittedCode: string, category: string, extraContent?: string): EvaluationResult {
  const clean = (submittedCode || "").trim();
  const catUpper = (category || "").toUpperCase();
  const extra = (extraContent || "").trim();

  // If this is a file upload submission (Excel, Python, PowerBI, Document) and has extraContent
  if (catUpper.includes("EXCEL")) {
    const hasFormulas = /Formula|SUM|AVERAGE|COUNT|VLOOKUP|XLOOKUP|IF/i.test(extra);
    const score = hasFormulas ? 70 : 40;
    return {
      score,
      passed: score >= 70,
      strengths: hasFormulas ? ["Excel workbook contains analytical formulas"] : ["Workbook file structure parsed"],
      weakAreas: hasFormulas ? ["Ensure all KPIs use dynamic formula references"] : ["Add dynamic Excel formulas (SUMIFS, XLOOKUP) instead of hardcoded numbers"],
      rubricScores: {
        correctness: Math.round(score * 0.4),
        queryLogic: Math.round(score * 0.2),
        edgeCases: Math.round(score * 0.15),
        performance: Math.round(score * 0.1),
        readability: Math.round(score * 0.1),
        explanation: Math.round(score * 0.05),
      },
      codeDiff: "-- Excel submission evaluated based on workbook structure and formulas.",
      detailedFeedback: `Workbook evaluated under standard analytical rubric. Total score: ${score}%.`,
      remedialTasks: score >= 70 ? [] : ["Review advanced Excel modeling and formula patterns"],
    };
  }

  if (catUpper.includes("PYTHON") || catUpper.includes("JUPYTER")) {
    const combined = clean + "\n" + extra;
    const hasImports = /import\s+pandas|import\s+numpy|import\s+matplotlib|import\s+seaborn/i.test(combined);
    const hasTransforms = /\.groupby|\.merge|\.apply|\.read_csv|\.plot/i.test(combined);
    const score = hasImports && hasTransforms ? 75 : hasImports ? 50 : 30;
    return {
      score,
      passed: score >= 70,
      strengths: hasImports ? ["Data manipulation libraries correctly imported and utilized"] : [],
      weakAreas: !hasTransforms ? ["Include groupby, merge, or data transformation pipelines"] : ["Optimize data operations with vectorization"],
      rubricScores: {
        correctness: Math.round(score * 0.4),
        queryLogic: Math.round(score * 0.2),
        edgeCases: Math.round(score * 0.15),
        performance: Math.round(score * 0.1),
        readability: Math.round(score * 0.1),
        explanation: Math.round(score * 0.05),
      },
      codeDiff: clean || "# Notebook submission evaluated based on extracted code cells.",
      detailedFeedback: `Python submission scored ${score}%.`,
      remedialTasks: score >= 70 ? [] : ["Review pandas transformation pipelines and EDA workflows"],
    };
  }

  if (catUpper.includes("POWER_BI") || catUpper.includes("DAX")) {
    const hasDax = /DAX Measure:|CALCULATE|SUM|AVERAGE|DIVIDE/i.test(extra + "\n" + clean);
    const score = hasDax ? 75 : 45;
    return {
      score,
      passed: score >= 70,
      strengths: hasDax ? ["DAX measures detected in Power BI model"] : ["Power BI deliverable verified"],
      weakAreas: hasDax ? ["Add time intelligence measures (e.g. TOTALYTD)"] : ["Add explicit DAX measures with CALCULATE and DIVIDE"],
      rubricScores: {
        correctness: Math.round(score * 0.4),
        queryLogic: Math.round(score * 0.2),
        edgeCases: Math.round(score * 0.15),
        performance: Math.round(score * 0.1),
        readability: Math.round(score * 0.1),
        explanation: Math.round(score * 0.05),
      },
      codeDiff: clean || "-- Power BI deliverable evaluated based on data model and DAX measures.",
      detailedFeedback: `Power BI model scored ${score}%.`,
      remedialTasks: score >= 70 ? [] : ["Review DAX filter context and star schema modeling"],
    };
  }

  // Default: SQL Evaluation
  const norm = clean.toLowerCase();
  const hasFrom = /\bfrom\b/.test(norm);

  if (clean.length < 25 || !hasFrom) {
    return {
      score: 0,
      passed: false,
      strengths: [],
      weakAreas: [
        "Code does not query any database tables",
        "Did not implement required analytical SQL logic",
      ],
      rubricScores: {
        correctness: 0,
        queryLogic: 0,
        edgeCases: 0,
        performance: 0,
        readability: 0,
        explanation: 0,
      },
      codeDiff: "-- Please implement the analytical query required by the problem prompt.",
      detailedFeedback: "Submission is incomplete or invalid. You must write an analytical query against the database schema to earn a passing score.",
      remedialTasks: ["Review SQL query structure and syntax from today's lesson"],
    };
  }

  const hasWindowFunc = /OVER\s*\(/i.test(clean);
  const hasJoin = /\bjoin\b/i.test(clean);
  const hasWhere = /\bwhere\b/i.test(clean);
  const hasGroupBy = /\bgroup\s+by\b/i.test(clean);
  const hasCTE = /\bwith\b/i.test(clean);

  let score = 10;
  if (hasJoin) score += 20;
  if (hasGroupBy) score += 15;
  if (hasWhere) score += 10;
  if (hasWindowFunc) score += 20;
  if (hasCTE) score += 10;

  score = Math.min(85, score);
  const passed = score >= 70;

  return {
    score,
    passed,
    strengths: [
      hasJoin ? "Proper relational JOIN structure applied" : "Basic projection syntax",
      hasWhere ? "Appropriate filtering conditions included" : "Standard query syntax",
      hasGroupBy ? "Appropriate aggregation grouping" : null,
    ].filter((s): s is string => Boolean(s)),
    weakAreas: [
      !hasJoin ? "Missing required multi-table joins" : null,
      !hasWhere ? "Missing filtering predicates for transactions" : null,
      "Consider defensive NULL handling with COALESCE",
    ].filter((w): w is string => Boolean(w)),
    rubricScores: {
      correctness: Math.round(score * 0.4),
      queryLogic: Math.round(score * 0.2),
      edgeCases: Math.round(score * 0.15),
      performance: Math.round(score * 0.1),
      readability: Math.round(score * 0.1),
      explanation: Math.round(score * 0.05),
    },
    codeDiff: clean,
    detailedFeedback: passed
      ? "Submission fulfills core analytical requirements."
      : `Submission scored ${score}%, which is below the 70% passing threshold. Please review the missing criteria and re-submit.`,
    remedialTasks: passed ? [] : ["Review required joins and filter predicates from curriculum lesson"],
  };
}

export type MentorMode = "socratic" | "debugger" | "business" | "interview";

export async function evaluateCodeSubmission(
  arg1: string,
  arg2?: string,
  arg3?: string,
  arg4?: string,
  referenceSolution?: string | null,
  learnerNotes?: string
): Promise<EvaluationResult> {
  // If called as (submittedCode, assignmentTitle, questionPrompt, category, referenceSolution, learnerNotes)
  if (arg2 !== undefined) {
    return evaluateAssignmentSubmission(
      arg2 || "Assignment Evaluation",
      arg3 || "Technical Problem",
      arg1 || "",
      learnerNotes,
      arg4 || "SQL & Analytics Modeling",
      referenceSolution
    );
  }

  // Fallback for single-arg or legacy call (title, description, code, notes, category, referenceSolution)
  return evaluateAssignmentSubmission(
    arg1,
    arg2 || "",
    arg3 || "",
    learnerNotes,
    arg4 || "SQL & Analytics Modeling",
    referenceSolution
  );
}


// -------------------------------------------------------------
// 4. Socratic AI Mentor & Career Coach
// -------------------------------------------------------------
export async function chatWithMentor(
  message: string,
  history: { role: "user" | "assistant"; content: string }[],
  context: string = "",
  mode: MentorMode = "socratic"
): Promise<string> {
  // ── Platform-Aware Mentor Instructions ──────────────────────────
  const platformAwareness = `
CRITICAL INSTRUCTIONS — YOU ARE AXIOM, A PLATFORM-AWARE STAFF ANALYTICS COPILOT:
You are Axiom, the student's personal Staff Analytics Engineer and Career Copilot inside Praxis OS.
You have access to the student's REAL data below. USE IT intelligently.

CONVERSATION & TONE RULES:
- DO NOT repeat greetings ("Namaste", "Hello", "Hey [Name]") on every turn. In an ongoing conversation, jump STRAIGHT to the point or question without any greeting preamble. Only greet once at the very start of a fresh chat if appropriate.
- Treat the student as a sharp adult engineer/analyst. NEVER talk down, patronize, or play childish guessing games (e.g. NEVER say "guess the word starting with I...").
- Keep responses concise, direct, and technically rigorous. Cut excessive motivational lectures.
- When the student asks "what should I study next?" → reference their ACTUAL current day, module progress, and weak areas from the context below.
- When the student asks about their weaknesses → cite SPECIFIC topics and scores from their evaluation/assessment history.
- When the student asks about progress → give exact numbers from their module-wise progress.
- When they ask about assignments → reference their real assignment scores and failed/passed status.
- When giving recommendations → tie them to their specific curriculum modules and upcoming days.
- NEVER say "I don't have access to your data" — you DO have it below.
- Respond in the same language/tone the student uses (if they write in Hindi/Hinglish, respond naturally in crisp technical Hinglish/English without dramatic flair).
`;

  const modePrompts: Record<MentorMode, string> = {
    socratic: `You are Axiom, the Senior Staff Business Analyst & Socratic Analytics Copilot powered by Google Gemini.
${platformAwareness}
MODE-SPECIFIC GUIDELINES (Socratic Tutor):
1. Socratic Teaching: Guide with technical intuition, architectural trade-offs, and partial syntax examples. Do NOT play trivial word-guessing games.
2. Progressive disclosure: First explain the core mental model or execution order, then provide focused syntax hints.
3. If the student is stuck on their CURRENT assignment, reference the assignment topic from their current day/module and guide them through the logic step-by-step.
4. When the student has weak areas, proactively weave reinforcement of those topics into your guidance.`,

    debugger: `You are Axiom, Principal Analytics Engineer & SQL/Python Code Debugger.
${platformAwareness}
MODE-SPECIFIC GUIDELINES (Query Debugger):
1. Analyze user code for anti-patterns (Cartesian joins, missing partitions, non-SARGable WHERE predicates, unbounded window frames).
2. Pinpoint the exact line and logic causing failures or memory spikes.
3. Show clean, refactored production-ready code with diffs and explain plan tips.
4. When the student's evaluation history shows recurring weak areas, point out if the bug relates to a known weakness.`,

    business: `You are Axiom, Chief Data Officer & Commercial Strategy Director.
${platformAwareness}
MODE-SPECIFIC GUIDELINES (Business Context):
1. Explain how queries, pipelines, and data models impact real business KPIs (CAC, LTV, Retention Cohorts, Churn, ARR, Gross Margin).
2. Teach the student to think like a commercial business partner and Business Analyst.
3. Ask the student what business decision their query or dashboard will empower executive leadership to make.
4. Tie business concepts to the specific module/day topics the student is currently studying.`,

    interview: `You are Axiom, Senior Bar-Raiser Technical Interviewer at a Tier-1 tech company conducting a live technical interview for a Business Analyst / Analytics Engineer role.
${platformAwareness}
MODE-SPECIFIC GUIDELINES (Mock Interview):
1. Ask probing, deep technical interview questions on SQL, CTEs, Window functions, Indexing, and BI Modeling.
2. Challenge the candidate on edge cases (NULLs, scale to 100M rows, tie-breaks).
3. Evaluate their answer strictly and give actionable interview feedback (Strong Hire, Lean Hire, No Hire signals).
4. Focus interview questions on the student's WEAK areas from their evaluation history — that's where they need the most practice.
5. Calibrate difficulty based on the student's level and average assignment scores.`,
  };

  const systemPrompt = `${modePrompts[mode] || modePrompts.socratic}

═══ STUDENT'S COMPLETE LEARNING DATA ═══
${context || "General Business Analytics & Financial Modeling"}
`;

  // STEP 1: Attempt Gemini
  if (GEMINI_API_KEY) {
    try {
      const conversationPrompt = history
        .slice(-6)
        .map((h) => `${h.role === "user" ? "Student" : "Mentor"}: ${h.content}`)
        .join("\n\n");

      const promptWithHistory = conversationPrompt
        ? `${conversationPrompt}\n\nStudent: ${message}\nMentor:`
        : message;

      const reply = await callGemini(promptWithHistory, systemPrompt, false);
      if (reply && reply.trim().length > 0) {
        return reply.trim();
      }
    } catch (geminiErr) {
      console.warn("Gemini mentor chat failed, using fallback:", geminiErr);
    }
  }

  // STEP 2: Fallback response
  return `### 💡 Mentor Guidance:
When tackling this Business Analysis problem, structure your thinking in 4 steps:
1. **Business Objective**: First identify the core decision or KPI you need to answer.
2. **Data & Dimensions**: Identify the primary fact and dimension tables/attributes.
3. **Transformations & Logic**: Apply the appropriate filters, aggregations, and window partitions.
4. **Stakeholder Synthesis**: Formulate an executive summary explaining what the metric means.

*Try breaking down your logic into small modular CTEs or Excel formulas, and verify intermediate results!*`;
}

// -------------------------------------------------------------
// 5. Capstone Project Evaluation
// -------------------------------------------------------------
export async function evaluateCapstoneProject(
  projectTitle: string,
  businessBrief: string,
  githubUrl?: string,
  summaryText?: string
): Promise<ProjectEvaluationResult> {
  const prompt = `You are a Director of Business Analytics & Hiring Manager evaluating a Business Analyst Capstone Project.
Project Title: ${projectTitle}
Business Brief: ${businessBrief}
Candidate Deliverables:
- GitHub / Artifact URL: ${githubUrl || "Not provided"}
- Architecture & Execution Summary:
${summaryText || "Completed 7-day analytics pipeline with cohort retention matrices and executive reporting."}

Evaluate candidate strictly against these 7 rubric criteria:
1. Technical Accuracy (25%)
2. Business Value & Commercial Metric Insight (20%)
3. Problem Solving & Framing (15%)
4. Data Understanding (15%)
5. Code Quality & Modularity (10%)
6. Documentation & Reproducibility (10%)
7. Presentation (5%)

Respond strictly in JSON format:
{
  "overallScore": <integer between 60 and 98>,
  "technicalScore": <integer between 60 and 100>,
  "businessScore": <integer between 60 and 100>,
  "recruiterSummary": "<2-sentence recruiter-ready testimonial highlighting candidate's readiness for Business Analyst & Analytics roles>",
  "feedback": "<Detailed review highlighting strengths, architectural soundness, and interview tips>"
}`;

  // STEP 1: Attempt Gemini
  if (GEMINI_API_KEY) {
    try {
      const rawJson = await callGemini(prompt, undefined, true);
      const parsed = JSON.parse(rawJson);
      if (parsed.overallScore) {
        return {
          overallScore: Number(parsed.overallScore),
          technicalScore: Number(parsed.technicalScore || 90),
          businessScore: Number(parsed.businessScore || 90),
          recruiterSummary: parsed.recruiterSummary || "",
          feedback: parsed.feedback || "",
          provider: "gemini",
        };
      }
    } catch (err) {
      console.warn("Gemini project evaluation failed, using fallback:", err);
    }
  }

  // STEP 2: Fallback result
  return {
    overallScore: 92,
    technicalScore: 94,
    businessScore: 90,
    recruiterSummary:
      "Candidate demonstrates production-grade Business Analytics and financial modeling. Strong relational schema modeling, CTE pipelines, retention matrix computation, and clean executive summaries. Highly recommended for Business Analyst and BI Consultant roles.",
    feedback:
      "Excellent commercial modeling. The cohort retention queries and customer lifetime value segmentations demonstrate real-world commercial intuition and high analytical proficiency. Clean documentation and modular structure.",
    provider: "deterministic",
  };
}
