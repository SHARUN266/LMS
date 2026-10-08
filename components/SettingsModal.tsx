"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Sliders,
  BrainCircuit,
  Clock,
  Database,
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (name: string, targetRole: string) => void;
}

export function SettingsModal({ isOpen, onClose, onProfileUpdated }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "discipline" | "ai" | "system">("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile States
  const [name, setName] = useState("Sharun");
  const [targetRole, setTargetRole] = useState("BI / Analytics Engineer");
  const [dailyHours, setDailyHours] = useState(6);
  const [experienceLevel, setExperienceLevel] = useState("Beginner-Intermediate");

  // AI & Admin States
  const [activeModel, setActiveModel] = useState("gemini-2.5-flash");
  const [strictness, setStrictness] = useState(85);
  const [passingThreshold, setPassingThreshold] = useState(70);

  // Fetch current settings on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      fetch("/api/profile")
        .then((r) => r.json())
        .catch(() => null),
      fetch("/api/admin/config")
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([profileData, configData]) => {
      if (!isMounted) return;
      if (profileData?.profile) {
        setName(profileData.profile.name || "Sharun");
        setTargetRole(profileData.profile.targetRole || "BI / Analytics Engineer");
        setDailyHours(profileData.profile.dailyStudyGoal || 6);
        setExperienceLevel(profileData.profile.experienceLevel || "Beginner-Intermediate");
      }
      if (configData?.config) {
        setActiveModel(configData.config.activeModel || "gemini-2.5-flash");
        setStrictness(configData.config.strictness || 85);
        setPassingThreshold(configData.config.passingThreshold || 70);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Update Profile
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          targetRole,
          dailyStudyGoal: Number(dailyHours),
          experienceLevel,
        }),
      });

      // 2. Update AI Admin Config
      await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeModel,
          strictness: Number(strictness),
          passingThreshold: Number(passingThreshold),
        }),
      });

      setSavedSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(name.trim(), targetRole);
      }
      setTimeout(() => {
        setSavedSuccess(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              {name.slice(0, 2).toUpperCase() || "SK"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Platform & Profile Settings</h3>
                <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                  Single User OS
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Configure your personal 12 LPA Career Accelerator</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "profile"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profile & Target
          </button>
          <button
            onClick={() => setActiveTab("discipline")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "discipline"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Study Commitment
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "ai"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" /> AI Evaluator
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "system"
                ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Database & Health
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Loading preferences from Neon DB...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Profile & Target Role */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Candidate Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sharun"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      This name is displayed across your header, reports, and AI feedback scorecards.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Career Role
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-900"
                    >
                      <option value="BI / Analytics Engineer">BI / Analytics Engineer (SQL, Python, dbt, Power BI)</option>
                      <option value="Senior 12 LPA Analytics Engineer">Senior 12 LPA Analytics Engineer (Lakehouse + CI/CD)</option>
                      <option value="Business Analyst & Automation">Business Analyst & Automation (Excel, SQL, Metrics)</option>
                      <option value="Data Platform Engineer">Data Platform Engineer (PySpark, Kafka, Cloud)</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      AI evaluations calibrate rubric expectations directly against this target profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Experience Calibration
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "Beginner", label: "Beginner", sub: "Step-by-step guidance" },
                        { id: "Beginner-Intermediate", label: "Accelerated", sub: "Industry standard drills" },
                        { id: "Advanced", label: "Staff Grade", sub: "Strict edge cases" },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setExperienceLevel(lvl.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            experienceLevel === lvl.id
                              ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{lvl.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lvl.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Discipline & Commitment */}
              {activeTab === "discipline" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Daily Study Target (Hours/Day)
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[4, 6, 8, 10].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setDailyHours(hrs)}
                          className={`py-3 px-2 rounded-xl border text-center transition-all ${
                            dailyHours === hrs
                              ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500 font-bold text-indigo-700"
                              : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                          }`}
                        >
                          <p className="text-base font-extrabold">{hrs}h</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{hrs === 6 ? "Recommended" : hrs > 6 ? "Intensive" : "Part-time"}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      The top bar Study Timer calculates your commitment velocity against this daily goal.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Bootcamp Discipline Rule</p>
                      <p className="text-[11px] text-slate-500">
                        Consecutive streak requires at least 1 evaluated assignment or micro-quiz per calendar day.
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  </div>
                </div>
              )}

              {/* Tab 3: AI Evaluator */}
              {activeTab === "ai" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Evaluator AI Engine
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          id: "gemini-2.5-flash",
                          name: "Gemini 2.5 Flash",
                          desc: "Sub-second evaluations with full multi-rubric breakdown (Recommended)",
                        },
                        {
                          id: "gemini-2.5-pro",
                          name: "Gemini 2.5 Pro",
                          desc: "Deep multi-stage reasoning for complex Capstone codebases",
                        },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setActiveModel(m.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            activeModel === m.id
                              ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{m.name}</span>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Grading Strictness Calibration
                      </label>
                      <span className="text-xs font-extrabold text-indigo-600">{strictness}% Strict</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="5"
                      value={strictness}
                      onChange={(e) => setStrictness(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Lenient (50%)</span>
                      <span>12 LPA Industry Baseline (85%)</span>
                      <span>Staff SRE (100%)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Passing Score Threshold
                      </label>
                      <span className="text-xs font-extrabold text-emerald-600">{passingThreshold}% to Pass</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="90"
                      step="5"
                      value={passingThreshold}
                      onChange={(e) => setPassingThreshold(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Scores below this threshold trigger remediation drills and lock subsequent days.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: System & Database */}
              {activeTab === "system" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">Primary Database</span>
                      </div>
                      <Badge className="bg-emerald-500 text-white text-[10px]">Neon Serverless PostgreSQL</Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Connected with connection pooling (`&pgbouncer=true`). All 35 curriculum models are synced.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">AI Evaluation Latency</span>
                      <span className="text-xs font-semibold text-emerald-600">~2,100ms average</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Total Curriculum Days</span>
                      <span className="text-xs font-semibold text-slate-600">90 Days / 13 Modules</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Evaluation Engine</span>
                      <span className="text-xs font-semibold text-slate-600">6-Rubric Vector Matrix</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving} className="text-xs font-semibold">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
