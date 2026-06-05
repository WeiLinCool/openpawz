# 频道桥接指南

本指南解释了在 OpenPawz 中如何构建频道桥接以及添加新的桥接时需要处理的事项。

该项目已对大多数桥接建立了统一的模式。除非你的目标平台有充分理由成为特殊案例，比如 Telegram 的数值用户 ID 和自定义状态类型，否则请重用该模式。

## 频道桥接的作用

桥接将外部聊天平台连接到本地智能体运行时。高层的流程如下：

1. 接收来自频道的消息
2. 检查发送者是否被允许
3. 将消息路由到配置的智能体
4. 运行智能体循环
5. 如果平台有消息长度限制则拆分回复
6. 将响应发回频道

这些共享助手位于 [`src-tauri/src/engine/channels/mod.rs`](../../../src-tauri/src/engine/channels/mod.rs)。

## 标准后端合约

大多数频道应提供以下函数：

- `start_bridge(app_handle)`
- `stop_bridge()`
- `get_status(&app_handle)`
- `load_config(&app_handle)`
- `save_config(&app_handle, &config)`
- `approve_user(&app_handle, &user_id)`
- `deny_user(&app_handle, &user_id)`
- `remove_user(&app_handle, &user_id)`

该合约在 [`src-tauri/src/commands/channels.rs`](../../../src-tauri/src/commands/channels.rs) 中的宏中记录和使用。

如果你的桥接符合这种形状，你几乎可以免费获得 Tauri 命令层。

## 你应该重用的共享助手

来自 [`src-tauri/src/engine/channels/mod.rs`](../../../src-tauri/src/engine/channels/mod.rs)：

- `load_channel_config()` 和 `save_channel_config()` 用于配置持久化
- `run_channel_agent()` 或 `run_routed_channel_agent()` 用于将消息路由到引擎
- `split_message()` 用于平台消息大小限制
- `approve_user_generic()`、`deny_user_generic()` 和 `remove_user_generic()` 用于访问控制流程

除非平台确实需要不同的行为，否则不要在每个桥接中重复这些助手。

## 新增标准频道的文件接触点

### Rust 后端

1. 创建引擎模块，通常为 `src-tauri/src/engine/<channel>.rs`
2. 从 [`src-tauri/src/engine/mod.rs`](../../../src-tauri/src/engine/mod.rs) 导出它
3. 在 [`src-tauri/src/commands/channels.rs`](../../../src-tauri/src/commands/channels.rs) 中添加 `channel_commands!(...)` 条目
4. 在 [`src-tauri/src/lib.rs`](../../../src-tauri/src/lib.rs) 中注册生成的处理函数

### 前端

1. 根据需要在共享前端类型中添加配置和状态类型
2. 在 [`src/engine/molecules/ipc_client.ts`](../../../src/engine/molecules/ipc_client.ts) 中添加类型化的 IPC 包装器
3. 在 [`src/views/channels/atoms.ts`](../../../src/views/channels/atoms.ts) 中添加频道元数据
4. 扩展 [`src/views/channels/molecules.ts`](../../../src/views/channels/molecules.ts) 中的开关语句
5. 在 `src/views/channels/setup.ts` 中添加设置界面处理（如果频道需要自定义字段）

## 建议的后端结构

标准桥接文件通常包含：

- 配置结构体
- 状态结构体
- 桥接是否正在运行的全局运行时状态
- 针对目标平台的 API 客户端或套接字助手
- 一个接收循环或回调，将入站消息转换为智能体调用
- 访问检查
- 响应发送助手
- 公共的 `start_bridge` 和 `stop_bridge` 入口点

[`src-tauri/src/engine/telegram.rs`](../../../src-tauri/src/engine/telegram.rs) 是一个有用的详细示例，即使是特殊情况的桥接。

## 访问控制模式

频道桥接不仅仅是传输层。它们还强制执行谁可以与智能体交谈。

常见策略模式：

- `open`: 任何人都可以发送消息
- `allowlist`: 只有经批准的用户可以发送消息
- `pairing`: 首次联系会创建待处理的请求，直到维护人员批准或拒绝

如果平台能够可靠地识别用户，它应该支持这些访问模式，除非有明显限制。

## 前端频道管理模式

前端频道屏幕统一处理桥接。

[`src/views/channels/atoms.ts`](../../../src/views/channels/atoms.ts):

- 声明面向用户的设置元数据
- 定义表单字段和配置构建器

[`src/views/channels/molecules.ts`](../../../src/views/channels/molecules.ts):
- 将频道名称映射到 `getConfig`, `setConfig`, `start`, `stop`, `status`, `approve` 和 `deny` 调用
- 渲染卡片和待定用户 UI

[`src/views/channels/index.ts`](../../../src/views/channels/index.ts):

- 连接模态事件
- 加载已配置的频道
- 处理启动时的自动启动行为

如果你添加了新桥接但忘记了前端开关点之一，后端可能正常工作，而 UI 静默地不暴露它。

## Telegram 是主要特例

Telegram 在 [`src-tauri/src/commands/channels.rs`](../../../src-tauri/src/commands/channels.rs) 中手写，因为：

- 用户 ID 是 `i64`，而不是 `String`
- 状态类型是定制的
- 一些用户管理调用是异步的

这是一个有用的提醒：首先遵循标准模式，只有在平台 API 强迫你这样做的时候才打破它。

## 新桥接清单

1. 引擎模块已创建并导出
2. 配置可以加载和保存
3. 桥接可以启动、停止和报告状态
4. 入站消息通过共享访问检查
5. 入站消息使用 `run_channel_agent()` 或等效方式路由到智能体
6. 回复在适用平台限制处使用 `split_message()`
7. Tauri 命令已生成或添加
8. `lib.rs` 注册所有命令处理器
9. 前端 IPC 客户端暴露频道方法
10. 频道 UI 可以配置、启动、停止和审查待定用户

## 推荐的首个任务

在编写整个新桥接之前，跟踪现有桥接的端到端：

1. 后端桥接模块
2. `commands/channels.rs`
3. `lib.rs`
4. `ipc_client.ts`
5. `src/views/channels/atoms.ts`
6. `src/views/channels/molecules.ts`

一旦路径清晰，添加新桥接就主要是个一致性练习，而不是发现性练习。
