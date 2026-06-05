# 混合OAuth架构

> **状态**: 已实现 — 第1-3层活跃，第4层(Nango)延期
> **目标**: 使最终用户无需手动进行OAuth应用注册
> **策略**: 分层代理委托 — PKCE + n8n + RFC 7591 + 手动回退

---

## 问题所在

OpenPawz 支持 404 项集成。大多数都需要凭据。我们的第一阶段至第五阶段 OAuth PKCE 引擎
处理 10 个核心服务，但每项都需要*项目维护者*在每个平台的开发者控制台
上注册 OAuth 应用。自托管的用户也需要这么做。

我们想要的是：**用户打开 OpenPawz → 点击"连接 GitHub" → 完成。** 不需要访问开发者控制台。

---

## 每种方法的如实评估

### n8n (已嵌入)

| 提供什么 | 不提供什么 |
|---|---|
| 101 种唯一的 OAuth2 凭据类型 | 预注册的 OAuth 应用 |
| 在 localhost:5678 上的完整 OAuth 流程 UI | 从外部应用程序触发 OAuth 的编程方式 |
| 令牌刷新、凭据加密 | 将令牌导出到其他系统的方式 |
| 具有 OAuth 支持的 191 个节点 | 无需费力的设置 - 用户仍需在 n8n UI 中注册应用 |

**关键差距**: `engine_n8n_create_credential` 推送平面键/值数据。它没有触发
n8n 的交互式 OAuth 重定向流程。要使用 n8n 的 OAuth，用户必须直接访问 n8n UI。

### Nango (新增)

| 提供什么 | 不提供什么 |
|---|---|
| 600+ 个 API 供应商配置 (认证URL、令牌刷新、代理、速率限制) | **预注册的 OAuth 应用** (自托管) |
| 针对精美 OAuth 流程的连接 UI | 无需费力的设置 - 仍需要应用注册 |
| 令牌自动刷新和存储 | 超过 OAuth 基础设施以外的功能 |
| 所有供应商的统一 API | 轻量级足迹 (需要 Postgres + Redis) |

**关键事实**: Nango 自托管要求你自己注册 OAuth 应用。
只有 Nango Cloud (SaaS) 提供 250+ 服务的预注册应用。
对于自主运行的桌面应用来说，自托管 Nango 仍然需要应用注册。

### RFC 7591 动态客户端注册

| 提供什么 | 不提供什么 |
|---|---|
| 真正零注册 OAuth | GitHub、Google、Discord、Slack 等支持 |
| 在运行时自动注册 client_id | 广泛采用 (~5 个提供商支持) |
| 完美适用于企业 OIDC | 消费者 API 支持 |

**支持的供应商**: Okta、Auth0、Keycloak、一些 MCP 端点 (Notion MCP、Granola MCP)。

### 我们的 PKCE 引擎 (已经构建)

| 提供什么 | 不提供什么 |
|---|---|
| 对 10 个核心服务的直接、快速 OAuth | OAuth 应用的自动注册 |
| 无外部依赖 | 对 600+ API 的支持 |
| OS 密钥链存储、自动刷新 | 任何没有 Client ID 的服务 |

---

## 分层架构

各层按**用户努力程度**（最低优先）和**覆盖范围**（最广优先）排序。

```
┌─────────────────────────────────────────────────────────────────┐
│                    用户点击 "连接"                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │  层级路由器            │
               │  (检查 service_id)   │
               └─────┬─────┬─────┬────┘
                     │     │     │
          ┌──────────┘     │     └──────────┐
          ▼                ▼                 ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ 第1层         │ │ 第2层         │ │ 第3层         │
   │ 发布客户端    │ │ n8n OAuth    │ │ RFC 7591     │
   │ ID于构建      │ │ 委托          │ │ 动态注册      │
   │              │ │               │ │               │
   │ 10-15 个核心 │ │ 101 个OAuth2  │ │ ~5 个OIDC 提供商│
   │ 服务         │ │ 服务通过n8n UI │ │               │
   │              │ │                │ │              │
   │ 用户: 零     │ │ 用户: 一次访问 │ │ 用户: 零      │
   │ 努力         │ │ n8n UI         │ │ 努力         │
   └──────────────┘ └──────────────┘ └──────────────┘
          │                │                 │
          │         ┌──────┘                 │
          │         │    (回退)              │
          │         ▼                        │
          │  ┌──────────────┐                │
          │  │ 第4层         │                │
          │  │ Nango代理     │◄──────────────┘
          │  │ (可选)        │   (若安装Nango)
          │  │                │
          │  │ 600+ API      │
          │  │ OAuth基础架构  │
          │  │                │
          │  │ 用户: 一次注册 │
          │  │ 应用           │
          │  └──────────────┘
          │         │
          │         │    (回退)
          ▼         ▼
   ┌──────────────────────┐
   │ 第5层                │
   │ 手动API密钥           │
   │ (总是可用)            │
   │                      │
   │ 用户: 粘贴密钥        │
   └──────────────────────┘
```

---

## 第1层：发布内建的客户端ID (零用户努力)

**工作原理**: OpenPawz项目维护者在10-15个核心平台上注册OAuth应用。
客户端ID通过`option_env!()`嵌入到二进制文件中。PKCE意味着不需要客户端密钥。
这就是VS Code、Obsidian、1Password和每个其他桌面应用程序所做的。

**服务**(已在`oauth.rs`中实现):
- GitHub、Google (Gmail、Sheets、Calendar、Docs、Drive)、Discord、Slack
- Notion、Dropbox、Linear、Figma、Reddit、Spotify

**一次性努力**: 约1-2小时注册10个应用到他们的开发者控制台。

**为什么重要**: 客户端ID不是秘密。它们是公共标识符。通过PKCE，
不需要客户端密钥。每个OpenPawz用户共享相同的客户端ID。
他们的令牌是私人的——存储在他们的操作系统密钥链中，从不共享。

**实现**: ✅ 已经完成(第5阶段)。只需要注册实际应用。

---

## 第2层：n8n OAuth委托(每个服务访问一次n8n UI)

**工作原理**: 对于需要n8n工作流程的服务，用户直接在n8n的Web UI中创建OAuth凭证。
n8n处理完整的OAuth流程——重定向、同意、令牌交换、存储、刷新。

**服务**: n8n中101个独特的OAuth2凭证类型(GitHub、Google、Slack、HubSpot、
Salesforce、Jira、Stripe、Shopify、Notion、Airtable、Trello等)

**用户流**:
1. 用户在OpenPawz中启用集成
2. OpenPawz检测到需要n8n凭据
3. 打开n8n凭证UI(iframe或重定向到localhost:5678)
4. 用户在n8n中完成OAuth
5. OpenPawz检测到凭证创建，部署工作流程

**需要实现**:
- 检测服务何时需要n8n OAuth(检查`credential-schemas.json`)
- 为正确的凭证类型打开n8n凭证创建页面
- 轮询n8n API以完成凭证创建
- 为工作流程部署连接凭证

**关键API端点**:
```
GET  /api/v1/credential-types         — 列出可用的凭证类型
POST /api/v1/credentials              — 创建凭证(仅平面数据)
GET  /api/v1/credentials              — 列出现有凭证
GET  /api/v1/credentials/{id}         — 获取凭证详细信息
```

**差距**: n8n的REST API使用平面数据创建凭证。OAuth需要浏览器重定向以获得用户同意。
重定向流程是由n8n Web UI而非API触发的。我们需要重定向用户到
`http://localhost:5678/credentials/new?type=githubOAuth2Api`并检测完成情况。

---

## 第3层：RFC 7591 动态客户端注册（零用户努力）

**工作原理**：一些OIDC兼容提供商允许客户端在运行时自行注册。
应用程序发送一个带有元数据的`POST /register`请求，并接收一个`client_id`。
无须人工访问开发者控制台。

**支持此功能的提供者**：
| 提供者 | 注册端点 | 注意事项 |
|---|---|---|
| Okta | `https://{domain}/oauth2/v1/clients` | 企业级OIDC |
| Auth0 | `https://{domain}/oidc/register` | OIDC动态注册 |
| Keycloak | `https://{domain}/realms/{realm}/clients-registrations/openid-connect` | 自托管OIDC |
| Notion MCP | `https://mcp.notion.com/register` | MCP + RFC 7591 |
| Granola MCP | `https://mcp-auth.granola.ai/oauth2/register` | MCP + RFC 7591 |

**注册载荷**(RFC 7591 §2)：
```json
{
  "client_name": "OpenPawz",
  "redirect_uris": ["http://127.0.0.1:{port}/callback"],
  "token_endpoint_auth_method": "none",
  "grant_types": ["authorization_code"],
  "response_types": ["code"],
  "application_type": "native"
}
```

**需要实现**：
- `oauth.rs`中的`dynamic_register_client()`函数
- 注册端点注册表(按提供商)
- 在密钥链中缓存已注册的`client_id`(重新启动时无需重新注册)
- 在获得`client_id`后转入正常PKCE流

---

## 第4层：Nango代理（可选高级用户插件）

**工作原理**：自托管Nango为600多个API提供OAuth基础架构。
用户在Nango的仪表板中注册他们自己的OAuth应用，但Nango处理所有复杂性——
正确的认证URL、令牌刷新、带速率限制的代理、分页。

**使用时机**：需要超出核心10-15个服务的众多集成的高级用户。
Nango的价值在于其600多个提供商配置，而不是预注册的应用。

**基础设施成本**(3个额外的Docker容器)：
```yaml
# Nango需要：
paw-nango-db:      postgres:16        # ~50MB RAM
paw-nango-redis:   redis:7.2.4        # ~10MB RAM  
paw-nango-server:  nangohq/nango-server:hosted  # ~200MB RAM
```

**总增加开销**：~260MB内存，~1.5GB磁盘(镜像)

**用户流程**：
1. 用户在设置中启用"Nango高级模式"
2. OpenPawz在n8n旁边配置3个Nango Docker容器
3. 用户访问localhost:3003处的Nango仪表板来配置OAuth应用
4. OpenPawz使用Nango的连接对话API触发OAuth流程
5. 令牌存储在Nango中，通过OpenPawz代理

**连接对话API**：
```
POST /connect/sessions
Authorization: Bearer <nango-secret-key>
{
  "end_user": { "id": "openpawz-user" },
  "allowed_integrations": ["github", "slack", "notion"]
}
→ { "data": { "token": "...", "connect_link": "http://localhost:3009/..." } }
```

**实施**：延迟——第4层是可选的。首先专注于第1-3层。

---

## 服务路由表

层级路由器决定哪个层级处理服务器的方法：

```rust
fn resolve_tier(service_id: &str) -> OAuthTier {
    // 第1层：有分发客户端ID的服务
    if SHIPPED_OAUTH_CONFIGS.contains_key(service_id) {
        return OAuthTier::ShippedPkce;
    }

    // 第3层：有RFC 7591动态注册的服务
    if RFC7591_REGISTRY.contains_key(service_id) {
        return OAuthTier::DynamicRegistration;
    }

    // 第2层：有n8n OAuth凭据类型的服务
    if N8N_OAUTH_TYPES.contains_key(service_id) {
        return OAuthTier::N8nDelegation;
    }

    // 第4层：在Nango目录中的服务（如果已安装）
    if nango_installed() && NANGO_PROVIDERS.contains_key(service_id) {
        return OAuthTier::NangoBroker;
    }

    // 第5层：手动API密钥
    OAuthTier::ManualApiKey
}
```

---

## 实施优先级

### 阶段A — 分发客户端ID(第1层) ⏱️ 1-2小时
注册10个OAuth应用。设置环境变量。构建并发布。
这本身就覆盖了绝大多数服务且零用户努力。

### 阶段B — n8n OAuth委托(第2层) ⏱️ 4-6小时
- 将101个n8n OAuth2认证类型映射到OpenPawz服务ID
- 构建凭据创建重定向(为正确类型打开n8n UI)
- 轮询凭据完成情况
- 连接到工作流部署

### 阶段C — RFC 7591动态注册(第3层) ⏱️ 2-3小时
- 在oauth.rs中实现`dynamic_register_client()`
- 添加5个提供者的注册端点
- 在密钥链中缓存client_id
- 链接到现有PKCE流

### 阶段D — Nango代理(第4层) ⏱️ 6-8小时
- 3个Nango容器的Docker供应
- Nango API客户端用于连接会话
- 提供者映射(service_id → nango集成slug)
- 用于启用/禁用Nango的设置UI

---

## 覆盖度摘要

| 层级 | 服务 | 用户努力 | 状态 |
|------|------|-------------|--------|
| 1 — 分发ID | 10-15个核心 | 零 | ✅ 代码已完成，需要应用注册 |
| 2 — n8n OAuth | ~101个OAuth类型 | 一次访问n8n UI | 🔲 需要委托桥接 |
| 3 — RFC 7591 | ~5个OIDC提供者 | 零 | 🔲 需要实现 |
| 4 — Nango(可选) | 600+ API | 注册到Nango | 🔲 延期 |
| 5 — API密钥 | 所有404项服务 | 粘贴密钥 | ✅ 已经可工作 |

**第1+2+3层组合覆盖率**: ~116项服务具有最小到零的用户努力。
**有第5层后备**: 覆盖所有404项服务。

---

## 架构决策

### 为什么不使用 Nango Cloud？
- Nango Cloud 提供预注册的 OAuth 应用（250+）但是：
  - 需要连接 Nango 的 SaaS 的互联网连接
  - 在用户数据流中添加了第三方依赖关系
  - 不是自包含的（违反了 OpenPawz 的离线优先原则）
  - 自托管定价：存在免费版本，但有一定的限制

### 为什么第 4 层（Nango 自托管）是可选的？
- 添加 3 个 Docker 容器（约 260MB RAM）
- 仍需要 OAuth 应用注册（与直接 PKCE 相同）
- 主要价值：为 600+ API 和令牌管理提供提供商配置
- 只有在需要大量集成的高级用户才需要

### 为什么在二进制文件中发布客户端 ID？
- 客户端 ID 不是机密——它们是公开的标识符
- PKCE（RFC 7636）消除了对客户端密钥的需求
- 这是行业标准：VS Code、Obsidian、Slack 桌面版、1Password 都这样做
- 项目的维护人员进行的一次性注册惠及所有用户

### 为什么 n8n 委托使用重定向而非 API？
- n8n 的 REST API 用平面数据创建凭证
- OAuth 需要浏览器重定向以获取用户同意
- n8n 的 Web UI 在内部处理完整的 OAuth 处理
- 我们将用户重定向到 n8n 凭据创建页面并检测完成情况
