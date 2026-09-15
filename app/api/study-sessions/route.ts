import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const sessions = await db.studySession.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Error fetching study sessions:", error);
    return NextResponse.json({ error: "Failed to fetch sessions", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dayId, durationMins, notes } = body;

    const mins = Number(durationMins) || 1;

    const session = await db.studySession.create({
      data: {
        dayId: dayId || null,
        durationMins: mins,
        notes: notes || "Daily practice and focus session",
      },
    });

    // Update UserProfile total study minutes
    const profile = await db.userProfile.findFirst();
    if (profile) {
      await db.userProfile.update({
        where: { id: profile.id },
        data: {
          totalStudyMins: profile.totalStudyMins + mins,
          xp: profile.xp + Math.round(mins * 2),
        },
      });
    }

    return NextResponse.json({ session, success: true });
  } catch (error: any) {
    console.error("Error creating study session:", error);
    return NextResponse.json({ error: "Failed to log study session", details: error.message }, { status: 500 });
  }
}
