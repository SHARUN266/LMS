"use client";

import React, { useState } from "react";
import {
  Info,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Flag,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TodoItem {
  id: number;
  title: string;
  subtitle?: string;
  dueDate?: string;
  isToday?: boolean;
  flagColor: string;
  isCompleted: boolean;
}

export function TodoListWidget() {
  const [tasks, setTasks] = useState<TodoItem[]>([
    {
      id: 1,
      title: "Complete Hands-on Practice Step 2",
      subtitle: "Window Functions & Partitioning query challenges",
      dueDate: "Today",
      isToday: true,
      flagColor: "text-rose-400",
      isCompleted: false,
    },
    {
      id: 2,
      title: "Submit Graded Daily Assignment",
      subtitle: "Industry SQL dataset running totals",
      dueDate: "Today",
      isToday: true,
      flagColor: "text-amber-400",
      isCompleted: false,
    },
    {
      id: 3,
      title: "Review Remedial Backlog Query Drills",
      subtitle: "Address weak areas identified by AI evaluation",
      dueDate: "Tomorrow",
      isToday: false,
      flagColor: "text-indigo-400",
      isCompleted: false,
    },
  ]);

  const [inputTask, setInputTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTask.trim()) return;
    const newTask: TodoItem = {
      id: Date.now(),
      title: inputTask.trim(),
      dueDate: "Today",
      isToday: true,
      flagColor: "text-indigo-400",
      isCompleted: false,
    };
    setTasks([newTask, ...tasks]);
    setInputTask("");
    setIsAdding(false);
  };

  return (
    <Card className="card-hover bg-card/75 backdrop-blur-md border-border/80 shadow-sm overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <span>Daily Study Checklist</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">Your personal curriculum milestones and study tasks</TooltipContent>
            </Tooltip>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50">
            {tasks.filter((t) => !t.isCompleted).length} pending
          </span>
        </div>

        {/* Add new task button or input */}
        {isAdding ? (
          <form onSubmit={handleAddTask} className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={inputTask}
              onChange={(e) => setInputTask(e.target.value)}
              placeholder="Add study task..."
              className="flex-1 bg-muted/70 text-xs px-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 py-1.5 px-2 rounded-lg hover:bg-indigo-500/10 transition-colors group"
          >
            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Add personal study task...</span>
          </button>
        )}

        {/* Task items list */}
        <div className="space-y-3 pt-1">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group select-none"
            >
              {/* Checkbox */}
              <button className="mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                {task.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>

              {/* Task Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-semibold leading-tight transition-colors ${
                      task.isCompleted
                        ? "line-through text-muted-foreground"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {task.title}
                  </span>
                  <Flag className={`w-3 h-3 flex-shrink-0 ${task.flagColor}`} />
                </div>

                {task.subtitle && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {task.subtitle}
                  </p>
                )}

                {task.dueDate && (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded w-fit border border-rose-500/20 mt-1">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{task.dueDate}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
