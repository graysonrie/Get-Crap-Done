"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, ImagePlus, Loader2, ImageIcon, Trash2 } from "lucide-react";
import useProjectImages from "@/components/projects/useProjectImages";
import { useProjectStore } from "@/lib/stores/projectStore";
import { cn } from "@/lib/utils";

export default function ProjectPage() {
  const router = useRouter();
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const reset = useProjectStore((s) => s.reset);

  const {
    imagePreviews,
    selectedImage,
    isLoadingPreviews,
    isLoadingFullImage,
    selectImage,
    addImages,
    deleteImage,
  } = useProjectImages();

  // Redirect to home if no active project
  useEffect(() => {
    if (!activeProjectName) {
      router.push("/");
    }
  }, [activeProjectName, router]);

  const handleGoHome = () => {
    reset();
    router.push("/");
  };

  if (!activeProjectName) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-2.5rem)] flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleGoHome}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-lg font-semibold">{activeProjectName}</h1>
        </div>
        <Button size="sm" onClick={addImages}>
          <ImagePlus className="w-4 h-4 mr-2" />
          Add Images
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <h2 className="text-sm font-medium text-muted-foreground">
              Images ({imagePreviews.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoadingPreviews ? (
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
                  <div
                    key={preview.imageName}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors",
                      selectedImage?.imageName === preview.imageName &&
                        "bg-accent",
                    )}
                  >
                    <button
                      onClick={() => selectImage(preview.imageName)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                    >
                      <img
                        src={`data:image/jpeg;base64,${preview.base64Preview}`}
                        alt={preview.imageName}
                        className="w-12 h-12 object-cover rounded shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {preview.imageName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {preview.width} x {preview.height}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(preview.imageName);
                      }}
                      className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Image preview area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          {isLoadingFullImage ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading image...</p>
            </div>
          ) : selectedImage ? (
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
          ) : (
            <Card className="p-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select an image from the sidebar to preview
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
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
