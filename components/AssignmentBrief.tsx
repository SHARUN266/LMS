"use client";

import React from "react";
import {
  FileText,
  Wrench,
  UploadCloud,
  CheckCircle2,
  Target,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Info,
  Layers,
  Award,
} from "lucide-react";
import { ToolGuidance, getToolGuidance, AssignmentModality } from "@/lib/dynamic-generator";

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

interface AssignmentBriefProps {
  assignment: {
    id: string;
    title: string;
    type: string;
    description: string;
    toolGuidance?: string | null;
    skillsTested?: string | null;
    questions?: AssignmentQuestion[];
  };
  currentQuestion?: AssignmentQuestion;
  selectedQIdx: number;
  onSelectQIdx: (idx: number) => void;
  questions: AssignmentQuestion[];
}

export function AssignmentBrief({
  assignment,
  currentQuestion,
  selectedQIdx,
  onSelectQIdx,
  questions,
}: AssignmentBriefProps) {
  const modality = (assignment.type || "SQL") as AssignmentModality;

  // Resolve Tool Guidance: use stored JSON if available, otherwise dynamically derive
  let guidance: ToolGuidance;
  try {
    if (assignment.toolGuidance) {
      guidance = JSON.parse(assignment.toolGuidance);
    } else {
      guidance = getToolGuidance(modality);
    }
  } catch {
    guidance = getToolGuidance(modality);
  }

  // Resolve skills tested
  let skills: string[] = [];
  try {
    if (assignment.skillsTested) {
      const parsed = JSON.parse(assignment.skillsTested);
      if (Array.isArray(parsed)) skills = parsed;
    }
  } catch {}
  if (skills.length === 0) {
    skills = [guidance.skillCategory || modality];
  }

  return (
    <div className="space-y-4">
      {/* Question Selector Tabs (if multiple questions exist) */}
      {questions.length > 1 && (
        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Assignment Questions:
          </span>
          <div className="flex gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => onSelectQIdx(idx)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedQIdx === idx
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Q{idx + 1} ({q.weight}%)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BLOCK 1: 📋 MISSION BRIEF (What to do) */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> 1. Mission Brief
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            {modality} Mission
          </span>
        </div>

        <p className="text-xs text-foreground/90 font-medium leading-relaxed">
          {assignment.description || "Solve the analytical industry problem under real-world constraints."}
        </p>

        {/* AI Adaptive Mission Tailoring Note */}
        {(currentQuestion?.isAdaptive || currentQuestion?.adaptiveReason) && (
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>AI Adaptive Mission</span>
              <span className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 px-1.5 py-0.2 rounded font-bold ml-auto">
                Personalized
              </span>
            </div>
            <p className="text-purple-900 dark:text-purple-200 text-[11px] leading-relaxed">
              {currentQuestion.adaptiveReason ||
                "Dynamically adapted by AI to reinforce your specific weak areas and target 12 LPA benchmark mastery."}
            </p>
          </div>
        )}

        {/* Question Prompt */}
        {currentQuestion?.prompt && (
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground space-y-1.5">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-[11px] uppercase tracking-wider">
              Specific Deliverable Requirements:
            </span>
            <div className="leading-relaxed whitespace-pre-line text-xs font-normal text-foreground/90">
              {currentQuestion.prompt}
            </div>
          </div>
        )}
      </div>

      {/* BLOCK 2: 🔧 WHERE TO DO THIS (Tool Guidance) */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <Wrench className="w-4 h-4" /> 2. Where To Complete This Task
        </h3>

        <div className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
          guidance.worksInPlatform
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-amber-500/10 border-amber-500/20"
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              {guidance.primaryTool}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              guidance.worksInPlatform
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
            }`}>
              {guidance.worksInPlatform ? "Inside Platform" : "External Industry Tool"}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {guidance.externalToolSetup ||
              (guidance.worksInPlatform
                ? "You can write, run, and validate your code directly inside the built-in online editor."
                : "Complete this hands-on deliverable using the designated external tool, then submit your deliverable files/links back to the platform.")}
          </p>

          {guidance.externalToolUrl && (
            <a
              href={guidance.externalToolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-1"
            >
              <span>Open / Download {guidance.primaryTool}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* BLOCK 3: 📤 WHAT TO SUBMIT */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4" /> 3. What To Submit
        </h3>

        <div className="space-y-2">
          {guidance.submissionTypes.map((type) => {
            let label = "";
            let desc = "";
            switch (type) {
              case "CODE_EDITOR":
                label = "Code / Formula Implementation";
                desc = "Write clean, executable query or formulas in the code editor.";
                break;
              case "FILE_UPLOAD":
                label = "Deliverable File (.xlsx, .pbix, .ipynb, .pdf)";
                desc = "Upload your completed workbook or model file.";
                break;
              case "URL_LINK":
                label = "Published Link / GitHub Repository";
                desc = "Provide your live report link or public GitHub URL.";
                break;
              case "SCREENSHOT":
                label = "Visual Proof / Dashboard Screenshot";
                desc = "Upload image proof of your working dashboard or workflow.";
                break;
              case "TEXT_SUMMARY":
                label = "Architectural Notes & Explanation";
                desc = "Document your business rationale and edge case trade-offs.";
                break;
            }

            return (
              <div
                key={type}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/80"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground block">{label}</span>
                  <span className="text-[11px] text-muted-foreground">{desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOCK 4: ⚡ HOW EVALUATED */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <Award className="w-4 h-4" /> 4. Evaluation Method & Rubric
        </h3>

        <p className="text-[11px] text-muted-foreground leading-relaxed bg-muted/50 p-2.5 rounded-xl border border-border">
          {guidance.evaluationMethod}
        </p>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Deterministic Correctness:</span>
            <span className="font-bold text-foreground">40%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Query / Pipeline Architecture:</span>
            <span className="font-bold text-foreground">20%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Edge Cases & Exception Handling:</span>
            <span className="font-bold text-foreground">15%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Performance & Scalability:</span>
            <span className="font-bold text-foreground">10%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Readability & Clean Code:</span>
            <span className="font-bold text-foreground">10%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Executive Business Explanation:</span>
            <span className="font-bold text-foreground">5%</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-200">
          <span className="font-bold">Strict 70% Cutoff:</span> Unchanged starter code or blank templates are rejected with 0%. Passing requires a complete, verified solution.
        </div>
      </div>

      {/* BLOCK 5: 🎯 SKILLS TESTED */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
          <Target className="w-4 h-4" /> 5. Core Competencies Tested
        </h3>

        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
