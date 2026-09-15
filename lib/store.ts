import { create } from "zustand";

interface AppState {
  isTimerRunning: boolean;
  studySeconds: number;
  streak: number;
  dailyGoalHours: number;
  isSidebarOpen: boolean;
  activeTrack: string;
  ollamaConnected: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  toggleSidebar: () => void;
  setOllamaConnected: (status: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isTimerRunning: false,
  studySeconds: 14280, // e.g. ~3h 58m logged
  streak: 12,
  dailyGoalHours: 6,
  isSidebarOpen: true,
  activeTrack: "BI & Analytics Engineering",
  ollamaConnected: true,
  startTimer: () => set({ isTimerRunning: true }),
  pauseTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ studySeconds: 0, isTimerRunning: false }),
  tickTimer: () => set((state) => ({ studySeconds: state.studySeconds + 1 })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setOllamaConnected: (status: boolean) => set({ ollamaConnected: status }),
}));
