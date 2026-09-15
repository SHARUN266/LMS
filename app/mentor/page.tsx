"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Zap,
  BookOpen,
  Code2,
  RefreshCw,
} from "lucide-react";

export default function MentorPage() {
  const [messages, setMessages] = useState<any[]>([
    {
      sender: "mentor",
      message: "Namaste! I am your AI Technical Coach powered by local Qwen 2.5 Coder. I am monitoring your progress on Module 1 (SQL & Analytics Engineering). How can I assist you with today's Window Functions drill or business metric calculations?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", message: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, context: "Module 1: SQL Window Functions" }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "mentor", message: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          message: "When structuring complex queries, always verify your CTE row counts step-by-step. Let me know which clause is throwing an error!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col space-y-4 pb-2">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan">
            <Bot className="w-6 h-6 text-masai-accent animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">AI Career Mentor Studio</h1>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                Qwen 2.5 Coder
              </span>
            </div>
            <p className="text-xs text-slate-400">Curriculum-aware Socratic mentor & interview preparation coach</p>
          </div>
        </div>

        {/* Quick Prompt Chips */}
        <div className="hidden sm:flex items-center gap-2">
          {["Explain DENSE_RANK()", "Mock SQL Interview Drill", "Optimize my Query"].map((chip) => (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.sender === "user"
                  ? "bg-masai-red text-white"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-masai-red/15 border border-masai-red/30 text-white rounded-tr-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line"
              }`}
            >
              {m.message}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 animate-pulse">
              Qwen 2.5 Coder is formulating guidance...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a technical question, request a hint, or practice an interview drill..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-200 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-masai-red to-rose-600 hover:from-rose-600 hover:to-masai-red text-white transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
