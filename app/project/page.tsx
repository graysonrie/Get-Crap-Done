"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ImageSidebar } from "@/components/projects/ImageSidebar";
import { ImageViewer } from "@/components/projects/ImageViewer";
import { ExportEvaluationsModal } from "@/components/projects/ExportEvaluationsModal";
import { ExportResultModal } from "@/components/projects/ExportResultModal";
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
    evaluateNewImages,
    reevaluateAll,
  } = useProjectImages();

  // Compute list of evaluated image names for sidebar indicators
  const evaluatedImageNames = useMemo(
    () => imageEvaluations.map((e) => e.imageName),
    [imageEvaluations]
  );

  // Evaluated images that have a suggested filename suffix (green check vs yellow warning)
  const evaluatedWithSuffixImageNames = useMemo(
    () =>
      imageEvaluations
        .filter((e) => e.result?.newSuggestedFilepathSuffix)
        .map((e) => e.imageName),
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

  const hasImages = imagePreviews.length > 0;
  const hasEvaluatedImages = imageEvaluations.length > 0;
  const hasUnevaluatedImages = useMemo(
    () =>
      imagePreviews.some(
        (p) => !evaluatedImageNames.includes(p.imageName)
      ),
    [imagePreviews, evaluatedImageNames]
  );

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportResultOpen, setExportResultOpen] = useState(false);
  const [exportResultErrors, setExportResultErrors] = useState<string[]>([]);
  const [exportResultPath, setExportResultPath] = useState<string>("");

  const handleExport = () => setExportModalOpen(true);

  const handleExportComplete = (errors: string[], outputPath: string) => {
    setExportResultErrors(errors);
    setExportResultPath(outputPath);
    setExportResultOpen(true);
  };

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

  const handleEvaluateThisImage = () => {
    if (openAIApiKey) evaluateSelectedImage(openAIApiKey);
  };

  const handleEvaluateNewImages = () => {
    if (openAIApiKey) evaluateNewImages(openAIApiKey);
  };

  const handleReevaluateAll = () => {
    if (openAIApiKey) reevaluateAll(openAIApiKey);
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
        onEvaluateThisImage={handleEvaluateThisImage}
        onEvaluateNewImages={handleEvaluateNewImages}
        onReevaluateAll={handleReevaluateAll}
        onExport={handleExport}
        isEvaluating={isEvaluating}
        canEvaluateThisImage={!!selectedImage && !!openAIApiKey}
        hasUnevaluatedImages={hasUnevaluatedImages}
        hasImages={hasImages}
        hasApiKey={!!openAIApiKey}
        hasEvaluatedImages={hasEvaluatedImages}
      />

      <ExportEvaluationsModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        projectName={activeProjectName}
        evaluations={imageEvaluations}
        onExportComplete={handleExportComplete}
      />

      <ExportResultModal
        open={exportResultOpen}
        onOpenChange={setExportResultOpen}
        errors={exportResultErrors}
        outputPath={exportResultPath}
      />

      <div className="flex flex-1 overflow-hidden">
        <ImageSidebar
          imagePreviews={imagePreviews}
          selectedImage={selectedImage}
          evaluatedImageNames={evaluatedImageNames}
          evaluatedWithSuffixImageNames={evaluatedWithSuffixImageNames}
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
