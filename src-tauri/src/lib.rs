mod db_settings;

// Schema creation now happens from the JS side (src/lib/db.ts runs the
// idempotent migration SQL after every `Database.load`), since the database
// path is user-configurable at runtime and can't be pinned to a single
// identifier at build time the way tauri-plugin-sql's migration API expects.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .plugin(tauri_plugin_process::init())
    .invoke_handler(tauri::generate_handler![
      db_settings::get_db_path,
      db_settings::set_db_path,
      db_settings::reset_db_path,
      db_settings::import_db,
      db_settings::export_db,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
