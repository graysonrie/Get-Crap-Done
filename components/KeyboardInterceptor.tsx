"use client";

import { useEffect } from "react";

export function KeyboardInterceptor() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl+F (or Cmd+F on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Add listener to window
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return null;
}
