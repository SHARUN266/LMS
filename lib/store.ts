import { create } from "zustand";

interface AppState {
  isTimerRunning: boolean;
  studySeconds: number;
  streak: number;
  dailyGoalHours: number;
  isSidebarOpen: boolean;
  activeTrack: string;
  aiConnected: boolean;
  ollamaConnected: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  toggleSidebar: () => void;
  setAIConnected: (status: boolean) => void;
  setOllamaConnected: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isTimerRunning: false,
  studySeconds: 0,
  streak: 0,
  dailyGoalHours: 6,
  isSidebarOpen: true,
  activeTrack: "Business Analyst",
  aiConnected: true,
  ollamaConnected: true,
  startTimer: () => set({ isTimerRunning: true }),
  pauseTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ studySeconds: 0, isTimerRunning: false }),
  tickTimer: () => set((state) => ({ studySeconds: state.studySeconds + 1 })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setAIConnected: (status: boolean) => set({ aiConnected: status, ollamaConnected: status }),
  setOllamaConnected: (status: boolean) => set({ aiConnected: status, ollamaConnected: status }),
}));

