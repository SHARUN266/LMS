"use client";

import { useEffect, useState } from "react";
import { Cpu, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export function OllamaStatusBadge() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [model, setModel] = useState("qwen2.5-coder");
  const [isChecking, setIsChecking] = useState(false);

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
    const interval = setInterval(checkStatus, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-sm backdrop-blur-md">
      <Cpu className="w-3.5 h-3.5 text-masai-accent animate-pulse" />
      <span className="font-semibold text-slate-200">Local AI:</span>
      <span className="text-masai-accent font-mono">{model}</span>
      {connected ? (
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Online</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-amber-400 font-medium" title="Ollama is starting or in auto-simulation mode">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Ready (Local)</span>
        </span>
      )}
      <button
        onClick={checkStatus}
        disabled={isChecking}
        className="text-slate-500 hover:text-slate-300 transition-colors ml-1"
        title="Refresh AI Connection"
      >
        <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
