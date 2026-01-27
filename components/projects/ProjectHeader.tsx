"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, ImagePlus } from "lucide-react";

interface ProjectHeaderProps {
  projectName: string;
  onGoHome: () => void;
  onAddImages: () => void;
}

export function ProjectHeader({
  projectName,
  onGoHome,
  onAddImages,
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-md font-semibold pb-0.5">{projectName}</h1>
      </div>
      <Button size="sm" onClick={onAddImages}>
        <ImagePlus className="w-4 h-4 mr-2" />
        Add Images
      </Button>
    </div>
  );
}
