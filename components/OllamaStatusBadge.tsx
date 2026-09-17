"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export function OllamaStatusBadge() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [model, setModel] = useState("Gemini");
  const [isChecking, setIsChecking] = useState(false);
  const [hovered, setHovered] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/ollama/status");
      const data = await res.json();
      setConnected(data.connected);
      if (data.activeModel) setModel(data.activeModel);
    } catch {
      setConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] text-slate-400 hover:text-slate-300 transition-colors cursor-default group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Status dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          connected ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />
      {/* Model name */}
      <span className="font-medium">{model}</span>
      {/* Refresh — only on hover */}
      <button
        onClick={checkStatus}
        disabled={isChecking}
        className={`text-slate-500 hover:text-slate-300 transition-all ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
        title="Refresh AI Connection"
      >
        <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
