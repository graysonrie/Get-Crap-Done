use std::{path::Path, sync::Arc};

use ocr_image_thing::ImageEvalClient;

use crate::services::{
    app_save_service::AppSaveService,
    projects_service::{models::ImageEvaluation, requests::RequestImageEvaluation},
};

pub struct ImageEvaluationsComponent {
    app_save: Arc<AppSaveService>,
    client: ImageEvalClient,
}

impl ImageEvaluationsComponent {
    pub fn new(app_save: Arc<AppSaveService>) -> Self {
        let client = ocr_image_thing::ImageEvalClient::new();
        Self { app_save, client }
    }

    pub async fn evaluate_images(
        &self,
        project_name: &str,
        request: RequestImageEvaluation,
    ) -> Result<Vec<ImageEvaluation>, String> {
        self.client.set_api_key(&request.openai_api_key).await;

        // Get the full path to the project images (get_items_in_folder returns full paths)
        let all_proj_images = self
            .app_save
            .get_items_in_folder(&format!("projects/{project_name}/images"))?;
        let selected_images: Vec<String> = all_proj_images
            .iter()
            .filter(|path| path.is_file())
            .filter(|path| {
                path.file_name()
                    .map(|n| request.image_names.contains(&n.to_string_lossy().to_string()))
                    .unwrap_or(false)
            })
            .map(|path| path.to_string_lossy().to_string())
            .collect();

        if selected_images.is_empty() {
            return Err(format!(
                "No matching images found in project. Requested: {:?}",
                request.image_names
            ));
        }

        let eval_results = self.client.evaluate_images(selected_images).await;

        let current_evals = self.read_images_eval_json(project_name)?;
        let mut new_evals = Vec::new();

        for result in eval_results {
            let image_file_name = Path::new(&result.full_image_path)
                .file_name()
                .unwrap()
                .to_string_lossy()
                .to_string();
            let new_eval = ImageEvaluation {
                image_name: image_file_name,
                result: result.success_result,
                fail_reason: result.failure_result,
            };
            new_evals.push(new_eval);
        }
        // Overwrite or add to the current evals:
        // Ensure new_evals with the same image_name as old ones overwrite the old evaluations
        let mut eval_map: std::collections::HashMap<String, ImageEvaluation> = current_evals
            .into_iter()
            .map(|eval| (eval.image_name.clone(), eval))
            .collect();

        for eval in new_evals {
            eval_map.insert(eval.image_name.clone(), eval); // Overwrite or insert
        }

        let all_new_evals: Vec<ImageEvaluation> = eval_map.into_values().collect();

        self.write_images_eval_json(project_name, &all_new_evals)?;

        Ok(all_new_evals)
    }

    /// Read the existing evaluated images for the project.
    /// Returns an empty vec if the file does not exist (e.g. first evaluation for the project).
    pub fn read_images_eval_json(
        &self,
        project_name: &str,
    ) -> Result<Vec<ImageEvaluation>, String> {
        let evals_path = format!("projects/{project_name}/image_evals.json");
        let full_path = self.app_save.get_full_path(&evals_path);
        if full_path.exists() {
            self.app_save.read_json(&evals_path)
        } else {
            Ok(Vec::new())
        }
    }

    pub fn write_images_eval_json(
        &self,
        project_name: &str,
        evals: &Vec<ImageEvaluation>,
    ) -> Result<(), String> {
        let evals_path = format!("projects/{project_name}/image_evals.json");
        self.app_save.save_json(&evals_path, evals)
    }

    /// Removes saved evaluations for the given image names (e.g. when those images are deleted).
    pub fn remove_evaluations_for_images(
        &self,
        project_name: &str,
        image_names: &[String],
    ) -> Result<(), String> {
        if image_names.is_empty() {
            return Ok(());
        }
        let current = self.read_images_eval_json(project_name)?;
        let names_set: std::collections::HashSet<_> =
            image_names.iter().map(String::as_str).collect();
        let kept: Vec<ImageEvaluation> = current
            .into_iter()
            .filter(|e| !names_set.contains(e.image_name.as_str()))
            .collect();
        self.write_images_eval_json(project_name, &kept)?;
        Ok(())
    }
}
