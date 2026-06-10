use super::SessionStore;
use crate::atoms::error::EngineResult;
use crate::atoms::types::{AgentTemplate, TemplatePersonality};
use rusqlite::params;
use serde_json;

impl SessionStore {
    /// List all agent templates from the database.
    /// Optionally filter by category.
    pub fn list_agent_templates(&self, category: Option<&str>) -> EngineResult<Vec<AgentTemplate>> {
        let conn = self.conn.lock();
        
        let sql = if let Some(_) = category {
            "SELECT * FROM agent_templates WHERE category = ? ORDER BY popularity DESC, name ASC"
        } else {
            "SELECT * FROM agent_templates ORDER BY popularity DESC, name ASC"
        };

        let mut stmt = conn.prepare(sql)?;
        let mut rows = stmt.query(params![category])?;

        let mut templates = Vec::new();
        while let Some(row) = rows.next()? {
            let template = self.map_agent_template_row(row)?;
            templates.push(template);
        }

        Ok(templates)
    }

    /// Search agent templates by query string.
    pub fn search_agent_templates(&self, query: &str) -> EngineResult<Vec<AgentTemplate>> {
        let conn = self.conn.lock();
        let pattern = format!("%{}%", query);

        let mut stmt = conn.prepare(
            "SELECT * FROM agent_templates 
             WHERE name LIKE ?1 OR description LIKE ?1 OR tags LIKE ?1
             ORDER BY popularity DESC, name ASC",
        )?;
        let mut rows = stmt.query(params![&pattern])?;

        let mut templates = Vec::new();
        while let Some(row) = rows.next()? {
            let template = self.map_agent_template_row(row)?;
            templates.push(template);
        }

        Ok(templates)
    }

    /// Install an agent from a template.
    /// Creates a new agent record with the template's configuration.
    pub fn install_agent_template(&self, template_id: &str) -> EngineResult<String> {
        let conn = self.conn.lock();

        // Load template - first get if the template exists
        let mut stmt = conn.prepare(
            "SELECT * FROM agent_templates WHERE id = ?"
        )?;
        let mut rows = stmt.query(params![template_id])?;
        
        if let Some(row) = rows.next()? {
            let template: AgentTemplate = self.map_agent_template_row(row)?;

            // Generate new agent ID
            let agent_id = format!("{}-{}", template.id, chrono::Utc::now().timestamp());

            // Create agent files entry
            conn.execute(
                "INSERT INTO agent_files (agent_id, file_name, content, updated_at)
                 VALUES (?, 'IDENTITY.md', ?, datetime('now'))",
                params![
                    &agent_id,
                    &format!(
                        "# {}\n\n{}\n\n**Skills:** {}\n\n**Personality:** {}",
                        template.name,
                        template.description,
                        template.skills.join(", "),
                        serde_json::to_string(&template.personality).unwrap_or_default()
                    )
                ],
            )?;

            // Store system prompt if provided
            if !template.system_prompt.is_empty() {
                conn.execute(
                    "INSERT INTO agent_files (agent_id, file_name, content, updated_at)
                     VALUES (?, 'SYSTEM.md', ?, datetime('now'))",
                    params![&agent_id, &template.system_prompt],
                )?;
            }

            // Update template popularity
            conn.execute(
                "UPDATE agent_templates SET popularity = popularity + 1 WHERE id = ?",
                params![template_id],
            )?;

            Ok(agent_id)
        } else {
            // Return appropriate error if template not found
            Err(crate::atoms::error::EngineError::tool("AgentTemplate", 
                format!("Template '{}' not found", template_id)))
        }
    }

    /// Seed builtin agent templates into the database.
    /// Called once on first startup to populate the catalog.
    pub fn seed_builtin_agent_templates(&self) -> EngineResult<u64> {
        let conn = self.conn.lock();

        // Check if already seeded
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM agent_templates WHERE source = 'builtin'",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

        if count > 0 {
            return Ok(0); // Already seeded, return 0
        }

        // Insert builtin templates
        let templates = self.get_builtin_agent_templates();
        let mut count_seeded = 0;
        
        for template in templates {
            self.insert_agent_template(&conn, &template)?;
            count_seeded += 1;
        }

        Ok(count_seeded)
    }

    /// Parse a SQLite row into an AgentTemplate struct.
    fn map_agent_template_row(&self, row: &rusqlite::Row) -> rusqlite::Result<AgentTemplate> {
        Ok(AgentTemplate {
            id: row.get("id")?,
            name: row.get("name")?,
            icon: row.get("icon")?,
            description: row.get("description")?,
            category: row.get("category")?,
            model: row.get("model")?,
            skills: serde_json::from_str(&row.get::<_, String>("skills")?).unwrap_or_default(),
            system_prompt: row.get("system_prompt")?,
            personality: serde_json::from_str(&row.get::<_, String>("personality")?).unwrap_or_default(),
            boundaries: serde_json::from_str(&row.get::<_, String>("boundaries")?).unwrap_or_default(),
            version: row.get("version")?,
            author: row.get("author")?,
            is_public: row.get::<_, i64>("is_public")? != 0,
            is_verified: row.get::<_, i64>("is_verified")? != 0,
            popularity: row.get::<_, i64>("popularity")? as u32,
            tags: serde_json::from_str(&row.get::<_, String>("tags")?).unwrap_or_default(),
            source: row.get("source")?,
            created_at: row.get("created_at")?,
            updated_at: row.get("updated_at")?,
        })
    }

    /// Insert or update a template in the database.
    fn insert_agent_template(&self, conn: &rusqlite::Connection, template: &AgentTemplate) -> EngineResult<()> {
        conn.execute(
            "INSERT OR REPLACE INTO agent_templates (
                id, name, icon, description, category, model, skills, system_prompt,
                personality, boundaries, version, author, is_public, is_verified,
                popularity, tags, source, created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19)",
            params![
                &template.id,
                &template.name,
                &template.icon,
                &template.description,
                &template.category,
                &template.model,
                serde_json::to_string(&template.skills).unwrap_or_default(),
                &template.system_prompt,
                serde_json::to_string(&template.personality).unwrap_or_default(),
                serde_json::to_string(&template.boundaries).unwrap_or_default(),
                &template.version,
                &template.author,
                template.is_public as i64,
                template.is_verified as i64,
                template.popularity as i64,
                serde_json::to_string(&template.tags).unwrap_or_default(),
                &template.source,
                &template.created_at,
                &template.updated_at,
            ],
        )?;

        Ok(())
    }

    /// Check if a template exists in the database.
    pub fn template_exists(&self, template_id: &str) -> EngineResult<bool> {
        let conn = self.conn.lock();
        
        let exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_templates WHERE id = ?)",
            params![template_id],
            |row| row.get(0)
        )?;
        
        Ok(exists)
    }

    /// Get a single agent template by ID
    pub fn get_agent_template_by_id(&self, template_id: &str) -> EngineResult<AgentTemplate> {
        let conn = self.conn.lock();
        
        let mut stmt = conn.prepare(
            "SELECT * FROM agent_templates WHERE id = ?"
        )?;
        let mut rows = stmt.query(params![template_id])?;
        
        if let Some(row) = rows.next()? {
            Ok(self.map_agent_template_row(row)?)
        } else {
            Err(crate::atoms::error::EngineError::tool("AgentTemplate", 
                format!("Template '{}' not found", template_id)))
        }
    }

    /// Synchronize a template from remote source: insert/update based on version.
    /// Updates template_sync_status table to track versions and sync state.
    pub fn sync_agent_template_from_remote(&self, template: AgentTemplate) -> EngineResult<()> {
        let conn = self.conn.lock();
        
        // First check if template already exists locally
        let local_exists = self.template_exists(&template.id)?;
        
        // Determine if we should update based on version comparison
        let should_update = if local_exists {
            let local_template = self.get_agent_template_by_id(&template.id)?;
            compare_versions(&template.version, &local_template.version) > 0
        } else {
            true // Always update if template doesn't exist locally
        };

        if should_update {
            // Set the source as 'remote' and timestamps appropriately
            let now = chrono::Utc::now().to_rfc3339();
            let mut template_to_insert = template;
            template_to_insert.source = "remote".to_string();
            template_to_insert.updated_at = now.clone();
            
            // Update or insert the template
            self.insert_agent_template(&conn, &template_to_insert)?;
            
            // Update the sync status
            let _local_version = if local_exists {
                self.get_agent_template_by_id(&template_to_insert.id)?.version
            } else {
                "0.0.0".to_string() // Initial version for new templates
            };
            
            conn.execute(
                "INSERT OR REPLACE INTO template_sync_status (template_id, local_version, remote_version, last_synced_at, needs_update)
                 VALUES (?1, ?2, ?3, ?4, 0)",
                params![
                    &template_to_insert.id,
                    &template_to_insert.version,  // Current version after update
                    &template_to_insert.version,  // Remote is same since we just updated
                    &now,
                ],
            )?;
        } else {
            // Version exists locally that is newer or equal - update sync status to reflect no update needed
            conn.execute(
                "INSERT OR REPLACE INTO template_sync_status (template_id, local_version, remote_version, last_synced_at, needs_update)
                 VALUES (?1, ?2, ?3, ?4, 0)",
                params![
                    &template.id,
                    &self.get_agent_template_by_id(&template.id)?.version,  // Local version
                    &template.version,  // Remote version
                    &chrono::Utc::now().to_rfc3339(),
                ],
            )?;
        }

        Ok(())
    }

    /// Get builtin agent template definitions.
    fn get_builtin_agent_templates(&self) -> Vec<AgentTemplate> {
        let now = chrono::Utc::now().to_rfc3339();
        
        vec![
            AgentTemplate {
                id: "exec-assistant".to_string(),
                name: "Executive Assistant".to_string(),
                icon: "work".to_string(),
                description: "Calendar management, email triage, meeting prep, and daily briefings".to_string(),
                category: "productivity".to_string(),
                model: "default".to_string(),
                skills: vec!["web_search".to_string(), "read_file".to_string(), "write_file".to_string()],
                system_prompt: "You are an executive assistant. Prepare meeting agendas, organize documents, and provide daily briefings. Be proactive about scheduling conflicts and follow-ups.".to_string(),
                personality: TemplatePersonality {
                    tone: "formal".to_string(),
                    initiative: "proactive".to_string(),
                    detail: "thorough".to_string(),
                },
                boundaries: vec!["Never share confidential meeting details".to_string()],
                version: "1.0.0".to_string(),
                author: "OpenPawz Team".to_string(),
                is_public: true,
                is_verified: true,
                popularity: 100,
                tags: vec!["calendar".to_string(), "email".to_string(), "meetings".to_string()],
                source: "builtin".to_string(),
                created_at: now.clone(),
                updated_at: now.clone(),
            },
            AgentTemplate {
                id: "code-reviewer".to_string(),
                name: "Code Reviewer".to_string(),
                icon: "rate_review".to_string(),
                description: "Review PRs, suggest improvements, catch bugs and security issues".to_string(),
                category: "engineering".to_string(),
                model: "default".to_string(),
                skills: vec!["read_file".to_string(), "list_directory".to_string(), "web_search".to_string(), "exec".to_string()],
                system_prompt: "You are a senior code reviewer. Analyze code for bugs, security issues, performance problems, and style. Provide actionable suggestions with examples.".to_string(),
                personality: TemplatePersonality {
                    tone: "balanced".to_string(),
                    initiative: "proactive".to_string(),
                    detail: "thorough".to_string(),
                },
                boundaries: vec!["Never execute code without explicit approval".to_string()],
                version: "1.0.0".to_string(),
                author: "OpenPawz Team".to_string(),
                is_public: true,
                is_verified: true,
                popularity: 95,
                tags: vec!["code".to_string(), "review".to_string(), "security".to_string()],
                source: "builtin".to_string(),
                created_at: now.clone(),
                updated_at: now.clone(),
            },
            AgentTemplate {
                id: "data-analyst".to_string(),
                name: "Data Analyst".to_string(),
                icon: "query_stats".to_string(),
                description: "SQL queries, data visualization, statistical analysis, and reports".to_string(),
                category: "data".to_string(),
                model: "default".to_string(),
                skills: vec!["exec".to_string(), "read_file".to_string(), "write_file".to_string()],
                system_prompt: "You are a data analyst. Write SQL queries, analyze datasets, create visualizations, and generate reports. Always explain your methodology.".to_string(),
                personality: TemplatePersonality {
                    tone: "formal".to_string(),
                    initiative: "balanced".to_string(),
                    detail: "thorough".to_string(),
                },
                boundaries: vec!["Never modify production databases without approval".to_string()],
                version: "1.0.0".to_string(),
                author: "OpenPawz Team".to_string(),
                is_public: true,
                is_verified: true,
                popularity: 85,
                tags: vec!["data".to_string(), "sql".to_string(), "analytics".to_string()],
                source: "builtin".to_string(),
                created_at: now.clone(),
                updated_at: now.clone(),
            },
        ]
    }
    
    /// Create a new agent template.
    pub fn create_agent_template(&self, mut template: AgentTemplate) -> EngineResult<()> {
        let conn = self.conn.lock();
        
        // Check if template already exists
        if self.template_exists(&template.id)? {
            return Err(crate::atoms::error::EngineError::tool("AgentTemplate", 
                format!("Template with ID '{}' already exists", template.id)));
        }
        
        // Set creation and updated timestamp
        let now = chrono::Utc::now().to_rfc3339();
        template.created_at = now.clone();
        template.updated_at = now;
        
        // Insert the template
        self.insert_agent_template(&conn, &template)?;
        
        Ok(())
    }
    
    /// Update an existing agent template by ID.
    pub fn update_agent_template(&self, template_id: String, mut template: AgentTemplate) -> EngineResult<()> {
        let conn = self.conn.lock();
        
        // Check if template exists
        if !self.template_exists(&template_id)? {
            return Err(crate::atoms::error::EngineError::tool("AgentTemplate", 
                format!("Template with ID '{}' does not exist", template_id)));
        }
        
        // Ensure the ID matches
        if template.id != template_id {
            return Err(crate::atoms::error::EngineError::tool("AgentTemplate", 
                "Template ID in body must match ID in path".to_string()));
        }
        
        // Update timestamp, but preserve creation time
        let original_created_at = self.get_agent_template_by_id(&template_id)?.created_at;
        template.created_at = original_created_at; // Maintain original creation time
        template.updated_at = chrono::Utc::now().to_rfc3339();
        
        // Update the template
        self.insert_agent_template(&conn, &template)?;
        
        Ok(())
    }
    
    /// Delete an agent template by ID.
    pub fn delete_agent_template(&self, template_id: String) -> EngineResult<()> {
        let conn = self.conn.lock();
        
        // Check if template exists
        if !self.template_exists(&template_id)? {
            return Err(crate::atoms::error::EngineError::tool("AgentTemplate", 
                format!("Template with ID '{}' does not exist", template_id)));
        }
        
        // Delete the template
        conn.execute(
            "DELETE FROM agent_templates WHERE id = ?",
            params![&template_id],
        )?;
        
        Ok(())
    }
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

