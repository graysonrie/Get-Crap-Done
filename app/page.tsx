"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import OpenAIApiKeyInput from "@/components/OpenAIApiKeyInput";
import { Card, CardContent } from "@/components/ui/card";
// when using `"withGlobalTauri": true`, you may use
// const { enable, isEnabled, disable } = window.__TAURI__.autostart;
import ProjectsViewer from "@/components/projects/ProjectsViewer";

export default function Home() {
  return (
    <div className="flex h-[calc(100vh-2.5rem)] flex-col bg-background overflow-hidden font-sans p-2 items-center">
      <div className="flex flex-col gap-2 max-w-3xl">
        <div className="flex flex-col gap-2 mx-auto max-w-100">
          <OpenAIApiKeyInput />
        </div>
        <ProjectsViewer />
      </div>
    </div>
  );
}
