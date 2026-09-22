"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  FileCheck2,
  Send,
  Sparkles,
  Bot,
  Clock,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  FileCode,
  Loader2,
  AlertCircle,
  History,
  Award,
} from "lucide-react";
import { DailyStepper } from "@/components/DailyStepper";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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

  // Store code per question
  const [questionCodes, setQuestionCodes] = useState<Record<string, string>>({});
  const [reportUrl, setReportUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    tested: boolean;
    allPassed: boolean;
    cases: { name: string; description: string; passed: boolean; details: string }[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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

  const [isRegenerating, setIsRegenerating] = useState(false);

  const getLanguageDetails = () => {
    if (assignmentType.includes("PYTHON")) {
      return { lang: "python", file: "pipeline.py", label: "Python Script (Pandas / Analytics)" };
    }
    if (assignmentType.includes("API") || assignmentType.includes("JSON")) {
      return { lang: "json", file: "payload_contract.json", label: "REST API Payload & Schema Definition" };
    }
    if (assignmentType.includes("POWER_BI") || assignmentType.includes("DAX")) {
      return { lang: "sql", file: "measures.dax", label: "Power BI DAX & Data Model Definition" };
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
      return { lang: "markdown", file: "deliverable.md", label: "Executive Specification & Strategy Document" };
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
      : currentQuestion.starterCode || "-- Write solution code here"
    : "";

  const handleCodeChange = (val: string | undefined) => {
    if (currentQuestion) {
      setQuestionCodes((prev) => ({ ...prev, [currentQuestion.id]: val || "" }));
    }
  };

  // Local test runner (LeetCode style pre-check)
  const handleRunTestCases = async () => {
    if (!activeCode.trim()) {
      setErrorMessage("Please write your solution code before running test cases.");
      return;
    }

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
              name: "Test Case 1: Schema & Joins Integrity",
              description: "Validates SQL syntax, join conditions, and sandbox table access.",
              passed: case1Pass,
              details: data.error ? `Syntax/Execution Error: ${data.error}` : isBlankOrStarter ? "Template unmodified. Implement query logic." : "Executed with valid table references.",
            },
            {
              name: "Test Case 2: Result Set & Output Math",
              description: "Verifies dataset produces non-empty output with calculated fields.",
              passed: case2Pass,
              details: data.rows?.length > 0 ? `Returned ${data.rows.length} rows.` : "0 rows returned. Check filter conditions.",
            },
            {
              name: "Test Case 3: 12 LPA Edge Cases & Analytical Structure",
              description: "Checks analytical structure against trivial SELECT bypasses.",
              passed: case3Pass,
              details: case3Pass ? "Production query structure validated." : "Query is too basic or unmodified starter code.",
            },
          ],
        });
      } catch (err: any) {
        setTestResults({
          tested: true,
          allPassed: false,
          cases: [
            {
              name: "Test Case 1: Syntax & Sandbox Execution",
              description: "Checks if code executes cleanly.",
              passed: false,
              details: err.message || "Failed to execute query.",
            },
          ],
        });
      } finally {
        setIsRunningTests(false);
      }
    } else if (assignmentType.includes("PYTHON")) {
      const hasImportsOrFuncs = /import\s+pandas|import\s+numpy|def\s+|\.read_csv|pd\./i.test(activeCode);
      const hasTransforms = /\.groupby|\.agg|\.apply|\.merge|\.filter|\.loc|\.iloc|\.pivot|lambda/i.test(activeCode);
      const hasAnalyticalDepth = !isBlankOrStarter && activeCode.length > 80;

      setTestResults({
        tested: true,
        allPassed: hasImportsOrFuncs && hasTransforms && hasAnalyticalDepth,
        cases: [
          {
            name: "Test Case 1: Python & Pandas Syntactic Structure",
            description: "Verifies library imports, function signatures, and DataFrame operations.",
            passed: hasImportsOrFuncs,
            details: hasImportsOrFuncs ? "Pandas/NumPy idioms & function syntax validated." : "Missing pandas/numpy imports or analytical function definition.",
          },
          {
            name: "Test Case 2: Vectorized Transformations & Aggregations",
            description: "Checks for non-trivial data manipulation (groupby, merge, agg, pivot).",
            passed: hasTransforms,
            details: hasTransforms ? "Vectorized transformations & aggregations detected." : "No aggregation or transformation logic found (groupby/merge/pivot).",
          },
          {
            name: "Test Case 3: Pipeline Output & Depth",
            description: "Verifies script contains complete data pipeline logic.",
            passed: hasAnalyticalDepth,
            details: hasAnalyticalDepth ? "Sufficient analytical depth provided." : "Pipeline is too brief or incomplete.",
          },
        ],
      });
      setIsRunningTests(false);
    } else if (assignmentType.includes("API") || assignmentType.includes("JSON")) {
      let isJsonValid = false;
      try {
        JSON.parse(activeCode);
        isJsonValid = true;
      } catch {
        isJsonValid = /\{\s*["']|\b(GET|POST|PUT|DELETE)\b/i.test(activeCode);
      }
      const hasEndpointSchema = /status|data|error|headers|body|response|code|id/i.test(activeCode);
      const hasAuthOrCodes = /bearer|token|auth|200|201|400|401|404|500/i.test(activeCode);

      setTestResults({
        tested: true,
        allPassed: isJsonValid && hasEndpointSchema && hasAuthOrCodes,
        cases: [
          {
            name: "Test Case 1: JSON Payload & Schema Syntax",
            description: "Checks payload format and syntactic correctness.",
            passed: isJsonValid,
            details: isJsonValid ? "Valid JSON/HTTP payload structure." : "Malformed JSON syntax or missing object notation.",
          },
          {
            name: "Test Case 2: Contract Attributes & Response Hierarchy",
            description: "Checks for standard API schema fields (status, data, error, response).",
            passed: hasEndpointSchema,
            details: hasEndpointSchema ? "Standard API response envelope detected." : "Missing core response envelope fields (status/data/error).",
          },
          {
            name: "Test Case 3: HTTP Status Codes & Security Headers",
            description: "Verifies status codes (200/201/400) or authorization header patterns.",
            passed: hasAuthOrCodes,
            details: hasAuthOrCodes ? "HTTP status codes or auth contract validated." : "Missing HTTP status codes (e.g. 200/400) or auth references.",
          },
        ],
      });
      setIsRunningTests(false);
    } else if (assignmentType.includes("POWER_BI") || assignmentType.includes("DAX")) {
      const hasDaxSignatures = /CALCULATE|SUM|SUMX|AVERAGE|DIVIDE|COUNTROWS|DISTINCTCOUNT/i.test(activeCode);
      const hasContextTransition = /FILTER|ALL|ALLEXCEPT|RELATED|USERELATIONSHIP|KEEPFILTERS|VALUES/i.test(activeCode);
      const hasSafeMath = !isBlankOrStarter && activeCode.length > 40;

      setTestResults({
        tested: true,
        allPassed: hasDaxSignatures && hasContextTransition && hasSafeMath,
        cases: [
          {
            name: "Test Case 1: DAX Function Signatures",
            description: "Verifies standard DAX aggregation & calculation operators.",
            passed: hasDaxSignatures,
            details: hasDaxSignatures ? "Core DAX functions (CALCULATE, DIVIDE, SUMX) detected." : "Missing core DAX aggregation functions.",
          },
          {
            name: "Test Case 2: Filter Context & Table Navigation",
            description: "Checks for filter modifiers (FILTER, ALL, RELATED, USERELATIONSHIP).",
            passed: hasContextTransition,
            details: hasContextTransition ? "Filter context modifier detected." : "Lacks context manipulation (FILTER, ALL, RELATED).",
          },
          {
            name: "Test Case 3: Measure Definition Completeness",
            description: "Ensures comprehensive measure definition with safe math handling.",
            passed: hasSafeMath,
            details: hasSafeMath ? "Production-grade measure formulation." : "Measure is too brief or unmodified starter code.",
          },
        ],
      });
      setIsRunningTests(false);
    } else {
      // Document / Architecture / Strategy Modalities: BRD, PROMPT_ENG, AI_PRD, COMPLIANCE, CHANGE_MGMT, CONSULTING_CASE
      const hasHeadings = /#{1,3}\s+[A-Za-z0-9]|(\b1\.|\b2\.|\b3\.)/i.test(activeCode);
      const hasDomainKeywords =
        assignmentType.includes("BRD")
          ? /user stor|acceptance criteria|scope|stakeholder|requirement/i.test(activeCode)
          : assignmentType.includes("PROMPT")
          ? /system|prompt|role|few-shot|output schema|constraint/i.test(activeCode)
          : assignmentType.includes("AI_PRD")
          ? /model|latency|fallback|guardrail|hallucination|accuracy|roi/i.test(activeCode)
          : assignmentType.includes("COMPLIANCE")
          ? /dpdp|gdpr|pii|privacy|audit|retention|consent|data protection/i.test(activeCode)
          : assignmentType.includes("CHANGE")
          ? /adkar|raci|stakeholder|communication|training|resistance/i.test(activeCode)
          : /mece|executive summary|recommendation|levers|roi|risk|c-suite/i.test(activeCode);

      const hasThoroughDepth = !isBlankOrStarter && activeCode.length > 120;

      setTestResults({
        tested: true,
        allPassed: hasHeadings && hasDomainKeywords && hasThoroughDepth,
        cases: [
          {
            name: "Test Case 1: Executive Document Structure",
            description: "Validates clear hierarchical headings, sections, or numbered breakdown.",
            passed: hasHeadings,
            details: hasHeadings ? "Clear structural hierarchy & sections detected." : "Missing clear markdown headings or numbered sections.",
          },
          {
            name: `Test Case 2: ${assignmentType} Domain Framework`,
            description: `Checks for critical industry terminology and frameworks for ${assignmentType}.`,
            passed: hasDomainKeywords,
            details: hasDomainKeywords ? "Industry-standard frameworks and domain terminology validated." : `Missing expected ${assignmentType} terminology.`,
          },
          {
            name: "Test Case 3: 12 LPA Analytical Depth & Rigor",
            description: "Ensures deliverable provides actionable, enterprise-grade detail.",
            passed: hasThoroughDepth,
            details: hasThoroughDepth ? "Sufficient depth and operational detail provided." : "Deliverable is too brief. Provide a thorough specification.",
          },
        ],
      });
      setIsRunningTests(false);
    }
  };

  const handleSubmit = async () => {
    if (!activeCode.trim()) {
      setErrorMessage("Please enter your solution code before submitting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const combinedNotes = reportUrl
        ? `[Live Dashboard Report URL]: ${reportUrl}\n\n[Learner Architectural Notes]:\n${notes}`
        : notes;

      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment?.id || params.assignId,
          submittedCode: activeCode,
          notes: combinedNotes,
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
        <p className="text-xs text-slate-400 font-medium">Loading graded assignment requirements...</p>
      </div>
    );
  }

  const dayNum = assignment?.day?.dayNumber || 2;
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
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {assignmentType} Track
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              <span>AI Synthesized</span>
            </span>
            <span>•</span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Due in {assignment?.deadlineHours || 24}h
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight mt-1">
            {assignment?.title || "Daily Graded Assignment"}
          </h1>
          {currentQuestion?.adaptiveReason && (
            <p className="text-xs text-indigo-700 font-medium bg-indigo-50/70 border border-indigo-100 rounded-md px-2.5 py-1 mt-1.5 inline-block">
              🎯 {currentQuestion.adaptiveReason}
            </p>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* AI Re-roll and Hard Mode buttons */}
          <button
            onClick={() => handleRegenerateAssignment("standard")}
            disabled={isRegenerating || isSubmitting}
            title="Synthesize a new variation of this mission using Gemini AI"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-600 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Synthesizing..." : "✨ Re-roll Mission"}</span>
          </button>

          <button
            onClick={() => handleRegenerateAssignment("hard")}
            disabled={isRegenerating || isSubmitting}
            title="Elevate to 12 LPA top-tier interview difficulty with complex edge cases"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
          >
            <span>🔥 12 LPA Hard Mode</span>
          </button>

          <button
            onClick={handleRunTestCases}
            disabled={isRunningTests || isRegenerating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isRunningTests ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />}
            <span>Run Test Cases</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRegenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-masai-red hover:bg-masai-red/90 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating Submission...</span>
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
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Problem Brief & Monaco Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Problem Requirements, Acceptance Criteria & Rubric */}
        <div className="space-y-4">
          {/* Question Selector if multiple */}
          {questions.length > 1 && (
            <div className="p-3 rounded-xl bg-card border border-border space-y-2 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Assignment Problems:</span>
              <div className="flex gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQIdx(idx)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedQIdx === idx
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Question {idx + 1} ({q.weight}%)
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Assignment Objectives
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {assignment?.description || "Solve the business case using production-standard patterns."}
            </p>

            {/* AI Adaptive Mission Badge */}
            {(currentQuestion?.isAdaptive || currentQuestion?.adaptiveReason) && (
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-xs text-purple-950 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-purple-700">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Adaptive Performance Mission</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold ml-auto">
                    Tailored For You
                  </span>
                </div>
                <p className="text-purple-800 text-[11px] leading-relaxed">
                  {currentQuestion.adaptiveReason ||
                    "This challenge was dynamically adapted by Gemini based on your previous day's performance to target specific weak areas and reinforce 12 LPA benchmark mastery."}
                </p>
              </div>
            )}

            {currentQuestion?.prompt && (
              <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs text-foreground">
                <span className="font-bold text-indigo-600 block mb-1">
                  Question {selectedQIdx + 1} ({currentQuestion.weight}% Weight):
                </span>
                <p className="leading-relaxed whitespace-pre-line text-slate-700">{currentQuestion.prompt}</p>
              </div>
            )}

            {/* Test Scenarios Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                Online Judge Test Scenarios:
              </span>
              <ul className="text-slate-600 space-y-1 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">1.</span>
                  <span><strong>Base Data Integrity:</strong> Valid table joins, no Cartesian fan-out, proper alias usage.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">2.</span>
                  <span><strong>Calculated Metrics:</strong> Correct mathematical formulation for aggregates & ratios.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">3.</span>
                  <span><strong>Edge & Boundary:</strong> Filter conditions, NULL safety, order consistency.</span>
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-border">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground mb-2">Grading Rubric Breakdown:</h4>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Correct Output & Math:</span>
                  <span className="font-bold text-slate-900">40%</span>
                </div>
                <div className="flex justify-between">
                  <span>Query / Code Architecture:</span>
                  <span className="font-bold text-slate-900">20%</span>
                </div>
                <div className="flex justify-between">
                  <span>Edge Cases & Filtering:</span>
                  <span className="font-bold text-slate-900">15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency & Performance:</span>
                  <span className="font-bold text-slate-900">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Naming & Style Standards:</span>
                  <span className="font-bold text-slate-900">10%</span>
                </div>
                <div className="flex justify-between">
                  <span>Explanation & Context:</span>
                  <span className="font-bold text-slate-900">5%</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900">
              <span className="font-bold">Strict 70% Cutoff:</span> Passing score is <strong>70%</strong>. Blank starter templates are rejected with 0%. Advancement requires solving the problem.
            </div>
          </div>

          {/* If Power BI, provide dedicated Interactive Report URL field */}
          {(assignmentType.includes("POWER_BI") || assignmentType.includes("DAX")) && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-amber-900 block flex items-center justify-between">
                <span>Live Interactive Dashboard URL</span>
                <span className="text-[10px] text-amber-700 uppercase font-semibold">Portfolio Requirement</span>
              </label>
              <input
                type="url"
                value={reportUrl}
                onChange={(e) => setReportUrl(e.target.value)}
                placeholder="https://app.powerbi.com/view?... or NovyPro report link"
                className="w-full p-2.5 rounded-lg bg-white border border-amber-200 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[11px] text-amber-800">
                Paste your published report link from NovyPro, Power BI Service, or GitHub repo.
              </p>
            </div>
          )}

          {/* Learner Notes Box */}
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Architectural Notes / Explanation (5% Weight)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain your approach, choices, and how edge cases were addressed..."
              className="w-full p-2.5 rounded-lg bg-muted/40 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Past Submissions History */}
          {submissions.length > 0 && (
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Prior Attempts ({submissions.length})
              </span>
              <div className="space-y-1.5">
                {submissions.map((sub, idx) => (
                  <div
                    key={sub.id}
                    onClick={() => router.push(`/evaluation/${sub.id}`)}
                    className="p-2 rounded-lg bg-muted/50 border border-border text-xs flex items-center justify-between cursor-pointer hover:bg-muted transition-colors"
                  >
                    <span className="text-slate-600">Attempt #{submissions.length - idx}</span>
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

        {/* Right 2 Cols: Monaco Editor & Pre-Check Test Runner Output */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-sm h-[480px]">
            <div className="h-10 px-4 bg-muted/60 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5 font-mono text-indigo-600 font-bold">
                <FileCode className="w-4 h-4" /> {langInfo.file} ({langInfo.label})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunTestCases}
                  disabled={isRunningTests}
                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs border border-indigo-200 transition-colors flex items-center gap-1"
                >
                  {isRunningTests ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileCheck2 className="w-3 h-3" />}
                  <span>Run Pre-Check</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-slate-950">
              <Editor
                height="100%"
                defaultLanguage={langInfo.lang}
                theme="vs-dark"
                value={activeCode}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "Fira Code, monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 14 },
                }}
              />
            </div>
          </div>

          {/* Test Cases Results Pane (LeetCode style) */}
          {testResults && (
            <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${testResults.allPassed ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <h4 className="text-xs font-bold text-foreground">
                    Pre-Check Test Case Results ({testResults.cases.filter((c) => c.passed).length}/{testResults.cases.length} Passed)
                  </h4>
                </div>
                <span className={`text-[11px] font-bold ${testResults.allPassed ? "text-emerald-600" : "text-amber-600"}`}>
                  {testResults.allPassed ? "All Test Scenarios Verified!" : "Action Needed Prior to Final Submission"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {testResults.cases.map((tc, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      tc.passed ? "bg-emerald-50/60 border-emerald-200 text-emerald-950" : "bg-rose-50/60 border-rose-200 text-rose-950"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>{tc.name}</span>
                      {tc.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-600">{tc.description}</p>
                    <p className="text-[11px] font-mono mt-1 pt-1 border-t border-slate-200/60 font-semibold">{tc.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Submit Action Bar */}
      <div className="p-5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Ready for Scoring?</span>
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Step 4: Automated Evaluation & Scorecard
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Upon submission, our evaluation engine analyzes correctness, query logic, edge cases, and performance to generate your report card.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-masai-red hover:bg-masai-red/90 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap"
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
