import { invoke } from "@tauri-apps/api/core";
import type {
  FullImageModel,
  ImageEvaluation,
  ImagePreviewModel,
  ProjectInfoModel,
  RequestImageEvaluation,
} from "@/lib/hooks/models";

interface TauriCommands {
  newProject: (projectName: string) => Promise<ProjectInfoModel>;
  getProject: (projectName: string) => Promise<ProjectInfoModel>;
  getProjectNames: () => Promise<string[]>;
  recordProjectOpened: (projectName: string) => Promise<void>;
  getImagePreviewsInProject: (
    projectName: string
  ) => Promise<ImagePreviewModel[]>;
  loadImageFromProject: (
    projectName: string,
    imageName: string
  ) => Promise<FullImageModel>;
  importImagesToProject: (
    projectName: string,
    imagePaths: string[]
  ) => Promise<void>;
  deleteImagesFromProject: (
    projectName: string,
    imageNames: string[]
  ) => Promise<void>;
  evaluateImages: (
    projectName: string,
    request: RequestImageEvaluation
  ) => Promise<ImageEvaluation[]>;
  getImageEvaluations: (projectName: string) => Promise<ImageEvaluation[]>;
  /** Export the images to their own folder with their new filepath suffixes defined in the ImageEvaluation models. Returns list of error messages (empty on full success). */
  exportEvaluatedImages: (
    evaluations: ImageEvaluation[],
    outputDirPath: string
  ) => Promise<string[]>;
  /** Open a path in the system file manager */
  openPathInFileManager: (path: string) => Promise<void>;
}

export default function getTauriCommands(): TauriCommands {
  return {
    newProject: async (projectName: string) => {
      return await invoke<ProjectInfoModel>("new_project", { projectName });
    },
    getProject: async (projectName: string) => {
      return await invoke<ProjectInfoModel>("get_project", { projectName });
    },
    getProjectNames: async () => {
      return await invoke<string[]>("get_project_names");
    },
    recordProjectOpened: async (projectName: string) => {
      await invoke("record_project_opened", { projectName });
    },
    getImagePreviewsInProject: async (projectName: string) => {
      return await invoke<ImagePreviewModel[]>(
        "get_image_previews_in_project",
        {
          projectName,
        }
      );
    },
    loadImageFromProject: async (projectName: string, imageName: string) => {
      return await invoke<FullImageModel>("load_image_from_project", {
        projectName,
        imageName,
      });
    },
    importImagesToProject: async (
      projectName: string,
      imagePaths: string[]
    ) => {
      await invoke("import_images_to_project", {
        projectName,
        imagePaths,
      });
    },
    deleteImagesFromProject: async (
      projectName: string,
      imageNames: string[]
    ) => {
      await invoke("delete_images_from_project", {
        projectName,
        imageNames,
      });
    },
    evaluateImages: async (
      projectName: string,
      request: RequestImageEvaluation
    ) => {
      return await invoke<ImageEvaluation[]>("evaluate_images", {
        projectName,
        request,
      });
    },
    getImageEvaluations: async (projectName: string) => {
      return await invoke<ImageEvaluation[]>("get_image_evaluations", {
        projectName,
      });
    },
    exportEvaluatedImages: async (
      evaluations: ImageEvaluation[],
      outputDirPath: string
    ) => {
      return await invoke<string[]>("export_evaluated_images", {
        evaluations,
        outputDirPath,
      });
    },
    openPathInFileManager: async (path: string) => {
      await invoke("open_path_in_file_manager", { path });
    },
  };
}
