import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SAMPLE_DATASETS_SQL, SQLQueryResult } from "@/lib/sql-runner";

// We can execute SQL queries directly against our SQLite database or a practice sandbox table set
const prisma = new PrismaClient();

let isSandboxInitialized = false;

async function ensureSandbox() {
  if (isSandboxInitialized) return;
  try {
    const statements = SAMPLE_DATASETS_SQL.split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    isSandboxInitialized = true;
  } catch (err) {
    console.warn("Sandbox initialization note:", err);
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query string is required" }, { status: 400 });
    }

    await ensureSandbox();

    // Prevent destructive operations
    const trimmed = query.trim().toUpperCase();
    if (trimmed.startsWith("DROP DATABASE") || trimmed.startsWith("ATTACH") || trimmed.startsWith("DETACH")) {
      return NextResponse.json(
        { error: "Administrative commands are disabled in the practice sandbox." },
        { status: 403 }
      );
    }

    // Execute query safely
    const rawResult: any[] = await prisma.$queryRawUnsafe(query);
    const executionTimeMs = Date.now() - startTime;

    if (!Array.isArray(rawResult) || rawResult.length === 0) {
      return NextResponse.json({
        columns: [],
        rows: [],
        rowCount: 0,
        executionTimeMs,
      } as SQLQueryResult);
    }

    const columns = Object.keys(rawResult[0]);
    const rows = rawResult.map((item) => columns.map((col) => item[col]));

    return NextResponse.json({
      columns,
      rows,
      rowCount: rows.length,
      executionTimeMs,
    } as SQLQueryResult);
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    return NextResponse.json({
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs,
      error: error.message || "SQL Execution Error",
    } as SQLQueryResult);
  }
}
