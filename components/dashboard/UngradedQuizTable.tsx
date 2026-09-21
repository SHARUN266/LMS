"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Info,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function UngradedQuizTable() {
  const [gradedIds, setGradedIds] = useState<number[]>([]);

  const quizzes = [
    {
      id: 1,
      title: "How to be great and good UI/UX designer",
      questionsCount: 4,
      questionType: "open ended",
      learnerName: "Adit Irwan",
      learnerInitials: "AI",
      avatarColor: "bg-sky-500",
      href: "/evaluation",
    },
    {
      id: 2,
      title: "Applications, tools, and plugins to build modern systems",
      questionsCount: 10,
      questionType: "open ended",
      learnerName: "Arif Brata",
      learnerInitials: "AB",
      avatarColor: "bg-amber-500",
      href: "/evaluation",
    },
    {
      id: 3,
      title: "Great designer must know the best architecture principles",
      questionsCount: 3,
      questionType: "open ended",
      learnerName: "Ardhi Irwandi",
      learnerInitials: "AI",
      avatarColor: "bg-indigo-500",
      href: "/evaluation",
    },
  ];

  const handleGrade = (id: number) => {
    setGradedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Ungraded Quiz</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Student submissions awaiting AI or instructor review</TooltipContent>
            </Tooltip>
          </div>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
            {quizzes.length - gradedIds.length} Pending
          </span>
        </div>

        {/* Table / List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                <th className="pb-2.5 font-medium pl-2 w-8">#</th>
                <th className="pb-2.5 font-medium">Quiz Title</th>
                <th className="pb-2.5 font-medium">Questions</th>
                <th className="pb-2.5 font-medium">Learner</th>
                <th className="pb-2.5 font-medium text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {quizzes.map((quiz, index) => {
                const isGraded = gradedIds.includes(quiz.id);
                return (
                  <tr
                    key={quiz.id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3.5 pl-2 font-mono text-muted-foreground font-semibold">
                      {index + 1}
                    </td>

                    {/* Quiz Title */}
                    <td className="py-3.5 pr-4 font-semibold text-foreground group-hover:text-primary transition-colors max-w-[280px] truncate">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{quiz.title}</span>
                      </div>
                    </td>

                    {/* Questions format badge */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/60 px-2 py-1 rounded-md w-fit border border-border/50">
                        <HelpCircle className="w-3 h-3 text-muted-foreground" />
                        <span>
                          {quiz.questionsCount} {quiz.questionType}
                        </span>
                      </div>
                    </td>

                    {/* Learner info */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full ${quiz.avatarColor} text-slate-950 font-black text-[10px] flex items-center justify-center flex-shrink-0`}
                        >
                          {quiz.learnerInitials}
                        </div>
                        <span className="font-medium text-foreground whitespace-nowrap text-xs">
                          {quiz.learnerName}
                        </span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 pr-2 text-right">
                      {isGraded ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGrade(quiz.id)}
                          className="h-7 text-xs text-emerald-400 gap-1 hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Graded
                        </Button>
                      ) : (
                        <Link href={quiz.href}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs font-semibold px-3 border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all shadow-xs"
                          >
                            Grade Now
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
