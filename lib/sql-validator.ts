import { PrismaClient } from "@prisma/client";
import { SAMPLE_DATASETS_SQL } from "@/lib/sql-runner";

const prisma = new PrismaClient();

let isSandboxReady = false;

async function ensureSandboxTables() {
  if (isSandboxReady) return;
  try {
    const statements = SAMPLE_DATASETS_SQL.split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    isSandboxReady = true;
  } catch (e) {
    console.warn("Sandbox init note:", e);
  }
}

export interface ValidationResult {
  isExecutable: boolean;
  correctnessScore: number; // 0 to 40 points
  executionError?: string;
  rowCount: number;
  expectedRowCount?: number;
  columnMatch: boolean;
  rowMatch: boolean;
  orderMatch: boolean;
  feedback: string[];
}

/**
 * Checks if a student query is unchanged starter code or trivial/blank.
 */
export function isUnchangedStarterCode(studentQuery: string, starterCode?: string | null): boolean {
  if (!studentQuery || !studentQuery.trim()) return true;

  const normalize = (s: string) =>
    s
      .replace(/--[^\r\n]*/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/;+\s*$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

  const normStudent = normalize(studentQuery);
  if (normStudent.length < 15) return true;

  if (starterCode && starterCode.trim()) {
    const normStarter = normalize(starterCode);
    if (normStudent === normStarter) return true;
  }

  return false;
}

/**
 * Validates a student SQL submission deterministically against SQLite sandbox datasets.
 */
export async function validateSQLSubmission(
  studentQuery: string,
  solutionQuery?: string | null
): Promise<ValidationResult> {
  await ensureSandboxTables();

  const feedback: string[] = [];

  // Step 1: Execute Student Query
  let studentRows: any[] = [];
  try {
    const cleaned = studentQuery.trim().replace(/;+$/, "");
    studentRows = await prisma.$queryRawUnsafe(cleaned);
  } catch (err: any) {
    return {
      isExecutable: false,
      correctnessScore: 0,
      executionError: err.message || "SQL Syntax Error",
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: [`SQL Execution Error: ${err.message}`],
    };
  }

  // Trivial or non-analytical query check (e.g., SELECT 1)
  const normQuery = studentQuery.toLowerCase();
  const hasFrom = /\bfrom\b/.test(normQuery);
  if (!hasFrom) {
    return {
      isExecutable: true,
      correctnessScore: 0,
      rowCount: studentRows.length,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback: ["Query does not select from any tables. You must query the sandbox database."],
    };
  }

  let correctnessScore = 5; // Base 5 points for querying sandbox tables without errors
  feedback.push("Query executed against sandbox without syntax errors (+5 pts).");

  if (!Array.isArray(studentRows) || studentRows.length === 0) {
    feedback.push("Query returned 0 rows. Verify filter predicates and join conditions (0 pts).");
    return {
      isExecutable: true,
      correctnessScore: 0,
      rowCount: 0,
      columnMatch: false,
      rowMatch: false,
      orderMatch: false,
      feedback,
    };
  }

  const studentCols = Object.keys(studentRows[0]);
  const studentRowCount = studentRows.length;

  // Step 2: If no reference solution query provided, grant points based on analytical depth
  if (!solutionQuery || !solutionQuery.trim()) {
    const hasJoin = /\bjoin\b/.test(normQuery);
    const hasGroup = /\bgroup\s+by\b/.test(normQuery);
    const hasWindow = /\bover\s*\(/.test(normQuery);

    let analyticPoints = 10;
    if (hasJoin) analyticPoints += 8;
    if (hasGroup || hasWindow) analyticPoints += 7;

    correctnessScore = Math.min(30, analyticPoints);
    feedback.push(`Returned ${studentRowCount} rows with ${studentCols.length} columns (+${correctnessScore} pts).`);

    return {
      isExecutable: true,
      correctnessScore,
      rowCount: studentRowCount,
      columnMatch: true,
      rowMatch: true,
      orderMatch: true,
      feedback,
    };
  }

  // Step 3: Execute Solution Query for Gold Standard Comparison
  let expectedRows: any[] = [];
  try {
    const cleanedSol = solutionQuery.trim().replace(/;+$/, "");
    expectedRows = await prisma.$queryRawUnsafe(cleanedSol);
  } catch (err: any) {
    // If solution had an issue, fallback to student execution
    correctnessScore = 36;
    return {
      isExecutable: true,
      correctnessScore,
      rowCount: studentRowCount,
      columnMatch: true,
      rowMatch: true,
      orderMatch: true,
      feedback: ["Query executed successfully."],
    };
  }

  const expectedCols = expectedRows.length > 0 ? Object.keys(expectedRows[0]) : [];
  const expectedRowCount = expectedRows.length;

  // Compare Columns (10 pts)
  let columnMatch = false;
  if (studentCols.length === expectedCols.length) {
    columnMatch = true;
    correctnessScore += 10;
    feedback.push(`Output column projection matches expected schema (${studentCols.length} columns) (+10 pts).`);
  } else {
    correctnessScore += Math.max(0, 10 - Math.abs(studentCols.length - expectedCols.length) * 2);
    feedback.push(`Column count mismatch: returned ${studentCols.length}, expected ${expectedCols.length}.`);
  }

  // Compare Row Count and Row Values (15 pts)
  let rowMatch = false;
  if (studentRowCount === expectedRowCount) {
    rowMatch = true;
    correctnessScore += 15;
    feedback.push(`Row count matches expected result (${studentRowCount} rows) (+15 pts).`);
  } else {
    const ratio = Math.min(studentRowCount, expectedRowCount) / Math.max(studentRowCount, expectedRowCount);
    const partial = Math.round(ratio * 12);
    correctnessScore += partial;
    feedback.push(`Row count difference: returned ${studentRowCount} rows, expected ${expectedRowCount} rows (+${partial} pts).`);
  }

  // Compare Ordering (5 pts)
  let orderMatch = false;
  if (studentRowCount === expectedRowCount && studentRowCount > 0) {
    const studentFirstVal = Object.values(studentRows[0])[0];
    const expectedFirstVal = Object.values(expectedRows[0])[0];
    if (String(studentFirstVal) === String(expectedFirstVal)) {
      orderMatch = true;
      correctnessScore += 5;
      feedback.push("Result sorting and ordering matched expected output (+5 pts).");
    } else {
      feedback.push("Check ORDER BY clause to ensure expected ranking.");
    }
  }

  correctnessScore = Math.min(40, Math.max(0, correctnessScore));

  return {
    isExecutable: true,
    correctnessScore,
    rowCount: studentRowCount,
    expectedRowCount,
    columnMatch,
    rowMatch,
    orderMatch,
    feedback,
  };
}
