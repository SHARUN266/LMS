import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluateCapstoneProject } from "@/lib/ai";

export async function GET(
  req: Request,
  { params }: { params: { projId: string } }
) {
  try {
    const { projId } = params;

    let project = await db.project.findUnique({
      where: { id: projId },
      include: {
        milestones: {
          orderBy: { dayNumber: "asc" },
        },
        module: {
          include: {
            track: true,
          },
        },
        submissions: {
          include: {
            evaluation: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Fallback if projId is "capstone-1" or "1"
    if (!project) {
      project = await db.project.findFirst({
        include: {
          milestones: {
            orderBy: { dayNumber: "asc" },
          },
          module: {
            include: {
              track: true,
            },
          },
          submissions: {
            include: {
              evaluation: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project", details: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { projId: string } }
) {
  try {
    const body = await req.json();
    const { milestoneId, isCompleted } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId is required" }, { status: 400 });
    }

    const milestone = await db.projectMilestone.update({
      where: { id: milestoneId },
      data: { isCompleted: Boolean(isCompleted) },
    });

    return NextResponse.json({ milestone, success: true });
  } catch (error: any) {
    console.error("Error updating milestone:", error);
    return NextResponse.json({ error: "Failed to update milestone", details: error.message }, { status: 500 });
  }
}

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
        { error: "Summary text or GitHub URL is required" },
        { status: 400 }
      );
    }

    let project = await db.project.findUnique({
      where: { id: projId },
    });

    if (!project) {
      project = await db.project.findFirst();
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create Submission
    const submission = await db.projectSubmission.create({
      data: {
        projectId: project.id,
        githubUrl: githubUrl || "",
        projectZip: projectZip || null,
        summaryText: summaryText || "Capstone submission",
      },
    });

    // Generate comprehensive evaluation via Gemini 2.0 Flash / Hybrid AI
    const evalResult = await evaluateCapstoneProject(
      project.title,
      project.businessBrief,
      githubUrl,
      summaryText
    );

    const evaluation = await db.projectEvaluation.create({
      data: {
        submissionId: submission.id,
        overallScore: evalResult.overallScore,
        technicalScore: evalResult.technicalScore,
        businessScore: evalResult.businessScore,
        recruiterSummary: evalResult.recruiterSummary,
        feedback: evalResult.feedback,
      },
    });

    // Update user profile XP
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
      overallScore: evaluation.overallScore,
      technicalScore: evaluation.technicalScore,
      businessScore: evaluation.businessScore,
      recruiterSummary: evaluation.recruiterSummary,
      feedback: evaluation.feedback,
      success: true,
    });
  } catch (error: any) {
    console.error("Project submission error:", error);
    return NextResponse.json({ error: "Failed to submit project", details: error.message }, { status: 500 });
  }
}
