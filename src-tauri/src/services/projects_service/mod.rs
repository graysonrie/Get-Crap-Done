pub mod service;
pub mod tauri_exports;
pub use service::ProjectsService;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInfoModel {
    pub project_name: String,
}

/// Image preview with thumbnail for display in lists/grids
#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ImagePreviewModel {
    pub image_name: String,
    pub base64_preview: String,
    pub image_size_bytes: u64,
    pub width: u32,
    pub height: u32,
}

/// Full resolution image data
#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FullImageModel {
    pub image_name: String,
    pub base64_image: String,
    pub image_size_bytes: u64,
    pub width: u32,
    pub height: u32,
}
