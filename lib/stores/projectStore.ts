import { create } from "zustand";
import type { FullImageModel, ImagePreviewModel } from "@/lib/hooks/models";

interface ProjectState {
  activeProjectName: string | null;
  imagePreviews: ImagePreviewModel[];
  selectedImage: FullImageModel | null;
  isLoadingPreviews: boolean;
  isLoadingFullImage: boolean;

  setActiveProject: (projectName: string | null) => void;
  setImagePreviews: (previews: ImagePreviewModel[]) => void;
  setSelectedImage: (image: FullImageModel | null) => void;
  setIsLoadingPreviews: (loading: boolean) => void;
  setIsLoadingFullImage: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  activeProjectName: null,
  imagePreviews: [],
  selectedImage: null,
  isLoadingPreviews: false,
  isLoadingFullImage: false,
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

  setActiveProject: (projectName) => set({ activeProjectName: projectName }),
  setImagePreviews: (previews) => set({ imagePreviews: previews }),
  setSelectedImage: (image) => set({ selectedImage: image }),
  setIsLoadingPreviews: (loading) => set({ isLoadingPreviews: loading }),
  setIsLoadingFullImage: (loading) => set({ isLoadingFullImage: loading }),
  reset: () => set(initialState),
}));
