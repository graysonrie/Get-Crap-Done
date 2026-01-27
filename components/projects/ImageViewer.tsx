"use client";

import { Loader2, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { FullImageModel } from "@/lib/hooks/models";

interface ImageViewerProps {
  selectedImage: FullImageModel | null;
  isLoading: boolean;
}

export function ImageViewer({ selectedImage, isLoading }: ImageViewerProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading image...</p>
        </div>
      </div>
    );
  }

  if (selectedImage) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="flex flex-col items-center gap-4 max-h-full max-w-full">
          <img
            src={`data:image/jpeg;base64,${selectedImage.base64Image}`}
            alt={selectedImage.imageName}
            className="max-h-[calc(100vh-12rem)] max-w-full object-contain rounded-lg shadow-lg"
          />
          <div className="text-center">
            <p className="font-medium">{selectedImage.imageName}</p>
            <p className="text-sm text-muted-foreground">
              {selectedImage.width} x {selectedImage.height} &bull;{" "}
              {formatBytes(selectedImage.imageSizeBytes)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 overflow-hidden font-sans">
      <Card className="p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            Select an image from the sidebar to preview
          </p>
        </div>
      </Card>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
