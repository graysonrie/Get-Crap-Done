import { load } from "@tauri-apps/plugin-store";

export default function useTauriStore() {

  async function setValue(key: string, value: any) {
    const store = await load('config.json', { defaults: {} });
    await store.set(key, value);
  }

  async function getValue<T>(key: string): Promise<T | undefined> {
    const store = await load('config.json', { defaults: {} });
    return await store.get(key);
  }

  return {
    setValue,
    getValue,
  };
}