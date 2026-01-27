"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ImageSidebar } from "@/components/projects/ImageSidebar";
import { ImageViewer } from "@/components/projects/ImageViewer";
import useProjectImages from "@/components/projects/useProjectImages";
import { useProjectStore } from "@/lib/stores/projectStore";

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
      <ProjectHeader
        projectName={activeProjectName}
        onGoHome={handleGoHome}
        onAddImages={addImages}
      />

      <div className="flex flex-1 overflow-hidden">
        <ImageSidebar
          imagePreviews={imagePreviews}
          selectedImage={selectedImage}
          isLoading={isLoadingPreviews}
          onSelectImage={selectImage}
          onDeleteImage={deleteImage}
        />

        <ImageViewer
          selectedImage={selectedImage}
          isLoading={isLoadingFullImage}
        />
      </div>
    </div>
  );
}
