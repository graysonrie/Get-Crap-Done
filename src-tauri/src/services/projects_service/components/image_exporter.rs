use std::{fs, path::Path};

use crate::services::projects_service::models::ImageEvaluation;

#[derive(Default)]
pub struct ImageExporterComponent {}

impl ImageExporterComponent {
    /// Exports the evaluated images with their new filename suffixes
    ///
    /// Return a list of any errors that were encountered during export
    pub fn export_evaluated_images(
        &self,
        evaluations: Vec<ImageEvaluation>,
        output_dir_path: &str,
    ) -> Result<Vec<String>, std::io::Error> {
        let out_dir = Path::new(output_dir_path);
        fs::create_dir_all(out_dir)?;
        let mut errors = Vec::new();

        for eval in evaluations.iter() {
            if let Some(ref res) = eval.result {
                let original_path = Path::new(&res.original_image_path);
                if let Some(original_file_name) = original_path.file_name() {
                    if let Some(ref suffix) = res.new_suggested_filepath_suffix {
                        let new_file_name =
                            original_file_name.to_string_lossy().to_string() + suffix;
                        let new_file_path = out_dir.join(new_file_name);
                        if let Err(e) = fs::copy(original_path, new_file_path) {
                            log::error!("Error exporting evaluated image: {e}");
                            errors.push(e.to_string());
                        }
                    }
                }
            }
        }

        Ok(errors)
    }
}
