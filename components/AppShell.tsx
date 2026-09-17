"use client";

import React, { ReactNode, useState, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudyTimer } from "./StudyTimer";
import { OllamaStatusBadge } from "./OllamaStatusBadge";

interface AppShellProps {
  children: ReactNode;
}

const NAV_SECTIONS = [
  {
    title: "Learning Track",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Curriculum Roadmap", href: "/roadmap", icon: Map },
      { label: "Daily Lesson", href: "/learn", icon: BookOpen },
      { label: "Practice Sandbox", href: "/practice", icon: Code2 },
    ],
  },
  {
    title: "Evaluation & Projects",
    items: [
      { label: "Daily Assignments", href: "/assignment", icon: FileCheck2 },
      { label: "Evaluation Scorecard", href: "/evaluation", icon: Award },
      { label: "Weekly Assessment", href: "/assessment", icon: CalendarCheck },
      { label: "Capstone Projects", href: "/projects", icon: Briefcase },
    ],
  },
  {
    title: "AI Support & Admin",
    items: [
      { label: "AI Mentor Chat", href: "/mentor", icon: Bot },
      { label: "Remedial Backlog", href: "/backlog", icon: History },
      { label: "Mastery Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Curriculum Studio", href: "/admin/studio", icon: Settings },
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
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const breadcrumb = getBreadcrumb(pathname);

  // Load user pin preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lms_sidebar_pinned");
      if (saved !== null) {
        setIsPinned(saved === "true");
      }
    } catch {}
  }, []);

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lms_sidebar_pinned", String(next));
      } catch {}
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
        className={cn(
          "flex-shrink-0 flex flex-col border-r border-border bg-sidebar z-20 transition-sidebar overflow-hidden select-none",
          isExpanded ? "w-56" : "w-14"
        )}
      >
        {/* Brand & Pin Toggle */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center flex-shrink-0 font-black text-xs tracking-tighter shadow-sm">
              PX
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 transition-opacity duration-200",
                isExpanded ? "opacity-100" : "opacity-0 w-0 pointer-events-none"
              )}
            >
              <span className="font-extrabold text-sm tracking-tight text-foreground whitespace-nowrap">
                PRAXIS
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                ACADEMY
              </span>
            </div>
          </Link>

          {/* Toggle / Pin Button inside sidebar */}
          {isExpanded && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={togglePin}
              title={isPinned ? "Collapse sidebar (keep icon rail)" : "Pin sidebar open"}
              className="text-muted-foreground hover:text-foreground h-7 w-7 rounded-md"
            >
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 py-3">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={section.title} className="mb-2">
              {sIdx > 0 && <Separator className="my-2 mx-3" />}
              {/* Section title */}
              <div
                className={cn(
                  "px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200",
                  isExpanded ? "opacity-100" : "opacity-0 h-0 mb-0 overflow-hidden"
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
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary" : "")} />
                      <span
                        className={cn(
                          "truncate whitespace-nowrap transition-opacity duration-200",
                          isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  // Show tooltip only when collapsed
                  if (!isExpanded) {
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

        {/* Bottom Pin Status Indicator / Toggle */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePin}
            className={cn(
              "w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground h-8 px-2",
              !isExpanded && "justify-center px-0"
            )}
            title={isPinned ? "Click to unpin (collapse)" : "Click to pin open"}
          >
            <PanelLeft className="w-3.5 h-3.5 flex-shrink-0" />
            {isExpanded && (
              <span className="truncate">
                {isPinned ? "Pinned Open" : "Pin Sidebar"}
              </span>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-border bg-sidebar/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 text-xs">
            {/* Header sidebar toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={togglePin}
              title={isPinned ? "Collapse sidebar" : "Open sidebar"}
              className="text-muted-foreground hover:text-foreground h-7 w-7 rounded-md"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-1.5 ml-1">
              {breadcrumb.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span className={idx === breadcrumb.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <OllamaStatusBadge />
            <Separator orientation="vertical" className="h-4" />
            <StudyTimer />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
