// atoms.ts — Pure types, constants, and zero-dependency helpers
// NO pawEngine, NO document.*, NO Tauri imports allowed here

import { t } from '../../i18n';
import { brand } from '../../brand';

export interface Agent {
  id: string;
  name: string;
  avatar: string; // avatar ID (e.g. '5') or legacy emoji
  color: string;
  bio: string;
  model: string; // AI model to use
  template: 'general' | 'research' | 'creative' | 'technical' | 'custom';
  personality: {
    tone: 'casual' | 'balanced' | 'formal';
    initiative: 'reactive' | 'balanced' | 'proactive';
    detail: 'brief' | 'balanced' | 'thorough';
  };
  skills: string[];
  boundaries: string[];
  systemPrompt?: string; // Custom instructions
  createdAt: string;
  lastUsed?: string;
  source?: 'local' | 'backend'; // Where this agent comes from
  projectId?: string; // If backend-created, which project
  /** Phase A: auto-approve all tool calls (no HIL popups) */
  autoApproveAll?: boolean;
  /** Thinking level for reasoning models: 'none' | 'low' | 'normal' | 'high' */
  thinking_level?: string;
}

// Tool groups for the per-agent tool assignment UI
export const TOOL_GROUPS: {
  label: string;
  icon: string;
  tools: { id: string; name: string; desc: string }[];
}[] = [
  {
    label: t('Core'),
    icon: 'terminal',
    tools: [
      { id: 'exec', name: t('Run Commands'), desc: t('Execute shell commands') },
      { id: 'fetch', name: t('HTTP Fetch'), desc: t('Make HTTP requests') },
    ],
  },
  {
    label: t('Files'),
    icon: 'folder_open',
    tools: [
      { id: 'read_file', name: t('Read File'), desc: t('Read file contents') },
      { id: 'write_file', name: t('Write File'), desc: t('Create and edit files') },
      { id: 'list_directory', name: t('List Directory'), desc: t('Browse file listings') },
      { id: 'append_file', name: t('Append File'), desc: t('Add content to files') },
      { id: 'delete_file', name: t('Delete File'), desc: t('Remove files') },
    ],
  },
  {
    label: t('Web'),
    icon: 'language',
    tools: [
      { id: 'web_search', name: t('Web Search'), desc: t('Search the internet') },
      { id: 'web_read', name: t('Web Read'), desc: t('Read web page content') },
      { id: 'web_screenshot', name: t('Web Screenshot'), desc: t('Capture screenshots') },
      { id: 'web_browse', name: t('Web Browse'), desc: t('Interactive browsing') },
    ],
  },
  {
    label: t('Soul & Memory'),
    icon: 'psychology',
    tools: [
      { id: 'soul_read', name: t('Soul Read'), desc: t('Read persona files') },
      { id: 'soul_write', name: t('Soul Write'), desc: t('Write persona files') },
      { id: 'soul_list', name: t('Soul List'), desc: t('List persona files') },
      { id: 'memory_store', name: t('Memory Store'), desc: t('Save to long-term memory') },
      { id: 'memory_search', name: t('Memory Search'), desc: t('Recall from memory') },
      { id: 'self_info', name: t('Self Info'), desc: t('View own configuration') },
    ],
  },
  {
    label: t('Agents & Tasks'),
    icon: 'group',
    tools: [
      { id: 'update_profile', name: t('Update Profile'), desc: t('Modify agent profile') },
      { id: 'create_agent', name: t('Create Agent'), desc: t('Spawn new agents') },
      { id: 'agent_list', name: t('Agent List'), desc: t('List all agents') },
      { id: 'agent_skills', name: t('Agent Skills'), desc: t('View agent skills') },
      { id: 'agent_skill_assign', name: t('Assign Skill'), desc: t('Assign skills to agents') },
      { id: 'create_task', name: t('Create Task'), desc: t('Create new tasks') },
      { id: 'list_tasks', name: t('List Tasks'), desc: t('View task list') },
      { id: 'manage_task', name: t('Manage Task'), desc: t('Update/delete tasks') },
      { id: 'skill_search', name: t('Skill Search'), desc: t('Search community skills') },
      { id: 'skill_install', name: t('Skill Install'), desc: t('Install community skills') },
      { id: 'skill_list', name: t('Skill List'), desc: t('List installed skills') },
    ],
  },
  {
    label: t('Communication'),
    icon: 'chat',
    tools: [
      { id: 'telegram_send', name: t('Telegram Send'), desc: t('Send Telegram messages') },
      { id: 'telegram_read', name: t('Telegram Read'), desc: t('Read Telegram status') },
      { id: 'rest_api_call', name: t('REST API'), desc: t('Call REST APIs') },
      { id: 'webhook_send', name: t('Webhook'), desc: t('Send webhooks') },
      { id: 'image_generate', name: t('Image Generate'), desc: t('Generate images') },
    ],
  },
];

// Default agent templates
export const AGENT_TEMPLATES: Record<string, Partial<Agent>> = {
  general: {
    bio: 'A helpful all-purpose assistant',
    personality: { tone: 'balanced', initiative: 'balanced', detail: 'balanced' },
    skills: ['web_search', 'web_fetch', 'read', 'write'],
  },
  research: {
    bio: 'Deep research and analysis specialist',
    personality: { tone: 'formal', initiative: 'proactive', detail: 'thorough' },
    skills: ['web_search', 'web_fetch', 'read', 'write', 'browser'],
  },
  creative: {
    bio: 'Writing, brainstorming, and creative projects',
    personality: { tone: 'casual', initiative: 'proactive', detail: 'balanced' },
    skills: ['web_search', 'read', 'write', 'image'],
  },
  technical: {
    bio: 'Code, debugging, and technical problem-solving',
    personality: { tone: 'balanced', initiative: 'reactive', detail: 'thorough' },
    skills: ['read', 'write', 'edit', 'exec', 'web_search'],
  },
  custom: {
    bio: '',
    personality: { tone: 'balanced', initiative: 'balanced', detail: 'balanced' },
    skills: [],
  },
};

export const AVATAR_COLORS = [
  '#0073EA',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
];

// ── Avatars ────────────────────────────────────────────────────────────────
// Brand-provided avatar set. Falls back to the built-in OpenPawz sprites.
export const SPRITE_AVATARS = Array.from({ length: brand.avatarCount }, (_, i) => String(i + 1));
export const BRAND_LOGO_AVATAR = 'brand-logo';

/** Default avatar for the main Pawz agent */
export const DEFAULT_AVATAR = brand.defaultAvatar;

/** Check if avatar string is a numeric avatar ID vs a legacy emoji */
export function isAvatar(avatar: string): boolean {
  return /^\d+$/.test(avatar);
}

/** Render an agent avatar as an <img> or legacy emoji <span> */
export function spriteAvatar(avatar: string, size = 32): string {
  if (avatar === BRAND_LOGO_AVATAR) {
    return `<img src="${brand.logoUrl}" alt="" width="${size}" height="${size}" style="display:block;border-radius:50%">`;
  }
  if (isAvatar(avatar)) {
    // Clamp to available avatar range for the active brand.
    let id = parseInt(avatar, 10);
    if (id < 1 || id > SPRITE_AVATARS.length) id = ((id - 1) % SPRITE_AVATARS.length) + 1;
    return `<img src="${brand.avatarBaseUrl}/${id}.png" alt="" width="${size}" height="${size}" style="display:block;border-radius:50%">`;
  }
  // Legacy emoji fallback — escape to prevent XSS from config-injected values
  const safe = avatar
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return `<span style="font-size:${Math.round(size * 0.7)}px;line-height:1">${safe}</span>`;
}
