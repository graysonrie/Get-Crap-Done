use std::sync::Arc;

use super::*;
use crate::services::app_save_service::AppSaveService;

pub struct ProjectsService {
    app_save: Arc<AppSaveService>,
    pub image_loader: ImageLoaderComponent,
    pub image_evals: ImageEvaluationsComponent,
}

impl ProjectsService {
    pub fn new(app_save: Arc<AppSaveService>) -> Self {
        let image_loader = ImageLoaderComponent::new(app_save.clone());
        let image_evals = ImageEvaluationsComponent::new(app_save.clone());
        Self {
            app_save,
            image_loader,
            image_evals,
        }
    }

    /// Creates a new project and opens it
    pub fn new_project(&self, project_name: &str) -> Result<ProjectInfoModel, String> {
        let relative_path = format!("projects/{project_name}");
        let images_path = format!("projects/{project_name}/images");
        let info_path = format!("projects/{project_name}/info.imgreader");

        self.app_save.ensure_folder_created(&relative_path);
        self.app_save.ensure_folder_created(&images_path);

        let model = ProjectInfoModel {
            project_name: project_name.to_string(),
        };
        self.app_save
            .save_json(&info_path, &model)
            .map_err(|e| e.to_string())?;

        // let project = Project::new(model.clone());
        // let mut l = self.active_project.lock().await;
        // *l = Some(project);

        Ok(model)
    }

    pub fn get_project(&self, project_name: &str) -> Result<ProjectInfoModel, String> {
        let info_path = format!("projects/{project_name}/info.imgreader");
        let info = self.app_save.read_json::<ProjectInfoModel>(&info_path)?;
        Ok(info)
    }

    pub fn get_project_names(&self) -> Result<Vec<String>, String> {
        let relative_path = "projects";
        let items = self.app_save.get_items_in_folder(relative_path)?;
        let items = items
            .iter()
            .filter(|p| p.is_dir())
            .filter_map(|p| p.file_name())
            .map(|name| name.to_string_lossy().to_string())
            .collect();
        Ok(items)
    }
}
