import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// DELETE /api/mentor/sessions/[id] — Delete session and its messages
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await db.mentorSession.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("Error deleting mentor session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/mentor/sessions/[id] — Update session title or mode
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { title, mode } = body;

    const dataToUpdate: any = {};
    if (typeof title === "string") dataToUpdate.title = title.trim();
    if (typeof mode === "string") dataToUpdate.mode = mode;

    const updated = await db.mentorSession.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ session: updated });
  } catch (error: any) {
    console.error("Error updating mentor session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
