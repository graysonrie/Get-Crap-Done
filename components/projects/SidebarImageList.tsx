"use client";

import { ImagePreviewItem } from "./ImagePreviewItem";
import type { ImagePreviewModel, FullImageModel } from "@/lib/hooks/models";

interface SidebarImageListProps {
  images: ImagePreviewModel[];
  selectedImage: FullImageModel | null;
  evaluatedImageNames: string[];
  evaluatedWithSuffixImageNames: string[];
  evaluatingImageNames: string[];
  selectedImageNames: string[];
  onImageClick: (imageName: string, e: React.MouseEvent) => void;
  onDeleteImage: (imageName: string) => void;
}

export default function SidebarImageList({
  images,
  selectedImage,
  evaluatedImageNames,
  evaluatedWithSuffixImageNames,
  evaluatingImageNames,
  selectedImageNames,
  onImageClick,
  onDeleteImage,
}: SidebarImageListProps) {
  return (
    <>
      {images.map((preview) => (
        <ImagePreviewItem
          key={preview.imageName}
          preview={preview}
          isSelected={selectedImage?.imageName === preview.imageName}
          isMultiSelected={selectedImageNames.includes(preview.imageName)}
          isEvaluated={evaluatedImageNames.includes(preview.imageName)}
          hasSuggestedSuffix={evaluatedWithSuffixImageNames.includes(
            preview.imageName
          )}
          isBeingEvaluated={evaluatingImageNames.includes(preview.imageName)}
          onSelect={(e) => onImageClick(preview.imageName, e)}
          onDelete={() => onDeleteImage(preview.imageName)}
        />
      ))}
    </>
  );
}
