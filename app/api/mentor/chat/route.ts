import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { askMentorQwen } from "@/lib/ollama";

export async function GET() {
  const messages = await db.mentorMessage.findMany({
    orderBy: { createdAt: "asc" },
    take: 50,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
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

    // Get response from Qwen 2.5 Coder
    const aiResponse = await askMentorQwen(message, formattedHistory, context);

    // Save Mentor response
    const savedMentorMsg = await db.mentorMessage.create({
      data: {
        sender: "mentor",
        message: aiResponse,
        context: context || "",
      },
    });

    return NextResponse.json({ message: savedMentorMsg.message });
  } catch (error: any) {
    console.error("Mentor chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
