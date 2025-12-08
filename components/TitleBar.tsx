"use client";

import { Minimize2, Maximize2, X, ListCheck } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { cn } from "@/lib/utils";

export function TitleBar() {
  const handleMinimize = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="flex h-10 items-center justify-between border-b bg-background px-4"
    >
      <div className="flex items-center gap-2 text-primary">
        <ListCheck className="w-4" />
        <span className="text-sm font-medium font-mono">Get Crap Done</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleMinimize}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-sm",
            "hover:bg-muted transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          aria-label="Minimize"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleMaximize}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-sm",
            "hover:bg-muted transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          aria-label="Maximize"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleClose}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-sm",
            "hover:bg-destructive hover:text-destructive-foreground transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
