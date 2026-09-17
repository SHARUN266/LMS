import { db } from "@/lib/db";

export interface DisciplineStats {
  currentStreak: number;
  longestStreak: number;
  totalStudyHours: number;
  totalStudyMins: number;
  xp: number;
  level: number;
  todayStudyMins: number;
  dailyGoalHours: number;
  attendancePct: number;
  recentSessions: {
    date: string;
    durationMins: number;
    notes: string | null;
  }[];
}

/**
 * Calculates current consecutive study streak by analyzing daily study sessions and submissions.
 */
export async function calculateStreak(userId: string = "user_default"): Promise<{ currentStreak: number; longestStreak: number }> {
  const profile = await db.userProfile.findFirst({
    where: { id: userId },
  });

  const sessions = await db.studySession.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const submissions = await db.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  // Extract unique active dates (YYYY-MM-DD)
  const activeDays = new Set<string>();

  sessions.forEach((s) => {
    activeDays.add(s.createdAt.toISOString().slice(0, 10));
  });

  submissions.forEach((sub) => {
    activeDays.add(sub.createdAt.toISOString().slice(0, 10));
  });

  const sortedDates = Array.from(activeDays).sort().reverse();
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let currentStreak = 0;
  let checkDate = new Date();

  // If today is active, start from today; otherwise if yesterday was active, streak continues
  if (sortedDates.includes(todayStr)) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (sortedDates.includes(yesterday)) {
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If neither today nor yesterday has activity, fallback to stored profile streak or 1
    currentStreak = profile?.currentStreak || 1;
  }

  // Count backwards
  while (true) {
    const dStr = checkDate.toISOString().slice(0, 10);
    if (sortedDates.includes(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(profile?.longestStreak || 1, currentStreak);

  // Update profile
  if (profile) {
    await db.userProfile.update({
      where: { id: profile.id },
      data: {
        currentStreak,
        longestStreak,
      },
    });
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculates XP thresholds and determines learner level.
 * Level 1: 0 - 500 XP (Apprentice)
 * Level 2: 501 - 1,200 XP (Junior Analyst)
 * Level 3: 1,201 - 2,500 XP (Analytics Engineer)
 * Level 4: 2,501 - 5,000 XP (Senior Analytics Engineer)
 * Level 5: 5,000+ XP (Staff Data Architect)
 */
export function calculateLevel(xp: number): { level: number; title: string; nextLevelXP: number; progressPct: number } {
  const levels = [
    { level: 1, min: 0, max: 500, title: "Apprentice" },
    { level: 2, min: 500, max: 1200, title: "Junior Analyst" },
    { level: 3, min: 1200, max: 2500, title: "Analytics Engineer" },
    { level: 4, min: 2500, max: 5000, title: "Senior Analytics Engineer" },
    { level: 5, min: 5000, max: 10000, title: "Staff Analytics Architect" },
  ];

  const current = levels.find((l) => xp >= l.min && xp < l.max) || levels[levels.length - 1];
  const range = current.max - current.min;
  const earnedInRange = xp - current.min;
  const progressPct = Math.min(100, Math.round((earnedInRange / range) * 100));

  return {
    level: current.level,
    title: current.title,
    nextLevelXP: current.max,
    progressPct,
  };
}

/**
 * Returns overall discipline stats for command center and streak badges.
 */
export async function getDisciplineSummary(userId: string = "user_default"): Promise<DisciplineStats> {
  const profile = (await db.userProfile.findFirst({ where: { id: userId } })) || {
    id: userId,
    dailyStudyGoal: 6,
    currentStreak: 12,
    longestStreak: 15,
    totalStudyMins: 2840,
    xp: 1450,
    level: 3,
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySessions = await db.studySession.findMany({
    where: {
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  const todayStudyMins = todaySessions.reduce((acc, s) => acc + s.durationMins, 0);

  const recentSessions = await db.studySession.findMany({
    orderBy: { createdAt: "desc" },
    take: 7,
  });

  return {
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    totalStudyHours: Math.round((profile.totalStudyMins / 60) * 10) / 10,
    totalStudyMins: profile.totalStudyMins,
    xp: profile.xp,
    level: profile.level,
    todayStudyMins,
    dailyGoalHours: profile.dailyStudyGoal,
    attendancePct: Math.min(100, Math.round((todayStudyMins / (profile.dailyStudyGoal * 60)) * 100)),
    recentSessions: recentSessions.map((s) => ({
      date: s.createdAt.toISOString().slice(0, 10),
      durationMins: s.durationMins,
      notes: s.notes,
    })),
  };
}
