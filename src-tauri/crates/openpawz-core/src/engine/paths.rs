// Paw Engine — Centralized path management
//
// All paths under the Paw data root are resolved through this module.
// Default roots are namespaced per installed app variant so personal and
// enterprise builds can coexist without sharing engine state.
//
// Users can override the active variant's root via a redirect file at
// `{default_root}/storage.conf` (single line: the new root path).

use std::path::PathBuf;
use std::sync::RwLock;

/// Cached override for the data root, loaded from `~/.paw/storage.conf`.
/// `None` → use default `~/.paw/`.  `Some(path)` → user-configured root.
static DATA_ROOT_OVERRIDE: RwLock<Option<PathBuf>> = RwLock::new(None);

const BUILD_EDITION: Option<&str> = option_env!("OPENPAWZ_BUILD_EDITION");
const BRAND_ID: Option<&str> = option_env!("OPENPAWZ_BRAND_ID");

pub fn install_namespace() -> String {
    let brand = BRAND_ID.unwrap_or("taiji").trim().to_ascii_lowercase();
    let edition = BUILD_EDITION.unwrap_or("").trim().to_ascii_lowercase();
    match edition.as_str() {
        "enterprise" => format!("{brand}-enterprise"),
        _ => brand,
    }
}

fn namespaced_hidden_dir(prefix: &str) -> PathBuf {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    home.join(format!(".{}-{}", prefix, install_namespace()))
}

/// The fixed location of the redirect file for the active install namespace.
fn storage_conf_path() -> Option<PathBuf> {
    Some(default_data_dir().join("storage.conf"))
}

/// Load the data root override from `{default_root}/storage.conf`.
/// Called once at app startup (before SessionStore::open).
pub fn load_data_root_from_conf() {
    if let Some(conf) = storage_conf_path() {
        if conf.exists() {
            if let Ok(content) = std::fs::read_to_string(&conf) {
                let trimmed = content.trim().to_string();
                if !trimmed.is_empty() {
                    let pb = PathBuf::from(&trimmed);
                    if pb.exists() || std::fs::create_dir_all(&pb).is_ok() {
                        log::info!("[paths] Custom data root loaded: {}", trimmed);
                        set_data_root_override(Some(pb));
                        return;
                    }
                    log::warn!(
                        "[paths] Custom data root '{}' is invalid, falling back to default",
                        trimmed
                    );
                }
            }
        }
    }
    log::info!(
        "[paths] Using default data root ({})",
        default_data_dir().display()
    );
}

/// Persist the data root override to the active install namespace's storage.conf.
pub fn save_data_root_to_conf(path: Option<&str>) -> Result<(), String> {
    let conf = storage_conf_path().ok_or("Cannot determine home directory")?;
    // Ensure the active default root exists
    if let Some(parent) = conf.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Cannot create '{}': {}", parent.display(), e))?;
    }
    match path {
        Some(p) if !p.is_empty() => {
            std::fs::write(&conf, p).map_err(|e| format!("Cannot write storage.conf: {}", e))?;
        }
        _ => {
            // Remove the file to reset to default
            if conf.exists() {
                std::fs::remove_file(&conf).ok();
            }
        }
    }
    Ok(())
}

/// Set the data root override (called once at startup from the stored config).
pub fn set_data_root_override(path: Option<PathBuf>) {
    let mut w = DATA_ROOT_OVERRIDE.write().unwrap();
    *w = path;
}

/// Get the current data root override (for reporting to the frontend).
pub fn get_data_root_override() -> Option<PathBuf> {
    DATA_ROOT_OVERRIDE.read().unwrap().clone()
}

// ── Root ───────────────────────────────────────────────────────────────

/// The default data root for the active install namespace.
pub fn default_data_dir() -> PathBuf {
    namespaced_hidden_dir("paw")
}

/// The root data directory for all Paw engine data.
/// Defaults to `~/.paw/`, overridable via Settings → Storage.
pub fn paw_data_dir() -> PathBuf {
    // Check override first
    if let Some(ref p) = *DATA_ROOT_OVERRIDE.read().unwrap() {
        return p.clone();
    }
    default_data_dir()
}

/// Shared root for n8n/Node artifacts for the active install namespace.
pub fn openpawz_data_dir() -> PathBuf {
    namespaced_hidden_dir("openpawz")
}

// ── Derived paths ──────────────────────────────────────────────────────

/// Engine SQLite database: `{data_root}/engine.db`
pub fn engine_db_path() -> PathBuf {
    let dir = paw_data_dir();
    std::fs::create_dir_all(&dir).ok();
    dir.join("engine.db")
}

/// Per-agent workspace: `{data_root}/workspaces/{agent_id}/`
pub fn agent_workspace_dir(agent_id: &str) -> PathBuf {
    paw_data_dir().join("workspaces").join(agent_id)
}

/// TOML skills directory: `{data_root}/skills/`
pub fn skills_dir() -> Option<PathBuf> {
    Some(paw_data_dir().join("skills"))
}

/// Browser profile directory: `{data_root}/browser-profiles/{profile_id}/`
pub fn browser_profile_dir(profile_id: &str) -> PathBuf {
    paw_data_dir().join("browser-profiles").join(profile_id)
}

/// Agent workspaces base: `{data_root}/workspaces/`
pub fn workspaces_base_dir() -> PathBuf {
    paw_data_dir().join("workspaces")
}
