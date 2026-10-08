import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evaluateCodeSubmission } from "@/lib/ai";
import { validateSQLSubmission, isUnchangedStarterCode } from "@/lib/sql-validator";
import {
  validatePythonStructure,
  validateExcelSubmission,
  validatePowerBISubmission,
  validateGitHubSubmission,
  validateDocumentStructure,
} from "@/lib/submission-validators";
import { extractAllFileContents } from "@/lib/file-parser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const assignmentId = body.assignmentId;
    const submittedCode = body.submittedCode || body.code || "";
    const notes = body.notes || "";
    const fileUrls = body.fileUrls ? (Array.isArray(body.fileUrls) ? JSON.stringify(body.fileUrls) : String(body.fileUrls)) : null;
    const screenshotUrls = body.screenshotUrls ? (Array.isArray(body.screenshotUrls) ? JSON.stringify(body.screenshotUrls) : String(body.screenshotUrls)) : null;
    const externalUrl = body.externalUrl || null;
    const submissionType = body.submissionType || (fileUrls ? "FILE" : externalUrl ? "URL" : "CODE");

    const hasDeliverable = Boolean(
      (submittedCode && submittedCode.trim().length > 0) ||
      fileUrls ||
      screenshotUrls ||
      externalUrl
    );

    if (!assignmentId || !hasDeliverable) {
      return NextResponse.json(
        { error: "assignmentId and at least one deliverable (code, file, URL, or screenshot) are required" },
        { status: 400 }
      );
    }

    let assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        questions: true,
        day: {
          include: { practice: true },
        },
      },
    });

    if (!assignment) {
      const match = assignmentId.match(/\d+/);
      const dayNum = match ? parseInt(match[0], 10) : 1;
      const targetDay = await db.day.findFirst({
        where: { dayNumber: dayNum },
      });
      if (targetDay) {
        assignment = await db.assignment.findFirst({
          where: { dayId: targetDay.id },
          include: {
            questions: true,
            day: {
              include: { practice: true },
            },
          },
        });
      }
    }

    if (!assignment) {
      assignment = await db.assignment.findFirst({
        include: {
          questions: true,
          day: {
            include: { practice: true },
          },
        },
      });
    }

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const questionPrompt = assignment.questions[0]?.prompt || assignment.description;
    const starterCode = assignment.questions[0]?.starterCode || null;
    const referenceSolution = (assignment.questions[0] as any)?.referenceSolution || null;
    const category = assignment.type || "SQL";

    // --- STEP 0: Strict Guard: Reject Unmodified Starter Code & Trivial Queries ---
    if (submittedCode && submissionType === "CODE" && isUnchangedStarterCode(submittedCode, starterCode)) {
      const submission = await (db.submission as any).create({
        data: {
          assignmentId: assignment.id,
          submittedCode: submittedCode,
          notes: notes || "",
          fileUrls: fileUrls,
          screenshotUrls: screenshotUrls,
          externalUrl: externalUrl,
          submissionType: submissionType,
          status: "EVALUATED",
        },
      });

      const evaluation = await db.evaluation.create({
        data: {
          submissionId: submission.id,
          score: 0,
          passed: false,
          strengths: JSON.stringify([]),
          weakAreas: JSON.stringify([
            "Submitted default starter code without changes",
            "Did not implement required analytical query logic",
          ]),
          rubricScores: JSON.stringify({
            correctness: 0,
            queryLogic: 0,
            edgeCases: 0,
            performance: 0,
            readability: 0,
            explanation: 0,
          }),
          codeDiff: referenceSolution || "-- Please write your analytical query to solve the problem.",
          detailedFeedback:
            "❌ Submission Rejected (Score: 0%)\n\nYou submitted the initial starter template without implementing the solution query. To earn a passing score (>= 70%), you must write a query that fulfills the mission requirements and queries the required sandbox tables.",
          remedialTasks: JSON.stringify(["Review the lesson concepts and write an analytical query for Day 1"]),
        },
      });

      return NextResponse.json({
        submissionId: submission.id,
        evaluationId: evaluation.id,
        score: 0,
        passed: false,
        deterministic: {
          isExecutable: false,
          correctnessScore: 0,
          rowCount: 0,
          columnMatch: false,
          rowMatch: false,
          orderMatch: false,
          feedback: ["Unchanged starter template submitted. Score: 0%."],
        },
        strengths: [],
        weakAreas: [
          "Submitted default starter code without changes",
          "Did not implement required analytical query logic",
        ],
        rubricScores: {
          correctness: 0,
          queryLogic: 0,
          edgeCases: 0,
          performance: 0,
          readability: 0,
          explanation: 0,
        },
        codeDiff: referenceSolution || "-- Please write your analytical query to solve the problem.",
        detailedFeedback:
          "❌ Submission Rejected (Score: 0%)\n\nYou submitted the initial starter template without implementing the solution query. To earn a passing score (>= 70%), you must write a query that fulfills the mission requirements.",
        remedialTasks: ["Review the lesson concepts and write an analytical query for Day 1"],
        success: true,
      });
    }

    // --- STEP 0.5: Deep File Content Extraction ---
    let extractedContent = "";
    try {
      // Parse file URLs from the JSON string
      let filesToParse: string[] = [];
      if (fileUrls) {
        try {
          const parsed = JSON.parse(fileUrls);
          filesToParse = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          filesToParse = [fileUrls];
        }
      }

      if (filesToParse.length > 0) {
        extractedContent = await extractAllFileContents(filesToParse);
        console.log(`[Deep Evaluation] Extracted ${extractedContent.length} chars from ${filesToParse.length} file(s)`);
      }
    } catch (extractErr) {
      console.warn("File content extraction note (non-blocking):", extractErr);
    }

    // --- STEP 1: Deterministic Execution & Validation (0 - 40 pts) ---
    let deterministicResult: any = {
      isExecutable: true,
      correctnessScore: 20,
      rowCount: 1,
      columnMatch: true,
      rowMatch: true,
      orderMatch: true,
      feedback: ["Syntax structure verified."],
    };

    const upperCategory = (category || "").toUpperCase();

    if (upperCategory.includes("SQL")) {
      // Deterministic SQL execution against SQLite sandbox with gold-standard comparison
      deterministicResult = await validateSQLSubmission(submittedCode, referenceSolution);
    } else if (upperCategory.includes("PYTHON")) {
      deterministicResult = validatePythonStructure(submittedCode, fileUrls, externalUrl, extractedContent);
    } else if (upperCategory.includes("POWER_BI") || upperCategory.includes("DAX")) {
      deterministicResult = validatePowerBISubmission(submittedCode, externalUrl, screenshotUrls, fileUrls, extractedContent);
    } else if (upperCategory.includes("EXCEL")) {
      deterministicResult = validateExcelSubmission(fileUrls, screenshotUrls, notes, submittedCode, extractedContent);
    } else if (upperCategory.includes("DBT") || upperCategory.includes("GIT")) {
      deterministicResult = await validateGitHubSubmission(externalUrl || submittedCode);
    } else {
      deterministicResult = validateDocumentStructure(submittedCode, fileUrls, notes, extractedContent);
    }

    // --- STEP 2: Qualitative AI Evaluation via Gemini ---
    let aiEvalResult = {
      score: 0,
      passed: false,
      strengths: [] as string[],
      weakAreas: ["Query does not fully fulfill analytical criteria"],
      rubricScores: {
        correctness: deterministicResult.correctnessScore,
        queryLogic: 0,
        edgeCases: 0,
        performance: 0,
        readability: 0,
        explanation: 0,
      },
      codeDiff: referenceSolution || submittedCode,
      detailedFeedback: "Submission evaluated under strict 12 LPA analytical criteria.",
      remedialTasks: ["Review required table joins and aggregations"],
    };

    let deliverableAudit = "";
    if (fileUrls) deliverableAudit += `\n[Uploaded Files]: ${fileUrls}`;
    if (screenshotUrls) deliverableAudit += `\n[Screenshots Attached]: ${screenshotUrls}`;
    if (externalUrl) deliverableAudit += `\n[External Deliverable URL]: ${externalUrl}`;

    // Inject extracted file content for Gemini deep analysis
    const fileExtraction = extractedContent || deterministicResult.extractedContent || "";
    if (fileExtraction.length > 0) {
      deliverableAudit += `\n\n═══ EXTRACTED FILE CONTENT (Evaluate the actual deliverable below) ═══\n${fileExtraction}`;
    }

    const enrichedNotes = `${notes || ""}${deliverableAudit}`;

    try {
      const geminiResponse = await evaluateCodeSubmission(
        submittedCode,
        assignment.title,
        questionPrompt,
        category,
        referenceSolution,
        enrichedNotes
      );
      aiEvalResult = {
        ...aiEvalResult,
        ...geminiResponse,
        rubricScores: {
          ...geminiResponse.rubricScores,
          correctness: deterministicResult.correctnessScore,
          explanation: enrichedNotes.trim().length > 15 ? 5 : 1,
        },
      };
    } catch (aiErr) {
      console.warn("AI evaluation fallback mode:", aiErr);
    }

    // --- STEP 3: Combine Scores with Deterministic Correctness ---
    const adminConfig = await db.adminConfig.findFirst().catch(() => null);
    const passingThreshold = adminConfig?.passingThreshold ?? 70;

    const rubricScores = aiEvalResult.rubricScores;

    // Strict scoring formula: If deterministic correctness is 0, maximum partial credit is capped at 20%
    let calculatedTotalScore = 0;
    if (deterministicResult.correctnessScore > 0) {
      calculatedTotalScore = Math.min(
        100,
        (deterministicResult.correctnessScore || 0) +
          (rubricScores.queryLogic || 0) +
          (rubricScores.edgeCases || 0) +
          (rubricScores.performance || 0) +
          (rubricScores.readability || 0) +
          (rubricScores.explanation || 0)
      );
    } else {
      calculatedTotalScore = Math.min(20, (rubricScores.queryLogic || 0) + (rubricScores.readability || 0));
    }

    const finalPassed = calculatedTotalScore >= passingThreshold;

    // --- STEP 4: Save Submission & Evaluation ---
    const submission = await (db.submission as any).create({
      data: {
        assignmentId: assignment.id,
        submittedCode: submittedCode,
        notes: notes || "",
        fileUrls: fileUrls,
        screenshotUrls: screenshotUrls,
        externalUrl: externalUrl,
        submissionType: submissionType,
        status: "EVALUATED",
      },
    });

    const evaluation = await db.evaluation.create({
      data: {
        submissionId: submission.id,
        score: calculatedTotalScore,
        passed: finalPassed,
        strengths: JSON.stringify(aiEvalResult.strengths),
        weakAreas: JSON.stringify(aiEvalResult.weakAreas),
        rubricScores: JSON.stringify(rubricScores),
        codeDiff: aiEvalResult.codeDiff || submittedCode,
        detailedFeedback: `${aiEvalResult.detailedFeedback}\n\n[Deterministic Engine Notes]: ${deterministicResult.feedback.join(" ")}`,
        remedialTasks: JSON.stringify(aiEvalResult.remedialTasks),
      },
    });

    // --- STEP 5: Auto-commit Day Progression, Next Day Unlocking & XP Award ---
    let nextDayData: { id: string; dayNumber: number; moduleId: string } | null = null;

    if (finalPassed && assignment.day) {
      const currentDay = assignment.day;

      // 1. Mark current day as completed in database
      await db.day.update({
        where: { id: currentDay.id },
        data: {
          isCompleted: true,
          score: Math.max(calculatedTotalScore, currentDay.score || 0),
        },
      });

      // 2. Find and unlock next sequential day in curriculum
      const nextDay = await db.day.findFirst({
        where: {
          dayNumber: currentDay.dayNumber + 1,
        },
        include: {
          week: { include: { module: true } },
        },
      });

      if (nextDay) {
        await db.day.update({
          where: { id: nextDay.id },
          data: { isUnlocked: true },
        });

        nextDayData = {
          id: nextDay.id,
          dayNumber: nextDay.dayNumber,
          moduleId: nextDay.week?.module?.id || (currentDay as any).week?.module?.id || "module-1",
        };

        // Trigger adaptive assignment for next day based on identified weak areas
        try {
          const { generateAdaptiveAssignmentForNextDay } = await import("@/lib/adaptive");
          await generateAdaptiveAssignmentForNextDay(
            nextDay.id,
            calculatedTotalScore,
            aiEvalResult.weakAreas || [],
            60
          );
        } catch (adaptErr) {
          console.warn("Adaptive assignment trigger note:", adaptErr);
        }
      }

      // 3. Award +100 XP to user profile & update active day
      const user = await db.userProfile.findFirst();
      if (user) {
        await db.userProfile.update({
          where: { id: user.id },
          data: {
            xp: user.xp + 100,
            activeDayId: nextDay ? nextDay.id : currentDay.id,
          },
        });
      }
    } else if (!finalPassed || (aiEvalResult.weakAreas && aiEvalResult.weakAreas.length > 0)) {
      // Auto-create Backlog and Remedial Drill if not passed
      const topicName = aiEvalResult.weakAreas[0] || "SQL Window Framing & Joins";

      await db.remedialDrill.create({
        data: {
          topic: topicName,
          title: `Remedial Drill: Master ${topicName}`,
          difficulty: "Medium",
          problem: `Based on your recent assignment attempt (Score: ${calculatedTotalScore}%), complete this focused drill on: ${topicName}.`,
          starterCode: aiEvalResult.codeDiff || "-- Write corrected query here",
          solution: aiEvalResult.codeDiff || "-- Ideal solution",
          isCompleted: false,
        },
      });

      if (!finalPassed) {
        await db.backlogItem.create({
          data: {
            title: `Redo Assignment: ${assignment.title}`,
            topic: assignment.title,
            dueOriginal: new Date(),
            scheduledFor: new Date(Date.now() + 86400000),
            isCompleted: false,
          },
        });
      }
    }

    // ── Clean Skill Mastery Update (Passing Threshold >= 75%) ──
    try {
      const dayRecord = assignment.day;
      if (dayRecord) {
        await db.skill.updateMany({
          where: { dayId: dayRecord.id },
          data: {
            masteryScore: finalPassed ? Math.min(1.0, calculatedTotalScore / 100) : 0.4,
            lastPracticed: new Date(),
          },
        });
      }
    } catch (skillErr) {
      console.warn("Skill mastery update note:", skillErr);
    }

    return NextResponse.json({
      submissionId: submission.id,
      evaluationId: evaluation.id,
      score: calculatedTotalScore,
      passed: finalPassed,
      nextDay: nextDayData,
      deterministic: deterministicResult,
      strengths: aiEvalResult.strengths,
      weakAreas: aiEvalResult.weakAreas,
      rubricScores: rubricScores,
      codeDiff: aiEvalResult.codeDiff,
      detailedFeedback: evaluation.detailedFeedback,
      remedialTasks: aiEvalResult.remedialTasks,
      success: true,
    });
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: "Evaluation failed", details: error.message },
      { status: 500 }
    );
  }
}
