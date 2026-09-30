import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai";
import { getTargetChallengeElo } from "@/lib/difficulty-calibrator";
import { CORE_SKILL_GRAPH } from "@/lib/knowledge-graph";

/**
 * AXIOM Content Synthesizer Engine (JIT)
 *
 * Implements Just-In-Time AI content synthesis with SQLite local caching:
 * 1. Checks if content already exists in dev.db -> If yes, returns in 0ms.
 * 2. If not, queries Learner Profile + Knowledge Graph + Elo Rating.
 * 3. Calls Gemini 2.5 Flash to synthesize visual/JS-bridged lesson notes, drills, and missions.
 * 4. Saves generated content into SQLite so subsequent loads are instant and offline-ready.
 */

export async function synthesizeLessonOnDemand(dayIdentifier: string | number) {
  let day = await db.day.findFirst({
    where:
      typeof dayIdentifier === "number"
        ? { dayNumber: dayIdentifier }
        : { id: String(dayIdentifier) },
    include: {
      lesson: true,
      week: { include: { module: true } },
    },
  });

  if (!day) {
    const match = String(dayIdentifier).match(/\d+/);
    const dayNum = match ? parseInt(match[0], 10) : 1;
    day = await db.day.findFirst({
      where: { dayNumber: dayNum },
      include: {
        lesson: true,
        week: { include: { module: true } },
      },
    });
  }

  if (!day) {
    throw new Error(`Day not found: ${dayIdentifier}`);
  }

  // If lesson already contains meaningful content (> 250 chars), return from SQLite cache immediately!
  if (day.lesson && day.lesson.content && day.lesson.content.length > 250) {
    return day.lesson;
  }

  // Synthesize via Gemini 2.5 Flash
  const user = await db.userProfile.findFirst();
  const moduleTitle = day.week?.module?.title || "Data Analytics";

  const systemPrompt = `You are a Principal Analytics Engineering Instructor specializing in teaching JavaScript developers transition into 12 LPA Data Analyst / Analytics Engineer roles.
Return ONLY valid JSON matching this schema:
{
  "content": string (Markdown formatted lesson notes. MUST BE CONCISE, under 450 words. Focus on: 1) Industry Objective, 2) Visual / JS Developer Analogy Bridge, 3) Core Mechanics with code snippet, 4) Real-world edge case),
  "cheatSheet": string (Markdown 10-second production syntax quick reference block),
  "quickQuiz": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctAnswer": string,
      "explanation": string
    }
  ]
}`;

  const userPrompt = `
Generate concise, visual-first lesson content for:
- Day ${day.dayNumber}: ${day.title}
- Module: ${moduleTitle}
- Objective: ${day.objective}
- Student Background: Experienced JavaScript developer targeting 12 LPA GCC Data Analyst role
- Key Requirement: Prioritize concise JS mental model analogies (e.g. array.map, array.filter, array.reduce, object dictionaries) over long walls of text. Keep explanations actionable and visual.`;

  let parsed: any = null;
  try {
    const aiResponse = await callGemini(userPrompt, systemPrompt, true);
    parsed = JSON.parse(aiResponse);
  } catch (err) {
    console.warn("AI lesson synthesis fallback:", err);
    parsed = {
      content: `# ${day.title}

> **12 LPA GCC Track** • Objective: ${day.objective}

---

### 🧠 JavaScript Developer Mental Model Bridge
In JavaScript, relational data transformations map directly to higher-order array methods:
\`\`\`javascript
// Concept Bridge for ${day.title}
const processed = dataset.filter(item => item.isValid).map(record => ({
  ...record,
  computedMetric: record.value * 1.18
}));
\`\`\`

### ⚡ Production Best Practices
- Always filter before aggregating to reduce Cartesian product size.
- Guard against NULL coalescing issues in production pipelines.`,
      cheatSheet: `\`\`\`sql\n-- 10-Second Quick Reference\nSELECT id, metric, COUNT(*) OVER() \nFROM analytics_table;\n\`\`\``,
      quickQuiz: [
        {
          question: `What is the primary industry objective of ${day.title}?`,
          options: [
            day.objective,
            "To maximize memory consumption in SQLite",
            "To normalize tables into BCNF form",
            "To disable query caching",
          ],
          correctAnswer: day.objective,
          explanation: `Directly aligns with Day ${day.dayNumber}'s core competency.`,
        },
      ],
    };
  }

  // Save to DB
  let lesson = day.lesson;
  if (lesson) {
    lesson = await db.lesson.update({
      where: { id: lesson.id },
      data: {
        content: parsed.content || `# ${day.title}\n\n${day.objective}`,
        cheatSheet: parsed.cheatSheet || "",
        quickQuiz: JSON.stringify(parsed.quickQuiz || []),
      },
    });
  } else {
    lesson = await db.lesson.create({
      data: {
        dayId: day.id,
        title: day.title,
        content: parsed.content || `# ${day.title}\n\n${day.objective}`,
        cheatSheet: parsed.cheatSheet || "",
        quickQuiz: JSON.stringify(parsed.quickQuiz || []),
        videoSearchQuery: `${day.title} Ankit Bansal SQL`,
      },
    });
  }

  return lesson;
}

/**
 * Synthesizes 3 practice drills for a day calibrated to the learner's Elo rating.
 * Cached in dev.db so it only runs once per day.
 */
export async function synthesizeDrillsOnDemand(dayIdentifier: string | number) {
  let day = await db.day.findFirst({
    where:
      typeof dayIdentifier === "number"
        ? { dayNumber: dayIdentifier }
        : { id: String(dayIdentifier) },
    include: {
      practice: { orderBy: { order: "asc" } },
      week: { include: { module: true } },
    },
  });

  if (!day) {
    const match = String(dayIdentifier).match(/\d+/);
    const dayNum = match ? parseInt(match[0], 10) : 1;
    day = await db.day.findFirst({
      where: { dayNumber: dayNum },
      include: {
        practice: { orderBy: { order: "asc" } },
        week: { include: { module: true } },
      },
    });
  }

  if (!day) {
    throw new Error(`Day not found: ${dayIdentifier}`);
  }

  // If practice drills already exist in DB, return them immediately
  if (day.practice && day.practice.length >= 3) {
    return day.practice;
  }

  const { targetElo } = await getTargetChallengeElo();

  const systemPrompt = `You are a Senior SQL Lead and Technical Interviewer at a top-tier GCC product firm.
Synthesize 3 realistic, graduated SQL practice drills.
Available sandbox SQLite tables:
1. customers (id, name, email, city, country, segment, signup_date)
2. products (id, name, category, price, cost, stock_quantity)
3. orders (id, customer_id, order_date, total_amount, status)
4. order_items (id, order_id, product_id, quantity, unit_price)
5. employees (id, name, department, salary, manager_id, hire_date)

Return ONLY valid JSON matching this schema:
{
  "drills": [
    {
      "order": 1,
      "title": string,
      "difficulty": "Beginner-Intermediate" | "Intermediate" | "Advanced",
      "problem": string (Clear business question + expected output columns),
      "starterCode": string (SQL starter template),
      "solution": string (Clean, optimized SQL solution executable in SQLite),
      "hints": [string, string, string]
    }
  ]
}`;

  const userPrompt = `
Generate 3 practice drills for:
- Day ${day.dayNumber}: ${day.title}
- Objective: ${day.objective}
- Target Elo Difficulty: ${targetElo}
- Drill 1: Foundational verification of syntax (Elo ~${targetElo - 150})
- Drill 2: Multi-condition enterprise scenario (Elo ~${targetElo})
- Drill 3: Edge-case / optimization challenge (Elo ~${targetElo + 150})

Make queries strictly compatible with standard SQLite.`;

  let drillsList: any[] = [];
  try {
    const aiResponse = await callGemini(userPrompt, systemPrompt, true);
    const parsed = JSON.parse(aiResponse);
    if (Array.isArray(parsed.drills) && parsed.drills.length > 0) {
      drillsList = parsed.drills;
    }
  } catch (err) {
    console.warn("AI practice drill synthesis fallback:", err);
  }

  if (drillsList.length === 0) {
    drillsList = [
      {
        order: 1,
        title: `Drill 1: ${day.title} Basics`,
        difficulty: "Beginner-Intermediate",
        problem: `Retrieve relevant records matching the criteria for ${day.title}.`,
        starterCode: `-- Drill 1\nSELECT * FROM orders LIMIT 10;`,
        solution: `SELECT * FROM orders WHERE status = 'COMPLETED' LIMIT 10;`,
        hints: ["Review the table schema", "Use WHERE clause", "Check status column"],
      },
      {
        order: 2,
        title: `Drill 2: Multi-Table Attribution`,
        difficulty: "Intermediate",
        problem: `Join orders with customers to calculate customer metrics for ${day.title}.`,
        starterCode: `-- Drill 2\nSELECT c.name, COUNT(o.id) \nFROM customers c \nJOIN orders o ON c.id = o.customer_id \nGROUP BY c.name;`,
        solution: `SELECT c.name, COUNT(o.id) as total_orders, SUM(o.total_amount) as total_spend \nFROM customers c \nJOIN orders o ON c.id = o.customer_id \nGROUP BY c.name;`,
        hints: ["Join on customer_id", "GROUP BY customer name", "Handle NULLs"],
      },
      {
        order: 3,
        title: `Drill 3: 12 LPA Edge-Case Challenge`,
        difficulty: "Advanced",
        problem: `Apply defensive edge-case handling for ${day.title} without row duplication.`,
        starterCode: `-- Drill 3\n-- Write your production query below:`,
        solution: `WITH customer_orders AS (\n  SELECT customer_id, SUM(total_amount) as gmv \n  FROM orders WHERE status = 'COMPLETED' \n  GROUP BY customer_id\n)\nSELECT c.id, c.name, COALESCE(co.gmv, 0.0) as total_gmv \nFROM customers c \nLEFT JOIN customer_orders co ON c.id = co.customer_id;`,
        hints: ["Use a CTE to pre-aggregate", "LEFT JOIN to retain all customers", "COALESCE for NULL handling"],
      },
    ];
  }

  // Clear existing partial drills for this day if any
  await db.practiceExercise.deleteMany({ where: { dayId: day.id } });

  // Save new drills
  for (let idx = 0; idx < drillsList.length; idx++) {
    const d = drillsList[idx];
    await db.practiceExercise.create({
      data: {
        dayId: day.id,
        order: d.order || idx + 1,
        title: d.title || `Drill ${idx + 1}`,
        difficulty: d.difficulty || "Intermediate",
        problem: d.problem,
        starterCode: d.starterCode,
        solution: d.solution,
        hints: JSON.stringify(d.hints || []),
      },
    });
  }

  return await db.practiceExercise.findMany({
    where: { dayId: day.id },
    orderBy: { order: "asc" },
  });
}
