use std::sync::Arc;

use tauri::State;

use crate::services::projects_service::{
    FullImageModel, ImagePreviewModel, ProjectInfoModel, ProjectsService,
};

#[tauri::command]
pub fn new_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<ProjectInfoModel, String> {
    service.new_project(project_name)
}

#[tauri::command]
pub fn get_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<ProjectInfoModel, String> {
    service.get_project(project_name)
}

#[tauri::command]
pub fn get_project_names(service: State<'_, Arc<ProjectsService>>) -> Result<Vec<String>, String> {
    service.get_project_names()
}

#[tauri::command]
pub async fn get_image_previews_in_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<Vec<ImagePreviewModel>, String> {
    service.get_image_previews_in_project(project_name).await
}

#[tauri::command]
pub async fn load_image_from_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_name: &str,
) -> Result<FullImageModel, String> {
    service
        .load_image_from_project(project_name, image_name)
        .await
}

#[tauri::command]
pub async fn import_images_to_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_paths: Vec<String>,
) -> Result<(), String> {
    service
        .import_images_to_project(project_name, image_paths)
        .await
}

#[tauri::command]
pub async fn delete_images_from_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_names: Vec<String>,
) -> Result<(), String> {
    service
        .delete_images_from_project(project_name, image_names)
        .await
}
