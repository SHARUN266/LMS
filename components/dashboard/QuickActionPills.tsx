"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Code2,
  FileCheck2,
  CalendarCheck,
  Map,
  Sparkles,
} from "lucide-react";

interface QuickActionPillsProps {
  activeDayId?: string;
  activeLessonHref?: string;
  practiceHref?: string;
  assignmentHref?: string;
}

export function QuickActionPills({
  activeLessonHref = "/learn",
  practiceHref = "/practice",
  assignmentHref = "/assignment",
}: QuickActionPillsProps) {
  const actions = [
    {
      label: "Resume Lesson",
      icon: BookOpen,
      href: activeLessonHref,
      bgClass: "bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border-sky-500/30",
      iconBg: "bg-sky-500 text-slate-950",
    },
    {
      label: "Code Sandbox",
      icon: Code2,
      href: practiceHref,
      bgClass: "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30",
      iconBg: "bg-indigo-500 text-white",
    },
    {
      label: "Daily Assignment",
      icon: FileCheck2,
      href: assignmentHref,
      bgClass: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30",
      iconBg: "bg-amber-500 text-slate-950",
    },
    {
      label: "Weekly Assessment",
      icon: CalendarCheck,
      href: "/assessment",
      bgClass: "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30",
      iconBg: "bg-emerald-500 text-slate-950",
    },
    {
      label: "Curriculum Roadmap",
      icon: Map,
      href: "/roadmap",
      bgClass: "bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-300 border-fuchsia-500/30",
      iconBg: "bg-fuchsia-500 text-white",
    },
  ];

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.label}
            href={act.href}
            className={`pill-button flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold backdrop-blur-sm transition-all shadow-sm ${act.bgClass}`}
          >
            <span className={`p-1 rounded-md flex items-center justify-center ${act.iconBg}`}>
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span>{act.label}</span>
            <Sparkles className="w-3 h-3 opacity-60 ml-0.5" />
          </Link>
        );
      })}
    </div>
  );
}
