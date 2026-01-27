export interface ProjectInfoModel {
  projectName: string;
}

/** Image preview with thumbnail for display in lists/grids */
export interface ImagePreviewModel {
  imageName: string;
  base64Preview: string;
  imageSizeBytes: number;
  width: number;
  height: number;
}

/** Full resolution image data */
export interface FullImageModel {
  imageName: string;
  base64Image: string;
  imageSizeBytes: number;
  width: number;
  height: number;
}
