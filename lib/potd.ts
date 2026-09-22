import { db } from "@/lib/db";
import { validateSQLSubmission, isUnchangedStarterCode } from "@/lib/sql-validator";
import { callGemini } from "@/lib/ai";

export interface POTD {
  id: string;
  dateKey: string; // YYYY-MM-DD
  company: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  concept: string; // e.g., "Window Functions / DENSE_RANK"
  scenario: string;
  starterCode: string;
  solution: string;
  testScenarios: { name: string; description: string }[];
}

export const CURATED_POTDS: Omit<POTD, "dateKey">[] = [
  {
    id: "potd-zepto-rush-hour",
    company: "Zepto (10-Min Delivery)",
    title: "Surging Peak Hour Order Density & High-Velocity Customers",
    difficulty: "Medium",
    concept: "Aggregations & Customer Groupings",
    scenario: `Zepto operations team wants to identify high-velocity customers who have placed completed orders with a total spending exceeding $100.
Write a SQL query that retrieves each customer's name, email, and their total completed order spend (aliased as 'total_spend') and total completed orders (aliased as 'order_count').
Only include customers whose total completed spend is strictly greater than 100, ordered by total_spend DESC.`,
    starterCode: `-- Zepto POTD: Surging Customer Orders
-- Available tables: customers (id, name, email, city), orders (id, customer_id, total_amount, status)
SELECT 
    c.name,
    c.email,
    SUM(o.total_amount) AS total_spend,
    COUNT(o.id) AS order_count
FROM customers c
-- Complete the JOIN, WHERE, GROUP BY, and HAVING clauses
LIMIT 10;`,
    solution: `SELECT 
    c.name,
    c.email,
    SUM(o.total_amount) AS total_spend,
    COUNT(o.id) AS order_count
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
GROUP BY c.id, c.name, c.email
HAVING SUM(o.total_amount) > 100
ORDER BY total_spend DESC;`,
    testScenarios: [
      { name: "Join & Filter Correctness", description: "Only joins completed orders without cartesian duplicates." },
      { name: "Aggregation & Aliasing", description: "Correct SUM(total_amount) and COUNT(id) aggregated by customer." },
      { name: "Threshold & Order", description: "HAVING filter > 100 applied and sorted by total_spend descending." },
    ],
  },
  {
    id: "potd-swiggy-city-metrics",
    company: "Swiggy",
    title: "City-Level Gross Merchandise Value & Active User Penetration",
    difficulty: "Medium",
    concept: "Group Aggregates & Ratio Computation",
    scenario: `Swiggy expansion lead needs a city-level breakdown of performance.
Write a SQL query that outputs for each city:
1. 'city'
2. 'total_customers' (count of distinct customers registered in that city)
3. 'total_gmv' (sum of total_amount for all completed orders from customers in that city)
Order results by total_gmv DESC. Cities with 0 completed orders should show 0 or NULL gracefully.`,
    starterCode: `-- Swiggy POTD: City GMV & Penetration
-- Tables: customers (id, name, city), orders (id, customer_id, total_amount, status)
SELECT
    c.city,
    COUNT(DISTINCT c.id) AS total_customers,
    SUM(o.total_amount) AS total_gmv
FROM customers c
-- Add joins and filters
GROUP BY c.city;`,
    solution: `SELECT
    c.city,
    COUNT(DISTINCT c.id) AS total_customers,
    SUM(CASE WHEN o.status = 'COMPLETED' THEN o.total_amount ELSE 0 END) AS total_gmv
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.city
ORDER BY total_gmv DESC;`,
    testScenarios: [
      { name: "City Dimension Integrity", description: "All distinct cities represented with correct grouping." },
      { name: "Distinct Customer Count", description: "COUNT(DISTINCT c.id) correctly avoids inflated counts." },
      { name: "GMV Calculation", description: "Only completed orders contribute to total_gmv." },
    ],
  },
  {
    id: "potd-razorpay-high-value",
    company: "Razorpay",
    title: "High-Ticket Order Transactions & VIP Segment Audit",
    difficulty: "Hard",
    concept: "Subqueries & Window Ranking",
    scenario: `Razorpay Merchant Risk division wants to audit high-value purchases.
Identify all completed orders where the order's total_amount is strictly greater than the average completed order amount across the entire platform.
Return: order id ('order_id'), customer_id, total_amount, and customer name ('customer_name').
Sort by total_amount DESC.`,
    starterCode: `-- Razorpay POTD: Above-Average Transactions
-- Tables: orders (id, customer_id, total_amount, status), customers (id, name)
SELECT 
    o.id AS order_id,
    o.customer_id,
    o.total_amount,
    c.name AS customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.id
-- Filter for orders with total_amount > overall average completed order
ORDER BY o.total_amount DESC;`,
    solution: `SELECT 
    o.id AS order_id,
    o.customer_id,
    o.total_amount,
    c.name AS customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'COMPLETED'
  AND o.total_amount > (
      SELECT AVG(total_amount) 
      FROM orders 
      WHERE status = 'COMPLETED'
  )
ORDER BY o.total_amount DESC;`,
    testScenarios: [
      { name: "Scalar Subquery Correctness", description: "Calculates global average completed order value dynamically." },
      { name: "Join Association", description: "Associates order with correct customer name." },
      { name: "Strict Comparison", description: "Only selects orders strictly above the average threshold." },
    ],
  },
];

/**
 * Returns today's Problem of the Day based on the current calendar day.
 */
export async function getTodayPOTD(): Promise<POTD> {
  const now = new Date();
  const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const potdIndex = Math.abs(dayOfYear) % CURATED_POTDS.length;

  const basePOTD = CURATED_POTDS[potdIndex];
  return {
    ...basePOTD,
    dateKey,
  };
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
        { name: "Implementation Check", passed: false, details: "Template code was not modified." },
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
      }
    }
  }

  return {
    passed,
    score: passed ? 100 : validation.correctnessScore * 2,
    feedback: validation.feedback.join(" "),
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
        name: "Analytical Accuracy",
        passed: validation.columnMatch || validation.correctnessScore >= 20,
        details: passed ? "All business constraints satisfied." : "Output did not fully match reference criteria.",
      },
    ],
  };
}
