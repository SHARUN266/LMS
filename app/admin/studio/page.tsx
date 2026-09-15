"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function AdminStudioPage() {
  const [model, setModel] = useState("qwen2.5-coder");
  const [strictness, setStrictness] = useState(85);
  const [passingThreshold, setPassingThreshold] = useState(70);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedModel = localStorage.getItem("lms_admin_model");
    const savedStrictness = localStorage.getItem("lms_admin_strictness");
    const savedThreshold = localStorage.getItem("lms_admin_threshold");
    if (savedModel) setModel(savedModel);
    if (savedStrictness) setStrictness(Number(savedStrictness));
    if (savedThreshold) setPassingThreshold(Number(savedThreshold));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem("lms_admin_model", model);
      localStorage.setItem("lms_admin_strictness", String(strictness));
      localStorage.setItem("lms_admin_threshold", String(passingThreshold));

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-masai-red" />
          <span>Local Engine Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Curriculum CMS & AI Prompt Studio
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your local Ollama model parameters, evaluation strictness, and rubric weights.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        {/* Model Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-masai-accent" /> Active Local Ollama Model
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-masai-red font-mono"
          >
            <option value="qwen2.5-coder">qwen2.5-coder (Default • Top Coding Performance)</option>
            <option value="deepseek-r1-distill">deepseek-r1-distill (High Reasoning & Proofs)</option>
            <option value="llama3.2">llama3.2 (Fast Socratic Mentor)</option>
          </select>
        </div>

        {/* Strictness Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" /> Evaluation Strictness Rubric
            </label>
            <span className="text-xs font-mono font-bold text-amber-400">{strictness}% Strict</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={strictness}
            onChange={(e) => setStrictness(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-masai-red"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Higher strictness penalizes missing NULL handling, sub-optimal CTEs, and poor column aliases.
          </span>
        </div>

        {/* Passing Threshold */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Minimum Passing Threshold
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">{passingThreshold}% Required</span>
          </div>
          <input
            type="range"
            min="60"
            max="90"
            value={passingThreshold}
            onChange={(e) => setPassingThreshold(Number(e.target.value))}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Submissions scoring below this threshold trigger mandatory Remedial Practice before unlocking the next day.
          </span>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Settings persisted locally</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-white text-xs font-black shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
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
    </div>
  );
}
