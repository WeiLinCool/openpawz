// Settings View — Molecules (DOM rendering + IPC)

import {
  loadSecuritySettings,
  saveSecuritySettings,
  getSessionOverrideRemaining,
  resetSecuritySettings,
  type SecuritySettings,
} from '../../security';
import { getSecurityAuditLog, isEncryptionReady } from '../../db';
import { $, escHtml, promptModal } from '../../components/helpers';
import { showToast } from '../../components/toast';
import { isConnected } from '../../state/connection';
import { getBudgetLimit, setBudgetLimit, downloadFile, type ToolRule } from './atoms';
import { check, type Update, type DownloadEvent } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

/** Cached update handle between check → install steps. */
let _pendingUpdate: Update | null = null;
let _enterpriseMode: boolean | null = null;

// ── State accessors (set by index.ts) ──────────────────────────────────────

interface MoleculesState {
  getToolRules: () => ToolRule[];
  setToolRules: (rules: ToolRule[]) => void;
  pushToolRule: (rule: ToolRule) => void;
  spliceToolRule: (idx: number) => void;
  getOverrideBannerInterval: () => ReturnType<typeof setInterval> | null;
  setOverrideBannerInterval: (v: ReturnType<typeof setInterval> | null) => void;
}

let _state: MoleculesState;

export function setMoleculesState(s: MoleculesState) {
  _state = s;
}

export function setEnterpriseMode(enabled: boolean | null) {
  _enterpriseMode = enabled;
}

// ── Engine Status ──────────────────────────────────────────────────────────

export async function loadSettingsStatus() {
  if (!isConnected()) return;
  const section = $('settings-status-section');
  const content = $('settings-status-content');
  if (section) section.style.display = '';
  if (content)
    content.innerHTML =
      '<div class="status-card"><div class="status-card-label">运行时</div><div class="status-card-value">Paw 引擎（Tauri）</div></div>';
}

// ── Logs Viewer ────────────────────────────────────────────────────────────

export async function loadSettingsLogs() {
  if (!isConnected()) return;
  const section = $('settings-logs-section');
  const output = $('settings-logs-output');
  if (section) section.style.display = '';
  if (output) output.textContent = '引擎日志查看器即将上线 - 目前请先查看 Tauri 控制台';
}

// ── Usage Dashboard ────────────────────────────────────────────────────────

export async function loadSettingsUsage() {
  if (!isConnected()) return;
  const section = $('settings-usage-section');
  const content = $('settings-usage-content');
  if (section) section.style.display = '';
  if (content)
    content.innerHTML = `<div class="usage-empty-state">
    <p style="color:var(--text-secondary);margin:0 0 8px">Paw 引擎的用量追踪即将上线。</p>
    <p style="color:var(--text-muted);margin:0;font-size:12px">聊天中已启用令牌追踪 - 发送消息后可在聊天顶部查看每个会话的估算值。</p>
  </div>`;
}

// ── Budget Alert ───────────────────────────────────────────────────────────

// @ts-ignore: reserved for budget alert feature
function _checkBudgetAlert(currentCost: number) {
  void currentCost;
  const limit = getBudgetLimit();
  if (limit == null) return;
  const alertEl = $('budget-alert');
  if (!alertEl) return;

  if (currentCost >= limit) {
    alertEl.style.display = '';
    const text = $('budget-alert-text');
    if (text)
      text.textContent = `已达到预算上限：$${currentCost.toFixed(4)} / $${limit.toFixed(2)} - 建议切换到更便宜的模型或暂停自动化`;
  } else if (currentCost >= limit * 0.8) {
    alertEl.style.display = '';
    const text = $('budget-alert-text');
    if (text)
      text.textContent = `接近预算上限：$${currentCost.toFixed(4)} / $${limit.toFixed(2)}（${((currentCost / limit) * 100).toFixed(0)}%）`;
  } else {
    alertEl.style.display = 'none';
  }
}

export function initBudgetSettings() {
  const input = $('budget-limit-input') as HTMLInputElement | null;
  const saveBtn = $('budget-limit-save');
  const clearBtn = $('budget-limit-clear');

  if (input) {
    const current = getBudgetLimit();
    if (current != null) input.value = current.toFixed(2);
  }

  saveBtn?.addEventListener('click', () => {
    const val = parseFloat((input as HTMLInputElement)?.value ?? '');
    if (isNaN(val) || val <= 0) {
      showToast('请输入有效的预算金额', 'error');
      return;
    }
    setBudgetLimit(val);
    showToast(`预算提醒已设为 $${val.toFixed(2)}`, 'success');
    loadSettingsUsage().catch(() => {});
  });

  clearBtn?.addEventListener('click', () => {
    setBudgetLimit(null);
    if (input) (input as HTMLInputElement).value = '';
    const alertEl = $('budget-alert');
    if (alertEl) alertEl.style.display = 'none';
    showToast('预算提醒已清除', 'info');
  });
}

// ── System Presence ────────────────────────────────────────────────────────

export async function loadSettingsPresence() {
  const section = $('settings-presence-section');
  if (section) section.style.display = 'none';
}

// ── Nodes View ─────────────────────────────────────────────────────────────

export async function loadSettingsNodes() {
  const section = $('settings-nodes-section');
  if (section) section.style.display = 'none';
}

// ── Device Pairing ─────────────────────────────────────────────────────────

export async function loadSettingsDevices() {
  const section = $('settings-devices-section');
  if (section) section.style.display = 'none';
}

// ── Onboarding Wizard ──────────────────────────────────────────────────────

export async function loadSettingsWizard() {
  const section = $('settings-wizard-section');
  if (section) section.style.display = 'none';
}

export async function startWizard() {
  showToast('引擎模式下无法使用向导', 'info');
}

export async function wizardNext() {
  showToast('引擎模式下无法使用向导', 'info');
}

export async function cancelWizard() {
  // no-op
}

// ── Self-Update ────────────────────────────────────────────────────────

export async function checkForUpdate() {
  const statusEl = $('update-status');
  const checkBtn = $('settings-update-check') as HTMLButtonElement | null;
  const installBtn = $('settings-update-install') as HTMLButtonElement | null;

  if (statusEl) statusEl.textContent = '正在检查更新...';
  if (checkBtn) checkBtn.disabled = true;
  if (installBtn) {
    installBtn.style.display = 'none';
    installBtn.disabled = true;
  }

  try {
    const update = await check();

    if (update) {
      if (statusEl) statusEl.textContent = `有可用更新：v${update.version}`;
      if (installBtn) {
        installBtn.style.display = '';
        installBtn.disabled = false;
        // Store the update handle for install step
        _pendingUpdate = update;
      }
      showToast(`发现更新 v${update.version}`, 'info');
    } else {
      if (statusEl) statusEl.textContent = '当前已经是最新版本。';
      showToast('已是最新版本', 'info');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (statusEl) statusEl.textContent = `更新检查失败：${msg}`;
    showToast(`更新检查失败：${msg}`, 'error');
  } finally {
    if (checkBtn) checkBtn.disabled = false;
  }
}

export async function runUpdate() {
  const statusEl = $('update-status');
  const installBtn = $('settings-update-install') as HTMLButtonElement | null;
  const update = _pendingUpdate;

  if (!update) {
    showToast('暂无可用更新 - 请先检查更新', 'info');
    return;
  }

  if (installBtn) installBtn.disabled = true;
  if (statusEl) statusEl.textContent = '正在下载更新...';

  try {
    let downloaded = 0;
    let contentLength = 0;

    await update.downloadAndInstall((event: DownloadEvent) => {
      switch (event.event) {
        case 'Started':
          contentLength = event.data.contentLength || 0;
          if (statusEl) statusEl.textContent = `正在下载... 0%`;
          break;
        case 'Progress':
          downloaded += event.data.chunkLength || 0;
          if (contentLength > 0 && statusEl) {
            const pct = Math.round((downloaded / contentLength) * 100);
            statusEl.textContent = `正在下载... ${pct}%`;
          }
          break;
        case 'Finished':
          if (statusEl) statusEl.textContent = '下载完成，正在重启...';
          break;
      }
    });

    showToast('更新已安装，正在重启...', 'info');
    // Give the toast a moment to display
    setTimeout(() => relaunch(), 1000);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (statusEl) statusEl.textContent = `更新失败：${msg}`;
    if (installBtn) installBtn.disabled = false;
    showToast(`更新失败：${msg}`, 'error');
  }
}

// ── Browser Control ────────────────────────────────────────────────────

export async function loadSettingsBrowser() {
  const section = $('settings-browser-section');
  if (section) section.style.display = 'none';
}

export async function startBrowser() {
  showToast('Paw 引擎的浏览器控制功能即将上线', 'info');
}

export async function stopBrowser() {
  // no-op
}

// ── Exec Approvals Config ──────────────────────────────────────────────────

export function renderToolRules() {
  const list = $('approvals-tool-list');
  if (!list) return;

  const toolRules = _state.getToolRules();

  if (toolRules.length === 0) {
    list.innerHTML =
      '<div class="approvals-empty">暂无工具专用规则。点击“添加规则”创建一个。</div>';
    return;
  }

  list.innerHTML = toolRules
    .map(
      (rule, i) => `
    <div class="approvals-tool-row" data-idx="${i}">
      <div class="approvals-tool-name">${escHtml(rule.name)}</div>
      <div class="approvals-toggle-group">
        <button class="approvals-toggle-btn${rule.state === 'allow' ? ' active allow' : ''}" data-state="allow" data-idx="${i}" title="始终允许">
          <span class="ms" style="font-size:14px">check</span>
          允许
        </button>
        <button class="approvals-toggle-btn${rule.state === 'ask' ? ' active ask' : ''}" data-state="ask" data-idx="${i}" title="每次询问">
          <span class="ms" style="font-size:14px">help</span>
          询问
        </button>
        <button class="approvals-toggle-btn${rule.state === 'deny' ? ' active deny' : ''}" data-state="deny" data-idx="${i}" title="始终阻止">
          <span class="ms" style="font-size:14px">close</span>
          阻止
        </button>
      </div>
      <button class="approvals-remove-btn" data-idx="${i}" title="移除规则">
        <span class="ms" style="font-size:14px">delete</span>
      </button>
    </div>
  `,
    )
    .join('');

  // Wire toggle buttons
  list.querySelectorAll('.approvals-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx') ?? '-1', 10);
      const state = btn.getAttribute('data-state') as 'allow' | 'ask' | 'deny';
      const rules = _state.getToolRules();
      if (idx < 0 || idx >= rules.length) return;
      rules[idx].state = state;
      _state.setToolRules(rules);
      renderToolRules();
    });
  });

  // Wire remove buttons
  list.querySelectorAll('.approvals-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx') ?? '-1', 10);
      const rules = _state.getToolRules();
      if (idx < 0 || idx >= rules.length) return;
      _state.spliceToolRule(idx);
      renderToolRules();
    });
  });
}

export async function addToolRule() {
  const name = await promptModal('添加工具规则', '工具名称，例如 brave_search');
  if (!name?.trim()) return;
  const trimmed = name.trim();
  const rules = _state.getToolRules();
  if (rules.some((r) => r.name === trimmed)) {
    showToast(`“${trimmed}” 已有规则`, 'info');
    return;
  }
  _state.pushToolRule({ name: trimmed, state: 'ask' });
  renderToolRules();
}

export async function loadSettingsApprovals() {
  const section = $('settings-approvals-section');
  if (section) section.style.display = '';
  renderToolRules();
}

export async function saveSettingsApprovals() {
  const policyRadio = document.querySelector(
    'input[name="approvals-policy"]:checked',
  ) as HTMLInputElement | null;
  const policy = policyRadio?.value ?? 'ask';

  const toolRules = _state.getToolRules();
  const allow = toolRules.filter((r) => r.state === 'allow').map((r) => r.name);
  const deny = toolRules.filter((r) => r.state === 'deny').map((r) => r.name);

  localStorage.setItem('paw-tool-approvals', JSON.stringify({ allow, deny, askPolicy: policy }));
  showToast('审批规则已保存在本地', 'success');
}

// ── Security Audit Dashboard ───────────────────────────────────────────────

export function updateEncryptionStatus() {
  const bar = $('encryption-status-bar');
  const text = $('encryption-status-text');
  if (!bar || !text) return;

  const ready = isEncryptionReady();
  bar.className = `encryption-status-bar ${ready ? 'enc-active' : 'enc-inactive'}`;
  text.textContent = ready
    ? '数据库加密已启用 - 敏感字段使用当前认证策略提供的密钥加密'
    : '加密不可用 - 完成企业 SSO 登录或恢复本地加密后才能存储凭据';
}

interface KeychainHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  db_key_ok: boolean;
  vault_key_ok: boolean;
  message: string;
  error: string | null;
}

/** Fetch keychain health from the Rust backend and update the UI indicator. */
export async function updateKeychainHealth(): Promise<void> {
  const bar = $('keychain-health-bar');
  const dot = $('keychain-health-dot');
  const text = $('keychain-health-text');
  const detail = $('keychain-health-detail');
  if (!bar || !dot || !text) return;

  try {
    const invoke = (await import('@tauri-apps/api/core')).invoke;
    const health = await invoke<KeychainHealth>('check_keychain_health');

    bar.style.display = 'flex';

    const statusClass =
      health.status === 'healthy'
        ? 'kc-healthy'
        : health.status === 'degraded'
          ? 'kc-degraded'
          : 'kc-unavailable';
    bar.className = `keychain-health-bar ${statusClass}`;
    text.textContent = health.message;
    if (detail) {
      detail.textContent = health.error ?? '';
      detail.style.display = health.error ? 'block' : 'none';
    }
  } catch (e) {
    bar.style.display = 'flex';
    bar.className = 'keychain-health-bar kc-unavailable';
    text.textContent = '无法检查钥匙串健康状态';
    if (detail) {
      detail.textContent = String(e);
      detail.style.display = 'block';
    }
    console.error('[settings] Keychain health check failed:', e);
  }
}

export async function loadSecurityAudit() {
  const section = $('settings-audit-section');
  const tbody = $('audit-log-body');
  const emptyEl = $('audit-empty');
  const tableWrapper = $('audit-table-wrapper');
  if (!section || !tbody) return;

  section.style.display = '';
  updateEncryptionStatus();
  updateKeychainHealth();

  const filterType = ($('audit-filter-type') as HTMLSelectElement | null)?.value || undefined;
  const filterRisk = ($('audit-filter-risk') as HTMLSelectElement | null)?.value || '';
  const limit = parseInt(($('audit-filter-limit') as HTMLSelectElement | null)?.value || '100', 10);

  try {
    const entries = await getSecurityAuditLog(limit, filterType);

    const filtered = filterRisk ? entries.filter((e) => e.risk_level === filterRisk) : entries;

    const denied = entries.filter((e) => !e.was_allowed).length;
    const allowed = entries.filter((e) => e.was_allowed).length;
    const critical = entries.filter((e) => e.risk_level === 'critical').length;
    const deniedLabel = $('audit-score-denied-label');
    const allowedLabel = $('audit-score-allowed-label');
    const criticalLabel = $('audit-score-critical-label');
    if (deniedLabel) deniedLabel.textContent = `${denied} 已阻止`;
    if (allowedLabel) allowedLabel.textContent = `${allowed} 已允许`;
    if (criticalLabel) criticalLabel.textContent = `${critical} 高风险`;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (emptyEl) emptyEl.style.display = '';
      if (tableWrapper) tableWrapper.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (tableWrapper) tableWrapper.style.display = '';

    tbody.innerHTML = filtered
      .map((e) => {
        const time = e.timestamp ? new Date(`${e.timestamp}Z`).toLocaleString() : '—';
        const riskBadge = e.risk_level
          ? `<span class="audit-risk-badge risk-${escHtml(e.risk_level)}">${escHtml(e.risk_level)}</span>`
          : '<span class="audit-risk-badge">—</span>';
        const resultBadge = e.was_allowed
          ? '<span class="audit-result-badge allowed">✓ 已允许</span>'
          : '<span class="audit-result-badge denied">✕ 已阻止</span>';
        const eventLabel = e.event_type.replace(/_/g, ' ');
        return `<tr class="${e.was_allowed ? '' : 'audit-row-denied'}">
        <td class="audit-cell-time">${escHtml(time)}</td>
        <td class="audit-cell-event">${escHtml(eventLabel)}</td>
        <td>${riskBadge}</td>
        <td class="audit-cell-tool">${escHtml(e.tool_name ?? '—')}</td>
        <td class="audit-cell-detail" title="${escHtml(e.detail ?? '')}">${escHtml((e.detail ?? '').slice(0, 80))}${(e.detail?.length ?? 0) > 80 ? '…' : ''}</td>
        <td>${resultBadge}</td>
      </tr>`;
      })
      .join('');
  } catch (e) {
    console.warn('[settings] Audit log load failed:', e);
    if (emptyEl) {
      emptyEl.style.display = '';
      emptyEl.textContent = `加载审计日志失败：${e}`;
    }
    if (tableWrapper) tableWrapper.style.display = 'none';
  }
}

export function exportAuditJSON() {
  const filterType = ($('audit-filter-type') as HTMLSelectElement | null)?.value || undefined;
  const limit = parseInt(($('audit-filter-limit') as HTMLSelectElement | null)?.value || '100', 10);
  getSecurityAuditLog(limit, filterType)
    .then((entries) => {
      const json = JSON.stringify(entries, null, 2);
      downloadFile('paw-security-audit.json', json, 'application/json');
    })
    .catch((e) => showToast(`导出失败：${e}`, 'error'));
}

export function exportAuditCSV() {
  const filterType = ($('audit-filter-type') as HTMLSelectElement | null)?.value || undefined;
  const limit = parseInt(($('audit-filter-limit') as HTMLSelectElement | null)?.value || '100', 10);
  getSecurityAuditLog(limit, filterType)
    .then((entries) => {
      const headers = [
        'id',
        'timestamp',
        'event_type',
        'risk_level',
        'tool_name',
        'command',
        'detail',
        'session_key',
        'was_allowed',
        'matched_pattern',
      ];
      const rows = entries.map((e) =>
        headers
          .map((h) => {
            const val = (e as unknown as Record<string, unknown>)[h];
            const str = val == null ? '' : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(','),
      );
      const csv = [headers.join(','), ...rows].join('\n');
      downloadFile('paw-security-audit.csv', csv, 'text/csv');
    })
    .catch((e) => showToast(`导出失败：${e}`, 'error'));
}

// ── Security Policies (local settings) ─────────────────────────────────────

export function loadSecurityPolicies() {
  const settings = loadSecuritySettings();
  const enterpriseMode = _enterpriseMode ?? false;
  const securitySection = $('settings-security-section');
  const keychainBar = $('keychain-health-bar');
  const keychainDetail = $('keychain-health-detail');
  const keychainText = $('keychain-health-text');

  if (enterpriseMode) {
    if (securitySection) securitySection.style.display = 'none';
    if (keychainBar) keychainBar.style.display = 'none';
    if (keychainDetail) keychainDetail.style.display = 'none';
    if (keychainText) keychainText.textContent = '企业 OAuth 模式下不使用本地锁屏或系统认证';
    return;
  }

  const autoDenyPriv = $('sec-auto-deny-priv') as HTMLInputElement | null;
  const autoDenyCritical = $('sec-auto-deny-critical') as HTMLInputElement | null;
  const requireType = $('sec-require-type') as HTMLInputElement | null;
  const readOnlyProjects = $('sec-read-only-projects') as HTMLInputElement | null;
  const allowlistEl = $('sec-allowlist') as HTMLTextAreaElement | null;
  const denylistEl = $('sec-denylist') as HTMLTextAreaElement | null;
  const rotationInterval = $('sec-token-rotation-interval') as HTMLSelectElement | null;
  const rotationStatus = $('sec-token-rotation-status');

  if (autoDenyPriv) autoDenyPriv.checked = settings.autoDenyPrivilegeEscalation;
  if (autoDenyCritical) autoDenyCritical.checked = settings.autoDenyCritical;
  if (requireType) requireType.checked = settings.requireTypeToCritical;
  if (readOnlyProjects) readOnlyProjects.checked = settings.readOnlyProjects;
  if (allowlistEl) allowlistEl.value = settings.commandAllowlist.join('\n');
  if (denylistEl) denylistEl.value = settings.commandDenylist.join('\n');
  if (rotationInterval) rotationInterval.value = String(settings.tokenRotationIntervalDays);
  if (rotationStatus) {
    if (settings.tokenRotationIntervalDays > 0) {
      rotationStatus.textContent = `超过 ${settings.tokenRotationIntervalDays} 天的令牌将自动轮换`;
    } else {
      rotationStatus.textContent = '';
    }
  }

  updateSessionOverrideBanner();
}

export function saveSecurityPolicies() {
  const autoDenyPriv = ($('sec-auto-deny-priv') as HTMLInputElement | null)?.checked ?? false;
  const autoDenyCritical =
    ($('sec-auto-deny-critical') as HTMLInputElement | null)?.checked ?? false;
  const requireType = ($('sec-require-type') as HTMLInputElement | null)?.checked ?? true;
  const readOnlyProjects =
    ($('sec-read-only-projects') as HTMLInputElement | null)?.checked ?? false;
  const allowlistRaw = ($('sec-allowlist') as HTMLTextAreaElement | null)?.value ?? '';
  const denylistRaw = ($('sec-denylist') as HTMLTextAreaElement | null)?.value ?? '';
  const tokenRotationIntervalDays = parseInt(
    ($('sec-token-rotation-interval') as HTMLSelectElement | null)?.value ?? '0',
    10,
  );

  const commandAllowlist = allowlistRaw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const commandDenylist = denylistRaw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  for (const p of [...commandAllowlist, ...commandDenylist]) {
    try {
      new RegExp(p);
    } catch {
      showToast(`无效的正则表达式：${p}`, 'error');
      return;
    }
  }

  const existing = loadSecuritySettings();

  const settings: SecuritySettings = {
    autoDenyPrivilegeEscalation: autoDenyPriv,
    autoDenyCritical: autoDenyCritical,
    requireTypeToCritical: requireType,
    commandAllowlist,
    commandDenylist,
    sessionOverrideUntil: existing.sessionOverrideUntil,
    tokenRotationIntervalDays,
    readOnlyProjects,
  };
  saveSecuritySettings(settings);
  showToast('安全策略已保存', 'success');
}

export function resetSecurityPolicies() {
  resetSecuritySettings()
    .then(() => {
      loadSecurityPolicies();
      showToast('安全策略已重置为默认值', 'info');
    })
    .catch((e) => {
      console.warn('[settings] Failed to reset security settings:', e);
      showToast('重置安全策略失败', 'error');
    });
}

// ── Session override banner management ─────────────────────────────────────

export function updateSessionOverrideBanner(): void {
  const banner = $('session-override-banner');
  const label = $('session-override-banner-label');
  if (!banner) return;

  const remaining = getSessionOverrideRemaining();
  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60000);
    banner.style.display = 'flex';
    if (label) label.textContent = `会话覆盖已启用 - 在 ${mins} 分钟内自动批准所有工具`;

    if (!_state.getOverrideBannerInterval()) {
      const interval = setInterval(() => {
        const r = getSessionOverrideRemaining();
        if (r <= 0) {
          if (banner) banner.style.display = 'none';
          const cur = _state.getOverrideBannerInterval();
          if (cur) {
            clearInterval(cur);
            _state.setOverrideBannerInterval(null);
          }
          return;
        }
        const m = Math.ceil(r / 60000);
        if (label) label.textContent = `会话覆盖已启用 - 在 ${m} 分钟内自动批准所有工具`;
      }, 30000);
      _state.setOverrideBannerInterval(interval);
    }
  } else {
    banner.style.display = 'none';
    const cur = _state.getOverrideBannerInterval();
    if (cur) {
      clearInterval(cur);
      _state.setOverrideBannerInterval(null);
    }
  }
}
