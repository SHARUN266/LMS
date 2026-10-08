# AI-Powered Masai-Style Learning Management System

## 1. Product Vision

Build a structured, disciplined, AI-assisted learning platform that behaves more like a **career school/training program** than a conventional LMS.

The system should not merely provide videos, PDFs, or a course checklist. It should actively manage the learner's journey:

> **Learn → Practice → Assignment → Submit → Evaluate → Feedback → Improve → Weekly Assessment → Module Project → Project Evaluation → Advance**

The experience should feel similar to a structured bootcamp such as Masai:

- fixed daily study plan
- daily assignments
- deadlines
- attendance/progress tracking
- weekly evaluation
- module-level assessment
- one-week capstone projects
- strict rubrics
- remediation when performance is weak
- personalised AI guidance
- continuous accountability

The primary outcome is **job readiness**, not certificate completion.

---

# 2. User Need

The learner is intentionally taking a career break and wants a system that provides the external structure normally provided by a full-time academy.

The learner does **not** want:

- a passive video course
- a simple checklist
- a generic chatbot tutor
- random AI-generated questions
- a certificate-first experience

The learner wants a platform that effectively acts as:

> **Teacher + Academic Manager + Evaluator + Project Mentor + Accountability System**

---

# 3. Target User

## Primary User

Career-transitioning working professional.

Example learning goal:

**Target:** BI / Analytics Engineer / Data + AI Automation

Potential curriculum:

1. SQL
2. Excel
3. Python / Pandas
4. Statistics
5. Power BI
6. DAX
7. Data Modeling
8. ETL / ELT
9. Data Warehousing
10. dbt / Fabric / Cloud fundamentals
11. AI for analytics
12. AI automation
13. Portfolio projects
14. Interview preparation

The platform must also support other career tracks later.

---

# 4. Product Philosophy

## 4.1 Course Completion Is Not the Goal

The system should measure actual capability through:

- practical assignments
- weekly assessments
- project performance
- consistency
- skill mastery
- interview readiness

## 4.2 Discipline Is a Product Feature

The platform must actively maintain structure rather than relying on learner motivation.

## 4.3 AI Must Be Controlled

AI should personalise learning, but should not remove the learning process by immediately giving answers.

## 4.4 Projects Must Be Business-Oriented

Projects should resemble real work rather than toy coding exercises.

## 4.5 Market Readiness Matters

The curriculum should ultimately connect learning to:

- portfolio proof
- interview performance
- job applications
- role-specific skills

---

# 5. Core Learning Lifecycle

```text
Career Goal
   ↓
Skill Assessment
   ↓
Personalised Roadmap
   ↓
Module
   ↓
Week
   ↓
Day
   ↓
Lesson
   ↓
Practice
   ↓
Assignment
   ↓
Submission
   ↓
Evaluation
   ↓
Feedback
   ↓
Remedial Work (when required)
   ↓
Weekly Assessment
   ↓
Module Completion
   ↓
7-Day Project
   ↓
Project Evaluation
   ↓
PASS / REMEDIAL
   ↓
Next Module
```

---

# 6. Product Modules

## 6.1 Onboarding & Career Goal

The platform should collect:

- current education
- current experience
- current technical skills
- target role
- target salary
- desired timeline
- hours available per day
- preferred learning style
- current confidence level

Output:

> **Personalised Learning Roadmap**

Example:

```text
Goal: BI / Analytics Engineer
Duration: 20 weeks
Study commitment: 6 hours/day
Current level: Beginner-Intermediate
```

---

# 7. Curriculum Engine

The curriculum must be hierarchical.

```text
Career Track
    └── Module
         └── Week
              └── Day
                   ├── Lesson
                   ├── Practice
                   ├── Assignment
                   └── Daily Check
```

### Example

```text
BI Engineer Track
└── SQL
    ├── Week 1
    │   ├── Day 1
    │   ├── Day 2
    │   ├── Day 3
    │   ├── Day 4
    │   ├── Day 5
    │   └── Day 6
    ├── Week 2
    ├── Week 3
    └── SQL Capstone Project
```

---

# 8. Daily Learning Experience

Each day should have a fixed agenda.

### Example: SQL Day 8

```text
TODAY'S PLAN

1. Learn: Window Functions
2. Guided Examples
3. Practice: 6 exercises
4. Assignment: 5 business SQL problems
5. Reflection / Explanation
6. Submit before deadline
```

Dashboard should clearly show:

- today's objective
- estimated time
- completed tasks
- pending tasks
- deadline
- daily progress

---

# 9. Daily Assignment System

Assignments should be connected directly to the day's learning objectives.

The AI should generate assignments based on:

```text
Learning Objective
+ Current Module
+ Difficulty Level
+ Previous Performance
+ Question History
+ Skill Gaps
```

The system should avoid meaningless repetition and should gradually increase difficulty.

### Difficulty levels

- Beginner
- Intermediate
- Advanced
- Challenge

### Assignment categories

- MCQ
- SQL
- Python
- Excel
- Power BI
- DAX
- Case Study
- Short Answer
- Debugging
- Data Analysis
- Project Task

---

# 10. Assignment Submission

The learner must be able to submit:

- typed answers
- SQL code
- Python code
- spreadsheet files
- CSV files
- Power BI files/screenshots
- project ZIP files
- GitHub links
- written explanations

Each submission should be versioned.

---

# 11. Evaluation Engine

Evaluation should not depend entirely on an LLM.

Architecture:

```text
Submission
   ↓
Deterministic Validation
   ↓
Technical Evaluation
   ↓
AI Evaluation
   ↓
Rubric Engine
   ↓
Final Score
   ↓
Feedback
```

### Example SQL evaluation

```text
Correctness       40%
Query Logic       20%
Edge Cases        15%
Performance       10%
Readability       10%
Explanation        5%
```

### Example result

```text
Score: 82/100

Strengths:
- Correct joins
- Good CTE structure
- Clear naming

Weak Areas:
- NULL handling
- Edge-case thinking

Remedial Tasks:
- SQL NULL exercise 1
- SQL NULL exercise 2
- SQL edge-case exercise
```

---

# 12. AI Teacher / Mentor

The AI mentor must be **curriculum-aware**, not a generic chatbot.

It should know:

- what module the learner is studying
- what lessons were completed
- previous mistakes
- weak concepts
- current assignment
- assessment scores
- project status

### Teaching hierarchy

The AI should prefer:

1. explanation
2. example
3. hint
4. guided approach
5. partial solution
6. complete solution only when justified

The purpose is learning, not answer generation.

---

# 13. Monday Weekly Evaluation

Every Monday the platform should run a formal weekly assessment.

### Example

```text
WEEK 3 ASSESSMENT

10 MCQs
5 SQL problems
1 business case
Duration: 90 minutes
```

Score categories:

```text
Concept Knowledge       25%
Practical Skills        50%
Problem Solving         25%
```

The system should automatically identify:

- strong concepts
- weak concepts
- recurring mistakes
- mastery gaps

Then adjust future tasks.

---

# 14. Adaptive Learning

This is one of the most important product features.

The learning engine should modify assignments according to performance.

```text
Good Performance
      ↓
Increase Difficulty

Weak Performance
      ↓
More Practice
      ↓
Remedial Lesson
      ↓
Retest
```

Example:

```text
Window Functions = 91%
CTEs = 87%
NULL Handling = 54%
```

Next schedule should automatically increase NULL-handling practice.

---

# 15. Module Completion Rules

A module should not be marked complete simply because the learner watched all lessons.

Example rule:

```text
Daily Assignment Completion >= 80%
AND
Weekly Assessment >= 70%
AND
Module Practice >= 75%
AND
Capstone Project >= 70%
```

Result:

```text
PASS → Next Module
FAIL → Remedial Learning
```

Thresholds must be configurable by the instructor/admin.

---

# 16. One-Week Capstone Project

At the end of every major module, unlock a project.

### Duration

**7 days**

### Example: SQL Capstone

**Sales Performance Analytics**

### Daily milestones

```text
Day 1 → Understand business problem
Day 2 → Explore dataset/schema
Day 3 → Core SQL analysis
Day 4 → Advanced SQL
Day 5 → Insights
Day 6 → Documentation
Day 7 → Final submission
```

The system should show:

- project brief
- business context
- requirements
- deliverables
- rubric
- milestone deadlines
- final deadline
- submission checklist

---

# 17. Project Evaluation

Projects should be evaluated on real-world criteria.

### Example rubric

```text
Technical Quality       25%
Business Understanding  20%
Problem Solving         15%
Data Understanding      15%
Code / Query Quality    10%
Documentation           10%
Presentation             5%
```

The final result should include detailed feedback.

---

# 18. Discipline Engine

The platform must actively enforce consistency.

### Track

- attendance
- daily study hours
- assignment completion
- deadlines
- streak
- backlog
- assessment scores
- project deadlines
- module progression

### Student dashboard example

```text
TODAY

Study Time:       4h 32m / 6h
Assignments:      3 / 4
Current Streak:   11 days
Weekly Score:     84%
Backlog:          2 tasks

Module Progress
████████░░ 82%

Upcoming
Monday Assessment
Project Deadline
```

---

# 19. Backlog Management

Missed work should become structured backlog.

```text
Missed Assignment
        ↓
Backlog
        ↓
Automatic Rescheduling
        ↓
Balanced Daily Load
```

The system must avoid overloading the next day with unrealistic amounts of work.

---

# 20. Notifications

### Morning

> Today's lesson is ready.

### Midday

> Two assignments remain today.

### Evening

> Your daily deadline is approaching.

### Monday

> Weekly assessment is available.

### Project deadline

> Two days remain on your capstone project.

Notifications should be configurable.

---

# 21. Screen Inventory & UI Sitemap (15 Core Screens)

The platform consists of **15 purpose-built, high-utility screens** designed for discipline, intense practice, and clear feedback:

```text
├── [1] /onboarding                → Career Goal & Baseline Diagnostic Setup
├── [2] /dashboard                 → Daily Command Center (Today's Plan, Timer, Streak, Backlog)
├── [3] /roadmap                   → Curriculum Tree & Milestone Map
├── [4] /learn/[moduleId]/[dayId]  → Daily Interactive Lesson & Theory Workspace
├── [5] /practice/[dayId]          → Interactive Practice Sandbox (Monaco Editor + Execution)
├── [6] /assignment/[assignId]     → Daily Graded Assignment & Submission Portal
├── [7] /evaluation/[subId]        → AI Evaluation, Rubric Breakdown & Remedial Action
├── [8] /assessment/[assessId]     → Monday Weekly Timed Assessment Exam Hall
├── [9] /assessment/[id]/report    → Assessment Analytics & Weak-Skill Radar
├── [10] /projects/[projId]        → 7-Day Capstone Project Workspace (Milestones & Brief)
├── [11] /projects/[id]/evaluation → Capstone Recruiter-Ready Scorecard & Feedback
├── [12] /backlog                  → Backlog Recovery & Remedial Drill Center
├── [13] /analytics                → Performance Deep-Dive, Mastery Radar & Habit Tracking
├── [14] /mentor                   → Dedicated AI Career Coach & Curriculum Mentor (Qwen 2.5)
└── [15] /admin/studio             → Curriculum CMS, Prompt Studio & Score Override Console
```

### Detailed Screen Breakdown:

1. **Screen 1: Onboarding & Goal Customizer (`/onboarding`)**
   - Target Career Track selector (BI / Analytics Engineer / Custom).
   - Daily commitment configurator (e.g. 4h, 6h, 8h/day).
   - Baseline skill survey + initial diagnostic quiz.
   - Generates the customized multi-week learning roadmap.

2. **Screen 2: Daily Command Center Dashboard (`/dashboard`)**
   - **Hero Section:** "Today's Agenda" with checklist, estimated time, and countdown to day deadline.
   - **Discipline Widget:** Active study stopwatch/timer, current streak counter, daily attendance status.
   - **Backlog & Alerts:** Immediate indicator of any overdue assignments or upcoming Monday assessments.
   - **Module Progress:** Visual progress bar of current module & capstone countdown.

3. **Screen 3: Curriculum Tree & Roadmap (`/roadmap`)**
   - Hierarchical visual tree: `Track → Module → Week → Day`.
   - Lock/unlock statuses, completion checkmarks, grade badges per day.
   - Direct drill-down into any unlocked day's lessons, practice, and assignments.

4. **Screen 4: Daily Lesson & Theory Workspace (`/learn/[moduleId]/[dayId]`)**
   - Rich interactive study material, structured notes, diagrams, and cheat sheets.
   - Guided code examples with interactive output previews.
   - Micro-knowledge checks (quick MCQs) to unlock practice exercises.
   - Slide-out quick AI Mentor drawer for instant clarifications.

5. **Screen 5: Interactive Practice Sandbox (`/practice/[dayId]`)**
   - Split-screen workspace: Left panel with problem statement & business context; Right panel with Monaco Editor (SQL / Python / DAX).
   - Instant local query/code runner with tabular result visualization.
   - Step-by-step progressive hint system (powered locally by Qwen 2.5 Coder).

6. **Screen 6: Assignment Submission Portal (`/assignment/[assignmentId]`)**
   - Formal daily problem set (MCQs, coding challenges, business scenario questions).
   - Code editor and multi-format file uploader (CSV, SQL, Python scripts, screenshots).
   - Rubric criteria preview (e.g. Correctness 40%, Logic 20%, Edge Cases 15%, Performance 10%, Readability 10%, Explanation 5%).

7. **Screen 7: AI Evaluation & Remediation Dashboard (`/evaluation/[submissionId]`)**
   - Instant scoring card with rubric breakdown generated locally by Qwen 2.5 Coder.
   - Code diff highlighting improvements, anti-patterns, and edge cases missed.
   - "Remedial Drill" generator: 1-click generation of targeted mini-exercises for weak areas.

8. **Screen 8: Monday Assessment Exam Hall (`/assessment/[assessmentId]`)**
   - Full-screen, distraction-free timed test environment (90 mins).
   - Mixed format: 10 MCQs, 5 SQL/Python coding problems, 1 comprehensive business case study.
   - Auto-save state and automatic submission timer.

9. **Screen 9: Assessment Diagnostic Report (`/assessment/[assessmentId]/report`)**
   - Comprehensive test score breakdown (Concept Knowledge vs Practical Skills vs Problem Solving).
   - Weak concepts diagnostic (e.g., *Window Functions: 91%, NULL Handling: 54%*).
   - Auto-adjusted weekly roadmap recommendations.

10. **Screen 10: 7-Day Capstone Project Workspace (`/projects/[projectId]`)**
    - Comprehensive business scenario brief (e.g. *E-Commerce Retention & Revenue Analytics*).
    - Database schema explorer & downloadable datasets.
    - 7-Day milestone stepper (Day 1: Schema Understanding → Day 7: Executive Summary & Presentation).
    - Milestone-by-milestone progress tracking and checklist.

11. **Screen 11: Capstone Project Evaluation & Recruiter Scorecard (`/projects/[projectId]/evaluation`)**
    - Comprehensive project rubric evaluation (Technical Quality, Business Acumen, Query Performance, Documentation).
    - Recruiter-ready portfolio summary export (Markdown/PDF).
    - GitHub repository quality and cleanliness score.

12. **Screen 12: Backlog Recovery & Remedial Center (`/backlog`)**
    - Visual queue of all missed tasks, overdue assignments, and flagged weak topics.
    - "Smart Schedule Balancer": Distributes backlog items evenly across upcoming days without causing burnout.
    - Quick-launch remedial practice sessions.

13. **Screen 13: Performance Analytics & Skill Radar (`/analytics`)**
    - Study habit heatmap (daily hours logged, consistent focus time).
    - Skill Mastery Matrix: Visual radar chart across SQL, Python, Excel, Power BI, Statistics, and Data Modeling.
    - Historical assessment performance trend lines.

14. **Screen 14: AI Mentor & Career Coach Studio (`/mentor`)**
    - Dedicated full-screen chat with curriculum-aware **Qwen 2.5 Coder**.
    - Modes: Code Debugger, Socratic Tutor, Business Case Explainer, and Mock Technical Interviewer.
    - Full memory of learner's past mistakes, weak skills, and current module.

15. **Screen 15: Local Curriculum Studio & Admin Console (`/admin/studio`)**
    - Visual track/module/lesson/assignment editor.
    - Ollama model selector & prompt template tuner (customize evaluation strictness).
    - Manual score override & rubric tweaking console.
    - Direct export/import of curriculum JSON bundles.

---

# 22. Admin / Instructor Dashboard

Admin/instructor should be able to:

- create tracks
- create modules
- create lessons
- define learning objectives
- define assignments
- create rubrics
- configure passing thresholds
- review submissions
- override AI scores
- inspect learner progress
- inspect weak areas
- review project performance
- publish/unpublish content

---

# 23. Analytics

Track:

- total study hours
- lesson completion
- assignment completion
- average score
- weekly score trend
- project score
- module completion
- weak skills
- streak
- backlog size
- time per assignment
- assessment accuracy
- learner drop-off

The learner should see useful analytics, not vanity metrics.

---

# 24. Learning Content / Knowledge Base

The AI mentor and evaluator should use the actual course curriculum as context.

Content can include:

- lessons
- notes
- documentation
- examples
- assignment instructions
- rubrics
- previous feedback
- approved solutions

Recommended architecture:

```text
Course Material
      ↓
Chunking
      ↓
Embeddings (nomic-embed-text via Ollama)
      ↓
Vector Search (pgvector / SQLite-vec)
      ↓
Relevant Context
      ↓
Local AI Mentor / Evaluator (Qwen 2.5 Coder)
```

---

# 25. Anti-Cheat / Academic Integrity

Future phases can include:

- plagiarism detection
- suspicious submission detection
- timed assessments
- copy-pattern detection
- GitHub activity checks

Webcam surveillance is not part of MVP.

---

# 26. Local-First Technical Architecture

```text
                         ┌──────────────────────────────┐
                         │   Learner (Local Browser)   │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │    Next.js Local App/API     │
                         │    (Full-Stack Local Host)   │
                         └──────────────┬───────────────┘
                                        │
               ┌────────────────────────┼────────────────────────┐
               ▼                        ▼                        ▼
       ┌────────────────┐       ┌────────────────┐       ┌────────────────┐
       │ Local Database │       │ Local Storage  │       │ Local AI Engine│
       │ SQLite / Postg.│       │ Local FS Disk  │       │ Ollama Service │
       │ + Prisma ORM   │       │ ./uploads/     │       │ Qwen 2.5 Coder │
       └────────────────┘       └────────────────┘       └───────┬────────┘
                                                                 │
                                                                 ▼
                                                         ┌────────────────┐
                                                         │ AI Evaluator   │
                                                         │ AI Mentor Chat │
                                                         │ Rubric Engine  │
                                                         └────────────────┘

Submission
    ↓
Local In-Process Queue / Worker
    ↓
Deterministic Code Validator (Local Postgres / Sandbox Runner)
    ↓
Local Ollama (Qwen 2.5 Coder) with Structured JSON Output
    ↓
Rubric Engine & Score Calculation
    ↓
Instant Feedback, Weak Topic Tagging & Remedial Generation
```

---

# 27. Recommended Local-First Tech Stack

## Frontend & Full-Stack Core
- **Next.js (App Router)**: Fast, single-port local server running full UI and API routes.
- **TypeScript**: Strict type safety.
- **Tailwind CSS & Vanilla CSS**: Polished, dark-mode-first aesthetic with glassmorphic cards and crisp typography.
- **Lucide Icons**: Clean, modern iconography.
- **Zustand**: Lightweight client state (timers, active session, sidebar states).
- **Recharts**: Rich charts for skill mastery radar, study time trends, and score analytics.
- **Monaco Editor**: VS Code-grade code editor for SQL and Python practice.

## Database & ORM
- **SQLite (with better-sqlite3 / Prisma)** or **Local PostgreSQL**: Fast, zero-configuration local database that lives directly on your disk.
- **Prisma ORM**: Type-safe schema migrations and querying.
- **Vector Search**: `sqlite-vss` / `pgvector` or local embedding similarity for curriculum RAG.

## Local AI & LLM Engine
- **Ollama**: Local AI runner.
- **Primary LLM**: **Qwen 2.5 Coder** (7B / 14B / 32B according to hardware capacity) for code grading, rubric evaluation, hints, and structured JSON output.
- **Embedding Model**: `nomic-embed-text` via Ollama for semantic search through curriculum notes.

## Code Execution & Sandbox
- **Local Isolated Database**: Dedicated practice database instance for running user SQL queries safely.
- **Node/Python Local Subprocess**: Sandboxed local script runner with timeouts and memory limits for Python assignments.

## Background Jobs & Storage
- **Storage**: Local filesystem directory (`./data/uploads`, `./data/projects`).
- **Queue/Timer Engine**: Node.js in-process job queue (`better-queue` or lightweight background cron) for scheduled daily plans and reminders.

---

# 28. Core Database Entities

```text
User
Profile
CareerGoal

Track
Module
Week
Day
Lesson
LearningObjective

Assignment
AssignmentQuestion
Submission
Evaluation
Feedback
RemedialTask

Assessment
AssessmentQuestion
AssessmentAttempt

Project
ProjectMilestone
ProjectSubmission
ProjectEvaluation

StudySession
Attendance
Streak
Notification

CourseMaterial
Embedding

AIJob
```

### Core relationship

```text
USER
 ├── Profile
 ├── CareerGoal
 ├── Enrollment
 ├── StudySession
 ├── Submission
 ├── AssessmentAttempt
 └── ProjectSubmission

TRACK
 └── MODULE
      └── WEEK
           └── DAY
                ├── LESSON
                ├── PRACTICE
                └── ASSIGNMENT

MODULE
 └── PROJECT
      └── MILESTONE
```

---

# 29. AI Output Contract

AI should return structured machine-readable output.

Example:

```json
{
  "score": 82,
  "strengths": [
    "Correct joins",
    "Good query structure"
  ],
  "weakAreas": [
    "NULL handling"
  ],
  "questionFeedback": [
    {
      "questionId": "Q4",
      "issue": "Missing NULL condition"
    }
  ],
  "remedialTasks": [
    "SQL_NULL_03",
    "SQL_NULL_04"
  ]
}
```

Validation must occur before the result is stored.

---

# 30. Important AI Guardrails

AI should never be the sole authority for high-impact academic decisions.

Use:

```text
Deterministic checks
       +
AI evaluation
       +
Configurable rubric
       +
Human override
```

The admin/instructor must be able to override evaluation results.

---

# 31. MVP Scope

## V1 Must Include

### Student

- onboarding
- career goal
- roadmap
- modules
- daily lessons
- daily assignments
- submissions
- AI evaluation
- feedback
- Monday weekly assessment
- progress dashboard
- streak
- backlog
- 7-day projects
- project evaluation

### Admin

- curriculum management
- assignment management
- learner management
- submission review
- score override
- progress monitoring

---

# 32. V1.5

- AI mentor
- adaptive learning
- personalised remediation
- GitHub integration
- advanced analytics
- email notifications

---

# 33. V2

- peer review
- instructor-led classes
- live sessions
- community
- multiple career tracks
- interview simulator
- job application tracker
- placement tracking
- company-specific tracks

---

# 34. Development Phases

## Phase 1 — Foundation

- authentication
- database
- curriculum structure
- student dashboard
- admin dashboard

## Phase 2 — Learning Engine

- lessons
- daily schedule
- assignments
- submissions

## Phase 3 — Evaluation Engine

- MCQ evaluator
- SQL validator
- code sandbox
- AI evaluator
- rubric engine

## Phase 4 — Assessment

- Monday tests
- scoring
- weak-topic detection

## Phase 5 — Project Engine

- project creation
- milestones
- 7-day deadlines
- submission
- evaluation

## Phase 6 — Discipline Engine

- study timer
- attendance
- streaks
- backlog
- reminders

## Phase 7 — AI Mentor

- curriculum-aware chat
- hint system
- remediation
- personalised explanations

---

# 35. Non-Functional Requirements

## Performance

- dashboard initial load target: <2.5 seconds on normal broadband
- assignment page should feel instant after initial load
- AI jobs should run asynchronously

## Security

- authenticated routes
- role-based access control
- secure file upload
- isolated code execution
- signed file URLs
- rate limiting for AI endpoints
- audit logs for administrative score changes

## Reliability

- background jobs must be retryable
- AI failures must not lose submissions
- submissions must be immutable/versioned

## Privacy

- learner data must be protected
- least-privilege access
- secure deletion/retention policies

---

# 36. Success Metrics

The product should optimise for learning outcomes.

### Primary metrics

- assignment completion rate
- weekly assessment improvement
- module pass rate
- project quality score
- skill mastery
- consistency
- interview readiness

### Secondary metrics

- daily active learning days
- average study time
- backlog recovery rate
- mentor usage

---

# 37. The Most Important Product Principle

The platform must not become:

> **"ChatGPT + videos + a progress bar."**

The core product is the **Training Engine**.

The system should continuously answer five questions:

1. **What should the learner learn today?**
2. **What should the learner practice?**
3. **How well did the learner perform?**
4. **What is the learner weak at?**
5. **What must the learner do next to become job-ready?**

That is the actual product.

---

# 38. Final Product Definition

> **An AI-powered, Masai-style career training platform that converts a long-term career goal into a disciplined daily learning schedule, automatically generates and evaluates assignments, conducts weekly assessments, identifies skill gaps, manages one-week capstone projects, and continuously adapts the learner's roadmap until they reach job-ready proficiency.**

The product should feel like having a **strict academy around you**, even when you are studying alone at home.
