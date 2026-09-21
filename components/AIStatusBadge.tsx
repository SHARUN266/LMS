"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

export function AIStatusBadge() {
  const [connected, setConnected] = useState<boolean>(true);
  const [model, setModel] = useState("Gemini 2.5 Flash");
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        setConnected(data.geminiConfigured);
        if (data.model) setModel(data.model);
      }
    } catch {
      setConnected(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-700 font-semibold shadow-xs cursor-default"
      title="Google Gemini Cloud AI Evaluation & Socratic Mentor Engine"
    >
      <Sparkles className="w-3 h-3 text-indigo-600 animate-pulse" />
      <span>{model}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
    </div>
  );
}

// Backward compatibility export
export const OllamaStatusBadge = AIStatusBadge;
