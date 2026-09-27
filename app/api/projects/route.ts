import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        milestones: {
          orderBy: { dayNumber: "asc" },
        },
        module: {
          include: {
            track: true,
          },
        },
        submissions: {
          include: {
            evaluation: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects", details: error.message },
      { status: 500 }
    );
  }
}
