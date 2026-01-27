"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ImageSidebar } from "@/components/projects/ImageSidebar";
import { ImageViewer } from "@/components/projects/ImageViewer";
import useProjectImages from "@/components/projects/useProjectImages";
import useOpenAIApiKey from "@/lib/hooks/useOpenAIApiKey";
import { useProjectStore } from "@/lib/stores/projectStore";

export default function ProjectPage() {
  const router = useRouter();
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const reset = useProjectStore((s) => s.reset);
  const { openAIApiKey } = useOpenAIApiKey();

  const {
    imagePreviews,
    selectedImage,
    imageEvaluations,
    isLoadingPreviews,
    isLoadingFullImage,
    isEvaluating,
    selectImage,
    addImages,
    deleteImage,
    evaluateSelectedImage,
  } = useProjectImages();

  // Compute list of evaluated image names for sidebar indicators
  const evaluatedImageNames = useMemo(
    () => imageEvaluations.map((e) => e.imageName),
    [imageEvaluations]
  );

  // Get evaluation for currently selected image
  const selectedImageEvaluation = useMemo(
    () =>
      selectedImage
        ? imageEvaluations.find((e) => e.imageName === selectedImage.imageName)
        : undefined,
    [selectedImage, imageEvaluations]
  );

  // Can evaluate if an image is selected and API key is set
  const canEvaluate = !!selectedImage && !!openAIApiKey;

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

  const handleEvaluateImage = () => {
    if (openAIApiKey) {
      evaluateSelectedImage(openAIApiKey);
    }
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
        onEvaluateImage={handleEvaluateImage}
        canEvaluate={canEvaluate}
        isEvaluating={isEvaluating}
      />

      <div className="flex flex-1 overflow-hidden">
        <ImageSidebar
          imagePreviews={imagePreviews}
          selectedImage={selectedImage}
          evaluatedImageNames={evaluatedImageNames}
          isLoading={isLoadingPreviews}
          onSelectImage={selectImage}
          onDeleteImage={deleteImage}
        />

        <ImageViewer
          selectedImage={selectedImage}
          evaluation={selectedImageEvaluation}
          isLoading={isLoadingFullImage}
        />
      </div>
    </div>
  );
}
