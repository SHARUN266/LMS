"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  Code2,
  FileCheck2,
  Award,
  CalendarCheck,
  Briefcase,
  History,
  BarChart3,
  Bot,
  Settings,
  Flame,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { StudyTimer } from "./StudyTimer";
import { OllamaStatusBadge } from "./OllamaStatusBadge";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{
    name: string;
    targetRole: string;
    activeDayId?: string;
    activeModuleId?: string;
    currentStreak: number;
    xp: number;
    level: number;
  }>({
    name: "Learner",
    targetRole: "BI / Analytics Engineer",
    currentStreak: 12,
    xp: 1450,
    level: 3,
  });

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error("Failed to load profile in AppShell:", err);
      }
    }
    loadUserProfile();
  }, [pathname]);

  const activeDaySlug = profile.activeDayId || "day-2";

  const navItems = [
    { label: "Daily Command Center", href: "/dashboard", icon: LayoutDashboard, badge: "Today" },
    { label: "Curriculum Roadmap", href: "/roadmap", icon: Map },
    { label: "Today's Lesson", href: `/learn/module-1/${activeDaySlug}`, icon: BookOpen, badge: "Lesson" },
    { label: "SQL/Code Practice", href: `/practice/${activeDaySlug}`, icon: Code2 },
    { label: "Daily Assignment", href: "/assignment/daily-2", icon: FileCheck2 },
    { label: "AI Evaluation & Rubric", href: "/evaluation/latest", icon: Award },
    { label: "Monday Exam Hall", href: "/assessment/week-1", icon: CalendarCheck, badge: "Exam" },
    { label: "7-Day Capstone Project", href: "/projects/capstone-1", icon: Briefcase, badge: "Project" },
    { label: "Backlog & Remedial", href: "/backlog", icon: History },
    { label: "Skill Mastery Analytics", href: "/analytics", icon: BarChart3 },
    { label: "AI Career Coach", href: "/mentor", icon: Bot, highlight: true },
    { label: "Curriculum Studio", href: "/admin/studio", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090D16] text-slate-100 antialiased">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-masai-red to-rose-600 flex items-center justify-center shadow-glow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">MASAI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-masai-red/20 text-masai-red border border-masai-red/40">
                  AI PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Career Training Engine</p>
            </div>
          </Link>
        </div>

        {/* Current Active Track Card */}
        <div className="p-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1 text-masai-accent">
                <Sparkles className="w-3 h-3" /> Target Role
              </span>
              <span className="text-emerald-400 font-mono font-bold">Week 1 / 20</span>
            </div>
            <p className="text-xs font-bold text-slate-100 mt-1 truncate">{profile.targetRole}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Flame className="w-3 h-3 fill-current text-amber-500" /> {profile.currentStreak} Day Streak
              </span>
              <span className="text-cyan-300 font-bold">{profile.xp} XP</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-gradient-to-r from-masai-red to-masai-accent h-full w-[15%]" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? "bg-masai-red/15 text-white font-semibold border border-masai-red/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                } ${item.highlight ? "text-cyan-300 hover:text-cyan-200" : ""}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? "text-masai-red" : item.highlight ? "text-masai-accent" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      isActive
                        ? "bg-masai-red text-white"
                        : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 text-center">
          <p className="text-[10px] text-slate-500">Local-First • Qwen 2.5 Coder • 0 API Cost</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Command Bar */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-slate-200 tracking-tight hidden sm:block">
              Masai Career BootCamp • <span className="text-masai-accent">Intensive Discipline Mode</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <OllamaStatusBadge />
            <StudyTimer />
          </div>
        </header>

        {/* Page View Container */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090D16] to-[#0D1526] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
