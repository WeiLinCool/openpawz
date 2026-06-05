# 为 OpenPawz 做出贡献

感谢您对参与贡献感兴趣！无论您是编写 Rust、TypeScript、文档还是测试 —— 这里都有一席之地。

---

## 从哪里开始

| 我想要… | 从这里开始 |
|------------|-----------|
| **修复小问题** | 浏览 [`good first issue`](https://github.com/OpenPawz/openpawz/labels/good%20first%20issue) — 这些问题范围明确，并已详细描述，等待着您 |
| **编写 Rust** | 按标签查询 [`area: rust`](https://github.com/OpenPawz/openpawz/labels/area%3A%20rust) — 引擎、频道、提供商、工具 |
| **编写 TypeScript** | 按标签查询 [`area: typescript`](https://github.com/OpenPawz/openpawz/labels/area%3A%20typescript) — 视图、组件、功能特性 |
| **改进 UI/UX** | 按标签查询 [`area: ui`](https://github.com/OpenPawz/openpawz/labels/area%3A%20ui) — 主题、无障碍、布局 |
| **编写测试** | 查看 [#32 — 测试覆盖率](https://github.com/OpenPawz/openpawz/issues/32) — 了解代码库的好方法 |
| **编撰文档** | 按标签查询 [`area: docs`](https://github.com/OpenPawz/openpawz/labels/area%3A%20docs) 或查看 [#34](https://github.com/OpenPawz/openpawz/issues/34) |
| **翻译** | 查看 [#25 — README 翻译](https://github.com/OpenPawz/openpawz/issues/25) 和 [#24 — i18n](https://github.com/OpenPawz/openpawz/issues/24) |
| **为我的操作系统打包** | 按标签查询 [`area: packaging`](https://github.com/OpenPawz/openpawz/labels/area%3A%20packaging) — Homebrew、AUR、Flatpak、Snap、Windows |
| **做一些大型工作** | 寻找 [`help wanted`](https://github.com/OpenPawz/openpawz/labels/help%20wanted) + [`difficulty: hard`](https://github.com/OpenPawz/openpawz/labels/difficulty%3A%20hard) |

> **认领一个问题** 通过评论 "I'd like to work on this" — 我们会在 24 小时内将其分配给您。

> **有问题？** 在 [Discord](https://discord.gg/wVvmgrMV) 或 [GitHub Discussions](https://github.com/OpenPawz/openpawz/discussions) 上提问。没有问题是太基础的问题。

---

## 开发环境设置

### 先决条件

- **Node.js** 18+ — [nodejs.org](https://nodejs.org/)
- **Rust** (最新的稳定版) — [rustup.rs](https://rustup.rs/)
- **prek** — 快速的 pre-commit 钩子 — [github.com/j178/prek](https://github.com/j178/prek)
- **Tauri v2 先决条件** — [平台特定依赖项](https://v2.tauri.app/start/prerequisites/)

### 运行起来

```bash
git clone https://github.com/OpenPawz/openpawz.git
cd openpawz
pnpm install          # 安装所有依赖，包括用于 UI 动画的 anime.js
prek install          # 设置 git 钩子
pnpm tauri dev
```

该命令启动 Tauri 开发服务器，支持前端热重载和 Rust 后端实时重建。

> **更新后拉取**，总会重新运行 `pnpm install` 以前去获取在构建之前的任何新依赖。

### 验证更改

```bash
# 一次性运行所有 pre-commit 钩子 (推荐)
prek run --all-files

# 运行所有 TypeScript 测试 (360 个测试)
npx vitest run

# 运行所有 Rust 测试 (242 个测试)
cd src-tauri && cargo test

# TypeScript 类型检查 + lint
npx tsc --noEmit
npx eslint src/

# Rust lint (强制零警告)
cd src-tauri && cargo clippy -- -D warnings

# 代码格式化
npx prettier --check "src/**/*.ts"
cd src-tauri && cargo fmt --check

# 全生产构建
pnpm tauri build
```

---

## 项目结构

| 目录 | 语言 | 内容说明 |
|-----------|----------|-------------|
| `src/` | TypeScript | 前端 — 视图、功能特性、组件、样式 |
| `src-tauri/src/` | Rust | 后端引擎 — 智能体循环、工具、频道、提供商 |
| `src/views/` | TypeScript | 每个 UI 页面对应一个文件（智能体、任务、邮箱等） |
| `src/features/` | TypeScript | 使用原子设计的特性的模块（原子 → 分子 → 索引） |
| `src-tauri/src/engine/` | Rust | 所有引擎模块 (19k 代码行) |

参见 [ARCHITECTURE.md](../../reference/zh/architecture-full.md) 获取详细分解。

## 开发者指南

如果您希望更快地浏览代码库，请从这些面向贡献者的文档开始：

- [引擎模块指南](docs/engine-module-guide.md)
- [前端模式](docs/frontend-patterns.md)
- [频道桥接指南](docs/channel-bridge-guide.md)

---

## 代码风格

### TypeScript
- 原生 DOM — 无 React、无 Vue、无框架
- 每个视图通过 `document.getElementById` 渲染到其 HTML 容器中
- 尽可能使用 `const` 而不是 `let`
- 使用模板字面量生成 HTML
- Material Symbols 作图标 — 使用 `<span class="ms">icon_name</span>`
- 使用 `components/helpers.ts` 中的 `escHtml()` / `escAttr()` 转义用户内容

### Rust
- 标准 Rust 格式 (`cargo fmt`)
- Tauri 命令是带有 `#[tauri::command]` 的异步函数
- 所有命令都在 `lib.rs` 中注册
- 频道桥接遵循统一模式（启动/停止/状态/配置/批准/拒绝）
- 错误处理通过类型化的 `EngineError` 枚举（12 个变量）— Tauri 命令边界以 `.map_err(|e| e.to_string())` 进行转换

### CSS
- 单个 `styles.css` 文件包含所有样式
- CSS 自定义属性用于主题（`--bg-primary`，`--text`，`--accent` 等）
- BEM 类命名法 (`.view-header`，`.agent-dock-toggle`，`.nav-item`)
- 无 CSS 预处理器

---

## 进行更改

### 前端 (TypeScript)

1. 视图位于 `src/views/` — 每个页面一个文件
2. 共享逻辑进入 `src/components/`
3. 特定功能代码使用 `src/features/{feature}/` 中的原子模式
4. 对 Rust 后端的 IPC 调用使用 Tauri 的 `invoke()`
5. 所有 IPC 类型在 `src/engine/atoms/types.ts` 中定义

### 后端 (Rust)

1. 新的 Tauri 命令放在 `src-tauri/src/engine/` 下的适当文件中
2. 在 `src-tauri/src/lib.rs` 中注册命令
3. 如果添加新命令文件，则还需在 `src-tauri/src/commands/mod.rs` 中声明命令模块

### 添加频道桥接

每个桥接遵循相同的模式。在 `src-tauri/src/engines/` 中创建一个新文件（或复杂桥接的目录模块），包含：
- `start_*` / `stop_*` — 启动/杀死桥接任务
- `get_*_config` / `set_*_config` — 配置管理
- `*_status` — 运行状态检查
- `approve_user` / `deny_user` / `remove_user` — 访问控制
- 消息处理程序 → 路由至配置的智能体 → 发送响应回来

### 添加 AI 提供商

对于兼容 OpenAI 的提供商：
1. 在 `commands.rs` → `resolve_provider_for_model()` 中添加模型前缀路由
2. 在 `settings-models.ts` 的前端常量中添加提供商类型

对于不兼容的提供商：
1. 在 `providers.rs` 中添加一个新的匹配分支，包含提供商的流式 API
2. 处理响应格式、工具调用约定和错误映射

---

## 拉取请求

1. Fork 仓库并创建功能分支
2. 进行您的更改
3. 运行 `npx tsc --noEmit` 和 `cd src-tauri && cargo check` — 两个命令都必须通过
4. 写一份清晰的 PR 描述，解释更改的内容和原因
5. 保持 PR 专注 — 每个 PR 一个功能或修复

---

## CI 构建流水线

每次推送和 PR 触发 4 个并行 CI 作业：

| 作业 | 检查内容 | 超时 |
|-----|---------------|--------|
| **Pre-commit (prek)** | 来自 `.pre-commit-config.yaml` 的所有钩子 — 空白行尾、YAML/JSON/TOML、ESLint、Prettier、tsc、cargo fmt、clippy、约定提交 | 10 分钟 |
| **TypeScript** | `tsc --noEmit` → `eslint` → `vitest run` (360 组测试) → `prettier --check` | 10 分钟 |
| **Rust** | `cargo check` → `cargo test` (242 个测试) → `cargo clippy -- -D warnings` | 30 分钟 |
| **安全审计** | `cargo audit` → `npm audit --audit-level=high` | 10 分钟 |

所有 3 个作业必须通过。强制零 clippy 警告。强制执行零已知漏洞。

### 编写测试

**Rust 测试**位于每个源文件内的 `#[cfg(test)]` 模块中，此外还有 `src-tauri/tests/` 中的 4 个集成测试文件。运行 `cd src-tauri && cargo test`。

**TypeScript 测试**使用 Vitest。测试文件与源文件共存（如 `security.test.ts` 紧邻 `security.ts`）。运行 `npx vitest run`。

添加新功能时，应包括以下测试：
- 正常路径和错误情况
- 边界情况（空输入、边界值）
- 安全相关行为（注入模式、访问控制）

---

## 提交问题报告

在 GitHub 上开具一个问题，并包含以下内容：
- 期望发生什么事
- 实际发生了什么
- 复现步骤
- 操作系统及版本
- 相关错误消息或截图

关于安全漏洞，请参见 [SECURITY.md](../../reference/zh/security-full.md)。

---

## 许可证

通过贡献，您同意您的贡献将被授权遵循 MIT 许可证。
