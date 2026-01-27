"use client";

import { Loader2, ImageIcon } from "lucide-react";
import { ImagePreviewItem } from "./ImagePreviewItem";
import type { ImagePreviewModel, FullImageModel } from "@/lib/hooks/models";

interface ImageSidebarProps {
  imagePreviews: ImagePreviewModel[];
  selectedImage: FullImageModel | null;
  isLoading: boolean;
  onSelectImage: (imageName: string) => void;
  onDeleteImage: (imageName: string) => void;
}

export function ImageSidebar({
  imagePreviews,
  selectedImage,
  isLoading,
  onSelectImage,
  onDeleteImage,
}: ImageSidebarProps) {
  return (
    <div className="w-64 border-r flex flex-col overflow-hidden">
      <div className="p-3 border-b">
        <h2 className="text-sm font-medium text-muted-foreground">
          Images ({imagePreviews.length})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : imagePreviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No images yet.
              <br />
              Click &quot;Add Images&quot; to import.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {imagePreviews.map((preview) => (
              <ImagePreviewItem
                key={preview.imageName}
                preview={preview}
                isSelected={selectedImage?.imageName === preview.imageName}
                onSelect={() => onSelectImage(preview.imageName)}
                onDelete={() => onDeleteImage(preview.imageName)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
