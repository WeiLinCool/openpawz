# Paw 架构参考 — n8n 在这里的实际工作方式

> **目的**: 本文档存在的原因是 AI agents (包括 Copilot) 是
> 基于传统 n8n 模式的训练数据来运行的，并会不断回退到这些传统模式。
> Paw 使用了一种前所未有的方式来使用 n8n。在
> 对 n8n 集成、社区包、MCP 桥接、
> 工具发现或凭证管理做出任何变更之前，请阅读本文档。

---

## 三项发明

Paw 有三个协同工作的原创协议。每次代码变更都必须
在所有三种协议的上下文中理解：

| 协议 | 解决的问题 | 关键洞察 |
|----------|---------------|-------------|
| **图书管理员方法** | 使用哪个工作流/工具 | Agent 表达意图 → 嵌入搜索 → 按需热加载工具 |
| **领班协议** | 如何廉价地执行工具 | 云 LLM (架构师) 决定执行什么(WHAT)；本地/廉价模型(领班) 通过 MCP 处理如何(HOW) |
| **编排者协议** | 最优流程执行 | 流程是意图的蓝图，编译成优化策略(折叠、提取、并行化、汇总) |

---

## n8n 的使用方式 (革命性部分)

### n8n 在 Paw 中是什么

n8n 是一个**无头工作流执行引擎**。它是：

- 一个在后台运行的 Docker 容器 (`paw-n8n`)
- 通过环境变量自动配置 API 密钥 — 无需人工交互
- 一个**MCP 服务器**，公开工作流级别的工具(搜索、执行、检查)
- 一个**工作流运行时**，Paw 自动部署针对各个服务的工作流，以
  封装集成逻辑(凭证绑定、错误处理、重试)
- 一座桥梁，使 Paw 的 Agent 可通过合成到可执行工作流中的
  社区节点包访问外部服务

### n8n 在 Paw 中不是什么

- 不是面向用户的 UI (用户不会打开 n8n)
- 不是供人类使用的工作流构建器 (Paw 以编程方式创建工作流)
- 不是暴露单个节点类型作为 MCP 工具的东西

### MCP 现实 (通过 curl 确认，2026 年 2 月)

n8n 的 MCP 服务器公开**三个工作流级别的工具**，而非单个节点
操作。这通过成功的 `tools/list` 握手得到证实：

| MCP 工具 | 目的 | 输入类型 |
|----------|---------|-------------|
| `search_workflows` | 按名称/描述查找工作流 | query, limit, projectId |
| `execute_workflow` | 按 ID 运行工作流 | workflowId, inputs (chat/form/webhook) |
| `get_workflow_details` | 检查工作流的节点和触发器 | workflowId |

这意味着社区包(Instagram、Puppeteer 等)不会自动
作为独立的 MCP 工具出现。相反，Paw 通过 `engine_n8n_deploy_mcp_workflow` 自动部署针对各服务的工作流，然后这些工作流可通过 `execute_workflow`执行。

### MCP 连接

n8n 的 MCP 端点在 `/mcp-server/http` 上使用 Streamable HTTP。

**设置序列** (Paw 调配后全部自动化):

```
1. 创建所有者账户    → POST /rest/owner/setup
                           email: agent@paw.local
                           password: <通过 PAW_OWNER_PASSWORD 环境变量设置>

2. 启用 MCP 访问     → PATCH /rest/mcp/settings
                           { "mcpAccessEnabled": true }
                           (需要通过所有者登录获得的会话 Cookie)

3. 创建 MCP API 密钥 → POST /rest/mcp/api-key
                           返回: { "data": { "apiKey": "<jwt>", "audience": "mcp-server-api" } }

4. MCP 连接          → POST /mcp-server/http
                           Authorization: Bearer <mcp-api-key-jwt>
                           Accept: application/json, text/event-stream
                           Content-Type: application/json
```

**认证详细信息**:
- `N8N_API_KEY` — 用于 `/api/v1/*` REST 端点(工作流 CRUD、凭证、包)
- `MCP API 密钥` — 仅用于 `/mcp-server/http` 的 audience 为 `mcp-server-api` 的 JWT
- `会话 Cookie` — 用于 `/rest/*` 端点(所有者登录、MCP 设置、MCP 密钥创建)
- 登录字段在 `POST /rest/login` 中是 `emailOrLdapLoginId` (不是 `email`)

**重要**: `N8N_MCP_SERVER_ENABLED` 不是一个真正的 n8n 环境变量。MCP
是通过 `PATCH /rest/mcp/settings` 设置 `{ "mcpAccessEnabled": true }` 来切换的。

### 工作流优先的架构

由于 n8n 的 MCP 公开的是工作流(不是节点)，Paw 的架构变为：

```
安装社区包(例如 n8n-nodes-instagram)
  → 容器重启，n8n 加载新的节点类型
  → Paw 自动部署工作流: "OpenPawz MCP — Instagram"
    (通过 engine_n8n_deploy_mcp_workflow 使用 REST API)
  → 在 tools/list 中以可执行目标形式显示工作流
  → MCP 桥接重新连接，发现工作流
  → 图书管理员将工作流编入语义搜索索引
  → Agent 可通过 request_tools("instagram posting") 找到它
  → Agent 使用工作流 ID 调用 execute_workflow
```

**这实际上比单独的节点工具更强大，因为**:
- 工作流可以链接多个节点(读取 + 转换 + 写入)
- 工作流内置凭证绑定
- 工作流支持错误处理和重试
- 编排者协议已经将工作流视为"意图的蓝图"
- `execute_workflow` 支持聊天、表单和网页钩子输入

### Agent 如何使用工具

```
用户: "将我的最新照片发布到 Instagram"

第 1 轮:
  Agent 只有核心工具(内存、文件系统、request_tools 等)
  Agent 理解意图: 需要 Instagram 功能
  Agent 调用: request_tools({"query": "instagram posting"})

  图书管理员嵌入查询 → 余弦相似度 → 查找 mcp_n8n_search_workflows
  Agent 调用: mcp_n8n_search_workflows({"query": "instagram"})
  → 查找 "OpenPawz MCP — Instagram" 工作流 (id: "abc123")

第 2 轮:
  Agent 调用: mcp_n8n_execute_workflow({"workflowId": "abc123", "inputs": {...}})

  引擎拦截 mcp_* 调用 → 委托给领班
  领班(廉价/本地模型) 处理 MCP 调用
  n8n 执行工作流 (带凭证绑定的 Instagram 节点)
  结果返回给架构师(云 LLM)
  Agent 向用户确认: "发布了！"
```

### 双向访问(正向、反向、双向)

`execute_workflow` 工具支持所有方向:

| 方向 | 如何 | 示例 |
|-----------|-----|---------|
| **正向** (agent → 服务) | 通过 `execute_workflow` 调用的动作节点工作流 | 发送 Slack 消息，创建 Jira 工单 |
| **反向** (服务 → agent) | 拥有触发器节点(网页钩子、计划)的工作流，在事件发生时触发 | "收到邮件"，"PR 已合并" |
| **双向** (读取 + 写入) | 多节点工作流先读取再写入，或两次 `execute_workflow` 调用 | "获取开放工单，汇总到 Slack" |
| **一次性** | 创建一次性的临时工作流，执行，可选删除 | 一次查找，临时查询 |
| **工作流** (编排者) | 通过编译执行策略进行多工作流协调 | 复杂的多步骤自动化 |

### 社区包

当用户安装一个社区包时(例如 Instagram、Puppeteer):

1. 通过在 n8n 容器内使用 `npm install` 安装包
2. 容器重启以便 n8n 加载新节点类型
3. **MCP 桥接重新连接** — 旧连接已失效
4. **Paw 通过 `engine_n8n_deploy_mcp_workflow` 自动部署针对服务的 MCP 工作流**
5. 通过 `listChanged` 通知在 `tools/list` 中显示工作流
6. **图书记工作流索引重建** — 新工作流可通过 `request_tools()` 发现
7. Agent 现在可以找到并执行该工作流

### 凭证

集成凭证(API 密钥、OAuth 令牌等)是：

- 存储在 n8n 的凭证系统中(n8n 管理加密凭证存储)
- 通过 n8n 的 REST API 创建 (`POST /api/v1/credentials`)
- 在自动部署期间与工作流绑定 (`engine_n8n_deploy_mcp_workflow`)
- 应用内的凭证表单从节点类型模式中发现所需内容

**认证说明**: n8n 的 `/types/` 端点(nodes.json、credentials.json) 需要
基于会话的身份验证(浏览器登录 Cookie)，而非 API 密钥身份验证。API 密钥只有
适用于 `/api/v1/*` 端点。当 `/types/` 返回 401 时，回退到
`/api/v1/credentials/schema/{type}` 或 `docker exec` 来读取节点元数据。

---

## 反模式 (不要做这些)

### ❌ 假设有 n8n 的 MCP 暴露了单独的节点类型作为工具
n8n 的 MCP 服务器暴露三个工作流级别的工具: `search_workflows`，
`execute_workflow`, `get_workflow_details`. 不暴露单独的节点操作
。工具来自已部署的工作流。

### ❌ 期望 `tools/list` 返回数千个 `mcp_n8n_*` 工具
此工具列表包含 3 个内置 MCP 工具以及已创建的任何工作流
。社区包节点通过部署包含这些节点的工
作流变得可用。

### ❌ 假设 n8n 不需要所有者帐户
n8n 确实需要一个无头的(Headless)所有者帐户才能使 MCP 工作。Paw 通过 `POST /rest/owner/setup` 自动创建一个
帐户，使用 `agent@paw.local` /
`PAW_OWNER_PASSWORD` 的值。所有者帐户与 API 密钥分开 - API 密
钥用于处理 `/api/v1/*` 端点; 而所有者帐户是 MCP 令牌
检索和需要会话授权的 `/rest/*` 端点所必需的。

**登录字段**: n8n 在 `POST /rest/login` 中使用 `emailOrLdapLoginId`(而非 `email`)。

### ❌ 忘记启用 MCP 访问
即便创建了所有者帐户，MCP 访问默认情况下也是禁用的。
必须使用会话授权调用 `PATCH /rest/mcp/settings` 并传入 `{ "mcpAccessEnabled": true }`
。

### ❌ 添加仅前端缓存以隐藏后端问题
如果软件包未在"已安装"标签页中显示，修复方法不是将它们缓存在
前端内存中。正确的修复方法是让后端正确报告它们
。

### ❌ 按照 n8n 文档描述的方式来思考 n8n
n8n 的文档假设人类用户在浏览器中构建自动化。
Paw 是一个 AI agent 使用 n8n 作为无界面集成运行时。每个设计决策
都应从这个角度进行评估。

---

## 安装后流水线(应该发生的事情)

在社区包成功安装后:

```
1. npm install 在容器内成功
2. 容器重启 → n8n 加载新的节点类型
3. n8n 已就绪(poll_n8n_ready 确认)
4. Paw 自动部署针对各服务的 MCP 工作流
   (engine_n8n_deploy_mcp_workflow 用新的节点类型创建工作流)
5. MCP 桥接重新连接(register_n8n 再次调用)
   → Streamable HTTP 重新连接
   → tools/list 返回更新的工具集，包括新工作流
6. 图书管理员工具索引重建(向量化工作流)
7. 从节点类型元数据发现凭证方案
8. 前端显示:
   - 已安装标签页中的包(通过 docker exec package.json 回退)
   - 如果节点类型需要凭证则显示凭证表单
   - 正确的节点计数和版本
9. Agent 可立即发现并执行新工作流
```

---

## 关键代码路径

| 什么 | 位置 |
|------|-------|
| n8n Docker 调配 | `src-tauri/src/engine/n8n_engine/docker.rs` |
| 所有者设置 + MCP 启用 | `src-tauri/src/engine/n8n_engine/health.rs` |
| MCP 注册表(连接，tools/list，execute) | `src-tauri/src/engine/mcp/registry.rs` |
| MCP Streamable HTTP 传输 | `src-tauri/src/engine/mcp/transport.rs` |
| MCP 客户端(initialize，tools/list，tools/call) | `src-tauri/src/engine/mcp/client.rs` |
| n8n 命令(安装，列出，凭证) | `src-tauri/src/commands/n8n.rs` |
| MCP 工作流自动部署器 | `src-tauri/src/commands/n8n.rs` → `engine_n8n_deploy_mcp_workflow` |
| 工具发现(图书管理员) | `src-tauri/src/engine/tool_index.rs` |
| 工具执行调度(领班) | `src-tauri/src/engine/tools/mod.rs` |
| 社区浏览器前端 | `src/views/integrations/community/molecules.ts` |

---

## 已知陷阱

### 加密密钥持久性

n8n 保存其加密密钥在容器内 `/home/node/.n8n/config` 数据
目录中。由于此目录是持久化的绑定挂载(`n8n-data`)，它
会在容器删除后存活。如果使用不同密钥设置新的容器
，则 n8n 检测到不匹配并崩溃循环启动。

**规则**: `provision_docker_container` 和 `start_n8n_process` 必须始终
检查 Paw 配置中是否已保存的加密密钥(和 API 密钥)
并重用它们。仅在全新设置时生成新密钥。

### MCP 令牌与 API 密钥

两种不同的认证令牌:
- `N8N_API_KEY` — 供给时生成，用于 `/api/v1/*` REST 端点
- `MCP API 密钥` — 通过 `POST /rest/mcp/api-key` 创建的 JWT，用于 `/mcp-server/http`

这些不能互换使用。MCP 端点拒绝 API 密钥。

### 所有者账号验证

n8n 对所有者设置输入进行严格验证:
- 电子邮件必须有一个有效的域名(非 `localhost` — 使用 `agent@paw.local`)
- 密码必须至少包含 1 个数字
- 登录使用 `emailOrLdapLoginId` 字段，而非 `email`

---

## 记住

用户never触摸n8n。用户安装包，如需要则填入凭据
，然后以自然语言与他们的agent交谈。agent通过图书记发现
工作流，通过领班执行它们(通过
`execute_workflow`)，并通过编排者进行复杂的多步协调。

n8n 是透明的基础设施 — 一个无界面运行时，其中 Paw 以编程方式
创建、管理和执行工作流。社区包提供节点
类型；Paw 将它们组合成工作流；agent 通过 MCP 执行那些工作流
。社区节点不是单个工具 — 它们是
Paw 组装成工作流级别的功能块。

这不是对 n8n 的封装。这是一种根本新颖的架构,
使用 n8n 的集成生态系统作为 AI 原生自动化的构建模块。

(End of file - total 302 lines)
