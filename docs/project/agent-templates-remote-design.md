# Agent Templates Remote Configuration Design

## Overview

从硬编码模版改为远程配置,支持企业级模版管理,管理员可通过Web界面配置模版,用户应用内下载使用。

## Architecture

```
管理端(Web UI) → PawzHub API → Remote Registry(JSON/GitHub)
                                    ↓
                            User Application
                                    ↓
                            Local Cache + Version Check
```

## 1. Database Schema

### agent_templates 表

```sql
CREATE TABLE IF NOT EXISTS agent_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'smart_toy',
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'productivity',
    model TEXT NOT NULL DEFAULT 'default',
    skills TEXT NOT NULL DEFAULT '[]',  -- JSON array
    system_prompt TEXT NOT NULL DEFAULT '',
    personality TEXT NOT NULL DEFAULT '{}', -- JSON object
    boundaries TEXT NOT NULL DEFAULT '[]',  -- JSON array
    version TEXT NOT NULL DEFAULT '1.0.0',
    author TEXT NOT NULL DEFAULT 'admin',
    is_public INTEGER NOT NULL DEFAULT 1,
    is_verified INTEGER NOT NULL DEFAULT 0,
    popularity INTEGER NOT NULL DEFAULT 0,
    tags TEXT NOT NULL DEFAULT '[]',  -- JSON array
    source TEXT NOT NULL DEFAULT 'builtin',  -- 'builtin', 'remote', 'custom'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_agent_templates_public ON agent_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_agent_templates_popularity ON agent_templates(popularity DESC);
```

### template_sync_status 表(增量更新)

```sql
CREATE TABLE IF NOT EXISTS template_sync_status (
    template_id TEXT PRIMARY KEY,
    local_version TEXT NOT NULL,
    remote_version TEXT NOT NULL,
    last_synced_at TEXT NOT NULL DEFAULT (datetime('now')),
    needs_update INTEGER NOT NULL DEFAULT 0
);
```

## 2. Rust Backend Types

### src-tauri/src/engine/atoms/types.rs

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTemplate {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub description: String,
    pub category: String,
    pub model: String,
    pub skills: Vec<String>,
    pub system_prompt: String,
    pub personality: TemplatePersonality,
    pub boundaries: Vec<String>,
    pub version: String,
    pub author: String,
    pub is_public: bool,
    pub is_verified: bool,
    pub popularity: u32,
    pub tags: Vec<String>,
    pub source: String,  // "builtin", "remote", "custom"
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplatePersonality {
    pub tone: String,  // "casual", "balanced", "formal"
    pub initiative: String,  // "reactive", "balanced", "proactive"
    pub detail: String,  // "brief", "balanced", "thorough"
}
```

## 3. API Endpoints

### Backend Commands (src-tauri/src/commands/templates.rs)

```rust
// 查询所有公开模版
#[tauri::command]
pub async fn list_agent_templates(category: Option<String>) -> Result<Vec<AgentTemplate>, String>

// 搜索模版
#[tauri::command]
pub async fn search_agent_templates(query: String) -> Result<Vec<AgentTemplate>, String>

// 从模版创建Agent
#[tauri::command]
pub async fn install_agent_template(template_id: String) -> Result<Agent, String>

// 管理员API
#[tauri::command]
pub async fn create_agent_template(template: AgentTemplate) -> Result<(), String>

#[tauri::command]
pub async fn update_agent_template(template: AgentTemplate) -> Result<(), String>

#[tauri::command]
pub async fn delete_agent_template(template_id: String) -> Result<(), String>

// 同步远程模版
#[tauri::command]
pub async fn sync_remote_templates() -> Result<Vec<AgentTemplate>, String>
```

## 4. Remote Registry Format

### PawzHub Registry JSON

```json
{
  "version": "2.0",
  "templates": [
    {
      "id": "exec-assistant",
      "name": "Executive Assistant",
      "icon": "work",
      "description": "Calendar management, email triage, meeting prep",
      "category": "productivity",
      "model": "default",
      "skills": ["web_search", "read_file", "write_file"],
      "system_prompt": "You are an executive assistant...",
      "personality": {
        "tone": "formal",
        "initiative": "proactive",
        "detail": "thorough"
      },
      "boundaries": [],
      "version": "1.2.0",
      "author": "OpenPawz Team",
      "is_verified": true,
      "tags": ["calendar", "email", "meetings"]
    }
  ]
}
```

**Registry URL**: 
- 官方: `https://raw.githubusercontent.com/OpenPawz/openpawz/main/templates/registry.json`
- 企业私有: `https://your-company.com/pawz/templates.json`

## 5. Frontend TypeScript Types

### src/engine/atoms/types.ts

```typescript
export interface AgentTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  model: string;
  skills: string[];
  system_prompt: string;
  personality: {
    tone: 'casual' | 'balanced' | 'formal';
    initiative: 'reactive' | 'balanced' | 'proactive';
    detail: 'brief' | 'balanced' | 'thorough';
  };
  boundaries: string[];
  version: string;
  author: string;
  is_public: boolean;
  is_verified: boolean;
  popularity: number;
  tags: string[];
  source: 'builtin' | 'remote' | 'custom';
  created_at: string;
  updated_at: string;
}
```

## 6. Implementation Steps

### Phase 1: Backend Infrastructure
1. 添加数据库迁移(schema.rs)
2. 定义Rust类型(types.rs)
3. 实现CRUD API(commands/templates.rs)
4. 实现远程同步逻辑(similar to PawzHub)

### Phase 2: Frontend Integration
1. 替换硬编码AGENT_TEMPLATE_CATALOG
2. 实现TemplateLoader(远程拉取+本地缓存)
3. 实现增量更新(version对比)
4. 集成到agents-panel.ts

### Phase 3: Management UI
1. 模版管理界面(管理员)
2. 模版编辑器(表单)
3. 模版导入/导出
4. 权限控制(仅管理员可创建)

## 7. Version Update Strategy

```typescript
// 前端加载流程
async function loadTemplates() {
  // 1. 从本地缓存读取
  const cached = await loadCachedTemplates();
  
  // 2. 检查远程版本
  const remoteRegistry = await fetchRemoteRegistry();
  
  // 3. 对比版本号
  const updates = findUpdates(cached, remoteRegistry);
  
  // 4. 增量下载
  if (updates.length > 0) {
    await downloadUpdates(updates);
    await updateLocalCache();
  }
  
  // 5. 返回合并后的模版列表
  return mergeTemplates(cached, remoteRegistry);
}
```

## 8. Security Considerations

- 管理员权限验证(create/update/delete API)
- 模版签名验证(防止恶意注入)
- 输入验证(system_prompt过滤危险内容)
- 版本锁定(防止强制降级)

## 9. Benefits

✅ 灵活性: 管理员在线配置模版  
✅ 可维护性: 无需重新发布应用即可更新模版  
✅ 可扩展性: 支持企业私有模版仓库  
✅ 离线可用: 本地缓存保证离线场景  
✅ 版本控制: 增量更新节省带宽

## 10. Migration Plan

1. **保留现有模版**: 将AGENT_TEMPLATE_CATALOG导入数据库作为builtin模版
2. **渐进式切换**: 前端先支持本地+远程混合加载
3. **向后兼容**: 保留legacy模版接口一段时间
4. **数据迁移脚本**: 提供一键导入工具

---

**Status**: Design Phase  
**Priority**: High  
**Estimated Effort**: 3-5 days backend + frontend