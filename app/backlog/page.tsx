"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Loader2,
  Circle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BacklogItem {
  id: string;
  title: string;
  topic: string;
  dueOriginal: string;
  scheduledFor: string;
  isCompleted: boolean;
}

interface RemedialDrill {
  id: string;
  topic: string;
  title: string;
  difficulty: string;
  problem: string;
  starterCode?: string;
  solution: string;
  isCompleted: boolean;
}

export default function BacklogPage() {
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [remedialDrills, setRemedialDrills] = useState<RemedialDrill[]>([]);
  const [loading, setLoading] = useState(true);
  const [balancing, setBalancing] = useState(false);
  const [balanceMsg, setBalanceMsg] = useState("");

  const handleBalanceSchedule = async () => {
    setBalancing(true);
    try {
      const res = await fetch("/api/backlog/balance", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setBalanceMsg(`✓ Balanced ${data.rescheduledCount} tasks across upcoming days!`);
        setTimeout(() => setBalanceMsg(""), 3500);
        const bRes = await fetch("/api/backlog");
        const bData = await bRes.json();
        setBacklogItems(bData.backlogItems || []);
        setRemedialDrills(bData.remedialDrills || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBalancing(false);
    }
  };

  useEffect(() => {
    async function loadBacklog() {
      try {
        const res = await fetch("/api/backlog");
        if (res.ok) {
          const data = await res.json();
          setBacklogItems(data.backlogItems || []);
          setRemedialDrills(data.remedialDrills || []);
        }
      } catch (err) {
        console.error("Failed to load backlog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBacklog();
  }, []);

  const handleToggle = async (type: "backlog" | "drill", id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/backlog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          id,
          isCompleted: !currentStatus,
        }),
      });
      if (res.ok) {
        if (type === "backlog") {
          setBacklogItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isCompleted: !currentStatus } : item))
          );
        } else {
          setRemedialDrills((prev) =>
            prev.map((item) => (item.id === id ? { ...item, isCompleted: !currentStatus } : item))
          );
        }
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading backlog and remedial queue...</p>
      </div>
    );
  }

  const pendingBacklogCount = backlogItems.filter((i) => !i.isCompleted).length;
  const pendingDrillsCount = remedialDrills.filter((d) => !d.isCompleted).length;
  const totalPending = pendingBacklogCount + pendingDrillsCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Discipline & Recovery Engine</span>
          </div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Backlog & Remedial Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Missed assignments and weak areas automatically populate here. Solve drills to protect your streak.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleBalanceSchedule}
            disabled={balancing}
            size="sm"
            className="gap-2 font-medium"
          >
            <Sparkles className={`w-3.5 h-3.5 ${balancing ? "animate-spin" : ""}`} />
            <span>{balancing ? "Balancing..." : "Auto-Balance"}</span>
          </Button>

          <Badge variant="outline" className="h-8 px-3 text-xs border-amber-500/30 text-amber-400 gap-1.5">
            <span className="font-bold">{totalPending}</span>
            <span>Pending</span>
          </Badge>
        </div>
      </div>

      {balanceMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{balanceMsg}</span>
        </div>
      )}

      {/* Remedial Drills Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Generated Remedial Drills</span>
          </h2>
          <Badge variant="secondary" className="text-[10px]">
            {pendingDrillsCount} Active
          </Badge>
        </div>

        {remedialDrills.length === 0 ? (
          <Card className="bg-card/40 border-border text-center py-6 text-xs text-muted-foreground">
            No remedial drills required! You are on track.
          </Card>
        ) : (
          <div className="space-y-2">
            {remedialDrills.map((drill) => (
              <Card
                key={drill.id}
                className={`transition-all ${
                  drill.isCompleted
                    ? "bg-card/30 border-border/60 opacity-60"
                    : "bg-card/70 border-border hover:border-amber-500/40"
                }`}
              >
                <CardContent className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle("drill", drill.id, drill.isCompleted)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      {drill.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/60" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 border-amber-500/30 text-amber-400">
                          {drill.topic}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] py-0 h-4 font-mono">
                          {drill.difficulty}
                        </Badge>
                      </div>
                      <h3 className={`text-xs font-medium mt-1 ${drill.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {drill.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{drill.problem}</p>
                    </div>
                  </div>

                  <Link href="/practice/day-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-border">
                      <span>Solve</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* General Backlog Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-sky-400" />
            <span>Missed Exercises & Backlog</span>
          </h2>
          <Badge variant="secondary" className="text-[10px]">
            {pendingBacklogCount} Pending
          </Badge>
        </div>

        {backlogItems.length === 0 ? (
          <Card className="bg-card/40 border-border text-center py-6 text-xs text-muted-foreground">
            No backlog items recorded.
          </Card>
        ) : (
          <div className="space-y-2">
            {backlogItems.map((t) => (
              <Card
                key={t.id}
                className={`transition-all ${
                  t.isCompleted
                    ? "bg-card/30 border-border/60 opacity-60"
                    : "bg-card/70 border-border hover:border-border/80"
                }`}
              >
                <CardContent className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle("backlog", t.id, t.isCompleted)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      {t.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/60" />
                      )}
                    </button>
                    <div>
                      <Badge variant="secondary" className="text-[10px] font-mono py-0 h-4">
                        {t.topic}
                      </Badge>
                      <h3 className={`text-xs font-medium mt-1 ${t.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {t.title}
                      </h3>
                    </div>
                  </div>

                  <Link href="/practice/day-2">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <span>Practice</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
