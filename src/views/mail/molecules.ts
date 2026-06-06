// Mail View — Molecules (DOM rendering + IPC)
// Account list, email list, email detail, compose modal

import type { SkillEntry } from '../../types';
import { logCredentialActivity, getCredentialActivityLog } from '../../db';
import { $, escHtml, escAttr, formatMarkdown, confirmModal } from '../../components/helpers';
import { showToast } from '../../components/toast';
import { pawEngine } from '../../engine';
import {
  type MailPermissions,
  type MailMessage,
  type MailAccount,
  loadMailPermissions,
  saveMailPermissions,
  removeMailPermissions,
  getAvatarClass,
  getInitials,
  formatMailDate,
} from './atoms';

// ── Injected dependencies (set by index.ts to break circular imports) ──────

let _openMailAccountSetup: () => void = () => {};
let _loadMail: () => void = () => {};
export function setOpenMailAccountSetup(fn: () => void): void {
  _openMailAccountSetup = fn;
}
export function setLoadMailRef(fn: () => void): void {
  _loadMail = fn;
}

// ── Module state refs (set by index.ts configure) ──────────────────────────

let _mailFolder = 'inbox';
let _mailHimalayaReady = false;
let _mailMessages: MailMessage[] = [];
let _mailSelectedId: string | null = null;
let _mailAccounts: MailAccount[] = [];

// ── Hero stat helpers ──────────────────────────────────────────────────────

export function updateMailHeroStats(): void {
  const acctEl = document.getElementById('mail-stat-accounts');
  const inboxEl = document.getElementById('mail-stat-inbox');
  const draftsEl = document.getElementById('mail-stat-drafts');
  if (acctEl) acctEl.textContent = String(_mailAccounts.length);
  if (inboxEl) inboxEl.textContent = String(_mailMessages.length);
  // Agent drafts folder is not yet populated — show 0
  if (draftsEl) draftsEl.textContent = '0';
}

let onSwitchView: ((view: string) => void) | null = null;
let onSetCurrentSession: ((key: string | null) => void) | null = null;
let getChatInput: (() => HTMLTextAreaElement | null) | null = null;

export function configureMolecules(opts: {
  switchView: (view: string) => void;
  setCurrentSession: (key: string | null) => void;
  getChatInput: () => HTMLTextAreaElement | null;
}) {
  onSwitchView = opts.switchView;
  onSetCurrentSession = opts.setCurrentSession;
  getChatInput = opts.getChatInput;
}

export function getMailAccountsRef(): MailAccount[] {
  return _mailAccounts;
}

export function setMailFolder(folder: string) {
  _mailFolder = folder;
}

export function setMailSelectedId(id: string | null) {
  _mailSelectedId = id;
}

// ── Account list rendering ─────────────────────────────────────────────────

export async function renderMailAccounts(
  _gmail: Record<string, unknown> | null,
  himalaya: SkillEntry | null,
) {
  const list = $('mail-accounts-list');
  if (!list) return;
  list.innerHTML = '';
  _mailAccounts = [];

  // ── Himalaya IMAP accounts ───────────────────────────────────────────

  try {
    const toml = await pawEngine.mailReadConfig();
    if (toml) {
      const accountBlocks = toml.matchAll(/\[accounts\.([^\]]+)\][\s\S]*?email\s*=\s*"([^"]+)"/g);
      for (const match of accountBlocks) {
        _mailAccounts.push({ name: match[1], email: match[2] });
      }
    }
  } catch {
    /* no config yet — try localStorage fallback */
  }

  if (_mailAccounts.length === 0) {
    try {
      const fallback = JSON.parse(
        localStorage.getItem('mail-accounts-fallback') ?? '[]',
      ) as MailAccount[];
      for (const acct of fallback) {
        _mailAccounts.push({ name: acct.name, email: acct.email });
      }
    } catch {
      /* ignore */
    }
  }

  // ── Google OAuth account (check if Gmail API is connected) ───────
  try {
    const gmailTest = await pawEngine.gmailInbox(1);
    // If the call succeeds (even with 0 messages), Google is connected
    if (gmailTest !== undefined) {
      // Only add if there's no Himalaya account already covering this email
      const hasGoogle = _mailAccounts.some((a) => a.name === '__google__');
      if (!hasGoogle) {
        _mailAccounts.push({ name: '__google__', email: 'Google（OAuth）' });
      }
    }
  } catch {
    /* Google not connected — skip */
  }

  // Himalaya is "ready" if we found at least one configured account
  _mailHimalayaReady = _mailAccounts.length > 0;

  for (const acct of _mailAccounts) {
    const perms = loadMailPermissions(acct.name);
    const item = document.createElement('div');
    item.className = 'mail-vault-account';

    const domain = acct.email.split('@')[1] ?? '';
    let icon = 'M';
    if (domain.includes('gmail')) icon = 'G';
    else if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live'))
      icon = 'O';
    else if (domain.includes('yahoo')) icon = 'Y';
    else if (domain.includes('icloud') || domain.includes('me.com')) icon = 'iC';
    else if (domain.includes('fastmail')) icon = 'FM';

    const permCount = [perms.read, perms.send, perms.delete, perms.manage].filter(Boolean).length;
    const permSummary =
      [perms.read && '读取', perms.send && '发送', perms.delete && '删除', perms.manage && '管理']
        .filter(Boolean)
        .join(' · ') || '无权限';

    item.innerHTML = `
      <div class="mail-vault-header">
        <div class="mail-account-icon">${icon}</div>
        <div class="mail-account-info">
          <div class="mail-account-name">${escHtml(acct.email)}</div>
          <div class="mail-account-status connected">已启用 ${permCount}/4 项权限</div>
        </div>
        <button class="btn-icon mail-vault-expand" title="管理权限">▾</button>
      </div>
      <div class="mail-vault-details" style="display:none">
        <div class="mail-vault-perms">
          <label class="mail-vault-perm-row">
            <input type="checkbox" class="mail-vault-cb" data-perm="read" ${perms.read ? 'checked' : ''}>
            <span class="mail-vault-perm-icon">R</span>
            <span class="mail-vault-perm-name">读取邮件</span>
          </label>
          <label class="mail-vault-perm-row">
            <input type="checkbox" class="mail-vault-cb" data-perm="send" ${perms.send ? 'checked' : ''}>
            <span class="mail-vault-perm-icon">S</span>
            <span class="mail-vault-perm-name">发送邮件</span>
          </label>
          <label class="mail-vault-perm-row">
            <input type="checkbox" class="mail-vault-cb" data-perm="delete" ${perms.delete ? 'checked' : ''}>
            <span class="mail-vault-perm-icon">D</span>
            <span class="mail-vault-perm-name">删除邮件</span>
          </label>
          <label class="mail-vault-perm-row">
            <input type="checkbox" class="mail-vault-cb" data-perm="manage" ${perms.manage ? 'checked' : ''}>
            <span class="mail-vault-perm-icon">F</span>
            <span class="mail-vault-perm-name">管理文件夹</span>
          </label>
        </div>
        <div class="mail-vault-perm-summary">${permSummary}</div>
        <div class="mail-vault-meta">
          <span class="mail-vault-meta-item">本地存储于 <code>~/.config/himalaya/</code>，密码保存在系统钥匙串中</span>
          <span class="mail-vault-meta-item">所有操作都会记录到聊天中</span>
        </div>
        <div class="mail-vault-actions">
          <button class="btn btn-ghost btn-sm mail-vault-revoke" data-account="${escAttr(acct.name)}">撤销访问</button>
        </div>
      </div>
    `;
    list.appendChild(item);

    const expandBtn = item.querySelector('.mail-vault-expand');
    const details = item.querySelector('.mail-vault-details') as HTMLElement;
    expandBtn?.addEventListener('click', () => {
      const open = details.style.display !== 'none';
      details.style.display = open ? 'none' : '';
      expandBtn.textContent = open ? '▾' : '▴';
    });

    item.querySelectorAll('.mail-vault-cb').forEach((cb) => {
      cb.addEventListener('change', () => {
        const updated: MailPermissions = {
          read: (item.querySelector('[data-perm="read"]') as HTMLInputElement)?.checked ?? true,
          send: (item.querySelector('[data-perm="send"]') as HTMLInputElement)?.checked ?? true,
          delete:
            (item.querySelector('[data-perm="delete"]') as HTMLInputElement)?.checked ?? false,
          manage:
            (item.querySelector('[data-perm="manage"]') as HTMLInputElement)?.checked ?? false,
        };
        saveMailPermissions(acct.name, updated);
        const count = [updated.read, updated.send, updated.delete, updated.manage].filter(
          Boolean,
        ).length;
        const summary =
          [
            updated.read && '读取',
            updated.send && '发送',
            updated.delete && '删除',
            updated.manage && '管理',
          ]
            .filter(Boolean)
            .join(' · ') || '无权限';
        const statusEl = item.querySelector('.mail-account-status');
        const summaryEl = item.querySelector('.mail-vault-perm-summary');
        if (statusEl) statusEl.textContent = `已启用 ${count}/4 项权限`;
        if (summaryEl) summaryEl.textContent = summary;
        showToast(`已更新 ${acct.email} 的权限`, 'info');
      });
    });

    item.querySelector('.mail-vault-revoke')?.addEventListener('click', async () => {
      if (
        !(await confirmModal(
          `确定移除 ${acct.email} 并撤销所有访问权限吗？\n\n这会从你的设备中删除已保存的凭据，不会影响邮箱本身。`,
        ))
      )
        return;
      try {
        await pawEngine.mailRemoveAccount(acct.name);
        removeMailPermissions(acct.name);
        logCredentialActivity({
          accountName: acct.name,
          action: 'denied',
          detail: `已撤销账号：${acct.email}，凭据已从设备删除`,
        });
        showToast(`${acct.email} 已撤销，凭据已从本设备移除`, 'success');
        _loadMail();
      } catch (err) {
        showToast(`移除失败：${err instanceof Error ? err.message : err}`, 'error');
      }
    });
  }

  if (himalaya && (!himalaya.eligible || himalaya.disabled)) {
    const item = document.createElement('div');
    item.className = 'mail-account-item';
    const missingBins = himalaya.missing?.bins?.length;
    let statusLabel = '未安装';
    let statusClass = '';
    if (himalaya.disabled) {
      statusLabel = '已禁用';
      statusClass = 'muted';
    } else if (missingBins) {
      statusLabel = '缺少 CLI';
      statusClass = 'error';
    }

    item.innerHTML = `
      <div class="mail-account-icon">H</div>
      <div class="mail-account-info">
        <div class="mail-account-name">Himalaya 技能</div>
        <div class="mail-account-status ${statusClass}">${statusLabel}</div>
      </div>
      ${himalaya.install?.length ? `<button class="btn btn-ghost btn-sm mail-himalaya-install">安装</button>` : ''}
      ${himalaya.disabled ? `<button class="btn btn-ghost btn-sm mail-himalaya-enable">启用</button>` : ''}
    `;
    list.appendChild(item);

    item.querySelector('.mail-himalaya-install')?.addEventListener('click', async () => {
      showToast('Himalaya 技能安装即将支持，目前请先通过 CLI 手动安装', 'info');
    });
    item.querySelector('.mail-himalaya-enable')?.addEventListener('click', async () => {
      showToast('Himalaya 技能管理即将支持', 'info');
    });
  }

  if (_mailAccounts.length === 0 && !himalaya) {
    list.innerHTML = '<div class="mail-no-accounts">暂无已连接的账号</div>';
  }

  updateMailHeroStats();
  renderCredentialActivityLog();
}

// ── Credential activity log ────────────────────────────────────────────────

export async function renderCredentialActivityLog() {
  let logSection = $('mail-vault-activity');
  if (!logSection) {
    const accountsSection = document.querySelector('.mail-accounts-section');
    if (!accountsSection) return;
    logSection = document.createElement('div');
    logSection.id = 'mail-vault-activity';
    logSection.className = 'mail-vault-activity-section';
    accountsSection.after(logSection);
  }

  try {
    const entries = await getCredentialActivityLog(20);
    if (entries.length === 0) {
      logSection.innerHTML = `
        <div class="mail-vault-activity-header" id="mail-vault-activity-toggle">
          <span class="ms ms-sm">description</span>
          凭据活动记录
          <span class="mail-vault-activity-count">0</span>
        </div>
        <div class="mail-vault-activity-empty">暂无凭据活动记录</div>
      `;
      return;
    }

    const blocked = entries.filter((e) => !e.was_allowed).length;
    logSection.innerHTML = `
      <div class="mail-vault-activity-header" id="mail-vault-activity-toggle">
        <span class="ms ms-sm">description</span>
        凭据活动记录
        <span class="mail-vault-activity-count">${entries.length}${blocked ? ` · <span class="vault-blocked-count">${blocked} 条已阻止</span>` : ''}</span>
        <span class="mail-vault-activity-chevron">▸</span>
      </div>
      <div class="mail-vault-activity-list" style="display:none">
        ${entries
          .map((e) => {
            const icon = !e.was_allowed
              ? 'X'
              : e.action === 'send'
                ? 'S'
                : e.action === 'read'
                  ? 'R'
                  : e.action === 'delete'
                    ? 'D'
                    : e.action === 'manage'
                      ? 'F'
                      : '--';
            const cls = !e.was_allowed ? 'vault-log-blocked' : '';
            const time = e.timestamp
              ? new Date(`${e.timestamp}Z`).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';
            return `<div class="vault-log-entry ${cls}">
            <span class="vault-log-icon">${icon}</span>
            <div class="vault-log-body">
              <div class="vault-log-action">${escHtml(e.detail ?? e.action)}</div>
              <div class="vault-log-time">${time}${e.tool_name ? ` · ${escHtml(e.tool_name)}` : ''}</div>
            </div>
          </div>`;
          })
          .join('')}
      </div>
    `;

    $('mail-vault-activity-toggle')?.addEventListener('click', () => {
      const list = logSection!.querySelector('.mail-vault-activity-list') as HTMLElement | null;
      const chevron = logSection!.querySelector('.mail-vault-activity-chevron');
      if (list) {
        const open = list.style.display !== 'none';
        list.style.display = open ? 'none' : '';
        if (chevron) chevron.textContent = open ? '▸' : '▾';
      }
    });
  } catch {
    // DB not ready yet, skip
  }
}

// ── Inbox loading ──────────────────────────────────────────────────────────

export async function loadMailInbox() {
  _mailMessages = [];

  // ── Load Himalaya IMAP messages ──────────────────────────────────────
  const himalayaAccount = _mailAccounts.find((a) => a.name !== '__google__');
  if (himalayaAccount) {
    try {
      const jsonResult = await pawEngine.mailFetchEmails(
        himalayaAccount.name,
        _mailFolder === 'inbox' ? 'INBOX' : _mailFolder,
        50,
      );

      interface HimalayaEnvelope {
        id: string;
        flags: string[];
        subject: string;
        from: { name?: string; addr: string };
        date: string;
      }

      let envelopes: HimalayaEnvelope[] = [];
      try {
        envelopes = JSON.parse(jsonResult);
      } catch {
        /* ignore */
      }

      for (const env of envelopes) {
        _mailMessages.push({
          id: String(env.id),
          from: env.from?.name || env.from?.addr || '未知发件人',
          subject: env.subject || '（无主题）',
          snippet: '',
          date: env.date ? new Date(env.date) : new Date(),
          read: env.flags?.includes('Seen') ?? false,
          source: 'himalaya',
        });
      }
    } catch (e) {
      console.warn('[mail] Himalaya inbox load failed:', e);
    }
  }

  // ── Load Gmail API messages (Google OAuth) ──────────────────────────
  try {
    const gmailMessages = await pawEngine.gmailInbox(50);
    for (const gm of gmailMessages) {
      _mailMessages.push({
        id: `gmail:${gm.id}`,
        from: gm.from,
        subject: gm.subject,
        snippet: gm.snippet,
        date: gm.date ? new Date(gm.date) : new Date(),
        read: gm.read,
        source: 'google',
      });
    }
  } catch (e) {
    console.warn('[mail] Gmail inbox load failed:', e);
  }

  // Sort all messages by date (newest first)
  _mailMessages.sort((a, b) => b.date.getTime() - a.date.getTime());

  renderMailList();
  showMailEmpty(_mailMessages.length === 0);

  const countEl = $('mail-inbox-count');
  if (countEl) countEl.textContent = String(_mailMessages.length);

  updateMailHeroStats();
}

// ── Mail list ──────────────────────────────────────────────────────────────

export function renderMailList() {
  const container = $('mail-items');
  if (!container) return;
  container.innerHTML = '';

  const filtered = _mailFolder === 'inbox' ? _mailMessages : [];

  if (_mailFolder !== 'inbox') {
    container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px">
      ${_mailFolder === 'agent' ? '智能体起草的邮件会在这里显示，供你审核。' : '此文件夹中没有消息。'}
    </div>`;
    return;
  }

  for (const msg of filtered) {
    const item = document.createElement('div');
    item.className = `mail-item${msg.id === _mailSelectedId ? ' active' : ''}${!msg.read ? ' unread' : ''}`;
    item.innerHTML = `
      <div class="mail-item-avatar ${getAvatarClass(msg.from)}">${getInitials(msg.from)}</div>
      <div class="mail-item-content">
        <div class="mail-item-top">
          <div class="mail-item-sender">${escHtml(msg.from)}</div>
          <div class="mail-item-date">${formatMailDate(msg.date)}</div>
        </div>
        <div class="mail-item-subject">${escHtml(msg.subject)}</div>
      </div>
    `;
    item.addEventListener('click', () => openMailMessage(msg.id));
    container.appendChild(item);
  }
}

// ── Empty state ────────────────────────────────────────────────────────────

export function showMailEmpty(show: boolean) {
  const empty = $('mail-empty');
  const items = $('mail-items');
  const chatInput = getChatInput?.();
  if (empty) {
    empty.style.display = show ? 'flex' : 'none';
    if (show) {
      const hasAccounts = _mailAccounts.length > 0;
      const mailIcon = `<div class="empty-icon"><span class="ms" style="font-size:48px">mail</span></div>`;

      if (hasAccounts && _mailHimalayaReady) {
        empty.innerHTML = `
          ${mailIcon}
          <div class="empty-title">收件箱为空</div>
          <div class="empty-subtitle">暂时没有消息。你可以使用撰写功能发送邮件，或者让智能体检查邮件。</div>
          <button class="btn btn-ghost" id="mail-compose-cta" style="margin-top:16px">撰写邮件</button>
        `;
        $('mail-compose-cta')?.addEventListener('click', () => {
          onSetCurrentSession?.(null);
          onSwitchView?.('chat');
          if (chatInput) {
            chatInput.value = '我想撰写一封新邮件。请帮我起草，并在准备好后发送。';
            chatInput.focus();
          }
        });
      } else if (hasAccounts && !_mailHimalayaReady) {
        empty.innerHTML = `
          ${mailIcon}
          <div class="empty-title">启用 Himalaya 技能</div>
          <div class="empty-subtitle">你的邮箱已配置，但需要安装或启用 Himalaya 技能，智能体才能读取和发送邮件。</div>
          <button class="btn btn-primary" id="mail-go-skills" style="margin-top:16px">前往技能</button>
        `;
        $('mail-go-skills')?.addEventListener('click', () => onSwitchView?.('skills'));
      } else {
        empty.innerHTML = `
          ${mailIcon}
          <div class="empty-title">连接你的邮箱</div>
          <div class="empty-subtitle">添加一个邮箱账号后，智能体就能代表你读取、起草和发送邮件。</div>
          <button class="btn btn-primary" id="mail-setup-account" style="margin-top:16px">添加邮箱账号</button>
        `;
        $('mail-setup-account')?.addEventListener('click', () => _openMailAccountSetup());
      }
    }
  }
  if (items) items.style.display = show ? 'none' : '';
}

// ── Email detail view ──────────────────────────────────────────────────────

export async function openMailMessage(msgId: string) {
  _mailSelectedId = msgId;
  renderMailList();

  const msg = _mailMessages.find((m) => m.id === msgId);
  const preview = $('mail-preview');
  if (!preview || !msg) return;

  // Show loading state
  preview.innerHTML = `
    <div class="mail-preview-header">
      <div class="mail-preview-avatar ${getAvatarClass(msg.from)}">${getInitials(msg.from)}</div>
      <div class="mail-preview-meta">
        <div class="mail-preview-from">${escHtml(msg.from)}</div>
        <div class="mail-preview-date">${msg.date.toLocaleString()}</div>
      </div>
    </div>
    <div class="mail-preview-subject">${escHtml(msg.subject)}</div>
      <div class="mail-preview-body" style="opacity:0.5">加载中...</div>
  `;

  // Fetch full content via Himalaya
  let body = msg.body || '';
  if (!msg.body) {
    try {
      const himalayaAccount = _mailAccounts.find((a) => a.name !== '__google__');
      body = await pawEngine.mailFetchContent(himalayaAccount?.name, 'INBOX', msgId);
      msg.body = body;
    } catch (e) {
      console.warn('[mail] Failed to fetch content:', e);
      body = '（邮件内容加载失败）';
    }
  }

  preview.innerHTML = `
    <div class="mail-preview-header">
      <div class="mail-preview-avatar ${getAvatarClass(msg.from)}">${getInitials(msg.from)}</div>
      <div class="mail-preview-meta">
        <div class="mail-preview-from">${escHtml(msg.from)}</div>
        <div class="mail-preview-date">${msg.date.toLocaleString()}</div>
      </div>
    </div>
    <div class="mail-preview-subject">${escHtml(msg.subject)}</div>
    <div class="mail-preview-body">${formatMarkdown(body)}</div>
    <div class="mail-preview-actions">
      <button class="btn btn-primary mail-action-reply">回复</button>
      <button class="btn btn-ghost mail-action-forward">转发</button>
      <button class="btn btn-ghost mail-action-archive">归档</button>
      <button class="btn btn-ghost mail-action-delete">删除</button>
    </div>
    <div class="mail-ai-actions">
      <span class="mail-ai-label">AI 操作</span>
      <button class="btn btn-sm btn-ghost mail-ai-summarize">总结</button>
      <button class="btn btn-sm btn-ghost mail-ai-draft">起草回复</button>
      <button class="btn btn-sm btn-ghost mail-ai-actions">提取任务</button>
    </div>
  `;

  preview
    .querySelector('.mail-action-reply')
    ?.addEventListener('click', () => openComposeModal('reply', msg));
  preview
    .querySelector('.mail-action-forward')
    ?.addEventListener('click', () => openComposeModal('forward', msg));
  preview.querySelector('.mail-action-archive')?.addEventListener('click', () => archiveEmail(msg));
  preview.querySelector('.mail-action-delete')?.addEventListener('click', () => deleteEmail(msg));

  // AI actions
  preview
    .querySelector('.mail-ai-summarize')
    ?.addEventListener('click', () => aiMailAction('summarize', msg));
  preview
    .querySelector('.mail-ai-draft')
    ?.addEventListener('click', () => aiMailAction('draft', msg));
  preview
    .querySelector('.mail-ai-actions')
    ?.addEventListener('click', () => aiMailAction('tasks', msg));
}

// ── Compose modal ──────────────────────────────────────────────────────────

export function openComposeModal(
  mode: 'reply' | 'forward',
  msg: { from: string; subject: string; body?: string; source?: 'himalaya' | 'google' },
) {
  const modal = document.createElement('div');
  modal.className = 'mail-compose-modal';
  modal.innerHTML = `
      <div class="mail-compose-dialog">
      <div class="mail-compose-header">
        <span>${mode === 'reply' ? '回复' : '转发'}</span>
        <button class="btn-icon mail-compose-close">×</button>
      </div>
      <div class="mail-compose-body">
        <input type="text" class="mail-compose-to" placeholder="收件人" value="${mode === 'reply' ? escAttr(msg.from) : ''}">
        <input type="text" class="mail-compose-subject" placeholder="主题" value="${mode === 'reply' ? '回复：' : '转发：'}${escAttr(msg.subject)}">
        <textarea class="mail-compose-content" placeholder="写下你的消息...">${mode === 'forward' ? `\n\n--- 已转发 ---\n${msg.body || ''}` : ''}</textarea>
      </div>
      <div class="mail-compose-footer">
        <button class="btn btn-ghost mail-compose-cancel">取消</button>
        <button class="btn btn-primary mail-compose-send">发送</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.mail-compose-close')?.addEventListener('click', close);
  modal.querySelector('.mail-compose-cancel')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  modal.querySelector('.mail-compose-send')?.addEventListener('click', async () => {
    const to = (modal.querySelector('.mail-compose-to') as HTMLInputElement)?.value;
    const subject = (modal.querySelector('.mail-compose-subject') as HTMLInputElement)?.value;
    const body = (modal.querySelector('.mail-compose-content') as HTMLTextAreaElement)?.value;
    if (!to || !subject) {
      showToast('请填写收件人和主题', 'error');
      return;
    }

    try {
      const himalayaAccount = _mailAccounts.find((a) => a.name !== '__google__');
      await pawEngine.mailSend(himalayaAccount?.name, to, subject, body);
      showToast('邮件已发送！', 'success');
      close();
    } catch (e) {
      showToast(`发送失败：${e}`, 'error');
    }
  });
}

// ── Email actions ──────────────────────────────────────────────────────────

async function archiveEmail(msg: { id: string; source?: 'himalaya' | 'google' }) {
  try {
    const himalayaAccount = _mailAccounts.find((a) => a.name !== '__google__');
    await pawEngine.mailMove(himalayaAccount?.name, msg.id, '[Gmail]/All Mail');
    showToast('已归档', 'success');
    _mailMessages = _mailMessages.filter((m) => m.id !== msg.id);
    renderMailList();
    const preview = $('mail-preview');
    if (preview) preview.innerHTML = '<div class="mail-preview-empty">请选择一封邮件阅读</div>';
  } catch (e) {
    showToast(`归档失败：${e}`, 'error');
  }
}

async function deleteEmail(msg: { id: string; subject: string; source?: 'himalaya' | 'google' }) {
  if (!(await confirmModal(`确定删除“${msg.subject}”吗？`))) return;
  try {
    const himalayaAccount = _mailAccounts.find((a) => a.name !== '__google__');
    await pawEngine.mailDelete(himalayaAccount?.name, msg.id);
    showToast('已删除', 'success');
    _mailMessages = _mailMessages.filter((m) => m.id !== msg.id);
    renderMailList();
    const preview = $('mail-preview');
    if (preview) preview.innerHTML = '<div class="mail-preview-empty">请选择一封邮件阅读</div>';
  } catch (e) {
    showToast(`删除失败：${e}`, 'error');
  }
}

function aiMailAction(
  action: 'summarize' | 'draft' | 'tasks',
  msg: { from: string; subject: string; body?: string },
) {
  const prompts: Record<string, string> = {
    summarize: `请总结来自 ${msg.from} 的这封邮件：\n\n主题：${msg.subject}\n\n${msg.body || ''}`,
    draft: `请为来自 ${msg.from} 的这封邮件撰写一封专业回复：\n\n主题：${msg.subject}\n\n${msg.body || ''}`,
    tasks: `请从来自 ${msg.from} 的这封邮件中提取任何待办事项或任务：\n\n主题：${msg.subject}\n\n${msg.body || ''}`,
  };

  onSetCurrentSession?.(null);
  onSwitchView?.('chat');
  const chatInput = getChatInput?.();
  if (chatInput) {
    chatInput.value = prompts[action];
    chatInput.focus();
    chatInput.form?.requestSubmit();
  }
}
