// Settings Skills — Atoms (pure data, constants, helpers)
// Zero DOM, zero IPC

import { t } from '../../i18n';

// ── Category metadata ──────────────────────────────────────────────────────

export const CATEGORY_META: Record<string, { label: string; icon: string; order: number }> = {
  Vault: { label: t('Vault (Credentials)'), icon: 'enhanced_encryption', order: 0 },
  Communication: { label: t('Communication'), icon: 'forum', order: 1 },
  Productivity: { label: t('Productivity'), icon: 'task_alt', order: 2 },
  Api: { label: t('API Integrations'), icon: 'api', order: 3 },
  Development: { label: t('Development'), icon: 'code', order: 4 },
  Media: { label: t('Media'), icon: 'movie', order: 5 },
  SmartHome: { label: t('Smart Home & IoT'), icon: 'home', order: 6 },
  Cli: { label: t('CLI Tools'), icon: 'terminal', order: 7 },
  System: { label: t('System'), icon: 'settings', order: 8 },
};

// ── Skill icon mapping ─────────────────────────────────────────────────────

/** Map skill icon names (emoji fallback from backend) to Material Symbols */
export const SKILL_ICON_MAP: Record<string, string> = {
  '📧': 'mail',
  '✉️': 'mail',
  '💬': 'chat',
  '🔔': 'notifications',
  '📋': 'assignment',
  '📝': 'edit_note',
  '📅': 'calendar_today',
  '🔌': 'power',
  '🌐': 'language',
  '🔗': 'link',
  '🛠️': 'build',
  '💻': 'code',
  '🔧': 'build',
  '🎬': 'movie',
  '🎵': 'music_note',
  '📸': 'photo_camera',
  '🎙️': 'mic',
  '🏠': 'home',
  '💡': 'lightbulb',
  '⌨️': 'terminal',
  '🖥️': 'computer',
  '📦': 'inventory_2',
  '🔐': 'lock',
  '🔑': 'key',
  '🐙': 'code',
  '📊': 'analytics',
  '🤖': 'smart_toy',
  '⚡': 'bolt',
  '🔍': 'search',
};

// ── Icon helpers ───────────────────────────────────────────────────────────

export function msIcon(name: string, size: string = 'ms-sm'): string {
  return `<span class="ms ${size}">${name}</span>`;
}

export function skillIcon(raw: string): string {
  const mapped = SKILL_ICON_MAP[raw];
  return mapped ? msIcon(mapped) : msIcon('extension');
}

// ── Community catalogs ─────────────────────────────────────────────────────

export const POPULAR_REPOS = [
  { source: 'vercel-labs/agent-skills', label: 'Vercel Agent Skills' },
  { source: 'anthropics/skills', label: 'Anthropic Skills' },
];

export const POPULAR_TAGS = [
  'marketing',
  'trading',
  'supabase',
  'writing',
  'coding',
  'data analysis',
  'devops',
  'design',
  'finance',
  'research',
];

// ── PawzHub tier metadata ──────────────────────────────────────────────────

export const TIER_META: Record<string, { label: string; emoji: string; color: string }> = {
  skill: { label: t('Skill'), emoji: '🔵', color: '#3b82f6' },
  integration: { label: t('Integration'), emoji: '🟣', color: '#a855f7' },
  extension: { label: t('Extension'), emoji: '🟡', color: '#eab308' },
  mcp: { label: t('MCP Server'), emoji: '🔴', color: '#ef4444' },
};

export const PAWZHUB_CATEGORIES = [
  'all',
  'development',
  'productivity',
  'communication',
  'data',
  'devops',
  'finance',
  'marketing',
  'media',
  'research',
];

export function tierBadge(tier: string): string {
  const meta = TIER_META[tier] || TIER_META.skill;
  return `<span class="pawzhub-tier-badge" style="--tier-color:${meta.color}">${meta.emoji} ${meta.label}</span>`;
}

// ── Number formatting ──────────────────────────────────────────────────────

export function formatInstalls(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
