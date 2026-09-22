import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let profile = await db.userProfile.findFirst();
    if (!profile) {
      profile = await db.userProfile.create({
        data: {
          id: "user_default",
          name: "Sharun",
          targetRole: "BI / Analytics Engineer",
          dailyStudyGoal: 6,
          currentStreak: 0,
          longestStreak: 0,
          totalStudyMins: 0,
          xp: 0,
          level: 1,
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
