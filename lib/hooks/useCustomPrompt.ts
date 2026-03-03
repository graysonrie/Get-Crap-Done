import { useCallback, useEffect } from "react";
import useTauriStore from "./useTauriStore";
import { useSettingsStore } from "@/lib/stores/settingsStore";

const CUSTOM_PROMPT_KEY = "customPrompt";
const CUSTOM_TEMPERATURE_KEY = "customTemperature";

export default function useCustomPrompt() {
  const setCustomPrompt = useSettingsStore((s) => s.setCustomPrompt);
  const setCustomTemperature = useSettingsStore((s) => s.setCustomTemperature);
  const { getValue, setValue } = useTauriStore();

  useEffect(() => {
    getValue<string>(CUSTOM_PROMPT_KEY).then((saved) => {
      setCustomPrompt(saved ?? null);
    });
    getValue<number>(CUSTOM_TEMPERATURE_KEY).then((saved) => {
      setCustomTemperature(saved ?? null);
    });
  }, [setCustomPrompt, setCustomTemperature]);

  const saveCustomPrompt = useCallback(
    async (prompt: string | null) => {
      setCustomPrompt(prompt);
      await setValue(CUSTOM_PROMPT_KEY, prompt);
    },
    [setCustomPrompt, setValue]
  );

  const saveCustomTemperature = useCallback(
    async (temperature: number | null) => {
      setCustomTemperature(temperature);
      await setValue(CUSTOM_TEMPERATURE_KEY, temperature);
    },
    [setCustomTemperature, setValue]
  );

  return { saveCustomPrompt, saveCustomTemperature };
}
