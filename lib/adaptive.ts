import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai";

export interface TopicCompetency {
  topic: string;
  score: number; // 0 - 100
  status: "Mastered" | "Proficient" | "Needs Practice";
  attemptsCount: number;
}

/**
 * Aggregates all evaluations and assessment attempts to identify weak skill areas.
 */
export async function detectWeakTopics(userId: string = "user_default"): Promise<TopicCompetency[]> {
  const evaluations = await db.evaluation.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const attempts = await db.assessmentAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const topicScores: Record<string, { total: number; count: number }> = {
    "Window Functions": { total: 88, count: 1 },
    "Relational Joins & Fan-out": { total: 92, count: 1 },
    "Aggregations & Grouping": { total: 84, count: 1 },
    "Common Table Expressions (CTEs)": { total: 85, count: 1 },
    "Query Optimization & Indexing": { total: 72, count: 1 },
    "NULL Handling & Coalescing": { total: 65, count: 1 },
  };

  // Incorporate evaluation weak areas
  evaluations.forEach((e) => {
    try {
      const weak = JSON.parse(e.weakAreas);
      if (Array.isArray(weak)) {
        weak.forEach((w) => {
          if (!topicScores[w]) topicScores[w] = { total: 0, count: 0 };
          topicScores[w].total += Math.max(40, e.score - 20);
          topicScores[w].count += 1;
        });
      }
    } catch {}
  });

  // Incorporate assessment attempt skill radar
  attempts.forEach((a) => {
    try {
      const gaps = JSON.parse(a.skillGaps);
      if (typeof gaps === "object") {
        Object.entries(gaps).forEach(([topic, scoreVal]) => {
          const numScore = Number(scoreVal) || 70;
          if (!topicScores[topic]) topicScores[topic] = { total: 0, count: 0 };
          topicScores[topic].total += numScore;
          topicScores[topic].count += 1;
        });
      }
    } catch {}
  });

  return Object.entries(topicScores).map(([topic, stats]) => {
    const avg = Math.round(stats.total / stats.count);
    let status: "Mastered" | "Proficient" | "Needs Practice" = "Needs Practice";
    if (avg >= 85) status = "Mastered";
    else if (avg >= 70) status = "Proficient";

    return {
      topic,
      score: avg,
      status,
      attemptsCount: stats.count,
    };
  });
}

/**
 * Automatically creates remedial drills in the backlog for any topic scoring under 75%.
 */
export async function generateAdaptiveSchedule(weakTopics: TopicCompetency[]) {
  const needsPractice = weakTopics.filter((t) => t.score < 75);
  const createdDrills = [];

  for (const topicItem of needsPractice) {
    // Check if drill already exists for this topic
    const existing = await db.remedialDrill.findFirst({
      where: { topic: topicItem.topic, isCompleted: false },
    });

    if (!existing) {
      const drill = await db.remedialDrill.create({
        data: {
          topic: topicItem.topic,
          title: `Adaptive Mastery Drill: ${topicItem.topic}`,
          difficulty: topicItem.score < 60 ? "Beginner-Intermediate" : "Intermediate",
          problem: `Your concept score for ${topicItem.topic} is currently ${topicItem.score}%. Practice this focused drill to reach the 80%+ mastery benchmark.`,
          starterCode: `-- Focus Drill on ${topicItem.topic}\nSELECT * FROM orders;`,
          solution: `-- Ideal solution for ${topicItem.topic}`,
          isCompleted: false,
        },
      });
      createdDrills.push(drill);
    }
  }

  return createdDrills;
}

/**
 * Generates an adaptive assignment for the next day based on today's evaluation score,
 * identified weak areas, and study performance.
 */
export async function generateAdaptiveAssignmentForNextDay(
  nextDayId: string,
  todayScore: number,
  todayWeakAreas: string[],
  studyMins: number = 60
): Promise<boolean> {
  try {
    const nextDay = await db.day.findUnique({
      where: { id: nextDayId },
      include: {
        assignments: {
          include: { questions: true },
        },
      },
    });

    if (!nextDay || !nextDay.assignments || nextDay.assignments.length === 0) {
      return false;
    }

    const targetAssignment = nextDay.assignments[0];
    const baseQuestion = targetAssignment.questions[0];

    // Determine adaptive strategy
    const isStruggling = todayScore < 75 || todayWeakAreas.length > 0;
    const isHighPerformer = todayScore >= 88;
    const focusArea =
      todayWeakAreas[0] ||
      (isHighPerformer
        ? "Advanced Edge-Case Optimization"
        : "Core Relational Mechanics");

    let promptContext = "";
    let adaptiveReason = "";

    if (isStruggling) {
      adaptiveReason = `Adaptive Focus: Your previous evaluation highlighted a key growth area in '${focusArea}'. This assignment weaves in targeted reinforcement for this concept.`;
      promptContext = `The student scored ${todayScore}% and struggled with: ${
        todayWeakAreas.join(", ") || focusArea
      }.
Adapt the assignment problem for '${nextDay.title}' (Objective: '${
        nextDay.objective
      }') to weave in reinforcement of ${focusArea}, ensuring they practice handling this edge case properly.`;
    } else {
      adaptiveReason = `12 LPA Top-Tier Escalation: Outstanding performance (${todayScore}%) on your previous assignment! This assignment has been elevated with high-complexity interview challenges.`;
      promptContext = `The student scored an impressive ${todayScore}%.
Elevate the assignment for '${nextDay.title}' (Objective: '${
        nextDay.objective
      }') into a 12 LPA top-tier interview challenge with multi-table partitioning, tie handling, and execution efficiency.`;
    }

    // Call Gemini 2.5 Flash to generate custom adaptive prompt and starter code
    const systemPrompt = `You are a Principal Analytics Engineering Instructor at a top-tier tech bootcamp.
Return ONLY valid JSON with keys:
"prompt": string (A realistic, enterprise business scenario problem statement based on the input context),
"starterCode": string (SQL starter template),
"weight": number (100)`;

    try {
      const aiResponse = await callGemini(
        promptContext,
        systemPrompt,
        true
      );

      const parsed = JSON.parse(aiResponse);
      if (parsed.prompt && parsed.starterCode) {
        if (baseQuestion) {
          await db.assignmentQuestion.update({
            where: { id: baseQuestion.id },
            data: {
              prompt: parsed.prompt,
              starterCode: parsed.starterCode,
              isAdaptive: true,
              adaptiveReason,
            },
          });
        }
        return true;
      }
    } catch (aiErr) {
      console.warn("AI adaptive generation fallback:", aiErr);
    }

    // Fallback if AI call failed
    if (baseQuestion) {
      await db.assignmentQuestion.update({
        where: { id: baseQuestion.id },
        data: {
          isAdaptive: true,
          adaptiveReason,
          prompt: `[Adaptive Mission • Focus: ${focusArea}]\n\n${baseQuestion.prompt}\n\n*Special Requirement*: Explicitly account for and validate ${focusArea} in your query output.`,
        },
      });
    }

    return true;
  } catch (error) {
    console.error("Error generating adaptive assignment:", error);
    return false;
  }
}
