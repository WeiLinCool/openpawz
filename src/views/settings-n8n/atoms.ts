// Settings: n8n — Pure helpers (no DOM, no IPC)

import { t } from '../../i18n';

/** HTML-escape a string */
export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Create a styled button element */
export function makeBtn(label: string, cls: string, handler: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = `btn ${cls} btn-sm`;
  btn.textContent = t(label);
  btn.addEventListener('click', handler);
  return btn;
}

/** Format a workflow count message */
export function workflowCountLabel(count: number): string {
  return count === 1 ? `1 ${t('workflow')}` : `${count} ${t('workflows')}`;
}
