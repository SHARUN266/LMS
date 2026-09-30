"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Map,
  CalendarCheck,
  Briefcase,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StudyTimer } from "./StudyTimer";
import { AIStatusBadge } from "./AIStatusBadge";

interface AppShellProps {
  children: ReactNode;
}

// 5 Core Focused Navigation Items for 12 LPA Track
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Curriculum Roadmap", href: "/roadmap", icon: Map },
  { label: "Today's Mission", href: "/learn", icon: BookOpen },
  { label: "Monday Evaluation", href: "/assessment", icon: CalendarCheck },
  { label: "Capstone Projects", href: "/projects", icon: Briefcase },
];

function getBreadcrumb(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return ["Dashboard"];

  const match = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );
  if (match) return ["12 LPA Track", match.label];
  return segments.map((s) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function NavItem({
  item,
  isActive,
  isExpanded,
}: {
  item: { label: string; href: string; icon: any };
  isActive: boolean;
  isExpanded: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-xl text-xs font-semibold transition-all group",
        isExpanded ? "gap-3 px-2.5 py-2 w-full" : "w-9 h-9 mx-auto justify-center",
        isActive
          ? "bg-indigo-50 text-indigo-600 shadow-xs border border-indigo-100/80 font-bold"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110",
          isActive
            ? "text-indigo-600"
            : "text-slate-400 group-hover:text-slate-700"
        )}
      />
      {isExpanded && (
        <span className="truncate whitespace-nowrap">{item.label}</span>
      )}
    </Link>
  );

  if (!isExpanded) {
    return (
      <Tooltip>
        <TooltipTrigger>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const breadcrumb = getBreadcrumb(pathname);

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

  const isRouteActive = (href: string) =>
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => !isPinned && setIsHovered(true)}
        onMouseLeave={() => !isPinned && setIsHovered(false)}
        className={cn(
          "flex-shrink-0 flex flex-col border-r border-slate-200 bg-white shadow-xs z-30 transition-sidebar select-none py-3 px-2 h-screen overflow-hidden",
          isExpanded ? "w-60" : "w-16"
        )}
      >
        {/* Top Brand Logo */}
        <div className="w-full flex items-center justify-between px-1.5 pt-1 pb-2 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 font-black text-sm tracking-tight shadow-md shadow-indigo-500/20">
              P
            </div>
            {isExpanded && (
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 whitespace-nowrap">
                  Praxis
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
                  OS
                </span>
              </div>
            )}
          </Link>

          {isExpanded && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={togglePin}
              className="text-slate-400 hover:text-slate-700 h-6 w-6 rounded-md"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Scrollable Navigation Middle Container */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-1 my-1 pr-0.5 scrollbar-thin">
          {/* Section: Daily Workflow */}
          {isExpanded && (
            <div className="px-2.5 pt-2 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Bootcamp Navigation
              </span>
            </div>
          )}

          <nav className="w-full space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.label}
                item={item}
                isActive={isRouteActive(item.href)}
                isExpanded={isExpanded}
              />
            ))}
          </nav>
        </div>

        {/* Bottom Rail: Clean Student Profile */}
        <div className="flex-shrink-0 pt-2.5 mt-auto border-t border-slate-100">
          {isExpanded ? (
            <div className="flex flex-col space-y-2">
              <div className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      SK
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight">Sharun</p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">12 LPA Track Candidate</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <Tooltip>
                <TooltipTrigger>
                  <div className="relative cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      SK
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Sharun (12 LPA Track)</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Minimal Bar */}
        <header className="h-12 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200/80 bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5 text-xs">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={togglePin}
              title={isPinned ? "Collapse sidebar" : "Pin sidebar open"}
              className="text-slate-400 hover:text-slate-700 h-7 w-7 rounded-lg"
            >
              <PanelLeft className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-1.5 ml-1">
              {breadcrumb.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                  <span
                    className={
                      idx === breadcrumb.length - 1
                        ? "font-semibold text-slate-800"
                        : "text-slate-400"
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AIStatusBadge />
            <Separator orientation="vertical" className="h-4" />
            <StudyTimer />
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f8fafc]">
          {children}
        </main>
      </div>
    </div>
  );
}
