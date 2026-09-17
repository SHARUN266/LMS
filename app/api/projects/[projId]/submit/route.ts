import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluateCapstoneProject } from "@/lib/ai";

export async function POST(
  req: Request,
  { params }: { params: { projId: string } }
) {
  try {
    const { projId } = params;
    const body = await req.json();
    const { githubUrl, summaryText, projectZip } = body;

    if (!summaryText && !githubUrl) {
      return NextResponse.json(
        { error: "GitHub URL or summary deliverable text is required" },
        { status: 400 }
      );
    }

    let project = await db.project.findUnique({
      where: { id: projId },
      include: { milestones: true, module: true },
    });

    if (!project) {
      project = await db.project.findFirst({
        include: { milestones: true, module: true },
      });
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // --- 1. Evaluate with Gemini 2.0 Flash / Hybrid AI ---
    const evalResult = await evaluateCapstoneProject(
      project.title,
      project.businessBrief,
      githubUrl,
      summaryText
    );

    const overallScore = evalResult.overallScore;
    const technicalScore = evalResult.technicalScore;
    const businessScore = evalResult.businessScore;
    const recruiterSummary = evalResult.recruiterSummary;
    const detailedFeedback = evalResult.feedback;

    // --- 2. Save Submission ---
    const submission = await db.projectSubmission.create({
      data: {
        projectId: project.id,
        githubUrl: githubUrl || "",
        projectZip: projectZip || null,
        summaryText: summaryText || "Capstone submission",
      },
    });

    // --- 3. Save Evaluation ---
    const evaluation = await db.projectEvaluation.create({
      data: {
        submissionId: submission.id,
        overallScore,
        technicalScore,
        businessScore,
        recruiterSummary,
        feedback: detailedFeedback,
      },
    });

    // --- 4. Mark all milestones completed & award XP ---
    await db.projectMilestone.updateMany({
      where: { projectId: project.id },
      data: { isCompleted: true },
    });

    const user = await db.userProfile.findFirst();
    if (user) {
      await db.userProfile.update({
        where: { id: user.id },
        data: {
          xp: user.xp + 500,
          level: Math.max(user.level, 4),
        },
      });
    }

    return NextResponse.json({
      submissionId: submission.id,
      evaluationId: evaluation.id,
      overallScore,
      technicalScore,
      businessScore,
      recruiterSummary,
      feedback: detailedFeedback,
      success: true,
    });
  } catch (error: any) {
    console.error("Project submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit capstone project", details: error.message },
      { status: 500 }
    );
  }
}
