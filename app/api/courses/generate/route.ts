import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      role = "Data Analyst & Analytics Engineer (12 LPA GCC Track)",
      domain = "E-Commerce & FinTech (Swiggy, Zepto, Razorpay)",
      numModules = 4,
      daysPerModule = 3,
      level = "Beginner-to-Advanced",
    } = body;

    const systemPrompt = `You are a Principal Technical Curriculum Architect at top tech bootcamps (like Masai School / Y Combinator).
Your task is to design an ultra-practical, industry-grade bootcamp curriculum for the given role and domain.

CRITICAL INSTRUCTIONS:
- Generate exactly ${numModules} modules.
- Each module must have exactly ${daysPerModule} intensive production days.
- Total days will be ${numModules * daysPerModule}.
- Day 1 MUST start with fundamental foundations and escalate to enterprise complexity.
- For each day, include:
  1. title (e.g. "Day 1: Multi-Table Joins & Fan-Out Traps")
  2. objective (1-2 sentences on commercial business outcome)
  3. lessonContent (Markdown theory notes with realistic code examples)
  4. cheatSheet (Quick reference production code snippet)
  5. practiceProblem (Scenario, starterCode, and verified solution)
  6. videoSearchQuery (e.g. "Ankit Bansal SQL Joins Masterclass")

Respond strictly in valid JSON matching this schema:
{
  "track": {
    "title": "string",
    "slug": "string",
    "description": "string"
  },
  "modules": [
    {
      "order": 1,
      "title": "Module 1: Production SQL & Relational Modeling",
      "description": "string",
      "icon": "database",
      "days": [
        {
          "dayNumber": 1,
          "title": "string",
          "objective": "string",
          "lessonContent": "string (Markdown with code snippets)",
          "cheatSheet": "string (code)",
          "practice": {
            "title": "string",
            "problem": "string",
            "starterCode": "string",
            "solution": "string"
          },
          "videoSearchQuery": "string"
        }
      ]
    }
  ]
}`;

    const userPrompt = `
Synthesize a brand new Production Course:
- Target Role: ${role}
- Industry Domain: ${domain}
- Modules Count: ${numModules}
- Days Per Module: ${daysPerModule}
- Learner Level: ${level}

Ensure the curriculum teaches real production tools (SQL, Python, Power BI, REST APIs, or Data Warehousing) matching commercial ₹12,00,000+ PA standards.`;

    const rawJson = await callGemini(userPrompt, systemPrompt, true);
    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch (parseErr) {
      console.error("Failed to parse Gemini course JSON:", rawJson);
      return NextResponse.json(
        { error: "AI returned invalid JSON format. Please try again." },
        { status: 500 }
      );
    }

    if (!parsed.track || !Array.isArray(parsed.modules)) {
      return NextResponse.json(
        { error: "AI output structure incomplete. Please try again." },
        { status: 500 }
      );
    }

    // ── Database Insertion via Transaction ───────────────────────
    // 1. Create or update Track
    const slug = `${parsed.track.slug || "custom-track"}-${Date.now().toString(36)}`;
    const track = await db.track.create({
      data: {
        slug,
        title: parsed.track.title || role,
        description: parsed.track.description || `AI-Synthesized career curriculum for ${role}.`,
      },
    });

    let firstDayId: string | null = null;
    let firstModuleId: string | null = null;
    let globalDayCounter = 1;
    let totalDaysCreated = 0;

    for (let mIdx = 0; mIdx < parsed.modules.length; mIdx++) {
      const mod = parsed.modules[mIdx];
      const moduleRecord = await db.module.create({
        data: {
          trackId: track.id,
          order: mod.order || mIdx + 1,
          title: mod.title || `Module ${mIdx + 1}`,
          description: mod.description || "Industry analytics module",
          icon: mod.icon || "database",
        },
      });

      if (mIdx === 0) firstModuleId = moduleRecord.id;

      const weekRecord = await db.week.create({
        data: {
          moduleId: moduleRecord.id,
          weekNumber: mIdx + 1,
          title: `Week ${mIdx + 1}: ${mod.title}`,
        },
      });

      if (Array.isArray(mod.days)) {
        for (let dIdx = 0; dIdx < mod.days.length; dIdx++) {
          const day = mod.days[dIdx];
          const isFirstDay = globalDayCounter === 1;

          const dayRecord = await db.day.create({
            data: {
              weekId: weekRecord.id,
              dayNumber: globalDayCounter,
              title: day.title || `Day ${globalDayCounter}: Core Analytics`,
              objective: day.objective || "Master production analytics skills",
              isUnlocked: isFirstDay, // First day unlocked, others locked
              isCompleted: false,
              estimatedMins: 180,
            },
          });

          if (isFirstDay) firstDayId = dayRecord.id;

          // Create Lesson
          await db.lesson.create({
            data: {
              dayId: dayRecord.id,
              title: day.title,
              content:
                day.lessonContent ||
                `# ${day.title}\n\n## Objective\n${day.objective}\n\nProduction analytics lesson generated dynamically by Axiom.`,
              cheatSheet: day.cheatSheet || "-- Production syntax cheat sheet",
              videoSearchQuery: day.videoSearchQuery || `${day.title} tutorial interview`,
            },
          });

          // Create Practice Exercise if provided
          if (day.practice) {
            await db.practiceExercise.create({
              data: {
                dayId: dayRecord.id,
                order: 1,
                title: day.practice.title || `${day.title} Drill`,
                difficulty: "Intermediate",
                problem:
                  day.practice.problem ||
                  `Solve the following core challenge based on ${day.title}.`,
                starterCode:
                  day.practice.starterCode ||
                  "-- Write your query here\nSELECT * FROM orders LIMIT 10;",
                solution:
                  day.practice.solution ||
                  "SELECT * FROM orders WHERE status = 'COMPLETED';",
                hints: JSON.stringify([
                  "Verify your table joins and aggregation keys.",
                  "Filter defensive NULL values using COALESCE.",
                ]),
              },
            });
          }

          globalDayCounter++;
          totalDaysCreated++;
        }
      }
    }

    // 2. Set user's active module & day to the new course!
    const user = await db.userProfile.findFirst();
    if (user && firstDayId && firstModuleId) {
      await db.userProfile.update({
        where: { id: user.id },
        data: {
          activeModuleId: firstModuleId,
          activeDayId: firstDayId,
          targetRole: role,
        },
      });
    }

    return NextResponse.json({
      success: true,
      trackId: track.id,
      trackTitle: track.title,
      modulesCount: parsed.modules.length,
      daysCount: totalDaysCreated,
      firstDayId,
    });
  } catch (error: any) {
    console.error("AI Course Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate course with AI", details: error.message },
      { status: 500 }
    );
  }
}
