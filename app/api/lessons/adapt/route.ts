import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callGemini } from "@/lib/ai";
import { detectWeakTopics } from "@/lib/adaptive";

export type AdaptMode = "staff" | "beginner" | "case_study" | "hinglish";

export async function POST(req: Request) {
  try {
    const { dayId, mode = "case_study", customTopic } = await req.json();

    if (!dayId) {
      return NextResponse.json({ error: "dayId is required" }, { status: 400 });
    }

    // 1. Fetch Day and Lesson
    let day = await db.day.findUnique({
      where: { id: dayId },
      include: {
        lesson: true,
        week: { include: { module: true } },
      },
    });

    if (!day) {
      const match = dayId.match(/\d+/);
      const dayNum = match ? parseInt(match[0], 10) : 1;
      day = await db.day.findFirst({
        where: { dayNumber: dayNum },
        include: {
          lesson: true,
          week: { include: { module: true } },
        },
      });
    }

    if (!day) {
      return NextResponse.json({ error: "Day not found" }, { status: 404 });
    }

    // 2. Fetch User Context & Weak Topics
    const profile = await db.userProfile.findFirst();
    let weakTopicsList: string[] = [];
    try {
      const topics = await detectWeakTopics();
      weakTopicsList = topics.filter((t) => t.score < 75).map((t) => t.topic);
    } catch {}

    const originalContent = day.lesson?.content || `Topic: ${day.title}\nObjective: ${day.objective}`;
    const moduleTitle = day.week?.module?.title || "Data Analytics";

    // 3. Define Mode Guidelines
    const modeInstructions: Record<AdaptMode, string> = {
      staff: `Rewrite this lesson as a Staff Analytics Engineer & Tech Lead at a Tier-1 Tech Company.
Focus on:
- Production architectural trade-offs, scalability, and computational cost
- Under-the-hood engine mechanics (B-Tree indexes, partition hashing, buffer memory traps)
- Anti-patterns to strictly avoid under 100M+ row tables
- Clean, production-grade SQL/Python with EXPLAIN query plan tips`,

      beginner: `Rewrite this lesson using the 'Explain Like I'm 10' principle.
Focus on:
- Zero heavy jargon; use intuitive everyday analogies (e.g., library bookshelves, grocery checkout counters, phone contact lists)
- Step-by-step visual mental models showing how rows move
- Clear diagrams in ascii/text format
- Gentle, confidence-building explanations that make complex joins or window functions feel effortless`,

      case_study: `Rewrite this lesson as a Real-World High-Growth Tech Case Study (e.g. Swiggy delivery surges, Zepto 10-min fulfillment, Razorpay merchant settlements, or Netflix subscription churn).
Focus on:
- The exact business crisis or executive KPI decision needed
- How the data schemas connect (Orders, Customers, Deliveries, Payments)
- The exact query or transformation that solved the problem and saved millions
- Executive takeaway for a Business Analyst in a 12 LPA role`,

      hinglish: `Rewrite this lesson as a friendly, top-tier Indian Tech Mentor explaining 1-on-1 in crisp, natural technical Hinglish.
Focus on:
- Conversational, practical explanation that cuts through academic complexity
- Clear English code blocks and technical keywords (JOINs, Window Functions, Partition, Aggregation) explained with relatable Indian tech context (Blinkit dark stores, UPI transactions, Zomato orders)
- Common interview traps that Indian GCC and product companies ask candidates`,
    };

    const instruction = modeInstructions[mode as AdaptMode] || modeInstructions.case_study;

    const systemPrompt = `You are Axiom, the Principal Learning Architect for Praxis OS (12 LPA Bootcamp).
Your task is to rewrite the lesson theory into a crisp, high-impact personalized masterclass.

${instruction}

CRITICAL RULES:
- Keep the output punchy, structured, and fast-reading (around 220-300 words max).
- Include 1 clean, production-grade SQL code snippet with explanatory comments.
- Use bolding, bullet points, and an interview tip at the end.`;

    const userPrompt = `
Topic: ${day.title}
Module: ${moduleTitle}
Core Learning Objective: ${day.objective}
Learner Target Role: ${profile?.targetRole || "Business Analyst (12 LPA Track)"}
${customTopic ? `Special Learner Focus: ${customTopic}` : ""}

Original Lesson Content for Reference:
\`\`\`markdown
${originalContent.slice(0, 2000)}
\`\`\`

Transform this lesson into the requested '${mode.toUpperCase()}' format.`;

    const adaptedContent = await callGemini(userPrompt, systemPrompt, false);

    return NextResponse.json({
      success: true,
      mode,
      dayId: day.id,
      dayNumber: day.dayNumber,
      title: day.title,
      adaptedContent: adaptedContent.trim(),
    });
  } catch (error: any) {
    console.error("Lesson adaptation error:", error);
    return NextResponse.json(
      { error: "Failed to adapt lesson", details: error.message },
      { status: 500 }
    );
  }
}
