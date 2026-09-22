import { NextResponse } from "next/server";
import { getOrGenerateAssignment } from "@/lib/dynamic-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { dayId, difficulty, forceRegenerate } = body;

    if (!dayId) {
      return NextResponse.json({ error: "dayId is required" }, { status: 400 });
    }

    const assignment = await getOrGenerateAssignment(dayId, "user_default", {
      difficulty: difficulty === "hard" ? "hard" : "standard",
      forceRegenerate: Boolean(forceRegenerate),
    });

    return NextResponse.json({
      success: true,
      assignment,
      message: forceRegenerate
        ? "Successfully regenerated 12 LPA assignment with AI"
        : "Assignment retrieved / synthesized successfully",
    });
  } catch (error: any) {
    console.error("Error generating dynamic assignment:", error);
    return NextResponse.json(
      { error: "Failed to generate dynamic assignment", details: error.message },
      { status: 500 }
    );
  }
}
