"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Home, ImagePlus, Sparkles, Loader2, ChevronDown, Download } from "lucide-react";

interface ProjectHeaderProps {
  projectName: string;
  onGoHome: () => void;
  onAddImages: () => void;
  onEvaluateThisImage: () => void;
  onEvaluateNewImages: () => void;
  onReevaluateAll: () => void;
  onExport: () => void;
  isEvaluating: boolean;
  canEvaluateThisImage: boolean;
  hasUnevaluatedImages: boolean;
  hasImages: boolean;
  hasApiKey: boolean;
  hasEvaluatedImages: boolean;
}

export function ProjectHeader({
  projectName,
  onGoHome,
  onAddImages,
  onEvaluateThisImage,
  onEvaluateNewImages,
  onReevaluateAll,
  onExport,
  isEvaluating,
  canEvaluateThisImage,
  hasUnevaluatedImages,
  hasImages,
  hasApiKey,
  hasEvaluatedImages,
}: ProjectHeaderProps) {
  const [reevaluateDialogOpen, setReevaluateDialogOpen] = useState(false);

  const evaluateDropdownEnabled = hasApiKey && hasImages && !isEvaluating;

  const handleReevaluateAllClick = () => {
    setReevaluateDialogOpen(true);
  };

  const handleReevaluateAllConfirm = () => {
    onReevaluateAll();
    setReevaluateDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-md font-semibold pb-0.5">{projectName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {hasEvaluatedImages && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                disabled={!evaluateDropdownEnabled}
              >
                {isEvaluating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Evaluate
                <ChevronDown className="w-4 h-4 ml-1 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onEvaluateThisImage}
                disabled={!canEvaluateThisImage}
              >
                Evaluate This Image
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onEvaluateNewImages}
                disabled={!hasUnevaluatedImages}
              >
                Evaluate New Images
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleReevaluateAllClick}
                disabled={!hasImages}
              >
                Reevaluate All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={onAddImages}>
            <ImagePlus className="w-4 h-4 mr-2" />
            Add Images
          </Button>
        </div>
      </div>

      <AlertDialog
        open={reevaluateDialogOpen}
        onOpenChange={setReevaluateDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reevaluate all images?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a new evaluation request for every image in the
              project, including ones that already have evaluations. Existing
              evaluations will be overwritten. This may use more API credits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReevaluateAllConfirm}>
              Reevaluate All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
