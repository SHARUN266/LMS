import { db } from "@/lib/db";

/**
 * Workflow State Engine
 * 
 * Computes the deterministic "what should I do right now?" state
 * by querying the DB for the user's current progress.
 * 
 * The daily learning cycle is:
 *   Step 1: LEARN  (Read theory + pass micro-quiz)
 *   Step 2: PRACTICE  (Complete SQL drills in sandbox)
 *   Step 3: ASSIGNMENT  (Submit graded code)
 *   Step 4: EVALUATION  (View AI scorecard, unlock next day)
 * 
 * After all days in a week → ASSESSMENT (weekly timed exam)
 * After all weeks in a module → PROJECT (capstone)
 */

export type WorkflowPhase =
  | "LEARN"
  | "PRACTICE"
  | "ASSIGNMENT"
  | "EVALUATION"
  | "ASSESSMENT"
  | "PROJECT"
  | "ALL_DONE";

export interface WorkflowState {
  /** Which phase of the daily cycle (or meta-cycle) the user is in */
  currentPhase: WorkflowPhase;
  /** 1-4 step within the daily cycle; 0 for meta phases */
  stepNumber: 0 | 1 | 2 | 3 | 4;
  /** The active Day record */
  activeDay: {
    id: string;
    dayNumber: number;
    title: string;
    objective: string;
    estimatedMins: number;
    isCompleted: boolean;
  } | null;
  /** The active Module info */
  activeModule: {
    id: string;
    title: string;
    order: number;
  } | null;
  /** Primary CTA text for the dashboard hero */
  ctaText: string;
  /** Primary CTA href */
  ctaHref: string;
  /** Secondary description */
  ctaDescription: string;
  /** What comes after the current action */
  nextPreview: string;
  /** Whether there are backlog/remedial items pending */
  hasBacklog: boolean;
  /** Count of pending backlog + remedial items */
  backlogCount: number;
  /** Whether a weekly assessment is available (all days in week completed) */
  assessmentAvailable: boolean;
  /** Assessment ID if available */
  assessmentId: string | null;
  /** Whether the capstone project is available (all weeks in module completed) */
  projectAvailable: boolean;
  /** Project ID if available */
  projectId: string | null;
  /** Overall curriculum progress */
  progress: {
    completedDays: number;
    totalDays: number;
    currentDayNumber: number;
    moduleProgress: number; // 0-100
  };
  /** User profile data */
  profile: {
    name: string;
    targetRole: string;
    currentStreak: number;
    longestStreak: number;
    totalStudyMins: number;
    xp: number;
    level: number;
    dailyStudyGoal: number;
  };
}

export async function getWorkflowState(): Promise<WorkflowState> {
  // 1. Get the user profile
  const profile = await db.userProfile.findFirst();
  const userProfile = {
    name: profile?.name || "Learner",
    targetRole: profile?.targetRole || "Business Analyst",
    currentStreak: profile?.currentStreak ?? 0,
    longestStreak: profile?.longestStreak ?? 0,
    totalStudyMins: profile?.totalStudyMins ?? 0,
    xp: profile?.xp ?? 0,
    level: profile?.level ?? 1,
    dailyStudyGoal: profile?.dailyStudyGoal ?? 6,
  };

  // 2. Find the active day (from profile or first uncompleted+unlocked)
  let activeDay = null;
  if (profile?.activeDayId) {
    activeDay = await db.day.findUnique({
      where: { id: profile.activeDayId },
      include: {
        lesson: true,
        practice: true,
        assignments: {
          include: {
            submissions: {
              include: { evaluation: true },
              orderBy: { createdAt: "desc" as const },
              take: 1,
            },
          },
        },
        week: {
          include: {
            module: true,
            assessments: {
              include: {
                attempts: { orderBy: { createdAt: "desc" as const }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  if (!activeDay) {
    activeDay = await db.day.findFirst({
      where: { isCompleted: false, isUnlocked: true },
      orderBy: { dayNumber: "asc" },
      include: {
        lesson: true,
        practice: true,
        assignments: {
          include: {
            submissions: {
              include: { evaluation: true },
              orderBy: { createdAt: "desc" as const },
              take: 1,
            },
          },
        },
        week: {
          include: {
            module: true,
            assessments: {
              include: {
                attempts: { orderBy: { createdAt: "desc" as const }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  // Fallback to day 2 if nothing found
  if (!activeDay) {
    activeDay = await db.day.findFirst({
      where: { dayNumber: 2 },
      include: {
        lesson: true,
        practice: true,
        assignments: {
          include: {
            submissions: {
              include: { evaluation: true },
              orderBy: { createdAt: "desc" as const },
              take: 1,
            },
          },
        },
        week: {
          include: {
            module: true,
            assessments: {
              include: {
                attempts: { orderBy: { createdAt: "desc" as const }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  // 3. Count backlog + remedial items
  const backlogCount = await db.backlogItem.count({ where: { isCompleted: false } });
  const remedialCount = await db.remedialDrill.count({ where: { isCompleted: false } });
  const totalBacklog = backlogCount + remedialCount;

  // 4. Count overall progress
  const totalDays = await db.day.count();
  const completedDays = await db.day.count({ where: { isCompleted: true } });

  // 5. Get module/project info
  const moduleData = activeDay?.week?.module || null;
  let projectAvailable = false;
  let projectId: string | null = null;

  if (moduleData) {
    const project = await db.project.findFirst({
      where: { moduleId: moduleData.id },
    });
    if (project) {
      projectId = project.id;
      // Project is available if all days in the module are completed
      const moduleDays = await db.day.count({
        where: { week: { moduleId: moduleData.id } },
      });
      const moduleCompletedDays = await db.day.count({
        where: { week: { moduleId: moduleData.id }, isCompleted: true },
      });
      projectAvailable = moduleDays > 0 && moduleCompletedDays >= moduleDays;
    }
  }

  // 6. Determine current phase & step
  const dayInfo = activeDay
    ? {
        id: activeDay.id,
        dayNumber: activeDay.dayNumber,
        title: activeDay.title,
        objective: activeDay.objective,
        estimatedMins: activeDay.estimatedMins,
        isCompleted: activeDay.isCompleted,
      }
    : null;

  const moduleInfo = moduleData
    ? { id: moduleData.id, title: moduleData.title, order: moduleData.order }
    : null;

  const moduleId = moduleInfo?.id ? `module-${moduleInfo.order}` : "module-1";
  const dayId = dayInfo?.id || `day-${dayInfo?.dayNumber || 2}`;

  // Check what the user has done today
  let assignment = activeDay?.assignments && activeDay.assignments.length > 0 ? activeDay.assignments[0] : null;

  // If learner has completed theory and practice but assignment is not yet generated, synthesize dynamically with AI!
  if (activeDay?.theoryCompleted && activeDay?.practiceCompleted && !assignment) {
    try {
      const { getOrGenerateAssignment } = await import("@/lib/dynamic-generator");
      assignment = await getOrGenerateAssignment(activeDay.id);
    } catch (err) {
      console.warn("Dynamic assignment generation in workflow error:", err);
    }
  }

  const hasAssignment = Boolean(assignment);
  const hasSubmission = assignment?.submissions && assignment.submissions.length > 0;
  const submission = hasSubmission ? assignment!.submissions[0] : null;
  const hasEvaluation = submission?.evaluation != null;
  const evaluationPassed = submission?.evaluation?.passed ?? false;

  // Check assessment availability
  const assessmentData = activeDay?.week?.assessments?.[0] || null;
  const assessmentId = assessmentData?.id || null;
  const hasAssessmentAttempt =
    assessmentData?.attempts && assessmentData.attempts.length > 0;

  // Weekly assessment is "available" if all days in the week are completed
  let assessmentAvailable = false;
  if (activeDay?.weekId) {
    const weekDays = await db.day.count({ where: { weekId: activeDay.weekId } });
    const weekCompleted = await db.day.count({
      where: { weekId: activeDay.weekId, isCompleted: true },
    });
    assessmentAvailable = weekDays > 0 && weekCompleted >= weekDays;
  }

  // Determine the workflow phase
  let currentPhase: WorkflowPhase;
  let stepNumber: 0 | 1 | 2 | 3 | 4;
  let ctaText: string;
  let ctaHref: string;
  let ctaDescription: string;
  let nextPreview: string;

  if (!dayInfo) {
    // No active day found — all done or data issue
    currentPhase = "ALL_DONE";
    stepNumber = 0;
    ctaText = "View Curriculum Roadmap";
    ctaHref = "/roadmap";
    ctaDescription = "You've completed all available lessons!";
    nextPreview = "Check the roadmap for upcoming modules.";
  } else if (dayInfo.isCompleted) {
    // Current day is already completed — find what's next
    if (assessmentAvailable && !hasAssessmentAttempt) {
      currentPhase = "ASSESSMENT";
      stepNumber = 0;
      ctaText = "Start Weekly Assessment";
      ctaHref = `/assessment/${assessmentId || "week-1"}`;
      ctaDescription = `Week ${activeDay?.week?.weekNumber || 1} checkpoint exam — 90 minutes, timed.`;
      nextPreview = "Complete the assessment to unlock the next week.";
    } else if (projectAvailable) {
      currentPhase = "PROJECT";
      stepNumber = 0;
      ctaText = "Open Capstone Project";
      ctaHref = `/projects/${projectId}`;
      ctaDescription = "All lessons completed! Time for your industry capstone.";
      nextPreview = "7-day portfolio project evaluated by recruiter rubric.";
    } else {
      // Day is completed but there might be a next day
      currentPhase = "LEARN";
      stepNumber = 1;
      const nextDayNum = dayInfo.dayNumber + 1;
      ctaText = `Start Day ${nextDayNum} Lesson`;
      ctaHref = `/learn/${moduleId}/day-${nextDayNum}`;
      ctaDescription = "Previous day completed! Move to the next lesson.";
      nextPreview = `Day ${nextDayNum} theory, practice drills, and graded assignment.`;
    }
  } else if (hasEvaluation) {
    // Has evaluation — show scorecard (Step 4)
    currentPhase = "EVALUATION";
    stepNumber = 4;
    ctaText = evaluationPassed
      ? `View Scorecard & Advance to Day ${dayInfo.dayNumber + 1}`
      : "View Scorecard & Remediation";
    ctaHref = `/evaluation/${submission!.id}`;
    ctaDescription = evaluationPassed
      ? `Day ${dayInfo.dayNumber} scored ${submission!.evaluation!.score}/100. Ready to advance!`
      : `Day ${dayInfo.dayNumber} scored ${submission!.evaluation!.score}/100. Review weak areas.`;
    nextPreview = evaluationPassed
      ? `Unlock Day ${dayInfo.dayNumber + 1} after reviewing your scorecard.`
      : "Complete remedial drills to strengthen weak concepts.";
  } else if (hasSubmission) {
    // Has submission but no evaluation yet — still show evaluation step
    currentPhase = "EVALUATION";
    stepNumber = 4;
    ctaText = "View Evaluation Results";
    ctaHref = `/evaluation/${submission!.id}`;
    ctaDescription = `Assignment submitted! Check your AI-generated scorecard.`;
    nextPreview = "Your submission is being evaluated.";
  } else if (activeDay?.theoryCompleted && activeDay?.practiceCompleted && hasAssignment) {
    // Both theory and practice drills completed — Step 3: Assignment
    currentPhase = "ASSIGNMENT";
    stepNumber = 3;
    ctaText = `Solve Day ${dayInfo.dayNumber} Assignment`;
    ctaHref = `/assignment/${assignment!.id}`;
    ctaDescription = `${assignment!.title} — graded by AI rubric, due tonight.`;
    nextPreview = "After submission, you'll receive an instant scorecard with detailed feedback.";
  } else if (activeDay?.theoryCompleted) {
    // Theory completed — Step 2: Practice Drills
    currentPhase = "PRACTICE";
    stepNumber = 2;
    ctaText = `Practice Day ${dayInfo.dayNumber} Drills`;
    ctaHref = `/practice/${dayId}`;
    ctaDescription = "Interactive SQL sandbox with schema viewer and progressive hints.";
    nextPreview = "Complete practice drills to unlock today's graded assignment.";
  } else {
    // Initial state: Step 1 — Learn Theory & Micro-Quiz
    currentPhase = "LEARN";
    stepNumber = 1;
    ctaText = `Study Day ${dayInfo.dayNumber} Lesson`;
    ctaHref = `/learn/${moduleId}/${dayId}`;
    ctaDescription = `${dayInfo.title} — ${dayInfo.estimatedMins || 180} min estimated.`;
    nextPreview = "Complete the micro-quiz to unlock hands-on practice drills.";
  }

  // Module progress calculation
  let moduleProgress = 0;
  if (moduleData) {
    const moduleTotalDays = await db.day.count({
      where: { week: { moduleId: moduleData.id } },
    });
    const moduleDonedays = await db.day.count({
      where: { week: { moduleId: moduleData.id }, isCompleted: true },
    });
    moduleProgress =
      moduleTotalDays > 0 ? Math.round((moduleDonedays / moduleTotalDays) * 100) : 0;
  }

  return {
    currentPhase,
    stepNumber,
    activeDay: dayInfo,
    activeModule: moduleInfo,
    ctaText,
    ctaHref,
    ctaDescription,
    nextPreview,
    hasBacklog: totalBacklog > 0,
    backlogCount: totalBacklog,
    assessmentAvailable,
    assessmentId,
    projectAvailable,
    projectId,
    progress: {
      completedDays,
      totalDays: totalDays || 6,
      currentDayNumber: dayInfo?.dayNumber || 2,
      moduleProgress,
    },
    profile: userProfile,
  };
}
