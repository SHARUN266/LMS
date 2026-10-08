# ⚡ Praxis OS — AI-Native Analytics Career Accelerator & LMS

<p align="center">
  <strong>An intensive, AI-powered Learning Management System modeled after strict bootcamp discipline, engineered to train candidates for ₹12,00,000/year (12 LPA) Senior Analytics Engineering & Business Analyst roles in Tier-1 Global Capability Centers (GCCs) and product firms.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/AI%20Engine-Google%20Gemini%202.5%20Flash-orange?style=for-the-badge&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</p>

---

## 🌟 What is Praxis OS?

Most online edtech platforms rely on passive video watching and superficial multiple-choice questions. Students believe they understand the tools, only to face rejection in rigorous technical interviews.

**Praxis OS changes this paradigm entirely.** It is built around **strict daily accountability**, **in-browser SQL execution**, **actual file deliverable parsing (Excel formulas, Python notebooks, Power BI models)**, and **commercial 12 LPA rubric evaluation** powered by Google Gemini.

---

## 🚀 Key Architectural Pillars & Features

### 1. 🔄 5-Step Daily Learning Loop
Every single day follows a non-negotiable 5-stage mastery cycle:
1. **Concept Theory (`/learn`)**: Production markdown lessons, 10-second cheatsheets, JavaScript-to-Data mental model bridges, curated YouTube videos, and 3-question MCQ check quizzes.
   * *On-Demand AI Rewriter*: Re-articulates any lesson in 4 distinct personas: **Staff Engineer** (scalability/indexes), **Beginner** (ELI10 analogies), **Real-World Case Study** (Swiggy, Zepto, Netflix), or **Hinglish**.
2. **Hands-on Practice Sandbox (`/practice/[dayId]`)**: Monaco code editor executing live queries against realistic SQLite/PostgreSQL sandbox datasets (`customers`, `products`, `orders`, `order_items`, `employees`) with 3 graduated Elo-calibrated drills.
3. **Daily Problem of the Day (`/daily-challenge`)**: Authentic Indian enterprise scenarios (Zepto, Blinkit, Swiggy, Razorpay) with cognitive architecture scaffolding (grain analysis, trap explanations) and a 3-level progressive hint copilot ladder.
4. **Graded Mission (`/assignment/[assignId]`)**: Commercial deliverables with multimodal submission support (SQL code, Excel workbooks, Jupyter notebooks, Power BI models, PDF/Word documents, and GitHub repositories).
5. **Evaluation & Scorecard (`/evaluation/[subId]`)**: Instant commercial grading against a 6-dimension rubric, highlighting strengths, critical weak areas, production refactoring code diffs, and targeted remedial drills.

---

### 2. 🧠 Deep Multimodal File Content Parsing & AI Grading
Unlike conventional LMSs that only inspect text or file extensions, Praxis OS features an in-depth file parsing engine ([lib/file-parser.ts](file:///c:/Users/Sharun1/Downloads/LMS/LMS/lib/file-parser.ts)):

* 📊 **Excel (`.xlsx`, `.xls`)**: Extracts sheet names, row/col matrix, and **actual formulas** (`=XLOOKUP`, `=SUMIFS`, `=INDEX/MATCH`, `=LAMBDA`). Penalizes hardcoded numbers where dynamic calculations were required.
* 📓 **Jupyter Notebooks (`.ipynb`)**: Extracts markdown cells, code cells, imports (`pandas`, `numpy`), and **actual execution outputs** to verify pipeline success.
* 📈 **Power BI (`.pbix`)**: Unzips the internal `DataModelSchema` to extract table schemas, **DAX measures** (`CALCULATE`, `SUMX`, `DIVIDE`), and table relationships (1-to-many star schemas).
* 📄 **Business Documents (`.pdf`, `.docx`)**: Extracts full document text to grade Business Requirements Documents (BRDs), functional specifications, and data dictionaries.
* 🐙 **GitHub Repositories**: Real-time HTTP verification of public repos, decoding `README.md` content and inspecting recursive project file trees (tests, Dockerfile, CI pipelines).

---

### 3. 🤖 Axiom — Platform-Aware Socratic AI Career Mentor (`/mentor`)
Powered by Google Gemini with deep platform context awareness:
* **Context Access**: Reads student's real streak, active module progress, historical assignment scores, and weak areas.
* **4 Interaction Modes**:
  1. **Socratic Tutor**: Guides with mental models and syntax clues without spoiling the answer.
  2. **Code Debugger**: Diagnoses SQL syntax bugs, joins traps, and index bottlenecks.
  3. **Business Analyst**: Elevates student analysis to executive-level business communication.
  4. **Mock Interviewer**: Simulates real 12 LPA GCC technical and managerial interviews.

---

### 4. 🧭 Enterprise Micro-Skill Knowledge Graph & DAG
* **39 Granular Micro-Skills**: Mapped across Excel, SQL, Python, Power BI, Statistics, and dbt.
* **48 Directed Prerequisite Edges**: A rigorous DAG ensuring learners master prerequisite fundamentals (e.g., Lookups before Pivot Tables, Group By before Window Functions).
* **Bloom's Taxonomy Levels**: Categorized from Level 1 (Remember) to Level 6 (Create).

---

### 5. 🎯 Adaptive Intelligence & Smart Backlog Scheduler
* **Automated Remediation**: Scores < 75% automatically flag weak topics and generate targeted `RemedialDrill` challenges.
* **5-Day Schedule Balancer**: Evenly distributes backlog debt over the upcoming 5 days (capped at 2 items/day) to prevent burnout.

---

### 6. 🏆 Weekly Benchmark Exams & Radar Diagnostics (`/assessment`)
* **90-Minute Timed Exams**: Weekly Monday assessments combining theoretical MCQs and complex multi-table SQL queries.
* **Radar Skill Diagnostics**: Interactive Recharts radar charts visualizing competency strengths and skill gaps.

---

### 7. 💼 15 Industry Capstone Projects (`/projects`)
* Comprehensive 7-day projects concluding each module (e.g., E-Commerce Logistics, FinTech Fraud Analytics, Healthcare Patient Outcomes).
* 7 daily milestone checklists with evidence attachments and recruiter-oriented evaluations.

---

### 8. ⏱️ Discipline Engine & Gamification
* **Live Study Timer**: Client-side timer syncing every 60 seconds with database persistence.
* **Streak Tracking**: Encourages uninterrupted daily momentum.
* **Experience Points (XP) & Titles**: Progressive rank advancement from *Apprentice* to *Staff Analytics Architect*.
* **Dynamic Elo Rating**: Adaptive skill rating ($K=32$) targeting the learner's Zone of Proximal Development.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | **Next.js 14.2.15 (App Router)** | Server Components, Client Components, Dynamic Routes |
| **Language** | **TypeScript** | 100% strict type safety across all components and APIs |
| **Database** | **PostgreSQL (Neon Serverless)** | PgBouncer connection pooling, schema migrations |
| **ORM** | **Prisma 5.22** | Relational mapping, raw queries, seeding utilities |
| **AI Evaluation** | **Google Gemini 2.5 Flash / 2.0 Flash** | JSON Mode, 45s timeout guard, deterministic fallbacks |
| **File Parsers** | `exceljs`, `pdf-parse`, `jszip`, `mammoth` | Deep deliverable extraction for Excel, Jupyter, PBIX, DOCX |
| **Styling & UI** | **Tailwind CSS 3.4 + shadcn/ui** | Enterprise dark-mode theme, Radix UI primitives |
| **Code Editor** | **Monaco Editor** | In-browser multi-language editor (`@monaco-editor/react`) |
| **Charts** | **Recharts** | Radar competency diagnostics, study velocity charts |

---

## 📁 Directory Structure

```text
├── app/
│   ├── api/
│   │   ├── admin/config/      # Model selection & evaluation thresholds
│   │   ├── assignments/       # Assignment retrieval & dynamic generation
│   │   ├── days/              # Daily task state & POTD unlock gating
│   │   ├── evaluate/          # Multi-vector deep AI grading pipeline
│   │   ├── mentor/            # Axiom Socratic chat endpoints
│   │   ├── potd/              # Problem of the Day generator & hints
│   │   ├── sql/run/           # In-browser SQL sandbox query executor
│   │   └── upload/            # Secure multipart deliverable uploader
│   ├── assignment/            # Daily missions & deliverable submission hub
│   ├── daily-challenge/       # Problem of the Day (POTD) interface
│   ├── dashboard/             # Learner Command Center
│   ├── learn/                 # Daily theory study desk
│   ├── mentor/                # Axiom AI Mentor interface
│   ├── practice/              # SQL / Code sandbox drills
│   ├── projects/              # 15 Industry Capstone Projects
│   └── roadmap/               # 15-Module 90-Day interactive tree
├── components/
│   ├── AssignmentBrief.tsx    # 5-Clarity tool guidance blocks
│   ├── DailyStepper.tsx       # 5-step daily learning progress tracker
│   ├── StudyTimer.tsx         # Live synced study clock
│   ├── SubmissionPanel.tsx    # Multimodal drag-and-drop submission UI
│   └── ui/                    # Reusable shadcn/ui components
├── lib/
│   ├── ai.ts                  # Gemini API caller & modality system prompts
│   ├── db.ts                  # PrismaClient singleton with serverless pooling
│   ├── file-parser.ts         # Deep file extractor (Excel, PBIX, Notebook, PDF)
│   ├── potd.ts                # Daily POTD synthesis & PostgreSQL caching
│   ├── sql-runner.ts          # In-memory SQLite datasets & runner
│   └── submission-validators.ts # Modality deterministic scoring engines
├── prisma/
│   ├── curriculum-data.mjs    # Complete 90-day curriculum definitions
│   ├── schema.prisma          # Relational schema (Users, Days, Tasks, Skills)
│   └── skills-data.mjs        # 39 skills & 48 prerequisite DAG definitions
└── public/
    └── uploads/               # Local deliverable storage
```

---

## ⚙️ Quick Start & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SHARUN266/LMS.git
cd LMS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Google Gemini API Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"

# PostgreSQL Database (Neon Serverless or Local Postgres)
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://user:password@host/neondb?sslmode=require"
```

### 4. Push Database Schema & Seed Curriculum
```bash
# Push schema to database
npx prisma db push

# Seed 90-day curriculum, modules, sample sandbox data
npm run db:seed
```

### 5. Launch the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Daily Study Protocol (How to Use)

1. **Start the Clock**: Enable the `StudyTimer` on the dashboard to track daily focused time.
2. **Follow the Stepper**: Complete **Theory** → Solve **Practice Drills** → Crack the **Daily POTD**.
3. **Submit Real Deliverables**: Upload your authentic `.xlsx` or `.ipynb` file. Receive an instant commercial scorecard from Gemini.
4. **Iterate on Feedback**: If score is < 70%, review the code diff and complete the auto-generated **Remedial Drill**.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

<p align="center">
  Built with discipline for aspiring 12 LPA Analytics Engineers & Business Analysts.
</p>
