import { useCallback, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import getTauriCommands from "@/lib/hooks/getTauriCommands";
import { useProjectStore } from "@/lib/stores/projectStore";

export default function useProjectImages() {
  const {
    activeProjectName,
    imagePreviews,
    selectedImage,
    isLoadingPreviews,
    isLoadingFullImage,
    setImagePreviews,
    setSelectedImage,
    setIsLoadingPreviews,
    setIsLoadingFullImage,
  } = useProjectStore();

  const loadPreviews = useCallback(async () => {
    if (!activeProjectName) return;

    setIsLoadingPreviews(true);
    try {
      const { getImagePreviewsInProject } = getTauriCommands();
      const previews = await getImagePreviewsInProject(activeProjectName);
      setImagePreviews(previews);
    } catch (error) {
      console.error("Failed to load image previews:", error);
      toast.error("Failed to load image previews", {
        description: String(error),
      });
    } finally {
      setIsLoadingPreviews(false);
    }
  }, [activeProjectName, setImagePreviews, setIsLoadingPreviews]);

  useEffect(() => {
    loadPreviews();
  }, [loadPreviews]);

  const selectImage = useCallback(
    async (imageName: string) => {
      if (!activeProjectName) return;

      setIsLoadingFullImage(true);
      try {
        const { loadImageFromProject } = getTauriCommands();
        const fullImage = await loadImageFromProject(
          activeProjectName,
          imageName,
        );
        setSelectedImage(fullImage);
      } catch (error) {
        console.error("Failed to load full image:", error);
        toast.error(`Failed to load "${imageName}"`, {
          description: String(error),
        });
      } finally {
        setIsLoadingFullImage(false);
      }
    },
    [activeProjectName, setSelectedImage, setIsLoadingFullImage],
  );

  const addImages = useCallback(async () => {
    if (!activeProjectName) return;

    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg"],
        },
      ],
    });

    if (!selected || selected.length === 0) return;

    try {
      const { importImagesToProject } = getTauriCommands();
      await importImagesToProject(activeProjectName, selected);
      await loadPreviews();
    } catch (error) {
      console.error("Failed to import images:", error);
      toast.error("Failed to import images", {
        description: String(error),
      });
    }
  }, [activeProjectName, loadPreviews]);

  const deleteImage = useCallback(
    async (imageName: string) => {
      if (!activeProjectName) return;

      try {
        const { deleteImagesFromProject } = getTauriCommands();
        await deleteImagesFromProject(activeProjectName, [imageName]);

        // Clear selected image if it was the deleted one
        if (selectedImage?.imageName === imageName) {
          setSelectedImage(null);
        }

        // Remove from local previews list
        setImagePreviews(
          imagePreviews.filter((p) => p.imageName !== imageName),
        );
      } catch (error) {
        console.error("Failed to delete image:", error);
        toast.error(`Failed to delete "${imageName}"`, {
          description: String(error),
        });
      }
    },
    [
      activeProjectName,
      selectedImage,
      imagePreviews,
      setSelectedImage,
      setImagePreviews,
    ],
  );

  return {
    activeProjectName,
    imagePreviews,
    selectedImage,
    isLoadingPreviews,
    isLoadingFullImage,
    selectImage,
    addImages,
    deleteImage,
    refreshPreviews: loadPreviews,
  };
}
