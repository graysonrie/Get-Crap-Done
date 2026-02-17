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
    imagePaths: string[],
    folder?: string | null
  ) => Promise<void>;
  deleteImagesFromProject: (
    projectName: string,
    imageNames: string[]
  ) => Promise<void>;
  evaluateImages: (
    projectName: string,
    request: RequestImageEvaluation,
    customPrompt?: string | null
  ) => Promise<ImageEvaluation[]>;
  getImageEvaluations: (projectName: string) => Promise<ImageEvaluation[]>;
  /** Export the images to their own folder with their new filepath suffixes defined in the ImageEvaluation models. Returns list of error messages (empty on full success). */
  exportEvaluatedImages: (
    evaluations: ImageEvaluation[],
    outputDirPath: string
  ) => Promise<string[]>;
  /** Open a path in the system file manager */
  openPathInFileManager: (path: string) => Promise<void>;
  /** Permanently delete a project and all its contents */
  deleteProject: (projectName: string) => Promise<void>;
  /** Archive a project (move to archived folder) */
  archiveProject: (projectName: string) => Promise<void>;
  /** Restore an archived project back to the active list */
  unarchiveProject: (projectName: string) => Promise<void>;
  /** Get names of all archived projects */
  getArchivedProjectNames: () => Promise<string[]>;
  /** Permanently delete an archived project */
  deleteArchivedProject: (projectName: string) => Promise<void>;
  /** Create a folder inside a project's images directory */
  createFolderInProject: (
    projectName: string,
    folderName: string
  ) => Promise<void>;
  /** List folder names inside a project's images directory */
  getFoldersInProject: (projectName: string) => Promise<string[]>;
  /** Rename a folder inside a project's images directory */
  renameFolderInProject: (
    projectName: string,
    oldFolderName: string,
    newFolderName: string
  ) => Promise<void>;
  /** Delete a folder and all its images from a project */
  deleteFolderFromProject: (
    projectName: string,
    folderName: string
  ) => Promise<void>;
  /** Move images to a different folder (or root if targetFolder is null) */
  moveImagesInProject: (
    projectName: string,
    imageNames: string[],
    targetFolder: string | null
  ) => Promise<string[]>;
}

export default function getTauriCommands(): TauriCommands {
  return {
    newProject: (pn) =>
      invoke<ProjectInfoModel>("new_project", { projectName: pn }),
    getProject: (pn) =>
      invoke<ProjectInfoModel>("get_project", { projectName: pn }),
    getProjectNames: () => invoke<string[]>("get_project_names"),
    recordProjectOpened: (pn) =>
      invoke("record_project_opened", { projectName: pn }),
    getImagePreviewsInProject: (pn) =>
      invoke<ImagePreviewModel[]>("get_image_previews_in_project", {
        projectName: pn,
      }),
    loadImageFromProject: (pn, img) =>
      invoke<FullImageModel>("load_image_from_project", {
        projectName: pn,
        imageName: img,
      }),
    importImagesToProject: (pn, paths, folder) =>
      invoke("import_images_to_project", {
        projectName: pn,
        imagePaths: paths,
        folder: folder ?? null,
      }),
    deleteImagesFromProject: (pn, names) =>
      invoke("delete_images_from_project", {
        projectName: pn,
        imageNames: names,
      }),
    evaluateImages: (pn, req, customPrompt) =>
      invoke<ImageEvaluation[]>("evaluate_images", {
        projectName: pn,
        request: req,
        customPrompt: customPrompt ?? undefined,
      }),
    getImageEvaluations: (pn) =>
      invoke<ImageEvaluation[]>("get_image_evaluations", { projectName: pn }),
    exportEvaluatedImages: (evals, dir) =>
      invoke<string[]>("export_evaluated_images", {
        evaluations: evals,
        outputDirPath: dir,
      }),
    openPathInFileManager: (p) =>
      invoke("open_path_in_file_manager", { path: p }),
    deleteProject: (pn) => invoke("delete_project", { projectName: pn }),
    archiveProject: (pn) => invoke("archive_project", { projectName: pn }),
    unarchiveProject: (pn) => invoke("unarchive_project", { projectName: pn }),
    getArchivedProjectNames: () =>
      invoke<string[]>("get_archived_project_names"),
    deleteArchivedProject: (pn) =>
      invoke("delete_archived_project", { projectName: pn }),
    createFolderInProject: (pn, fn) =>
      invoke("create_folder_in_project", { projectName: pn, folderName: fn }),
    getFoldersInProject: (pn) =>
      invoke<string[]>("get_folders_in_project", { projectName: pn }),
    renameFolderInProject: (pn, oldFn, newFn) =>
      invoke("rename_folder_in_project", {
        projectName: pn,
        oldFolderName: oldFn,
        newFolderName: newFn,
      }),
    deleteFolderFromProject: (pn, fn) =>
      invoke("delete_folder_from_project", { projectName: pn, folderName: fn }),
    moveImagesInProject: (pn, names, target) =>
      invoke<string[]>("move_images_in_project", {
        projectName: pn,
        imageNames: names,
        targetFolder: target,
      }),
  };
}
