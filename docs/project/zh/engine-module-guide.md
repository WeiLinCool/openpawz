# 引擎模块指南

本指南面向希望快速了解`src-tauri/src/engine/`的参与者。

从`[mod.rs](../../../src-tauri/src/engine/mod.rs)`开始：它是Rust后端的目录。

大多数贡献工作都分为以下四个路径之一：

1. IPC命令通过`src-tauri/src/lib.rs`和`src-tauri/src/commands/`进入。

2. 请求被路由到`engine/`模块中的一个或多个。

3. 从`sessions/`、`skills/`或其他存储辅助程序中读取或写入状态。

4. 通过Tauri事件或命令响应将结果流回前端。

## 如何阅读引擎

- 首先阅读`[ARCHITECTURE.md](../../reference/zh/architecture-full.md)`以了解整个系统的视图。

- 接着阅读`[src-tauri/src/engine/mod.rs](../../../src-tauri/src/engine/mod.rs)`以查看顶级模块。

- 当调试前端操作时，从`src-tauri/src/lib.rs`或`src-tauri/src/commands/`中的Tauri命令开始，追踪到拥有该行为的引擎模块。

- 当添加行为时，优先考虑扩展现有模块，而不是创建新的顶级模块。

## 顶级模块映射

### 核心运行时

- `agent_loop`：运行主要代理循环，包括模型流和工具执行。

- `audit`：记录审计和合规性事件，以便稍后可检查操作。

- `chat`：构建聊天请求，组装提示和工具，并在对话周围应用循环安全性检查。

- `events`：发出前端可以订阅的运行时事件。

- `state`：持有跨命令和后台任务使用的共享引擎状态。

- `types`：多个模块依赖的共享后端类型。

- `util`：小型共享辅助工具，不值得拥有自己的域模块。

### 网络和提供者集成

- `http`：由引擎功能使用的集中式HTTP客户端辅助工具和请求粘合剂。

- `oauth`：OAuth辅助工具和用于需要令牌交换的提供者或集成的流程。

- `providers`：模型供应商（如OpenAI、Anthropic和Google）的提供者抽象。

- `pricing`：用于估计或记录模型成本的令牌和定价辅助工具。

- `web`：面向浏览器的后端辅助工具和自动化支持。

## Where To Go Next

- For frontend structure, read [`docs/frontend-patterns.md`](./frontend-patterns.md).
- For channel-specific contribution work, read [`docs/channel-bridge-guide.md`](./channel-bridge-guide.md).
