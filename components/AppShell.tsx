"use client";

import React, { ReactNode, useState } from "react";
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
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { StudyTimer } from "./StudyTimer";
import { OllamaStatusBadge } from "./OllamaStatusBadge";

interface AppShellProps {
  children: ReactNode;
}

const NAV_SECTIONS = [
  {
    title: "Learn",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Roadmap", href: "/roadmap", icon: Map },
      { label: "Lesson", href: "/learn/module-1/day-2", icon: BookOpen },
      { label: "Practice", href: "/practice/day-2", icon: Code2 },
    ],
  },
  {
    title: "Evaluate",
    items: [
      { label: "Assignment", href: "/assignment/daily-2", icon: FileCheck2 },
      { label: "Evaluation", href: "/evaluation/latest", icon: Award },
      { label: "Assessment", href: "/assessment/week-1", icon: CalendarCheck },
      { label: "Projects", href: "/projects/capstone-1", icon: Briefcase },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Backlog", href: "/backlog", icon: History },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "AI Mentor", href: "/mentor", icon: Bot },
      { label: "Studio", href: "/admin/studio", icon: Settings },
    ],
  },
];

function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return ["Dashboard"];
  const allItems = NAV_SECTIONS.flatMap((s) => s.items);
  const match = allItems.find(
    (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]))
  );
  if (match) {
    const section = NAV_SECTIONS.find((s) => s.items.includes(match));
    return section ? [section.title, match.label] : [match.label];
  }
  return segments.map((s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "flex-shrink-0 flex flex-col border-r border-border bg-sidebar z-20 transition-sidebar overflow-hidden",
          expanded ? "w-52" : "w-14"
        )}
      >
        {/* Brand */}
        <div className="h-14 flex items-center px-3 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span
              className={cn(
                "font-bold text-sm tracking-tight text-foreground whitespace-nowrap transition-opacity duration-200",
                expanded ? "opacity-100" : "opacity-0 w-0"
              )}
            >
              MASAI
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-3">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.title}>
              {sIdx > 0 && <Separator className="my-2 mx-3" />}
              {/* Section title */}
              <div
                className={cn(
                  "px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200",
                  expanded ? "opacity-100" : "opacity-0 h-0 mb-0 overflow-hidden"
                )}
              >
                {section.title}
              </div>
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));
                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "")} />
                      <span
                        className={cn(
                          "truncate whitespace-nowrap transition-opacity duration-200",
                          expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  // Show tooltip only when sidebar is collapsed
                  if (!expanded) {
                    return (
                      <Tooltip key={item.label}>
                        <TooltipTrigger render={linkContent} />
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <React.Fragment key={item.label}>{linkContent}</React.Fragment>;
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-12 flex-shrink-0 flex items-center justify-between px-5 border-b border-border bg-sidebar/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-1.5 text-sm">
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className={idx === breadcrumb.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <OllamaStatusBadge />
            <Separator orientation="vertical" className="h-5" />
            <StudyTimer />
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
