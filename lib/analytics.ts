import { db } from "@/lib/db";

export interface AnalyticsProfile {
  name: string;
  targetRole: string;
  dailyStudyGoal: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyMins: number;
  xp: number;
  level: number;
}

export interface AnalyticsData {
  profile: AnalyticsProfile;
  days: {
    total: number;
    completed: number;
    avgScore: number;
  };
  assignments: {
    evaluatedCount: number;
    avgScore: number;
    strengths: string[];
    weakAreas: string[];
  };
  assessment: {
    attemptsCount: number;
    latestAttempt: any;
    skillRadar: Record<string, number>;
  };
  capstone: {
    milestonesTotal: number;
    milestonesCompleted: number;
  };
  backlog: {
    totalItems: number;
    completedItems: number;
    totalDrills: number;
    completedDrills: number;
  };
  weeklyActivity: { day: string; hours: number; target: number }[];
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const profile = (await db.userProfile.findFirst()) || {
      name: "Learner",
      targetRole: "BI / Analytics Engineer",
      dailyStudyGoal: 6,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyMins: 0,
      xp: 0,
      level: 1,
    };

    const days = await db.day.findMany({
      select: {
        id: true,
        dayNumber: true,
        title: true,
        isCompleted: true,
        score: true,
      },
      orderBy: { dayNumber: "asc" },
    });

    const completedDays = days.filter((d) => d.isCompleted);
    const dayScores = completedDays.map((d) => d.score).filter((s): s is number => typeof s === "number");
    const avgDayScore = dayScores.length > 0 ? Math.round(dayScores.reduce((a, b) => a + b, 0) / dayScores.length) : 0;

    const evaluations = await db.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const avgEvalScore =
      evaluations.length > 0
        ? Math.round(evaluations.reduce((a, b) => a + b.score, 0) / evaluations.length)
        : 0;

    // Aggregate strengths & weak areas
    const allWeakAreas: Record<string, number> = {};
    const allStrengths: Record<string, number> = {};

    evaluations.forEach((e) => {
      try {
        const weak = JSON.parse(e.weakAreas);
        if (Array.isArray(weak)) {
          weak.forEach((w) => {
            allWeakAreas[w] = (allWeakAreas[w] || 0) + 1;
          });
        }
      } catch {}

      try {
        const str = JSON.parse(e.strengths);
        if (Array.isArray(str)) {
          str.forEach((s) => {
            allStrengths[s] = (allStrengths[s] || 0) + 1;
          });
        }
      } catch {}
    });

    const assessmentAttempts = await db.assessmentAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Baseline competencies start at 0 until the user performs drills / assignments
    let skillRadar: Record<string, number> = {
      "SQL (Joins & Window Functions)": 0,
      "Relational Modeling & ERD": 0,
      "Query Optimization & Indexing": 0,
      "Data Pipelines & ETL Logic": 0,
      "Business Metrics (CAC, LTV, Churn)": 0,
    };

    if (evaluations.length > 0) {
      skillRadar["SQL (Joins & Window Functions)"] = avgEvalScore;
    }

    if (assessmentAttempts.length > 0 && assessmentAttempts[0].skillGaps) {
      try {
        const parsedGaps = JSON.parse(assessmentAttempts[0].skillGaps);
        skillRadar = { ...skillRadar, ...parsedGaps };
      } catch {}
    }

    const milestones = await db.projectMilestone.findMany();
    const completedMilestones = milestones.filter((m) => m.isCompleted).length;

    const backlogItems = await db.backlogItem.findMany();
    const remedialDrills = await db.remedialDrill.findMany();

    // Dynamically calculate weekly activity from real StudySession logs
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSessions = await db.studySession.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        durationMins: true,
        createdAt: true,
      },
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(now.getDate() - i);
      const dayDateStr = targetDate.toISOString().slice(0, 10);
      const isToday = i === 0;
      const dayName = isToday ? `${dayNames[targetDate.getDay()]} (Today)` : dayNames[targetDate.getDay()];

      const dayMins = recentSessions
        .filter((s) => s.createdAt.toISOString().slice(0, 10) === dayDateStr)
        .reduce((sum, s) => sum + s.durationMins, 0);

      weeklyActivity.push({
        day: dayName,
        hours: Math.round((dayMins / 60) * 10) / 10,
        target: profile.dailyStudyGoal || 6.0,
      });
    }

    return {
      profile,
      days: {
        total: days.length,
        completed: completedDays.length,
        avgScore: avgDayScore,
      },
      assignments: {
        evaluatedCount: evaluations.length,
        avgScore: avgEvalScore,
        strengths: Object.keys(allStrengths),
        weakAreas: Object.keys(allWeakAreas),
      },
      assessment: {
        attemptsCount: assessmentAttempts.length,
        latestAttempt: assessmentAttempts[0] || null,
        skillRadar,
      },
      capstone: {
        milestonesTotal: milestones.length,
        milestonesCompleted: completedMilestones,
      },
      backlog: {
        totalItems: backlogItems.length,
        completedItems: backlogItems.filter((b) => b.isCompleted).length,
        totalDrills: remedialDrills.length,
        completedDrills: remedialDrills.filter((d) => d.isCompleted).length,
      },
      weeklyActivity,
    };
  } catch (error) {
    console.error("Error generating analytics data:", error);
    // Fallback clean zero state in case of DB connection error
    return {
      profile: {
        name: "Learner",
        targetRole: "BI / Analytics Engineer",
        dailyStudyGoal: 6,
        currentStreak: 0,
        longestStreak: 0,
        totalStudyMins: 0,
        xp: 0,
        level: 1,
      },
      days: { total: 36, completed: 0, avgScore: 0 },
      assignments: { evaluatedCount: 0, avgScore: 0, strengths: [], weakAreas: [] },
      assessment: {
        attemptsCount: 0,
        latestAttempt: null,
        skillRadar: {
          "SQL (Joins & Window Functions)": 0,
          "Relational Modeling & ERD": 0,
          "Query Optimization & Indexing": 0,
          "Data Pipelines & ETL Logic": 0,
          "Business Metrics (CAC, LTV, Churn)": 0,
        },
      },
      capstone: { milestonesTotal: 42, milestonesCompleted: 0 },
      backlog: { totalItems: 0, completedItems: 0, totalDrills: 0, completedDrills: 0 },
      weeklyActivity: [
        { day: "Mon", hours: 0, target: 6.0 },
        { day: "Tue", hours: 0, target: 6.0 },
        { day: "Wed", hours: 0, target: 6.0 },
        { day: "Thu", hours: 0, target: 6.0 },
        { day: "Fri", hours: 0, target: 6.0 },
        { day: "Sat", hours: 0, target: 6.0 },
        { day: "Sun (Today)", hours: 0, target: 6.0 },
      ],
    };
  }
}
