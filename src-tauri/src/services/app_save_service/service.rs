use std::{
    fs,
    io::{BufReader, BufWriter},
    path::{Path, PathBuf},
};

use dirs::data_dir;
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::constants;

pub struct AppSaveService {
    pub save_dir: PathBuf,
}

impl AppSaveService {
    pub fn new() -> Self {
        let save_path = AppSaveService::get_save_path_internal();
        if !save_path.exists() {
            fs::create_dir_all(save_path.clone()).expect("could not create App directory");
        }
        Self {
            save_dir: save_path,
        }
    }

    /// Example: `projects\project1`
    pub fn ensure_folder_created(&self, relative_path: &str) {
        let initial_path = self.save_dir.clone();
        let full_path = initial_path.join(Path::new(relative_path));
        if let Err(err) = fs::create_dir_all(full_path) {
            println!("Warning when trying to create dir: {err}")
        }
    }

    /// Returns the full paths of all the items in the folder
    pub fn get_items_in_folder(&self, relative_path: &str) -> Result<Vec<PathBuf>, String> {
        let mut items = Vec::new();
        let full_path = self.save_dir.join(Path::new(relative_path));
        let read_dir = fs::read_dir(full_path).map_err(|e| e.to_string())?;
        for item in read_dir.into_iter().flatten() {
            items.push(item.path())
        }
        Ok(items)
    }

    /// Returns the full path for a relative path
    pub fn get_full_path(&self, relative_path: &str) -> PathBuf {
        self.save_dir.join(Path::new(relative_path))
    }

    /// Example: `projects\project1\thing.json`
    pub fn save_json<T: Serialize>(&self, relative_path: &str, json: &T) -> Result<(), String> {
        let initial_path = self.save_dir.clone();
        let full_path = initial_path.join(Path::new(relative_path));
        let file = fs::File::create(full_path).map_err(|e| e.to_string())?;
        let writer = BufWriter::new(file);

        serde_json::to_writer_pretty(writer, json).map_err(|e| e.to_string())
    }

    pub fn read_file(&self, relative_path: &str) -> Result<String, String> {
        let initial_path = self.save_dir.clone();
        let full_path = initial_path.join(Path::new(relative_path));
        let content = fs::read_to_string(full_path).map_err(|e| e.to_string())?;
        Ok(content)
    }

    pub fn read_json<T: for<'de> Deserialize<'de>>(
        &self,
        relative_path: &str,
    ) -> Result<T, String> {
        let content = self.read_file(relative_path)?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    }

    /// Copies a file from the source path to the destination path
    /// Example: `projects\project1\thing.json`
    pub fn copy_file(&self, source_path: &str, relative_dest_path: &str) -> Result<(), String> {
        let initial_path = self.save_dir.clone();
        let full_path = initial_path.join(Path::new(relative_dest_path));
        fs::copy(source_path, full_path).map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Deletes a file at the relative path
    /// Example: `projects\project1\images\photo.jpg`
    pub fn delete_file(&self, relative_path: &str) -> Result<(), String> {
        let full_path = self.save_dir.join(Path::new(relative_path));
        fs::remove_file(full_path).map_err(|e| e.to_string())
    }

    /// Get the save path for the app from the AppData directory
    fn get_save_path_internal() -> PathBuf {
        let save_path = data_dir().expect("Could not find AppData directory");
        save_path.join(constants::APP_NAME)
    }
}
