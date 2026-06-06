// Settings Skills — Wizard (Phase F.5: Skill creation wizard)
// Step-by-step form for generating pawz-skill.toml manifests.

import { pawEngine, type WizardFormData } from '../../engine';
import { $ } from '../../components/helpers';
import { showToast } from '../../components/toast';
import { msIcon } from './atoms';

// ── State ──────────────────────────────────────────────────────────────

let _step = 0;
let _reloadFn: (() => Promise<void>) | null = null;

const STEPS = ['基本信息', '凭据', '指令', '小组件', 'MCP 服务器', '预览'];

const CATEGORIES = [
  'api',
  'cli',
  'communication',
  'development',
  'media',
  'productivity',
  'smart_home',
  'system',
  'vault',
];

const WIDGET_TYPES = ['status', 'metric', 'table', 'log', 'kv'];
const FIELD_TYPES = ['text', 'number', 'badge', 'datetime', 'percentage', 'currency'];

export function setWizardReload(fn: () => Promise<void>): void {
  _reloadFn = fn;
}

// ── Section renderer ───────────────────────────────────────────────────

export function renderWizardSection(): string {
  return `
  <div class="wizard-hero" style="background:linear-gradient(135deg, var(--bg-surface) 0%, color-mix(in srgb, #22c55e 8%, var(--bg-surface)) 100%);border:1px solid var(--border-subtle);border-radius:12px;padding:24px 28px;margin-bottom:24px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="font-size:28px">${msIcon('add_circle', 'ms-lg')}</span>
      <h2 style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.02em">创建技能</h2>
      <span style="font-size:11px;color:#22c55e;padding:2px 8px;border:1px solid #22c55e;border-radius:12px">向导</span>
    </div>
    <p style="color:var(--text-muted);font-size:13px;margin:0 0 16px;max-width:600px">
      使用分步向导创建一个新技能。生成 <code>pawz-skill.toml</code> 清单，
      本地安装，或者分享给社区。
    </p>
    <button class="btn btn-primary" id="wizard-open-btn" style="padding:10px 20px;border-radius:10px;font-size:14px">
      ${msIcon('add')} 新建技能
    </button>
    <div id="wizard-container" style="display:none;margin-top:20px"></div>
  </div>`;
}

// ── Wizard stepper + content ───────────────────────────────────────────

function renderStepIndicator(): string {
  return `<div class="wizard-steps" style="display:flex;gap:4px;margin-bottom:20px">
    ${STEPS.map(
      (s, i) =>
        `<div class="wizard-step-indicator${i === _step ? ' wizard-step-active' : ''}${i < _step ? ' wizard-step-done' : ''}" style="flex:1;text-align:center;padding:6px 0;font-size:11px;border-bottom:2px solid ${i === _step ? 'var(--accent)' : i < _step ? '#22c55e' : 'var(--border-subtle)'};color:${i === _step ? 'var(--accent)' : i < _step ? '#22c55e' : 'var(--text-muted)'}">
          ${i < _step ? `${msIcon('check_circle')} ` : ''}${s}
        </div>`,
    ).join('')}
  </div>`;
}

function renderStep0(): string {
  const catOptions = CATEGORIES.map(
    (c) => `<option value="${c}">${c.replace('_', ' ')}</option>`,
  ).join('');
  return `
  <div class="wizard-step-content">
    <h3 style="margin:0 0 12px;font-size:15px">${msIcon('edit')} 基本信息</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <label class="wizard-field">
        <span>技能 ID *</span>
        <input type="text" class="form-input" id="wiz-id" placeholder="my-skill" pattern="[a-zA-Z0-9_-]+" />
      </label>
      <label class="wizard-field">
        <span>名称 *</span>
        <input type="text" class="form-input" id="wiz-name" placeholder="My Skill" />
      </label>
      <label class="wizard-field">
        <span>版本 *</span>
        <input type="text" class="form-input" id="wiz-version" value="1.0.0" />
      </label>
      <label class="wizard-field">
        <span>作者 *</span>
        <input type="text" class="form-input" id="wiz-author" placeholder="your-username" />
      </label>
      <label class="wizard-field">
        <span>类别</span>
        <select class="form-input" id="wiz-category">${catOptions}</select>
      </label>
      <label class="wizard-field">
        <span>图标（Material Symbol）</span>
        <input type="text" class="form-input" id="wiz-icon" placeholder="extension" />
      </label>
    </div>
    <label class="wizard-field" style="margin-top:12px">
      <span>描述 * <small style="color:var(--text-muted)">(最多 500 字)</small></span>
      <textarea class="form-input" id="wiz-description" rows="3" maxlength="500" placeholder="这个技能做什么？"></textarea>
    </label>
    <label class="wizard-field" style="margin-top:8px">
      <span>安装提示 <small style="color:var(--text-muted)">(可选)</small></span>
      <input type="text" class="form-input" id="wiz-install-hint" placeholder="获取 API 密钥的位置..." />
    </label>
  </div>`;
}

function renderStep1(): string {
  return `
  <div class="wizard-step-content">
    <h3 style="margin:0 0 12px;font-size:15px">${msIcon('key')} 凭据</h3>
    <p style="color:var(--text-muted);font-size:12px;margin:0 0 12px">
      添加此技能所需的 API Key 或令牌。带有凭据的技能属于“集成”（Tier 2）。
    </p>
    <div id="wiz-credentials-list"></div>
    <button class="btn btn-ghost btn-sm" id="wiz-add-credential" style="margin-top:8px">
      ${msIcon('add')} 添加凭据
    </button>
  </div>`;
}

function renderCredentialRow(index: number): string {
  return `
  <div class="wizard-credential-row" data-index="${index}" style="border:1px solid var(--border-subtle);border-radius:8px;padding:12px;margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <span style="font-size:12px;font-weight:600">凭据 #${index + 1}</span>
      <button class="btn btn-ghost btn-sm wiz-remove-credential" data-index="${index}" style="color:var(--accent-danger);font-size:11px">${msIcon('delete')} 移除</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label class="wizard-field">
        <span>键名 *</span>
        <input type="text" class="form-input wiz-cred-key" placeholder="API_KEY" data-index="${index}" />
      </label>
      <label class="wizard-field">
        <span>标签 *</span>
        <input type="text" class="form-input wiz-cred-label" placeholder="API Key" data-index="${index}" />
      </label>
      <label class="wizard-field">
        <span>描述</span>
        <input type="text" class="form-input wiz-cred-desc" placeholder="Your API key from..." data-index="${index}" />
      </label>
      <label class="wizard-field">
        <span>占位文本</span>
        <input type="text" class="form-input wiz-cred-placeholder" placeholder="sk-..." data-index="${index}" />
      </label>
    </div>
    <label style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:12px">
      <input type="checkbox" class="wiz-cred-required" data-index="${index}" checked /> 必填
    </label>
  </div>`;
}

function renderStep2(): string {
  return `
  <div class="wizard-step-content">
    <h3 style="margin:0 0 12px;font-size:15px">${msIcon('description')} 指令</h3>
    <p style="color:var(--text-muted);font-size:12px;margin:0 0 12px">
      启用此技能时会注入的系统提示词。请告诉智能体有哪些可用工具，以及如何使用它们。
    </p>
    <textarea class="form-input" id="wiz-instructions" rows="8" placeholder="你可以通过这些工具访问 Notion API..."></textarea>
  </div>`;
}

function renderStep3(): string {
  const typeOptions = WIDGET_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('');
  return `
  <div class="wizard-step-content">
    <h3 style="margin:0 0 12px;font-size:15px">${msIcon('dashboard')} 仪表盘小组件</h3>
    <p style="color:var(--text-muted);font-size:12px;margin:0 0 12px">
      可选。定义一个会出现在“今日”仪表盘上的小组件卡片。
    </p>
    <label style="display:flex;align-items:center;gap:6px;margin-bottom:12px;font-size:13px">
      <input type="checkbox" id="wiz-widget-enable" /> 启用仪表盘小组件
    </label>
    <div id="wiz-widget-config" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <label class="wizard-field">
          <span>小组件类型</span>
          <select class="form-input" id="wiz-widget-type">${typeOptions}</select>
        </label>
        <label class="wizard-field">
          <span>标题</span>
          <input type="text" class="form-input" id="wiz-widget-title" placeholder="Widget Title" />
        </label>
        <label class="wizard-field">
          <span>刷新间隔</span>
          <input type="text" class="form-input" id="wiz-widget-refresh" placeholder="10m" />
        </label>
      </div>
      <div style="margin-top:12px">
        <span style="font-size:12px;font-weight:600">字段</span>
        <div id="wiz-widget-fields-list" style="margin-top:6px"></div>
        <button class="btn btn-ghost btn-sm" id="wiz-add-widget-field" style="margin-top:6px">
          ${msIcon('add')} 添加字段
        </button>
      </div>
    </div>
  </div>`;
}

function renderWidgetFieldRow(index: number): string {
  const fieldTypeOptions = FIELD_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('');
  return `
  <div class="wizard-widget-field-row" data-index="${index}" style="display:flex;gap:8px;align-items:end;margin-bottom:6px">
    <label class="wizard-field" style="flex:1">
      <span>键名</span>
      <input type="text" class="form-input wiz-wf-key" placeholder="field_key" data-index="${index}" />
    </label>
    <label class="wizard-field" style="flex:1">
      <span>标签</span>
      <input type="text" class="form-input wiz-wf-label" placeholder="Field Label" data-index="${index}" />
    </label>
    <label class="wizard-field" style="flex:1">
      <span>类型</span>
      <select class="form-input wiz-wf-type" data-index="${index}">${fieldTypeOptions}</select>
    </label>
    <button class="btn btn-ghost btn-sm wiz-remove-widget-field" data-index="${index}" style="color:var(--accent-danger);margin-bottom:2px">${msIcon('delete')}</button>
  </div>`;
}

function renderStep4(): string {
  return `
  <div class="wizard-step-content">
    <h3 style="margin:0 0 12px;font-size:15px">${msIcon('dns')} MCP 服务器</h3>
    <p style="color:var(--text-muted);font-size:12px;margin:0 0 12px">
      可选。打包一个会在安装时自动注册的 MCP 服务器。凭据会作为环境变量注入。
    </p>
    <label style="display:flex;align-items:center;gap:6px;margin-bottom:12px;font-size:13px">
      <input type="checkbox" id="wiz-mcp-enable" /> 启用 MCP 服务器
    </label>
    <div id="wiz-mcp-config" style="display:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label class="wizard-field">
          <span>命令</span>
          <input type="text" class="form-input" id="wiz-mcp-command" placeholder="npx" />
        </label>
        <label class="wizard-field">
          <span>传输方式</span>
          <select class="form-input" id="wiz-mcp-transport">
            <option value="stdio" selected>stdio</option>
            <option value="sse">SSE</option>
          </select>
        </label>
        <label class="wizard-field" style="grid-column:span 2">
          <span>参数 <small style="color:var(--text-muted)">(逗号分隔)</small></span>
          <input type="text" class="form-input" id="wiz-mcp-args" placeholder="-y, @modelcontextprotocol/server-github" />
        </label>
        <label class="wizard-field" style="grid-column:span 2">
          <span>URL <small style="color:var(--text-muted)">(仅用于 SSE 传输)</small></span>
          <input type="text" class="form-input" id="wiz-mcp-url" placeholder="http://localhost:3000/sse" />
        </label>
      </div>
    </div>
  </div>`;
}

function renderStep5(): string {
  return `
  <div class="wizard-step-content">
    <h3 style="margin:0 0 12px;font-size:15px">${msIcon('preview')} 预览与生成</h3>
    <p style="color:var(--text-muted);font-size:12px;margin:0 0 12px">
      Preview the generated TOML manifest. You can install it locally or share with the community.
    </p>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="btn btn-primary" id="wiz-generate-btn">${msIcon('code')} 生成 TOML</button>
    </div>
    <div id="wiz-preview" style="display:none">
      <pre id="wiz-toml-output" style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:8px;padding:12px;font-size:12px;max-height:400px;overflow:auto;white-space:pre-wrap;margin:0 0 12px"></pre>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" id="wiz-install-btn">${msIcon('download')} 本地安装</button>
        <button class="btn btn-ghost" id="wiz-publish-btn">${msIcon('cloud_upload')} 分享技能</button>
        <button class="btn btn-ghost" id="wiz-copy-btn">${msIcon('content_copy')} 复制 TOML</button>
      </div>
    </div>
  </div>`;
}

// ── Collect form data ──────────────────────────────────────────────────

let _credentialCount = 0;
let _widgetFieldCount = 0;

function collectFormData(): WizardFormData {
  const val = (id: string) => ($(id) as HTMLInputElement)?.value?.trim() ?? '';
  const checked = (id: string) => ($(id) as HTMLInputElement)?.checked ?? false;

  const credentials = [];
  for (let i = 0; i < _credentialCount; i++) {
    const row = document.querySelector(`.wizard-credential-row[data-index="${i}"]`);
    if (!row) continue;
    const key = (row.querySelector('.wiz-cred-key') as HTMLInputElement)?.value?.trim() ?? '';
    const label = (row.querySelector('.wiz-cred-label') as HTMLInputElement)?.value?.trim() ?? '';
    if (!key || !label) continue;
    credentials.push({
      key,
      label,
      description: (row.querySelector('.wiz-cred-desc') as HTMLInputElement)?.value?.trim() ?? '',
      required: (row.querySelector('.wiz-cred-required') as HTMLInputElement)?.checked ?? false,
      placeholder:
        (row.querySelector('.wiz-cred-placeholder') as HTMLInputElement)?.value?.trim() ?? '',
    });
  }

  let widget: WizardFormData['widget'] = null;
  if (checked('wiz-widget-enable')) {
    const fields = [];
    for (let i = 0; i < _widgetFieldCount; i++) {
      const row = document.querySelector(`.wizard-widget-field-row[data-index="${i}"]`);
      if (!row) continue;
      const key = (row.querySelector('.wiz-wf-key') as HTMLInputElement)?.value?.trim() ?? '';
      const label = (row.querySelector('.wiz-wf-label') as HTMLInputElement)?.value?.trim() ?? '';
      const ft = (row.querySelector('.wiz-wf-type') as HTMLSelectElement)?.value ?? 'text';
      if (key && label) fields.push({ key, label, field_type: ft });
    }
    widget = {
      widget_type: val('wiz-widget-type') || 'status',
      title: val('wiz-widget-title'),
      refresh: val('wiz-widget-refresh'),
      fields,
    };
  }

  let mcp: WizardFormData['mcp'] = null;
  if (checked('wiz-mcp-enable')) {
    const argsRaw = val('wiz-mcp-args');
    const args = argsRaw
      ? argsRaw
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      : [];
    mcp = {
      command: val('wiz-mcp-command'),
      args,
      transport: val('wiz-mcp-transport') || 'stdio',
      url: val('wiz-mcp-url'),
    };
  }

  return {
    id: val('wiz-id'),
    name: val('wiz-name'),
    version: val('wiz-version') || '1.0.0',
    author: val('wiz-author'),
    category: val('wiz-category') || 'api',
    icon: val('wiz-icon'),
    description: val('wiz-description'),
    install_hint: val('wiz-install-hint'),
    instructions: val('wiz-instructions'),
    credentials,
    widget,
    mcp,
  };
}

// ── Wizard rendering orchestration ─────────────────────────────────────

function renderCurrentStep(): string {
  const stepFns = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
  const nav = `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
    <button class="btn btn-ghost btn-sm" id="wiz-prev" ${_step === 0 ? 'disabled' : ''}>${msIcon('arrow_back')} 上一步</button>
    ${
      _step < STEPS.length - 1
        ? `<button class="btn btn-primary btn-sm" id="wiz-next">${msIcon('arrow_forward')} 下一步</button>`
        : ''
    }
  </div>`;
  return renderStepIndicator() + stepFns[_step]() + nav;
}

function renderWizard(): void {
  const container = $('wizard-container');
  if (!container) return;
  container.style.display = 'block';
  container.innerHTML = renderCurrentStep();
  bindStepEvents();
}

// ── Step-specific event binding ────────────────────────────────────────

function bindStepEvents(): void {
  // Navigation
  $('wiz-prev')?.addEventListener('click', () => {
    if (_step > 0) {
      _step--;
      renderWizard();
    }
  });
  $('wiz-next')?.addEventListener('click', () => {
    if (_step < STEPS.length - 1) {
      _step++;
      renderWizard();
    }
  });

  // Step 1: Credentials
  if (_step === 1) {
    $('wiz-add-credential')?.addEventListener('click', () => {
      const list = $('wiz-credentials-list');
      if (!list) return;
      list.insertAdjacentHTML('beforeend', renderCredentialRow(_credentialCount));
      _credentialCount++;
      bindCredentialRemoveButtons();
    });
    bindCredentialRemoveButtons();
  }

  // Step 3: Widget
  if (_step === 3) {
    const enableCb = $('wiz-widget-enable') as HTMLInputElement;
    const config = $('wiz-widget-config');
    enableCb?.addEventListener('change', () => {
      if (config) config.style.display = enableCb.checked ? '' : 'none';
    });
    $('wiz-add-widget-field')?.addEventListener('click', () => {
      const list = $('wiz-widget-fields-list');
      if (!list) return;
      list.insertAdjacentHTML('beforeend', renderWidgetFieldRow(_widgetFieldCount));
      _widgetFieldCount++;
      bindWidgetFieldRemoveButtons();
    });
    bindWidgetFieldRemoveButtons();
  }

  // Step 4: MCP
  if (_step === 4) {
    const enableCb = $('wiz-mcp-enable') as HTMLInputElement;
    const config = $('wiz-mcp-config');
    enableCb?.addEventListener('change', () => {
      if (config) config.style.display = enableCb.checked ? '' : 'none';
    });
  }

  // Step 5: Review
  if (_step === 5) {
    $('wiz-generate-btn')?.addEventListener('click', async () => {
      const form = collectFormData();
      try {
        const toml = await pawEngine.wizardGenerateToml(form);
        const preview = $('wiz-preview');
        const output = $('wiz-toml-output');
        if (preview) preview.style.display = '';
        if (output) output.textContent = toml;
      } catch (err) {
        showToast(`Generation failed: ${err}`, 'error');
      }
    });

    $('wiz-install-btn')?.addEventListener('click', async () => {
      const form = collectFormData();
      try {
        const toml = await pawEngine.wizardGenerateToml(form);
        await pawEngine.tomlSkillInstall(form.id, toml);
        showToast(`${form.name} installed!`, 'success');
        // Reset wizard
        _step = 0;
        _credentialCount = 0;
        _widgetFieldCount = 0;
        const container = $('wizard-container');
        if (container) container.style.display = 'none';
        if (_reloadFn) await _reloadFn();
      } catch (err) {
        showToast(`Install failed: ${err}`, 'error');
      }
    });

    $('wiz-publish-btn')?.addEventListener('click', async () => {
      const form = collectFormData();
      try {
        const toml = await pawEngine.wizardGenerateToml(form);
        const url = await pawEngine.wizardPublishUrl(form.id, toml);
        window.open(url, '_blank');
      } catch (err) {
        showToast(`Publish failed: ${err}`, 'error');
      }
    });

    $('wiz-copy-btn')?.addEventListener('click', () => {
      const output = $('wiz-toml-output');
      if (output?.textContent) {
        navigator.clipboard.writeText(output.textContent);
        showToast('TOML copied to clipboard', 'success');
      }
    });
  }
}

function bindCredentialRemoveButtons(): void {
  document.querySelectorAll('.wiz-remove-credential').forEach((el) => {
    el.addEventListener('click', () => {
      (el as HTMLElement).closest('.wizard-credential-row')?.remove();
    });
  });
}

function bindWidgetFieldRemoveButtons(): void {
  document.querySelectorAll('.wiz-remove-widget-field').forEach((el) => {
    el.addEventListener('click', () => {
      (el as HTMLElement).closest('.wizard-widget-field-row')?.remove();
    });
  });
}

// ── Public event binding ───────────────────────────────────────────────

export function bindWizardEvents(): void {
  $('wizard-open-btn')?.addEventListener('click', () => {
    _step = 0;
    _credentialCount = 0;
    _widgetFieldCount = 0;
    renderWizard();
  });
}
