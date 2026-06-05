# 性能基准测试

OpenPawz 提供一个专用的基准测试包（`openpawz-bench`），由 [Criterion.rs](https://bheisler.github.io/criterion.rs/book/) 驱动，测量引擎中的每一个性能关键路径——从 SQLite 会话操作和内存搜索到 HNSW 向量索引、注入扫描和加密操作。

## 为什么要进行基准测试？

| 目标 | 它能捕获什么 |
|------|-----------------|
| **回归检测** | 重构悄无声息地使 BM25 搜索时间翻倍 |
| **容量规划** | 我们插入 2000 个 HNSW 向量有多快？ |
| **优化目标定位** | 在优化之前知道*哪个*函数是瓶颈 |
| **算法比较** | 1000 个向量时 HNSW 搜索与暴力搜索 |
| **CI 门控** | 如果关键路径的性能下降超过阈值，PR 将失败 |

## 基准套件

这个包包含**8 个基准文件**，涵盖**200 多个单独的基准测试**：

### session_bench

会话、消息、任务、智能体文件 I/O 和对话加载。

| 基准测试 | 它测量什么 |
|-----------|------------------|
| `session/create` | 创建一个新的聊天会话（SQLite INSERT） |
| `session/get` | 按 ID 获取单个会话 |
| `session/delete` | 删除一个会话并级联清理相关数据 |
| `session/list/{10,100,500}` | 在不同数据库大小下列出会话 |
| `session/list_filtered/{all,by_agent}` | 过滤的会话列表（动态 WHERE） |
| `session/rename` | 重命名会话标签 |
| `session/clear_messages` | 批量删除会话的所有消息 |
| `session/prune_to_100` | 只保留最新的 N 条消息 |
| `session/load_conversation` | 加载完整的对话及角色/内容元数据 |
| `message/add` | 添加带有 HMAC 链验证的消息 |
| `message/get/{50,200,1000}` | 在不同深度获取消息 |
| `task/create` | 创建计划任务 |
| `task/list_200` | 列出 200 个任务并完全反序列化 |
| `task/update` | 更新任务字段 |
| `task/add_activity` | 插入任务活动日志条目 |
| `task/list_activity_50` | 列出任务活动日志 |
| `task/set_agents_3` | 批量指派智能体给任务 |
| `task/get_agents` | 列出分配给任务的智能体 |
| `agent/file_set` | 写入一个智能体文件（SOUL、instructions） |
| `agent/file_get` | 按键读取一个智能体文件 |
| `agent/file_list` | 列出智能体的所有文件 |
| `agent/compose_context` | 从所有文件合成完整智能体上下文 |

### platform_bench

配置、流程、小组、画布、项目和遥测。

| 基准测试 | 它测量什么 |
|-----------|-----------------|
| `config/set` | 插入或更新一个键/值配置对 |
| `config/get` | 按键检索配置值 |
| `config/get_miss` | 查找不存在的键（未命中路径） |
| `flow/save` | 创建或更新一个流程图 |
| `flow/get` | 按 ID 获取单个流程 |
| `flow/list/{10,50,200}` | 在不同数据库大小下列出流程 |
| `flow/run_create` | 记录流程执行运行 |
| `flow/run_list_100` | 获取 100 个运行记录 |
| `squad/create` | 使用 4 名成员创建小队 |
| `squad/list_20` | 列出 20 个小队及其嵌套成员 |
| `squad/agents_share` | 检查两个智能体是否共享一个小队 |
| `squad/agent_in_squad` | 范围检查：智能体 ∈ 小队 |
| `canvas/upsert` | 插入或更新一个画布组件 |
| `canvas/list_by_session/{5,20,100}` | 按规模获取画布组件 |
| `canvas/patch` | 部分更新（标题 + 数据） |
| `project/create` | 使用 3 个智能体创建项目 |
| `project/list_20` | 列出 20 个项目及其嵌套智能体 |
| `project/set_agents_5` | 原子性地替换 5 个智能体任务 |
| `project/agents_share` | 检查两个智能体是否共享一个项目 |
| `project/agent_in_project` | 范围检查：智能体 ∈ 项目 |
| `project/get_agent_model` | 查找智能体模型覆盖 |
| `telemetry/record` | 插入遥测指标行 |
| `telemetry/daily_summary` | 聚合每日指标（100 行） |
| `telemetry/model_breakdown` | 每模型成本分解（200 行） |
| `telemetry/range_30d` | 聚合 30 天范围（300 行） |

### memory_bench

内存存储、BM25 搜索、知识图谱、情节和语义记忆子系统、内容重叠、事实提取、图边、程序搜索和痕迹聚合查询。

| 基准测试 | 它测量什么 |
|-----------|-----------------|
| `memory/store` | 插入一条内存记录 |
| `memory/get_by_id` | 按 ID 获取单个内存 |
| `memory/delete` | 按 ID 删除内存 |
| `memory/search_keyword` | 关键词（LIKE）搜索 |
| `memory/search_bm25` | BM25 排名全文搜索 |
| `memory/bm25_scaled/{20,100,500,2000}` | 在不同语料规模下的 BM25 |
| `memory/search_by_embedding_200` | 向量余弦相似性搜索（200 个内存） |
| `memory/list/{20,100,500}` | 按规模列出内存 |
| `memory/stats` | 聚合内存统计信息 |
| `memory/content_overlap/{identical,similar,disjoint,long}` | Jaccard 重叠去重 |
| `memory/extract_facts/{preference,context,instruction}` | 按类型提取事实 |
| `graph/relate` | 在两个内存节点之间创建边 |
| `graph/apply_decay` | 图上的时间衰减传递 |
| `graph/garbage_collect` | 移除孤立节点 |
| `graph/memory_stats` | 图统计信息 |
| `graph/store_procedural` | 插入过程记忆 |
| `graph/spreading_activation` | 图上的扩散激活 |
| `graph/community_detection` | Louvain 风格的社区检测 |
| `graph/add_edge` | 插入一个类型的内存图边 |
| `graph/get_edges_from` | 获取来自节点的所有传出边 |
| `graph/count_edges` | 计算图中的总边数 |
| `episodic/store` | 插入一条情节记忆 |
| `episodic/get` | 获取单个情节记忆 |
| `episodic/batch_get/{10,50,200}` | 在不同大小下批量获取 |
| `episodic/search_bm25/{20,100,500}` | 情节记忆的 BM25 搜索 |
| `episodic/search_vector` | 向量相似性搜索（余弦） |
| `episodic/gc_candidates/{50,200,1000}` | 按规模识别 GC 候选对象 |
| `semantic/store` | 插入一条语义记忆 |
| `semantic/search_bm25` | 语义记忆的 BM25 搜索 |
| `procedural/search` | 程序记忆的 BM25 搜索 |
| `engram/count/{episodic,episodic_by_agent,semantic,procedural}` | 按类型计数记忆 |

### engram_bench

HNSW 向量索引、重新排名、混合搜索、抽象树、分词器、感官缓冲区、工作记忆、情感系统、意图分类、实体提取、临时评分、回忆调节、门控搜索、模型功能、跨类型去重、元数据序列化和投影。

| 基准测试 | 它测量什么 |
|-----------|-----------------|
| `hnsw/insert/{100,500,2000}` | 在不同规模下构建 HNSW 索引 |
| `hnsw/search/{100,1000,5000}` | 在不同索引规模下的 ANN 搜索 |
| `hnsw/vs_brute_force_1k` | 在 1000 个向量时比较 HNSW 与线性扫描 |
| `reranking/rrf` | 倒数排名融合 |
| `reranking/mmr` | 最大边缘相关性 |
| `reranking/cross_type_dedup/{10,50,200}` | 在不同结果大小下的跨类型去重 |
| `hybrid/resolve_weight` | 解析混合搜索权重 |
| `hybrid/weighted_rrf_fuse` | 加权 RRF 融合 |
| `abstraction/build_tree` | 构建层次抽象树 |
| `abstraction/pack_with_fallback` | Token 预算打包 |
| `abstraction/select_level` | 选择抽象级别 |
| `tokenizer/count_tokens/{Cl100kBase,O200kBase,Heuristic}` | 按编码计算 Token |
| `tokenizer/truncate_to_budget` | 将文本截断为 Token 预算 |
| `sensory/push` | 推送到感官缓冲区 |
| `sensory/format_for_context` | 将感官缓冲区格式化用于 LLM 上下文 |
| `working_mem/insert_recall` | 工作记忆插入 + 回忆 |
| `working_mem/decay_priorities` | 优先级衰减传递 |
| `working_mem/format_for_context` | 将工作记忆格式化用于上下文 |
| `intent/classify/{factual,procedural,causal,exploratory,episodic}` | 意图分类 |
| `intent/weights` | 意图权重计算 |
| `entity/extract/{short,medium,long}` | 命名实体提取 |
| `metadata/infer` / `metadata/infer_full` | 元数据推理 |
| `metadata/detect_lang/{rust,python,typescript}` | 编程语言检测 |
| `metadata/serialize` / `metadata/deserialize` | 元数据 JSON 循环 |
| `metadata/extract_dates/{none,one,multi}` | 从文本中提取日期 |
| `temporal/recency_score/{1h,24h,7d,30d}` | 在不同年龄下进行新近性评分 |
| `temporal/cluster` | 时间聚类 |
| `recall_tuner/observe_and_tune` | 自适应回忆调节 |
| `quality/compute_ndcg` / `quality/average_relevancy` | 检索质量指标 |
| `quality/build_metrics` | 构建完整质量指标结构 |
| `gate/decision/{skip_greeting,retrieve_factual,...}` | 门控搜索决策 |
| `model_caps/resolve/{gpt5,claude,gemini,llama,unknown}` | 模型功能解析 |
| `model_caps/normalize_name` | 标准化模型名称字符串 |
| `model_caps/context_window/{gpt5,claude,gemini,llama,unknown}` | 解析上下文窗口大小 |
| `model_caps/max_output/{gpt5,claude,gemini}` | 解析最大输出 token 数 |
| `model_caps/injection_resistance/{gpt5,claude,llama}` | 解析注入阻力级别 |
| `affect/modulated_half_life` | 情感调节的记忆衰减 |
| `anticipatory/predict_next` | 主题转换预测 |
| `anticipatory/observe` | 主题观察记录 |
| `anticipatory/build_prefetch` | 从预测构建预取查询 |
| `projection/to_3d/{50,200,1000}` | 投影到 3D 用于可视化 |

### cognitive_bench

命题分解、记忆融合、SCC 证书、工具元数据扩展、认知状态、扩展门控搜索和提供者注册表。

| 基准测试 | 它测量什么 |
|-----------|-----------------|
| `proposition/decompose_simple` | 将单句分解为命题 |
| `proposition/decompose_compound` | 将多句复合文本分解 |
| `proposition/decompose_long` | 分解 20 句语料 |
| `fusion/run/{10,50}` | 在不同语料规模下的记忆融合循环 |
| `scc/capability_hash/{3,50}` | 在不同集规模下的 SHA-256 功能哈希 |
| `scc/memory_hash` | 验证链顶端的 SHA-256 哈希 |
| `scc/latest_certificate` | 获取最近的 SCC |
| `scc/list_certificates_50` | 获取 50 个证书链条目 |
| `tool_meta/mutability/{known_safe,known_write,unknown}` | 工具可变性分类 |
| `tool_meta/worker_allowed/{read_file,execute_command,custom}` | 工作进程工具允许列表检查 |
| `tool_meta/orchestrator_safe/{read_file,execute_command,coinbase}` | 编排器自动批准检查 |
| `tool_meta/auto_approved` | 列出所有自动审批工具 |
| `tool_meta/domain_str/{5 tools}` | 工具域字符串查找 |
| `cognitive/push_message` | 将消息推过认知状态 |
| `cognitive/classify_query/{factual,procedural,causal}` | 认知查询分类 |
| `cognitive/adapt_budget/{gpt5,claude,llama}` | 适应工作记忆预算到模型 |
| `cognitive/snapshot` / `cognitive/restore` | 工作记忆快照和恢复 |
| `gate/extended/{skip,defer,retrieve,deep}` | 扩展门控搜索决策 |
| `provider/has/{github,slack,notion,nonexistent}` | 提供者注册表查找 |
| `provider/registered_ids` | 列出所有注册提供者 ID |
| `provider/total` | 计算总注册提供者数 |

### security_bench

注入扫描、PII 检测、加密、约束解码、密钥派生、差分隐私、分数量化、安全清零和内存内容消毒。

| 基准测试 | 它测量什么 |
|-----------|-----------------|
| `injection/scan/{1KB,10KB,100KB}` | 在不同输入规模下进行注入扫描 |
| `injection/scan_clean` | 扫描干净（无注入）输入 |
| `injection/is_likely` | 快速启发式的注入检查 |
| `pii/detect/{no_pii,has_pii}` | PII 检测（电子邮件、SSN、卡片） |
| `encryption/encrypt/{64B,1KB,64KB}` | AES-256-GCM 在不同负载规模下的加密 |
| `encryption/decrypt/{64B,1KB,64KB}` | AES-256-GCM 在不同负载规模下的解密 |
| `constrained/detect/{openai,anthropic,google,ollama}` | 提供者约束检测 |
| `constrained/normalize_tool_required` | 工具 `required` 数组标准化 |
| `constrained/apply_openai_strict` | 应用 OpenAI 严格模式 |
| `crypto/derive_agent_key` | Argon2 基于的密钥派生 |
| `crypto/prepare_for_storage/{cleartext,sensitive,confidential}` | 分层存储准备 |
| `crypto/dp_noise/{eps_0.1,eps_1.0,eps_10.0}` | 差分隐私噪声 |
| `crypto/quantize_score` | 分数量化（预言机抵抗性） |
| `crypto/secure_zero/{32B,1KB,64KB}` | 在不同规模下安全内存清除 |
| `crypto/sanitize_recalled/{clean,injection,mixed}` | 内存内容消毒 |

### audit_bench

防篡改审计日志和软件构成证书。

| 基准测试 | 它测量什么 |
|-----------|-----------------|
| `audit/append` | 附加 HMAC 链接的审计条目 |
| `audit/verify_chain/{100,1000,5000}` | 按规模验证链完整性 |
| `audit/query_recent_50` | 查询 50 个最近的审计条目 |
| `audit/stats` | 聚合审计统计信息 |
| `scc/issue_certificate` | 发放能力证书 |
| `scc/verify_chain/{10,50,200}` | 按规模验证 SCC 链 |

### reasoning_bench

情感评分、情感上下文、定价、任务复杂性和工具元数据。

| 基准测试 | 它测量什么 |
|-----------|-----------------|
| `affect/score/{positive,negative,neutral,mixed}` | 对文本情感影响进行评分 |
| `affect/modulated_encoding` | 情感调节记忆编码 |
| `affect/congruent_boost` | 情绪一致的检索增强 |
| `affect/to_emotional_context` | 将情感转化为情绪上下文 |
| `pricing/model_price/{gpt-5.3,claude-opus-4-6,claude-sonnet-4,gemini-3.1-pro,...}` | 查找模型定价 |
| `pricing/estimate_cost_usd` | 估算 Token 成本 |
| `pricing/classify_complexity/{simple,complex}` | 分类任务复杂度等级 |
| `tool_meta/get/{execute_command,read_file,...}` | 检索工具元数据 |
| `tool_meta/tools_in_tier/{safe,reversible,external}` | 按安全性等级列出工具 |
| `tool_meta/domain_lookup` | 解析工具领域 |

## 最新结果 (2026年3月，苹果M系列)

在苹果M系列Mac电脑上执行`cargo bench -p openpawz-bench -- --quick`的结果。

### 会话和平台操作

| 基准测试 | 中位数 |
|-----------|--------|
| `session/create` | 6.0 µs |
| `session/get` | 4.2 µs |
| `session/delete` | 3.8 µs |
| `session/list/10` | 10.8 µs |
| `session/list/100` | 62.9 µs |
| `session/list/500` | 334.2 µs |
| `session/list_filtered/all` | 75.8 µs |
| `session/list_filtered/by_agent` | 56.8 µs |
| `session/rename` | 1.8 µs |
| `session/clear_messages` | 24.2 µs |
| `session/prune_to_100` | 3.7 µs |
| `session/load_conversation` | 100.9 µs |
| `message/add` | 9.3 µs |
| `message/get/50` | 53.7 µs |
| `message/get/200` | 187.8 µs |
| `message/get/1000` | 934.7 µs |
| `task/create` | 7.9 µs |
| `task/list_200` | 286.1 µs |
| `task/update` | 6.0 µs |
| `task/add_activity` | 5.9 µs |
| `task/list_activity_50` | 31.4 µs |
| `task/set_agents_3` | 15.3 µs |
| `task/get_agents` | 2.9 µs |
| `agent/file_set` | 5.7 µs |
| `agent/file_get` | 2.5 µs |
| `agent/file_list` | 6.9 µs |
| `agent/compose_context` | 4.1 µs |
| `config/set` | 2.4 µs |
| `config/get` | 1.6 µs |
| `config/get_miss` | 1.2 µs |
| `flow/save` | 8.4 µs |
| `flow/get` | 3.5 µs |
| `flow/list/10` | 11.0 µs |
| `flow/list/50` | 45.5 µs |
| `flow/list/200` | 167.1 µs |
| `flow/run_create` | 7.3 µs |
| `flow/run_list_100` | 72.1 µs |
| `squad/create` | 22.7 µs |
| `squad/list_20` | 70.4 µs |
| `squad/agents_share` | 3.5 µs |
| `squad/agent_in_squad` | 2.1 µs |
| `canvas/upsert` | 10.1 µs |
| `canvas/list_by_session/5` | 9.8 µs |
| `canvas/list_by_session/20` | 25.6 µs |
| `canvas/list_by_session/100` | 102.2 µs |
| `canvas/patch` | 3.5 µs |
| `project/create` | 6.2 µs |
| `project/list_20` | 87.0 µs |
| `project/set_agents_5` | 21.8 µs |
| `project/agents_share` | 4.3 µs |
| `project/agent_in_project` | 1.9 µs |
| `project/get_agent_model` | 2.0 µs |
| `telemetry/record` | 6.9 µs |
| `telemetry/daily_summary` | 25.1 µs |
| `telemetry/model_breakdown` | 62.5 µs |
| `telemetry/range_30d` | 81.4 µs |
| `tab/open` | 1.33 ms |
| `tab/list_20` | 15.0 µs |
| `tab/activate` | 6.5 µs |
| `tab/get_active` | 3.9 µs |
| `position/insert` | 25.0 µs |
| `position/list_all` | 49.7 µs |
| `position/list_open` | 50.4 µs |
| `position/update_price` | 3.2 µs |
| `position/close` | 6.4 µs |
| `skill_vault/set` | 3.4 µs |
| `skill_vault/get` | 1.7 µs |
| `skill_vault/list_keys` | 4.3 µs |
| `skill_vault/is_enabled` | 1.3 µs |

### 内存和知识图谱

| 基准测试 | 中位数 |
|-----------|--------|
| `memory/store` | 21.4 µs |
| `memory/get_by_id` | 3.6 µs |
| `memory/delete` | 2.8 µs |
| `memory/search_keyword` | 12.9 µs |
| `memory/search_bm25` | 31.1 µs |
| `memory/bm25_scaled/20` | 62.0 µs |
| `memory/bm25_scaled/100` | 71.0 µs |
| `memory/bm25_scaled/500` | 174.0 µs |
| `memory/bm25_scaled/2000` | 178.5 µs |
| `memory/search_by_embedding_200` | 231.7 µs |
| `memory/list/20` | 16.3 µs |
| `memory/list/100` | 66.8 µs |
| `memory/list/500` | 365.2 µs |
| `memory/stats` | 10.9 µs |
| `memory/content_overlap/identical` | 1.1 µs |
| `memory/content_overlap/similar` | 1.1 µs |
| `memory/content_overlap/disjoint` | 1.2 µs |
| `memory/content_overlap/long` | 14.3 µs |
| `graph/relate` | 14.4 µs |
| `graph/add_edge` | 15.7 µs |
| `graph/get_edges_from` | 668.0 µs |
| `graph/count_edges` | 903 ns |
| `graph/apply_decay` | 3.8 µs |
| `graph/garbage_collect` | 4.1 µs |
| `graph/memory_stats` | 3.5 µs |
| `graph/store_procedural` | 10.7 µs |
| `procedural/search` | 11.8 µs |
| `episodic/store` | 36.1 µs |
| `episodic/get` | 9.4 µs |
| `episodic/batch_get/10` | 31.3 µs |
| `episodic/batch_get/50` | 108.8 µs |
| `episodic/batch_get/200` | 416.9 µs |
| `episodic/search_bm25/20` | 32.9 µs |
| `episodic/search_vector` | 36.5 µs |
| `semantic/store` | 26.1 µs |
| `semantic/search_bm25` | 20.2 µs |
| `engram/count/episodic` | 847 ns |
| `engram/count/semantic` | 832 ns |
| `engram/count/procedural` | 819 ns |

### 痕迹（认知流程）

| 基准测试 | 中位数 |
|-----------|--------|
| `hnsw/insert/100` | 29.3 ms |
| `hnsw/insert/500` | 271.5 ms |
| `hnsw/insert/2000` | 1.89 s |
| `hnsw/search/100` | 37.1 µs |
| `hnsw/search/1000` | 380.6 µs |
| `hnsw/search/5000` | 733.2 µs |
| `reranking/rrf` | 6.2 µs |
| `reranking/mmr` | 63.8 µs |
| `reranking/cross_type_dedup/10` | 1.7 µs |
| `reranking/cross_type_dedup/50` | 9.8 µs |
| `reranking/cross_type_dedup/200` | 53.5 µs |
| `hybrid/resolve_weight` | 436 ns |
| `abstraction/build_tree` | 8.7 µs |
| `sensory/push` | 253 ns |
| `affect/score_affect` | 6.3 µs |
| `affect/modulated_half_life` | 1.1 ns |
| `intent/weights` | 5.0 µs |
| `metadata/infer` | 14.3 µs |
| `metadata/infer_full` | 16.3 µs |
| `metadata/serialize` | 254 ns |
| `metadata/deserialize` | 530 ns |
| `metadata/extract_dates/none` | 98 ns |
| `metadata/extract_dates/one` | 324 ns |
| `metadata/extract_dates/multi` | 627 ns |
| `model_caps/context_window` | 200 ns |
| `model_caps/max_output` | 335 ns |
| `model_caps/injection_resistance` | 210 ns |
| `temporal/cluster` | 3.0 µs |
| `quality/compute_ndcg` | 177 ns |
| `quality/build_metrics` | 202 ns |
| `proposition/decompose_simple` | 1.4 µs |
| `proposition/decompose_compound` | 6.0 µs |
| `proposition/decompose_long` | 30.8 µs |
| `fusion/run/10` | 12.6 µs |
| `fusion/run/50` | 11.2 µs |

### 安全和密码学

| 基准测试 | 中位数 |
|-----------|--------|
| `injection/scan/1KB` | 137.8 µs |
| `injection/scan/10KB` | 739.6 µs |
| `injection/scan/100KB` | 6.63 ms |
| `injection/scan_clean` | 205.1 µs |
| `injection/is_likely` | 82.9 µs |
| `encryption/encrypt/128B` | 3.8 µs |
| `encryption/encrypt/1KB` | 4.1 µs |
| `encryption/encrypt/64KB` | 42.3 µs |
| `encryption/decrypt/128B` | 3.0 µs |
| `encryption/decrypt/1KB` | 3.3 µs |
| `encryption/decrypt/64KB` | 39.8 µs |
| `crypto/derive_agent_key` | 1.6 µs |
| `crypto/quantize_score` | 3.5 ns |
| `crypto/secure_zero` | 4.2 ns |
| `sanitize/recalled_memory` | 12.7 µs |

### 审计和 SCC

| 基准测试 | 中位数 |
|-----------|--------|
| `audit/append` | 16.4 µs |
| `audit/verify_chain/100` | 397.9 µs |
| `audit/verify_chain/1000` | 3.92 ms |
| `audit/verify_chain/5000` | 19.98 ms |
| `audit/query_recent_50` | 43.4 µs |
| `audit/stats` | 15.0 µs |
| `scc/issue_certificate` | 14.5 µs |
| `scc/capability_hash/3` | 553 ns |
| `scc/capability_hash/50` | 6.3 µs |
| `scc/memory_hash` | 1.5 µs |
| `scc/latest_certificate` | 3.7 µs |
| `scc/list_certificates_50` | 37.5 µs |

### 推理和工具元数据

| 基准测试 | 中位数 |
|-----------|--------|
| `affect/score/{positive,negative,neutral,mixed}` | 6.0–6.5 µs |
| `affect/modulated_encoding` | 1.3 ns |
| `affect/congruent_boost` | 2.1 ns |
| `affect/to_emotional_context` | 1.8 µs |
| `cognitive/state_new` | 42 ns |
| `cognitive/state_update_focus` | 18 ns |
| `cognitive/state_snapshot` | 65 ns |
| `gated_search/low_gate` | 1.2 µs |
| `gated_search/high_gate` | 1.4 µs |
| `gated_search/extended_context` | 2.1 µs |
| `provider/registry_lookup` | 35 ns |
| `pricing/model_price` | 10–25 ns |
| `pricing/estimate_cost_usd` | 14.7 ns |
| `pricing/classify_complexity` | 23–24 ns |
| `tool_meta/get` | 12–17 ns |
| `tool_meta/tools_in_tier` | 228–265 ns |
| `tool_meta/domain_lookup` | 60 ns |
| `tool_meta/mutability` | 26–214 ns |
| `tool_meta/worker_allowed` | 16–24 ns |
| `tool_meta/orchestrator_safe` | 14–30 ns |
| `tool_meta/auto_approved` | 429 ns |
| `tool_meta/domain_str` | 18–31 ns |

## 运行基准测试

所有的命令都假设你在 `src-tauri/` 目录内。

### 快速计时 (内置)

运行一个快速的、自包含的计时循环——没有 Criterion 开销。适合做一个
快速的合理性检查：

```bash
openpawz bench quick                  # 100 次迭代（默认值）
openpawz bench quick --iterations 500 # 500 次迭代
openpawz bench quick --output json    # 机器可读输出
```

### 完整的 Criterion 套件

运行统计上严格的 Criterion 套件，每个基准测试有 100 个样本：

```bash
openpawz bench full                           # 运行所有 8 个套件
openpawz bench full --bench session_bench     # 仅会话基准测试
openpawz bench full --bench engram_bench hnsw # 在痕迹中过滤到 HNSW
```

或者直接使用 cargo 运行：

```bash
cargo bench -p openpawz-bench                           # 所有套件
cargo bench -p openpawz-bench --bench memory_bench      # 一个套件
cargo bench -p openpawz-bench --bench engram_bench -- hnsw  # 过滤
```

### 生成报告

解析 Criterion 保存的结果并生成 Markdown 报告：

```bash
openpawz bench report                            # → benchmarks-report.md
openpawz bench report -o perf-report.md          # 自定义输出路径
openpawz bench report --run-first                # 运行基准测试，然后生成报告
openpawz bench report --run-first --bench session_bench  # 首先运行一个套件
openpawz bench report --output json              # 打印 JSON 到标准输出
```

报告包括：

- **汇总表** — 每个类别中总计、最快和最慢的基准
- **详细表格** — 每个基准测试的平均值、中位数和标准差  
- **最慢前 10 名** — 一眼看过去的优化目标
- **最快前 10 名** — 亚微秒操作的合理性检查

### HTML 报告

Criterion 自动生成带图表的交互式 HTML 报告：

```
target/criterion/report/index.html   # 概览
target/criterion/<bench>/report/     # 每个基准测试的详细信息
```

在浏览器中打开它们：

```bash
open target/criterion/report/index.html   # macOS
xdg-open target/criterion/report/index.html  # Linux
```

## 理解结果

每个 Criterion 基准测试报告三个计时值：

| 数值 | 含义 |
|-------|---------|
| **平均值** | 所有样本的平均值 |
| **中位数** | 第 50 百分位数 — 对异常值不太敏感 |
| **标准差** | 分散度 — 高值表示噪声较大的测量值 |

### 什么是正常的？

| 操作类型 | 预期范围 |
|---------------|---------------|
| 内存查找（分词器、情感、意图、定价、工具元数据） | < 10 µs |
| 配置键/值 get/set | 1–3 µs |
| 单个 SQLite 读取（会话 get、流 get、画布 get） | 2–10 µs |
| 单个 SQLite 写入（会话创建、流程保存） | 5–25 µs |
| 批量 SQLite 读取（列出 100–500 行） | 40–400 µs |
| BM25 / 关键字搜索 | 15–60 µs |
| BM25 缩放搜索（500–2000 条内存） | 170–180 µs |
| 嵌入向量搜索（200 个向量） | 200–250 µs |
| 消息添加（单次插入） | 8–12 µs |
| 选项卡操作（带 MAX 子查询的打开） | 1–2 ms |
| 选项卡读取（列出，获取活动） | 3–16 µs |
| 位置插入 / 关闭 | 6–25 µs |
| 技能库 get/set | 1–4 µs |
| 图边操作（添加，计数） | 1–16 µs |
| 图边遍历（get_edges_from） | 600–700 µs |
| 程序内存搜索 | 10–15 µs |
| 痕迹类型计数（情节/语义/程序） | 800–900 ns |
| HNSW 搜索（1000 个向量） | 300–400 µs |
| HNSW 插入（2000 个向量） | 1–3 s |
| 跨类型去重（200 个候选项） | 50–60 µs |
| 社区检测（图） | 100–300 µs |
| AES-256-GCM 加密/解密（128 B） | 3–4 µs |
| AES-256-GCM 加密/解密（64 KB） | 40–45 µs |
| Argon2 密钥派生 | 1–2 µs |
| 注入扫描（1 KB） | 130–150 µs |
| 注入扫描（100 KB） | 6–7 ms |
| 内容重叠（短） | 1–1.5 µs |
| 命题分解（复合） | 5–7 µs |
| 元数据序列化/反序列化 | 250–550 ns |
| 模型功能查找 | 200–350 ns |
| 认知状态操作 | 18–65 ns |
| 质量指标（nDCG，构建） | 175–200 ns |
| 遥测范围聚合（30 天） | 80–100 µs |
| SCC 功能哈希（3 个功能） | 500–600 ns |

### "找不到 Gnuplot" 消息

```
Gnuplot not found, using plotters backend
```

这并不重要。Criterion 优先使用 gnuplot 进行 HTML 图表渲染，但会自动
退回到 plotter（纯 Rust 替代方案）。基准测试数字是相同的。要消除它：

```bash
brew install gnuplot   # macOS
sudo apt install gnuplot  # Debian/Ubuntu
```

## 提示

- **保持一致的环境**：在基准测试前关闭浏览器和重量级应用程序。
  Criterion 需要 100 个样本，因此瞬态负载可能会造成异常值。
- **预热缓存**：运行两次套件。第一次运行会填充 OS 文件
  缓存；第二次给出更稳定的数据。
- **过滤以提高速度**：使用 `openpawz bench full --bench session_bench` 来运行
  只有一个套件，当在特定模块上迭代时。
- **回归跟踪**：定期保存报告
  (`openpawz bench report -o bench-2026-03-17.md`) 并对比它们来捕获
  回归。
- **集成CI**：以编程方式进行 `--output json` 格式对比
  基线。
