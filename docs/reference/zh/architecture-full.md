# 架构

> Pawz 是一个 Tauri v2 原生桌面应用 — Rust 后端，TypeScript 前端，IPC 桥接。
> 总计约 112K 代码行 (55k Rust + 42k TypeScript + 15k CSS) · 3,174 个测试 (1,008 Rust + 2,166 TypeScript) · 3个作业CI · 0个clippy警告

---

## 概览

```
┌─────────────────────────────────────────────────────────────┐
│  Pawz Desktop App                                           │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Frontend (TypeScript, vanilla DOM)                   │  │
│  │  • 20+ views (agents, tasks, mail, research, etc.)    │  │
│  │  • 7 feature modules (atomic design pattern)          │  │
│  │  • Material Symbols icon library                      │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │ Tauri IPC (158 structured commands)    │
│  ┌──────────────────▼────────────────────────────────────┐  │
│  │  Rust Backend Engine                                  │  │
│  │  • Agent loop with SSE streaming + Action DAG plans   │  │
│  │  • Tool executor with human-in-the-loop approval      │  │
│  │  • 5-phase execution pipeline (plan → constrain →     │  │
│  │    discover → encode → speculate)                     │  │
│  │  • 11 channel bridges                                 │  │
│  │  • 3 native AI providers (+ 7 via model routing)      │  │
│  │  • SQLite persistence + OS keychain                   │  │
│  │  • Docker container sandbox (bollard crate)           │  │
│  └──────────────────┬────────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│               Operating System                              │
└─────────────────────────────────────────────────────────────┘
```

无 Node.js 后端，无网关进程，无开放网络端口。每个操作都通过前端和 Rust 引擎之间的 Tauri IPC 命令流动。

---

## 目录结构

```
src/                          # TypeScript frontend
├── main.ts                   # App bootstrap, event listeners, IPC bridge
├── engine.ts                 # Engine bridge (state, config, IPC helpers)
├── engine-bridge.ts          # Tauri event/command wrappers
├── security.ts               # Command risk classifier, injection scanner
├── types.ts                  # Shared TypeScript types
├── styles.css                # All application styles
├── db.ts                     # SQLite helpers (Web SQL via Tauri plugin)
├── workspace.ts              # Workspace management
├── views/                    # UI views (one file per page)
│   ├── agents.ts             # Agent CRUD, avatars, mini-chat, dock
│   ├── mail.ts               # Email client (IMAP/SMTP)
│   ├── projects.ts           # Project workspaces
│   ├── memory-palace.ts      # Memory visualization
│   ├── skills.ts             # Skill vault
│   ├── research.ts           # Research workflow
│   ├── tasks.ts              # Kanban board
│   ├── trading.ts            # Crypto trading dashboard
│   ├── orchestrator.ts       # Multi-agent orchestration
│   ├── settings*.ts          # Settings tabs (10 files)
│   └── ...
├── features/                 # Feature modules (atomic design)
│   ├── slash-commands/       # 20 commands with autocomplete
│   ├── container-sandbox/    # Docker sandbox config
│   ├── prompt-injection/     # Injection detection (30+ patterns)
│   ├── memory-intelligence/  # Smart memory operations
│   ├── agent-policies/       # Per-agent tool policies
│   ├── channel-routing/      # Rule-based channel routing
│   ├── session-compaction/   # AI summarization
│   ├── browser-sandbox/      # Browser profiles, screenshots, network policy
│   └── action-dag/           # Action DAG plan visualization (atoms, molecules)
├── components/               # Shared UI components
│   ├── helpers.ts            # DOM helpers, escaping, formatting
│   └── toast.ts              # Toast notifications
└── assets/
    ├── avatars/              # 50 Pawz Boi PNGs (96×96)
    └── fonts/                # Material Symbols woff2

src-tauri/                    # Rust backend
├── src/
│   ├── main.rs               # Tauri app entry point
│   ├── lib.rs                # Command registration, plugin setup
│   └── engine/               # Core engine modules
│       ├── mod.rs            # Module exports
│       ├── commands.rs       # 134 Tauri IPC commands
│       ├── tools/            # Tool executor — 22 focused modules
│       │   ├── mod.rs        # Definitions, routing, HIL approval
│       │   ├── agents.rs     # Agent management tools
│       │   ├── agent_comms.rs # Inter-agent messaging tools
│       │   ├── coinbase.rs   # Coinbase trading
│       │   ├── dex.rs        # DEX trading tools
│       │   ├── email.rs      # Email tools
│       │   ├── exec.rs       # Shell execution
│       │   ├── fetch.rs      # HTTP/web fetch
│       │   ├── filesystem.rs # File read/write
│       │   ├── github.rs     # GitHub tools
│       │   ├── integrations.rs # Skill integration tools
│       │   ├── memory.rs     # Memory tools
│       │   ├── skill_output.rs # Skill output/widget tools
│       │   ├── skill_storage.rs # Persistent key-value storage tools
│       │   ├── skills_tools.rs # Community skill tools
│       │   ├── slack.rs      # Slack tools
│       │   ├── solana.rs     # Solana tools
│       │   ├── soul.rs       # Soul/personality tools
│       │   ├── squads.rs     # Agent squad management tools
│       │   ├── request_tools.rs # Tool RAG: semantic tool discovery meta-tool
│       │   ├── tasks.rs      # Task management
│       │   ├── telegram.rs   # Telegram tools
│       │   └── web.rs        # Browser automation tools
│       ├── providers/        # AI provider abstraction
│       │   ├── mod.rs        # Provider routing
│       │   ├── anthropic.rs  # Anthropic Messages API
│       │   ├── google.rs     # Google Gemini API
│       │   └── openai.rs     # OpenAI Chat Completions API
│       ├── sessions/         # Session management — 16 modules
│       │   ├── mod.rs        # Session orchestration
│       │   ├── sessions.rs   # CRUD, listing, compaction triggers
│       │   ├── messages.rs   # Message persistence
│       │   ├── memories.rs   # Memory CRUD
│       │   ├── config.rs     # Agent/engine config
│       │   ├── embedding.rs  # Embedding storage
│       │   ├── schema.rs     # SQLite schema migrations
│       │   ├── tasks.rs      # Task/activity persistence
│       │   ├── projects.rs   # Project management
│       │   ├── positions.rs  # Trading positions
│       │   ├── trades.rs     # Trade history
│       │   ├── agent_files.rs # Per-agent file tracking
│       │   ├── agent_messages.rs # Inter-agent message persistence
│       │   └── squads.rs     # Agent squad persistence
│       ├── skills/           # Skill vault — 400+ built-in + 25,000+ via MCP bridge
│       │   ├── mod.rs        # Skill loading, prompt injection
│       │   ├── builtins.rs   # 400+ built-in skill definitions
│       │   ├── crypto.rs     # Credential encryption (AES-256-GCM + keychain)
│       │   ├── vault.rs      # Credential storage/retrieval
│       │   ├── prompt.rs     # Prompt construction
│       │   ├── status.rs     # Readiness checks
│       │   ├── types.rs      # Skill types
│       │   └── community/    # Community skills (skills.sh + PawzHub)
│       │       ├── mod.rs, github.rs, parser.rs
│       │       ├── search.rs, store.rs, types.rs
│       │       └── pawzhub.rs    # PawzHub marketplace browser
│       ├── dex/              # Ethereum DEX trading — 15 modules
│       │   ├── mod.rs        # DEX orchestration
│       │   ├── swap.rs       # Uniswap V2/V3 swaps
│       │   ├── wallet.rs     # HD wallet (BIP-39/44)
│       │   ├── rpc.rs        # JSON-RPC client
│       │   ├── tokens.rs     # ERC-20 operations
│       │   ├── transfer.rs   # ETH/token transfers
│       │   ├── tx.rs         # Transaction building/signing
│       │   ├── rlp.rs        # RLP encoding
│       │   ├── abi.rs        # ABI encoding/decoding
│       │   ├── constants.rs  # Chain constants
│       │   ├── primitives.rs # U256, Address types
│       │   ├── discovery.rs  # Token discovery
│       │   ├── monitoring.rs # Position monitoring
│       │   ├── portfolio.rs  # Portfolio tracking
│       │   └── token_analysis.rs # Token analysis
│       ├── sol_dex/          # Solana DEX trading — 11 modules
│       │   ├── mod.rs        # Solana DEX orchestration
│       │   ├── jupiter.rs    # Jupiter aggregator
│       │   ├── pumpportal.rs # Pump.fun integration
│       │   ├── wallet.rs     # Ed25519 wallet
│       │   ├── rpc.rs        # Solana RPC client
│       │   ├── transaction.rs # Transaction building
│       │   ├── transfer.rs   # SOL/token transfers
│       │   ├── price.rs      # Price feeds
│       │   ├── portfolio.rs  # Portfolio tracking
│       │   ├── helpers.rs    # Shared utilities
│       │   └── constants.rs  # Network constants
│       ├── whatsapp/         # WhatsApp bridge — 7 modules
│       │   ├── mod.rs        # Bridge orchestration
│       │   ├── evolution_api.rs # Evolution API client
│       │   ├── webhook.rs    # Webhook server
│       │   ├── messages.rs   # Message handling
│       │   ├── bridge.rs     # Bridge lifecycle
│       │   ├── config.rs     # Configuration
│       │   └── docker.rs     # Docker management
│       ├── memory/           # Semantic memory — 3 modules
│       │   ├── mod.rs        # Store/search/merge/decay/MMR/facts
│       │   ├── ollama.rs     # Ollama readiness, startup, model pull
│       │   └── embedding.rs  # EmbeddingClient (vector operations)
│       ├── tool_index.rs     # Tool RAG: semantic tool discovery index
│       ├── orchestrator/     # Boss/worker multi-agent orchestration — 5 modules
│       │   ├── mod.rs        # AgentRole enum, orchestration entry points
│       │   ├── tools.rs      # Orchestrator tool definitions
│       │   ├── handlers.rs   # Tool call handlers
│       │   ├── agent_loop.rs # Unified boss/worker agent loop
│       │   └── sub_agent.rs  # Sub-agent spawning
│       ├── plan/             # Phase 0: Action DAG planning — 3 modules
│       │   ├── atoms.rs      # PlanNode, PlanDag, PlanStatus types
│       │   ├── molecules.rs  # DAG validation, cycle detection, topological sort
│       │   └── executor.rs   # Parallel DAG executor (tokio::JoinSet)
│       ├── constrained/      # Phase 1: Constrained decoding — 2 modules
│       │   ├── atoms.rs      # ConstraintMode enum, provider capability map
│       │   └── molecules.rs  # Schema enforcement per provider
│       ├── tool_registry/    # Phase 2: Persistent tool registry — 2 modules
│       │   ├── atoms.rs      # ToolEmbedding, SearchTier, RegistryStats types
│       │   └── molecules.rs  # PersistentToolRegistry, 4-tier search failover
│       ├── binary_ipc/       # Phase 3: Binary IPC encoding — 2 modules
│       │   ├── atoms.rs      # MessagePack frame types, BatchConfig
│       │   └── molecules.rs  # EventBatcher, ResultAccumulator (rmp-serde)
│       ├── speculative/      # Phase 4: Speculative execution — 2 modules
│       │   ├── atoms.rs      # TransitionRecord, PredictionResult types
│       │   └── molecules.rs  # SpeculativeEngine, transition prediction, warming
│       ├── agent_loop/       # Core agent conversation loop — 2 modules
│       │   ├── mod.rs        # run_agent_turn (streaming + tool routing + plan interception)
│       │   └── trading.rs    # Trading auto-approve policy checks
│       ├── channels/         # Shared channel bridge logic — 3 modules
│       │   ├── mod.rs        # Types, config helpers, message splitting
│       │   ├── agent.rs      # run_channel_agent, routed agent dispatch
│       │   └── access.rs     # User access control (approve/deny/remove)
│       ├── nostr/            # Nostr bridge — 3 modules
│       │   ├── mod.rs        # Config, state, keychain, bridge API
│       │   ├── crypto.rs     # NIP-04 encrypt/decrypt, event signing
│       │   └── relay.rs      # WebSocket relay loop
│       ├── webchat/          # WebChat bridge — 4 modules
│       │   ├── mod.rs        # Config, state, public API, WebSocket handler
│       │   ├── server.rs     # TLS acceptor, HTTP server, connection handler
│       │   ├── session.rs    # Session management, cookie auth
│       │   └── html.rs       # Inline chat HTML/JS/CSS
│       ├── compaction.rs     # Session compaction (context summarization)
│       ├── sandbox.rs        # Docker container sandboxing
│       ├── routing.rs        # Channel routing rules
│       ├── injection.rs      # Prompt injection detection (Rust side)
│       ├── state.rs          # Engine state (YieldSignal, RequestQueue, YieldSignals)
│       ├── pricing.rs        # Token pricing
│       ├── chat.rs           # System prompt builder, tool assembly, loop detection
│       ├── types.rs          # Shared Rust types
│       ├── telegram.rs       # Telegram bridge
│       ├── discord.rs        # Discord bridge
│       ├── slack.rs          # Slack bridge
│       ├── matrix.rs         # Matrix bridge
│       ├── irc.rs            # IRC bridge
│       ├── mattermost.rs     # Mattermost bridge
│       ├── nextcloud.rs      # Nextcloud Talk bridge
│       ├── twitch.rs         # Twitch bridge
│       ├── web.rs            # Browser automation (headless Chrome)
│       ├── events.rs         # Event-driven task trigger dispatcher
│       ├── mcp/              # MCP Bridge — 7 modules (Zero-Gap Automation)
│       │   ├── mod.rs        # MCP session lifecycle
│       │   ├── client.rs     # MCP client (JSON-RPC, initialize, tool listing)
│       │   ├── transport.rs  # Streamable HTTP + Stdio transports
│       │   ├── types.rs      # MCP protocol types
│       │   ├── tools.rs      # Tool schema ↔ Paw tool conversion
│       │   ├── registry.rs   # Auto-registration, pascal_to_snake remapping
│       │   └── n8n.rs        # n8n-specific: ensure_ready, auto-install, community packages
│       ├── toml/             # TOML skill manifest loader — 4 modules
│       │   ├── mod.rs        # Public API
│       │   ├── parser.rs     # TOML parsing and validation
│       │   ├── loader.rs     # Filesystem scanning and hot-reload
│       │   └── types.rs      # TOML manifest types
│   ├── commands/             # Split Tauri command files — 20 modules
│   │   ├── mod.rs            # Command module declarations
│   │   ├── chat.rs           # Chat send, request queue, yield signal, session history
│   │   ├── agent.rs          # Agent CRUD commands
│   │   ├── config.rs         # Engine configuration commands
│   │   ├── memory.rs         # Memory CRUD + embedding commands
│   │   ├── task.rs           # Task/cron command handlers
│   │   ├── project.rs        # Orchestrator project commands
│   │   ├── trade.rs          # Trading commands
│   │   ├── mail.rs           # Email commands
│   │   ├── channels.rs       # Channel bridge commands
│   │   ├── browser.rs        # Browser automation commands
│   │   ├── tts.rs            # Text-to-speech commands
│   │   ├── state.rs          # Engine state commands
│   │   ├── squad.rs          # Agent squad commands
│   │   ├── utility.rs        # Utility commands
│   │   ├── tailscale.rs      # Tailscale commands
│   │   ├── webhook.rs        # Generic webhook server commands
│   │   ├── mcp.rs            # MCP client commands
│   │   ├── skill_wizard.rs   # Skill creation wizard
│   │   └── skills.rs         # Skill management commands
│   └── atoms/                # Shared types and error handling
│       ├── types.rs          # All shared data types
│       └── error.rs          # Typed EngineError enum
├── Cargo.toml                # Rust dependencies
├── tauri.conf.json           # Tauri config (CSP, bundle, updater, permissions)
└── capabilities/
    └── default.json          # Filesystem scope, shell, updater permissions

.github/                      # CI/CD workflows
├── workflows/
│   ├── ci.yml                # Lint, test, audit (4 parallel jobs incl. prek)
│   └── release.yml           # Multi-platform build, sign, publish + auto-update

.pre-commit-config.yaml       # prek hooks config (https://github.com/j178/prek)
package.json                  # Node dependencies, scripts
eslint.config.js              # ESLint config (TypeScript rules)
vite.config.ts                # Vite build config
vitest.config.ts              # Vitest test config
tsconfig.json                 # TypeScript config
index.html                    # Single-page application shell
```

---

## Rust 后端

### 智能体循环 (`agent_loop/`)

核心对话循环，增强以 5 阶段执行管道：
1. 接收用户消息 + 可选的让位信号
2. 将自回忆忆注入上下文
3. **第 4 阶段：** 推测引擎预测可能的下一个工具，预热连接
4. **第 1 阶段：** 应用特定提供者的约束解码（严格的JSON模式）
5. 通过 SSE 流向配置的 AI 提供商发送
6. 解析响应中的工具调用
7. **第 0 阶段：** 如果调用 `execute_plan` 工具，则拦截并路由到 DAG 执行器进行并行执行
8. **第 3 阶段：** 结果通过二进制 IPC 组装 (`EventBatcher` + `ResultAccumulator`)
9. 通过工具执行器路由每个工具调用（带有人类在环审批）
10. **第 2 阶段：** 工具发现使用带 SQLite 支持嵌入的 `PersistentToolRegistry`
11. 检查让位信号 — 如果已排队新请求，则优雅结束
12. 带着工具结果循环回到步骤，直到智能体完成或请求让位

**请求队列 (VS Code 模式)：** 当用户在智能体仍在处理时发送新消息时，请求被排队而不是拒绝。活动智能体接收一个让位信号（原子布尔值）并在下一个轮次边界处优雅结束。然后自动处理排队的请求。

**删除重试：** 失败的工具交换（所有工具结果都是错误）以及 "放弃" 响应（道歉螺旋、拒绝）在加载上下文之前完全从历史中删除。模型永不看到过去的失败，防止认知无助。

**智能体限定历史：** 加载对话上下文时，每个智能体只看到与其自己的会话相关的信息。跨智能体委派结果（来自 `agent_send_message` / `agent_read_messages`）对非默认智能体进行了过滤，以防止上下文污染。

### 工具 (`tools/`)

工具执行分布在 21 个专注模块中，每个模块拥有单个领域。`mod.rs` barrel 文件提供：
- `definitions()` — 收集来自每个模块的所有工具模式
- `execute_tool()` — 将工具调用路由到正确的模块
- 通过 one-shot 通道运行人类在环 (HIL) 审批流程

工具流程：
1. 分类风险级别（严重/高/中/低/安全）
2. 检查白名单/黑名单模式
3. 如果需要批准 → 向前端发出 `ToolRequest` 事件
4. 前端显示批准模态框 → 用户决定
5. `engine_approve_tool` 解决待定批准
6. 执行或拒绝工具

工具模块：`agents`, `agent_comms`, `coinbase`, `dex`, `email`, `exec`, `fetch`, `filesystem`, `github`, `integrations`, `memory`, `request_tools`, `skill_output`, `skill_storage`, `skills_tools`, `slack`, `solana`, `soul`, `squads`, `tasks`, `telegram`, `web`.

工具类别：`exec`, `web_search`, `web_fetch`, `file_read`, `file_write`, `memory`, `agent`, `agent_comms`, `squads`, `trading`.

### AI 提供商 (`providers/`)

三个原始提供者实现带有 SSE 流和**约束解码**（每个都在自己的模块中）：
- **OpenAI** — 聊天补全 API，函数调用，多模态。约束：函数模式上的 `strict: true`
- **Anthropic** — 消息 API，工具使用，思考块。约束：`tool_choice` 执行
- **Google Gemini** — GenerateContent API，函数声明，思想处理。约束：带 `function_calling_config` 的 `tool_config`

额外提供者通过模型前缀路由处理至 OpenAI 兼容端点（DeepSeek, xAI, Mistral, Moonshot, Azure）。Ollama 支持 `format: "json"` 用于本地约束输出。

`ProviderKind` 实现了 `Copy + Eq` — 提供者跟踪其种类以实现阶段特定行为（例如，选择正确的约束解码模式）。

### 渠道桥接

每个 11 个桥接都遵循统一模式：
- `start_*` / `stop_*` — 生成/杀死桥接任务
- `get_*_config` / `set_*_config` — 读写桥接配置
- `*_status` — 检查桥是否正在运行
- `approve_user` / `deny_user` / `remove_user` — 用户访问控制
- 收到的消息 → 路由到配置的智能体 → 响应发回

### 记忆 (`memory/`)

混合检索系统：
1. **BM25全文搜索** — SQLite FTS5虚拟表
2. **矢量相似度** — 基于 Ollama 生成的嵌入的余弦相似性
3. **加权合并** — 合并 BM25 和矢量得分
4. **MMR重新排序** — 基于 Jaccard 多样性 (λ=0.7)
5. **时间衰减** — 30天半衰期的指数衰减

自动回忆将相关记忆注入智能体上下文。自动捕获从对话中提取关键事实。

### 工具RAG — "图书馆管理员方法" (`tool_index.rs`)

> *[完整案例研究 →](docs/reference/librarian-method.mdx)*

Pawz 使用**工具RAG**（Retrieval-Augmented Generation for tools）来解决"工具膨胀"问题。不是将所有工作流和工具定义转储到每个LLM请求中，而是智能体按需通过语义搜索发现工具 — 就像一个图书馆读者问图书管理员合适的书籍一样。

```
┌─────────────────────────────────────────────────────────────────┐
│  PATRON  (Cloud LLM — Gemini / Claude / GPT)                   │
│                                                                  │
│  System prompt:                                                  │
│  "You have 17 skill domains. To use one, call request_tools."   │
│                                                                  │
│  Always loaded: memory_store, memory_search, soul_read,         │
│    soul_write, soul_list, self_info, read_file, write_file,     │
│    list_directory, request_tools                                 │
│                                                                  │
│  Token cost: ~800 (vs ~7,500 with all tools)                    │
└──────────────────────┬──────────────────────────────────────────┘
                        │  request_tools("send email to john")
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  LIBRARIAN  (Embedding model — e.g. Ollama nomic-embed-text, ~50ms)  │
│                                                                  │
│  1. Embed the query → 768-dim vector                            │
│  2. Cosine similarity against tool index                         │
│  3. Domain expansion (email_send → also email_read)             │
│  4. Return matching tool schemas                                 │
│                                                                  │
│  Fallbacks: exact name match, domain request                     │
└──────────────────────┬──────────────────────────────────────────┘
                        │  tools injected into next agent round
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  LIBRARY  (ToolIndex — in-memory, ~230KB)                       │
│                                                                  │
│  Workflow + tool definitions stored as embedding vectors           │
│  Grouped into 17 skill domains:                                  │
│    system, filesystem, web, identity, memory, agents,           │
│    communication, squads, tasks, skills, dashboard, storage,    │
│    email, messaging, github, integrations, trading              │
│                                                                  │
│  Built once on first request_tools call, persists in memory     │
└─────────────────────────────────────────────────────────────────┘
```

**它是如何工作的 — 回合击：**

```
Round 1: User says "Email john about the quarterly report"
  Agent has: 10 core tools (including request_tools)
  Agent calls: request_tools({"query": "email sending capabilities"})
  Librarian: embeds query → cosine search → returns email_send, email_read
Round 2: Tools hot-loaded into active round
  Agent now has: 10 core + email_send + email_read
  Agent calls: email_send({to: "john@...", subject: "Q4 Report"})
Round 3: Done ✅  (used 12 tools total, not 75)
```

**架构决策：**
- **智能体驱动发现**：LLM 形成搜索查询（它有意图），而不是从原始用户消息猜测的预过滤器
- **域扩展**：匹配 `email_send` 也返回 `email_read` — 同级一起出现
- **回合延留**：在回合 N 中加载的工具在回合 N+1 中继续保持可用（按聊天回合清除）
- **Swarm旁路**：Swarm/编排智能体获得所有工具（它们是自主的，无需时间进行发现）
- **零成本搜索**：使用嵌入管道（推荐Ollama）— 在本地运行时无云费用

**标记节省：** 每个请求节省 5,000–8,500 个标记，释放 32K 上下文窗口的约 25% 用于实际对话。

**文件：**
- `engine/tool_index.rs` — `ToolIndex` 结构体，嵌入，余弦相似性，域映射
- `engine/tools/request_tools.rs` — `request_tools` 元工具（图书管理员调用）
- `engine/chat.rs` — `build_chat_tools()` 过滤核心 + 加载的工具
- `engine/agent_loop/mod.rs` — 在回合之间热加载新发现的工具
- `engine/state.rs` — `tool_index` + `loaded_tools` 在 `EngineState` 上

### MCP 桥接 — "工头协议" (`mcp/`)

> *[完整案例研究 →](docs/reference/foreman-protocol.mdx)*

MCP 桥接是将 OpenPawz 连接到通过嵌入式 n8n 引擎**25,000+集成**的突破。不是硬编码工具，智能体会发现并通过模型上下文协议 (MCP) 执行自动部署的工作流。n8n 的 MCP 服务器公开三个工作流级工具（`search_workflows`、`execute_workflow`、`get_workflow_details`）—— 不是单个节点操作。工作者模型（"工头"）使用自描述 MCP 模式执行所有 MCP 工具调用 — 任何提供商来自任何模型都可以工作，建议使用本地 Ollama 模型以零成本。

```
┌─────────────────────────────────────────────────────────────────┐
│  ARCHITECT  (Cloud LLM — Gemini / Claude / GPT)                 │
│                                                                  │
│  "I need to generate a QR code..."                              │
│  → request_tools("QR code generation")                          │
│  → Librarian finds n8n-nodes-base.qrCode                        │
│  → Spawns worker model to execute via MCP                        │
└──────────────────────┬──────────────────────────────────────────┘
                        │  MCP tool call
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  WORKER MODEL  (Any model — e.g. Ollama qwen2.5-coder:7b, ~4.7 GB)   │
│                                                                  │
│  Executes MCP tool calls against n8n                            │
│  Cheaper than the Architect — or free if running locally        │
│  Handles structured input/output mapping                        │
└──────────────────────┬──────────────────────────────────────────┘
                        │  JSON-RPC over Streamable HTTP
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  EMBEDDED n8n  (Docker or npx — auto-provisioned)               │
│                                                                  │
│  Auto-starts at app launch (8s delay, background)               │
│  Docker: bollard crate, container lifecycle management          │
│  Fallback: npx n8n start                                        │
│  MCP server at http://127.0.0.1:5678/mcp-server/http           │
│                                                                  │
│  MCP tools: search_workflows, execute_workflow,                 │
│    get_workflow_details (workflow-level, NOT individual nodes)   │
└──────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  25,000+ COMMUNITY INTEGRATIONS (via auto-deployed workflows)   │
│                                                                  │
│  1,000+ npm packages: QR codes, PDF, OCR, CRMs, ERPs,         │
│  databases, IoT, messaging, analytics, AI services...           │
│  Paw auto-deploys per-service workflows on package install      │
└─────────────────────────────────────────────────────────────────┘
```

**架构决策：**
- **可流式HTTP传输** (`transport.rs`) — 连接到 n8n 的 MCP 端点在 `/mcp-server/http` 使用 JWT 身份验证。处理 SSE 响应格式。断开时重新连接。
- **自动注册** (`registry.rs`) — `register_n8n()` + `N8N_MCP_SERVER_ID` 自动注册 n8n 作为 MCP 服务器。`pascal_to_snake()` 将工具名称重映射为蛇形大小写以兼容 LLM。
- **延迟确保就绪** (`n8n.rs`) — `lazy_ensure_n8n()` 在每次社区包安装或 MCP 刷新前检查 n8n 健康状态。确保 n8n 始终可用。
- **工作流自动部署** — 当安装社区包时，Paw 通过 `engine_n8n_deploy_mcp_workflow` 自动部署每服务工作流。可通过 `execute_workflow` 执行该工作流。
- **架构师/工作者分离** — 云LLM规划；一个更便宜的工作者模型（例如 Ollama `qwen2.5-coder:7b` 或任何云模型）执行MCP调用。工具执行最低或零成本。

**文件：**
- `engine/mcp/transport.rs` — `StreamableHttpTransport`, `StdioTransport`, `McpTransportHandle`
- `engine/mcp/client.rs` — MCP 客户端: 初始化，列出工具，调用工具
- `engine/mcp/registry.rs` — 自动注册，`pascal_to_snake()`，工具重映射
- `engine/mcp/n8n.rs` — `lazy_ensure_n8n()`，`ensure_n8n_ready()`，社区包自动安装
- `engine/tools/n8n.rs` — 智能体工具: `search_ncnodes`, `install_n8n_node`, `mcp_refresh`
- `engine/orchestrator/sub_agent.rs` — 带 MCP 工具布线的工作者智能体生成
- `commands/ollama.rs` — 工作者模型管理（拉取，状态，Modelfile）

### 可扩展性层级

Pawz 有三级可扩展性系统：

| 层级 | 格式 | 功能 |
|------|--------|-------------|
| **技能** (第一级) | `SKILL.md` | 仅提示词 — 注入智能体上下文的 Markdown 说明书 |
| **集成** (第二级) | `pawz-skill.toml` | 凭据 + 二进制检测 + 智能体工具 + 仪表板小部件 |
| **扩展** (第三级) | `pawz-skill.toml` | 自定义边栏视图 + 持续键值存储 |

内置集成编译到 Rust 二进制文件中（400+ 本地）。MCP 桥接将其扩展至**25,000+**的自动部署工作流，这些工作流组合了 n8n 社区节点。社区技能使用 [skills.sh](https://skills.sh) 生态系统。第二级/第三级社区集成和扩展的 TOML 清单系统已实现 — TOML 加载器、PawzHub 注册表浏览器、仪表板小部件、技能输出持久化和扩展存储都在运行。

### 社区技能 (`skills/community/`)

社区技能子系统连接到 [skills.sh](https://skills.sh) 开源目录:

- **搜索** (`search.rs`) — 查询 skills.sh API (`/api/search?q=`)
- **安装** (`store.rs`) — 从 GitHub 仓库获取 SKILL.md，本地存储
- **解析** (`parser.rs`) — 提取 YAML frontmatter + Markdown 正文
- **GitHub** (`github.rs`) — 浏览仓库树以查找 SKILL.md 文件

智能体工具：`skill_search`, `skill_install`, `skill_list` — 智能体可以通过对话找到和安装技能。

---

## TypeScript 前端

### 视图

每个视图都是一个独立的TypeScript模块，渲染到其对应的HTML容器中。视图管理其自己的状态和DOM操作。无框架 — 纯 `document.getElementById` / `innerHTML`。

### 特性模块 (原子设计)

特征模块遵循 atoms → molecules → index 模式：
- **Atoms** — 纯函数、常量、类型定义。零副作用。
- **Molecules** — 组合atoms和调用Tauri IPC的函数。可能有副作用。
- **Index** — 模块的barrel导出。

### IPC桥接

前端仅通过Tauri的`invoke()`函数与Rust后端通信。`engine-bridge.ts`模块使用TypeScript类型包装所有IPC调用。

事件驱动更新使用Tauri的事件系统 — 后端发出事件（例如用于流令牌的`engine-event`，用于实时智能体变化的`agent-profile-updated`）且前端订阅。

---

## 数据库

通过 Tauri 的 SQL 插件使用 SQLite。表:

| 表 | 用途 |
|-------|---------|
| `agent_modes` | 智能体模式预设 |
| `projects` | 构建/研究/创建项目 |
| `project_files` | 项目内文件 |
| `project_agents` | 后端创建智能体（编排器） |
| `automation_runs` | Cron执行日志 |
| `research_findings` | 研究发现 |
| `content_documents` | 内容创作文档 |
| `email_accounts` | IMAP/SMTP 配置 |
| `emails` | 消息 + AI 草稿 |
| `credential_activity_log` | 凭据访问审计跟踪 |
| `security_audit_log` | 安全事件日志 |
| `security_rules` | 用户定义的允许/拒绝模式 |
| `sessions` | 智能体聊天会话 |
| `messages` | 会话消息历史 |
| `config` | 智能体和引擎配置 |
| `memories` | 语义记忆（BM25 + 向量） |
| `trade_history` | DEX/Solana 交易日志 |
| `positions` | 开仓交易头寸 |
| `tasks` | 看板任务（带有事件触发器 + 持续模式） |
| `task_activity` | 任务活动日志 |
| `community_skills` | 已安装社区技能 |
| `skill_outputs` | 来自技能输出工具的仪表板小部件数据 |
| `skill_storage` | 扩展的持续键值存储 |
| `agent_messages` | 智能体间直接消息和广播 |
| `squads` | 智能体小组定义 |
| `squad_members` | 小组成员（智能体 + 角色） |
| `tool_embeddings` | 第 2 阶段：持久工具嵌入向量（SQLite 支持） |
| `tool_sequences` | 第 4 阶段：用于推测性预测的工具转换模式 |

凭据字段使用 AES-256-GCM 加密。加密密钥存储在操作系统密钥链中（macOS Keychain / Linux libsecret / Windows 证书管理器）。每个字段 12 字节随机随机数。从传统 XOR 格式自动迁移。

---

## 质量

| 指标 | 值 |
|--------|-------|
| Rust 测试 | 1,008 (846 单元 + 162 阶段特定) |
| TypeScript 测试 | 2,166 (24 测试文件) |
| 智能体执行测试 | 162 (第 0 阶段：20 · 第 1 阶段：19 · 第 2 阶段：31 · 第 3 阶段：38 · 第 4 阶段：54) |
| CI 作业 | 3 并行（Rust + TS + 安全审计） |
| Clippy 警告 | 0 （通过 `-D warnings` 强制执行） |
| 已知 CVE | 0 （`cargo audit` + `npm audit`） |
| 错误处理 | 12 变种类型 `EngineError` （thiserror 2） |
| 凭据加密 | AES-256-GCM |
| IPC 命令 | 158 |
| SQLite 表 | 23 |

(文件结束 - 共 614 行)
