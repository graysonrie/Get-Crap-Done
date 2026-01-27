use std::sync::Arc;

use tauri::State;

use crate::services::projects_service::{
    models::*, requests::RequestImageEvaluation, ProjectsService,
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
    service
        .image_loader
        .get_image_previews_in_project(project_name)
        .await
}

#[tauri::command]
pub async fn load_image_from_project(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    image_name: &str,
) -> Result<FullImageModel, String> {
    service
        .image_loader
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
        .image_loader
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
        .image_loader
        .delete_images_from_project(project_name, image_names.clone())
        .await?;
    service
        .image_evals
        .remove_evaluations_for_images(project_name, &image_names)?;
    Ok(())
}

#[tauri::command]
pub async fn evaluate_images(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
    request: RequestImageEvaluation,
) -> Result<Vec<ImageEvaluation>, String> {
    service
        .image_evals
        .evaluate_images(project_name, request)
        .await
}

/// Get the existing image evaluations for the project
#[tauri::command]
pub async fn get_image_evaluations(
    service: State<'_, Arc<ProjectsService>>,
    project_name: &str,
) -> Result<Vec<ImageEvaluation>, String> {
    service.image_evals.read_images_eval_json(project_name)
}
