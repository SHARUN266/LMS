import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAdaptiveAssignmentForNextDay } from "@/lib/adaptive";

export async function GET(
  req: Request,
  { params }: { params: { dayId: string } }
) {
  try {
    const { dayId } = params;

    let day = await db.day.findUnique({
      where: { id: dayId },
      include: {
        lesson: true,
        practice: {
          orderBy: { order: "asc" },
        },
        assignments: {
          include: {
            questions: {
              orderBy: { order: "asc" },
            },
            submissions: {
              include: {
                evaluation: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        week: {
          include: {
            module: {
              include: {
                track: true,
              },
            },
            days: {
              select: {
                id: true,
                dayNumber: true,
                title: true,
                isUnlocked: true,
                isCompleted: true,
                score: true,
              },
              orderBy: { dayNumber: "asc" },
            },
          },
        },
      },
    });

    // If not found by exact ID, fallback search by dayNumber if dayId is like "day-2" or "2"
    if (!day) {
      const match = dayId.match(/\d+/);
      const dayNum = match ? parseInt(match[0], 10) : 1;
      day = await db.day.findFirst({
        where: { dayNumber: dayNum },
        include: {
          lesson: true,
          practice: {
            orderBy: { order: "asc" },
          },
          assignments: {
            include: {
              questions: {
                orderBy: { order: "asc" },
              },
              submissions: {
                include: {
                  evaluation: true,
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
          week: {
            include: {
              module: {
                include: {
                  track: true,
                },
              },
              days: {
                select: {
                  id: true,
                  dayNumber: true,
                  title: true,
                  isUnlocked: true,
                  isCompleted: true,
                  score: true,
                },
                orderBy: { dayNumber: "asc" },
              },
            },
          },
        },
      });
    }

    if (!day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // ── Attach Knowledge Graph Micro-Skills ──
    const daySkills = await db.skill.findMany({
      where: { dayId: day.id },
      include: {
        prerequisites: {
          include: { fromSkill: true },
        },
      },
    });
    (day as any).skills = daySkills;

    // ── JIT Content Synthesis (if lesson is missing or placeholder) ──
    if (!day.lesson || !day.lesson.content || day.lesson.content.length < 200) {
      try {
        const { synthesizeLessonOnDemand } = await import("@/lib/content-synthesizer");
        const freshLesson = await synthesizeLessonOnDemand(day.id);
        (day as any).lesson = freshLesson;
      } catch (synthErr) {
        console.warn("JIT lesson synthesis note:", synthErr);
      }
    }

    // ── Knowledge Graph Prerequisite Verification ──
    let prerequisiteWarnings: any[] = [];
    if (daySkills && daySkills.length > 0) {
      try {
        const { checkPrerequisitesMet } = await import("@/lib/knowledge-graph");
        for (const sk of daySkills) {
          const check = await checkPrerequisitesMet(sk.slug);
          if (!check.met) {
            prerequisiteWarnings.push(...check.unmetPrerequisites);
          }
        }
      } catch (prereqErr) {
        console.warn("Prereq check note:", prereqErr);
      }
    }

    return NextResponse.json({
      day,
      prerequisiteWarnings,
    });
  } catch (error: any) {
    console.error("Error fetching day:", error);
    return NextResponse.json({ error: "Failed to fetch day", details: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { dayId: string } }
) {
  try {
    const { dayId } = params;
    const body = await req.json().catch(() => ({}));
    const { isCompleted, score, theoryCompleted, practiceCompleted } = body;

    // Find target day
    let day = await db.day.findUnique({
      where: { id: dayId },
    });

    if (!day) {
      const match = dayId.match(/\d+/);
      const dayNum = match ? parseInt(match[0], 10) : 1;
      day = await db.day.findFirst({
        where: { dayNumber: dayNum },
      });
    }

    if (!day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    const updatedDay = await db.day.update({
      where: { id: day.id },
      data: {
        ...(isCompleted !== undefined ? { isCompleted } : {}),
        ...(score !== undefined ? { score } : {}),
        ...(theoryCompleted !== undefined ? { theoryCompleted } : {}),
        ...(practiceCompleted !== undefined ? { practiceCompleted } : {}),
      },
    });

    // If day was marked completed, check if today's POTD is completed before unlocking next day
    let potdGateLocked = false;
    let nextDayUnlocked = false;

    if (isCompleted) {
      const todayKey = new Date().toISOString().split("T")[0];
      const { hasSolvedTodayPOTD } = await import("@/lib/potd");
      const potdSolved = await hasSolvedTodayPOTD(todayKey);

      const nextDay = await db.day.findFirst({
        where: {
          dayNumber: day.dayNumber + 1,
        },
      });

      if (potdSolved) {
        if (nextDay) {
          await db.day.update({
            where: { id: nextDay.id },
            data: { isUnlocked: true },
          });
          nextDayUnlocked = true;

          // Trigger AI Adaptive Assignment Generation for Next Day based on today's performance
          try {
            const latestEval = await db.evaluation.findFirst({
              orderBy: { createdAt: "desc" },
              include: { submission: true },
            });
            const weakAreas = latestEval?.weakAreas ? JSON.parse(latestEval.weakAreas) : [];
            await generateAdaptiveAssignmentForNextDay(
              nextDay.id,
              score ?? latestEval?.score ?? 80,
              Array.isArray(weakAreas) ? weakAreas : [],
              60
            );
          } catch (adaptErr) {
            console.warn("Adaptive generation trigger note:", adaptErr);
          }
        }
      } else {
        potdGateLocked = true;
      }

      // Award XP to user profile
      const user = await db.userProfile.findFirst();
      if (user) {
        await db.userProfile.update({
          where: { id: user.id },
          data: {
            xp: user.xp + 100,
            activeDayId: nextDay ? nextDay.id : day.id,
          },
        });
      }
    }

    return NextResponse.json({
      day: updatedDay,
      success: true,
      potdGateLocked,
      nextDayUnlocked,
      message: potdGateLocked
        ? "Today's POTD (Problem of the Day) must be completed before unlocking Next Day's curriculum!"
        : undefined,
    });
  } catch (error: any) {
    console.error("Error updating day:", error);
    return NextResponse.json({ error: "Failed to update day", details: error.message }, { status: 500 });
  }
}
