use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

const CONFIG_FILE: &str = "db-settings.json";
const LEGACY_DB_FILE: &str = "lezio.db";

#[derive(Serialize, Deserialize, Default)]
struct DbSettings {
  db_path: Option<String>,
}

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
  let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
  fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
  Ok(dir.join(CONFIG_FILE))
}

fn read_settings(app: &AppHandle) -> Result<DbSettings, String> {
  let path = config_path(app)?;
  if !path.exists() {
    return Ok(DbSettings::default());
  }
  let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
  serde_json::from_str(&raw).map_err(|e| e.to_string())
}

fn write_settings(app: &AppHandle, settings: &DbSettings) -> Result<(), String> {
  let path = config_path(app)?;
  let raw = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
  fs::write(&path, raw).map_err(|e| e.to_string())
}

/// A configured path is only usable if its parent directory still exists —
/// SQLite recreates a missing database *file*, but not a missing directory.
/// Without this check a stale path (moved/deleted folder) leaves the app
/// "configured" but unable to ever open a connection.
fn is_usable(path: &str) -> bool {
  PathBuf::from(path)
    .parent()
    .map(|p| p.as_os_str().is_empty() || p.is_dir())
    .unwrap_or(false)
}

/// Versions up to 0.2.x defaulted to `<app_data_dir>/lezio.db` when the user
/// had never picked a location explicitly. That default is gone, so an
/// upgrading user would be sent to the first-run setup with their existing
/// data left orphaned on disk. Adopt it instead.
fn legacy_db_path(app: &AppHandle) -> Option<PathBuf> {
  let path = app.path().app_data_dir().ok()?.join(LEGACY_DB_FILE);
  path.is_file().then_some(path)
}

/// Resolves the database path to use, adopting (and persisting) the legacy
/// default location when there is nothing usable configured. Returns `None`
/// only when the user genuinely has to pick a location.
fn resolve_db_path(app: &AppHandle) -> Result<Option<String>, String> {
  if let Some(path) = read_settings(app)?.db_path {
    if is_usable(&path) {
      return Ok(Some(path));
    }
  }
  match legacy_db_path(app) {
    Some(legacy) => {
      let path = legacy.to_string_lossy().to_string();
      write_settings(app, &DbSettings { db_path: Some(path.clone()) })?;
      Ok(Some(path))
    }
    None => Ok(None),
  }
}

/// Returns the database path to open, or `None` if the user hasn't picked one
/// yet (first launch — no default location is assumed).
#[tauri::command]
pub fn get_db_path(app: AppHandle) -> Result<Option<String>, String> {
  resolve_db_path(&app)
}

fn require_db_path(app: &AppHandle) -> Result<String, String> {
  resolve_db_path(app)?.ok_or_else(|| "Kein Datenbankpfad konfiguriert.".to_string())
}

/// Points the app at an existing or new database file. Does not touch the
/// file itself — the caller is responsible for closing any open connection
/// to the previous database before switching.
#[tauri::command]
pub fn set_db_path(app: AppHandle, path: String) -> Result<(), String> {
  let target = PathBuf::from(&path);
  if let Some(parent) = target.parent() {
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
  }
  write_settings(&app, &DbSettings { db_path: Some(path) })
}

/// Copies an existing database file onto the currently configured db path,
/// replacing its contents. The caller must close the active connection first.
#[tauri::command]
pub fn import_db(app: AppHandle, source: String) -> Result<(), String> {
  let current = require_db_path(&app)?;
  fs::copy(&source, &current).map_err(|e| e.to_string())?;
  Ok(())
}

/// Copies the currently configured database file to the given destination.
#[tauri::command]
pub fn export_db(app: AppHandle, dest: String) -> Result<(), String> {
  let current = require_db_path(&app)?;
  fs::copy(&current, &dest).map_err(|e| e.to_string())?;
  Ok(())
}
