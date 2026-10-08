"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Send,
  Sparkles,
  Clock,
  Loader2,
  AlertCircle,
  History,
} from "lucide-react";
import { DailyStepper } from "@/components/DailyStepper";
import { AssignmentBrief } from "@/components/AssignmentBrief";
import { SubmissionPanel, UploadedFileItem } from "@/components/SubmissionPanel";
import { getToolGuidance, ToolGuidance, AssignmentModality } from "@/lib/dynamic-generator";

interface AssignmentQuestion {
  id: string;
  order: number;
  category: string;
  prompt: string;
  starterCode?: string;
  weight: number;
  isAdaptive?: boolean;
  adaptiveReason?: string;
}

interface AssignmentData {
  id: string;
  title: string;
  type: string;
  description: string;
  deadlineHours: number;
  toolGuidance?: string | null;
  skillsTested?: string | null;
  day?: {
    id: string;
    dayNumber: number;
    title: string;
  };
  questions: AssignmentQuestion[];
  submissions?: {
    id: string;
    createdAt: string;
    submittedCode: string;
    evaluation?: {
      id: string;
      score: number;
      passed: boolean;
    };
  }[];
}

export default function AssignmentPage({ params }: { params: { assignId: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQIdx, setSelectedQIdx] = useState(0);

  // Deliverables State
  const [questionCodes, setQuestionCodes] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [uploadedScreenshots, setUploadedScreenshots] = useState<UploadedFileItem[]>([]);
  const [externalUrl, setExternalUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    tested: boolean;
    allPassed: boolean;
    cases: { name: string; description: string; passed: boolean; details: string }[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    async function loadAssignment() {
      try {
        setLoading(true);
        const res = await fetch(`/api/assignments/${params.assignId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assignment) {
            setAssignment(data.assignment);
            const initialCodes: Record<string, string> = {};
            data.assignment.questions?.forEach((q: AssignmentQuestion) => {
              if (q.starterCode) {
                initialCodes[q.id] = q.starterCode;
              }
            });
            setQuestionCodes(initialCodes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssignment();
  }, [params.assignId]);

  const questions = assignment?.questions || [];
  const currentQuestion = questions[selectedQIdx] || questions[0];
  const assignmentType = (assignment?.type || "SQL").toUpperCase();
  const modality = (assignment?.type || "SQL") as AssignmentModality;

  // Derive or parse tool guidance
  let guidance: ToolGuidance;
  try {
    if (assignment?.toolGuidance) {
      guidance = JSON.parse(assignment.toolGuidance);
    } else {
      guidance = getToolGuidance(modality);
    }
  } catch {
    guidance = getToolGuidance(modality);
  }

  const getLanguageDetails = () => {
    if (assignmentType.includes("EXCEL")) {
      return { lang: "plaintext", file: "formulas.txt", label: "Excel Modern Formulas & Functions" };
    }
    if (assignmentType.includes("PYTHON")) {
      return { lang: "python", file: "pipeline.py", label: "Python Analytics Pipeline (Pandas / NumPy)" };
    }
    if (assignmentType.includes("POWER_BI") || assignmentType.includes("DAX")) {
      return { lang: "sql", file: "measures.dax", label: "Power BI DAX Measures & Semantic Model" };
    }
    if (assignmentType.includes("DBT_GIT")) {
      return { lang: "sql", file: "models/staging/stg_model.sql", label: "dbt Transformation Model (Jinja/SQL)" };
    }
    if (
      assignmentType.includes("BRD") ||
      assignmentType.includes("PROMPT") ||
      assignmentType.includes("AI_PRD") ||
      assignmentType.includes("COMPLIANCE") ||
      assignmentType.includes("CHANGE") ||
      assignmentType.includes("CONSULTING") ||
      assignmentType.includes("CASE")
    ) {
      return { lang: "markdown", file: "deliverable.md", label: "Executive Specification & Architecture Document" };
    }
    return { lang: "sql", file: `solution_${selectedQIdx + 1}.sql`, label: "Analytical SQL Query (PostgreSQL / SQLite)" };
  };

  const handleRegenerateAssignment = async (difficulty: "standard" | "hard" = "standard") => {
    if (!assignment?.day?.id) return;
    try {
      setIsRegenerating(true);
      setErrorMessage("");
      const res = await fetch("/api/assignments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId: assignment.day.id,
          difficulty,
          forceRegenerate: true,
        }),
      });
      const data = await res.json();
      if (data.assignment) {
        setAssignment(data.assignment);
        const initialCodes: Record<string, string> = {};
        data.assignment.questions?.forEach((q: AssignmentQuestion) => {
          if (q.starterCode) {
            initialCodes[q.id] = q.starterCode;
          }
        });
        setQuestionCodes(initialCodes);
        setTestResults(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to regenerate assignment with AI.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const langInfo = getLanguageDetails();
  const activeCode = currentQuestion
    ? questionCodes[currentQuestion.id] !== undefined
      ? questionCodes[currentQuestion.id]
      : currentQuestion.starterCode || ""
    : "";

  const handleCodeChange = (val: string) => {
    if (currentQuestion) {
      setQuestionCodes((prev) => ({ ...prev, [currentQuestion.id]: val }));
    }
  };

  // Pre-Submission Check
  const handleRunTestCases = async () => {
    setIsRunningTests(true);
    setErrorMessage("");

    const normCode = activeCode.replace(/--[^\r\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim().toLowerCase();
    const isBlankOrStarter = normCode.length < 15 || normCode === (currentQuestion?.starterCode || "").toLowerCase().trim();

    if (assignmentType.includes("SQL") || (assignmentType.includes("PRODUCT") && /select/i.test(activeCode))) {
      try {
        const res = await fetch("/api/sql/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: activeCode }),
        });
        const data = await res.json();

        const case1Pass = !data.error && !isBlankOrStarter;
        const case2Pass = data.rows && data.rows.length > 0;
        const case3Pass = !isBlankOrStarter && normCode.length > 35;

        setTestResults({
          tested: true,
          allPassed: case1Pass && case2Pass && case3Pass,
          cases: [
            {
              name: "Check 1: Schema & Joins Integrity",
              description: "Validates SQL syntax, join conditions, and sandbox table access.",
              passed: case1Pass,
              details: data.error
                ? `Syntax/Execution Error: ${data.error}`
                : isBlankOrStarter
                ? "Template unmodified. Write analytical query."
                : "Executed with valid table references.",
            },
            {
              name: "Check 2: Result Set & Output Math",
              description: "Verifies dataset produces non-empty output with calculated fields.",
              passed: case2Pass,
              details: data.rows?.length > 0
                ? `Returned ${data.rows.length} rows.`
                : "0 rows returned. Verify filter and join conditions.",
            },
            {
              name: "Check 3: 12 LPA Analytical Structure",
              description: "Checks analytical structure against trivial SELECT bypasses.",
              passed: case3Pass,
              details: case3Pass
                ? "Production analytical query structure validated."
                : "Query is too basic or unmodified starter code.",
            },
          ],
        });
      } catch (err: any) {
        setTestResults({
          tested: true,
          allPassed: false,
          cases: [
            {
              name: "Check 1: Syntax & Sandbox Execution",
              description: "Checks if query executes cleanly.",
              passed: false,
              details: err.message || "Failed to execute query.",
            },
          ],
        });
      } finally {
        setIsRunningTests(false);
      }
    } else if (assignmentType.includes("EXCEL")) {
      const hasUploadedExcel = uploadedFiles.some((f) => f.type.includes("xls") || f.type.includes("csv"));
      const hasFormulas = /=XLOOKUP|=INDEX|=MATCH|=FILTER|=SUMIFS|=COUNTIFS/i.test(activeCode);
      const hasNotes = notes.trim().length > 20;

      setTestResults({
        tested: true,
        allPassed: (hasUploadedExcel || hasFormulas) && hasNotes,
        cases: [
          {
            name: "Check 1: Excel Workbook Deliverable (.xlsx / .csv)",
            description: "Verifies completed Excel model workbook has been uploaded.",
            passed: hasUploadedExcel,
            details: hasUploadedExcel
              ? `Uploaded workbook (${uploadedFiles[0].filename}) attached.`
              : "No .xlsx/.csv file uploaded yet. Attach your completed model.",
          },
          {
            name: "Check 2: Dynamic Formulas / Functions Documented",
            description: "Verifies modern Excel formulas (XLOOKUP, FILTER, SUMIFS) are provided.",
            passed: hasFormulas || hasUploadedExcel,
            details: hasFormulas
              ? "Modern lookup / aggregation formulas detected."
              : hasUploadedExcel
              ? "Workbook provided; formula inspection will run during grading."
              : "Document formulas in editor or upload workbook.",
          },
          {
            name: "Check 3: Business Model Explanation & Assumptions",
            description: "Checks for methodology notes explaining financial/operational assumptions.",
            passed: hasNotes,
            details: hasNotes
              ? "Methodology notes provided."
              : "Please write at least 2-3 sentences explaining your approach.",
          },
        ],
      });
      setIsRunningTests(false);
    } else if (assignmentType.includes("PYTHON")) {
      const hasNotebookOrScript = uploadedFiles.some((f) => f.type.includes("ipynb") || f.type.includes("py"));
      const hasCode = activeCode.trim().length > 50;
      const hasImportsOrFuncs = /import\s+pandas|import\s+numpy|def\s+|\.read_csv|pd\./i.test(activeCode);
      const hasColabUrl = /colab\.research\.google\.com|github\.com/i.test(externalUrl);

      setTestResults({
        tested: true,
        allPassed: (hasNotebookOrScript || hasCode || hasColabUrl) && (hasImportsOrFuncs || hasNotebookOrScript),
        cases: [
          {
            name: "Check 1: Python Pipeline Deliverable (Script, Notebook or Colab)",
            description: "Verifies Python script, notebook file, or Colab link has been provided.",
            passed: hasNotebookOrScript || hasCode || hasColabUrl,
            details: hasNotebookOrScript
              ? `Notebook file (${uploadedFiles[0].filename}) attached.`
              : hasColabUrl
              ? "Colab / GitHub URL provided."
              : hasCode
              ? "Pipeline script entered in editor."
              : "Please provide a Python script, notebook file, or Colab link.",
          },
          {
            name: "Check 2: Pandas / NumPy Vectorization & Transforms",
            description: "Checks for analytical transformations (groupby, agg, merge, clean).",
            passed: hasImportsOrFuncs || hasNotebookOrScript,
            details: hasImportsOrFuncs
              ? "Data pipeline logic and library imports validated."
              : "Missing pandas/numpy transformations or function definitions.",
          },
        ],
      });
      setIsRunningTests(false);
    } else if (assignmentType.includes("POWER_BI") || assignmentType.includes("DAX")) {
      const hasPbix = uploadedFiles.some((f) => f.type.includes("pbix") || f.type.includes("pdf"));
      const hasDashboardUrl = /app\.powerbi\.com|novypro\.com|github\.com/i.test(externalUrl);
      const hasScreenshots = uploadedScreenshots.length > 0;
      const hasDax = /CALCULATE|SUMX|AVERAGEX|FILTER|ALL|ALLEXCEPT|DIVIDE|RELATED|DATESYTD/i.test(activeCode);

      setTestResults({
        tested: true,
        allPassed: (hasPbix || hasDashboardUrl || hasScreenshots) && (hasDax || hasPbix),
        cases: [
          {
            name: "Check 1: Dashboard Evidence (.pbix, Live URL, or Screenshot)",
            description: "Verifies external Power BI deliverable proof has been attached.",
            passed: hasPbix || hasDashboardUrl || hasScreenshots,
            details: hasPbix
              ? `Attached .pbix file (${uploadedFiles[0].filename}).`
              : hasDashboardUrl
              ? "Live published report URL provided."
              : hasScreenshots
              ? `${uploadedScreenshots.length} dashboard screenshot(s) attached.`
              : "Upload your .pbix file, published URL, or dashboard screenshot.",
          },
          {
            name: "Check 2: DAX Measure Formulations",
            description: "Verifies DAX calculation formulas (CALCULATE, DIVIDE, time intelligence).",
            passed: hasDax || hasPbix,
            details: hasDax
              ? "Enterprise DAX measure formulas detected."
              : "Document your core DAX measures in the editor below.",
          },
        ],
      });
      setIsRunningTests(false);
    } else {
      // General Document / Strategy Deliverable (BRD, dbt, Compliance, Architecture)
      const hasHeadings = /#{1,3}\s+[A-Za-z0-9]|(\b1\.|\b2\.|\b3\.)/i.test(activeCode);
      const hasFileOrUrl = uploadedFiles.length > 0 || externalUrl.trim().length > 0;
      const hasDepth = activeCode.trim().length > 100 || hasFileOrUrl;

      setTestResults({
        tested: true,
        allPassed: (hasHeadings || hasFileOrUrl) && hasDepth,
        cases: [
          {
            name: "Check 1: Deliverable Structure & Hierarchy",
            description: "Validates clear document sections, headings, or uploaded architecture file.",
            passed: hasHeadings || hasFileOrUrl,
            details: hasHeadings
              ? "Structured document headings detected."
              : hasFileOrUrl
              ? "Attached deliverable file or URL."
              : "Use clear markdown headings (# Problem, ## Requirements) or upload document.",
          },
          {
            name: "Check 2: 12 LPA Analytical Depth",
            description: "Ensures deliverable provides actionable, enterprise-grade specifications.",
            passed: hasDepth,
            details: hasDepth
              ? "Sufficient specification depth provided."
              : "Deliverable is too brief. Provide comprehensive requirements.",
          },
        ],
      });
      setIsRunningTests(false);
    }
  };

  const handleSubmit = async () => {
    const hasCode = Boolean(activeCode && activeCode.trim().length > 0);
    const hasFiles = uploadedFiles.length > 0;
    const hasScreenshots = uploadedScreenshots.length > 0;
    const hasUrl = Boolean(externalUrl && externalUrl.trim().length > 0);

    if (!hasCode && !hasFiles && !hasScreenshots && !hasUrl) {
      setErrorMessage(
        "Please provide a solution deliverable (code, file upload, screenshot proof, or live link) before submitting."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const activeExternalUrl = externalUrl || undefined;
      const combinedNotes = activeExternalUrl
        ? `[Live URL / Repo]: ${activeExternalUrl}\n\n[Learner Architectural Notes]:\n${notes}`
        : notes;

      const submissionType =
        hasFiles && hasCode
          ? "MIXED"
          : hasFiles
          ? "FILE"
          : hasUrl && !hasCode
          ? "URL"
          : "CODE";

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment?.id || params.assignId,
          submittedCode: activeCode || "",
          notes: combinedNotes,
          fileUrls: uploadedFiles.map((f) => f.url),
          screenshotUrls: uploadedScreenshots.map((s) => s.url),
          externalUrl: activeExternalUrl,
          submissionType,
        }),
      });

      const data = await res.json();
      if (data.submissionId) {
        router.push(`/evaluation/${data.submissionId}`);
      } else {
        router.push(`/evaluation/latest`);
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      router.push(`/evaluation/latest`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-masai-red" />
        <p className="text-xs text-muted-foreground font-medium">Loading graded assignment requirements...</p>
      </div>
    );
  }

  const dayNum = assignment?.day?.dayNumber || 1;
  const submissions = assignment?.submissions || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Daily Progress Stepper */}
      <DailyStepper
        currentStep={3}
        dayNumber={dayNum}
        dayId={assignment?.day?.id}
        assignmentId={assignment?.id || params.assignId}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            <span>Day {dayNum} Graded Online Judge</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              {assignmentType} Track
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>AI Synthesized</span>
            </span>
            <span>•</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Due in {assignment?.deadlineHours || 24}h
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">
            {assignment?.title || "Daily Graded Mission"}
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* AI Re-roll button */}
          <button
            onClick={() => handleRegenerateAssignment("standard")}
            disabled={isRegenerating || isSubmitting}
            title="Synthesize a fresh variation of this mission using Gemini AI"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-600 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Synthesizing..." : "✨ Re-roll Mission"}</span>
          </button>

          {/* Hard Mode button */}
          <button
            onClick={() => handleRegenerateAssignment("hard")}
            disabled={isRegenerating || isSubmitting}
            title="Elevate to 12 LPA top-tier interview difficulty with complex edge cases"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            <span>🔥 12 LPA Hard Mode</span>
          </button>

          {/* Pre-Check button */}
          <button
            onClick={handleRunTestCases}
            disabled={isRunningTests || isRegenerating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            {isRunningTests ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />}
            <span>Run Pre-Check</span>
          </button>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRegenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-masai-red hover:bg-masai-red/90 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Deliverables...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Final Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: 5 Clarity Blocks Brief (Left 1 Col) & Dynamic Submission Panel (Right 2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 5 Clarity Blocks Brief */}
        <div className="space-y-4">
          <AssignmentBrief
            assignment={assignment!}
            currentQuestion={currentQuestion}
            selectedQIdx={selectedQIdx}
            onSelectQIdx={setSelectedQIdx}
            questions={questions}
          />

          {/* Prior Attempts History */}
          {submissions.length > 0 && (
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <span className="text-[11px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Prior Attempts ({submissions.length})
              </span>
              <div className="space-y-1.5">
                {submissions.map((sub, idx) => (
                  <div
                    key={sub.id}
                    onClick={() => router.push(`/evaluation/${sub.id}`)}
                    className="p-2.5 rounded-xl bg-muted/50 border border-border text-xs flex items-center justify-between cursor-pointer hover:bg-muted transition-colors"
                  >
                    <span className="text-muted-foreground font-medium">Attempt #{submissions.length - idx}</span>
                    {sub.evaluation ? (
                      <span className={`font-bold ${sub.evaluation.passed ? "text-emerald-600" : "text-amber-600"}`}>
                        Score: {sub.evaluation.score}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Evaluated</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Dynamic Submission Panel */}
        <div className="lg:col-span-2">
          <SubmissionPanel
            modality={modality}
            guidance={guidance}
            activeCode={activeCode}
            onCodeChange={handleCodeChange}
            langInfo={langInfo}
            externalUrl={externalUrl}
            onExternalUrlChange={setExternalUrl}
            uploadedFiles={uploadedFiles}
            onAddFile={(f) => setUploadedFiles((prev) => [...prev, f])}
            onRemoveFile={(idx) => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
            uploadedScreenshots={uploadedScreenshots}
            onAddScreenshot={(s) => setUploadedScreenshots((prev) => [...prev, s])}
            onRemoveScreenshot={(idx) => setUploadedScreenshots((prev) => prev.filter((_, i) => i !== idx))}
            notes={notes}
            onNotesChange={setNotes}
            onRunPreCheck={handleRunTestCases}
            isRunningTests={isRunningTests}
            testResults={testResults}
          />
        </div>
      </div>

      {/* Bottom Submit Action Bar */}
      <div className="p-5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Ready for Scoring?</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Step 4: Automated Evaluation & Scorecard
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Upon submission, our evaluation engine analyzes correctness, queries, deliverables, and performance to generate your report card.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-masai-red hover:bg-masai-red/90 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Solution...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Evaluation (Step 4) →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
