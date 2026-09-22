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
  const [model, setModel] = useState("gemini-2.5-flash");
  const [strictness, setStrictness] = useState(85);
  const [passingThreshold, setPassingThreshold] = useState(70);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleSave = async () => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>Praxis System Configuration</span>
        </div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Curriculum CMS & Evaluation Studio
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Customize your automated evaluation parameters, strictness thresholds, and rubric weights.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-card border border-border shadow-sm space-y-6">
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
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
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
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Submissions scoring below this threshold trigger mandatory Remedial Practice before unlocking the next day.
          </span>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Settings persisted locally</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
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
