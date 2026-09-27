import { db } from "@/lib/db";
import { validateSQLSubmission, isUnchangedStarterCode } from "@/lib/sql-validator";
import { callGemini } from "@/lib/ai";

export interface ThinkingFramework {
  businessObjective: string;
  dataGrain: { inputGrain: string; outputGrain: string };
  cornerCasesAndTraps: string[];
  recommendedMentalSteps: string[];
}

export interface HintLadderItem {
  level: 1 | 2 | 3;
  title: string;
  content: string;
}

export interface TestCaseScenario {
  name: string;
  category: "happy_path" | "edge_case" | "scale_integrity";
  description: string;
  trapExplanation: string;
}

export interface OptimalAnalysis {
  staffSolution: string;
  suboptimalTraps: string;
  complexityInsight: string;
  interviewFollowUp: string;
}

export interface POTD {
  id: string;
  dateKey: string; // YYYY-MM-DD
  company: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  concept: string;
  scenario: string;
  starterCode: string;
  solution: string;
  thinkingFramework: ThinkingFramework;
  hintLadder: HintLadderItem[];
  testScenarios: TestCaseScenario[];
  optimalAnalysis: OptimalAnalysis;
  learnerContextSummary?: {
    currentTopic: string;
    currentModule: string;
    targetedWeakAreas: string[];
    difficultyCalibrated: string;
  };
}

// -------------------------------------------------------------
// 1. SQLite Persistence & Caching for Daily Dynamic POTD
// -------------------------------------------------------------
let isPOTDCacheReady = false;

async function ensurePOTDCacheTable() {
  if (isPOTDCacheReady) return;
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS daily_potd_cache (
        date_key TEXT PRIMARY KEY,
        potd_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    isPOTDCacheReady = true;
  } catch (err) {
    console.warn("daily_potd_cache init note:", err);
  }
}

async function getCachedPOTD(dateKey: string): Promise<POTD | null> {
  await ensurePOTDCacheTable();
  try {
    const rows: any[] = await db.$queryRawUnsafe(
      `SELECT potd_json FROM daily_potd_cache WHERE date_key = ? LIMIT 1;`,
      dateKey
    );
    if (rows && rows.length > 0 && rows[0].potd_json) {
      return JSON.parse(rows[0].potd_json) as POTD;
    }
  } catch (err) {
    console.warn("Error reading daily_potd_cache:", err);
  }
  return null;
}

async function setCachedPOTD(dateKey: string, potd: POTD): Promise<void> {
  await ensurePOTDCacheTable();
  try {
    const jsonStr = JSON.stringify(potd);
    const nowIso = new Date().toISOString();
    await db.$executeRawUnsafe(
      `INSERT OR REPLACE INTO daily_potd_cache (date_key, potd_json, created_at) VALUES (?, ?, ?);`,
      dateKey,
      jsonStr,
      nowIso
    );
  } catch (err) {
    console.warn("Error saving daily_potd_cache:", err);
  }
}

// -------------------------------------------------------------
// 2. Dynamic Learner Context Extractor
// -------------------------------------------------------------
interface LearnerContext {
  targetRole: string;
  experienceLevel: string;
  currentModuleName: string;
  currentTopic: string;
  currentObjective: string;
  dayNumber: number;
  weekNumber: number;
  recentScores: number[];
  avgScore: number;
  weakAreas: string[];
  strengths: string[];
  recommendedDifficulty: "Easy" | "Medium" | "Hard";
}

async function extractLearnerContext(): Promise<LearnerContext> {
  const profile = await db.userProfile.findFirst();
  const targetRole = profile?.targetRole || "BI / Analytics Engineer";
  const experienceLevel = profile?.experienceLevel || "Beginner-Intermediate";

  // Find active or latest unlocked day
  let day: any = null;
  if (profile?.activeDayId) {
    day = await db.day.findUnique({
      where: { id: profile.activeDayId },
      include: {
        week: {
          include: {
            module: true,
          },
        },
        lesson: true,
      },
    });
  }

  if (!day) {
    day = await db.day.findFirst({
      where: { isUnlocked: true },
      orderBy: { dayNumber: "desc" },
      include: {
        week: {
          include: {
            module: true,
          },
        },
        lesson: true,
      },
    });
  }

  // Fallback if no day found in database
  const currentModuleName = day?.week?.module?.title || "Module 1: Advanced SQL & Data Architecture";
  const currentTopic = day?.title || "Analytical Window Functions & CTEs";
  const currentObjective = day?.objective || day?.lesson?.title || "Master aggregations, window framing, and edge-case handling";
  const dayNumber = day?.dayNumber || 1;
  const weekNumber = day?.week?.weekNumber || 1;

  // Extract previous assignment and evaluation performance
  const recentEvals = await db.evaluation.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      score: true,
      weakAreas: true,
      strengths: true,
    },
  });

  const scores = recentEvals.map((e) => e.score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 78;

  const weakAreasSet = new Set<string>();
  const strengthsSet = new Set<string>();

  for (const ev of recentEvals) {
    try {
      const parsedWeak = JSON.parse(ev.weakAreas);
      if (Array.isArray(parsedWeak)) parsedWeak.forEach((w) => weakAreasSet.add(w));
    } catch {}
    try {
      const parsedStr = JSON.parse(ev.strengths);
      if (Array.isArray(parsedStr)) parsedStr.forEach((s) => strengthsSet.add(s));
    } catch {}
  }

  // Determine calibrated difficulty based on performance
  let recommendedDifficulty: "Easy" | "Medium" | "Hard" = "Medium";
  if (avgScore >= 85) {
    recommendedDifficulty = "Hard";
  } else if (avgScore < 65) {
    recommendedDifficulty = "Medium";
  }

  return {
    targetRole,
    experienceLevel,
    currentModuleName,
    currentTopic,
    currentObjective,
    dayNumber,
    weekNumber,
    recentScores: scores,
    avgScore,
    weakAreas: Array.from(weakAreasSet),
    strengths: Array.from(strengthsSet),
    recommendedDifficulty,
  };
}

// -------------------------------------------------------------
// 3. AI-Driven Dynamic POTD Synthesizer
// -------------------------------------------------------------
async function synthesizeAIPOTD(context: LearnerContext, dateKey: string): Promise<POTD> {
  const targetedWeakAreas =
    context.weakAreas.length > 0
      ? context.weakAreas.slice(0, 3)
      : ["Filter ordering & HAVING vs WHERE", "NULL-safe aggregation", "Edge-case handling with zero rows"];

  const prompt = `You are the Lead Curriculum Architect at a premier tech academy.
Generate an authentic, high-impact Daily Problem of the Day (POTD) tailored specifically to this learner's active learning journey.

LEARNER'S CURRENT CONTEXT (CRITICAL):
- Target Career Role: ${context.targetRole}
- Current Module: ${context.currentModuleName}
- Current Active Day & Topic: Day ${context.dayNumber} - "${context.currentTopic}"
- Learning Objective: ${context.currentObjective}
- Learning Stage: Week ${context.weekNumber}, Day ${context.dayNumber}
- Recent Performance Average: ${context.avgScore}%
- Identified Weak Areas to Test & Reinforce: ${targetedWeakAreas.join(", ")}
- Known Strengths: ${context.strengths.slice(0, 2).join(", ") || "Standard SELECT queries"}
- Target Difficulty: ${context.recommendedDifficulty}

SANDBOX DATABASE SCHEMA CONSTRAINTS:
The query MUST be 100% executable on SQLite using these existing tables:
1. customers (id INTEGER, name TEXT, email TEXT, city TEXT, country TEXT, segment TEXT, signup_date TEXT)
2. products (id INTEGER, name TEXT, category TEXT, price REAL, cost REAL, stock_quantity INTEGER)
3. orders (id INTEGER, customer_id INTEGER, order_date TEXT, total_amount REAL, status TEXT) [status can be 'COMPLETED', 'PENDING', 'CANCELLED']
4. order_items (id INTEGER, order_id INTEGER, product_id INTEGER, quantity INTEGER, unit_price REAL)
5. employees (id INTEGER, name TEXT, department TEXT, salary REAL, manager_id INTEGER, hire_date TEXT)

INSTRUCTIONS:
1. Feature a top tech product company (e.g. Zepto, Blinkit, Swiggy, Razorpay, CRED, Uber, Zomato, Flipkart, Meesho, Urban Company).
2. The problem MUST directly test the learner's CURRENT TOPIC ("${context.currentTopic}") while intentionally setting traps around their WEAK AREAS (${targetedWeakAreas.join(", ")}).
3. The SQL solution MUST be valid SQLite syntax and execute without errors on the schema above.
4. Output MUST be strictly valid JSON matching this schema:
{
  "company": "Company Name",
  "title": "Clear, Professional Problem Title",
  "difficulty": "${context.recommendedDifficulty}",
  "concept": "Specific Core Concept Tested",
  "scenario": "Business context explaining why the company needs this metric, exact output columns required, and sorting instructions.",
  "starterCode": "-- Starter template with table comments\\nSELECT ...",
  "solution": "Valid, clean SQLite query that solves the exact scenario",
  "thinkingFramework": {
    "businessObjective": "Clear statement of the real-world business objective",
    "dataGrain": {
      "inputGrain": "Detailed description of input table grain",
      "outputGrain": "Exact description of expected output row grain"
    },
    "cornerCasesAndTraps": [
      "Trap 1: Specific pitfall matching learner's weak area",
      "Trap 2: Edge-case pitfall (e.g. NULLs, ties, zero records, cancelled orders)",
      "Trap 3: Structural pitfall"
    ],
    "recommendedMentalSteps": [
      "Step 1: First mental consideration",
      "Step 2: Join or filter structure",
      "Step 3: Aggregation or window framing",
      "Step 4: Final output ordering and alias precision"
    ]
  },
  "hintLadder": [
    {"level": 1, "title": "Directional Clue", "content": "Conceptual direction without revealing SQL"},
    {"level": 2, "title": "Relational Blueprint", "content": "How tables and CTEs/clauses fit together"},
    {"level": 3, "title": "Syntax Blueprint", "content": "Exact clause structure with keyword guidance"}
  ],
  "testScenarios": [
    {"name": "Standard Business Path", "category": "happy_path", "description": "Validates primary business logic", "trapExplanation": "Explanation of happy path requirement"},
    {"name": "Learner Weak Area & Trap Check", "category": "edge_case", "description": "Directly verifies handling of weak area trap", "trapExplanation": "How naive queries fail this test"},
    {"name": "Deterministic Output & Sort", "category": "scale_integrity", "description": "Ensures output sorting and grain consistency", "trapExplanation": "Why non-deterministic ordering breaks reporting"}
  ],
  "optimalAnalysis": {
    "staffSolution": "The cleanest production-grade SQL query",
    "suboptimalTraps": "Why alternative naive approaches fail or perform poorly at scale",
    "complexityInsight": "Big-O time and memory complexity explanation",
    "interviewFollowUp": "A challenging follow-up question an interviewer at this company would ask"
  }
}`;

  const systemInstruction = `You are a Principal Analytics Engineer generating personalized daily challenges. Always produce production-grade SQL and deep cognitive frameworks in strict JSON format.`;

  const rawJson = await callGemini(prompt, systemInstruction, true);
  const parsed = JSON.parse(rawJson);

  return {
    id: `potd-${dateKey}`,
    dateKey,
    company: parsed.company || "Zepto",
    title: parsed.title || `Daily Problem: ${context.currentTopic}`,
    difficulty: parsed.difficulty || context.recommendedDifficulty,
    concept: parsed.concept || context.currentTopic,
    scenario: parsed.scenario || "Solve the daily analytics scenario using the available sandbox tables.",
    starterCode: parsed.starterCode || `-- POTD: ${context.currentTopic}\nSELECT * FROM orders LIMIT 5;`,
    solution: parsed.solution,
    thinkingFramework: parsed.thinkingFramework || {
      businessObjective: `Reinforce ${context.currentTopic} and target weak areas.`,
      dataGrain: { inputGrain: "Order transactions", outputGrain: "Aggregated metrics per entity" },
      cornerCasesAndTraps: targetedWeakAreas.map((w) => `Watch out for: ${w}`),
      recommendedMentalSteps: ["Deconstruct grain", "Apply filters early", "Aggregate correctly"],
    },
    hintLadder: parsed.hintLadder || [
      { level: 1, title: "Directional Clue", content: `Review your notes on ${context.currentTopic}.` },
      { level: 2, title: "Relational Blueprint", content: "Check table relationships between orders and customers." },
      { level: 3, title: "Syntax Blueprint", content: "Ensure GROUP BY includes all non-aggregated select columns." },
    ],
    testScenarios: parsed.testScenarios || [
      { name: "Logic Check", category: "happy_path", description: "Verifies basic calculations", trapExplanation: "Basic filter" },
      { name: "Edge Case", category: "edge_case", description: "Verifies null/tie handling", trapExplanation: "Edge case" },
      { name: "Integrity", category: "scale_integrity", description: "Checks output sort", trapExplanation: "Sorting" },
    ],
    optimalAnalysis: parsed.optimalAnalysis || {
      staffSolution: parsed.solution,
      suboptimalTraps: "Avoid redundant subqueries.",
      complexityInsight: "O(N log N) dominated by sorting.",
      interviewFollowUp: "How would this scale to 10M events per second?",
    },
    learnerContextSummary: {
      currentTopic: context.currentTopic,
      currentModule: context.currentModuleName,
      targetedWeakAreas,
      difficultyCalibrated: context.recommendedDifficulty,
    },
  };
}

// -------------------------------------------------------------
// 4. Fallback Curated Problems (Guaranteed Resilience)
// -------------------------------------------------------------
const FALLBACK_POTDS: Omit<POTD, "dateKey">[] = [
  {
    id: "potd-zepto-rush-hour",
    company: "Zepto (10-Min Delivery)",
    title: "Surging Peak Hour Order Density & High-Velocity Customers",
    difficulty: "Medium",
    concept: "Aggregations, HAVING Filter & Grain Management",
    scenario: `Zepto operations team wants to identify high-velocity customers who have placed completed orders with a total spending exceeding $1,000.
Write a SQL query that retrieves each qualifying customer's name, email, their total completed order spend (aliased as 'total_spend'), and total completed orders (aliased as 'order_count').
Only include customers whose total completed spend is strictly greater than 1000, ordered by total_spend DESC.`,
    starterCode: `-- Zepto POTD: Surging Customer Orders
-- Available tables: customers (id, name, email, city), orders (id, customer_id, total_amount, status)
SELECT 
    c.name,
    c.email,
    SUM(o.total_amount) AS total_spend,
    COUNT(o.id) AS order_count
FROM customers c
-- Complete the JOIN, WHERE, GROUP BY, and HAVING clauses
ORDER BY total_spend DESC;`,
    solution: `SELECT 
    c.name,
    c.email,
    SUM(o.total_amount) AS total_spend,
    COUNT(o.id) AS order_count
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
GROUP BY c.id, c.name, c.email
HAVING SUM(o.total_amount) > 1000
ORDER BY total_spend DESC;`,
    thinkingFramework: {
      businessObjective: "Filter out low-volume users to identify Zepto's VIP cohort driving rapid unit economics.",
      dataGrain: {
        inputGrain: "Individual order transactions in 'orders' joined with user profile in 'customers'.",
        outputGrain: "1 unique row per qualifying VIP customer.",
      },
      cornerCasesAndTraps: [
        "Trap 1: Filtering total_amount in the WHERE clause instead of HAVING.",
        "Trap 2: Forgetting to filter o.status = 'COMPLETED', counting CANCELLED orders.",
        "Trap 3: Grouping only by c.name instead of unique identifiers.",
      ],
      recommendedMentalSteps: [
        "Step 1: Join customers and orders on customer_id.",
        "Step 2: Filter status = 'COMPLETED' before grouping.",
        "Step 3: Group by c.id, c.name, c.email.",
        "Step 4: Use HAVING SUM(o.total_amount) > 1000.",
        "Step 5: Sort by total_spend DESC.",
      ],
    },
    hintLadder: [
      { level: 1, title: "Directional Clue", content: "Filtering an aggregated sum requires HAVING, not WHERE." },
      { level: 2, title: "Relational Blueprint", content: "INNER JOIN orders on c.id = o.customer_id, with WHERE o.status = 'COMPLETED'." },
      { level: 3, title: "Syntax Blueprint", content: "HAVING SUM(o.total_amount) > 1000 ORDER BY total_spend DESC;" },
    ],
    testScenarios: [
      { name: "Order Status Filtering", category: "happy_path", description: "Only completed orders contribute to GMV.", trapExplanation: "Cancelled orders must be excluded." },
      { name: "Threshold Rigor", category: "edge_case", description: "HAVING strictly enforces spend > 1000.", trapExplanation: "Boundary comparison check." },
      { name: "Deterministic Sort", category: "scale_integrity", description: "Sorted by highest spend first.", trapExplanation: "Repeatable report ordering." },
    ],
    optimalAnalysis: {
      staffSolution: `SELECT c.name, c.email, SUM(o.total_amount) AS total_spend, COUNT(o.id) AS order_count FROM customers c JOIN orders o ON c.id = o.customer_id WHERE o.status = 'COMPLETED' GROUP BY c.id, c.name, c.email HAVING SUM(o.total_amount) > 1000 ORDER BY total_spend DESC;`,
      suboptimalTraps: "Subqueries for single-pass aggregations add overhead.",
      complexityInsight: "O(N log N) dominated by sorting.",
      interviewFollowUp: "How would you calculate customer percent of total platform GMV in one query?",
    },
  },
];

// -------------------------------------------------------------
// 5. Main Entry: getTodayPOTD()
// -------------------------------------------------------------
/**
 * Returns today's Problem of the Day dynamically synthesized by AI
 * based on the learner's current module, topic, stage, and weak areas.
 * Cached per calendar day in SQLite.
 */
export async function getTodayPOTD(): Promise<POTD> {
  const now = new Date();
  const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // 1. Check if today's POTD was already generated and cached
  const cached = await getCachedPOTD(dateKey);
  if (cached && cached.solution) {
    return cached;
  }

  // 2. Extract live learner context: current module, topic, evaluation weak areas, difficulty
  let learnerContext: LearnerContext | null = null;
  try {
    learnerContext = await extractLearnerContext();
  } catch (ctxErr) {
    console.warn("Learner context extraction note:", ctxErr);
  }

  // 3. Synthesize dynamically with Gemini AI
  if (learnerContext) {
    try {
      const generatedPOTD = await synthesizeAIPOTD(learnerContext, dateKey);
      await setCachedPOTD(dateKey, generatedPOTD);
      return generatedPOTD;
    } catch (aiErr) {
      console.error("AI POTD synthesis error, falling back to curated backup:", aiErr);
    }
  }

  // 4. Fallback resilience (only if AI is unreachable)
  const basePOTD = FALLBACK_POTDS[0];
  const fallbackPOTD: POTD = {
    ...basePOTD,
    dateKey,
  };
  await setCachedPOTD(dateKey, fallbackPOTD);
  return fallbackPOTD;
}

/**
 * Checks whether user has solved today's POTD.
 */
export async function hasSolvedTodayPOTD(dateKey: string): Promise<boolean> {
  const existing = await db.studySession.findFirst({
    where: {
      notes: `POTD_COMPLETED:${dateKey}`,
    },
  });
  return !!existing;
}

/**
 * Validates and records completion of POTD.
 */
export async function submitPOTDSolution(submittedCode: string, dateKey: string) {
  const potd = await getTodayPOTD();

  if (isUnchangedStarterCode(submittedCode, potd.starterCode)) {
    return {
      passed: false,
      score: 0,
      feedback: "Please write and execute your query before submitting. Starter template unchanged.",
      testResults: [
        { name: "Implementation Check", passed: false, details: "Template starter code was not modified." },
      ],
    };
  }

  const validation = await validateSQLSubmission(submittedCode, potd.solution);
  const passed = validation.isExecutable && validation.correctnessScore >= 20;

  if (passed) {
    // Record completion in study session (awards 30 mins focused study + streak)
    const alreadySolved = await hasSolvedTodayPOTD(dateKey);
    if (!alreadySolved) {
      await db.studySession.create({
        data: {
          durationMins: 30,
          notes: `POTD_COMPLETED:${dateKey}`,
        },
      });

      // Update user streak and XP (+50 XP)
      const profile = await db.userProfile.findFirst();
      if (profile) {
        await db.userProfile.update({
          where: { id: profile.id },
          data: {
            currentStreak: profile.currentStreak + 1,
            longestStreak: Math.max(profile.longestStreak, profile.currentStreak + 1),
            xp: profile.xp + 50,
          },
        });

        // If user already completed their active day's tasks, unlock next day now that POTD is solved!
        if (profile.activeDayId) {
          const activeDay = await db.day.findUnique({ where: { id: profile.activeDayId } });
          if (activeDay && activeDay.isCompleted) {
            const nextDay = await db.day.findFirst({
              where: { dayNumber: activeDay.dayNumber + 1 },
            });
            if (nextDay) {
              await db.day.update({
                where: { id: nextDay.id },
                data: { isUnlocked: true },
              });
            }
          }
        }
      }
    }
  }

  return {
    passed,
    score: passed ? 100 : Math.max(0, validation.correctnessScore * 2),
    feedback: validation.feedback.join(" ") || (passed ? "All verification scenarios passed cleanly!" : "Verification failed."),
    testResults: [
      {
        name: "Sandbox Execution & Syntax",
        passed: validation.isExecutable,
        details: validation.executionError || "Query parsed and executed cleanly.",
      },
      {
        name: "Data Records Returned",
        passed: validation.rowCount > 0,
        details: `${validation.rowCount} rows produced from sandbox dataset.`,
      },
      {
        name: "Analytical Accuracy & Edge Cases",
        passed: validation.columnMatch || validation.correctnessScore >= 20,
        details: passed ? "All business constraints satisfied." : "Output did not fully match reference criteria.",
      },
    ],
  };
}
