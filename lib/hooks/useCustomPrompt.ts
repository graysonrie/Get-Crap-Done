import { useCallback, useEffect } from "react";
import useTauriStore from "./useTauriStore";
import { useProjectStore } from "@/lib/stores/projectStore";

function promptKey(projectName: string) {
  return `customPrompt_${projectName}`;
}

function temperatureKey(projectName: string) {
  return `customTemperature_${projectName}`;
}

export default function useCustomPrompt() {
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const setCustomPrompt = useProjectStore((s) => s.setCustomPrompt);
  const setCustomTemperature = useProjectStore((s) => s.setCustomTemperature);
  const { getValue, setValue } = useTauriStore();

  useEffect(() => {
    if (!activeProjectName) return;
    getValue<string>(promptKey(activeProjectName)).then((saved) => {
      setCustomPrompt(saved ?? null);
    });
    getValue<number>(temperatureKey(activeProjectName)).then((saved) => {
      setCustomTemperature(saved ?? null);
    });
  }, [activeProjectName]);

  const saveCustomPrompt = useCallback(
    async (prompt: string | null) => {
      if (!activeProjectName) return;
      setCustomPrompt(prompt);
      await setValue(promptKey(activeProjectName), prompt);
    },
    [activeProjectName, setCustomPrompt, setValue]
  );

  const saveCustomTemperature = useCallback(
    async (temperature: number | null) => {
      if (!activeProjectName) return;
      setCustomTemperature(temperature);
      await setValue(temperatureKey(activeProjectName), temperature);
    },
    [activeProjectName, setCustomTemperature, setValue]
  );

  return { saveCustomPrompt, saveCustomTemperature };
}
