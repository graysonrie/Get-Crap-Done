use std::{path::Path, sync::Arc};

use tauri::{AppHandle, Manager};

use crate::services::{app_save_service::AppSaveService, projects_service::ProjectsService};

pub fn initialize_app(handle: &AppHandle) {
    let handle = handle.clone();

    let app_save_service = Arc::new(AppSaveService::new());
    let projects_service = Arc::new(ProjectsService::new(
        handle.clone(),
        app_save_service.clone(),
    ));
    handle.manage(app_save_service);
    handle.manage(projects_service);
}
