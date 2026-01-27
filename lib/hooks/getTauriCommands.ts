import { invoke } from "@tauri-apps/api/core";
import type {
  FullImageModel,
  ImagePreviewModel,
  ProjectInfoModel,
} from "@/lib/hooks/models";

interface TauriCommands {
  newProject: (projectName: string) => Promise<ProjectInfoModel>;
  getProject: (projectName: string) => Promise<ProjectInfoModel>;
  getProjectNames: () => Promise<string[]>;
  getImagePreviewsInProject: (
    projectName: string,
  ) => Promise<ImagePreviewModel[]>;
  loadImageFromProject: (
    projectName: string,
    imageName: string,
  ) => Promise<FullImageModel>;
  importImagesToProject: (
    projectName: string,
    imagePaths: string[],
  ) => Promise<void>;
  deleteImagesFromProject: (
    projectName: string,
    imageNames: string[],
  ) => Promise<void>;
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
    getImagePreviewsInProject: async (projectName: string) => {
      return await invoke<ImagePreviewModel[]>(
        "get_image_previews_in_project",
        {
          projectName,
        },
      );
    },
    loadImageFromProject: async (projectName: string, imageName: string) => {
      return await invoke<FullImageModel>("load_image_from_project", {
        projectName,
        imageName,
      });
    },
    importImagesToProject: async (projectName: string, imagePaths: string[]) => {
      await invoke("import_images_to_project", {
        projectName,
        imagePaths,
      });
    },
    deleteImagesFromProject: async (
      projectName: string,
      imageNames: string[],
    ) => {
      await invoke("delete_images_from_project", {
        projectName,
        imageNames,
      });
    },
  };
}
