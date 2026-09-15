"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Clock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [targetRole, setTargetRole] = useState("BI / Analytics Engineer");
  const [dailyHours, setDailyHours] = useState(6);
  const [experienceLevel, setExperienceLevel] = useState("Beginner-Intermediate");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFinish = async () => {
    setIsGenerating(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          dailyStudyGoal: dailyHours,
        }),
      });
      router.push("/dashboard");
    } catch (e) {
      router.push("/dashboard");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-masai-red/20 text-masai-red border border-masai-red/40 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Bootcamp Onboarding
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Configure Your Masai-Style Career Track
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Convert your career goal into a disciplined daily learning schedule with strict rubrics and 1-on-1 AI evaluation.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-xl">
        {/* 1. Target Role Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-masai-accent" /> Select Your Target Career Role
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { role: "BI / Analytics Engineer", desc: "SQL, Python, Data Modeling, dbt, Power BI & DAX" },
              { role: "Data Analyst & Automation", desc: "Advanced Excel, SQL, Statistics, AI Workflows" },
              { role: "Data Engineer / Cloud", desc: "PySpark, Data Lakes, Kafka, Fabric, PostgreSQL" },
            ].map((item) => (
              <button
                key={item.role}
                onClick={() => setTargetRole(item.role)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  targetRole === item.role
                    ? "bg-masai-red/10 border-masai-red shadow-glow"
                    : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800"
                }`}
              >
                <span className="text-sm font-bold text-white block">{item.role}</span>
                <span className="text-xs text-slate-400 mt-1 block">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Daily Time Commitment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" /> Daily Study Commitment (Discipline Engine)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { hours: 4, label: "4 Hours / Day", sub: "Part-Time Transition" },
              { hours: 6, label: "6 Hours / Day (Recommended)", sub: "Full-Time Bootcamp" },
              { hours: 8, label: "8 Hours / Day (Intensive)", sub: "Super Fast Track" },
            ].map((item) => (
              <button
                key={item.hours}
                onClick={() => setDailyHours(item.hours)}
                className={`p-3.5 rounded-xl text-center border transition-all ${
                  dailyHours === item.hours
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-sm font-bold block">{item.label}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">{item.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Current Level */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Current Experience Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["Complete Beginner", "Beginner-Intermediate", "Experienced Professional"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExperienceLevel(lvl)}
                className={`p-3 rounded-xl text-center border text-xs font-semibold transition-all ${
                  experienceLevel === lvl
                    ? "bg-amber-500/10 border-amber-500 text-amber-300"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Estimated Program Duration: <span className="text-white font-bold">20 Weeks (120 Study Days)</span>
          </div>
          <button
            onClick={handleFinish}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-white text-xs font-extrabold shadow-glow transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile & Launching Bootcamp...</span>
              </>
            ) : (
              <>
                <span>Generate Roadmap & Start BootCamp</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
