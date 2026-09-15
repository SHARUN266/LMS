import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let profile = await db.userProfile.findFirst();
    if (!profile) {
      profile = await db.userProfile.create({
        data: {
          id: "user_default",
          name: "Aman Gupta",
          targetRole: "BI / Analytics Engineer",
          dailyStudyGoal: 6,
          currentStreak: 12,
          longestStreak: 15,
          totalStudyMins: 2840,
          xp: 1450,
          level: 3,
        },
      });
    }
    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let profile = await db.userProfile.findFirst();

    if (!profile) {
      profile = await db.userProfile.create({
        data: {
          id: "user_default",
          ...body,
        },
      });
    } else {
      profile = await db.userProfile.update({
        where: { id: profile.id },
        data: body,
      });
    }

    return NextResponse.json({ profile, success: true });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
