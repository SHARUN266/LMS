/**
 * Mentor Context Builder
 * 
 * Aggregates the learner's full journey into a structured context string
 * that gets injected into the Mentor AI system prompt. This makes the mentor
 * deeply aware of the student's progress, scores, weaknesses, and next steps.
 */

import { db } from "@/lib/db";
import { detectWeakTopics, TopicCompetency } from "@/lib/adaptive";

export interface MentorContext {
  contextString: string;
  learnerName: string;
  weakTopics: TopicCompetency[];
}

/**
 * Builds a comprehensive learner context for the Mentor AI.
 * Queries all relevant tables and compiles a detailed snapshot.
 */
export async function buildMentorContext(
  frontendContext?: string,
  mode?: string
): Promise<MentorContext> {
  // Default fallback context
  const fallback: MentorContext = {
    contextString: frontendContext || "General Business Analytics & Financial Modeling",
    learnerName: "Learner",
    weakTopics: [],
  };

  try {
    // ── 1. User Profile ─────────────────────────────────────────
    const profile = await db.userProfile.findFirst();
    const learnerName = profile?.name || "Learner";

    // ── 2. Weak Topics (from adaptive engine) ───────────────────
    let weakTopics: TopicCompetency[] = [];
    try {
      weakTopics = await detectWeakTopics();
    } catch {}

    const weakList = weakTopics
      .filter((t) => t.score < 75)
      .map((t) => `${t.topic} (${t.score}%, ${t.status})`);

    const strongList = weakTopics
      .filter((t) => t.score >= 85)
      .map((t) => `${t.topic} (${t.score}%)`);

    // ── 3. Curriculum Progress (Modules → Days) ─────────────────
    const modules = await db.module.findMany({
      orderBy: { order: "asc" },
      include: {
        weeks: {
          include: {
            days: {
              select: {
                id: true,
                dayNumber: true,
                title: true,
                isCompleted: true,
                score: true,
              },
              orderBy: { dayNumber: "asc" },
            },
          },
          orderBy: { weekNumber: "asc" },
        },
      },
    });

    let totalDays = 0;
    let completedDays = 0;
    let currentModuleName = "";
    let currentDayTitle = "";
    let nextDayTitle = "";
    let foundCurrent = false;

    const moduleProgressLines: string[] = [];

    for (const mod of modules) {
      const allDays = mod.weeks.flatMap((w) => w.days);
      const modCompleted = allDays.filter((d) => d.isCompleted).length;
      const modTotal = allDays.length;
      totalDays += modTotal;
      completedDays += modCompleted;

      const pct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;
      const status = pct === 100 ? "✅ Completed" : pct > 0 ? `🔄 ${pct}% Done` : "🔒 Not Started";
      moduleProgressLines.push(`  • Module ${mod.order}: ${mod.title} [${modCompleted}/${modTotal} days] — ${status}`);

      // Identify current & next day
      if (!foundCurrent) {
        for (const day of allDays) {
          if (!day.isCompleted && !foundCurrent) {
            currentModuleName = mod.title;
            currentDayTitle = `Day ${day.dayNumber}: ${day.title}`;
            foundCurrent = true;
          } else if (foundCurrent && !nextDayTitle && !day.isCompleted) {
            nextDayTitle = `Day ${day.dayNumber}: ${day.title}`;
          }
        }
      }
    }

    // Override with user profile's active IDs if available
    if (profile?.activeDayId) {
      try {
        const activeDay = await db.day.findUnique({
          where: { id: profile.activeDayId },
          include: { week: { include: { module: true } } },
        });
        if (activeDay) {
          currentModuleName = activeDay.week.module.title;
          currentDayTitle = `Day ${activeDay.dayNumber}: ${activeDay.title}`;
        }
      } catch {}
    }

    const overallPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    // ── 4. Recent Evaluations (Assignment Scores) ───────────────
    const recentEvals = await db.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        submission: {
          include: {
            assignment: { select: { title: true } },
          },
        },
      },
    });

    const evalLines: string[] = recentEvals.map((ev) => {
      const assignTitle = ev.submission?.assignment?.title || "Assignment";
      const passLabel = ev.passed ? "✅ Passed" : "❌ Failed";
      return `  • ${assignTitle}: ${ev.score}% ${passLabel}`;
    });

    const evalScores = recentEvals.map((e) => e.score);
    const avgEvalScore = evalScores.length > 0
      ? Math.round(evalScores.reduce((a, b) => a + b, 0) / evalScores.length)
      : 0;

    // ── 5. Project & Capstone Status ────────────────────────────
    const projects = await db.project.findMany({
      include: {
        milestones: true,
        submissions: { include: { evaluation: true } },
        module: { select: { title: true } },
      },
    });

    const projectLines: string[] = projects.map((p) => {
      const done = p.milestones.filter((m) => m.isCompleted).length;
      const total = p.milestones.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      const latestEval = p.submissions?.[0]?.evaluation;
      const evalStr = latestEval ? ` | Evaluation: ${latestEval.overallScore}%` : "";
      return `  • ${p.title} (${p.module.title}): ${done}/${total} milestones (${pct}%)${evalStr}`;
    });

    // ── 6. Backlog & Remedial Drills ────────────────────────────
    const pendingBacklog = await db.backlogItem.count({ where: { isCompleted: false } });
    const pendingDrills = await db.remedialDrill.count({ where: { isCompleted: false } });

    // ── 7. Study Activity ───────────────────────────────────────
    const totalStudyHours = profile?.totalStudyMins
      ? Math.round((profile.totalStudyMins / 60) * 10) / 10
      : 0;

    // ── 8. Assessment History ───────────────────────────────────
    const assessmentAttempts = await db.assessmentAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        assessment: { select: { title: true } },
      },
    });

    const assessmentLines: string[] = assessmentAttempts.map((a) => {
      const passLabel = a.passed ? "✅ Passed" : "❌ Failed";
      return `  • ${a.assessment.title}: ${a.score}% ${passLabel} (${a.timeTakenMins} mins)`;
    });

    // ──────────────────────────────────────────────────────────────
    // Compile the full context string
    // ──────────────────────────────────────────────────────────────

    const contextString = `
═══ LEARNER PROFILE ═══
Name: ${learnerName}
Target Role: ${profile?.targetRole || "BI / Analytics Engineer"}
Coding Background: JavaScript Developer transitioning to Data Engineering / Analytics (Always bridge data concepts to JS mental models like Array.map/filter/reduce, closures, and object lookups!)
Experience Level: ${profile?.experienceLevel || "Beginner-Intermediate"}
XP: ${profile?.xp || 0} | Level: ${profile?.level || 1}
Elo Rating: ${(profile as any)?.eloRating || 1200} (Calibrated Challenge Target: ${((profile as any)?.eloRating || 1200) + 50})
Modality Preference: ${(profile as any)?.modalityPreference || "VIDEO_CODE"} (Visual & Audio learner - keep explanations concise with direct JS code analogies!)
Current Streak: ${profile?.currentStreak || 0} days | Longest: ${profile?.longestStreak || 0} days
Total Study Hours: ${totalStudyHours}h | Daily Goal: ${profile?.dailyStudyGoal || 6}h

═══ LEARNING PATH POSITION ═══
Current Module: ${currentModuleName || "Not started yet"}
Current Day: ${currentDayTitle || "Not started yet"}
Next Up: ${nextDayTitle || "Complete current day first"}
Overall Progress: ${completedDays}/${totalDays} days completed (${overallPct}%)

═══ MODULE-WISE PROGRESS ═══
${moduleProgressLines.join("\n")}

═══ SKILL COMPETENCY ═══
Weak Areas (need reinforcement): ${weakList.length > 0 ? weakList.join(", ") : "None identified yet"}
Strong Areas (mastered): ${strongList.length > 0 ? strongList.join(", ") : "Keep practicing!"}

═══ RECENT ASSIGNMENT SCORES (last 5) ═══
${evalLines.length > 0 ? evalLines.join("\n") : "  No assignments evaluated yet."}
Average Score: ${avgEvalScore > 0 ? `${avgEvalScore}%` : "N/A"}

═══ ASSESSMENT HISTORY (last 3) ═══
${assessmentLines.length > 0 ? assessmentLines.join("\n") : "  No assessments attempted yet."}

═══ PROJECT STATUS ═══
${projectLines.length > 0 ? projectLines.join("\n") : "  No projects started yet."}

═══ PENDING WORK ═══
Backlog Items: ${pendingBacklog} pending
Remedial Drills: ${pendingDrills} pending

═══ MENTOR SESSION ═══
Mode: ${(mode || "socratic").toUpperCase()}
Page Context: ${frontendContext || "General"}
`.trim();

    return {
      contextString,
      learnerName,
      weakTopics,
    };
  } catch (err) {
    console.error("Error building mentor context:", err);
    return fallback;
  }
}
