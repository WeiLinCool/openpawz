# OpenPawz CLI

通往 OpenPawz AI 引擎的命令行接口。直接与桌面应用使用的相同 `openpawz-core` 库通信——零网络开销，共享 SQLite 数据库和配置。

## 安装

### 从源码安装

```bash
cd src-tauri
cargo build --release -p openpawz-cli
# 二进制文件位于 target/release/openpawz
```

### 移动到 PATH（可选）

```bash
cp target/release/openpawz ~/.local/bin/
# 或
sudo cp target/release/openpawz /usr/local/bin/
```

### Shell 补全

```bash
# Bash
openpawz completions bash > ~/.local/share/bash-completion/completions/openpawz

# Zsh
openpawz completions zsh > ~/.zfunc/_openpawz

# Fish
openpawz completions fish > ~/.config/fish/completions/openpawz.fish

# PowerShell
openpawz completions powershell >> $PROFILE
```

## 快速开始

```bash
# 运行设置向导（配置您的AI提供商）
openpawz setup

# 检查引擎状态
openpawz status

# 列出您的智能体
openpawz agent list

# 查看聊天历史
openpawz session list
openpawz session history <session-id>

# 存储一条记忆
openpawz memory store "用户偏好暗黑模式" --category preference --importance 7
```

## 全局标志

| 标志 | 简写 | 描述 | 默认值 |
|------|-------|-------------|---------|
| `--output <format>` | | 输出格式：`human`, `json`, `quiet` | `human` |
| `--verbose` | `-v` | 启用调试日志 | 关闭 |

`--output` 标志适用于每个命令：

```bash
# 机器可读的 JSON 输出（用于脚本）
openpawz agent list --output json

# 静默模式 — 仅ID（用于管道）
openpawz session list --output quiet

# 人类可读的表格（默认）
openpawz agent list
```

## 命令

### `setup` — 初始设置向导

交互式向导，配置您的 AI 提供商并写入引擎配置。

```bash
openpawz setup
```

支持的提供商：
1. **Anthropic** (Claude) — 默认
2. **OpenAI** (GPT)
3. **Google** (Gemini)
4. **Ollama** (本地，无需 API 密钥)
5. **OpenRouter**

如果已经配置，则会在覆盖前提示确认。

---

### `status` — 引擎诊断

```bash
openpawz status
```

显示：
- 引擎配置状态
- AI 提供商状态
- 内存配置
- 数据目录路径
- 会话计数

```bash
# 用于监控脚本的 JSON 输出
openpawz status --output json
```

---

### `agent` — 智能体管理

#### 列出所有智能体

```bash
openpawz agent list
```

```
智能体 ID            项目                 角色
------------------------------------------------------------
research-agent       default              研究员
code-review          backend              审查员
```

#### 获取智能体详情

```bash
openpawz agent get <agent-id>
```

显示智能体的文件及其大小。

#### 创建新智能体

```bash
openpawz agent create --name "研究智能体" --model claude-sonnet-4-20250514
```

`--model` 标志是可选的。自动生成唯一 ID。

#### 删除智能体

```bash
openpawz agent delete <agent-id>
```

删除智能体及其所有关联文件。

#### 读取智能体文件

```bash
openpawz agent file-get --id research-agent --file SOUL.md
```

读取并打印特定智能体文件的内容（例如 `SOUL.md`, `IDENTITY.md`, `persona.md`）。

#### 写入智能体文件

```bash
# 内联内容
openpawz agent file-set --id research-agent --file SOUL.md --content "你是一个细心的研究员。"

# 来自本地文件
openpawz agent file-set --id research-agent --file SOUL.md --from-file ~/agent-soul.md
```

#### 显示组合的智能体上下文

```bash
openpawz agent context research-agent
```

组装并打印完整的智能体上下文（结合灵魂 + 个性 + 身份文件）。

#### 将智能体导出到目录

```bash
openpawz agent export research-agent --output ./my-agent/
```

将所有智能体文件（SOUL.md, IDENTITY.md 等）写入目标目录以便版本控制或共享。

#### 从目录导入智能体文件

```bash
openpawz agent import --id research-agent --input ./my-agent/
```

读取目录中的 `.md`, `.json`, `.txt`, `.yaml`, `.yml`, `.toml` 文件并将它们存储为智能体文件。如果不存在则创建智能体。非常适合基础架构即代码的智能体配置。

```bash
# 示例：从 Git 仓库引导智能体
git clone https://github.com/team/agent-templates.git
openpawz agent import --id security-auditor --input agent-templates/security/
```

---

### `session` — 聊天会话管理

#### 列出会话

```bash
openpawz session list
openpawz session list --limit 10
```

```
ID                                       模型                          消息 更新时间
-----------------------------------------------------------------------------------------------
abc123-def456...                         claude-sonnet-4-20250514          24 2026-03-10 14:30
```

#### 查看聊天历史

```bash
openpawz session history <session-id>
openpawz session history <session-id> --limit 10
```

消息按角色着色（用户、智能助手、系统、工具）。

#### 重命名会话

```bash
openpawz session rename <session-id> "我的研究聊天"
```

#### 删除会话

```bash
openpawz session delete <session-id>
```

#### 清理空会话

```bash
openpawz session cleanup
```

移除超过1小时且没有消息的会话。

#### 修剪旧消息

```bash
openpawz session prune <session-id> --keep 20
```

移除会话中的旧消息，只保留最新的 N 条。用于回收长期运行会话的空间。

#### 导出会话到文件

```bash
openpawz session export <session-id> --output chat.json
```

导出完整会话元数据和消息历史作为 JSON 文件。

---

### `config` — 引擎配置

#### 查看当前配置

```bash
openpawz config get
```

以优美打印的 JSON 格式输出完整引擎配置。

#### 设置配置值

```bash
openpawz config set default_model claude-sonnet-4-20250514
openpawz config set daily_budget_usd 10.0
openpawz config set max_tool_rounds 15
```

值尽可能按照 JSON 格式解析（数字、布尔值、数组），否则作为字符串存储。

配置键根据已知允许列表进行验证。使用 `openpawz config keys` 查看所有有效键。

#### 列出有效配置键

```bash
openpawz config keys
```

#### 显示已配置的提供商

```bash
openpawz config providers
```

显示每个提供商的 ID、类型、默认模型以及是否设置了 API 密钥。

#### 获取数据目录路径

```bash
openpawz config path
```

---

### `memory` — 内存操作

#### 列出记忆

```bash
openpawz memory list
openpawz memory list --limit 50
```

```
[a1b2c3d4] (preference, imp:7) 用户偏好暗黑模式
[e5f6g7h8] (fact, imp:9) 项目使用 Rust 和 Tauri

2 memor(ies)
```

#### 存储新记忆

```bash
openpawz memory store "部署目标是 AWS us-east-1" \
  --category fact \
  --importance 8 \
  --agent research-agent
```

| 标志 | 默认 | 描述 |
|------|---------|-------------|
| `--category` | `general` | 类别：`general`, `preference`, `fact` 等 |
| `--importance` | `5` | 重要程度（0–10） |
| `--agent` | none | 与特定智能体关联 |

#### 删除记忆

```bash
openpawz memory delete <memory-id>
```

#### 搜索记忆

```bash
openpawz memory search "部署目标"
openpawz memory search "用户偏好" --limit 5
```

使用 FTS5 在所有存储的记忆中进行全文搜索。

#### 内存统计

```bash
openpawz memory stats
```

显示总内存计数、嵌入状态和按品类分解。

#### 导出记忆（加密）

```bash
openpawz memory export --output memories.enc --agent global --passphrase "my-secret"
```

将智能体（或用于全部的 'global'）的所有记忆导出为 AES-256-GCM 加密档案，有 HMAC 完整性验证。口令必须至少 8 个字符。

#### 导入记忆（加密）

```bash
openpawz memory import --input memories.enc --passphrase "my-secret"
```

解密并从档案导入记忆。重复 ID 会被跳过。

---

### `task` — 任务管理

#### 列出任务

```bash
openpawz task list
openpawz task list --status pending
```

显示所有任务的状态、优先级、标题和分配的智能体。

#### 获取任务详情

```bash
openpawz task get <task-id>
```

显示完整任务元数据，包括多智能体分配和 Cron 计划。

#### 创建任务

```bash
openpawz task create --title "审查安全审计" --priority high --agent research-agent
openpawz task create --title "日常报告" --description "生成晨间简报"
```

| 标志 | 默认 | 描述 |
|------|---------|-------------|
| `--title` | required | 任务标题 |
| `--description` | none | 详细描述 |
| `--priority` | `medium` | 优先级：`low`, `medium`, `high`, `critical` |
| `--agent` | none | 要分配的智能体 |

#### 更新任务

```bash
openpawz task update <task-id> --status done
openpawz task update <task-id> --priority urgent --title "新标题"
```

#### 删除任务

```bash
openpawz task delete <task-id>
```

#### 显示到期的任务：

```bash
openpawz task due
```

列出当前到期执行的 Cron 任务。

---

### `audit` — 审计追溯

所有引擎操作的防篡改 HMAC-SHA256 链式审计日志。

#### 查看最近的审计条目

```bash
openpawz audit log
openpawz audit log --limit 50
openpawz audit log --category tool_call
openpawz audit log --agent research-agent
```

| 过滤 | 描述 |
|--------|-------------|
| `--limit` | 最大条目数（默认25） |
| `--category` | `tool_call`, `memory`, `credential`, `api_request`, `security`, `cognitive`, `flow` |
| `--agent` | 按智能体 ID 过滤 |

#### 验证审计链完整性

```bash
openpawz audit verify
```

遍历整个 HMAC 链并验证每个条目的签名。如有完整性验证通过则返回退出码 0，被篡改则返回非零值。

```bash
# 用于 CI/监控脚本
if openpawz audit verify --output quiet; then
  echo "审计链正常"
else
  echo "警告：审计链被篡改！"
fi
```

#### 审计统计

```bash
openpawz audit stats
```

显示总条目数、时间范围和按品类分析。

---

### `project` — 多智能体项目协调

管理具有主管/工作者委派、团队构成和消息日志的多智能体项目。

#### 列出项目

```bash
openpawz project list
```

```
ID           状态         标题                           主管            智能体数量
-------------------------------------------------------------------------------------
proj-a1b2    running      后端重构                       architect       3
proj-c3d4    planning     安全审计                       sec-lead        2
```

#### 创建项目

```bash
openpawz project create --title "API 重新设计" --goal "将 REST API 现代化为 GraphQL" --boss architect-agent
```

使用主管智能体创建一个项目。主管会自动添加到团队中。

#### 获取项目详情

```bash
openpawz project get <project-id>
```

显示完整的项目元数据和团队名册，包括每个智能体的角色、专业、状态和当前任务。

#### 将智能体添加到项目

```bash
openpawz project add-agent --project proj-a1b2 --agent code-reviewer --role worker --specialty security
```

| 标志 | 默认 | 描述 |
|------|---------|-------------|
| `--role` | `worker` | `boss` 或 `worker` |
| `--specialty` | `general` | `coder`, `researcher`, `designer`, `communicator`, `security`, `general` |

#### 查看项目消息

```bash
openpawz project messages <project-id>
openpawz project messages <project-id> --limit 100
```

显示委派日志——项目内智能体之间交换的消息。

#### 更新项目状态

```bash
openpawz project update <project-id> --status completed
openpawz project update <project-id> --title "新项目名称"
```

状态值：`planning`, `running`, `paused`, `completed`, `failed`.

#### 删除项目

```bash
openpawz project delete <project-id>
```

---

### `engram` — 深层记忆与图谱探索

搜索和探索痕迹智能体内存子系统——具有图形关系的情节记忆、语义记忆和程序记忆。

```bash
# 情节 BM25 搜索
openpawz engram search "部署策略" --limit 20

# 语义 BM25 搜索
openpawz engram semantic "如何配置 OAuth" --limit 10

# 程序模式搜索
openpawz engram procedural "docker%" --limit 5

# 内存统计
openpawz engram stats
```

```
  情节记忆:   142 条
  语义记忆:    58 条
  程序记忆:  23 条
  边:      310 个关系
```

```bash
# 列出内存的图谱边
openpawz engram edges <memory-id> --limit 50

# 从节点运行扩散激活
openpawz engram activate <memory-id> --depth 3 --decay 0.5 --top-k 20

# 列出垃圾收集候选项
openpawz engram gc-candidates --limit 100
```

---

### `metrics` — 使用统计数据与成本跟踪

跟踪会话中的令牌使用情况、费用和模型分解。

```bash
# 今天的使用汇总
openpawz metrics today
```

```
  令牌数 (输入/输出):  12.4K / 8.2K
  费用:             $0.0341
  会话数:         7
```

```bash
# 最后 N 天的每日细分
openpawz metrics daily --days 7

# 日期范围
openpawz metrics range --from yyyy-mm-dd --to yyyy-mm-dd

# 模型级细分
openpawz metrics models
```

```
  模型                  输入令牌   输出令牌    费用
  ─────────────────────────────────────────────────────────
  claude-3.5-sonnet         45.2K       32.1K      $0.1247
  gpt-5.1                    12.8K        8.4K      $0.0382
  llama-3.1-70b              8.1K        5.2K      $0.0000
```

```bash
# 每个会话的使用情况
openpawz metrics session --limit 10

# 清除旧指标
openpawz metrics purge --before yyyy-mm-dd
```

---

### `providers` — 集成提供商状态

检查配置提供商的 OAuth 和 API 连接状态。

```bash
# 列出所有注册的提供商
openpawz providers list
```

```
  提供商        状态    基本 URL
  ────────────────────────────────────────────────────
  anthropic       ✓ 准备就绪   https://api.anthropic.com
  openai          ✓ 准备就绪   https://api.openai.com
  ollama          ✓ 准备就绪   http://localhost:11434
  google          ✗ —        https://generativelanguage.googleapis.com
```

```bash
# 仅显示就绪提供商
openpawz providers ready

# 检查特定提供商
openpawz providers check anthropic

# 统计注册提供商数量
openpawz providers count
```

---

### `doctor` — 引擎健康检查

针对 CI、监控和故障排除的综合诊断检查。如果检测到任何错误则返回退出码 1。

```bash
openpawz doctor
```

```
  ✓ 数据库        — 已连接， WAL 模式
  ✓ 密钥库        — OS 密钥链运行正常
  ✓ 引擎配置      — 已配置
  ✓ AI 提供商     — anthropic (已设置 API 密钥)
  ✓ 内存          — 存储 42 条目
  ✓ 审计链        — 128 条目，完整性正常
  ✓ 数据目录      — 存在且可写

  7/7 项检查通过
```

```bash
# 用于 CI 流水线
openpawz doctor --output quiet || exit 1

# 用于监控仪表板的 JSON
openpawz doctor --output json
```

---

### `bench` — 性能基准

核心引擎操作的内置计时，用于性能测试和回归检测。

#### 快速基准（内置）

```bash
openpawz bench quick
openpawz bench quick --iterations 500
```

```
  操作                                   迭代    总共 (µs)        单次 (µs)
  -------------------------------------------------------------------------
  session_create                          100         4320           43
  message_add                             100         3890           38
  memory_store                            100         5210           52
  memory_search_keyword                   100         1820           18
  audit_append                            100         8740           87
  audit_verify_chain (100 条目)             1          920          920
  task_create                             100         4150           41
  agent_file_set                          100         3680           36
  injection_scan                          100          540            5
  pii_detection                           100          310            3
  scc_issue_certificate                   100         9200           92
  pricing_estimate_cost                   100           80            0
```

使用隔离的内存数据库——可在任何时候运行而不影响生产数据。

#### 完整 Criterion 套件

`openpawz-bench` crate 包含 6 个 Criterion 测试框架，涵盖整个引擎的 100 多个基准：

| 目标 | 覆盖内容 |
|--------|----------|
| `session_bench` | 会话 CRUD、消息、任务、智能体文件 |
| `memory_bench` | 存储、关键词/BM25 搜索、列表、图操作、程序内存 |
| `engram_bench` | HNSW 插入/搜索、重新排序（RRF/MMR）、混合搜索、抽象树、标记器、感官缓冲区、工作记忆、情感 |
| `audit_bench` | 附加、验证链（100/1K/5K）、查询、统计、SCC 证书 |
| `security_bench` | 注入扫描（1KB–100KB）、PII 检测、加密/解密、约束解码 |
| `reasoning_bench` | 情感评分、编码强度、一致增强、定价、任务复杂度、工具元数据 |

```bash
# 运行所有 6 个基准套件，并附带 HTML 报告
openpawz bench full

# 运行特定基准目标
openpawz bench full --bench engram_bench

# 筛选到目标内的特定组
openpawz bench full --bench engram_bench hnsw
openpawz bench full --bench audit_bench scc
```

运行 Criterion 基准套件（`cargo bench -p openpawz-bench`），它会产生统计分析和 `target/criterion/` 中的 HTML 报告。

#### 生成报告

将 Criterion 保存的结果解析为整洁的 Markdown 报告：

```bash
# 从前现有结果生成
openpawz bench report

# 自定义输出路径
openpawz bench report -f perf-report.md

# 先运行基准，然后生成报告
openpawz bench report --run-first

# 运行特定套件，然后报告
openpawz bench report --run-first --bench session_bench

# 机器可读的 JSON 输出
openpawz bench report --output json
```

报告包含摘要表、每个类别的详细明细（均值/中位数/标准差）以及最慢/最快的前 10 项操作。参见 [docs/benchmarks.md](benchmarks.md) 了解完整的基准测试指南。

#### 使用 cargo 直接运行基准

```bash
cd src-tauri

# 专用 crate 的所有基准测试
cargo bench -p openpawz-bench

# 特定目标
cargo bench -p openpawz-bench --bench engram_bench
cargo bench -p openpawz-bench --bench security_bench

# 筛选到特定组
cargo bench -p openpawz-bench --bench engram_bench -- hnsw
cargo bench -p openpawz-bench --bench audit_bench -- scc
```

---

## 脚本示例

### 将所有会话导出为 JSON

```bash
openpawz session list --output json > sessions.json
```

### 删除所有空会话

```bash
openpawz session cleanup --output quiet
```

### 列出智能体 ID（用于管道）

```bash
openpawz agent list --output quiet | while read id; do
  echo "智能体: $id"
  openpawz agent get "$id" --output json
done
```

### 检查引擎是否已配置（CI/脚本）

```bash
if openpawz status --output json | grep -q '"provider": "configured"'; then
  echo "引擎就绪"
else
  echo "运行: openpawz setup"
  exit 1
fi
```

### 验证审计链完整性（CI/监控）

```bash
openpawz audit verify --output quiet || echo "警报：审计链被篡改"
```

### 在迁移前导出记忆

```bash
openpawz memory export --output backup.enc --passphrase "$BACKUP_KEY"
```

### 从脚本创建任务

```bash
TASK_ID=$(openpawz task create --title "部署审核" --priority high --output quiet)
echo "创建任务: $TASK_ID"
```

### 智能体上下文用于提示工程

```bash
openpawz agent context my-agent > /tmp/agent-context.txt
```

### 导出和导入智能体（备份/克隆）

```bash
openpawz agent export my-agent --output ./backup/my-agent/
# …稍后，或在另一台机器上：
openpawz agent import --id my-agent-clone --input ./backup/my-agent/
```

### 创建团队项目

```bash
openpawz project create --title "特性冲刺" --goal "发布 v2.0" --boss lead-agent
PID=$(openpawz project list --output quiet | tail -1)
openpawz project add-agent --project "$PID" --agent coder --specialty coder
openpawz project add-agent --project "$PID" --agent reviewer --specialty security
```

### 在 CI 中进行健康检查

```bash
openpawz doctor --output quiet || { echo "引擎不健康"; exit 1; }
```

### 性能回归检查

```bash
# 用于自动化跟踪的快速定时 JSON
openpawz bench quick --iterations 200 --output json > bench-results.json
```

## 数据位置

CLI 与桌面应用共享相同的数据目录：

| 平台 | 路径 |
|----------|------|
| macOS | `~/Library/Application Support/com.openpawz.app/` |
| Linux | `~/.local/share/com.openpawz.app/` |
| Windows | `%APPDATA%\com.openpawz.app\` |

SQLite 数据库、智能体文件和配置都存储在这里。通过 CLI 进行的更改会立即在桌面应用中可见，反之亦然。

## 安全性

- 所有密码操作都使用 AES-256-GCM 与 OS CSPRNG（`getrandom`）进行密钥/随机数生成
- 密钥材料存储在操作系统键链中（macOS 键链 / GNOME 键环 / Windows 凭据管理器）
- 内存中的密钥包装在 `Zeroizing<Vec<u8>>` 中——在释放时安全清除
- 通过对 HKDF-SHA256 的智能体密钥派生，使用领域分离
- PII 自动检测（17 个正则表达式）将记忆分类到安全等级中
- 用于防篡改操作历史记录的 HMAC-SHA256 链式审计日志
- 在 `setup` 期间输入的 API 密钥存储在引擎配置中——在生产使用中考虑通过技能保险库对其进行加密
