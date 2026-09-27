"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Cpu,
  Sliders,
  Database,
  Save,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Loader2,
  BookOpen,
  ArrowRight,
  Zap,
  Check,
  Building2,
  GraduationCap,
  Layers,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const PRESET_TRACKS = [
  {
    role: "Data Analyst & Analytics Engineering (12 LPA GCC Track)",
    domain: "E-Commerce & Quick Commerce (Zepto, Swiggy, Blinkit)",
    numModules: 4,
    daysPerModule: 3,
  },
  {
    role: "FinTech & Payment Gateway Analytics Engineer",
    domain: "Merchant Settlement & Risk Audit (Razorpay, CRED, Stripe)",
    numModules: 4,
    daysPerModule: 3,
  },
  {
    role: "Enterprise Power BI & DAX Architect",
    domain: "Financial Modeling & Executive C-Suite Dashboards (Fortune 500)",
    numModules: 3,
    daysPerModule: 3,
  },
  {
    role: "Python Data Pipelines & Modern Data Stack Engineer",
    domain: "Cloud ETL & Analytics Engineering (Snowflake, dbt, Airflow)",
    numModules: 4,
    daysPerModule: 3,
  },
];

export default function AdminStudioPage() {
  const [activeTab, setActiveTab] = useState<"generator" | "settings">("generator");

  // Settings State
  const [model, setModel] = useState("gemini-2.5-flash");
  const [strictness, setStrictness] = useState(85);
  const [passingThreshold, setPassingThreshold] = useState(70);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generator State
  const [roleInput, setRoleInput] = useState("Data Analyst & Analytics Engineering (12 LPA GCC Track)");
  const [domainInput, setDomainInput] = useState("E-Commerce & Quick Commerce (Zepto, Swiggy, Blinkit)");
  const [numModules, setNumModules] = useState(4);
  const [daysPerModule, setDaysPerModule] = useState(3);
  const [level, setLevel] = useState("Beginner-to-Advanced (12 LPA Commercial Benchmark)");

  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(1);
  const [generationResult, setGenerationResult] = useState<{
    trackId: string;
    trackTitle: string;
    modulesCount: number;
    daysCount: number;
    firstDayId: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            if (data.config.activeModel) setModel(data.config.activeModel);
            if (typeof data.config.strictness === "number") setStrictness(data.config.strictness);
            if (typeof data.config.passingThreshold === "number") setPassingThreshold(data.config.passingThreshold);
          }
        }
      } catch (err) {
        console.error("Failed to load admin config:", err);
      }
    }
    loadConfig();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeModel: model,
          strictness,
          passingThreshold,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCourse = async () => {
    if (!roleInput.trim() || generating) return;
    setGenerating(true);
    setErrorMsg("");
    setGenerationResult(null);
    setGenStep(1);

    const stepInterval = setInterval(() => {
      setGenStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 4500);

    try {
      const res = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleInput.trim(),
          domain: domainInput.trim(),
          numModules,
          daysPerModule,
          level,
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to synthesize course");
      }

      const data = await res.json();
      setGenStep(4);
      setGenerationResult(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMsg(err.message || "Something went wrong while generating the course.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Praxis Curriculum Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            AI Course Creator & System Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Synthesize complete production bootcamps with Gemini and deploy them directly to your live database.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "generator"
                ? "bg-white dark:bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Course Studio</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-white dark:bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: AI COURSE CREATOR STUDIO ───────────────────────── */}
      {activeTab === "generator" && (
        <div className="space-y-6">
          {/* Main Generator Form Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-card border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm space-y-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Dynamic Curriculum Generator</span>
                <Badge className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px]">
                  Zero Hardcoding • 100% AI
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your desired career track or choose a preset. Gemini will architect modules, daily theory notes, cheat sheets, and hands-on SQL practice drills, and store them directly into your database.
              </p>
            </div>

            {/* Presets */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                💡 Quick Presets (Click to Load)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TRACKS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRoleInput(preset.role);
                      setDomainInput(preset.domain);
                      setNumModules(preset.numModules);
                      setDaysPerModule(preset.daysPerModule);
                    }}
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 text-left transition-all"
                  >
                    <p className="text-xs font-bold text-foreground leading-tight">{preset.role}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{preset.domain}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Form */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  1. Target Role & Career Track Title
                </label>
                <Input
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="e.g. Data Analyst & Analytics Engineering (12 LPA Track)"
                  disabled={generating}
                  className="text-xs bg-background h-10 border-border"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  2. Industry Domain & Target Companies
                </label>
                <Input
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="e.g. FinTech (Razorpay, CRED) or Quick Commerce (Zepto, Swiggy)"
                  disabled={generating}
                  className="text-xs bg-background h-10 border-border"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                    Modules Count
                  </label>
                  <select
                    value={numModules}
                    onChange={(e) => setNumModules(Number(e.target.value))}
                    disabled={generating}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value={2}>2 Modules (Sprint Track)</option>
                    <option value={3}>3 Modules (Core Bootcamp)</option>
                    <option value={4}>4 Modules (Comprehensive Masterclass)</option>
                    <option value={6}>6 Modules (Enterprise Immersion)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                    Days per Module
                  </label>
                  <select
                    value={daysPerModule}
                    onChange={(e) => setDaysPerModule(Number(e.target.value))}
                    disabled={generating}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value={2}>2 Days per Module (Fast)</option>
                    <option value={3}>3 Days per Module (Recommended)</option>
                    <option value={4}>4 Days per Module (Intensive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                    Level & Rigor
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    disabled={generating}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="Beginner-to-Advanced (12 LPA Commercial Benchmark)">
                      12 LPA Benchmark
                    </option>
                    <option value="Senior Staff & Architecture Optimization">
                      Senior Staff Rigor
                    </option>
                    <option value="Absolute Beginner to Job-Ready">
                      Beginner to Job-Ready
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Generation Status Stepper */}
            {generating && (
              <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Axiom is synthesizing your custom course (Estimated: 25-40s)...</span>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className={genStep >= 1 ? "text-indigo-600 font-semibold" : ""}>
                    {genStep > 1 ? "✅" : "🔄"} Step 1: Architecting {numModules} production modules for {roleInput}...
                  </p>
                  <p className={genStep >= 2 ? "text-indigo-600 font-semibold" : ""}>
                    {genStep > 2 ? "✅" : genStep === 2 ? "🔄" : "⏳"} Step 2: Writing {numModules * daysPerModule} daily lesson theories, cheat sheets & objectives...
                  </p>
                  <p className={genStep >= 3 ? "text-indigo-600 font-semibold" : ""}>
                    {genStep > 3 ? "✅" : genStep === 3 ? "🔄" : "⏳"} Step 3: Generating interactive sandbox drills & verified solutions...
                  </p>
                  <p className={genStep >= 4 ? "text-indigo-600 font-semibold" : ""}>
                    {genStep === 4 ? "🔄" : "⏳"} Step 4: Persisting directly to SQLite database...
                  </p>
                </div>
              </div>
            )}

            {/* Success Card */}
            {generationResult && (
              <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Course Successfully Synthesized and Deployed to Database!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Track: <strong className="text-foreground">{generationResult.trackTitle}</strong> with{" "}
                  <strong className="text-foreground">{generationResult.modulesCount} Modules</strong> and{" "}
                  <strong className="text-foreground">{generationResult.daysCount} Production Days</strong> has been activated for your profile.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Link href="/roadmap">
                    <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      <Map className="w-3.5 h-3.5" />
                      <span>View in Roadmap</span>
                    </Button>
                  </Link>
                  <Link href="/learn">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-800 dark:text-emerald-200">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Start Day 1 Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Action Button */}
            {!generationResult && (
              <Button
                onClick={handleGenerateCourse}
                disabled={generating || !roleInput.trim()}
                className="w-full h-11 text-xs font-bold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Entire Curriculum with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Deploy Complete Course to Database</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: SYSTEM CONFIGURATION ───────────────────────────── */}
      {activeTab === "settings" && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-foreground">AI Evaluation Parameters</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize your automated evaluation model and strictness thresholds.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" /> Active Evaluation Model (Google AI)
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Google AI Studio • Recommended High Performance)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast Reasoning & Code Analysis)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Multimodal & Long Context)</option>
            </select>
          </div>

          {/* Strictness Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-600" /> Evaluation Strictness Rubric
              </label>
              <span className="text-xs font-mono font-bold text-amber-600">{strictness}% Strict</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={strictness}
              onChange={(e) => setStrictness(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Higher strictness penalizes missing NULL handling, sub-optimal CTEs, and poor column aliases.
            </span>
          </div>

          {/* Passing Threshold */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Minimum Passing Threshold
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600">{passingThreshold}% Required</span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              value={passingThreshold}
              onChange={(e) => setPassingThreshold(Number(e.target.value))}
              className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Submissions scoring below this threshold trigger mandatory Remedial Practice before unlocking the next day.
            </span>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Settings persisted locally</span>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
