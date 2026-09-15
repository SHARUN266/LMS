import { db } from "@/lib/db";

/**
 * Marks a day as completed, unlocks the subsequent day in the curriculum sequence,
 * and increments user XP and streak.
 */
export async function completeDay(dayId: string, score: number = 85) {
  // 1. Find the target day
  let day = await db.day.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          days: { orderBy: { dayNumber: "asc" } },
        },
      },
    },
  });

  if (!day) {
    const match = dayId.match(/\d+/);
    const dayNum = match ? parseInt(match[0], 10) : 1;
    day = await db.day.findFirst({
      where: { dayNumber: dayNum },
      include: {
        week: {
          include: {
            days: { orderBy: { dayNumber: "asc" } },
          },
        },
      },
    });
  }

  if (!day) {
    throw new Error(`Day not found for identifier: ${dayId}`);
  }

  // 2. Mark day completed with score
  const updatedDay = await db.day.update({
    where: { id: day.id },
    data: {
      isCompleted: true,
      score: Math.max(score, day.score || 0),
    },
  });

  // 3. Unlock the next sequential day in the week
  const nextDay = await db.day.findFirst({
    where: {
      weekId: day.weekId,
      dayNumber: day.dayNumber + 1,
    },
  });

  if (nextDay) {
    await db.day.update({
      where: { id: nextDay.id },
      data: { isUnlocked: true },
    });
  }

  // 4. Update user profile XP and active day
  const user = await db.userProfile.findFirst();
  let updatedProfile = user;
  if (user) {
    updatedProfile = await db.userProfile.update({
      where: { id: user.id },
      data: {
        xp: user.xp + 100,
        activeDayId: nextDay ? nextDay.id : day.id,
      },
    });
  }

  return {
    success: true,
    day: updatedDay,
    nextDay: nextDay || null,
    profile: updatedProfile,
  };
}

/**
 * Verifies if the learner is eligible to attempt the weekly Monday Exam.
 * Criteria: All days in the week must be completed, with an average score of at least 70%.
 */
export async function isEligibleForAssessment(weekId: string) {
  let week = await db.week.findUnique({
    where: { id: weekId },
    include: {
      days: { orderBy: { dayNumber: "asc" } },
    },
  });

  if (!week) {
    week = await db.week.findFirst({
      include: {
        days: { orderBy: { dayNumber: "asc" } },
      },
    });
  }

  if (!week) {
    return { eligible: false, reason: "Week not found", completedCount: 0, totalDays: 0 };
  }

  const totalDays = week.days.length;
  const completedDays = week.days.filter((d) => d.isCompleted);
  const scores = completedDays.map((d) => d.score || 0);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const allCompleted = completedDays.length === totalDays && totalDays > 0;
  const eligible = allCompleted && avgScore >= 70;

  let reason = "Eligible for weekly examination.";
  if (!allCompleted) {
    reason = `You have completed ${completedDays.length} of ${totalDays} daily curriculums. Complete all days before taking the exam.`;
  } else if (avgScore < 70) {
    reason = `Your average assignment score is ${avgScore}%. A minimum of 70% is required to take the Monday exam. Review backlog drills.`;
  }

  return {
    eligible,
    reason,
    completedCount: completedDays.length,
    totalDays,
    avgScore,
  };
}

/**
 * Checks eligibility for the Module Capstone Project.
 * Criteria: All weeks must be completed and weekly assessments passed.
 */
export async function isEligibleForProject(moduleId: string) {
  let moduleItem = await db.module.findUnique({
    where: { id: moduleId },
    include: {
      weeks: {
        include: {
          days: true,
          assessments: {
            include: {
              attempts: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          },
        },
      },
      projects: true,
    },
  });

  if (!moduleItem) {
    moduleItem = await db.module.findFirst({
      include: {
        weeks: {
          include: {
            days: true,
            assessments: {
              include: {
                attempts: { orderBy: { createdAt: "desc" }, take: 1 },
              },
            },
          },
        },
        projects: true,
      },
    });
  }

  if (!moduleItem) {
    return { eligible: false, reason: "Module not found" };
  }

  let totalDays = 0;
  let completedDays = 0;
  let totalAssessments = 0;
  let passedAssessments = 0;

  for (const w of moduleItem.weeks) {
    totalDays += w.days.length;
    completedDays += w.days.filter((d) => d.isCompleted).length;

    for (const a of w.assessments) {
      totalAssessments += 1;
      if (a.attempts.length > 0 && a.attempts[0].passed) {
        passedAssessments += 1;
      }
    }
  }

  const daysPassed = completedDays >= totalDays * 0.8;
  const eligible = daysPassed;

  return {
    eligible,
    completedDays,
    totalDays,
    passedAssessments,
    totalAssessments,
    reason: eligible
      ? "Qualified to start 7-Day Capstone Project."
      : `Complete curriculum milestones (${completedDays}/${totalDays} days completed) to unlock the Capstone.`,
  };
}
