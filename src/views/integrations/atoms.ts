// src/views/integrations/atoms.ts — Pure types, constants, and helpers
//
// Atom-level: no DOM, no IPC, no side effects.

// ── Types ──────────────────────────────────────────────────────────────

export interface CredentialField {
  key: string; // "api_key"
  label: string; // "API Key"
  type: 'text' | 'password' | 'url' | 'select';
  placeholder?: string;
  required: boolean;
  helpText?: string;
}

export interface SetupStep {
  instruction: string;
  link?: string;
  tip?: string;
}

export interface SetupGuide {
  title: string;
  steps: SetupStep[];
  estimatedTime: string;
}

export type ServiceCategory =
  | 'communication'
  | 'development'
  | 'productivity'
  | 'crm'
  | 'commerce'
  | 'social'
  | 'cloud'
  | 'storage'
  | 'database'
  | 'analytics'
  | 'security'
  | 'ai'
  | 'voice'
  | 'content'
  | 'utility'
  | 'media'
  | 'smarthome'
  | 'trading'
  | 'system';

export interface ServiceDefinition {
  id: string;
  name: string;
  icon: string; // Material icon name
  color: string; // Brand accent color
  category: ServiceCategory;
  description: string;
  capabilities: string[];
  n8nNodeType: string; // e.g. "n8n-nodes-base.slack"
  credentialFields: CredentialField[];
  setupGuide: SetupGuide;
  queryExamples: string[];
  automationExamples: string[];
  docsUrl: string;
  popular: boolean;
  /** npm package name if this service needs a community node (not in n8n-nodes-base). */
  communityPackage?: string;
  /**
   * Auth type determines how the connect button behaves:
   *  - 'oauth'      → Tier 1: one-click PKCE with shipped Client ID
   *  - 'n8n-oauth'  → Tier 2: opens n8n credential UI for OAuth
   *  - 'rfc7591'    → Tier 3: dynamic client registration + PKCE
   *  - 'apikey'     → Tier 5: manual paste (default)
   */
  authType?: 'oauth' | 'n8n-oauth' | 'rfc7591' | 'apikey';
}

export interface ConnectedService {
  serviceId: string;
  connectedAt: string;
  lastUsed?: string;
  toolCount: number;
  status: 'connected' | 'error' | 'expired';
}

// ── Category metadata ──────────────────────────────────────────────────

export interface CategoryMeta {
  id: ServiceCategory;
  label: string;
  icon: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'communication', label: '沟通', icon: 'chat' },
  { id: 'development', label: '开发', icon: 'code' },
  { id: 'productivity', label: '效率', icon: 'edit_note' },
  { id: 'crm', label: 'CRM 与销售', icon: 'handshake' },
  { id: 'commerce', label: '电商', icon: 'shopping_cart' },
  { id: 'social', label: '社交媒体', icon: 'share' },
  { id: 'cloud', label: '云服务', icon: 'cloud' },
  { id: 'storage', label: '存储与文件', icon: 'folder' },
  { id: 'database', label: '数据库', icon: 'database' },
  { id: 'analytics', label: '分析', icon: 'bar_chart' },
  { id: 'security', label: '安全', icon: 'shield' },
  { id: 'ai', label: 'AI 与机器学习', icon: 'psychology' },
  { id: 'voice', label: '语音与视频', icon: 'call' },
  { id: 'content', label: '内容与 CMS', icon: 'article' },
  { id: 'utility', label: '工具', icon: 'build' },
  { id: 'media', label: '媒体', icon: 'music_note' },
  { id: 'smarthome', label: '智能家居', icon: 'home' },
  { id: 'trading', label: '交易', icon: 'candlestick_chart' },
  { id: 'system', label: '系统', icon: 'terminal' },
];

// ── Sort options ───────────────────────────────────────────────────────

export type SortOption = 'popular' | 'a-z' | 'category';

// ── Pure helpers ───────────────────────────────────────────────────────

export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  // Simple fuzzy: all chars in order
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function filterServices(
  services: ServiceDefinition[],
  query: string,
  category: ServiceCategory | 'all',
): ServiceDefinition[] {
  let result = services;
  if (category !== 'all') {
    result = result.filter((s) => s.category === category);
  }
  if (query.trim()) {
    result = result.filter(
      (s) =>
        fuzzyMatch(query, s.name) ||
        fuzzyMatch(query, s.description) ||
        fuzzyMatch(query, s.category),
    );
  }
  return result;
}

export function sortServices(services: ServiceDefinition[], sort: SortOption): ServiceDefinition[] {
  const copy = [...services];
  switch (sort) {
    case 'popular':
      return copy.sort(
        (a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || a.name.localeCompare(b.name),
      );
    case 'a-z':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'category':
      return copy.sort(
        (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
      );
    default:
      return copy;
  }
}

export function categoryLabel(cat: ServiceCategory): string {
  return CATEGORIES.find((c) => c.id === cat)?.label ?? cat;
}

export function categoryIcon(cat: ServiceCategory): string {
  return CATEGORIES.find((c) => c.id === cat)?.icon ?? 'extension';
}
