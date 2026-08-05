use std::fs;

/// Writes arbitrary bytes to a path the user already picked via a save
/// dialog. Used for exports (Lernkontrolle-Vorlagen, Berichte) that build
/// their content in JS as a Blob — the JS-side `writeFile` from
/// `@tauri-apps/plugin-fs` is scoped to `$APPDATA/**` and can't reach a
/// user-chosen destination, so the write happens here instead.
#[tauri::command]
pub fn write_binary_file(path: String, data: Vec<u8>) -> Result<(), String> {
  fs::write(&path, data).map_err(|e| e.to_string())
}
