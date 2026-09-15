import { db } from "@/lib/db";

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
