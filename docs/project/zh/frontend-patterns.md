# 前端模式

本指南解释了TypeScript前端是如何组织的，以及如何在不与现有结构冲突的情况下添加或扩展视图。

前端是纯TypeScript加上DOM API。没有React或Vue层。大多数屏幕遵循简单的规则：`index.ts`文件协调页面，`atoms.ts`保存纯辅助工具和类型，`molecules.ts`负责DOM更新或IPC密集型行为。

## 心智模型

- `src/views/`: 屏幕级模块，如今日、频道、任务和设置标签页。
- `src/components/`: 共享UI片段和通用DOM辅助工具。
- `src/features/`: 可重用的功能模块，使用相同的原子/分子分解方式。
- `src/engine/molecules/ipc_client.ts`: 所有Tauri `invoke()`调用的类型化包装器。
- `src/views/router.ts`: 将侧边栏/视图名称映射到实际视图加载器的中心位置。

## 典型视图结构

许多视图都遵循这种布局：

- `atoms.ts`: 类型、常量和纯转换辅助工具
- `molecules.ts`: 渲染、DOM监听器和IPC密集型函数
- `index.ts`: 将模块连接在一起的公共入口点

示例：

- [`src/views/today/index.ts`](../../../src/views/today/index.ts): 以编排优先的视图，一次性渲染，然后并行加载卡片
- [`src/views/channels/index.ts`](../../../src/views/channels/index.ts): 设定繁重的视图，负责设置事件监听器并将委托给`molecules.ts`
- [`src/views/channels/atoms.ts`](../../../src/views/channels/atoms.ts): 支持渠道的纯配置数据

## 路由模式

[`src/views/router.ts`](../../../src/views/router.ts) 是当你想知道屏幕是如何激活时要阅读的第一个文件。

关键概念：

- `allViewIds` 包含可能变为活动状态的DOM容器ID。
- `viewMap` 将逻辑导航名称映射到那些DOM容器。
- `switchView()` 处理导航高亮、容器激活和每视图加载函数。
- 视图通过调用导出的函数懒加载，例如 `loadToday()`、`loadChannels()` 或 `loadSettings()`。

如果你的新视图需要出现在导航中，通常需要：

1. HTML中的容器
2. `allViewIds` 中的路由条目
3. `viewMap` 中的映射
4. `switchView()` 中的case，调用你的加载器

## 渲染模式

代码库不使用虚拟DOM。大多数UI更新都是直接DOM操作。

常见模式：

- 使用模板字符串构建较大块的HTML。
- 当替换整个区域时，使用 `innerHTML` 插入它们。
- 使用来自共享辅助工具的辅助函数，如 `$`, `escHtml()` 和 `escAttr()`。
- 在 `atoms.ts` 中保持纯映射逻辑，并让 `molecules.ts` 操作DOM。
- 对于昂贵的页面，首先渲染外壳，然后在之后加载卡片或子部分。

今日视图是渐进渲染的良好示例：

1. 加载关键状态
2. 一次渲染页面
3. 启动并行异步获取
4. 让每个卡片独立更新自己

这种模式可防止一个缓慢的卡片阻塞整个页面。

## 状态模式

除非几个模块需要共享状态，否则状态通常对视图是局部的。

此仓库中的典型选项：

- `index.ts` 中的模块局部变量用于视图状态
- 从 `index.ts` 到 `molecules.ts` 的轻量级 setter/getter 桥接
- 在 `src/state/` 中的共享应用级状态
- 通过 `pawEngine.*` 调用的后端支持状态

今日视图使用了一个小的状态桥接：

- `index.ts` 拥有 `_tasks`
- `initMoleculesState()` 将 getter 和 setter 注入到 `molecules.ts`
- `molecules.ts` 可以使用共享状态进行渲染，而无需拥有事实来源

当您希望 `molecules.ts` 保持可测试且不依赖隐藏全局变量时，请使用此模式。

## IPC 模式

前端代码不应在任意文件中直接调用 Tauri `invoke()`。标准路径是：

1. 在 [`src/engine/molecules/ipc_client.ts`](../../../src/engine/molecules/ipc_client.ts) 中添加或重用一个类型化方法
2. 从 `src/engine` 导入 `pawEngine`
3. 从视图、组件或功能调用 `pawEngine.someMethod()`

好处：

- 找到所有后端API的一个地方
- 共享请求和响应类型
- 当命令名称或负载发生变化时更容易重构

## 添加新视图

使用此清单：

1. 创建 `src/views/<view-name>/`
2. 如果需要纯类型或映射辅助工具，则添加 `atoms.ts`
3. 为DOM渲染和副作用添加 `molecules.ts`
4. 添加 `index.ts` 作为视图的公共界面
5. 从 `index.ts` 导出加载/初始化函数
6. 将视图连接到 [`src/views/router.ts`](../../../src/views/router.ts)
7. 使用 `pawEngine` 进行后端调用，而不是裸调用 `invoke()`
8. 在创建新实用程序代码之前重用来自 `src/components/` 的共享辅助工具

## 使用 `components/` vs `features/` vs `views/` 的时机

- 如果代码属于一个页面或屏幕，则将其放在 `views/` 中。
- 如果是共享UI或通用辅助工具逻辑，则将其放在 `components/` 中。
- 如果是有自己的小型原子/分子结构的可重用功能，则将其放在 `features/` 中。

如果不确定，请从所属视图开始。一旦出现真正的重复，可以随后提取。

## 常见错误

- 在许多UI文件中混合裸 `invoke()` 调用
- 将DOM操作放入 `atoms.ts`
- 在呈现用户控制内容时不加转义
- 当只有一个面板或卡片需要更改时重新渲染整个页面
- 为只有单个视图使用的功能添加全局状态

## 推荐阅读顺序

1. [`src/views/router.ts`](../../../src/views/router.ts)
2. 一个简单视图，比如 [`src/views/today/index.ts`](../../../src/views/today/index.ts)
3. 一个设定复杂的视图，比如 [`src/views/channels/index.ts`](../../../src/views/channels/index.ts)
4. [`src/engine/molecules/ipc_client.ts`](../../../src/engine/molecules/ipc_client.ts)
