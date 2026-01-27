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
  isLoadingPreviews: boolean;
  isLoadingFullImage: boolean;
  isEvaluating: boolean;

  setActiveProject: (projectName: string | null) => void;
  setImagePreviews: (previews: ImagePreviewModel[]) => void;
  setSelectedImage: (image: FullImageModel | null) => void;
  setImageEvaluations: (evaluations: ImageEvaluation[]) => void;
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
  setIsLoadingPreviews: (loading) => set({ isLoadingPreviews: loading }),
  setIsLoadingFullImage: (loading) => set({ isLoadingFullImage: loading }),
  setIsEvaluating: (evaluating) => set({ isEvaluating: evaluating }),
  reset: () => set(initialState),
}));
