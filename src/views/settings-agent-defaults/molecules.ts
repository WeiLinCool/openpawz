// Settings: Agent Defaults — DOM rendering + IPC

import { pawEngine } from '../../engine';
import { showToast } from '../../components/toast';
import { isConnected } from '../../state/connection';
import type { EmbeddingProvider } from '../../engine/atoms/types';
import {
  esc,
  formRow,
  selectInput,
  textInput,
  numberInput,
  toggleSwitch,
  saveReloadButtons,
} from '../settings-config';
import { $ } from '../../components/helpers';

// ── Render ──────────────────────────────────────────────────────────────────

export async function loadAgentDefaultsSettings() {
  if (!isConnected()) return;
  const container = $('settings-agent-defaults-content');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted)">加载中…</p>';

  try {
    const config = await pawEngine.getConfig();
    const memConfig = await pawEngine.getMemoryConfig();
    container.innerHTML = '';

    // ── Default Model & Provider ─────────────────────────────────────────
    const modelSection = document.createElement('div');
    modelSection.innerHTML = '<h3 class="settings-subsection-title">模型与提供商</h3>';

    const modelRow = formRow('Default Model', 'The AI model used for new conversations');
    const modelInp = textInput(config.default_model ?? '', 'gpt-4o');
    modelInp.style.maxWidth = '280px';
    modelRow.appendChild(modelInp);
    modelSection.appendChild(modelRow);

    // Quick-pick model chips from configured providers
    if (config.providers.length > 0) {
      const chipsRow = document.createElement('div');
      chipsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px 0';
      for (const prov of config.providers) {
        if (prov.default_model) {
          const chip = document.createElement('button');
          chip.className = 'btn btn-sm';
          chip.textContent = `${prov.default_model} (${prov.kind})`;
          chip.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:12px';
          chip.addEventListener('click', () => {
            modelInp.value = prov.default_model!;
          });
          chipsRow.appendChild(chip);
        }
      }
      if (chipsRow.children.length > 0) modelSection.appendChild(chipsRow);
    }

    const providerRow = formRow(
      'Default Provider',
      'Which provider to use when auto-detection fails',
    );
    const providerOpts = [
      { value: '', label: '(auto-detect from model name)' },
      ...config.providers.map((p) => ({ value: p.id, label: `${p.kind} (${p.id})` })),
    ];
    const providerSel = selectInput(providerOpts, config.default_provider ?? '');
    providerSel.style.maxWidth = '280px';
    providerRow.appendChild(providerSel);
    modelSection.appendChild(providerRow);

    container.appendChild(modelSection);

    // ── Tool Execution ───────────────────────────────────────────────────
    const toolSection = document.createElement('div');
    toolSection.innerHTML =
      '<h3 class="settings-subsection-title" style="margin-top:20px">工具执行</h3>';

    const roundsRow = formRow(
      'Max Tool Rounds',
      'How many tool call rounds before the agent stops (default: 20)',
    );
    const roundsInp = numberInput(config.max_tool_rounds, { min: 1, max: 100, placeholder: '20' });
    roundsInp.style.maxWidth = '120px';
    roundsRow.appendChild(roundsInp);
    toolSection.appendChild(roundsRow);

    const timeoutRow = formRow(
      'Tool Timeout (seconds)',
      'Max seconds for a single tool execution (default: 120)',
    );
    const timeoutInp = numberInput(config.tool_timeout_secs, {
      min: 5,
      step: 5,
      placeholder: '120',
    });
    timeoutInp.style.maxWidth = '140px';
    timeoutRow.appendChild(timeoutInp);
    toolSection.appendChild(timeoutRow);

    const tzRow = formRow(
      'User Timezone',
      'IANA timezone (e.g. America/Chicago, America/New_York, Europe/London). Used for agent time awareness.',
    );
    const tzInp = document.createElement('input');
    tzInp.className = 'form-input';
    tzInp.type = 'text';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tzInp.value = (config as any).user_timezone ?? 'America/Chicago';
    tzInp.placeholder = 'America/Chicago';
    tzInp.style.maxWidth = '240px';
    tzRow.appendChild(tzInp);
    toolSection.appendChild(tzRow);

    // Weather Location
    const weatherRow = formRow(
      'Weather Location',
      'City for your dashboard weather (e.g. New York, London). Auto-detected via IP if empty.',
    );
    const weatherInp = document.createElement('input');
    weatherInp.className = 'form-input';
    weatherInp.type = 'text';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weatherInp.value = (config as any).weather_location ?? '';
    weatherInp.placeholder = 'Auto-detect (leave empty) or enter city';
    weatherInp.style.maxWidth = '240px';
    weatherRow.appendChild(weatherInp);
    toolSection.appendChild(weatherRow);

    container.appendChild(toolSection);

    // ── System Prompt ────────────────────────────────────────────────────
    const promptSection = document.createElement('div');
    promptSection.innerHTML =
      '<h3 class="settings-subsection-title" style="margin-top:20px">默认系统提示词</h3>';
    promptSection.innerHTML +=
      '<p class="form-hint" style="margin:0 0 8px;font-size:11px;color:var(--text-muted)">每次对话前都会附加的基础指令。智能体 soul 文件（SOUL.md、IDENTITY.md 等）会追加在其上。</p>';

    const promptArea = document.createElement('textarea');
    promptArea.className = 'form-input';
    promptArea.style.cssText =
      'width:100%;min-height:140px;font-family:var(--font-mono);font-size:12px;resize:vertical';
    promptArea.value = config.default_system_prompt ?? '';
    promptArea.placeholder = '你是一名乐于助人的 AI 助手。你可以使用各种工具...';
    promptSection.appendChild(promptArea);

    container.appendChild(promptSection);

    // ── Memory Defaults ──────────────────────────────────────────────────
    const memSection = document.createElement('div');
    memSection.innerHTML =
      '<h3 class="settings-subsection-title" style="margin-top:20px">记忆默认值</h3>';

    const { container: recallToggle, checkbox: recallCb } = toggleSwitch(
      memConfig.auto_recall,
      'Auto-recall relevant memories before each turn',
    );
    memSection.appendChild(recallToggle);

    const { container: captureToggle, checkbox: captureCb } = toggleSwitch(
      memConfig.auto_capture,
      'Auto-capture facts from conversations',
    );
    memSection.appendChild(captureToggle);

    const recallLimitRow = formRow('Recall Limit', 'Max memories to inject per turn');
    const recallLimitInp = numberInput(memConfig.recall_limit, {
      min: 1,
      max: 50,
      placeholder: '5',
    });
    recallLimitInp.style.maxWidth = '100px';
    recallLimitRow.appendChild(recallLimitInp);
    memSection.appendChild(recallLimitRow);

    container.appendChild(memSection);

    // ── Embedding Configuration ──────────────────────────────────────────
    const embSection = document.createElement('div');
    embSection.innerHTML =
      '<h3 class="settings-subsection-title" style="margin-top:20px">嵌入（语义搜索）</h3>';
    embSection.innerHTML +=
      '<p class="form-hint" style="margin:0 0 8px;font-size:11px;color:var(--text-muted)">嵌入向量用于驱动语义记忆搜索。请选择一个提供商 - Ollama 可本地运行，也可以使用你现有的云端 API Key。若嵌入不可用，Pawz 会自动回退到关键词匹配。</p>';

    // ── Embedding Provider selector ──────────────────────────────────────
    const embProviderRow = formRow(
      'Embedding Provider',
      'Which service generates embedding vectors',
    );
    const embProviderOpts = [
      { value: 'auto', label: 'Auto (Ollama → cloud fallback)' },
      { value: 'ollama', label: 'Ollama (local)' },
      { value: 'openai', label: 'OpenAI' },
      { value: 'google', label: 'Google (Gemini)' },
      { value: 'provider', label: 'Use my chat provider' },
    ];
    const embProviderSel = selectInput(embProviderOpts, memConfig.embedding_provider ?? 'auto');
    embProviderSel.style.maxWidth = '280px';
    embProviderRow.appendChild(embProviderSel);
    embSection.appendChild(embProviderRow);

    // ── Ollama-specific section (auto-setup, URL, model chips) ───────────
    const ollamaSection = document.createElement('div');
    ollamaSection.dataset.embProvider = 'ollama';

    // Auto-Setup button (prominent)
    const autoSetupRow = document.createElement('div');
    autoSetupRow.style.cssText =
      'display:flex;align-items:center;gap:10px;margin:0 0 12px 0;padding:10px 14px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-secondary, rgba(255,255,255,0.03))';
    const autoSetupBtn = document.createElement('button');
    autoSetupBtn.className = 'btn btn-primary btn-sm';
    autoSetupBtn.textContent = '自动配置 Ollama 嵌入';
    autoSetupBtn.style.whiteSpace = 'nowrap';
    const autoSetupStatus = document.createElement('span');
    autoSetupStatus.style.cssText = 'font-size:12px;color:var(--text-muted);line-height:1.4';
    autoSetupStatus.textContent =
      '检查 Ollama，必要时启动它，并拉取嵌入模型';
    autoSetupRow.appendChild(autoSetupBtn);
    autoSetupRow.appendChild(autoSetupStatus);
    ollamaSection.appendChild(autoSetupRow);

    autoSetupBtn.addEventListener('click', async () => {
      autoSetupBtn.disabled = true;
      autoSetupBtn.textContent = '⏳ 正在配置…';
      autoSetupStatus.textContent = '正在启动 Ollama 并检查嵌入模型…';
      autoSetupStatus.style.color = 'var(--text-muted)';
      try {
        // Save current form values first
        const mc = await pawEngine.getMemoryConfig();
        mc.embedding_provider = embProviderSel.value as EmbeddingProvider;
        mc.embedding_base_url = embUrlInp.value.trim() || 'http://localhost:11434';
        mc.embedding_model = embModelInp.value.trim() || 'nomic-embed-text';
        mc.embedding_dims = parseInt(embDimsInp.value) || 768;
        await pawEngine.setMemoryConfig(mc);

        const result = await pawEngine.ensureEmbeddingReady();
        if (result.error) {
          autoSetupStatus.textContent = `✗ ${result.error}`;
          autoSetupStatus.style.color = 'var(--text-danger)';
        } else {
          let msg = `✓ 已就绪！${result.model_name} — ${result.embedding_dims} 维`;
          if (result.was_auto_started) msg += '（Ollama 已自动启动）';
          if (result.was_auto_pulled) msg += '（模型已自动拉取）';
          autoSetupStatus.textContent = msg;
          autoSetupStatus.style.color = 'var(--text-success)';
          // Update dims field with actual value
          if (result.embedding_dims > 0) embDimsInp.value = String(result.embedding_dims);
          showToast('语义记忆已就绪！', 'success');
        }
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        autoSetupStatus.textContent = `✗ ${err}`;
        autoSetupStatus.style.color = 'var(--text-danger)';
      } finally {
        autoSetupBtn.disabled = false;
        autoSetupBtn.textContent = '自动配置 Ollama 嵌入';
      }
    });

    const embUrlRow = formRow(
      'Ollama 地址',
      'Ollama 的运行地址（默认：http://localhost:11434）',
    );
    const embUrlInp = textInput(
      memConfig.embedding_base_url || 'http://localhost:11434',
      'http://localhost:11434',
    );
    embUrlInp.style.maxWidth = '320px';
    embUrlRow.appendChild(embUrlInp);
    ollamaSection.appendChild(embUrlRow);

    const embModelRow = formRow('嵌入模型', '用于生成嵌入向量的模型');
    const embModelInp = textInput(
      memConfig.embedding_model || 'nomic-embed-text',
      'nomic-embed-text',
    );
    embModelInp.style.maxWidth = '220px';
    embModelRow.appendChild(embModelInp);
    ollamaSection.appendChild(embModelRow);

    // Model quick-picks (Ollama models)
    const modelChipsRow = document.createElement('div');
    modelChipsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin:2px 0 8px 0';
    for (const m of [
      'nomic-embed-text',
      'all-minilm',
      'mxbai-embed-large',
      'snowflake-arctic-embed',
    ]) {
      const chip = document.createElement('button');
      chip.className = 'btn btn-sm';
      chip.textContent = m;
      chip.style.cssText = 'font-size:11px;padding:2px 8px;border-radius:12px';
      chip.addEventListener('click', () => {
        embModelInp.value = m;
      });
      modelChipsRow.appendChild(chip);
    }
    ollamaSection.appendChild(modelChipsRow);
    embSection.appendChild(ollamaSection);

    // ── Cloud provider info section (shown for openai/google/provider) ────
    const cloudSection = document.createElement('div');
    cloudSection.dataset.embProvider = 'cloud';
    const cloudInfo = document.createElement('div');
    cloudInfo.style.cssText =
      'padding:10px 14px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-secondary, rgba(255,255,255,0.03));margin:0 0 12px 0';
    cloudInfo.innerHTML = `
      <p style="margin:0 0 6px;font-size:12px;color:var(--text-primary)"><strong>使用你已配置的聊天提供商生成嵌入</strong></p>
      <p style="margin:0;font-size:11px;color:var(--text-muted)">
        嵌入模型会根据你的提供商自动选择：<br>
        <strong>OpenAI</strong> → text-embedding-3-small &nbsp;|&nbsp;
        <strong>Google</strong> → text-embedding-004 &nbsp;|&nbsp;
        <strong>Mistral</strong> → mistral-embed<br>
        无需额外配置 - 会直接使用你已有的 API Key。
      </p>
    `;
    cloudSection.appendChild(cloudInfo);
    embSection.appendChild(cloudSection);

    // ── Shared fields (dims, test, backfill) ─────────────────────────────
    const embDimsRow = formRow(
      '嵌入维度',
      '在你运行“测试”或“自动配置”时自动检测',
    );
    const embDimsInp = numberInput(memConfig.embedding_dims || 768, {
      min: 64,
      max: 4096,
      placeholder: '768',
    });
    embDimsInp.style.maxWidth = '120px';
    embDimsRow.appendChild(embDimsInp);
    embSection.appendChild(embDimsRow);

    // Status / test button
    const embStatusRow = document.createElement('div');
    embStatusRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin:10px 0';
    const testBtn = document.createElement('button');
    testBtn.className = 'btn btn-sm';
    testBtn.textContent = '测试连接';
    const backfillBtn = document.createElement('button');
    backfillBtn.className = 'btn btn-sm';
    backfillBtn.textContent = '补齐嵌入';
    backfillBtn.title = '为任何未带向量存储的记忆生成嵌入';
    const statusSpan = document.createElement('span');
    statusSpan.style.cssText = 'font-size:12px;color:var(--text-muted)';
    embStatusRow.appendChild(testBtn);
    embStatusRow.appendChild(backfillBtn);
    embStatusRow.appendChild(statusSpan);
    embSection.appendChild(embStatusRow);

    testBtn.addEventListener('click', async () => {
      testBtn.disabled = true;
      statusSpan.textContent = '测试中...';
      statusSpan.style.color = 'var(--text-muted)';
      try {
        // Save current values first so the test uses them
        const mc = await pawEngine.getMemoryConfig();
        mc.embedding_provider = embProviderSel.value as EmbeddingProvider;
        mc.embedding_base_url = embUrlInp.value.trim() || 'http://localhost:11434';
        mc.embedding_model = embModelInp.value.trim() || 'nomic-embed-text';
        mc.embedding_dims = parseInt(embDimsInp.value) || 768;
        await pawEngine.setMemoryConfig(mc);

        const dims = await pawEngine.testEmbedding();
        statusSpan.textContent = `✓ 已连接 — ${dims} 维`;
        statusSpan.style.color = 'var(--text-success)';
        if (dims > 0) embDimsInp.value = String(dims);
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        statusSpan.textContent = `✗ ${err}`;
        statusSpan.style.color = 'var(--text-danger)';
      } finally {
        testBtn.disabled = false;
      }
    });

    backfillBtn.addEventListener('click', async () => {
      backfillBtn.disabled = true;
      statusSpan.textContent = '正在补齐…';
      statusSpan.style.color = 'var(--text-muted)';
      try {
        const result = await pawEngine.memoryBackfill();
        statusSpan.textContent = `✓ 补齐完成：${result.success} 个已嵌入，${result.failed} 个失败`;
        statusSpan.style.color =
          result.failed > 0 ? 'var(--text-warning, orange)' : 'var(--text-success)';
      } catch (e) {
        statusSpan.textContent = `✗ 补齐失败：${e instanceof Error ? e.message : e}`;
        statusSpan.style.color = 'var(--text-danger)';
      } finally {
        backfillBtn.disabled = false;
      }
    });

    // ── Provider-dependent visibility ──────────────────────────────────
    const updateEmbProviderUI = () => {
      const prov = embProviderSel.value;
      const isOllama = prov === 'auto' || prov === 'ollama';
      ollamaSection.style.display = isOllama ? '' : 'none';
      cloudSection.style.display = isOllama ? 'none' : '';
    };
    embProviderSel.addEventListener('change', updateEmbProviderUI);
    updateEmbProviderUI(); // initial state

    // Check embedding status on load
    (async () => {
      try {
        const prov = embProviderSel.value;
        if (prov === 'auto' || prov === 'ollama') {
          const embStatus = await pawEngine.embeddingStatus();
          if (embStatus.ollama_running && embStatus.model_available) {
            statusSpan.textContent = `✓ Ollama 正在运行，${embStatus.model_name} 可用`;
            statusSpan.style.color = 'var(--text-success)';
            autoSetupStatus.textContent = `✓ Ollama 正在运行，${embStatus.model_name} 已可用`;
            autoSetupStatus.style.color = 'var(--text-success)';
          } else if (embStatus.ollama_running) {
            statusSpan.textContent = `Ollama 正在运行，但 ${embStatus.model_name} 还未拉取`;
            statusSpan.style.color = 'var(--text-warning, orange)';
            autoSetupStatus.textContent = `Ollama 正在运行，但需要拉取 ${embStatus.model_name} - 请点击自动配置`;
            autoSetupStatus.style.color = 'var(--text-warning, orange)';
          } else {
            statusSpan.textContent =
              '未检测到 Ollama - 请点击自动配置或切换到云端提供商';
            statusSpan.style.color = 'var(--text-warning, orange)';
          }
        } else {
          statusSpan.textContent = `正在使用 ${prov} 提供商生成嵌入 - 点击测试进行验证`;
          statusSpan.style.color = 'var(--text-muted)';
        }
      } catch {
        /* ignore */
      }
    })();

    container.appendChild(embSection);

    // ── Save ─────────────────────────────────────────────────────────────
    container.appendChild(
      saveReloadButtons(
        async () => {
          try {
            // Save engine config
            const cfg = await pawEngine.getConfig();
            cfg.default_model = modelInp.value.trim() || undefined;
            cfg.default_provider = providerSel.value || undefined;
            cfg.max_tool_rounds = parseInt(roundsInp.value) || 20;
            cfg.tool_timeout_secs = parseInt(timeoutInp.value) || 120;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (cfg as any).user_timezone = tzInp.value.trim() || 'America/Chicago';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (cfg as any).weather_location = weatherInp.value.trim() || undefined;
            cfg.default_system_prompt = promptArea.value.trim() || undefined;
            await pawEngine.setConfig(cfg);

            // Save memory config (including embedding settings)
            const mc = await pawEngine.getMemoryConfig();
            mc.auto_recall = recallCb.checked;
            mc.auto_capture = captureCb.checked;
            mc.recall_limit = parseInt(recallLimitInp.value) || 5;
            mc.embedding_provider = embProviderSel.value as EmbeddingProvider;
            mc.embedding_base_url = embUrlInp.value.trim() || 'http://localhost:11434';
            mc.embedding_model = embModelInp.value.trim() || 'nomic-embed-text';
            mc.embedding_dims = parseInt(embDimsInp.value) || 768;
            await pawEngine.setMemoryConfig(mc);

            showToast('智能体默认设置已保存', 'success');
          } catch (e) {
            showToast(`保存失败：${e instanceof Error ? e.message : e}`, 'error');
          }
        },
        () => loadAgentDefaultsSettings(),
      ),
    );
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger)">加载失败：${esc(String(e))}</p>`;
  }
}
