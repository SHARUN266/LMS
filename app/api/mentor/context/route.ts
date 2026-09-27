import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { detectWeakTopics } from "@/lib/adaptive";

/**
 * Returns personalized mentor UI context:
 * - Dynamic suggestion chips based on real learner data
 * - Personalized greeting with name, current module, streak
 * - Summary stats for the mentor header
 */
export async function GET() {
  try {
    const profile = await db.userProfile.findFirst();
    const learnerName = profile?.name || "Learner";

    // ── Current position in curriculum ──────────────────────────
    let currentModuleTitle = "";
    let currentDayTitle = "";
    let nextDayTitle = "";
    let overallPct = 0;

    const modules = await db.module.findMany({
      orderBy: { order: "asc" },
      include: {
        weeks: {
          include: {
            days: {
              select: { id: true, dayNumber: true, title: true, isCompleted: true },
              orderBy: { dayNumber: "asc" },
            },
          },
          orderBy: { weekNumber: "asc" },
        },
      },
    });

    let totalDays = 0;
    let completedDays = 0;
    let foundCurrent = false;

    for (const mod of modules) {
      const allDays = mod.weeks.flatMap((w) => w.days);
      totalDays += allDays.length;
      completedDays += allDays.filter((d) => d.isCompleted).length;

      if (!foundCurrent) {
        for (const day of allDays) {
          if (!day.isCompleted && !foundCurrent) {
            currentModuleTitle = mod.title;
            currentDayTitle = `Day ${day.dayNumber}: ${day.title}`;
            foundCurrent = true;
          } else if (foundCurrent && !nextDayTitle && !day.isCompleted) {
            nextDayTitle = `Day ${day.dayNumber}: ${day.title}`;
          }
        }
      }
    }

    overallPct = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    // Override from profile if set
    if (profile?.activeDayId) {
      try {
        const activeDay = await db.day.findUnique({
          where: { id: profile.activeDayId },
          include: { week: { include: { module: true } } },
        });
        if (activeDay) {
          currentModuleTitle = activeDay.week.module.title;
          currentDayTitle = `Day ${activeDay.dayNumber}: ${activeDay.title}`;
        }
      } catch {}
    }

    // ── Weak topics ────────────────────────────────────────────
    let weakTopicNames: string[] = [];
    let strongTopicNames: string[] = [];
    try {
      const topics = await detectWeakTopics();
      weakTopicNames = topics.filter((t) => t.score < 75).map((t) => t.topic);
      strongTopicNames = topics.filter((t) => t.score >= 85).map((t) => t.topic);
    } catch {}

    // ── Recent assignment scores ───────────────────────────────
    const recentEvals = await db.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    const avgScore =
      recentEvals.length > 0
        ? Math.round(recentEvals.reduce((a, b) => a + b.score, 0) / recentEvals.length)
        : 0;
    const lastScore = recentEvals[0]?.score || null;
    const lastPassed = recentEvals[0]?.passed ?? null;

    // ── Pending work ───────────────────────────────────────────
    const pendingDrills = await db.remedialDrill.count({ where: { isCompleted: false } });
    const pendingBacklog = await db.backlogItem.count({ where: { isCompleted: false } });

    // ── Build dynamic suggestion chips per mode ────────────────
    const dynamicChips: Record<string, string[]> = {
      socratic: [],
      debugger: [
        "Why is my query returning duplicates?",
        "Check for non-SARGable conditions",
      ],
      business: [
        "Explain Customer Lifetime Value formula",
        "How to compute 30-day repeat rate?",
      ],
      interview: [
        "Ask me a Window Function problem",
      ],
    };

    // Socratic — personalized
    if (currentDayTitle) {
      dynamicChips.socratic.push(`${currentDayTitle} mein mujhe help chahiye`);
    }
    if (weakTopicNames.length > 0) {
      dynamicChips.socratic.push(`${weakTopicNames[0]} samjhao`);
    }
    dynamicChips.socratic.push("Ab mujhe kya padhna chahiye?");
    dynamicChips.socratic.push("Mera overall progress kya hai?");

    // Business — tie to current module
    if (currentModuleTitle) {
      dynamicChips.business.unshift(`${currentModuleTitle} ka business impact kya hai?`);
    }

    // Interview — tie to weak areas
    if (weakTopicNames.length > 0) {
      dynamicChips.interview.unshift(`Meri weakness ${weakTopicNames[0]} pe interview lo`);
    }
    if (avgScore > 0) {
      dynamicChips.interview.push(
        avgScore >= 80
          ? "Am I ready for a 12 LPA interview?"
          : "Mujhe interview ready hone ke liye kya karna chahiye?"
      );
    }

    // ── Personalized greeting ──────────────────────────────────
    let greeting = `Hey **${learnerName}**! 👋 Main **Axiom** hoon — tumhara personal Staff Analytics Copilot.`;

    if (currentDayTitle && currentModuleTitle) {
      greeting += ` Tum abhi **${currentModuleTitle}** mein ho — **${currentDayTitle}** pe kaam kar rahe ho.`;
    }

    if (overallPct > 0) {
      greeting += ` Overall progress **${overallPct}%** hai.`;
    }

    if (weakTopicNames.length > 0) {
      greeting += ` Tumhare weak areas: **${weakTopicNames.slice(0, 2).join(", ")}** — isme practice karo.`;
    }

    if (lastScore !== null) {
      greeting += ` Last assignment score: **${lastScore}%** ${lastPassed ? "✅" : "❌"}.`;
    }

    greeting += ` Kuch bhi puchho — main tumhare data ke hisaab se guide karunga! 🚀`;

    return NextResponse.json({
      greeting,
      learnerName,
      currentModule: currentModuleTitle,
      currentDay: currentDayTitle,
      nextDay: nextDayTitle,
      overallProgress: overallPct,
      completedDays,
      totalDays,
      avgScore,
      lastScore,
      lastPassed,
      weakTopics: weakTopicNames,
      strongTopics: strongTopicNames,
      pendingDrills,
      pendingBacklog,
      streak: profile?.currentStreak || 0,
      level: profile?.level || 1,
      xp: profile?.xp || 0,
      dynamicChips,
    });
  } catch (error: any) {
    console.error("Error fetching mentor context:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
