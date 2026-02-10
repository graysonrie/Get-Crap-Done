"use client";

import { Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImagePreviewModel } from "@/lib/hooks/models";

/** Extract just the filename from a possibly folder-prefixed image name */
function displayName(imageName: string): string {
  const parts = imageName.split("/");
  return parts[parts.length - 1];
}

interface ImagePreviewItemProps {
  preview: ImagePreviewModel;
  isSelected: boolean;
  isMultiSelected: boolean;
  isEvaluated: boolean;
  hasSuggestedSuffix: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

export function ImagePreviewItem({
  preview,
  isSelected,
  isMultiSelected,
  isEvaluated,
  hasSuggestedSuffix,
  onSelect,
  onDelete,
}: ImagePreviewItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors",
        isSelected && "bg-primary/15",
        isMultiSelected && "bg-primary/15 ring-2 ring-primary"
      )}
    >
      <button
        onClick={onSelect}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <div className="relative shrink-0">
          <img
            src={`data:image/jpeg;base64,${preview.base64Preview}`}
            alt={preview.imageName}
            className="w-12 h-12 object-cover rounded pointer-events-none"
          />
          {isEvaluated && (
            <div className="absolute -top-1 -right-1 bg-background rounded-full">
              {hasSuggestedSuffix ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {displayName(preview.imageName)}
          </p>
          <p className="text-xs text-muted-foreground">
            {preview.width} x {preview.height}
          </p>
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
        title="Delete image"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
