import { create } from "zustand";

interface SettingsState {
  customPrompt: string | null;
  customTemperature: number | null;
  setCustomPrompt: (prompt: string | null) => void;
  setCustomTemperature: (temperature: number | null) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  customPrompt: null,
  customTemperature: null,
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  setCustomTemperature: (temperature) => set({ customTemperature: temperature }),
}));
