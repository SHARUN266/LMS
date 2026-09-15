import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { assignId: string } }
) {
  try {
    const { assignId } = params;

    let assignment = await db.assignment.findUnique({
      where: { id: assignId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        day: {
          include: {
            week: true,
          },
        },
        submissions: {
          include: {
            evaluation: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Fallback if assignId is "daily-1", "daily-2", "1", "2"
    if (!assignment) {
      const match = assignId.match(/\d+/);
      const dayNum = match ? parseInt(match[0], 10) : 1;
      const targetDay = await db.day.findFirst({
        where: { dayNumber: dayNum },
      });

      if (targetDay) {
        assignment = await db.assignment.findFirst({
          where: { dayId: targetDay.id },
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
            day: {
              include: {
                week: true,
              },
            },
            submissions: {
              include: {
                evaluation: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
      }
    }

    // Fallback to any first assignment if still not found
    if (!assignment) {
      assignment = await db.assignment.findFirst({
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
          day: {
            include: {
              week: true,
            },
          },
          submissions: {
            include: {
              evaluation: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error: any) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json({ error: "Failed to fetch assignment", details: error.message }, { status: 500 });
  }
}
