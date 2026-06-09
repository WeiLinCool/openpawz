// Unified Skill Card — Shared component for Skills and Integrations
// Phase 3: Consistent card design with status dots, type badges,
// capability badges, and adaptive primary actions.
//
// This is the single source of truth for rendering any skill-type item:
// - Built-in skills (EngineSkillStatus)
// - Community/marketplace entries
// - MCP servers (McpServerConfig + McpServerStatus)
// - Community skills (CommunitySkill / DiscoveredSkill)

import { escHtml } from '../helpers';
import { t } from '../../i18n';

// ── Types ──────────────────────────────────────────────────────────────────

/** Normalised card data — every source maps into this before rendering. */
export interface SkillCardData {
  id: string;
  name: string;
  description: string;
  icon: string; // Material Symbol name
  author?: string;
  version?: string;

  // Type & status
  tier: 'skill' | 'integration' | 'extension' | 'mcp';
  status: CardStatus;
  statusLabel: string;

  // Capability flags
  toolCount: number;
  hasWidget: boolean;
  hasMcp: boolean;
  verified: boolean;
  source?: 'builtin' | 'toml' | 'community' | 'pawzhub';

  // Custom badges beyond the standard ones
  extraBadges?: string[];

  // Primary action
  action: CardAction;

  // Optional detail slots (expand/collapse)
  detailsHtml?: string;

  // Data attributes for event binding
  dataAttrs?: Record<string, string>;
}

export type CardStatus =
  | 'active' // 🟢 green — running, connected, configured
  | 'warning' // 🟡 yellow — needs setup (missing creds/binaries/env)
  | 'disabled' // ⚪ grey — installed but off
  | 'error' // 🔴 red — disconnected, binary missing, failed
  | 'available'; // ⬡ neutral — not installed yet (marketplace)

export type CardAction =
  | { type: 'toggle'; checked: boolean; skillId: string }
  | { type: 'install'; skillId: string; sourceRepo?: string; source?: string; path?: string }
  | { type: 'installed' }
  | { type: 'configure'; skillId: string }
  | { type: 'connect'; serverId: string }
  | { type: 'disconnect'; serverId: string }
  | { type: 'custom'; html: string }
  | { type: 'none' };

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CardStatus, { icon: string; cssClass: string; label: string }> = {
  active: { icon: 'check_circle', cssClass: 'uc-status-active', label: t('Active') },
  warning: { icon: 'warning', cssClass: 'uc-status-warning', label: t('Needs setup') },
  disabled: { icon: 'radio_button_unchecked', cssClass: 'uc-status-disabled', label: t('Disabled') },
  error: { icon: 'error', cssClass: 'uc-status-error', label: t('Error') },
  available: { icon: 'cloud_download', cssClass: 'uc-status-available', label: t('Available') },
};

const TIER_CONFIG: Record<string, { label: string; cssClass: string }> = {
  skill: { label: t('Skill'), cssClass: 'uc-tier-skill' },
  integration: { label: t('Integration'), cssClass: 'uc-tier-integration' },
  extension: { label: t('Extension'), cssClass: 'uc-tier-extension' },
  mcp: { label: t('MCP Server'), cssClass: 'uc-tier-mcp' },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function ms(name: string): string {
  return `<span class="ms ms-sm">${name}</span>`;
}

// ── Render ─────────────────────────────────────────────────────────────────

/**
 * Render a unified skill card.
 * Used by Skills tabs, Integrations page, and community browser.
 */
export function renderSkillCard(data: SkillCardData): string {
  const statusCfg = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.disabled;
  const tierCfg = TIER_CONFIG[data.tier] ?? TIER_CONFIG.skill;

  // Data attributes
  const attrs = data.dataAttrs
    ? Object.entries(data.dataAttrs)
        .map(([k, v]) => `data-${k}="${escHtml(v)}"`)
        .join(' ')
    : '';

  // Active highlight
  const activeClass = data.status === 'active' ? ' uc-card-active' : '';

  // Author / version line
  const authorVersion: string[] = [];
  if (data.author) authorVersion.push(`by ${escHtml(data.author)}`);
  if (data.version) authorVersion.push(`v${escHtml(data.version)}`);
  const subline = authorVersion.length
    ? `<span class="uc-card-subline">${authorVersion.join(' · ')}</span>`
    : '';

  // Capability badges
  const capBadges: string[] = [];
  if (data.toolCount > 0) {
    capBadges.push(
      `<span class="uc-cap-badge">${ms('build')} ${t('tool')} ${data.toolCount}${data.toolCount !== 1 ? 's' : ''}</span>`,
    );
  }
  if (data.hasWidget) {
    capBadges.push(`<span class="uc-cap-badge">${ms('dashboard')} ${t('Widget')}</span>`);
  }
  if (data.hasMcp) {
    capBadges.push(`<span class="uc-cap-badge">${ms('dns')} MCP</span>`);
  }
  if (data.verified) {
    capBadges.push(`<span class="uc-cap-badge uc-cap-verified">${ms('verified')} ${t('Verified')}</span>`);
  }
  if (data.source === 'community' || data.source === 'toml') {
    capBadges.push(`<span class="uc-cap-badge uc-cap-community">${ms('public')} Community</span>`);
  }
  if (data.extraBadges) {
    for (const b of data.extraBadges) capBadges.push(`<span class="uc-cap-badge">${b}</span>`);
  }

  // Action button
  const actionHtml = renderAction(data.action);

  // Expand/collapse details
  const detailsHtml = data.detailsHtml
    ? `<details class="uc-card-details">
        <summary class="uc-card-details-toggle">${ms('expand_more')} Details</summary>
        <div class="uc-card-details-body">${data.detailsHtml}</div>
       </details>`
    : '';

  return `
  <div class="uc-card${activeClass}" ${attrs}>
    <div class="uc-card-header">
      <div class="uc-card-identity">
        <span class="uc-card-icon">${ms(data.icon)}</span>
        <div class="uc-card-titles">
          <strong class="uc-card-name">${escHtml(data.name)}</strong>
          ${subline}
        </div>
      </div>
      <div class="uc-card-status ${statusCfg.cssClass}">
        ${ms(statusCfg.icon)}
        <span>${data.statusLabel || statusCfg.label}</span>
      </div>
    </div>

    <p class="uc-card-desc">${escHtml(data.description)}</p>

    <div class="uc-card-badges">
      <span class="uc-tier-badge ${tierCfg.cssClass}">${tierCfg.label}</span>
      ${capBadges.join('')}
    </div>

    ${detailsHtml}

    <div class="uc-card-footer">
      ${actionHtml}
    </div>
  </div>`;
}

// ── Action renderers ───────────────────────────────────────────────────────

function renderAction(action: CardAction): string {
  switch (action.type) {
    case 'toggle':
      return `<label class="skill-toggle-label">
        <input type="checkbox" class="uc-toggle" data-skill="${escHtml(action.skillId)}" ${action.checked ? 'checked' : ''} />
        ${t('Enable')}
      </label>`;
    case 'install':
      return `<button class="btn btn-primary btn-sm uc-install-btn"
        data-skill-id="${escHtml(action.skillId)}"
        ${action.sourceRepo ? `data-source-repo="${escHtml(action.sourceRepo)}"` : ''}
        ${action.source ? `data-source="${escHtml(action.source)}"` : ''}
        ${action.path ? `data-path="${escHtml(action.path)}"` : ''}
        data-name="${escHtml(action.skillId)}">
        ${ms('download')} ${t('Install')}
      </button>`;
    case 'installed':
      return `<span class="uc-installed-label">${ms('check_circle')} ${t('Active')}</span>`;
    case 'configure':
      return `<button class="btn btn-ghost btn-sm uc-configure-btn" data-skill="${escHtml(action.skillId)}">
        ${ms('settings')} ${t('Configure')}
      </button>`;
    case 'connect':
      return `<button class="btn btn-primary btn-sm uc-connect-btn" data-server-id="${escHtml(action.serverId)}">
        ${ms('power')} ${t('Connect')}
      </button>`;
    case 'disconnect':
      return `<button class="btn btn-ghost btn-sm uc-disconnect-btn" data-server-id="${escHtml(action.serverId)}">
        ${t('Disconnect')}
      </button>`;
    case 'custom':
      return action.html;
    case 'none':
    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  Adapters — Convert domain types into SkillCardData
// ═══════════════════════════════════════════════════════════════════════════

import type {
  EngineSkillStatus,
  PawzHubEntry,
  McpServerConfig,
  McpServerStatus,
  DiscoveredSkill,
  CommunitySkill,
} from '../../engine';

// Icon mapping (emoji → Material Symbol)
const ICON_MAP: Record<string, string> = {
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

function resolveIcon(raw: string): string {
  return ICON_MAP[raw] ?? 'extension';
}

/** Determine status for an EngineSkillStatus. */
function engineSkillStatus(s: EngineSkillStatus): { status: CardStatus; label: string } {
  if (s.is_ready) return { status: 'active', label: t('Ready') };
  if (s.enabled && s.missing_binaries.length > 0)
    return { status: 'error', label: t('Missing binaries') };
  if (s.enabled && s.missing_credentials.length > 0)
    return { status: 'warning', label: t('Missing credentials') };
  if (s.enabled && s.missing_env_vars.length > 0)
    return { status: 'warning', label: t('Missing env vars') };
  if (s.enabled) return { status: 'warning', label: t('Setup incomplete') };
  return { status: 'disabled', label: t('Disabled') };
}

/** Adapt an EngineSkillStatus (built-in or TOML) to SkillCardData. */
export function fromEngineSkill(s: EngineSkillStatus): SkillCardData {
  const { status, label } = engineSkillStatus(s);
  const isToml = s.source === 'toml';

  return {
    id: s.id,
    name: s.name,
    description: s.description,
    icon: resolveIcon(s.icon),
    author: s.author,
    version: s.version,
    tier: s.tier as SkillCardData['tier'],
    status,
    statusLabel: label,
    toolCount: s.tool_names?.length ?? 0,
    hasWidget: !!s.has_widget,
    hasMcp: !!s.has_mcp,
    verified: false,
    source: isToml ? 'toml' : 'builtin',
    action: { type: 'toggle', checked: s.enabled, skillId: s.id },
    dataAttrs: { 'skill-id': s.id },
  };
}

/** Adapt a PawzHub registry entry to SkillCardData. */
export function fromPawzHubEntry(entry: PawzHubEntry): SkillCardData {
  const status: CardStatus = entry.installed ? 'active' : 'available';
  const action: CardAction = entry.installed
    ? { type: 'installed' }
    : { type: 'install', skillId: entry.id, sourceRepo: entry.source_repo };

  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    icon: 'extension',
    author: entry.author,
    version: entry.version,
    tier: (entry.tier as SkillCardData['tier']) || 'skill',
    status,
    statusLabel: entry.installed ? t('Active') : t('Available'),
    toolCount: 0,
    hasWidget: entry.has_widget,
    hasMcp: entry.has_mcp,
    verified: entry.verified,
    source: 'pawzhub',
    action,
    dataAttrs: { 'pawzhub-id': entry.id },
  };
}

/** Adapt an MCP server to SkillCardData. */
export function fromMcpServer(server: McpServerConfig, status?: McpServerStatus): SkillCardData {
  const connected = status?.connected ?? false;
  const toolCount = status?.tool_count ?? 0;
  const transport = server.transport === 'stdio' ? t('Stdio') : t('SSE');
  const endpoint =
    server.transport === 'stdio' ? `${server.command} ${server.args.join(' ')}`.trim() : server.url;

  let cardStatus: CardStatus;
  let statusLabel: string;
  let action: CardAction;

  if (connected) {
    cardStatus = 'active';
    statusLabel = `${t('Connected')} (${toolCount} ${t('tools')})`;
    action = { type: 'disconnect', serverId: server.id };
  } else if (server.enabled) {
    cardStatus = 'error';
    statusLabel = t('Disconnected');
    action = { type: 'connect', serverId: server.id };
  } else {
    cardStatus = 'disabled';
    statusLabel = t('Disabled');
    action = { type: 'connect', serverId: server.id };
  }

  const extraBadges = [
    `${ms('terminal')} ${transport}`,
    `<code style="font-size:10px">${escHtml(endpoint)}</code>`,
  ];

  const errorDetail = status?.error
    ? `<div style="color:var(--accent-danger);font-size:11px;margin-top:4px">${ms('error')} ${escHtml(status.error)}</div>`
    : undefined;

  return {
    id: server.id,
    name: server.name,
    description: `${toolCount} ${t('tool')}${toolCount !== 1 ? 's' : ''} ${t('available')}`,
    icon: 'dns',
    tier: 'mcp',
    status: cardStatus,
    statusLabel,
    toolCount,
    hasWidget: false,
    hasMcp: true,
    verified: false,
    extraBadges,
    action,
    detailsHtml: errorDetail,
    dataAttrs: { 'mcp-id': server.id },
  };
}

/** Adapt a discovered community skill to SkillCardData. */
export function fromDiscoveredSkill(skill: DiscoveredSkill): SkillCardData {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description || t('No description'),
    icon: 'extension',
    tier: 'skill',
    status: skill.installed ? 'active' : 'available',
    statusLabel: skill.installed ? t('Installed') : t('Available'),
    toolCount: 0,
    hasWidget: false,
    hasMcp: false,
    verified: false,
    source: 'community',
    action: skill.installed
      ? { type: 'installed' }
      : { type: 'install', skillId: skill.id, source: skill.source, path: skill.path },
    extraBadges:
      skill.installs > 0 ? [`${ms('download')} ${formatInstallsShort(skill.installs)}`] : undefined,
    dataAttrs: { 'community-id': skill.id },
  };
}

/** Adapt an installed community skill to SkillCardData. */
export function fromCommunitySkill(skill: CommunitySkill): SkillCardData {
  const agentLabel =
    !skill.agent_ids || skill.agent_ids.length === 0 ? t('All Agents') : skill.agent_ids.join(', ');

  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    icon: 'extension',
    tier: 'skill',
    status: skill.enabled ? 'active' : 'disabled',
    statusLabel: skill.enabled ? t('Enabled') : t('Disabled'),
    toolCount: 0,
    hasWidget: false,
    hasMcp: false,
    verified: false,
    source: 'community',
    action: { type: 'toggle', checked: skill.enabled, skillId: skill.id },
    extraBadges: [`${ms('person')} ${agentLabel}`],
    detailsHtml: skill.instructions
      ? `<pre style="font-size:11px;background:var(--bg-surface);border-radius:6px;padding:8px;margin:0;max-height:160px;overflow:auto;white-space:pre-wrap">${escHtml(skill.instructions.length > 300 ? `${skill.instructions.substring(0, 300)}...` : skill.instructions)}</pre>`
      : undefined,
    dataAttrs: { 'community-id': skill.id },
  };
}

function formatInstallsShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
