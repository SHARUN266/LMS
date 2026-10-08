import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // 1. Locate Day 1 as active anchor
    const day1 = await db.day.findFirst({
      where: { dayNumber: 1 },
    });

    // 2. Clear all submissions and AI evaluations
    await db.evaluation.deleteMany();
    await db.submission.deleteMany();

    // 3. Clear assessments attempts & capstone milestones
    await db.assessmentAttempt.deleteMany();
    await db.projectEvaluation.deleteMany();
    await db.projectSubmission.deleteMany();
    await db.projectMilestone.updateMany({
      data: {
        isCompleted: false,
        submittedUrl: null,
        submittedFile: null,
        submittedNotes: null,
        completedAt: null,
      },
    });

    // 4. Clear study sessions and backlog drills
    await db.studySession.deleteMany();
    await db.backlogItem.deleteMany();
    await db.remedialDrill.updateMany({
      data: { isCompleted: false },
    });

    // 5. Reset Skills mastery scores and ELO ratings
    await db.skill.updateMany({
      data: {
        masteryScore: 0.0,
        eloRating: 1200,
        repetitions: 0,
        lastPracticed: null,
        nextReviewAt: null,
      },
    });

    // 6. Reset all Days: Day 1 unlocked, Days 2+ locked, completion flags false
    await db.day.updateMany({
      data: {
        isCompleted: false,
        theoryCompleted: false,
        practiceCompleted: false,
        score: null,
        isUnlocked: false,
      },
    });

    if (day1) {
      await db.day.update({
        where: { id: day1.id },
        data: { isUnlocked: true },
      });
    }

    // 7. Reset User Profile stats back to Day 1 baseline
    const profile = await db.userProfile.findFirst();
    if (profile) {
      await db.userProfile.update({
        where: { id: profile.id },
        data: {
          currentStreak: 0,
          longestStreak: 0,
          totalStudyMins: 0,
          xp: 0,
          level: 1,
          eloRating: 1200,
          activeDayId: day1 ? day1.id : null,
        },
      });
    }

    // 8. Clear mentor session messages if any
    try {
      await db.mentorMessage.deleteMany();
      await db.mentorSession.deleteMany();
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Curriculum reset successfully. All progress reset to Day 1 fresh baseline.",
    });
  } catch (error: any) {
    console.error("Error resetting user progress:", error);
    return NextResponse.json(
      { error: "Failed to reset progress", details: error.message },
      { status: 500 }
    );
  }
}
