import type { EnterpriseStatus } from './engine';

export const ENTERPRISE_RESTRICTED_VIEWS = ['integrations', 'channels', 'foundry'] as const;

const restrictedViewSet = new Set<string>(ENTERPRISE_RESTRICTED_VIEWS);

export function isEnterpriseMode(status: EnterpriseStatus): boolean {
  return Boolean(status.enterprise_build_mode || status.enabled);
}

// 加载企业插件功能关闭
export function isEnterpriseRestrictedView(viewName: string): boolean {
  return restrictedViewSet.has(viewName);
}

export function applyEnterpriseNavigationPolicy(status: EnterpriseStatus): void {
  const enterpriseMode = isEnterpriseMode(status);
  document.body.classList.toggle('enterprise-plugin-active', enterpriseMode);

  for (const view of ENTERPRISE_RESTRICTED_VIEWS) {
    const navItem = document.querySelector<HTMLElement>(`.nav-item[data-view="${view}"]`);
    if (!navItem) continue;
    navItem.hidden = enterpriseMode;
    navItem.toggleAttribute('aria-disabled', enterpriseMode);
    navItem.style.display = enterpriseMode ? 'none' : '';
    navItem.style.pointerEvents = enterpriseMode ? 'none' : '';
  }
}
