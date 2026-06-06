import { translateUiText } from '../i18n';

// Shared helper functions

export const $ = (id: string) => document.getElementById(id);

/**
 * Safely parse a date string from the database.
 * SQLite datetime('now') returns "YYYY-MM-DD HH:MM:SS" (no T, no timezone)
 * which is not reliably parsed by `new Date()` across environments.
 * This normalises it to ISO 8601 before parsing.
 */
export function parseDate(raw: string | Date | undefined | null): Date {
  if (!raw) return new Date(0);
  if (raw instanceof Date) return raw;
  // If the string looks like SQLite format (has space separator, no T), normalise it
  const normalised = raw.includes('T') ? raw : `${raw.replace(' ', 'T')}Z`;
  const d = new Date(normalised);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

// ── Material Symbols icon helper ───────────────────────────────────────────
const _iconMap: Record<string, string> = {
  paperclip: 'attach_file',
  'arrow-up': 'send',
  send: 'send',
  square: 'stop',
  'rotate-ccw': 'replay',
  'rotate-cw': 'autorenew',
  x: 'close',
  image: 'image',
  'file-text': 'description',
  file: 'insert_drive_file',
  wrench: 'build',
  download: 'download',
  'external-link': 'open_in_new',
  minus: 'remove',
  'maximize-2': 'open_in_full',
  'list-plus': 'playlist_add',
  compass: 'explore',
  'chevron-up': 'expand_less',
};

/** Render a Material Symbols icon span. */
export function icon(name: string, cls = ''): string {
  const ligature = _iconMap[name] || name;
  return `<span class="ms${cls ? ` ${cls}` : ''}">${ligature}</span>`;
}

export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Model Picker Helpers ──────────────────────────────────────────────

const KIND_LABELS: Record<string, string> = {
  ollama: 'Ollama',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  azurefoundry: 'Azure AI Foundry',
  openrouter: 'OpenRouter',
  custom: 'Custom',
  deepseek: 'DeepSeek',
  grok: 'xAI (Grok)',
  mistral: 'Mistral',
  moonshot: 'Moonshot',
};

/** Material Symbols icon names for each provider kind */
export const PROVIDER_ICONS: Record<string, string> = {
  ollama: 'pets',
  openai: 'smart_toy',
  anthropic: 'psychology',
  google: 'auto_awesome',
  azurefoundry: 'cloud',
  openrouter: 'language',
  custom: 'build',
  deepseek: 'explore',
  grok: 'bolt',
  mistral: 'air',
  moonshot: 'dark_mode',
};

/** Render provider icon as Material Symbol span */
export function providerIcon(kind: string, size = 'ms-sm'): string {
  const name = PROVIDER_ICONS[kind] ?? 'build';
  return `<span class="ms ${size}">${name}</span>`;
}

interface ProviderInfo {
  id: string;
  kind: string;
  default_model?: string;
}

/**
 * Populate a <select> element with model options grouped by provider.
 * @param select  The <select> element to populate
 * @param providers  Array of configured providers
 * @param options  Configuration options
 */
export function populateModelSelect(
  select: HTMLSelectElement,
  providers: ProviderInfo[],
  options: {
    /** Text for the first option (empty value). If null, no default option is added. */
    defaultLabel?: string | null;
    /** Currently selected model value */
    currentValue?: string;
    /** Whether to include the current default model info in the default label */
    showDefaultModel?: string;
    /** Hide local-only providers (Ollama) from the list */
    hideOllama?: boolean;
    /** Hide provider group labels — show a flat list of model names */
    hideProviderLabels?: boolean;
  } = {},
): void {
  const {
    defaultLabel = translateUiText('(use default)'),
    currentValue = '',
    showDefaultModel,
    hideOllama = false,
    hideProviderLabels = false,
  } = options;

  // Save scroll position
  const prevValue = currentValue || select.value;

  select.innerHTML = '';

  // Add the default/empty option
  if (defaultLabel !== null) {
    const defaultOpt = document.createElement('option');
    defaultOpt.value = defaultLabel === 'Default Model' ? 'default' : '';
    defaultOpt.textContent = showDefaultModel
      ? `${defaultLabel} — ${showDefaultModel}`
      : (defaultLabel ?? translateUiText('(use default)'));
    select.appendChild(defaultOpt);
  }

  // List models — only show configured default_model, skip local-only providers
  const seen = new Set<string>();
  for (const provider of providers) {
    const kind = provider.kind || 'custom';

    // Skip Ollama (local models) when requested
    if (hideOllama && kind === 'ollama') continue;

    // Only show the provider's configured default model — no hardcoded guesses
    if (!provider.default_model || seen.has(provider.default_model)) continue;
    seen.add(provider.default_model);

    if (hideProviderLabels) {
      const opt = document.createElement('option');
      opt.value = provider.default_model;
      opt.textContent = provider.default_model;
      select.appendChild(opt);
    } else {
      const group = document.createElement('optgroup');
      group.label = KIND_LABELS[kind] ?? `${kind}`;
      const opt = document.createElement('option');
      opt.value = provider.default_model;
      opt.textContent = provider.default_model;
      group.appendChild(opt);
      select.appendChild(group);
    }
  }

  // If the previously selected value still exists, restore it
  if (prevValue) {
    const exists = Array.from(select.options).some((o) => o.value === prevValue);
    if (exists) {
      select.value = prevValue;
    } else if (prevValue && prevValue !== 'default' && prevValue !== '') {
      // The user's model isn't in our list — add it as a custom entry
      const customGroup = document.createElement('optgroup');
      customGroup.label = translateUiText('Current');
      const opt = document.createElement('option');
      opt.value = prevValue;
      opt.textContent = prevValue;
      customGroup.appendChild(opt);
      // Insert after the default option
      if (select.children.length > 1) {
        select.insertBefore(customGroup, select.children[1]);
      } else {
        select.appendChild(customGroup);
      }
      select.value = prevValue;
    }
  }
}

export function escAttr(s: string): string {
  return escHtml(s).replace(/\n/g, '&#10;');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMarkdown(text: string): string {
  // Very simple markdown-ish rendering for chat/research
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\n/g, '<br>');
}

export function cleanupTransientModals(): void {
  for (const id of ['prompt-modal', 'delete-session-modal', 'confirm-modal', 'approval-modal']) {
    const overlay = $(id);
    if (overlay && !overlay.dataset.active) overlay.remove();
  }
  document
    .querySelectorAll<HTMLElement>('.modal-overlay, .tasks-modal-overlay, .research-modal')
    .forEach((overlay) => {
      if (!overlay.dataset.active) overlay.style.display = 'none';
    });
}

function ensureConfirmModal(): {
  overlay: HTMLElement;
  titleEl: HTMLElement;
  messageEl: HTMLElement;
  okBtn: HTMLElement;
  cancelBtn: HTMLElement;
  closeBtn: HTMLElement;
} {
  const existing = $('confirm-modal') as HTMLElement | null;
  if (existing) {
    const titleEl = $('confirm-modal-title') as HTMLElement | null;
    const messageEl = $('confirm-modal-message') as HTMLElement | null;
    const okBtn = $('confirm-modal-ok') as HTMLElement | null;
    const cancelBtn = $('confirm-modal-cancel') as HTMLElement | null;
    const closeBtn = $('confirm-modal-close') as HTMLElement | null;
    if (titleEl && messageEl && okBtn && cancelBtn && closeBtn) {
      return { overlay: existing, titleEl, messageEl, okBtn, cancelBtn, closeBtn };
    }
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'confirm-modal';
  overlay.style.display = 'none';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div class="modal-card" style="width: 420px">
      <div class="modal-header">
        <h2 class="modal-title" id="confirm-modal-title"></h2>
        <button class="btn-icon" id="confirm-modal-close" type="button">✕</button>
      </div>
      <div class="modal-body">
        <p id="confirm-modal-message" style="margin: 0; white-space: pre-wrap"></p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="confirm-modal-cancel" type="button">${translateUiText('Cancel')}</button>
        <button class="btn btn-danger" id="confirm-modal-ok" type="button">${translateUiText('Confirm')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  return {
    overlay,
    titleEl: overlay.querySelector('#confirm-modal-title') as HTMLElement,
    messageEl: overlay.querySelector('#confirm-modal-message') as HTMLElement,
    okBtn: overlay.querySelector('#confirm-modal-ok') as HTMLElement,
    cancelBtn: overlay.querySelector('#confirm-modal-cancel') as HTMLElement,
    closeBtn: overlay.querySelector('#confirm-modal-close') as HTMLElement,
  };
}

// Tauri 2 WKWebView (macOS) does not support window.confirm() — it may not render.
// This custom modal replaces all confirm() usage in the app.
export function confirmModal(message: string, title = 'Confirm'): Promise<boolean> {
  return new Promise((resolve) => {
    const { overlay, titleEl, messageEl, okBtn, cancelBtn, closeBtn } = ensureConfirmModal();

    overlay.dataset.active = 'true';
    titleEl.textContent = translateUiText(title);
    messageEl.textContent = translateUiText(message);
    overlay.style.display = 'flex';
    okBtn?.focus();

    function cleanup() {
      overlay.style.display = 'none';
      delete overlay.dataset.active;
      okBtn?.removeEventListener('click', onOk);
      cancelBtn?.removeEventListener('click', onCancel);
      closeBtn?.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKey);
      overlay.remove();
    }
    function onOk() {
      cleanup();
      resolve(true);
    }
    function onCancel() {
      cleanup();
      resolve(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onOk();
      }
    }
    function onBackdrop(e: MouseEvent) {
      if (e.target === overlay) onCancel();
    }

    okBtn?.addEventListener('click', onOk);
    cancelBtn?.addEventListener('click', onCancel);
    closeBtn?.addEventListener('click', onCancel);
    overlay.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKey);
  });
}

function ensureDeleteSessionModal(): {
  overlay: HTMLElement;
  checkbox: HTMLInputElement;
  okBtn: HTMLElement;
  cancelBtn: HTMLElement;
  closeBtn: HTMLElement;
} {
  const existing = $('delete-session-modal') as HTMLElement | null;
  if (existing) {
    const checkbox = $('delete-session-memory-checkbox') as HTMLInputElement | null;
    const okBtn = $('delete-session-modal-ok') as HTMLElement | null;
    const cancelBtn = $('delete-session-modal-cancel') as HTMLElement | null;
    const closeBtn = $('delete-session-modal-close') as HTMLElement | null;
    if (checkbox && okBtn && cancelBtn && closeBtn) {
      return { overlay: existing, checkbox, okBtn, cancelBtn, closeBtn };
    }
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'delete-session-modal';
  overlay.style.display = 'none';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div class="modal-card" style="width: 440px">
      <div class="modal-header">
        <h2 class="modal-title">${translateUiText('Delete Session')}</h2>
        <button class="btn-icon" id="delete-session-modal-close" type="button">✕</button>
      </div>
      <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px">
        <p style="margin: 0">${translateUiText('Delete this session? This cannot be undone.')}</p>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none">
          <input type="checkbox" id="delete-session-memory-checkbox" />
          <span>${translateUiText('Also delete memories created in this session')}</span>
        </label>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="delete-session-modal-cancel" type="button">${translateUiText('Cancel')}</button>
        <button class="btn btn-danger" id="delete-session-modal-ok" type="button">${translateUiText('Delete Session')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  return {
    overlay,
    checkbox: overlay.querySelector('#delete-session-memory-checkbox') as HTMLInputElement,
    okBtn: overlay.querySelector('#delete-session-modal-ok') as HTMLElement,
    cancelBtn: overlay.querySelector('#delete-session-modal-cancel') as HTMLElement,
    closeBtn: overlay.querySelector('#delete-session-modal-close') as HTMLElement,
  };
}

/** Show a delete-session dialog with a checkbox to optionally delete associated memories. */
export function confirmDeleteSessionModal(): Promise<{
  confirmed: boolean;
  deleteMemory: boolean;
}> {
  return new Promise((resolve) => {
    const { overlay, checkbox, okBtn, cancelBtn, closeBtn } = ensureDeleteSessionModal();

    overlay.dataset.active = 'true';
    checkbox.checked = false;
    overlay.style.display = 'flex';
    okBtn?.focus();

    function cleanup() {
      overlay.style.display = 'none';
      delete overlay.dataset.active;
      okBtn?.removeEventListener('click', onOk);
      cancelBtn?.removeEventListener('click', onCancel);
      closeBtn?.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKey);
      overlay.remove();
    }
    function onOk() {
      const deleteMemory = checkbox.checked;
      cleanup();
      resolve({ confirmed: true, deleteMemory });
    }
    function onCancel() {
      cleanup();
      resolve({ confirmed: false, deleteMemory: false });
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onOk();
      }
    }
    function onBackdrop(e: MouseEvent) {
      if (e.target === overlay) onCancel();
    }

    okBtn?.addEventListener('click', onOk);
    cancelBtn?.addEventListener('click', onCancel);
    closeBtn?.addEventListener('click', onCancel);
    overlay.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKey);
  });
}

function ensurePromptModal(): {
  overlay: HTMLElement;
  titleEl: HTMLElement;
  input: HTMLInputElement;
  okBtn: HTMLElement;
  cancelBtn: HTMLElement;
  closeBtn: HTMLElement;
} {
  const existing = $('prompt-modal') as HTMLElement | null;
  if (existing) {
    const titleEl = $('prompt-modal-title') as HTMLElement | null;
    const input = $('prompt-modal-input') as HTMLInputElement | null;
    const okBtn = $('prompt-modal-ok') as HTMLElement | null;
    const cancelBtn = $('prompt-modal-cancel') as HTMLElement | null;
    const closeBtn = $('prompt-modal-close') as HTMLElement | null;
    if (titleEl && input && okBtn && cancelBtn && closeBtn) {
      return { overlay: existing, titleEl, input, okBtn, cancelBtn, closeBtn };
    }
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'prompt-modal';
  overlay.style.display = 'none';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div class="modal-card" style="width: 420px">
      <div class="modal-header">
        <h2 class="modal-title" id="prompt-modal-title"></h2>
        <button class="btn-icon" id="prompt-modal-close" type="button">✕</button>
      </div>
      <div class="modal-body">
        <input
          type="text"
          class="form-input"
          id="prompt-modal-input"
          placeholder=""
          autocomplete="off"
        />
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="prompt-modal-cancel" type="button">${translateUiText('Cancel')}</button>
        <button class="btn btn-primary" id="prompt-modal-ok" type="button">${translateUiText('OK')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  return {
    overlay,
    titleEl: overlay.querySelector('#prompt-modal-title') as HTMLElement,
    input: overlay.querySelector('#prompt-modal-input') as HTMLInputElement,
    okBtn: overlay.querySelector('#prompt-modal-ok') as HTMLElement,
    cancelBtn: overlay.querySelector('#prompt-modal-cancel') as HTMLElement,
    closeBtn: overlay.querySelector('#prompt-modal-close') as HTMLElement,
  };
}

// Tauri 2 WKWebView (macOS) does not support window.prompt() — it returns null.
// This custom modal replaces all prompt() usage in the app.
export function promptModal(title: string, placeholder?: string): Promise<string | null> {
  return new Promise((resolve) => {
    const { overlay, titleEl, input, okBtn, cancelBtn, closeBtn } = ensurePromptModal();

    console.warn('[promptModal]', title, new Error().stack);
    overlay.dataset.active = 'true';
    titleEl.textContent = translateUiText(title);
    input.placeholder = placeholder ? translateUiText(placeholder) : '';
    input.value = '';
    overlay.style.display = 'flex';
    input.focus();

    function cleanup() {
      overlay.style.display = 'none';
      delete overlay.dataset.active;
      okBtn?.removeEventListener('click', onOk);
      cancelBtn?.removeEventListener('click', onCancel);
      closeBtn?.removeEventListener('click', onCancel);
      input.removeEventListener('keydown', onKey);
      overlay.removeEventListener('click', onBackdrop);
      overlay.remove();
    }
    function onOk() {
      const val = input.value.trim();
      cleanup();
      resolve(val || null);
    }
    function onCancel() {
      cleanup();
      resolve(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onOk();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    }
    function onBackdrop(e: MouseEvent) {
      if (e.target === overlay) onCancel();
    }

    okBtn?.addEventListener('click', onOk);
    cancelBtn?.addEventListener('click', onCancel);
    closeBtn?.addEventListener('click', onCancel);
    input.addEventListener('keydown', onKey);
    overlay.addEventListener('click', onBackdrop);
  });
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseDate(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString();
}
