"use client";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImagePreviewModel } from "@/lib/hooks/models";

interface ImagePreviewItemProps {
  preview: ImagePreviewModel;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function ImagePreviewItem({
  preview,
  isSelected,
  onSelect,
  onDelete,
}: ImagePreviewItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors",
        isSelected && "bg-accent",
      )}
    >
      <button
        onClick={onSelect}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <img
          src={`data:image/jpeg;base64,${preview.base64Preview}`}
          alt={preview.imageName}
          className="w-12 h-12 object-cover rounded shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{preview.imageName}</p>
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
