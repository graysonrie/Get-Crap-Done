"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ImageSidebar } from "@/components/projects/ImageSidebar";
import { ImageViewer } from "@/components/projects/ImageViewer";
import { ExportEvaluationsModal } from "@/components/projects/ExportEvaluationsModal";
import { ExportResultModal } from "@/components/projects/ExportResultModal";
import MoveToFolderModal from "@/components/projects/MoveToFolderModal";
import useProjectImages from "@/components/projects/useProjectImages";
import useImageEvaluation from "@/components/projects/useImageEvaluation";
import useProjectFolders from "@/components/projects/useProjectFolders";
import useOpenAIApiKey from "@/lib/hooks/useOpenAIApiKey";
import { useProjectStore } from "@/lib/stores/projectStore";

export default function ProjectPage() {
  const router = useRouter();
  const activeProjectName = useProjectStore((s) => s.activeProjectName);
  const reset = useProjectStore((s) => s.reset);
  const selectedImageNames = useProjectStore((s) => s.selectedImageNames);
  const setSelectedImageNames = useProjectStore((s) => s.setSelectedImageNames);
  const { openAIApiKey } = useOpenAIApiKey();

  const {
    imagePreviews, selectedImage, imageEvaluations,
    isLoadingPreviews, isLoadingFullImage, isEvaluating,
    selectImage, addImages, deleteImage, moveImagesToFolder,
    refreshPreviews, refreshEvaluations,
  } = useProjectImages();

  const {
    evaluateSelectedImage, evaluateNewImages, reevaluateAll,
    evaluateNewImagesInFolder, reevaluateAllInFolder,
  } = useImageEvaluation();

  const {
    folders, focusedFolder, setFocusedFolder,
    createFolder, renameFolder, deleteFolder, refreshFolders,
  } = useProjectFolders();

  const evaluatedImageNames = useMemo(() => imageEvaluations.map((e) => e.imageName), [imageEvaluations]);
  const evaluatedWithSuffixImageNames = useMemo(() => imageEvaluations.filter((e) => e.result?.newSuggestedFilepathSuffix).map((e) => e.imageName), [imageEvaluations]);
  const selectedImageEvaluation = useMemo(() => selectedImage ? imageEvaluations.find((e) => e.imageName === selectedImage.imageName) : undefined, [selectedImage, imageEvaluations]);
  const hasImages = imagePreviews.length > 0;
  const hasEvaluatedImages = imageEvaluations.length > 0;
  const hasUnevaluatedImages = useMemo(() => imagePreviews.some((p) => !evaluatedImageNames.includes(p.imageName)), [imagePreviews, evaluatedImageNames]);
  const folderPreviews = useMemo(() => focusedFolder ? imagePreviews.filter((p) => p.imageName.startsWith(`${focusedFolder}/`)) : [], [focusedFolder, imagePreviews]);
  const hasFolderImages = folderPreviews.length > 0;
  const hasFolderUnevaluatedImages = useMemo(() => folderPreviews.some((p) => !evaluatedImageNames.includes(p.imageName)), [folderPreviews, evaluatedImageNames]);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportResultOpen, setExportResultOpen] = useState(false);
  const [exportResultErrors, setExportResultErrors] = useState<string[]>([]);
  const [exportResultPath, setExportResultPath] = useState("");
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const canMoveToFolder = selectedImageNames.length > 0 && folders.length > 0;

  const handleExportComplete = (errors: string[], outputPath: string) => { setExportResultErrors(errors); setExportResultPath(outputPath); setExportResultOpen(true); };

  useEffect(() => {
    if (!activeProjectName) router.push("/");
  }, [activeProjectName, router]);

  const refreshAfterFolderChange = useCallback(async () => { await refreshPreviews(); await refreshEvaluations(); }, [refreshPreviews, refreshEvaluations]);
  const handleRenameFolder = useCallback((oldName: string, newName: string) => renameFolder(oldName, newName, refreshAfterFolderChange), [renameFolder, refreshAfterFolderChange]);
  const handleDeleteFolder = useCallback((folderName: string) => deleteFolder(folderName, refreshAfterFolderChange), [deleteFolder, refreshAfterFolderChange]);

  const handleMoveConfirm = useCallback(
    async (targetFolder: string | null) => {
      await moveImagesToFolder(selectedImageNames, targetFolder);
      await refreshFolders();
      setSelectedImageNames([]);
      setMoveModalOpen(false);
    },
    [moveImagesToFolder, selectedImageNames, refreshFolders, setSelectedImageNames]
  );

  if (!activeProjectName) return null;

  const k = openAIApiKey;

  return (
    <div className="flex h-[calc(100vh-2.5rem)] flex-col bg-background overflow-hidden">
      <ProjectHeader
        projectName={activeProjectName}
        onGoHome={() => { reset(); router.push("/"); }}
        onAddImages={addImages}
        onEvaluateThisImage={() => k && evaluateSelectedImage(k)}
        onEvaluateNewImages={() => k && evaluateNewImages(k)}
        onReevaluateAll={() => k && reevaluateAll(k)}
        onEvaluateNewInFolder={() => k && focusedFolder && evaluateNewImagesInFolder(k, focusedFolder)}
        onReevaluateAllInFolder={() => k && focusedFolder && reevaluateAllInFolder(k, focusedFolder)}
        onMoveToFolder={() => setMoveModalOpen(true)}
        canMoveToFolder={canMoveToFolder}
        onExport={() => setExportModalOpen(true)}
        isEvaluating={isEvaluating}
        canEvaluateThisImage={!!selectedImage && !!k}
        hasUnevaluatedImages={hasUnevaluatedImages}
        hasImages={hasImages}
        hasApiKey={!!k}
        hasEvaluatedImages={hasEvaluatedImages}
        focusedFolder={focusedFolder}
        hasFolderUnevaluatedImages={hasFolderUnevaluatedImages}
        hasFolderImages={hasFolderImages}
      />
      <ExportEvaluationsModal open={exportModalOpen} onOpenChange={setExportModalOpen} projectName={activeProjectName} evaluations={imageEvaluations} onExportComplete={handleExportComplete} />
      <ExportResultModal open={exportResultOpen} onOpenChange={setExportResultOpen} errors={exportResultErrors} outputPath={exportResultPath} />
      <MoveToFolderModal open={moveModalOpen} onOpenChange={setMoveModalOpen} folders={folders} imageCount={selectedImageNames.length} onConfirm={handleMoveConfirm} />
      <div className="flex flex-1 overflow-hidden">
        <ImageSidebar
          imagePreviews={imagePreviews} selectedImage={selectedImage}
          evaluatedImageNames={evaluatedImageNames} evaluatedWithSuffixImageNames={evaluatedWithSuffixImageNames}
          isLoading={isLoadingPreviews} folders={folders} focusedFolder={focusedFolder}
          onSelectImage={selectImage} onDeleteImage={deleteImage}
          onFocusFolder={setFocusedFolder} onCreateFolder={createFolder}
          onDeleteFolder={handleDeleteFolder}
          onRenameFolder={handleRenameFolder}
        />
        <ImageViewer selectedImage={selectedImage} evaluation={selectedImageEvaluation} isLoading={isLoadingFullImage} />
      </div>
    </div>
  );
}
