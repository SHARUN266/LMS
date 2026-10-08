# 🏗️ AI Masai-Style LMS — Detailed Phase-by-Phase Implementation Plan

## Current State: Honest Audit 🔍

After thoroughly reading all **1208 lines** of the PRD and auditing every file in the codebase, here is the **brutally honest** current status:

### What EXISTS (Foundation skeleton):
- ✅ Next.js 14 App Router project with Tailwind, Prisma, SQLite
- ✅ Prisma schema with 17 models (well-designed, matches PRD Section 28)
- ✅ Seed data for **Module 1 only** (Week 1, Days 1-6, 1 Assessment, 1 Project)
- ✅ SQL sandbox runner with in-memory sample datasets
- ✅ Ollama integration (`lib/ollama.ts`) with evaluate + mentor chat + fallback
- ✅ 15 pages/routes created (matching PRD Section 21 screen inventory)
- ✅ Beautiful dark-mode glassmorphic UI with Lucide icons

### What is BROKEN / INCOMPLETE 🚨

> [!CAUTION]
> **13 out of 15 pages are "use client" components with HARDCODED static data.** They do NOT fetch from the database. Only `/dashboard` and `/roadmap` use `db` queries. The rest are **UI mockups disguised as functional pages.**

| Problem | Details |
|:---|:---|
| **Hardcoded pages** | `learn`, `practice`, `assignment`, `evaluation`, `assessment`, `assessment/report`, `projects`, `projects/evaluation`, `backlog`, `analytics`, `admin/studio`, `onboarding`, `mentor` — ALL have inline static JSON/strings, zero DB fetching |
| **No dynamic routing** | `/assignment/[assignId]` ignores `params.assignId`, always shows same content. Same for all `[id]` routes |
| **Onboarding does nothing** | Collects target role/hours but doesn't save to `UserProfile` or generate roadmap |
| **Evaluation page static** | Shows hardcoded score=86, doesn't fetch actual `Submission → Evaluation` from DB |
| **Assessment has no backend** | Timer works, but submit button just does `router.push` — no API to evaluate/score the assessment |
| **Project page static** | Milestones are hardcoded, no actual submission or evaluation flow |
| **Analytics page static** | All charts use inline arrays, not real `StudySession` / `AssessmentAttempt` data |
| **Admin Studio** | Model selector and sliders exist but `handleSave` does nothing (no API, no DB persistence) |
| **Backlog page static** | Hardcoded items, not from `BacklogItem` table |
| **No API routes** | Only 3 API routes exist: `/api/evaluate`, `/api/sql/run`, `/api/mentor/chat`. Missing: onboarding, assessment submit, project submit, backlog CRUD, analytics, admin CRUD, study sessions, day completion |
| **Sidebar links hardcoded** | All nav links point to fixed slugs like `/learn/module-1/day-2` instead of dynamic IDs |
| **No day unlock/progression** | Completing Day 1 doesn't unlock Day 2. No gating logic exists |
| **Mentor has no context** | AI mentor doesn't load learner's actual weak areas, current module, or past mistakes from DB |
| **Missing PRD entities** | `Attendance`, `Notification`, `CourseMaterial`, `Embedding`, `AIJob`, `CareerGoal`, `LearningObjective` models missing from schema |

---

## Proposed Implementation Plan (7 Phases)

> [!IMPORTANT]
> Each phase below maps to PRD Section 34's development phases but is scoped to address the **actual gaps** found in the audit. Each phase will make the platform genuinely functional, not just visually present.

---

## Phase 1 — Foundation (Fix Core Data Flow) 🏛️

**Goal:** Make every page dynamic. Every route fetches real data from DB. Navigation uses real IDs.

### 1.1 API Layer — CRUD Routes

#### [NEW] `app/api/days/[dayId]/route.ts`
- `GET`: Fetch day with lesson, practice exercises, assignments
- `PATCH`: Mark day as completed, update score, unlock next day

#### [NEW] `app/api/assignments/[assignId]/route.ts`  
- `GET`: Fetch assignment with questions by ID

#### [NEW] `app/api/submissions/[subId]/route.ts`
- `GET`: Fetch submission with evaluation by ID

#### [NEW] `app/api/assessments/[assessId]/route.ts`
- `GET`: Fetch assessment with questions
- `POST`: Submit answers, auto-score MCQs, AI-evaluate code, save `AssessmentAttempt`

#### [NEW] `app/api/projects/[projId]/route.ts`
- `GET`: Fetch project with milestones & submissions
- `POST`: Submit project (GitHub URL / summary text)
- `PATCH`: Toggle milestone completion

#### [NEW] `app/api/profile/route.ts`
- `GET`: Fetch UserProfile
- `PATCH`: Update profile (onboarding saves here)

#### [NEW] `app/api/backlog/route.ts`
- `GET`: Fetch incomplete backlog items
- `PATCH`: Mark backlog item complete

#### [NEW] `app/api/study-sessions/route.ts`
- `POST`: Log study session (from StudyTimer component)
- `GET`: Fetch sessions for analytics

#### [NEW] `app/api/analytics/route.ts`
- `GET`: Aggregate study hours, assessment scores, skill gaps, streak data

### 1.2 Convert All Pages to Server Components / Data-Fetching

#### [MODIFY] `app/learn/[moduleId]/[dayId]/page.tsx`
- Convert to server component fetching `Day → Lesson` by actual `dayId` param
- Extract interactive parts (quiz, copy button, mentor drawer) into client sub-components

#### [MODIFY] `app/practice/[dayId]/page.tsx`
- Fetch `PracticeExercise[]` for actual `dayId` from DB
- Keep Monaco editor as client component, extract data loading to server

#### [MODIFY] `app/assignment/[assignId]/page.tsx`
- Fetch `Assignment` + `AssignmentQuestion[]` by real `assignId`
- Submit with actual `assignmentId` from DB (not hardcoded "daily-2")

#### [MODIFY] `app/evaluation/[subId]/page.tsx`
- Fetch `Submission → Evaluation` by `subId` param from DB
- Display real score, strengths, weak areas, rubric scores, code diff

#### [MODIFY] `app/assessment/[assessId]/page.tsx`
- Fetch `Assessment` + `AssessmentQuestion[]` from DB
- Wire submit button to new assessment API

#### [MODIFY] `app/assessment/[assessId]/report/page.tsx`
- Fetch `AssessmentAttempt` by assessId, display real skill gap radar

#### [MODIFY] `app/projects/[projId]/page.tsx`
- Fetch `Project → Milestones` from DB
- Wire milestone checkboxes and submission form to API

#### [MODIFY] `app/projects/[projId]/evaluation/page.tsx`
- Fetch `ProjectSubmission → ProjectEvaluation` from DB

#### [MODIFY] `app/backlog/page.tsx`
- Fetch from `BacklogItem` and `RemedialDrill` tables

#### [MODIFY] `app/analytics/page.tsx`
- Fetch real data from analytics API

#### [MODIFY] `app/onboarding/page.tsx`
- Wire "Generate Roadmap" to `PATCH /api/profile` saving selections

#### [MODIFY] `app/admin/studio/page.tsx`
- Wire Save to persist config (add `AdminConfig` model or use UserProfile)

### 1.3 Dynamic Sidebar Navigation

#### [MODIFY] `components/AppShell.tsx`
- Fetch active module/day IDs from UserProfile
- Build nav links with real database IDs instead of hardcoded slugs
- Show actual streak, XP, level from DB

---

## Phase 2 — Learning Engine (Content Pipeline) 📚

**Goal:** Full daily learning lifecycle works end-to-end: Lesson → Practice → Assignment → Submit

### 2.1 Day Progression & Gating Logic

#### [NEW] `lib/progression.ts`
- `completeDay(dayId)`: Mark completed, calculate score, unlock next day
- `isEligibleForAssessment(weekId)`: Check if all days >= 80%  
- `isEligibleForProject(moduleId)`: Check module completion rules (PRD Section 15)

### 2.2 Enhanced Learn Page

#### [MODIFY] `app/learn/[moduleId]/[dayId]/page.tsx`
- Render lesson `content` as Markdown (add `react-markdown` + `remark-gfm`)
- Micro-Knowledge check quiz from `lesson.quickQuiz` JSON
- Quiz must be passed to unlock Practice button (PRD Section 21, Screen 4)
- Slide-out AI mentor drawer that sends context of current lesson

### 2.3 Enhanced Practice Page

#### [MODIFY] `app/practice/[dayId]/page.tsx`
- Load ALL practice exercises for the day (currently shows 1 hardcoded)
- Progressive hint system: each click reveals next hint from `hints` JSON
- "Run Query" validates against solution and shows diff
- Track completion per exercise

### 2.4 Enhanced Assignment Page

#### [MODIFY] `app/assignment/[assignId]/page.tsx`
- Show rubric preview before submission (PRD Section 21, Screen 6)
- Multi-question support (iterate `AssignmentQuestion[]`)
- File upload support (CSV, screenshots) — store in local `./uploads/`
- Versioned submissions (show past attempts)

### 2.5 Curriculum Content Expansion

#### [MODIFY] `prisma/seed.mjs`
- Add detailed lesson content, practice exercises, and assignments for **Days 3-6**
- Each day needs: 1 Lesson (with quickQuiz), 2-3 Practice Exercises, 1 Assignment with 2-3 Questions
- Add more Assessment questions (10 MCQs + 5 Code problems per PRD Section 13)

---

## Phase 3 — Evaluation Engine (Real Grading) ⚖️

**Goal:** Submissions are evaluated with deterministic + AI hybrid, rubric scores saved, remedial auto-generated

### 3.1 Deterministic SQL Validator

#### [NEW] `lib/sql-validator.ts`
- Execute student query and expected solution query against sandbox
- Compare result sets (column match, row match, order match)
- Return deterministic correctness score (0-40 per rubric)

### 3.2 Hybrid Evaluation Pipeline

#### [MODIFY] `app/api/evaluate/route.ts`
- Step 1: Run deterministic SQL validator for correctness score
- Step 2: Send to Ollama for qualitative analysis (logic, edge cases, readability)
- Step 3: Combine scores per rubric weights from PRD Section 11
- Step 4: Auto-generate remedial drills for weak areas
- Step 5: If score < 70, auto-create `BacklogItem` for remediation

### 3.3 Evaluation Results Page (Dynamic)

#### [MODIFY] `app/evaluation/[subId]/page.tsx`
- Fetch real `Evaluation` from DB
- Display rubric breakdown as visual bar chart (use Recharts)
- Show code diff with syntax highlighting (Monaco diff editor)
- "Generate Remedial Drill" button creates targeted practice

### 3.4 Submission History

#### [NEW] `app/api/assignments/[assignId]/submissions/route.ts`
- `GET`: List all past submissions for an assignment with scores
- Support re-submission (versioned)

---

## Phase 4 — Assessment Engine (Monday Tests) 📝

**Goal:** Timed weekly assessments with mixed format, auto-scoring, and skill gap analysis

### 4.1 Assessment Backend

#### [NEW] `app/api/assessments/[assessId]/submit/route.ts`
- Accept answers JSON: `{ questionId: answer }[]`
- Auto-score MCQs deterministically (compare with `correctAnswer`)
- AI-evaluate CODE questions using Ollama
- Calculate per-topic skill scores
- Save `AssessmentAttempt` with `skillGaps` radar data

### 4.2 Assessment UI Enhancement

#### [MODIFY] `app/assessment/[assessId]/page.tsx`
- Load questions from DB (multiple MCQs + multiple code problems)
- Question navigation sidebar (1, 2, 3... with answered/unanswered status)
- Auto-save answers to localStorage every 30 seconds
- Auto-submit when timer hits 0

### 4.3 Assessment Report (Real Data)

#### [MODIFY] `app/assessment/[assessId]/report/page.tsx`
- Fetch `AssessmentAttempt` from DB
- Radar chart of skill gaps using Recharts (SQL Joins: 91%, NULL Handling: 54%)
- Per-question breakdown: correct/incorrect with explanation
- "Recommended Next Steps" based on weak topics

### 4.4 Weak Topic Detection & Adaptive Learning

#### [NEW] `lib/adaptive.ts`
- `detectWeakTopics(userId)`: Aggregate scores across assignments + assessments
- `generateAdaptiveSchedule(weakTopics)`: Create extra practice for weak areas
- Auto-adjust difficulty: good performance → harder problems, weak → more practice (PRD Section 14)

---

## Phase 5 — Project Engine (7-Day Capstone) 🚀

**Goal:** Full project lifecycle with milestones, daily checkins, submission, and recruiter-ready evaluation

### 5.1 Project Workspace

#### [MODIFY] `app/projects/[projId]/page.tsx`
- Fetch project + milestones from DB
- Interactive milestone stepper with daily checklist
- Toggle milestone completion via API (`PATCH`)
- Business brief panel with dataset download
- GitHub URL submission form
- Show countdown to 7-day deadline

### 5.2 Project Submission & Evaluation

#### [NEW] `app/api/projects/[projId]/submit/route.ts`
- Accept: GitHub URL, summary text, optional ZIP
- Trigger AI evaluation via Ollama with project rubric (PRD Section 17)
- Score: Technical 25%, Business 20%, Problem Solving 15%, Data Understanding 15%, Code Quality 10%, Documentation 10%, Presentation 5%
- Save `ProjectSubmission` + `ProjectEvaluation`

### 5.3 Project Evaluation Scorecard

#### [MODIFY] `app/projects/[projId]/evaluation/page.tsx`
- Fetch `ProjectEvaluation` from DB
- Display recruiter-ready scorecard with rubric bars
- "Export Portfolio Summary" as Markdown

---

## Phase 6 — Discipline Engine (Accountability System) ⏱️

**Goal:** Study timer logs to DB, streak auto-calculates, backlog auto-reschedules, XP/Level system works

### 6.1 Study Timer Integration

#### [MODIFY] `components/StudyTimer.tsx`
- On stop/pause, POST session to `/api/study-sessions`
- Save `StudySession` with dayId and durationMins

### 6.2 Streak & Attendance System

#### [NEW] `lib/discipline.ts`
- `calculateStreak(userId)`: Count consecutive days with study sessions
- `updateAttendance(userId)`: Mark today as attended if study time > threshold
- `calculateXP(actions)`: Award XP for completing lessons, assignments, assessments
- `checkLevelUp(userId)`: Level up based on XP thresholds

#### [NEW] `app/api/discipline/streak/route.ts`
- `GET`: Current streak, longest streak, daily attendance log

### 6.3 Backlog Auto-Management

#### [MODIFY] `app/backlog/page.tsx`
- Fetch real `BacklogItem[]` + `RemedialDrill[]` from DB
- "Smart Schedule Balancer": Distribute backlog evenly (PRD Section 19)
- Quick-launch remedial practice → opens practice sandbox with drill

#### [NEW] `lib/backlog-scheduler.ts`
- Auto-create backlog items when assignments are missed (deadline passed, no submission)
- Balance upcoming days to avoid overload

### 6.4 Real Analytics Dashboard

#### [MODIFY] `app/analytics/page.tsx`
- Study habit heatmap from `StudySession` data
- Skill mastery radar from `AssessmentAttempt.skillGaps`
- Weekly score trend line from `Evaluation` scores
- Module progress percentage from completed days ratio

---

## Phase 7 — AI Mentor & Smart Features 🤖

**Goal:** Curriculum-aware AI mentor, context-rich hints, personalized remediation

### 7.1 Context-Aware Mentor

#### [MODIFY] `app/mentor/page.tsx`
- Load chat history from `MentorMessage` table
- Send current module, weak topics, recent scores as context to Ollama
- Save each message exchange to DB

#### [MODIFY] `lib/ollama.ts`
- `askMentorQwen`: Inject learner's actual weak areas, assessment scores, and current lesson topic
- Implement Socratic mode: explanation → example → hint → guided → partial → full solution (PRD Section 12)

### 7.2 Mentor Modes (PRD Section 21, Screen 14)

#### [MODIFY] `app/mentor/page.tsx`
- Add mode tabs: **Code Debugger**, **Socratic Tutor**, **Business Case Explainer**, **Mock Interviewer**
- Each mode uses different system prompts

### 7.3 Slide-Out Quick Mentor

#### [NEW] `components/MentorDrawer.tsx`
- Reusable drawer component that can be opened from Learn, Practice, or Assignment pages
- Pre-fills context of current problem/lesson

### 7.4 Smart Notifications

#### [NEW] `app/api/notifications/route.ts`
- Morning: "Today's lesson is ready"
- Midday: "N assignments remain"
- Evening: "Deadline approaching"
- Monday: "Weekly assessment available"

#### [NEW] Prisma model additions
```
model Notification {
  id        String   @id @default(cuid())
  type      String   // MORNING, MIDDAY, EVENING, DEADLINE, ASSESSMENT
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Modules 2-6 (Python/Pandas, Power BI, DAX, Data Modeling, dbt) — should I generate full seed content for ALL modules in Phase 2, or start with just Module 1 being fully functional and add more modules later?

> [!IMPORTANT]  
> **Q2:** The PRD mentions **Zustand** for client state (PRD Section 27). Currently `lib/store.ts` exists but is barely used. Should I build a proper Zustand store for active day, study timer, and user preferences, or keep using server-side data?

> [!IMPORTANT]
> **Q3:** The PRD says to use **Recharts** for charts (radar, trend lines, heatmaps). It's already installed. Should I use it for all charts, or should I use simpler custom CSS chart components where possible for speed?

> [!IMPORTANT]
> **Q4:** Should I implement phases **sequentially** (finish Phase 1 completely, then Phase 2, etc.), or do you want me to pick specific high-priority features across phases?

---

## Verification Plan

### After Each Phase:
1. **`npm run build`** — Ensure zero TypeScript/build errors
2. **`npm run db:seed`** — Verify seed runs cleanly
3. **`npm run dev`** — Manual smoke test of all affected pages
4. **Browser walkthrough** — Navigate every route, verify real data loads

### Automated Checks:
- Verify every `[id]` route fetches by actual param (no hardcoded IDs)
- Verify every form submits to a real API route
- Verify every API route reads/writes to Prisma DB
- Verify Ollama evaluation produces valid JSON with fallback

### Final Validation:
- Complete one full learning cycle: Onboarding → Lesson → Practice → Assignment → Submit → Evaluation → Assessment → Project → Analytics
- Verify streak increments on daily study
- Verify backlog auto-creates on missed deadlines
