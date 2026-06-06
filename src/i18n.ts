export type AppLocale = 'en' | 'zh-CN';

const LOCALE_KEY = 'paw-locale';

const EN_TO_ZH: Record<string, string> = {
  'Verify your identity': '验证你的身份',
  'Unlock with System Password': '使用系统密码解锁',
  or: '或',
  Passphrase: '密钥',
  Unlock: '解锁',
  'Reset lock screen': '重置锁屏',
  'System Authentication': '系统认证',
  'Mac password or Touch ID': 'Mac 密码或 Touch ID',
  'Custom Passphrase': '自定义密钥',
  'Set your own code': '设置你自己的口令',
  Both: '两者都启用',
  'System auth + passphrase as backup': '系统认证 + 密钥备用',
  'No Protection': '不启用保护',
  'Skip lock screen': '跳过锁屏',
  'New passphrase': '新密钥',
  'Confirm passphrase': '确认密钥',
  'Set passphrase': '设置密钥',
  'Back to options': '返回选项',
  'Secured by OS Keychain': '由系统钥匙串保护',
  Notifications: '通知',
  'Collapse sidebar': '收起侧边栏',
  'Read All': '全部已读',
  'Mark all as read': '全部标为已读',
  Clear: '清空',
  'Clear all': '清空全部',
  'No notifications': '暂无通知',
  Today: '今日',
  Chat: '聊天',
  Agents: '智能体',
  Work: '工作',
  Tasks: '任务',
  Flows: '流程',
  Canvas: '画布',
  Connect: '连接',
  Integrations: '集成',
  Mail: '邮件',
  Channels: '频道',
  Workspace: '工作区',
  Skills: '技能',
  Foundry: '工坊',
  Settings: '设置',
  'Toggle theme': '切换主题',
  'Connecting...': '连接中...',
  Retry: '重试',
  'Retrying…': '重试中...',
  Reason: '原因',
  'Retry failed': '重试失败',
  Dismiss: '关闭',
  'Database connected successfully': '数据库连接成功',
  'Credential encryption restored': '凭据加密已恢复',
  'Database initialization failed. Storage-backed features will be unavailable.':
    '数据库初始化失败，需要存储的功能将不可用。',
  'OS keychain is unavailable. Credential storage is blocked and sensitive fields cannot be encrypted. Check your keychain service.':
    '系统钥匙串不可用，凭据存储已被阻止，敏感字段无法加密。请检查你的钥匙串服务。',
  'Welcome to OpenPawz': '欢迎使用 OpenPawz',
  "Your open-source AI agent platform. Let's get you set up in under a minute.":
    '你的开源 AI 智能体平台。不到一分钟即可完成初始化。',
  'Multi-agent fleet with custom personas': '支持自定义角色的多智能体队列',
  '200+ integrations & skills': '200+ 集成与技能',
  'Runs locally — your data stays yours': '本地运行，数据始终归你所有',
  'Get Started': '开始设置',
  'Choose Your AI Provider': '选择 AI 提供商',
  'You need at least one AI provider to power your agents.':
    '至少需要配置一个 AI 提供商来驱动你的智能体。',
  'RECOMMENDED — FREE & PRIVATE': '推荐 - 免费且私密',
  'Ollama (Local AI)': 'Ollama（本地 AI）',
  'Run AI models entirely on your machine. No API keys, no costs, complete privacy.':
    '模型完全在本机运行。无需 API Key、无费用、隐私完整保留。',
  'Checking…': '检查中...',
  'or use a cloud provider': '或使用云端提供商',
  'All models, one key': '一个 Key 使用所有模型',
  Back: '返回',
  'Enter API Key': '输入 API Key',
  "Paste your API key below. It's stored locally and never leaves your machine.":
    '在下方粘贴 API Key。它只会存储在本机，不会离开你的设备。',
  'Connect Provider': '连接提供商',
  "You're All Set!": '设置完成',
  'OpenPawz is configured and ready to go.': 'OpenPawz 已配置完成，可以开始使用。',
  'Launch Mission Control': '进入控制台',
  'Integration Hub': '集成中心',
  "25,000+ services via n8n, MCP servers, and community packages — all your agent's tools in one place.":
    '通过 n8n、MCP 服务器和社区包接入 25,000+ 服务，让智能体工具集中管理。',
  Services: '服务',
  Tools: '工具',
  'Connection Health': '连接健康',
  'No connections yet': '暂无连接',
  'By Category': '按类别',
  'Quick Actions': '快捷操作',
  'Browse All': '浏览全部',
  Automations: '自动化',
  Queries: '查询',
  Community: '社区',
  'Agent Queries': '智能体查询',
  'Fleet Command': '智能体队列',
  'Manage your AI agents, deploy templates, and monitor fleet activity':
    '管理 AI 智能体、部署模板，并监控队列活动',
  Active: '活跃',
  Models: '模型',
  'New Agent': '新建智能体',
  'Your Fleet': '你的队列',
  'Agent Templates': '智能体模板',
  'Install & Go': '安装即用',
  'Pre-configured agent blueprints — one click to deploy': '预配置的智能体蓝图，一键部署',
  Capabilities: '能力',
  'Recent Activity': '最近活动',
  'No activity yet': '暂无活动',
  'Import Config': '导入配置',
  'Export Fleet': '导出队列',
  Agent: '智能体',
  'Default Model': '默认模型',
  'Switch model for this chat': '切换本次聊天模型',
  'Switch session': '切换会话',
  'New Chat': '新建聊天',
  'Start a conversation': '开始对话',
  'Ask anything — your agent is ready': '随便问点什么，你的智能体已经准备好了',
  'Slash commands': '斜杠命令',
  'Add context': '添加上下文',
  'New line': '换行',
  'Previous message': '上一条消息',
  'Paste image': '粘贴图片',
  'Attach file': '添加附件',
  'Message your agent...': '给智能体发送消息...',
  'Stop response': '停止回复',
  'More actions': '更多操作',
  'Stop & Send': '停止并发送',
  'Stop the current response and send your message': '停止当前回复并发送你的消息',
  'Add to Queue': '加入队列',
  'Send your message after the current response finishes': '当前回复完成后发送你的消息',
  Steer: '引导',
  'Steer the agent to wrap up the current response and handle your next message':
    '引导智能体收尾当前回复并处理你的下一条消息',
  'Talk Mode — hold to speak': '语音模式 - 按住说话',
  'Send message': '发送消息',
  'Context window is almost full. Older messages may be compacted.':
    '上下文窗口即将满，较早的消息可能会被压缩。',
  'Approaching budget limit': '接近预算上限',
  'CONTEXT WINDOW': '上下文窗口',
  used: '已用',
  limit: '上限',
  'Context Window': '上下文窗口',
  'SESSION METRICS': '会话指标',
  'Session token usage': '会话 Token 用量',
  INPUT: '输入',
  OUTPUT: '输出',
  COST: '成本',
  MESSAGES: '消息',
  'ACTIVE JOBS': '活动任务',
  'Waiting for activity…': '等待活动...',
  'QUICK ACTIONS': '快捷操作',
  Rename: '重命名',
  'Rename session': '重命名会话',
  Delete: '删除',
  'Delete session': '删除会话',
  'Clear history': '清空历史',
  Compact: '压缩',
  'Compact storage': '压缩存储',
  APPROVALS: '审批',
  'QUICK PROMPTS': '快捷提示',
  AUTOMATIONS: '自动化',
  QUERIES: '查询',
  SEARCH: '搜索',
  'Search messages…': '搜索消息...',
  'Switch agent': '切换智能体',
  Board: '看板',
  Scheduled: '计划',
  Squads: '团队',
  Projects: '项目',
  Inbox: '收件箱',
  Assigned: '已分配',
  'In Progress': '进行中',
  Review: '待审核',
  Blocked: '阻塞',
  Done: '完成',
  'Live Feed': '实时动态',
  All: '全部',
  Status: '状态',
  'Your task board is empty': '任务看板为空',
  'Create, assign, and track work across your AI agent fleet':
    '在你的 AI 智能体队列中创建、分配并跟踪工作',
  'Create tasks and assign them to AI agents. Agents take on work, move cards forward, and report progress in the live feed.':
    '创建任务并分配给 AI 智能体。智能体会接手工作、推进卡片，并在实时动态中汇报进展。',
  'Add task': '添加任务',
  'Create First Task': '创建第一个任务',
  'New Task': '新建任务',
  'New Automation': '新建自动化',
  'Morning Brief': '晨间简报',
  'Cron service status': 'Cron 服务状态',
  'Quick-add Morning Brief automation': '快速添加晨间简报自动化',
  Paused: '已暂停',
  'Run History': '运行历史',
  'No automations yet': '暂无自动化',
  'Create Automation': '创建自动化',
  'Morning Brief Template': '晨间简报模板',
  'Loading automations…': '正在加载自动化...',
  Name: '名称',
  Schedule: '计划',
  'Every 5 minutes': '每 5 分钟',
  'Every 15 minutes': '每 15 分钟',
  'Every 30 minutes': '每 30 分钟',
  'Every hour': '每小时',
  'Every 6 hours': '每 6 小时',
  'Daily 09:00': '每天 09:00',
  'Custom schedule...': '自定义计划...',
  'Task prompt': '任务提示',
  'What should the agent do?': '智能体应该做什么？',
  Cancel: '取消',
  Create: '创建',
  'No projects yet': '暂无项目',
  'New Project': '新建项目',
  Run: '运行',
  Edit: '编辑',
  'Agent Team': '智能体团队',
  'Add Agent': '添加智能体',
  'Message Bus': '消息总线',
  'Project Title': '项目标题',
  Goal: '目标',
  'Boss Agent ID': '主控智能体 ID',
  'Create Project': '创建项目',
  Specialty: '专长',
  General: '通用',
  Coder: '代码',
  Researcher: '研究',
  Designer: '设计',
  Communicator: '沟通',
  Security: '安全',
  'No squads yet': '暂无团队',
  'Create Squad': '创建团队',
  'New Squad': '新建团队',
  'Squad Name': '团队名称',
  'Add Member': '添加成员',
  Role: '角色',
  Member: '成员',
  Coordinator: '协调者',
  Add: '添加',
  'Task Engine': '任务引擎',
  Task: '任务',
  Title: '标题',
  Description: '描述',
  Priority: '优先级',
  Low: '低',
  Medium: '中',
  High: '高',
  Urgent: '紧急',
  'Assign Agents': '分配智能体',
  Enabled: '启用',
  'Model Override': '模型覆盖',
  Activity: '活动',
  Save: '保存',
  'Run Now': '立即运行',
  'Screenshot unavailable': '截图不可用',
  Thinking: '思考中',
  'Thinking...': '思考中...',
  Send: '发送',
  System: '系统',
  'tool call': '工具调用',
  'Thanks!': '已收到',
  Noted: '已记录',
  Reconnect: '重新连接',
  'Keyboard Shortcuts': '键盘快捷键',
  Navigation: '导航',
  Actions: '操作',
  'Command Palette': '命令面板',
  'Switch sidebar tab by position': '按位置切换侧边栏标签',
  'Open command palette': '打开命令面板',
  'Open settings': '打开设置',
  'Show this help': '显示此帮助',
  'New task / new chat (context-aware)': '新建任务或聊天（根据当前上下文）',
  'Close palette / modal / overlay': '关闭面板、弹窗或浮层',
  'Navigate palette items': '选择命令面板条目',
  'Select palette item': '执行选中条目',
  'Search agents, views, skills': '搜索智能体、视图、技能',
  'Start a chat': '开始聊天',
  'Toggle dark/light mode': '切换深色/浅色模式',
  'Press ? to toggle · Esc to close': '按 ? 切换显示 · 按 Esc 关闭',
  'Toggle Theme': '切换主题',
  'Create a task': '创建任务',
  'Start a new conversation': '开始新对话',
  'Show all shortcuts': '显示所有快捷键',
  'Go to view': '前往视图',
  'Switch to agent': '切换到智能体',
  'Enable skill': '启用技能',
  'Disable skill': '禁用技能',
  '(on)': '（开）',
  '(off)': '（关）',
  Communication: '沟通',
  Development: '开发',
  Productivity: '效率',
  'CRM & Sales': 'CRM 与销售',
  Commerce: '电商',
  'Social Media': '社交媒体',
  Cloud: '云服务',
  'Storage & Files': '存储与文件',
  Databases: '数据库',
  Analytics: '分析',
  'AI & ML': 'AI 与机器学习',
  'Voice & Video': '语音与视频',
  'Content & CMS': '内容与 CMS',
  Utilities: '工具',
  Media: '媒体',
  'Smart Home': '智能家居',
  Trading: '交易',
  Popular: '热门',
  Category: '类别',
  'Matrix view': '矩阵视图',
  'Grid view': '网格视图',
  'List view': '列表视图',
  Offline: '离线',
  'General Settings': '通用设置',
  Language: '语言',
  English: '英文',
  'Simplified Chinese': '简体中文',
  'Choose the display language for the app.': '选择应用显示语言。',
  Appearance: '外观',
  'Customize the look and feel of Pawz.': '自定义 Pawz 的外观与使用感受。',
  Theme: '主题',
  About: '关于',
  'Your AI command center': '你的 AI 指挥中心',
  'View source on GitHub': '在 GitHub 查看源码',
  'Software Update': '软件更新',
  'Check for new versions and update Pawz in-place.': '检查新版本并在本机更新 Pawz。',
  'Check for Updates': '检查更新',
  'Download & Install': '下载并安装',
  'Providers & Models': '供应商与模型',
  'Add AI providers, manage API keys, and configure model routing':
    '添加 AI 供应商、管理 API Key，并配置模型路由',
  'Configured Providers': '已配置供应商',
  'All your AI providers. Agents can use any of these — add as many as you need.':
    '所有 AI 供应商都在这里。智能体可以使用其中任意一个，你可以按需添加多个。',
  'For OpenAI-compatible custom providers, choose OpenAI-compatible / Custom and enter the provider base URL ending in /v1.':
    '接入 OpenAI 兼容的自定义供应商时，请选择“OpenAI 兼容 / 自定义”，并填写以 /v1 结尾的基础 URL。',
  'No providers configured yet.': '尚未配置供应商。',
  'Add Ollama for local models, connect OpenAI, or use any OpenAI-compatible custom endpoint.':
    '可添加 Ollama 本地模型、连接 OpenAI，或使用任意 OpenAI 兼容的自定义地址。',
  Provider: '供应商',
  Type: '类型',
  Endpoint: '端点',
  'Key set': '已设置 Key',
  Local: '本地',
  'No key': '未设置 Key',
  default: '默认',
  'Default Model & Provider': '默认模型与供应商',
  'The model and provider used for conversations unless overridden per-agent.':
    '未在智能体中单独覆盖时，对话将使用这里设置的模型和供应商。',
  'Model Request Proxy': '模型请求代理',
  'Proxy used only for model provider requests, including custom OpenAI-compatible endpoints and model discovery.':
    '仅用于模型供应商请求，包括自定义 OpenAI 兼容端点和模型发现。',
  'Proxy Mode': '代理模式',
  'Auto from environment': '自动读取环境变量',
  'Custom proxy': '自定义代理',
  'Direct connection': '直连',
  'Proxy URL': '代理 URL',
  'Example: http://127.0.0.1:7890. Leave empty unless Proxy Mode is Custom proxy.':
    '例如：http://127.0.0.1:7890。除非代理模式为自定义代理，否则可留空。',
  'Proxy Bypass': '代理绕过',
  'Comma-separated hosts that should not use the proxy, for example localhost,127.0.0.1':
    '不走代理的主机，用英文逗号分隔，例如 localhost,127.0.0.1',
  '— auto (first available) —': '— 自动（第一个可用）—',
  'Default Provider': '默认供应商',
  'Which provider to use by default': '默认使用哪个供应商',
  '— use provider default —': '— 使用供应商默认值 —',
  'Model ID to use — or type a custom one': '要使用的模型 ID，也可以输入自定义模型',
  'Manage Providers': '管理供应商',
  'Add Provider': '添加供应商',
  'Failed to load': '加载失败',
  'New Provider': '新建供应商',
  'Provider ID': '供应商 ID',
  'Unique lowercase identifier (e.g. my-openai, ollama-local)':
    '唯一的小写标识符（例如 my-openai、ollama-local）',
  'Provider Type': '供应商类型',
  'Base URL': '基础 URL',
  'Leave blank for default': '留空则使用默认值',
  'API Key': 'API Key',
  'Leave blank for local providers like Ollama': 'Ollama 等本地供应商可留空',
  'Optional default model for this provider': '此供应商的可选默认模型',
  'Paste the exact Target URI from your Foundry deployment': '粘贴 Foundry 部署中的完整 Target URI',
  'Use the model name as the ID (e.g. grok-4-1-fast-reasoning)':
    '使用模型名称作为 ID（例如 grok-4-1-fast-reasoning）',
  'OpenAI-compatible endpoint, for example https://api.example.com/v1':
    'OpenAI 兼容端点，例如 https://api.example.com/v1',
  'Use a short ID for this custom provider': '为此自定义供应商设置一个简短 ID',
  'Enter a provider ID': '请输入供应商 ID',
  'ID must start with a letter or number (letters, numbers, dots, hyphens)':
    'ID 必须以字母或数字开头，可包含字母、数字、点和连字符',
  'already exists': '已存在',
  'Adding…': '添加中...',
  added: '已添加',
  Failed: '失败',
  'Set Default': '设为默认',
  'set as default provider': '已设为默认供应商',
  Remove: '移除',
  'Confirm Remove?': '确认移除？',
  'Removing…': '移除中...',
  removed: '已移除',
  'Remove failed': '移除失败',
  'Model used when no specific model is requested': '未指定具体模型时使用此模型',
  'Discover Models': '发现模型',
  'Discovering…': '发现中...',
  'No models found — check URL and API key': '未发现模型，请检查 URL 和 API Key',
  Found: '发现',
  'model(s)': '个模型',
  'Discovery failed': '发现失败',
  updated: '已更新',
  'Save failed': '保存失败',
  'OpenAI-compatible / Custom': 'OpenAI 兼容 / 自定义',
  'Ollama (local)': 'Ollama（本地）',
  'Custom / Compatible': '自定义 / 兼容',
  'SYSTEM CONFIG': '系统配置',
  CORE: '核心',
  VOICE: '语音',
  NETWORK: '网络',
  SYSTEM: '系统',
  Providers: '供应商',
  'Agent Defaults': '智能体默认值',
  Sessions: '会话',
  'Voice & TTS': '语音与 TTS',
  'Browser & Sandbox': '浏览器与沙盒',
  Tailscale: 'Tailscale',
  Webhook: 'Webhook',
  n8n: 'n8n',
  'MCP Servers': 'MCP 服务器',
  Memory: '记忆',
  Engine: '引擎',
  Logs: '日志',
  'Theme, software updates, and about information': '主题、软件更新和关于信息',
  'Built-in Paw Engine': '内置 Paw 引擎',
  'Pawz are safer than Claws': 'Pawz 比 Claws 更安全',
  'Default model, tool execution limits, system prompt, and memory settings':
    '默认模型、工具执行限制、系统提示词和记忆设置',
  'View, rename, and manage chat sessions': '查看、重命名和管理聊天会话',
  'Text-to-speech, talk mode, and voice wake triggers': '文本转语音、语音对话模式和语音唤醒触发',
  'Chrome profiles, agent screenshots, workspaces, and network policy':
    'Chrome 配置档、智能体截图、工作区和网络策略',
  'Expose Pawz to your Tailscale network or the internet via Serve and Funnel':
    '通过 Serve 和 Funnel 将 Pawz 暴露到 Tailscale 网络或互联网',
  'Inbound Webhook': '入站 Webhook',
  'Let external systems POST to a local endpoint to trigger agent runs':
    '允许外部系统 POST 到本地端点以触发智能体运行',
  'Event Log': '事件日志',
  'No webhook events received yet': '尚未收到 Webhook 事件',
  'n8n Integration': 'n8n 集成',
  'Connect to n8n for 25,000+ service integrations via workflows and MCP bridge':
    '通过工作流和 MCP 桥接连接 n8n，接入 25,000+ 服务集成',
  'Extend agents with external tools and data sources via Model Context Protocol':
    '通过 Model Context Protocol 为智能体扩展外部工具和数据源',
  'Data locations, workspace path, and cloud sync': '数据位置、工作区路径和云同步',
  'Tool approvals, audit log, and execution policies': '工具审批、审计日志和执行策略',
  'Agent memory and knowledge base management': '智能体记忆和知识库管理',
  'Paw engine configuration and diagnostics': 'Paw 引擎配置与诊断',
  'Live application logs with 7-day retention in ~/Documents/Paw/logs/':
    '实时应用日志，保留 7 天，位于 ~/Documents/Paw/logs/',
  'Tool Approval Rules': '工具审批规则',
  'Choose which tools your agent can use automatically and which need your permission.':
    '选择智能体可自动使用哪些工具，以及哪些工具需要你的许可。',
  "When a tool isn't listed below:": '当工具未在下方列出时：',
  'Ask me': '询问我',
  Allow: '允许',
  Block: '阻止',
  Ask: '询问',
  'Add rule': '添加规则',
  'Save Rules': '保存规则',
  Reload: '重新加载',
  'Security Audit Log': '安全审计日志',
  'All security-relevant events — exec approvals, auto-denies, auto-allows, and policy changes.':
    '所有安全相关事件，包括执行审批、自动拒绝、自动允许和策略变更。',
  'Checking encryption...': '正在检查加密...',
  'Checking keychain...': '正在检查钥匙串...',
  'All events': '全部事件',
  'Exec approvals': '执行审批',
  'Auto-denied': '自动拒绝',
  'Auto-allowed': '自动允许',
  'Credential access': '凭据访问',
  'Policy changes': '策略变更',
  'Network requests': '网络请求',
  'Engine crashes': '引擎崩溃',
  'Scope violations': '作用域违规',
  'All risk levels': '全部风险级别',
  Critical: '严重',
  Safe: '安全',
  'Last 50': '最近 50 条',
  'Last 100': '最近 100 条',
  'Last 250': '最近 250 条',
  'Last 500': '最近 500 条',
  Refresh: '刷新',
  'Export as JSON': '导出为 JSON',
  'Export JSON': '导出 JSON',
  'Export as CSV': '导出为 CSV',
  'Export CSV': '导出 CSV',
  'CSP Active': 'CSP 已启用',
  '0 blocked': '0 个已阻止',
  '0 allowed': '0 个已允许',
  '0 critical': '0 个严重',
  Time: '时间',
  Event: '事件',
  Risk: '风险',
  Tool: '工具',
  Detail: '详情',
  Result: '结果',
  'No security events recorded yet.': '尚未记录安全事件。',
  'Security Policies': '安全策略',
  'Controls how Paw handles dangerous commands from the agent.':
    '控制 Paw 如何处理智能体发起的危险命令。',
  'Session override active': '会话覆盖已启用',
  'Cancel Override': '取消覆盖',
  'Auto-deny privilege escalation': '自动拒绝权限提升',
  'Automatically block sudo, su, doas, pkexec, and runas commands without asking':
    '自动阻止 sudo、su、doas、pkexec 和 runas 命令，无需询问',
  'Auto-deny all critical-risk commands': '自动拒绝所有严重风险命令',
  'Automatically block fork bombs, remote code execution, disk destruction, etc.':
    '自动阻止 fork bomb、远程代码执行、磁盘破坏等操作',
  'Require typing "ALLOW" for critical commands': '严重命令需要输入 "ALLOW" 才能批准',
  'Instead of clicking a button, you must type ALLOW to approve dangerous commands':
    '批准危险命令时必须输入 ALLOW，而不是仅点击按钮',
  'Read-only project mode': '只读项目模式',
  'Block agent filesystem write tools (create, edit, delete, move) — the agent can only read files':
    '阻止智能体文件系统写入工具（创建、编辑、删除、移动），智能体只能读取文件',
  'Token Auto-Rotation': '令牌自动轮换',
  'Automatically rotate device tokens after a set number of days. Set to 0 to disable.':
    '在设定天数后自动轮换设备令牌。设为 0 可禁用。',
  Disabled: '已禁用',
  'Every 7 days': '每 7 天',
  'Every 14 days': '每 14 天',
  'Every 30 days': '每 30 天',
  'Every 60 days': '每 60 天',
  'Every 90 days': '每 90 天',
  'Command Allowlist': '命令允许列表',
  'Regex patterns for commands that are always auto-approved (bypasses the approval modal). One pattern per line.':
    '始终自动批准的命令正则模式（跳过审批弹窗）。每行一个模式。',
  'Command Denylist': '命令拒绝列表',
  'Regex patterns for commands that are always auto-denied. One pattern per line.':
    '始终自动拒绝的命令正则模式。每行一个模式。',
  'Save Security Policies': '保存安全策略',
  'Reset to Defaults': '重置为默认值',
  'Tool Approval Required': '需要工具审批',
  DANGER: '危险',
  'Show parameters': '显示参数',
  'Approve all requests for a limited time': '在限定时间内批准所有请求',
  'Allow all…': '全部允许...',
  '30 minutes': '30 分钟',
  '1 hour': '1 小时',
  '2 hours': '2 小时',
  Deny: '拒绝',
  'Type ALLOW': '输入 ALLOW',
  'Type ALLOW to approve:': '输入 ALLOW 以批准：',
  'Loading sessions…': '正在加载会话...',
  'No sessions found.': '未找到会话。',
  'Untitled chat': '未命名聊天',
  'Empty session': '空会话',
  messages: '条消息',
  'Session label': '会话标签',
  'Clear Messages': '清空消息',
  'Confirm Clear?': '确认清空？',
  'Confirm Delete?': '确认删除？',
  'Model & Provider': '模型与供应商',
  'The AI model used for new conversations': '新对话使用的 AI 模型',
  'Which provider to use when auto-detection fails': '自动检测失败时使用的供应商',
  '(auto-detect from model name)': '（根据模型名称自动检测）',
  'Tool Execution': '工具执行',
  'Max Tool Rounds': '最大工具轮次',
  'How many tool call rounds before the agent stops (default: 20)':
    '智能体停止前允许的工具调用轮数（默认：20）',
  'Tool Timeout (seconds)': '工具超时（秒）',
  'Max seconds for a single tool execution (default: 120)': '单次工具执行的最长秒数（默认：120）',
  'User Timezone': '用户时区',
  'IANA timezone (e.g. America/Chicago, America/New_York, Europe/London). Used for agent time awareness.':
    'IANA 时区（例如 America/Chicago、America/New_York、Europe/London），用于智能体时间感知。',
  'Weather Location': '天气位置',
  'City for your dashboard weather (e.g. New York, London). Auto-detected via IP if empty.':
    '仪表盘天气城市（例如 New York、London）。留空则通过 IP 自动检测。',
  'Auto-detect (leave empty) or enter city': '自动检测（留空）或输入城市',
  'Default System Prompt': '默认系统提示词',
  'Base instructions prepended to every conversation. Agent soul files (SOUL.md, IDENTITY.md, etc.) are appended on top of this.':
    '每次对话前置的基础指令。智能体 soul 文件（SOUL.md、IDENTITY.md 等）会追加在其后。',
  'Memory Defaults': '记忆默认值',
  'Auto-recall relevant memories before each turn': '每轮对话前自动召回相关记忆',
  'Auto-capture facts from conversations': '从对话中自动捕获事实',
  'Recall Limit': '召回上限',
  'Max memories to inject per turn': '每轮注入的最大记忆数量',
  'Embedding (Semantic Search)': '嵌入（语义搜索）',
  'Embeddings power semantic memory search. Choose a provider — Ollama runs locally, or use your existing cloud API key. Pawz will always fall back to keyword matching if embeddings are unavailable.':
    '嵌入用于语义记忆搜索。选择供应商：Ollama 可本地运行，也可使用现有云端 API Key。若嵌入不可用，Pawz 会回退到关键词匹配。',
  'Embedding Provider': '嵌入供应商',
  'Which service generates embedding vectors': '生成嵌入向量的服务',
  'Auto (Ollama → cloud fallback)': '自动（Ollama → 云端回退）',
  'Use my chat provider': '使用我的聊天供应商',
  'Auto-Setup Ollama Embeddings': '自动设置 Ollama 嵌入',
  'Checks Ollama, starts it if needed, and pulls the embedding model':
    '检查 Ollama，必要时启动，并拉取嵌入模型',
  'Ollama URL': 'Ollama URL',
  'Where Ollama is running (default: http://localhost:11434)':
    'Ollama 运行地址（默认：http://localhost:11434）',
  'Embedding Model': '嵌入模型',
  'Model for generating embeddings': '用于生成嵌入的模型',
  'Using your configured chat provider for embeddings': '使用已配置的聊天供应商生成嵌入',
  'The embedding model is auto-selected based on your provider:': '嵌入模型会根据供应商自动选择：',
  'No extra configuration needed — your existing API key is used.':
    '无需额外配置，将使用你现有的 API Key。',
  'Embedding Dimensions': '嵌入维度',
  'Auto-detected when you run Test or Auto-Setup': '运行测试或自动设置时自动检测',
  'Test Connection': '测试连接',
  'Backfill Embeddings': '回填嵌入',
  'Embed any memories that were stored without vectors': '为尚未保存向量的记忆生成嵌入',
  Testing: '测试中',
  'Agent defaults saved': '智能体默认值已保存',
  'TTS Provider': 'TTS 供应商',
  'Google Cloud TTS': 'Google Cloud TTS',
  'OpenAI TTS': 'OpenAI TTS',
  'ElevenLabs API Key': 'ElevenLabs API Key',
  'Get your API key from elevenlabs.io': '从 elevenlabs.io 获取你的 API Key',
  'Multilingual v2 (best quality)': 'Multilingual v2（最佳质量）',
  'Turbo v2.5 (fastest)': 'Turbo v2.5（最快）',
  'English v1': 'English v1',
  Stability: '稳定性',
  'Clarity + Similarity': '清晰度 + 相似度',
  'Lower = more expressive/variable, higher = more consistent':
    '较低 = 更具表现力/变化更多，较高 = 更一致',
  'Higher = closer to original voice, lower = more creative':
    '较高 = 更接近原声，较低 = 更有创造性',
  Voice: '语音',
  Speed: '速度',
  '0.5x (slow) → 2.0x (fast)': '0.5x（慢）→ 2.0x（快）',
  'Auto-speak new responses': '自动朗读新回复',
  'Automatically read aloud every new assistant message': '自动朗读每条新的助手消息',
  'Test Voice': '测试语音',
  'Speech-to-Text (Dictation)': '语音转文字（听写）',
  'Use the mic button in chat to dictate messages by voice. Choose your transcription engine below.':
    '使用聊天中的麦克风按钮通过语音输入消息。请在下方选择转写引擎。',
  'Dictation Engine': '听写引擎',
  'Browser (Free) — built-in, no API key needed': '浏览器（免费）- 内置，无需 API Key',
  'Whisper (Enhanced) — higher accuracy, requires API key':
    'Whisper（增强）- 准确率更高，需要 API Key',
  'Uses OpenAI Whisper via your API key. Higher accuracy, supports more languages.':
    '通过你的 API Key 使用 OpenAI Whisper。准确率更高，支持更多语言。',
  "Uses your browser's built-in speech recognition. Free, instant, no setup required.":
    '使用浏览器内置语音识别。免费、即时、无需设置。',
  'Uses your OpenAI API key from Models settings. $15/1M characters.':
    '使用模型设置中的 OpenAI API Key。每 100 万字符 15 美元。',
  'Uses your ElevenLabs API key (entered below). Premium neural voices.':
    '使用下方填写的 ElevenLabs API Key。高级神经语音。',
  'Uses your Google API key from Models settings. Chirp 3 HD voices are highest quality.':
    '使用模型设置中的 Google API Key。Chirp 3 HD 语音质量最高。',
  'Start Talk Mode': '开始语音对话',
  'Stop Talk Mode': '停止语音对话',
  'Listening...': '正在聆听...',
  'Transcribing...': '正在转写...',
  'Speaking...': '正在朗读...',
  'Error — retrying...': '出错，正在重试...',
  'Generating...': '生成中...',
  'Voice settings saved': '语音设置已保存',
  'Browser Profiles': '浏览器配置档',
  'Managed Chrome profiles with persistent state (cookies, sessions, storage). Each profile gets its own user-data directory.':
    '管理带持久状态（Cookie、会话、存储）的 Chrome 配置档。每个配置档都有独立的用户数据目录。',
  Created: '创建于',
  'New profile name…': '新配置档名称...',
  '+ Create Profile': '+ 创建配置档',
  'Headless mode': '无头模式',
  'Auto-close tabs': '自动关闭标签页',
  'Idle timeout:': '空闲超时：',
  sec: '秒',
  'Save Browser Settings': '保存浏览器设置',
  'Screenshot Gallery': '截图图库',
  'Screenshots captured by agents via': '智能体通过以下工具捕获的截图：',
  'Click to view full-size, or use the camera icon in chat to insert inline.':
    '点击查看原图，或使用聊天中的相机图标插入到对话中。',
  'No screenshots yet. Agents will save them here when using web_screenshot.':
    '暂无截图。智能体使用 web_screenshot 时会保存在这里。',
  'Agent Workspaces': '智能体工作区',
  'Each agent gets an isolated filesystem workspace at': '每个智能体都有独立文件系统工作区：',
  "Files created by exec, write_file, etc. are scoped to the agent's directory.":
    '通过 exec、write_file 等创建的文件会限制在智能体目录内。',
  files: '个文件',
  Browse: '浏览',
  "No agent workspaces created yet. They're auto-created when an agent writes files.":
    '尚未创建智能体工作区。智能体写入文件时会自动创建。',
  'Outbound Network Policy': '出站网络策略',
  'Control which domains agents can access. When the allowlist is enabled, only listed domains are reachable. Blocked domains are always blocked.':
    '控制智能体可访问哪些域名。启用允许列表后，仅列出的域名可访问。阻止域名始终会被阻止。',
  'Enable domain allowlist': '启用域名允许列表',
  'When enabled, agents can only fetch from listed domains':
    '启用后，智能体只能从列出的域名获取内容',
  'Allowed Domains': '允许域名',
  'Blocked Domains (always blocked)': '阻止域名（始终阻止）',
  'Log all outbound requests': '记录所有出站请求',
  'Test URL': '测试 URL',
  allowed: '已允许',
  blocked: '已阻止',
  'Save Network Policy': '保存网络策略',
  Close: '关闭',
  'Workspace is empty': '工作区为空',
  Size: '大小',
  Modified: '修改时间',
  'Checking Tailscale…': '正在检查 Tailscale...',
  Running: '运行中',
  Stopped: '已停止',
  Connected: '已连接',
  'Installed (not running)': '已安装（未运行）',
  'Not installed': '未安装',
  State: '状态',
  Hostname: '主机名',
  Tailnet: 'Tailnet',
  Version: '版本',
  Serve: 'Serve',
  Funnel: 'Funnel',
  Inactive: '未激活',
  'Tailscale is not installed on this machine.': '此设备未安装 Tailscale。',
  'Download Tailscale': '下载 Tailscale',
  Connection: '连接',
  Disconnect: '断开连接',
  'Serve & Funnel': 'Serve 与 Funnel',
  'Expose Pawz via your Tailscale network (Serve) or to the public internet (Funnel).':
    '通过 Tailscale 网络（Serve）或公网（Funnel）暴露 Pawz。',
  'Stop Serve': '停止 Serve',
  'Start Serve': '启动 Serve',
  'Stop Funnel': '停止 Funnel',
  'Start Funnel (Public)': '启动 Funnel（公开）',
  Configuration: '配置',
  'Serve Port': 'Serve 端口',
  'Auth Key': '认证密钥',
  'Hostname Override': '主机名覆盖',
  '(optional, for headless connect)': '（可选，用于无头连接）',
  '(optional)': '（可选）',
  'Save Config': '保存配置',
  'Server Control': '服务器控制',
  'Stop Server': '停止服务器',
  'Start Server': '启动服务器',
  'Bind Address': '绑定地址',
  Port: '端口',
  'Auth Token': '认证令牌',
  'Toggle visibility': '切换可见性',
  Show: '显示',
  Hide: '隐藏',
  'Copy to clipboard': '复制到剪贴板',
  Copy: '复制',
  'Regenerate token': '重新生成令牌',
  Regen: '重新生成',
  'Default Agent ID': '默认智能体 ID',
  '(used when URL omits agent_id)': '（URL 省略 agent_id 时使用）',
  'Rate Limit': '速率限制',
  '(requests/min per IP, 0 = unlimited)': '（每 IP 每分钟请求数，0 = 不限制）',
  'Allow dangerous tools': '允许危险工具',
  'Lets webhook-triggered agents run shell commands, file I/O, etc.':
    '允许 Webhook 触发的智能体运行 Shell 命令、文件 I/O 等。',
  'Usage Example': '使用示例',
  'Loading webhook configuration…': '正在加载 Webhook 配置...',
  'Loading n8n configuration…': '正在加载 n8n 配置...',
  'n8n Instance URL': 'n8n 实例 URL',
  'Enable n8n integration': '启用 n8n 集成',
  'Auto-discover workflows on connect': '连接时自动发现工作流',
  'Use MCP bridge mode': '使用 MCP 桥接模式',
  'Testing connection…': '正在测试连接...',
  Workflows: '工作流',
  workflow: '个工作流',
  workflows: '个工作流',
  'Connection failed': '连接失败',
  'Discovered Workflows': '已发现工作流',
  'Connect to n8n and click "Refresh" to discover workflows.':
    '连接 n8n 并点击“刷新”以发现工作流。',
  'Refresh Workflows': '刷新工作流',
  'Fetching workflows…': '正在获取工作流...',
  'No workflows found on this n8n instance.': '此 n8n 实例上未找到工作流。',
  Nodes: '节点',
  'Loading MCP server configuration…': '正在加载 MCP 服务器配置...',
  'Connect All Enabled': '连接所有已启用项',
  'Add Server': '添加服务器',
  'No MCP servers configured. Click "Add Server" to connect to an MCP tool server.':
    '尚未配置 MCP 服务器。点击“添加服务器”连接 MCP 工具服务器。',
  Disconnected: '已断开',
  Stdio: 'Stdio',
  SSE: 'SSE',
  'Refresh Tools': '刷新工具',
  'Add MCP Server': '添加 MCP 服务器',
  Transport: '传输',
  'Stdio (local process)': 'Stdio（本地进程）',
  'SSE (HTTP endpoint)': 'SSE（HTTP 端点）',
  Command: '命令',
  Arguments: '参数',
  '(one per line)': '（每行一个）',
  URL: 'URL',
  'Remove Server': '移除服务器',
  'Server name is required': '服务器名称是必填项',
  'Command is required for Stdio transport': 'Stdio 传输需要命令',
  'URL is required for SSE transport': 'SSE 传输需要 URL',
  'Storage Usage': '存储用量',
  Total: '总计',
  'Engine Data Root': '引擎数据根目录',
  'Where Paw stores its database, agent workspaces, skills, and browser profiles. Changing this requires a restart.':
    'Paw 存储数据库、智能体工作区、技能和浏览器配置档的位置。修改后需要重启。',
  'Where Paw stores its database, agent workspaces, skills, and browser profiles.':
    'Paw 存储数据库、智能体工作区、技能和浏览器配置档的位置。',
  'Changing this requires a restart.': '修改后需要重启。',
  'Current location': '当前位置',
  'Reset to default': '重置为默认值',
  Default: '默认',
  'custom path active': '自定义路径已启用',
  'Engine Database': '引擎数据库',
  'App Database': '应用数据库',
  'User Workspace': '用户工作区',
  'Where Paw saves user-facing files — research, content, and builds. This is separate from the engine data root.':
    'Paw 保存用户可见文件的位置，包括研究、内容和构建产物。它与引擎数据根目录分开。',
  'Where Paw saves user-facing files — research, content, and builds.':
    'Paw 保存用户可见文件的位置，包括研究、内容和构建产物。',
  'This is separate from the engine data root.': '它与引擎数据根目录分开。',
  'Workspace path': '工作区路径',
  'Cloud Sync': '云同步',
  'Sync your workspace across devices': '跨设备同步你的工作区',
  'by pointing the User Workspace': '将用户工作区',
  'path to a folder synced by your cloud provider:': '路径指向云服务商同步的文件夹即可：',
  'by pointing the User Workspace path to a folder synced by your cloud provider:':
    '将用户工作区路径指向云服务商同步的文件夹即可：',
  'The engine database and browser profiles stay local — only user-facing files sync.':
    '引擎数据库和浏览器配置档保留在本机，仅同步用户可见文件。',
  'Saving…': '正在保存…',
  'Saved — restart required': '已保存 - 需要重启',
  Saved: '已保存',
  Error: '错误',
  'Failed to load storage settings.': '无法加载存储设置。',
  Source: '来源',
  'Live (in-memory)': '实时（内存中）',
  Level: '级别',
  Module: '模块',
  'e.g. engine, chat': '例如 engine、chat',
  'Search messages...': '搜索消息...',
  'Auto-follow new entries': '自动跟随新日志',
  Follow: '跟随',
  'Live tail active': '实时跟随已启用',
  'No log entries match the current filters.': '没有符合当前筛选条件的日志。',
  Loading: '正在加载',
  'Settings saved': '设置已保存',
  'Already up to date': '已是最新版本',
  'You are on the latest version.': '当前已是最新版本。',
  'Checking for updates…': '正在检查更新...',
  'Downloading update…': '正在下载更新...',
  'Download complete. Restarting…': '下载完成，正在重启...',
  'No update available — check for updates first': '暂无可用更新，请先检查更新',
  'No tool-specific rules yet. Click "Add rule" to create one.':
    '尚无工具专用规则。点击“添加规则”创建一个。',
  'Always allow': '始终允许',
  'Ask each time': '每次询问',
  'Always block': '始终阻止',
  'Remove rule': '移除规则',
  'Add Tool Rule': '添加工具规则',
  'Tool name, e.g. brave_search': '工具名称，例如 brave_search',
  'Approval rules saved locally': '审批规则已保存到本地',
  'Database encryption active — sensitive fields encrypted with OS keychain key':
    '数据库加密已启用，敏感字段使用系统钥匙串密钥加密',
  'Encryption unavailable — credential storage is blocked until keychain is restored':
    '加密不可用，在钥匙串恢复前将阻止凭据存储',
  'Unable to check keychain health': '无法检查钥匙串健康状态',
  Allowed: '已允许',
  Denied: '已拒绝',
  'Security policies saved': '安全策略已保存',
  'Security policies reset to defaults': '安全策略已重置为默认值',
  'Failed to reset security policies': '重置安全策略失败',
  Confirm: '确认',
  OK: '确定',
  Current: '当前',
  'New Group Chat': '新建群聊',
  'New Group Hub': '新建群组中心',
  'Close panel': '关闭面板',
  'New conversation': '新建对话',
  'Search agents…': '搜索智能体…',
  'No agents': '暂无智能体',
  Groups: '群组',
  'Show agents': '显示智能体',
  'Hide agents': '隐藏智能体',
  'Show more': '显示更多',
  'Loading screenshot…': '正在加载截图…',
  '(use default)': '（使用默认值）',
  'Running command': '正在运行命令',
  'Writing file': '正在写入文件',
  'Reading file': '正在读取文件',
  Searching: '搜索中',
  'Searching the web': '正在搜索网页',
  'Fetching URL': '正在获取 URL',
  'Reading page': '正在读取页面',
  'Listing files': '正在列出文件',
  'Searching code': '正在搜索代码',
  'Using': '正在使用',
  'Agent wants to:': '智能体想要执行：',
  'Rate limit reached': '已达到速率限制',
  'Approaching rate limit': '接近速率限制',
  'Allow 20 more': '再允许 20 次',
  Wait: '等待',
  'Planned actions': '计划的操作',
  'Run all': '全部运行',
  'Step-by-step': '逐步执行',
  'No credential usage logged yet.': '暂无凭据使用记录。',
  'Integration Access Log': '集成访问日志',
  'Log cleared.': '日志已清空。',
  'Service Permissions': '服务权限',
  Service: '服务',
  Action: '操作',
  Access: '权限',
  Approval: '审批',
  Auto: '自动',
  Manual: '手动',
  'Delete Session': '删除会话',
  'Also delete memories created in this session': '同时删除此会话中创建的记忆',
  'Delete this session? This cannot be undone.': '删除此会话？此操作无法撤销。',
  'Delete this session?': '删除此会话？',
  'Clear all messages in this session?': '清空此会话中的所有消息？',
  Gateway: '网关',
  'Session expired': '会话已过期',
  'Enterprise Cloud': '企业云',
  'Sign in to OpenPawz': '登录 OpenPawz',
  'This build is managed by your organization. Authenticate with enterprise SSO to unlock cloud models, entitlements, and workspace policy.':
    '此版本由你的组织统一管理。请使用企业 SSO 完成认证，以解锁云端模型、权益和工作区策略。',
  'Sign in with SSO': '使用 SSO 登录',
  'Setup guides opening soon': '设置指引即将上线',
  'Automations scheduler coming soon': '自动化调度器即将上线',
  'Use Memory Palace for file management': '请使用记忆宫殿管理文件',
  'Wizard not available in engine mode': '引擎模式下无法使用向导',
  'Browser control coming soon to the Paw engine': 'Paw 引擎的浏览器控制功能即将上线',
  'Update installed — restarting…': '更新已安装，正在重启…',
  'TOML copied to clipboard': 'TOML 已复制到剪贴板',
  'Research complete! Finding saved.': '研究完成！结果已保存。',
  'No findings to generate report from': '没有可用于生成报告的发现',
  'Report generated and saved!': '报告已生成并保存！',
  'Project created!': '项目已创建！',
  'Project deleted': '项目已删除',
  'Project updated': '项目已更新',
  'Session renamed': '会话已重命名',
  'Session deleted': '会话已删除',
  'History cleared': '历史记录已清空',
  'Session compacted': '会话已压缩',
  'New conversation started': '已开始新对话',
  'Not connected': '未连接',
  'Himalaya skill management coming soon': 'Himalaya 技能管理即将上线',
  'Email sent!': '邮件已发送！',
  Archived: '已归档',
  Deleted: '已删除',
  'Microphone access denied — Talk Mode requires mic permission':
    '麦克风访问被拒绝 - 语音模式需要麦克风权限',
  'Explain this in more detail': '更详细地解释一下',
  'Are there other approaches?': '还有其他方案吗？',
  'How do I fix this?': '我该如何修复这个问题？',
  'Show me an example configuration': '给我看一个配置示例',
  'Tell me more': '再详细说说',
  'Summarize the key points': '总结要点',
  'Agent files managed via Memory Palace': '智能体文件由记忆宫殿管理',
  'Add Channel': '添加频道',
  Unknown: '未知',
  ERR: '错误',
  EXP: '过期',
  'Group Name': '群组名称',
  'Select Agents': '选择智能体',
  'Create & Open': '创建并打开',
  'e.g. Research Team': '例如：研究团队',
  'Send failed': '发送失败',
  'Steering': '引导中',
  '*(No response received)*': '*(未收到回复)*',
  '(Response timed out)': '(回复超时)',
  'Failed to get response': '获取回复失败',
  'Group has no members': '群组没有成员',
  'Squad has no members': '团队没有成员',
  'Failed to create group': '创建群组失败',
  'Failed to open squad chat': '打开团队聊天失败',
  'You need at least 2 agents to create a group': '创建群组至少需要 2 个智能体',
  'Select at least 2 agents': '请至少选择 2 个智能体',
  'Enter a group name': '请输入群组名称',
  'Maximum mini-hubs reached': '已达到最大迷你中心数量',
  'Mini-hub error': '迷你中心错误',
  'Group': '群组',
};

const ZH_TO_EN = Object.fromEntries(Object.entries(EN_TO_ZH).map(([en, zh]) => [zh, en]));

const UI_MESSAGE_PATTERNS: Array<{
  en: RegExp;
  zh: (...groups: string[]) => string;
}> = [
  {
    en: /^Using (.+)$/,
    zh: (tool) => `正在使用 ${tool}`,
  },
  {
    en: /^Show (\d+) more$/,
    zh: (count) => `显示更多 ${count} 项`,
  },
  {
    en: /^Group "([^"]+)" created — send a message to start$/,
    zh: (name) => `群组“${name}”已创建 - 发送消息即可开始`,
  },
  {
    en: /^Group "([^"]+)" created$/,
    zh: (name) => `群组“${name}”已创建`,
  },
  {
    en: /^Sent to (.+)$/,
    zh: (target) => `已发送到 ${target}`,
  },
  {
    en: /^Queue failed: (.+)$/,
    zh: (reason) => `队列失败：${reason}`,
  },
  {
    en: /^Steer failed: (.+)$/,
    zh: (reason) => `引导失败：${reason}`,
  },
  {
    en: /^Failed to reconnect (.+)$/,
    zh: (service) => `重新连接 ${service} 失败`,
  },
  {
    en: /^Reconnected to (.+)!$/,
    zh: (service) => `已重新连接到 ${service}！`,
  },
  {
    en: /^OAuth error: (.+)$/,
    zh: (reason) => `OAuth 错误：${reason}`,
  },
  {
    en: /^n8n OAuth error: (.+)$/,
    zh: (reason) => `n8n OAuth 错误：${reason}`,
  },
  {
    en: /^Enterprise sign-in failed: (.+)$/,
    zh: (reason) => `企业登录失败：${reason}`,
  },
  {
    en: /^Message queued — it will be sent after the current response$/,
    zh: () => '消息已加入队列 - 会在当前回复完成后发送',
  },
  {
    en: /^Steering the agent — wrapping up and redirecting…$/,
    zh: () => '正在引导智能体 - 收尾并转向下一步…',
  },
  {
    en: /^Maximum mini-hubs reached$/,
    zh: () => '已达到最大迷你中心数量',
  },
  {
    en: /^You need at least 2 agents to create a group$/,
    zh: () => '创建群组至少需要 2 个智能体',
  },
  {
    en: /^You need at least 2 agents to create a group chat$/,
    zh: () => '创建群聊至少需要 2 个智能体',
  },
  {
    en: /^Select at least 2 agents$/,
    zh: () => '请至少选择 2 个智能体',
  },
  {
    en: /^Select at least 2 agents for a group chat$/,
    zh: () => '群聊至少需要选择 2 个智能体',
  },
  {
    en: /^Enter a group name$/,
    zh: () => '请输入群组名称',
  },
  {
    en: /^Please enter a group name$/,
    zh: () => '请输入群组名称',
  },
  {
    en: /^New conversation started$/,
    zh: () => '已开始新对话',
  },
  {
    en: /^Session renamed$/,
    zh: () => '会话已重命名',
  },
  {
    en: /^Session deleted$/,
    zh: () => '会话已删除',
  },
  {
    en: /^History cleared$/,
    zh: () => '历史记录已清空',
  },
  {
    en: /^Compact failed$/,
    zh: () => '压缩失败',
  },
  {
    en: /^Project title is required$/,
    zh: () => '项目标题为必填项',
  },
  {
    en: /^Project goal is required$/,
    zh: () => '项目目标为必填项',
  },
  {
    en: /^Project updated$/,
    zh: () => '项目已更新',
  },
  {
    en: /^Project created$/,
    zh: () => '项目已创建',
  },
  {
    en: /^Project deleted$/,
    zh: () => '项目已删除',
  },
  {
    en: /^Project started! The boss agent is orchestrating\.$/,
    zh: () => '项目已启动！主控智能体正在编排。',
  },
  {
    en: /^Project is already running$/,
    zh: () => '项目已经在运行',
  },
  {
    en: /^Add at least one agent before running$/,
    zh: () => '运行前请至少添加一个智能体',
  },
  {
    en: /^Agent ID is required$/,
    zh: () => '智能体 ID 为必填项',
  },
  {
    en: /^This agent is already on the team$/,
    zh: () => '该智能体已经在团队中',
  },
  {
    en: /^Added agent (.+)$/,
    zh: (agent) => `已添加智能体 ${agent}`,
  },
  {
    en: /^Removed agent (.+)$/,
    zh: (agent) => `已移除智能体 ${agent}`,
  },
  {
    en: /^Delete project "([^"]+)"\? This cannot be undone\.$/,
    zh: (title) => `删除项目“${title}”？此操作无法撤销。`,
  },
  {
    en: /^Delete this session\? This cannot be undone\.$/,
    zh: () => '删除此会话？此操作无法撤销。',
  },
  {
    en: /^Delete this session\?$/,
    zh: () => '删除此会话？',
  },
  {
    en: /^Clear all messages in this session\?$/,
    zh: () => '清空此会话中的所有消息？',
  },
  {
    en: /^Remove provider "([^"]+)"\?$/,
    zh: (id) => `移除供应商“${id}”？`,
  },
  {
    en: /^Uninstall (.+)\?$/,
    zh: (name) => `卸载 ${name}？`,
  },
  {
    en: /^Remove "([^"]+)"\? You can reinstall it later\.$/,
    zh: (name) => `移除“${name}”？之后仍可重新安装。`,
  },
  {
    en: /^Revoke ALL credentials for (.+)\? This can't be undone\.$/,
    zh: (skill) => `撤销 ${skill} 的所有凭据？此操作无法撤销。`,
  },
  {
    en: /^Remove MCP server "([^"]+)"\? This cannot be undone\.$/,
    zh: (name) => `移除 MCP 服务器“${name}”？此操作无法撤销。`,
  },
  {
    en: /^Remove Telegram configuration\?$/,
    zh: () => '移除 Telegram 配置？',
  },
  {
    en: /^Delete "([^"]+)"\?$/,
    zh: (subject) => `删除“${subject}”？`,
  },
  {
    en: /^Failed to save: (.+)$/,
    zh: (reason) => `保存失败：${reason}`,
  },
  {
    en: /^Failed to save squad: (.+)$/,
    zh: (reason) => `保存团队失败：${reason}`,
  },
  {
    en: /^Failed to add member: (.+)$/,
    zh: (reason) => `添加成员失败：${reason}`,
  },
  {
    en: /^Failed to create project: (.+)$/,
    zh: (reason) => `创建项目失败：${reason}`,
  },
  {
    en: /^Failed to delete: (.+)$/,
    zh: (reason) => `删除失败：${reason}`,
  },
  {
    en: /^Failed to connect: (.+)$/,
    zh: (reason) => `连接失败：${reason}`,
  },
  {
    en: /^Failed to load dashboards$/,
    zh: () => '加载仪表板失败',
  },
  {
    en: /^Failed to clear canvas$/,
    zh: () => '清空画布失败',
  },
  {
    en: /^Failed to open squad chat$/,
    zh: () => '打开团队聊天失败',
  },
  {
    en: /^Failed to create group$/,
    zh: () => '创建群组失败',
  },
  {
    en: /^Start failed: (.+)$/,
    zh: (reason) => `启动失败：${reason}`,
  },
  {
    en: /^Stop failed: (.+)$/,
    zh: (reason) => `停止失败：${reason}`,
  },
  {
    en: /^Install failed: (.+)$/,
    zh: (reason) => `安装失败：${reason}`,
  },
  {
    en: /^Uninstall failed: (.+)$/,
    zh: (reason) => `卸载失败：${reason}`,
  },
  {
    en: /^Cancel failed: (.+)$/,
    zh: (reason) => `取消失败：${reason}`,
  },
  {
    en: /^Search failed: (.+)$/,
    zh: (reason) => `搜索失败：${reason}`,
  },
  {
    en: /^Confirm$/,
    zh: () => '确认',
  },
];

let currentLocale: AppLocale = readLocale();
let observer: MutationObserver | null = null;
let applying = false;

export function getLocale(): AppLocale {
  return currentLocale;
}

export function setLocale(locale: AppLocale): void {
  currentLocale = locale;
  localStorage.setItem(LOCALE_KEY, locale);
  document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en';
  syncLanguageSelect();
  applyI18n(document.body);
  window.dispatchEvent(new CustomEvent('paw:locale-changed', { detail: { locale } }));
}

export function t(text: string): string {
  if (currentLocale === 'zh-CN') return EN_TO_ZH[text] ?? text;
  return ZH_TO_EN[text] ?? text;
}

export function translateUiText(text: string): string {
  if (currentLocale !== 'zh-CN') return text;
  if (text in EN_TO_ZH) return EN_TO_ZH[text];
  for (const pattern of UI_MESSAGE_PATTERNS) {
    const match = text.match(pattern.en);
    if (match) return pattern.zh(...match.slice(1));
  }
  return text;
}

export function initI18n(): void {
  document.documentElement.lang = currentLocale === 'zh-CN' ? 'zh-CN' : 'en';
  wireLanguageSelect();
  applyI18n(document.body);
  startObserver();
}

export function applyI18n(root: ParentNode): void {
  if (applying) return;
  applying = true;
  try {
    translateTextNodes(root);
    translateAttributes(root);
  } finally {
    applying = false;
  }
}

function readLocale(): AppLocale {
  const saved = localStorage.getItem(LOCALE_KEY);
  return saved === 'en' || saved === 'zh-CN' ? saved : 'zh-CN';
}

function wireLanguageSelect(): void {
  const select = document.getElementById('settings-language-select') as HTMLSelectElement | null;
  if (!select) return;
  syncLanguageSelect();
  select.addEventListener('change', () => {
    const next = select.value === 'en' ? 'en' : 'zh-CN';
    setLocale(next);
  });
}

function syncLanguageSelect(): void {
  const select = document.getElementById('settings-language-select') as HTMLSelectElement | null;
  if (select) select.value = currentLocale;
}

function startObserver(): void {
  observer?.disconnect();
  observer = new MutationObserver((mutations) => {
    if (applying) return;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            applyI18n(node as ParentNode);
          }
        });
      } else if (mutation.type === 'characterData') {
        const parent = mutation.target.parentElement;
        if (parent && !shouldSkip(parent)) translateTextNode(mutation.target as Text);
      } else if (mutation.type === 'attributes') {
        const el = mutation.target as Element;
        translateElementAttributes(el);
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['title', 'placeholder'],
  });
}

function translateTextNodes(root: ParentNode): void {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as unknown as Text);
    return;
  }
  if (root instanceof Element && shouldSkip(root)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkip(parent)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node = walker.nextNode() as Text | null;
  while (node) {
    translateTextNode(node);
    node = walker.nextNode() as Text | null;
  }
}

function translateTextNode(node: Text): void {
  const raw = node.nodeValue ?? '';
  const trimmed = raw.trim();
  if (!trimmed) return;
  const translated = translateExact(trimmed);
  if (translated === trimmed) return;
  node.nodeValue = raw.replace(trimmed, translated);
}

function translateAttributes(root: ParentNode): void {
  if (root instanceof Element) translateElementAttributes(root);
  if (root instanceof Element || root instanceof DocumentFragment || root === document.body) {
    (root as Element | DocumentFragment)
      .querySelectorAll?.('[title], [placeholder]')
      .forEach(translateElementAttributes);
  }
}

function translateElementAttributes(el: Element): void {
  for (const attr of ['title', 'placeholder']) {
    const value = el.getAttribute(attr);
    if (!value) continue;
    const translated = translateExact(value);
    if (translated !== value) el.setAttribute(attr, translated);
  }
}

function translateExact(text: string): string {
  if (currentLocale === 'zh-CN') return EN_TO_ZH[text] ?? text;
  return ZH_TO_EN[text] ?? text;
}

function shouldSkip(el: Element): boolean {
  if (['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE'].includes(el.tagName)) return true;
  return Boolean(
    el.closest(
      [
        '.message-content',
        '.thinking-content',
        '.code-block',
        '.chat-input',
        '.mini-chat-messages',
        '.research-report-body',
        '.content-editor',
      ].join(','),
    ),
  );
}
