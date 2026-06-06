// src/views/integrations/automations/atoms.ts — Pure types & helpers
//
// Atom-level: no DOM, no IPC, no side effects.

// ── Types ──────────────────────────────────────────────────────────────

/** A single trigger configuration for a template. */
export interface TemplateTrigger {
  type: 'schedule' | 'webhook' | 'event' | 'manual';
  label: string; // "Every Friday at 5 PM", "On new deal"
  cron?: string; // "0 17 * * 5" for scheduled triggers
  eventSource?: string; // service id that fires the event
}

/** A step in the automation workflow. */
export interface TemplateStep {
  serviceId: string; // "hubspot", "slack", etc.
  action: string; // "Get closed deals", "Post message"
  icon: string; // Material icon name
}

/** A pre-built automation template. */
export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  trigger: TemplateTrigger;
  steps: TemplateStep[];
  requiredServices: string[]; // ["hubspot", "slack"]
  tags: string[]; // ["popular", "sales"]
  estimatedSetup: string; // "30 seconds"
}

/** An active (deployed) automation. */
export interface ActiveAutomation {
  id: string;
  templateId?: string; // null if custom-built
  name: string;
  description: string;
  trigger: TemplateTrigger;
  steps: TemplateStep[];
  services: string[];
  status: AutomationStatus;
  createdAt: string;
  lastRunAt?: string;
  lastRunResult?: 'success' | 'error' | 'skipped';
  lastRunDetails?: string;
  runCount: number;
}

export type AutomationStatus = 'active' | 'paused' | 'error' | 'draft';

export type TemplateCategory =
  | 'alerts'
  | 'reporting'
  | 'sync'
  | 'onboarding'
  | 'productivity'
  | 'devops'
  | 'marketing'
  | 'support';

// ── Category metadata ──────────────────────────────────────────────────

export interface TemplateCategoryMeta {
  id: TemplateCategory;
  label: string;
  icon: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategoryMeta[] = [
  { id: 'alerts', label: '提醒', icon: 'notifications_active' },
  { id: 'reporting', label: '报告', icon: 'bar_chart' },
  { id: 'sync', label: '同步', icon: 'sync' },
  { id: 'onboarding', label: '入门', icon: 'waving_hand' },
  { id: 'productivity', label: '效率', icon: 'bolt' },
  { id: 'devops', label: '运维', icon: 'terminal' },
  { id: 'marketing', label: '营销', icon: 'campaign' },
  { id: 'support', label: '支持', icon: 'support_agent' },
];

// ── Pure helpers ───────────────────────────────────────────────────────

/** Check which required services are connected. */
export function checkRequirements(
  template: AutomationTemplate,
  connectedIds: Set<string>,
): { met: string[]; missing: string[] } {
  const met: string[] = [];
  const missing: string[] = [];
  for (const sid of template.requiredServices) {
    if (connectedIds.has(sid)) met.push(sid);
    else missing.push(sid);
  }
  return { met, missing };
}

/** Filter templates by service, category, or search. */
export function filterTemplates(
  templates: AutomationTemplate[],
  opts: {
    serviceId?: string;
    category?: TemplateCategory | 'all';
    query?: string;
  },
): AutomationTemplate[] {
  let result = templates;
  if (opts.serviceId) {
    result = result.filter((t) => t.requiredServices.includes(opts.serviceId!));
  }
  if (opts.category && opts.category !== 'all') {
    result = result.filter((t) => t.category === opts.category);
  }
  if (opts.query?.trim()) {
    const q = opts.query.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q)),
    );
  }
  return result;
}

/** Format a trigger label for display. */
export function triggerLabel(trigger: TemplateTrigger): string {
  switch (trigger.type) {
    case 'schedule':
      return `📅 ${trigger.label}`;
    case 'webhook':
      return `🔗 ${trigger.label}`;
    case 'event':
      return `⚡ ${trigger.label}`;
    case 'manual':
      return `▶️ ${trigger.label}`;
    default:
      return trigger.label;
  }
}

/** Human-readable status badge. */
export function statusBadge(status: AutomationStatus): { label: string; icon: string } {
  switch (status) {
    case 'active':
      return { label: '运行中', icon: 'play_circle' };
    case 'paused':
      return { label: '已暂停', icon: 'pause_circle' };
    case 'error':
      return { label: '错误', icon: 'error' };
    case 'draft':
      return { label: '草稿', icon: 'edit_note' };
    default:
      return { label: status, icon: 'help' };
  }
}

/** Sort automations: active first, then by last run. */
export function sortAutomations(items: ActiveAutomation[]): ActiveAutomation[] {
  return [...items].sort((a, b) => {
    // Active before paused before error
    const order: Record<AutomationStatus, number> = { active: 0, draft: 1, paused: 2, error: 3 };
    const diff = (order[a.status] ?? 9) - (order[b.status] ?? 9);
    if (diff !== 0) return diff;
    // Most recently run first
    if (a.lastRunAt && b.lastRunAt) return b.lastRunAt.localeCompare(a.lastRunAt);
    if (a.lastRunAt) return -1;
    if (b.lastRunAt) return 1;
    return a.name.localeCompare(b.name);
  });
}
