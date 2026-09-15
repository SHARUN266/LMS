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
        submissions: {
          include: {
            evaluation: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

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

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({
      assignmentId: assignment.id,
      title: assignment.title,
      submissions: assignment.submissions,
    });
  } catch (error: any) {
    console.error("Error fetching assignment submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions", details: error.message },
      { status: 500 }
    );
  }
}
