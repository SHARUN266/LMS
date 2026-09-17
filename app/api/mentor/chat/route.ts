import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatWithMentor, MentorMode } from "@/lib/ai";
import { detectWeakTopics } from "@/lib/adaptive";

export async function GET() {
  try {
    const messages = await db.mentorMessage.findMany({
      orderBy: { createdAt: "asc" },
      take: 50,
    });
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching mentor messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { message, context, mode = "socratic" } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Save User message
    await db.mentorMessage.create({
      data: {
        sender: "user",
        message: message,
        context: context || "",
      },
    });

    // Fetch past conversation
    const history = await db.mentorMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    const formattedHistory = history.reverse().map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.message,
    }));

    // Inject learner profile & real weak areas as rich context
    let richContext = context || "Module 1: Advanced SQL for Analytics Engineering";
    try {
      const profile = await db.userProfile.findFirst();
      const weakTopics = await detectWeakTopics();
      const weakList = weakTopics.filter((t) => t.score < 75).map((t) => `${t.topic} (${t.score}%)`);

      richContext = `${richContext}
Student: ${profile?.name || "Learner"} (Target Role: ${profile?.targetRole || "BI / Analytics Engineer"}, Level: ${profile?.level || 1}, Streak: ${profile?.currentStreak || 1} Days)
Identified Weak Topics to Reinforce: ${weakList.length > 0 ? weakList.join(", ") : "All core concepts proficient"}
Selected Mentor Mode: ${mode.toUpperCase()}
`;
    } catch {}

    // Get response from Gemini 2.0 Flash / Hybrid AI
    const aiResponse = await chatWithMentor(message, formattedHistory, richContext, mode as MentorMode);

    // Save Mentor response
    const savedMentorMsg = await db.mentorMessage.create({
      data: {
        sender: "mentor",
        message: aiResponse,
        context: context || "",
      },
    });

    return NextResponse.json({ message: savedMentorMsg.message, mode });
  } catch (error: any) {
    console.error("Mentor chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
