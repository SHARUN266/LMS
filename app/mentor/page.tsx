"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  Send,
  User,
  GraduationCap,
  Bug,
  Briefcase,
  Target,
  Loader2,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type MentorMode = "socratic" | "debugger" | "business" | "interview";

interface ModeConfig {
  id: MentorMode;
  label: string;
  icon: any;
  chips: string[];
}

const MODES: ModeConfig[] = [
  {
    id: "socratic",
    label: "Socratic Tutor",
    icon: GraduationCap,
    chips: [
      "Explain DENSE_RANK() vs RANK()",
      "How does PARTITION BY differ from GROUP BY?",
      "Give me a hint on my assignment",
    ],
  },
  {
    id: "debugger",
    label: "Query Debugger",
    icon: Bug,
    chips: [
      "Why is my query returning duplicates?",
      "Check for non-SARGable conditions",
      "Debug my CTE retention calculation",
    ],
  },
  {
    id: "business",
    label: "Business Context",
    icon: Briefcase,
    chips: [
      "Why do cohort retention queries matter?",
      "Explain Customer Lifetime Value formula",
      "How to compute 30-day repeat rate?",
    ],
  },
  {
    id: "interview",
    label: "Mock Interview",
    icon: Target,
    chips: [
      "Start mock SQL interview",
      "Ask me a Window Function problem",
      "Simulate schema design interview",
    ],
  },
];

export default function MentorPage() {
  const [activeModel, setActiveModel] = useState("Gemini 2.0 Flash");
  const [activeMode, setActiveMode] = useState<MentorMode>("socratic");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "mentor",
      message:
        "Hi! I'm your AI career coach. Ask me questions on SQL, data modeling, business reasoning, or interview prep.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ollama/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.activeModel) setActiveModel(data.activeModel);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/mentor/chat");
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            setMessages(data.history);
          }
        }
      } catch {}
    }
    loadHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowModeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: "user", message: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, mode: activeMode }),
      });

      if (!res.ok) throw new Error("Mentor response failed");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "mentor", message: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          message:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentMode = MODES.find((m) => m.id === activeMode) || MODES[0];
  const CurrentModeIcon = currentMode.icon;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col justify-between">
      {/* Mentor Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              AI Technical Mentor
              <Badge variant="outline" className="text-[10px] font-normal py-0 h-4 border-primary/30 text-primary">
                {activeModel}
              </Badge>
            </h2>
            <p className="text-[11px] text-muted-foreground">Always available for hints, conceptual clarity, and code reviews</p>
          </div>
        </div>

        {/* Mode Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModeDropdown(!showModeDropdown)}
            className="h-8 gap-1.5 text-xs border-border"
          >
            <CurrentModeIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{currentMode.label}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>

          {showModeDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-lg bg-popover border border-border shadow-md py-1 z-50">
              {MODES.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveMode(m.id);
                      setShowModeDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeMode === m.id
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                m.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {m.sender === "user" ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`px-4 py-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none font-medium"
                  : "bg-card border border-border text-card-foreground rounded-tl-none shadow-sm"
              }`}
            >
              {m.sender === "user" ? (
                <p className="whitespace-pre-line">{m.message}</p>
              ) : (
                <div className="prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.message}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-4 py-2.5 rounded-xl rounded-tl-none bg-card border border-border text-xs text-muted-foreground flex items-center gap-2 shadow-sm">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Thinking with {activeModel}...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="pt-2 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {currentMode.chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground border border-border/60 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar with ShadCN Input and Button */}
        <div className="flex items-center gap-2 mt-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask in ${currentMode.label} mode...`}
            className="flex-1 bg-card border-border text-xs h-9"
          />
          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="h-9 px-3 gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
