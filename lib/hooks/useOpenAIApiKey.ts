import { useState, useEffect } from "react";
import { load } from '@tauri-apps/plugin-store';
import useTauriStore from "./useTauriStore";

export default function useOpenAIApiKey() {
  const [openAIApiKey, setOpenAIApiKey] = useState<string | null>(null);
  const { getValue, setValue } = useTauriStore();

  useEffect(() => {
    //Try to load it from the Tauri Store:
    const loadOpenAIApiKey = async () => {
      const openAIApiKey = await getValue<string>('openAIApiKey');
      setOpenAIApiKey(openAIApiKey ?? null);
    };
    loadOpenAIApiKey();
  }, [getValue]);

  async function setApiKey(apiKey: string) {
    setOpenAIApiKey(apiKey);
    await setValue('openAIApiKey', apiKey);
  }

  return {
    openAIApiKey,
    setApiKey,
  };
}