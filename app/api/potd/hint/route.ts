import { NextResponse } from "next/server";
import { getTodayPOTD } from "@/lib/potd";
import { callGemini } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { currentCode, runtimeError } = await req.json();

    const potd = await getTodayPOTD();

    const prompt = `You are Axiom, a Staff Analytics Engineer & Socratic Mentor.
The student is working on today's Daily Problem of the Day (POTD).

Company & Problem: ${potd.company} - ${potd.title}
Problem Concept: ${potd.concept}
Business Objective: ${potd.thinkingFramework.businessObjective}
Corner Cases & Traps: ${potd.thinkingFramework.cornerCasesAndTraps.join("; ")}
Reference Solution (CONFIDENTIAL - DO NOT REVEAL):
${potd.solution}

Student's Current Query:
\`\`\`sql
${currentCode || "-- No query written yet"}
\`\`\`

Runtime / Evaluation Feedback:
${runtimeError || "Student is stuck or asking for conceptual guidance."}

INSTRUCTIONS:
1. Act as a high-tier mentor.
2. In 2-3 concise sentences, guide the student towards finding the logical trap or missing relational step themselves.
3. NEVER provide the complete SQL answer or reveal the reference code.
4. Highlight which part of their thinking (e.g. Grain, Filtering order, Join direction, Null handling, Aggregate vs Non-aggregate) needs attention.
5. Tone: Encouraging, sharp, technical, and respectful. Use clear Hinglish/English.`;

    const aiResponse = await callGemini(prompt, "You are Axiom, an expert analytics engineering mentor specializing in Socratic teaching.");

    return NextResponse.json({
      success: true,
      hint: aiResponse.trim(),
    });
  } catch (error: any) {
    console.error("POTD Hint error:", error);
    return NextResponse.json({
      success: true,
      hint: "Review your JOIN condition and check whether you are filtering completed orders before aggregating.",
    });
  }
}
