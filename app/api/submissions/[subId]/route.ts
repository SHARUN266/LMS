import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { subId: string } }
) {
  try {
    const { subId } = params;

    let submission = null;

    if (subId === "latest") {
      submission = await db.submission.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          evaluation: true,
          assignment: {
            include: {
              questions: true,
              day: {
                include: {
                  week: true,
                },
              },
            },
          },
        },
      });
    } else {
      submission = await db.submission.findUnique({
        where: { id: subId },
        include: {
          evaluation: true,
          assignment: {
            include: {
              questions: true,
              day: {
                include: {
                  week: true,
                },
              },
            },
          },
        },
      });
    }

    if (!submission) {
      // Fallback: Check if we have any evaluation in the system
      const fallbackEvaluation = await db.evaluation.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          submission: {
            include: {
              assignment: {
                include: {
                  questions: true,
                  day: true,
                },
              },
            },
          },
        },
      });

      if (fallbackEvaluation) {
        submission = {
          ...fallbackEvaluation.submission,
          evaluation: fallbackEvaluation,
        };
      }
    }

    if (!submission) {
      return NextResponse.json({ error: "No evaluation/submission found yet. Submit an assignment first!" }, { status: 404 });
    }

    return NextResponse.json({ submission });
  } catch (error: any) {
    console.error("Error fetching submission:", error);
    return NextResponse.json({ error: "Failed to fetch submission", details: error.message }, { status: 500 });
  }
}
