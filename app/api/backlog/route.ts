import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const backlogItems = await db.backlogItem.findMany({
      orderBy: [{ isCompleted: "asc" }, { scheduledFor: "asc" }],
    });

    const remedialDrills = await db.remedialDrill.findMany({
      orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ backlogItems, remedialDrills });
  } catch (error: any) {
    console.error("Error fetching backlog:", error);
    return NextResponse.json({ error: "Failed to fetch backlog", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { type, id, isCompleted } = body;

    if (!id || !type) {
      return NextResponse.json({ error: "id and type (backlog|drill) are required" }, { status: 400 });
    }

    if (type === "drill") {
      const drill = await db.remedialDrill.update({
        where: { id },
        data: { isCompleted: Boolean(isCompleted) },
      });
      return NextResponse.json({ item: drill, success: true });
    } else {
      const item = await db.backlogItem.update({
        where: { id },
        data: { isCompleted: Boolean(isCompleted) },
      });
      return NextResponse.json({ item, success: true });
    }
  } catch (error: any) {
    console.error("Error updating backlog item:", error);
    return NextResponse.json({ error: "Failed to update backlog item", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, topic, dueOriginal, scheduledFor } = body;

    if (!title || !topic) {
      return NextResponse.json({ error: "title and topic are required" }, { status: 400 });
    }

    const item = await db.backlogItem.create({
      data: {
        title,
        topic,
        dueOriginal: dueOriginal ? new Date(dueOriginal) : new Date(),
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        isCompleted: false,
      },
    });

    return NextResponse.json({ item, success: true });
  } catch (error: any) {
    console.error("Error creating backlog item:", error);
    return NextResponse.json({ error: "Failed to create backlog item", details: error.message }, { status: 500 });
  }
}
