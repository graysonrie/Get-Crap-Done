use std::collections::HashSet;
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
        let mut used_names: HashSet<String> = HashSet::new();

        const UNKNOWN_SUFFIX: &str = "_UNKNOWN";

        for eval in evaluations.iter() {
            if let Some(ref res) = eval.result {
                let original_path = Path::new(&res.original_image_path);
                let suffix = res
                    .new_suggested_filepath_suffix
                    .as_deref()
                    .unwrap_or(UNKNOWN_SUFFIX);
                let stem = original_path
                    .file_stem()
                    .map(|s| s.to_string_lossy().to_string())
                    .unwrap_or_default();
                let ext = original_path.extension().map(|e| e.to_string_lossy().to_string());
                let base_without_ext = format!("{}{}", stem, suffix);
                let base_name = match &ext {
                    Some(e) => format!("{}.{}", base_without_ext, e),
                    None => base_without_ext.clone(),
                };
                let mut candidate = base_name.clone();
                let mut counter = 2u32;
                while used_names.contains(&candidate)
                    || out_dir.join(&candidate).exists()
                {
                    candidate = match &ext {
                        Some(e) => format!("{}_{}.{}", base_without_ext, counter, e),
                        None => format!("{}_{}", base_without_ext, counter),
                    };
                    counter += 1;
                }
                used_names.insert(candidate.clone());
                let new_file_path = out_dir.join(&candidate);
                if let Err(e) = fs::copy(original_path, new_file_path) {
                    log::error!("Error exporting evaluated image: {e}");
                    errors.push(e.to_string());
                }
            }
        }

        Ok(errors)
    }
}
