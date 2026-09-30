"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Safe dynamic import of Monaco Editor with resolution of nested default/Editor export
const Monaco = dynamic<any>(
  () =>
    import("@monaco-editor/react").then((mod: any) => {
      if (mod?.default?.default) return mod.default.default;
      if (mod?.Editor) return mod.Editor;
      if (typeof mod?.default === "function") return mod.default;
      return mod;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 font-mono text-xs gap-2 p-4">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
        <span>Loading Code Sandbox...</span>
      </div>
    ),
  }
);

class EditorErrorBoundary extends React.Component<
  {
    value: string;
    onChange?: (val: string) => void;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("Monaco Editor failed to load, falling back to standard code editor:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col bg-slate-950 p-2">
          <div className="text-[10px] text-amber-400/80 mb-1 px-1 font-mono">
            Standard Code Editor Active
          </div>
          <textarea
            value={this.props.value}
            onChange={(e) => this.props.onChange?.(e.target.value)}
            className="flex-1 w-full bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded border border-slate-800 outline-none resize-none focus:border-indigo-500"
            spellCheck={false}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

interface CodeEditorProps {
  height?: string;
  defaultLanguage?: string;
  language?: string;
  theme?: string;
  value: string;
  onChange?: (val: string) => void;
  options?: any;
}

export function CodeEditor({
  height = "100%",
  defaultLanguage = "sql",
  language,
  theme = "vs-dark",
  value,
  onChange,
  options,
}: CodeEditorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs">
        Initializing Sandbox...
      </div>
    );
  }

  return (
    <EditorErrorBoundary value={value} onChange={onChange}>
      <Monaco
        height={height}
        defaultLanguage={defaultLanguage}
        language={language || defaultLanguage}
        theme={theme}
        value={value}
        onChange={(val: any) => onChange?.(val || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "Fira Code, monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          padding: { top: 12 },
          automaticLayout: true,
          ...options,
        }}
      />
    </EditorErrorBoundary>
  );
}

export default CodeEditor;
