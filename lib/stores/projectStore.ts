import { create } from "zustand";
import type {
  FullImageModel,
  ImageEvaluation,
  ImagePreviewModel,
} from "@/lib/hooks/models";

interface ProjectState {
  activeProjectName: string | null;
  imagePreviews: ImagePreviewModel[];
  selectedImage: FullImageModel | null;
  imageEvaluations: ImageEvaluation[];
  focusedFolder: string | null;
  selectedImageNames: string[];
  lastClickedImageName: string | null;
  pendingImageCount: number;
  evaluatingImageNames: string[];
  isLoadingPreviews: boolean;
  isLoadingFullImage: boolean;
  isEvaluating: boolean;

  setPendingImageCount: (count: number) => void;
  setEvaluatingImageNames: (names: string[]) => void;
  setActiveProject: (projectName: string | null) => void;
  setImagePreviews: (previews: ImagePreviewModel[]) => void;
  setSelectedImage: (image: FullImageModel | null) => void;
  setImageEvaluations: (evaluations: ImageEvaluation[]) => void;
  setFocusedFolder: (folder: string | null) => void;
  setSelectedImageNames: (names: string[]) => void;
  setLastClickedImageName: (name: string | null) => void;
  setIsLoadingPreviews: (loading: boolean) => void;
  setIsLoadingFullImage: (loading: boolean) => void;
  setIsEvaluating: (evaluating: boolean) => void;
  reset: () => void;
}

const initialState = {
  activeProjectName: null,
  imagePreviews: [],
  selectedImage: null,
  imageEvaluations: [],
  focusedFolder: null,
  selectedImageNames: [] as string[],
  lastClickedImageName: null,
  pendingImageCount: 0,
  evaluatingImageNames: [] as string[],
  isLoadingPreviews: false,
  isLoadingFullImage: false,
  isEvaluating: false,
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

  setActiveProject: (projectName) => set({ activeProjectName: projectName }),
  setImagePreviews: (previews) => set({ imagePreviews: previews }),
  setSelectedImage: (image) => set({ selectedImage: image }),
  setImageEvaluations: (evaluations) => set({ imageEvaluations: evaluations }),
  setFocusedFolder: (folder) => set({ focusedFolder: folder }),
  setSelectedImageNames: (names) => set({ selectedImageNames: names }),
  setLastClickedImageName: (name) => set({ lastClickedImageName: name }),
  setPendingImageCount: (count) => set({ pendingImageCount: count }),
  setEvaluatingImageNames: (names) => set({ evaluatingImageNames: names }),
  setIsLoadingPreviews: (loading) => set({ isLoadingPreviews: loading }),
  setIsLoadingFullImage: (loading) => set({ isLoadingFullImage: loading }),
  setIsEvaluating: (evaluating) => set({ isEvaluating: evaluating }),
  reset: () => set(initialState),
}));
