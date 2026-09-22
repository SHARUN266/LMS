import { NextResponse } from "next/server";
import { getTodayPOTD, hasSolvedTodayPOTD, submitPOTDSolution } from "@/lib/potd";

export async function GET() {
  try {
    const potd = await getTodayPOTD();
    const isSolved = await hasSolvedTodayPOTD(potd.dateKey);

    return NextResponse.json({
      success: true,
      potd: {
        id: potd.id,
        dateKey: potd.dateKey,
        company: potd.company,
        title: potd.title,
        difficulty: potd.difficulty,
        concept: potd.concept,
        scenario: potd.scenario,
        starterCode: potd.starterCode,
        testScenarios: potd.testScenarios,
        isSolved,
      },
    });
  } catch (error: any) {
    console.error("GET POTD error:", error);
    return NextResponse.json({ error: "Failed to fetch today's POTD" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { submittedCode, dateKey } = await req.json();

    if (!submittedCode) {
      return NextResponse.json({ error: "submittedCode is required" }, { status: 400 });
    }

    const effectiveDateKey = dateKey || new Date().toISOString().split("T")[0];
    const result = await submitPOTDSolution(submittedCode, effectiveDateKey);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("POST POTD error:", error);
    return NextResponse.json({ error: "Failed to evaluate POTD submission" }, { status: 500 });
  }
}
