// Agent Templates — Remote Configuration System
// Manages local and remote templates with version sync capabilities

use crate::atoms::types::AgentTemplate;
use crate::engine::state::EngineState;
use serde::{Deserialize, Serialize};
use tauri::State;

// ── Query Operations ──────────────────────────────────────────────

/// List all agent templates from the database.
/// Optionally filter by category.
#[tauri::command]
pub fn list_agent_templates(
    state: State<'_, EngineState>,
    category: Option<String>,
) -> Result<Vec<AgentTemplate>, String> {
    state
        .store
        .list_agent_templates(category.as_deref())
        .map_err(|e| e.to_string())
}

/// Search agent templates by query string.
#[tauri::command]
pub fn search_agent_templates(
    state: State<'_, EngineState>,
    query: String,
) -> Result<Vec<AgentTemplate>, String> {
    state
        .store
        .search_agent_templates(&query)
        .map_err(|e| e.to_string())
}

// ── Install Operations ────────────────────────────────────────────

/// Install an agent from a template.
/// Creates a new agent record with the template's configuration.
#[tauri::command]
pub fn install_agent_template(
    state: State<'_, EngineState>,
    template_id: String,
) -> Result<String, String> {
    state
        .store
        .install_agent_template(&template_id)
        .map_err(|e| e.to_string())
}

// ── Seed Operations ───────────────────────────────────────────────

/// Seed builtin templates into the database.
/// Called once on first startup to populate the catalog.
#[tauri::command]
pub fn seed_builtin_templates(state: State<'_, EngineState>) -> Result<(), String> {
    // Using u64 -> () conversion since seed_builtin_agent_templates returns u64
    state
        .store
        .seed_builtin_agent_templates()
        .map(|_| ())  // Convert u64 to ()
        .map_err(|e| e.to_string())
}

// ── Remote Synchronization ────────────────────────────────────────

/// Structure for the remote template registry JSON format.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteRegistry {
    pub version: String,
    pub templates: Vec<AgentTemplate>,
}

/// Fetch the remote templates registry from a URL.
/// Default URL: https://raw.githubusercontent.com/OpenPawz/openpawz/main/templates/registry.json
#[tauri::command(async)]
pub async fn fetch_remote_templates_registry(
    state: State<'_, EngineState>,
    url: Option<String>,
) -> Result<Vec<RemoteTemplateSummary>, String> {
    use reqwest::Client;
    
    // Use default URL if none provided
    let registry_url = url.unwrap_or_else(|| 
        "https://raw.githubusercontent.com/OpenPawz/openpawz/main/templates/registry.json".to_string()
    );
    
    // Verify it's a HTTPS URL for security
    if !registry_url.starts_with("https://") {
        return Err("Registry URL must use HTTPS for security".to_string());
    }

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    let response = client
        .get(&registry_url)
        .header("User-Agent", "OpenPawz/1.0")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch remote registry: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Remote registry returned HTTP {}", response.status()));
    }

    let registry: RemoteRegistry = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse remote registry JSON: {}", e))?;

    // Validate all templates have required fields
    for template in &registry.templates {
        if template.id.is_empty() || template.version.is_empty() {
            return Err("Invalid template in remote registry: missing id or version".to_string());
        }
    }

    // Compare with local templates and find which ones need update
    let mut template_summaries = Vec::new();
    for remote_template in registry.templates {
        // Check if template exists locally and get version info
        let local_exists = state.store.template_exists(&remote_template.id).map_err(|e| e.to_string())?;
        
        if local_exists {
            let local_template = state.store.get_agent_template_by_id(&remote_template.id)
                .map_err(|e| e.to_string())?;
            
            // Compare versions
            let needs_update = compare_versions(&remote_template.version, &local_template.version) > 0;
            
            template_summaries.push(RemoteTemplateSummary {
                template: remote_template,
                local_version: Some(local_template.version.clone()),
                needs_update,
            });
        } else {
            // New template that doesn't exist locally
            template_summaries.push(RemoteTemplateSummary {
                template: remote_template,
                local_version: None,
                needs_update: true,  // Always update for new templates
            });
        }
    }

    Ok(template_summaries)
}

/// Compare version strings (semantic versioning format: major.minor.patch)
/// Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
fn compare_versions(v1: &str, v2: &str) -> i32 {
    let parse_version = |v: &str| -> Vec<u32> {
        v.split('.')
            .take(3)  // Take major.minor.patch
            .map(|part| part.parse::<u32>().unwrap_or(0))
            .collect()
    };
    
    let ver1_parts = parse_version(v1);
    let ver2_parts = parse_version(v2);
    let max_len = ver1_parts.len().max(ver2_parts.len());
    
    for i in 0..max_len {
        let part1 = ver1_parts.get(i).unwrap_or(&0);
        let part2 = ver2_parts.get(i).unwrap_or(&0);
        
        if part1 < part2 {
            return -1;
        } else if part1 > part2 {
            return 1;
        }
    }
    
    0  // Equal versions
}

/// Summary struct for remote template comparison
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteTemplateSummary {
    pub template: AgentTemplate,
    pub local_version: Option<String>,
    pub needs_update: bool,
}

/// Synchronize templates from remote registry.
/// Downloads any templates that need updates compared to local versions.
#[tauri::command(async)]
pub async fn sync_templates_from_remote(
    state: State<'_, EngineState>,
    remote_templates: Vec<AgentTemplate>,
) -> Result<TemplateSyncResult, String> {
    let mut updated_count = 0;
    let mut error_count = 0;
    let mut errors = Vec::new();

    for template in remote_templates {
        let template_id = template.id.clone(); // Clone just the ID to use in error reporting
        
        match state.store.sync_agent_template_from_remote(template) {
            Ok(_) => {
                updated_count += 1;
            }
            Err(e) => {
                error_count += 1;
                errors.push(format!("Failed to sync template '{}': {}", template_id, e));
            }
        }
    }

    Ok(TemplateSyncResult {
        success: true,
        updated_count,
        error_count,
        errors,
    })
}

/// Result of template synchronization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateSyncResult {
    pub success: bool,
    pub updated_count: usize,
    pub error_count: usize,
    pub errors: Vec<String>,
}

// ── Admin Template Management ────────────────────────────────────────────

// Helper function to determine admin status
// In a real implementation, we would validate against JWT, session, or configuration
fn check_admin_permission(state: &State<'_, EngineState>) -> Result<(), String> {
    // Try to check admin status through various possible methods
    
    // 1. Check configuration setting from state/store
    if let Ok(config_json) = state.store.get_config("admin_config") {
        if let Some(config_str) = config_json {
            if let Ok(config) = serde_json::from_str::<serde_json::Value>(&config_str) {
                if config.get("is_admin").and_then(|v| v.as_bool()).unwrap_or(false) {
                    return Ok(());
                }
            }
        }
    }

    // 2. Check if DEBUG_ADMIN flag is true in configuration
    let config_lock = state.config.lock();
    if let Ok(debug_admin_str) = state.store.get_config("debug_settings") {
        if let Some(debug_settings) = debug_admin_str {
            let debug_val: serde_json::Value = serde_json::from_str(&debug_settings).unwrap_or_default();
            if debug_val.get("admin_by_pass").and_then(|v| v.as_bool()).unwrap_or(false) {
                return Ok(());
            }
        }
    }

    // For development/initial implementation purposes - in real usage would need real authentication
    if cfg!(debug_assertions) {
        return Ok(());
    }
    
    Err("Access denied. Admin role required.".to_string())
}

/// Create a new agent template (admin-only).
#[tauri::command]
pub fn create_agent_template(
    state: State<'_, EngineState>,
    template: AgentTemplate,
) -> Result<(), String> {
    // Ensure the caller has admin privileges
    check_admin_permission(&state)?;
    
    // Validate that the template has required fields
    if template.id.is_empty() || template.name.is_empty() || template.description.is_empty() {
        return Err("Template must have id, name, and description".to_string());
    }
    
    state
        .store
        .create_agent_template(template)
        .map_err(|e| e.to_string())
}

/// Update an existing agent template (admin-only).
#[tauri::command]
pub fn update_agent_template(
    state: State<'_, EngineState>,
    template_id: String,
    template: AgentTemplate,
) -> Result<(), String> {
    // Ensure the caller has admin privileges
    check_admin_permission(&state)?;
    
    // Validate that the template has required fields
    if template.name.is_empty() || template.description.is_empty() {
        return Err("Template must have name and description".to_string());
    }
    
    // Ensure the ID in the path matches the template ID
    if template.id != template_id {
        return Err("Template ID in body must match template_id in URL".to_string());
    }
    
    state
        .store
        .update_agent_template(template_id, template)
        .map_err(|e| e.to_string())
}

/// Delete an agent template by ID (admin-only).
#[tauri::command]
pub fn delete_agent_template(
    state: State<'_, EngineState>,
    template_id: String,
) -> Result<(), String> {
    // Ensure the caller has admin privileges
    check_admin_permission(&state)?;
    
    state
        .store
        .delete_agent_template(template_id)
        .map_err(|e| e.to_string())
}