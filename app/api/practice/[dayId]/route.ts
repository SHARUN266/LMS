import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { dayId: string } }
) {
  try {
    const { dayId } = params;

    let day = await db.day.findUnique({
      where: { id: dayId },
      include: {
        practice: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!day) {
      const match = dayId.match(/\d+/);
      const dayNum = match ? parseInt(match[0], 10) : 1;
      day = await db.day.findFirst({
        where: { dayNumber: dayNum },
        include: {
          practice: {
            orderBy: { order: "asc" },
          },
        },
      });
    }

    if (!day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      dayId: day.id,
      dayNumber: day.dayNumber,
      exercises: day.practice,
    });
  } catch (error: any) {
    console.error("GET /api/practice/[dayId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch practice exercises", details: error.message },
      { status: 500 }
    );
  }
}
