#[derive(serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestImageEvaluation {
    /// Image names that are already in the project
    pub image_names: Vec<String>,
    pub openai_api_key: String,
}
