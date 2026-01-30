use ocr_image_thing::ImageEvaluationResult;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ImageEvaluation {
    /// The file name (NOT THE FULL PATH) of the image that was evaluated
    pub image_name: String,
    pub result: Option<ImageEvaluationResult>,
    /// The reason the evaluation failed (if any)
    pub fail_reason: Option<String>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInfoModel {
    pub project_name: String,
    /// Unix timestamp (seconds) when the project was last opened. None for older projects.
    #[serde(default)]
    pub last_opened_at: Option<u64>,
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
