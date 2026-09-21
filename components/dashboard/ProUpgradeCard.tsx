"use client";

import React from "react";
import { Zap, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProUpgradeCard() {
  const perks = [
    "Intelligent curriculum & AI tutor",
    "Data-driven mastery insight",
    "Advanced code sandbox & tests",
    "Instant 24/7 AI Code Remediation",
  ];

  return (
    <Card className="card-hover border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-md overflow-hidden relative">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <CardContent className="p-5 space-y-4 relative z-10">
        {/* Title & Pricing */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-foreground tracking-tight">
              Upgrade to PRO
            </h3>
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-foreground">$140</span>
            <span className="text-xs text-muted-foreground font-medium">/month</span>
          </div>
        </div>

        {/* Feature checklist */}
        <div className="space-y-2 text-xs">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-foreground/90">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[11px] font-medium leading-tight">{perk}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
          Upgrade plan for more features, enhancing your engineering learning journey.
        </p>

        {/* Glowing Upgrade CTA Button */}
        <Button
          onClick={() => alert("Redirecting to PRO Plan checkout...")}
          className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs h-9 rounded-xl shadow-lg shadow-amber-500/20 gap-1.5 transition-all active:scale-[0.98]"
        >
          <Zap className="w-3.5 h-3.5 fill-slate-950" />
          <span>Upgrade Now</span>
        </Button>
      </CardContent>
    </Card>
  );
}
