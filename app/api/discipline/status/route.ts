import { NextResponse } from "next/server";
import { getDisciplineSummary, calculateStreak, calculateLevel } from "@/lib/discipline";

export async function GET() {
  try {
    await calculateStreak();
    const stats = await getDisciplineSummary();
    const levelInfo = calculateLevel(stats.xp);

    return NextResponse.json({
      success: true,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      todayStudyMins: stats.todayStudyMins,
      totalStudyHours: stats.totalStudyHours,
      dailyGoalHours: stats.dailyGoalHours,
      attendancePct: stats.attendancePct,
      xp: stats.xp,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      nextLevelXP: levelInfo.nextLevelXP,
      progressPct: levelInfo.progressPct,
      recentSessions: stats.recentSessions,
    });
  } catch (error: any) {
    console.error("GET /api/discipline/status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch discipline status", details: error.message },
      { status: 500 }
    );
  }
}
