use std::{collections::HashMap, io::Cursor, path::PathBuf, sync::Arc};

use base64::{engine::general_purpose::STANDARD, Engine};
use fast_image_resize::{images::Image, ResizeAlg, ResizeOptions, Resizer};
use futures::future::join_all;
use image::{codecs::jpeg::JpegEncoder, GenericImageView, ImageReader};
use tauri::AppHandle;
use tokio::sync::RwLock;

use crate::services::{
    app_save_service::AppSaveService,
    projects_service::{FullImageModel, ImagePreviewModel, ProjectInfoModel},
};

/// Max dimension for preview thumbnails
const PREVIEW_MAX_SIZE: u32 = 200;

/// Cache key format: "project_name/image_name"
type ImageCacheKey = String;

pub struct ProjectsService {
    #[allow(dead_code)]
    handle: AppHandle,
    app_save: Arc<AppSaveService>,
    /// Cache for full resolution images
    full_image_cache: RwLock<HashMap<ImageCacheKey, FullImageModel>>,
    /// Cache for image previews
    preview_cache: RwLock<HashMap<ImageCacheKey, ImagePreviewModel>>,
}

impl ProjectsService {
    pub fn new(handle: AppHandle, app_save: Arc<AppSaveService>) -> Self {
        Self {
            handle,
            app_save,
            full_image_cache: RwLock::new(HashMap::new()),
            preview_cache: RwLock::new(HashMap::new()),
        }
    }

    fn cache_key(project_name: &str, image_name: &str) -> ImageCacheKey {
        format!("{}/{}", project_name, image_name)
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

    pub async fn import_images_to_project(
        &self,
        project_name: &str,
        image_paths: Vec<String>,
    ) -> Result<(), String> {
        for image_path in image_paths {
            let source_path = std::path::Path::new(&image_path);
            let file_name = source_path
                .file_name()
                .ok_or_else(|| format!("Invalid file path: {}", image_path))?
                .to_string_lossy();
            let new_image_path = format!("projects/{project_name}/images/{file_name}");
            self.app_save.copy_file(&image_path, &new_image_path)?;
        }

        // Clear preview cache for this project to ensure new images are loaded
        self.clear_project_cache(project_name).await;

        Ok(())
    }

    /// Deletes images from a project
    pub async fn delete_images_from_project(
        &self,
        project_name: &str,
        image_names: Vec<String>,
    ) -> Result<(), String> {
        for image_name in &image_names {
            let image_path = format!("projects/{project_name}/images/{image_name}");
            self.app_save.delete_file(&image_path)?;

            // Remove from caches
            let key = Self::cache_key(project_name, image_name);
            {
                let mut cache = self.preview_cache.write().await;
                cache.remove(&key);
            }
            {
                let mut cache = self.full_image_cache.write().await;
                cache.remove(&key);
            }
        }

        Ok(())
    }

    /// Clears cached data for a specific project
    async fn clear_project_cache(&self, project_name: &str) {
        let prefix = format!("{}/", project_name);

        {
            let mut cache = self.preview_cache.write().await;
            cache.retain(|k, _| !k.starts_with(&prefix));
        }

        {
            let mut cache = self.full_image_cache.write().await;
            cache.retain(|k, _| !k.starts_with(&prefix));
        }
    }

    /// Returns image previews (thumbnails) for all images in a project
    /// Uses caching and parallel processing for better performance
    pub async fn get_image_previews_in_project(
        &self,
        project_name: &str,
    ) -> Result<Vec<ImagePreviewModel>, String> {
        let images_path = format!("projects/{project_name}/images");
        let image_paths = self.app_save.get_items_in_folder(&images_path)?;

        // Filter to only files
        let file_paths: Vec<PathBuf> = image_paths.into_iter().filter(|p| p.is_file()).collect();

        // Check cache for existing previews
        let cache = self.preview_cache.read().await;
        let mut cached_previews = Vec::new();
        let mut uncached_paths = Vec::new();

        for path in file_paths {
            let image_name = path
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_default();

            let key = Self::cache_key(project_name, &image_name);
            if let Some(preview) = cache.get(&key) {
                cached_previews.push(preview.clone());
            } else {
                uncached_paths.push((path, image_name));
            }
        }
        drop(cache);

        // Process uncached images in parallel
        let project_name_owned = project_name.to_string();
        let tasks: Vec<_> = uncached_paths
            .into_iter()
            .map(|(path, image_name)| {
                let project_name = project_name_owned.clone();
                async move { Self::generate_preview_async(path, image_name, project_name).await }
            })
            .collect();

        let results = join_all(tasks).await;

        // Collect new previews and update cache
        let mut new_previews = Vec::new();
        for result in results {
            match result {
                Ok((preview, key)) => {
                    new_previews.push((preview, key));
                }
                Err(e) => {
                    log::warn!("Failed to generate preview: {}", e);
                }
            }
        }

        // Update cache with new previews
        if !new_previews.is_empty() {
            let mut cache = self.preview_cache.write().await;
            for (preview, key) in &new_previews {
                cache.insert(key.clone(), preview.clone());
            }
        }

        // Combine cached and new previews
        let mut all_previews = cached_previews;
        all_previews.extend(new_previews.into_iter().map(|(p, _)| p));

        Ok(all_previews)
    }

    /// Generate a preview asynchronously (for parallel processing)
    async fn generate_preview_async(
        path: PathBuf,
        image_name: String,
        project_name: String,
    ) -> Result<(ImagePreviewModel, ImageCacheKey), String> {
        println!("Generating preview for {}", image_name);
        let path_clone = path.clone();
        let preview = tokio::task::spawn_blocking(move || Self::generate_preview(&path_clone))
            .await
            .map_err(|e| e.to_string())?
            .map_err(|e| format!("Failed to generate preview for {}: {}", image_name, e))?;

        let metadata = tokio::fs::metadata(&path)
            .await
            .map_err(|e| e.to_string())?;

        let key = Self::cache_key(&project_name, &image_name);
        let model = ImagePreviewModel {
            image_name,
            base64_preview: preview.0,
            image_size_bytes: metadata.len(),
            width: preview.1,
            height: preview.2,
        };
        println!("Generated preview successfully");
        Ok((model, key))
    }

    /// Loads a full resolution image from a project (with caching)
    pub async fn load_image_from_project(
        &self,
        project_name: &str,
        image_name: &str,
    ) -> Result<FullImageModel, String> {
        let key = Self::cache_key(project_name, image_name);

        // Check cache first
        {
            let cache = self.full_image_cache.read().await;
            if let Some(cached) = cache.get(&key) {
                return Ok(cached.clone());
            }
        }

        // Load from disk
        let image_path = format!("projects/{project_name}/images/{image_name}");
        let full_path = self.app_save.get_full_path(&image_path);

        let image_bytes = tokio::fs::read(&full_path)
            .await
            .map_err(|e| format!("Failed to read image: {}", e))?;

        let metadata = tokio::fs::metadata(&full_path)
            .await
            .map_err(|e| e.to_string())?;

        // Get dimensions without loading full image into memory twice
        let bytes_clone = image_bytes.clone();
        let (width, height) = tokio::task::spawn_blocking(move || {
            image::load_from_memory(&bytes_clone)
                .map(|img| img.dimensions())
                .unwrap_or((0, 0))
        })
        .await
        .map_err(|e| e.to_string())?;

        let base64_image = STANDARD.encode(&image_bytes);

        let model = FullImageModel {
            image_name: image_name.to_string(),
            base64_image,
            image_size_bytes: metadata.len(),
            width,
            height,
        };

        // Store in cache
        {
            let mut cache = self.full_image_cache.write().await;
            cache.insert(key, model.clone());
        }

        Ok(model)
    }

    /// Generates a thumbnail preview from an image path using fast_image_resize
    /// Returns (base64_preview, original_width, original_height)
    fn generate_preview(path: &std::path::Path) -> Result<(String, u32, u32), String> {
        // Use ImageReader for potentially faster loading
        let img = ImageReader::open(path)
            .map_err(|e| e.to_string())?
            .decode()
            .map_err(|e| e.to_string())?;

        let (width, height) = img.dimensions();

        // Calculate thumbnail dimensions maintaining aspect ratio
        let (thumb_width, thumb_height) = if width > height {
            let ratio = PREVIEW_MAX_SIZE as f32 / width as f32;
            (PREVIEW_MAX_SIZE, (height as f32 * ratio) as u32)
        } else {
            let ratio = PREVIEW_MAX_SIZE as f32 / height as f32;
            ((width as f32 * ratio) as u32, PREVIEW_MAX_SIZE)
        };

        // Skip resize if image is already small enough
        let thumbnail = if width <= PREVIEW_MAX_SIZE && height <= PREVIEW_MAX_SIZE {
            img.to_rgba8()
        } else {
            // Use fast_image_resize for SIMD-accelerated resizing
            let src_image = img.to_rgba8();

            let src = Image::from_vec_u8(
                width,
                height,
                src_image.into_raw(),
                fast_image_resize::PixelType::U8x4,
            )
            .map_err(|e| e.to_string())?;

            let mut dst = Image::new(
                thumb_width,
                thumb_height,
                fast_image_resize::PixelType::U8x4,
            );

            let mut resizer = Resizer::new();
            // Use nearest neighbor for speed, or Bilinear for slightly better quality
            let options = ResizeOptions::new().resize_alg(ResizeAlg::Nearest);
            resizer
                .resize(&src, &mut dst, &options)
                .map_err(|e| e.to_string())?;

            image::RgbaImage::from_raw(thumb_width, thumb_height, dst.into_vec())
                .ok_or("Failed to create thumbnail image")?
        };

        // Encode as JPEG with lower quality for speed
        let mut buffer = Cursor::new(Vec::new());
        let mut encoder = JpegEncoder::new_with_quality(&mut buffer, 70);
        encoder
            .encode_image(&thumbnail)
            .map_err(|e| e.to_string())?;

        let base64_preview = STANDARD.encode(buffer.into_inner());
        Ok((base64_preview, width, height))
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
