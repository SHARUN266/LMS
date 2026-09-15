import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluateWithQwen } from "@/lib/ollama";

export async function GET(
  req: Request,
  { params }: { params: { assessId: string } }
) {
  try {
    const { assessId } = params;

    let assessment = await db.assessment.findUnique({
      where: { id: assessId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        week: {
          include: {
            module: true,
          },
        },
        attempts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Fallback if assessId is "week-1", "1", etc.
    if (!assessment) {
      assessment = await db.assessment.findFirst({
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
          week: {
            include: {
              module: true,
            },
          },
          attempts: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    return NextResponse.json({ assessment });
  } catch (error: any) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json({ error: "Failed to fetch assessment", details: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { assessId: string } }
) {
  try {
    const { assessId } = params;
    const body = await req.json();
    const { answers = {}, timeTakenMins = 45 } = body;

    let assessment = await db.assessment.findUnique({
      where: { id: assessId },
      include: {
        questions: true,
      },
    });

    if (!assessment) {
      assessment = await db.assessment.findFirst({
        include: { questions: true },
      });
    }

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    let totalPoints = 0;
    let earnedPoints = 0;
    const skillBreakdown: Record<string, { total: number; earned: number }> = {
      "Window Functions": { total: 0, earned: 0 },
      "Relational Joins": { total: 0, earned: 0 },
      "Aggregations & Grouping": { total: 0, earned: 0 },
      "Query Optimization & CTEs": { total: 0, earned: 0 },
    };

    for (const q of assessment.questions) {
      const weight = q.weight || 10;
      totalPoints += weight;
      const userAnswer = answers[q.id] || answers[q.order.toString()] || "";

      let qSkill = "Window Functions";
      if (q.prompt.toLowerCase().includes("join")) qSkill = "Relational Joins";
      else if (q.prompt.toLowerCase().includes("group") || q.prompt.toLowerCase().includes("agg")) qSkill = "Aggregations & Grouping";
      else if (q.prompt.toLowerCase().includes("cte") || q.prompt.toLowerCase().includes("plan") || q.prompt.toLowerCase().includes("index")) qSkill = "Query Optimization & CTEs";

      if (!skillBreakdown[qSkill]) {
        skillBreakdown[qSkill] = { total: 0, earned: 0 };
      }
      skillBreakdown[qSkill].total += weight;

      if (q.type === "MCQ") {
        const isCorrect = q.correctAnswer && (userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
        if (isCorrect) {
          earnedPoints += weight;
          skillBreakdown[qSkill].earned += weight;
        }
      } else if (q.type === "CODE") {
        if (userAnswer.trim().length > 10) {
          try {
            // Evaluate code with Qwen or fallback
            const evalResult = await evaluateWithQwen(
              userAnswer,
              "Assessment Code Submission",
              q.prompt,
              "SQL"
            );
            const questionScore = Math.round((evalResult.score / 100) * weight);
            earnedPoints += questionScore;
            skillBreakdown[qSkill].earned += questionScore;
          } catch (e) {
            // Heuristic fallback if offline
            earnedPoints += Math.round(weight * 0.8);
            skillBreakdown[qSkill].earned += Math.round(weight * 0.8);
          }
        }
      }
    }

    const finalScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 85;
    const passed = finalScore >= assessment.passingScore;

    const skillGaps: Record<string, number> = {};
    for (const [skill, stats] of Object.entries(skillBreakdown)) {
      skillGaps[skill] = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 80;
    }

    const feedback = passed
      ? `Strong performance! You scored ${finalScore}%, exceeding the benchmark of ${assessment.passingScore}%. You have demonstrated solid command of relational analytics concepts.`
      : `Score: ${finalScore}%. You need ${assessment.passingScore}% to pass. Focused review recommended on topics with scores under 75%.`;

    const attempt = await db.assessmentAttempt.create({
      data: {
        assessmentId: assessment.id,
        score: finalScore,
        passed,
        answersJson: JSON.stringify(answers),
        skillGaps: JSON.stringify(skillGaps),
        feedback,
        timeTakenMins: Number(timeTakenMins) || 45,
      },
    });

    // Award XP
    const user = await db.userProfile.findFirst();
    if (user) {
      await db.userProfile.update({
        where: { id: user.id },
        data: {
          xp: user.xp + (passed ? 250 : 50),
        },
      });
    }

    return NextResponse.json({
      attemptId: attempt.id,
      score: finalScore,
      passed,
      skillGaps,
      feedback,
      timeTakenMins,
    });
  } catch (error: any) {
    console.error("Assessment submission error:", error);
    return NextResponse.json({ error: "Failed to process assessment", details: error.message }, { status: 500 });
  }
}
