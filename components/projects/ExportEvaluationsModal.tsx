"use client";

import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FolderOpen } from "lucide-react";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import useTauriStore from "@/lib/hooks/useTauriStore";
import type { ImageEvaluation } from "@/lib/hooks/models";

const STORE_KEY_PREFIX = "lastExportDir_";

interface ExportEvaluationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  evaluations: ImageEvaluation[];
  onExportComplete: (errors: string[], outputPath: string) => void;
}

export function ExportEvaluationsModal({
  open: isOpen,
  onOpenChange,
  projectName,
  evaluations,
  onExportComplete,
}: ExportEvaluationsModalProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { getValue, setValue } = useTauriStore();
  const storeKey = `${STORE_KEY_PREFIX}${projectName}`;

  useEffect(() => {
    if (isOpen && projectName) {
      getValue<string>(storeKey).then((path) => {
        if (path) setSelectedPath(path);
      });
    }
  }, [isOpen, projectName, storeKey]);

  const handleSelectDirectory = async () => {
    const defaultPath = selectedPath ?? (await getValue<string>(storeKey));
    const path = await open({
      directory: true,
      multiple: false,
      defaultPath: defaultPath ?? undefined,
    });
    if (path) {
      setSelectedPath(path);
      await setValue(storeKey, path);
    }
  };

  const handleConfirmExport = async () => {
    if (!selectedPath || evaluations.length === 0) return;
    setIsExporting(true);
    try {
      const { exportEvaluatedImages } = getTauriCommands();
      const errors = await exportEvaluatedImages(evaluations, selectedPath);
      await setValue(storeKey, selectedPath);
      onOpenChange(false);
      onExportComplete(errors, selectedPath);
    } catch (err) {
      onOpenChange(false);
      onExportComplete([String(err)], selectedPath);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isExporting) {
      onOpenChange(open);
      if (!open) setSelectedPath(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export evaluated images</DialogTitle>
          <DialogDescription>
            Choose a directory to save all {evaluations.length} evaluated image
            file(s) with their suggested filename suffixes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <Label>Output directory</Label>
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectDirectory}
              disabled={isExporting}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Select directory
            </Button>
            <span className="text-sm text-muted-foreground truncate flex-1 min-w-0">
              {selectedPath ?? "No directory selected"}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmExport}
            disabled={!selectedPath || isExporting}
          >
            {isExporting ? "Exporting..." : "Confirm Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
