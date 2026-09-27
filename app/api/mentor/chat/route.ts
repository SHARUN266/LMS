import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatWithMentor, MentorMode } from "@/lib/ai";
import { buildMentorContext } from "@/lib/mentor-context";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    let whereClause: any = {};
    if (sessionId) {
      whereClause.sessionId = sessionId;
    }

    const messages = await db.mentorMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching mentor messages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function deriveSessionTitle(message: string): string {
  const clean = message.replace(/[\n\r]+/g, " ").trim();
  if (clean.length <= 36) return clean;
  return clean.slice(0, 33).trim() + "...";
}

export async function POST(req: Request) {
  try {
    const { message, context, mode = "socratic", sessionId } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Resolve or create target session
    let targetSessionId = sessionId;
    let targetSession = null;

    if (targetSessionId) {
      targetSession = await db.mentorSession.findUnique({
        where: { id: targetSessionId },
      });
    }

    if (!targetSession) {
      targetSession = await db.mentorSession.create({
        data: {
          title: deriveSessionTitle(message),
          mode: mode,
        },
      });
      targetSessionId = targetSession.id;
    } else if (
      targetSession.title === "New Session" ||
      targetSession.title === "New Chat"
    ) {
      // Auto-title session from the first meaningful message
      const updatedTitle = deriveSessionTitle(message);
      await db.mentorSession.update({
        where: { id: targetSessionId },
        data: { title: updatedTitle, mode },
      });
      targetSession.title = updatedTitle;
    }

    // 2. Save User message
    await db.mentorMessage.create({
      data: {
        sessionId: targetSessionId,
        sender: "user",
        message: message,
        context: context || "",
      },
    });

    // 3. Fetch past conversation SCOPED to this session for contextual integrity
    const history = await db.mentorMessage.findMany({
      where: { sessionId: targetSessionId },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    const formattedHistory = history.reverse().map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.message,
    }));

    // 4. Build comprehensive learner context from platform data
    const mentorCtx = await buildMentorContext(context, mode);

    // 5. Get response from Gemini / Axiom AI
    const aiResponse = await chatWithMentor(
      message,
      formattedHistory,
      mentorCtx.contextString,
      mode as MentorMode
    );

    // 6. Save Mentor response
    const savedMentorMsg = await db.mentorMessage.create({
      data: {
        sessionId: targetSessionId,
        sender: "mentor",
        message: aiResponse,
        context: context || "",
      },
    });

    // 7. Touch session updatedAt and mode
    await db.mentorSession.update({
      where: { id: targetSessionId },
      data: {
        updatedAt: new Date(),
        mode,
      },
    });

    return NextResponse.json({
      message: savedMentorMsg.message,
      mode,
      sessionId: targetSessionId,
      sessionTitle: targetSession.title,
    });
  } catch (error: any) {
    console.error("Axiom chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
