"use client";

import { FolderOpen, ListTree } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FolderViewerItem {
  imageName: string;
  suffix: string;
}

interface FolderViewerProps {
  folderName: string;
  evaluations: FolderViewerItem[];
  onSelectImage: (imageName: string) => void;
}

export function FolderViewer({
  folderName,
  evaluations,
  onSelectImage,
}: FolderViewerProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto font-sans">
      <div className="flex flex-1 flex-col gap-4 min-h-0 w-full max-w-3xl mx-auto">
        <div className="shrink-0">
          <h2 className="text-xl font-semibold break-all">{folderName}</h2>
          <p className="text-sm text-muted-foreground">
            {evaluations.length} evaluated image
            {evaluations.length === 1 ? "" : "s"}
          </p>
        </div>
        {evaluations.length > 0 ? (
          <div className="flex-1 min-h-0 rounded-lg border overflow-y-auto font-sans">
            <div className="divide-y">
              {evaluations.map((item) => (
                <div
                  key={item.imageName}
                  className="px-4 py-3 flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => onSelectImage(item.imageName)}
                >
                  <p className="text-sm font-medium break-all">
                    {item.imageName.startsWith(`${folderName}/`)
                      ? item.imageName.slice(folderName.length + 1)
                      : item.imageName}
                  </p>
                  <p className="text-xs text-primary text-right break-all">
                    {item.suffix.startsWith("_")
                      ? item.suffix.slice(1)
                      : item.suffix}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center overflow-hidden font-sans">
            <Card className="p-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No evaluated images in this folder yet.
                </p>
              </div>
            </Card>
          </div>
        )}
        {/* <div className="shrink-0 rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <ListTree className="w-4 h-4 shrink-0" />
          Suggested filepath suffixes for evaluated images in this folder.
        </div> */}
      </div>
    </div>
  );
}
