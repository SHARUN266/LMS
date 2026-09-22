import { NextResponse } from "next/server";
import { getOrGenerateCapstone } from "@/lib/dynamic-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { moduleId } = body;

    if (!moduleId) {
      return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
    }

    const project = await getOrGenerateCapstone(moduleId, "user_default");

    return NextResponse.json({
      success: true,
      project,
      message: "Successfully generated 7-Day Capstone project with AI",
    });
  } catch (error: any) {
    console.error("Error generating dynamic capstone project:", error);
    return NextResponse.json(
      { error: "Failed to generate dynamic capstone project", details: error.message },
      { status: 500 }
    );
  }
}
