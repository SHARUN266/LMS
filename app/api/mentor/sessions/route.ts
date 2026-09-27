import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/mentor/sessions — List all chat sessions
export async function GET() {
  try {
    let sessions = await db.mentorSession.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    // If no session exists, check if there are legacy orphan messages
    if (sessions.length === 0) {
      const defaultSession = await db.mentorSession.create({
        data: {
          title: "General Analytics Mentorship",
          mode: "socratic",
        },
      });

      // Link any existing orphan messages to this session
      await db.mentorMessage.updateMany({
        where: { sessionId: null },
        data: { sessionId: defaultSession.id },
      });

      sessions = await db.mentorSession.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          _count: {
            select: { messages: true },
          },
        },
      });
    }

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Error fetching mentor sessions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/mentor/sessions — Create a new chat session
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title = "New Session", mode = "socratic" } = body;

    const session = await db.mentorSession.create({
      data: {
        title,
        mode,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Error creating mentor session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
