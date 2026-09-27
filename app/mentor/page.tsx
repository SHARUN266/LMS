"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  User,
  GraduationCap,
  Bug,
  Briefcase,
  Target,
  Loader2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Plus,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Check,
  Edit2,
  Copy,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type MentorMode = "socratic" | "debugger" | "business" | "interview";

interface ModeConfig {
  id: MentorMode;
  label: string;
  icon: any;
  defaultChips: string[];
}

interface ChatMessage {
  id?: string;
  sender: "user" | "mentor";
  message: string;
  isTyping?: boolean;
}

interface MentorSessionItem {
  id: string;
  title: string;
  mode: MentorMode;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

interface MentorContextData {
  greeting: string;
  learnerName: string;
  currentModule: string;
  currentDay: string;
  nextDay: string;
  overallProgress: number;
  completedDays: number;
  totalDays: number;
  avgScore: number;
  lastScore: number | null;
  lastPassed: boolean | null;
  weakTopics: string[];
  strongTopics: string[];
  pendingDrills: number;
  pendingBacklog: number;
  streak: number;
  level: number;
  xp: number;
  dynamicChips: Record<string, string[]>;
}

const DEFAULT_MODES: ModeConfig[] = [
  {
    id: "socratic",
    label: "Socratic Coach",
    icon: GraduationCap,
    defaultChips: [
      "Ab mujhe kya padhna chahiye?",
      "Meri weaknesses kya hain?",
      "Mera overall progress kya hai?",
    ],
  },
  {
    id: "debugger",
    label: "Query Debugger",
    icon: Bug,
    defaultChips: [
      "Why is my query returning duplicates?",
      "Check for non-SARGable conditions",
      "Debug my CTE retention calculation",
    ],
  },
  {
    id: "business",
    label: "Business Context",
    icon: Briefcase,
    defaultChips: [
      "Explain Customer Lifetime Value formula",
      "How to compute 30-day repeat rate?",
    ],
  },
  {
    id: "interview",
    label: "Mock Interview",
    icon: Target,
    defaultChips: [
      "Start mock SQL interview",
      "Ask me a Window Function problem",
    ],
  },
];

export default function MentorPage() {
  const [activeModel, setActiveModel] = useState("Gemini 2.5 Flash");
  const [activeMode, setActiveMode] = useState<MentorMode>("socratic");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  
  // Sessions & Messages State
  const [sessions, setSessions] = useState<MentorSessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  // Inline rename session state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [contextData, setContextData] = useState<MentorContextData | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch dynamic mentor context on mount ──────────────────
  useEffect(() => {
    async function loadContext() {
      setContextLoading(true);
      try {
        const res = await fetch("/api/mentor/context");
        if (res.ok) {
          const data: MentorContextData = await res.json();
          setContextData(data);
        }
      } catch (err) {
        console.error("Context fetch error:", err);
      } finally {
        setContextLoading(false);
      }
    }
    loadContext();
  }, []);

  // ── Fetch AI model name ────────────────────────────────────
  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.model) setActiveModel(data.model);
        else if (data.activeModel) setActiveModel(data.activeModel);
      })
      .catch(() => {});
  }, []);

  // ── Load Sessions on mount ─────────────────────────────────
  const loadSessions = async () => {
    try {
      const res = await fetch("/api/mentor/sessions");
      if (res.ok) {
        const data = await res.json();
        const list: MentorSessionItem[] = data.sessions || [];
        setSessions(list);
        if (list.length > 0 && !currentSessionId) {
          setCurrentSessionId(list[0].id);
          setActiveMode(list[0].mode || "socratic");
        }
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // ── Load Messages when currentSessionId changes ────────────
  useEffect(() => {
    if (!currentSessionId) return;

    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setIsTyping(false);
    setLoading(true);

    async function loadMessages() {
      try {
        const res = await fetch(`/api/mentor/chat?sessionId=${currentSessionId}`);
        if (res.ok) {
          const data = await res.json();
          const msgs: ChatMessage[] = data.messages || [];
          if (msgs.length > 0) {
            setMessages(msgs);
          } else {
            // New blank session greeting
            const greeting = contextData?.greeting || "Hello! I am Axiom, your Staff Analytics Copilot. How can I assist you today?";
            setMessages([{ sender: "mentor", message: greeting }]);
          }
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [currentSessionId]);

  // ── Auto scroll ────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isTyping]);

  // ── Close mode dropdown on outside click ───────────────────
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  // ── Create New Session ──────────────────────────────────────
  const handleCreateNewSession = async () => {
    try {
      const res = await fetch("/api/mentor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Session",
          mode: activeMode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newSession = data.session;
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
        const greeting = contextData?.greeting || "Hello! I am Axiom, your Staff Analytics Copilot. How can I assist you today?";
        setMessages([{ sender: "mentor", message: greeting }]);
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  // ── Delete Session ──────────────────────────────────────────
  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/mentor/sessions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const updated = sessions.filter((s) => s.id !== id);
        setSessions(updated);
        if (currentSessionId === id) {
          if (updated.length > 0) {
            setCurrentSessionId(updated[0].id);
            setActiveMode(updated[0].mode || "socratic");
          } else {
            handleCreateNewSession();
          }
        }
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  // ── Rename Session ──────────────────────────────────────────
  const handleSaveRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      const res = await fetch(`/api/mentor/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, title: editingTitle.trim() } : s))
        );
      }
    } catch (err) {
      console.error("Error updating session title:", err);
    } finally {
      setEditingSessionId(null);
    }
  };

  // ── Send Message ────────────────────────────────────────────
  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading || isTyping) return;

    const userMsg: ChatMessage = { sender: "user", message: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          mode: activeMode,
          sessionId: currentSessionId,
        }),
      });

      if (!res.ok) throw new Error("Axiom response failed");
      const data = await res.json();
      const fullText: string = data.message || "I am ready to assist you.";
      
      // Update session title if returned
      if (data.sessionTitle && currentSessionId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId ? { ...s, title: data.sessionTitle, updatedAt: new Date().toISOString() } : s
          )
        );
      }

      setLoading(false);
      setIsTyping(true);

      // Typing animation
      setMessages((prev) => [
        ...prev,
        { sender: "mentor", message: "", isTyping: true },
      ]);

      let charIndex = 0;
      const chunkSize = Math.max(3, Math.floor(fullText.length / 70));

      typingTimerRef.current = setInterval(() => {
        charIndex += chunkSize;
        if (charIndex >= fullText.length) {
          if (typingTimerRef.current) clearInterval(typingTimerRef.current);
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              sender: "mentor",
              message: fullText,
              isTyping: false,
            };
            return copy;
          });
          setIsTyping(false);
        } else {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              sender: "mentor",
              message: fullText.slice(0, charIndex),
              isTyping: true,
            };
            return copy;
          });
        }
      }, 18);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          message: "⚠️ Apologies, encountered a temporary issue connecting to Axiom. Please verify your connection or try again.",
        },
      ]);
    }
  };

  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentMode = DEFAULT_MODES.find((m) => m.id === activeMode) || DEFAULT_MODES[0];
  const CurrentModeIcon = currentMode.icon;
  const activeChips =
    contextData?.dynamicChips?.[activeMode]?.length
      ? contextData.dynamicChips[activeMode]
      : currentMode.defaultChips;

  const activeSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden bg-background">
      {/* ── SESSIONS SIDEBAR ─────────────────────────────────────── */}
      <div
        className={`${
          isSidebarOpen ? "w-72" : "w-0"
        } transition-all duration-300 ease-in-out border-r border-border/80 flex flex-col bg-muted/20 overflow-hidden flex-shrink-0 relative`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-border/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Axiom Threads</h3>
              <p className="text-[10px] text-muted-foreground">{sessions.length} sessions saved</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleCreateNewSession}
            className="h-7 text-[11px] gap-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </Button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No sessions yet. Click &quot;New&quot; to begin.
            </div>
          ) : (
            sessions.map((s) => {
              const isSelected = s.id === currentSessionId;
              const isEditing = editingSessionId === s.id;
              const modeCfg = DEFAULT_MODES.find((m) => m.id === s.mode) || DEFAULT_MODES[0];
              const ModeIcon = modeCfg.icon;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (s.id !== currentSessionId) {
                      setCurrentSessionId(s.id);
                      setActiveMode(s.mode || "socratic");
                    }
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/60 font-medium shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                    <ModeIcon
                      className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                        isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(e as any, s.id);
                              if (e.key === "Escape") setEditingSessionId(null);
                            }}
                            className="h-6 text-xs px-1.5 py-0 bg-background"
                            autoFocus
                          />
                          <button
                            onClick={(e) => handleSaveRename(e, s.id)}
                            className="p-1 hover:text-emerald-600"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <p className="truncate text-xs leading-snug">{s.title}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground/80 mt-0.5 truncate">
                        {modeCfg.label}
                      </p>
                    </div>
                  </div>

                  {/* Actions on hover */}
                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 text-muted-foreground">
                      <button
                        title="Rename session"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(s.id);
                          setEditingTitle(s.title);
                        }}
                        className="p-1 hover:text-foreground rounded transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        title="Delete session"
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        className="p-1 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MAIN CHAT VIEW ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden px-4 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? "Hide session history" : "Show session history"}
              className="p-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>Axiom Copilot</span>
                  <Badge className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] py-0 h-4 font-semibold">
                    Staff Analytics AI
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-normal py-0 h-4 border-primary/30 text-primary hidden md:inline-flex">
                    {activeModel}
                  </Badge>
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground truncate max-w-md">
                {activeSession?.title ? `Thread: ${activeSession.title}` : "Interactive Copilot for 12 LPA Analytics Track"}
              </p>
            </div>
          </div>

          {/* Context Stats Badges & Mode Switcher */}
          <div className="flex items-center gap-2">
            {contextData && (
              <div className="hidden lg:flex items-center gap-1.5">
                {contextData.overallProgress > 0 && (
                  <Badge variant="secondary" className="text-[10px] py-0 h-5 gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                    {contextData.overallProgress}%
                  </Badge>
                )}
                {contextData.weakTopics.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] py-0 h-5 gap-1 text-amber-600 border-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    {contextData.weakTopics.length} weak
                  </Badge>
                )}
                {contextData.pendingDrills > 0 && (
                  <Badge variant="secondary" className="text-[10px] py-0 h-5 gap-1">
                    <BookOpen className="w-3 h-3" />
                    {contextData.pendingDrills} drills
                  </Badge>
                )}
              </div>
            )}

            {/* Mode Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="h-8 gap-1.5 text-xs border-border bg-card shadow-2xs"
              >
                <CurrentModeIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-medium">{currentMode.label}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </Button>

              {showModeDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-popover border border-border shadow-lg py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Axiom Persona
                  </div>
                  {DEFAULT_MODES.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveMode(m.id);
                          setShowModeDropdown(false);
                          if (currentSessionId) {
                            fetch(`/api/mentor/sessions/${currentSessionId}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ mode: m.id }),
                            }).catch(() => {});
                            setSessions((prev) =>
                              prev.map((s) => (s.id === currentSessionId ? { ...s, mode: m.id } : s))
                            );
                          }
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                          activeMode === m.id
                            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Messages Scroll Area ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
          {contextLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Calibrating Axiom Copilot with your live data...</span>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs shadow-2xs ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white font-bold"
                    : "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/20"
                }`}
              >
                {m.sender === "user" ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative px-4 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium shadow-sm"
                    : "bg-card border border-border/80 text-card-foreground rounded-tl-none shadow-sm"
                }`}
              >
                {m.sender === "user" ? (
                  <p className="whitespace-pre-line">{m.message}</p>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.message}
                    </ReactMarkdown>
                    {m.isTyping && (
                      <span className="inline-block w-1.5 h-3.5 bg-indigo-500 ml-1 translate-y-0.5 animate-pulse rounded-xs" />
                    )}
                  </div>
                )}

                {/* Quick copy message button */}
                {m.sender === "mentor" && !m.isTyping && (
                  <button
                    onClick={() => handleCopyCode(m.message, idx)}
                    title="Copy response"
                    className="absolute -bottom-5 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="px-4 py-2.5 rounded-2xl rounded-tl-none bg-card border border-border/80 text-xs text-muted-foreground flex items-center gap-2 shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Axiom ({activeModel}) is formulating advice...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* ── Suggestion Chips & Input Bar ────────────────────────── */}
        <div className="pt-2 pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {activeChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading || isTyping}
                className="px-2.5 py-1 rounded-md bg-muted/50 hover:bg-muted text-[11px] text-muted-foreground hover:text-foreground border border-border/70 transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Ask Axiom in ${currentMode.label} mode...`}
              disabled={loading || isTyping}
              className="flex-1 bg-card border-border/80 text-xs h-9 focus-visible:ring-indigo-500"
            />
            <Button
              size="sm"
              onClick={() => handleSend()}
              disabled={loading || isTyping || !input.trim()}
              className="h-9 px-3.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
