// src/components/agents-panel.ts — Agents view side panel + template marketplace logic
// Vanilla TS, no React. Populates the hero stats, side panel cards, and template grid.

import { kineticRow, kineticStagger } from './kinetic-row';
import { escHtml } from './helpers';
import { t } from '../i18n';
import { AgentTemplate } from '../types';
import { templateLoader } from '../engine/template-loader';

// ── Agent Template Management ─────────────────────────────────────────────
// Dynamically load templates from the backend

// ── Category metadata ──────────────────────────────────────────────────

const CATEGORY_META: Record<string, { icon: string; label: string; color: string }> = {
  productivity: { icon: 'work', label: t('Productivity'), color: 'var(--accent)' },
  engineering: { icon: 'code', label: t('Engineering'), color: '#8b5cf6' },
  creative: { icon: 'palette', label: t('Creative'), color: '#ec4899' },
  data: { icon: 'query_stats', label: t('Data & Research'), color: '#06b6d4' },
  communication: { icon: 'forum', label: t('Communication'), color: '#10b981' },
  security: { icon: 'shield', label: t('Security'), color: '#ef4444' },
  trading: { icon: 'trending_up', label: t('Trading'), color: '#f59e0b' },
};

// ── Render functions ───────────────────────────────────────────────────

/** Render the hero stats counters */
export function updateAgentsHeroStats(agents: { lastUsed?: string; model?: string }[]) {
  const total = agents.length;
  const active = agents.filter(
    (a) => a.lastUsed && Date.now() - new Date(a.lastUsed).getTime() < 600000,
  ).length;
  const models = new Set(agents.map((a) => a.model).filter(Boolean)).size;

  const elTotal = document.getElementById('agents-stat-total');
  const elActive = document.getElementById('agents-stat-active');
  const elModels = document.getElementById('agents-stat-models');

  if (elTotal) elTotal.textContent = String(total);
  if (elActive) elActive.textContent = String(active);
  if (elModels) elModels.textContent = String(models);
}

/** Render capabilities summary in side panel */
export function renderCapabilitiesList(agents: { skills: string[] }[]) {
  const el = document.getElementById('agents-capabilities-list');
  if (!el) return;

  // Count unique skills across all agents
  const skillCounts = new Map<string, number>();
  agents.forEach((a) => a.skills.forEach((s) => skillCounts.set(s, (skillCounts.get(s) || 0) + 1)));

  const topSkills = [...skillCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  if (topSkills.length === 0) {
    el.innerHTML = `<div class="agents-cap-empty">${t('No skills assigned yet')}</div>`;
    return;
  }

  el.innerHTML = topSkills
    .map(([skill, count]) => {
      const pct = Math.round((count / agents.length) * 100);
      return `<div class="agents-cap-row">
      <span class="agents-cap-name">${escHtml(_formatSkillName(skill))}</span>
      <div class="agents-cap-bar"><div class="agents-cap-fill" style="width:${pct}%"></div></div>
      <span class="agents-cap-count">${count}</span>
    </div>`;
    })
    .join('');
}

/** Render recent activity in side panel */
export function renderActivityList(agents: { name: string; lastUsed?: string }[]) {
  const el = document.getElementById('agents-activity-list');
  if (!el) return;

  const recent = agents
    .filter((a) => a.lastUsed)
    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    el.innerHTML = `<div class="agents-activity-empty">${t('No activity yet')}</div>`;
    return;
  }

  el.innerHTML = recent
    .map((a) => {
      const ago = _timeAgo(new Date(a.lastUsed!));
      return `<div class="agents-activity-row">
      <span class="ms agents-activity-icon">smart_toy</span>
      <span class="agents-activity-name">${escHtml(a.name)}</span>
      <span class="agents-activity-time">${ago}</span>
    </div>`;
    })
    .join('');
}

/** Render the template marketplace grid */
export async function renderTemplateGrid(onInstall: (templateId: string) => void) {
  const el = document.getElementById('agents-templates-grid');
  if (!el) return;

  // Show loading message while fetching templates
  el.innerHTML = `<div class="agents-tpl-loading">${t('Loading templates...')}</div>`;

  try {
    // Load templates from the backend via template loader  
    const templates = await templateLoader.loadTemplates();
    
    if (templates.length === 0) {
      // No templates available - show empty state
      el.innerHTML = `<div class="agents-tpl-empty">${t('No templates available')}</div>`;
      return;
    }
    
    // Group fetched templates by category
    const groupedTemplates = new Map<string, AgentTemplate[]>();
    templates.forEach((t) => {
      const list = groupedTemplates.get(t.category) || [];
      list.push(t);
      groupedTemplates.set(t.category, list);
    });

    // Header with sync and admin buttons
    const adminBtnHTML = window.appState?.userRole === 'admin' 
      ? `<button id="agents-manage-templates-btn" class="btn btn-outline" style="margin-right: 10px;">
          <span class="ms ms-sm">admin_panel_settings</span> ${t('Manage Templates')}
        </button>`
      : '';
      
    const syncBtnHTML = `<div class="agents-tpl-header">
      <h3 class="agents-tpl-title">${t('Template Library')}</h3>
      ${adminBtnHTML}
      <button id="agents-sync-templates-btn" class="btn btn-secondary">
        <span class="ms ms-sm">sync</span> <span id="sync-btn-text">${t('Sync Templates')}</span>
      </button>
    </div>`;

    let html = syncBtnHTML + '<div class="agents-tpl-body">';
    
    groupedTemplates.forEach((templates, cat) => {
      const meta = CATEGORY_META[cat] || { icon: 'category', label: cat, color: 'var(--text-muted)' };
      html += `<div class="agents-tpl-category">
        <div class="agents-tpl-cat-header">
          <span class="ms agents-tpl-cat-icon" style="color:${meta.color}">${meta.icon}</span>
          <span class="agents-tpl-cat-label">${meta.label}</span>
        </div>
        <div class="agents-tpl-cat-cards">
          ${templates
            .map(
              (tpl) => `
          <div class="agents-tpl-card k-row k-spring" data-template-id="${tpl.id}">
            ${(tpl.popularity > 50) ? `<span class="agents-tpl-popular">${t('Popular')}</span>` : ''}
            <span class="ms agents-tpl-card-icon" style="color:${meta.color}">${tpl.icon}</span>
            <div class="agents-tpl-card-name">${escHtml(tpl.name)}</div>
            <div class="agents-tpl-card-desc">${escHtml(tpl.description)}</div>
            <button class="agents-tpl-install-btn" data-tpl-id="${tpl.id}">
              <span class="ms ms-sm">download</span> ${t('Install')}
            </button>
          </div>`,
            )
            .join('')}
        </div>
      </div>`;
    });

    html += '</div>'; // Close agents-tpl-body

    el.innerHTML = html;

    // Bind install buttons
    el.querySelectorAll('.agents-tpl-install-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (btn as HTMLElement).getAttribute('data-tpl-id');
        if (id) onInstall(id);
      });
    });

    // Bind central sync button
    const syncButton = el.querySelector('#agents-sync-templates-btn');
    if (syncButton) {
      syncButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        const textSpan = syncButton.querySelector('#sync-btn-text');
        const originalText = textSpan?.textContent || 'Sync Templates';
        const syncIcon = syncButton.querySelector('.ms');
        
        // Visual feedback for syncing
        if (textSpan) textSpan.textContent = t('Syncing...');
        if (syncIcon) syncIcon.classList.add('rotating');
        syncButton.setAttribute('disabled', 'true');
        
        try {
          const result = await templateLoader.syncRemoteTemplates();
          
          // Display result notification
          const toastContainer = document.getElementById('toast-container');
          if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast toast-success';
            toast.style.display = 'block';
            toast.textContent = result.updatedCount && result.updatedCount > 0 
              ? `${t('Updated')} ${result.updatedCount} ${t('templates')}` 
              : (result.message || t('All templates are up-to-date'));
            
            toastContainer.appendChild(toast);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
              toast.remove();
            }, 3000);
          }
        } catch (error) {
          console.error('Template sync failed:', error);
          
          // Show error toast
          const toastContainer = document.getElementById('toast-container');
          if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast toast-error';
            toast.style.display = 'block';
            toast.textContent = t('Template sync failed');
            
            toastContainer.appendChild(toast);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
              toast.remove();
            }, 3000);
          }
        } finally {
          // Restore original button state
          if (textSpan) textSpan.textContent = originalText;
          if (syncIcon) syncIcon.classList.remove('rotating');
          syncButton.removeAttribute('disabled');
          
          // Re-render the grid to show any newly synced templates
          renderTemplateGrid(onInstall);
        }
      });
    }
    
    // Bind admin panel button (only if user has admin role)
    const adminButton = el.querySelector('#agents-manage-templates-btn');
    if (adminButton) {
      adminButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        await showTemplateManager();
      });
    }

    // Apply kinetic to template cards
    el.querySelectorAll('.agents-tpl-card').forEach((card) => {
      kineticRow(card as HTMLElement, { spring: true });
    });
  } catch (error) {
    console.error('[agents-panel] Failed to load templates:', error);
    // Show fallback content in case of loading error
    el.innerHTML = `<div class="agents-tpl-error">
      <p>${t('Failed to load templates')}</p>
      <button onclick="location.reload()" class="btn btn-secondary">${t('Retry')}</button>
    </div>`;
  }
}

/** Show admin template manager modal to manage existing templates */
export async function showTemplateManager() {
  // Load existing templates for the admin panel
  
  // Import the template editor only when needed to avoid circular deps - it will be loaded later in specific button handlers
  const templates = await templateLoader.loadTemplates();
  
  // For MVP, we'll implement a simple admin panel in a modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay agents-admin-panel-modal';
  modal.innerHTML = `
    <div class="modal-content agents-admin-modal" style="min-width: 900px; min-height: 600px;">
      <div class="modal-header">
        <h3 class="modal-title"><span class="ms ms-sm">admin_panel_settings</span> Manage Templates</h3>
        <button id="close-admin-modal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <h4>Template Library (${templates.length} templates)</h4>
          <button id="new-template-btn" class="btn btn-primary">
            <span class="ms ms-sm">add</span> New Template
          </button>
        </div>
        
        <div class="agents-admin-templates-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
          ${templates.map(tpl => `
            <div class="agents-admin-tpl-card" data-template-id="${tpl.id}" style="border: 1px solid var(--border); border-radius: 8px; padding: 15px; background: var(--surface);">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span class="ms agents-admin-tpl-icon" style="font-size: 24px; margin-right: 10px;">${tpl.icon}</span>
                <div>
                  <div class="agents-admin-tpl-name" style="font-weight: bold; font-size: 16px;">${escHtml(tpl.name)}</div>
                  <div class="agents-admin-tpl-category" style="font-size: 12px; color: var(--text-muted);">${CATEGORY_META[tpl.category]?.label || tpl.category}</div>
                </div>
              </div>
              <div class="agents-admin-tpl-version" style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">v${tpl.version}</div>
              <div class="agents-admin-tpl-popularity" style="font-size: 12px; color: var(--accent); margin-bottom: 15px;">
                Popularity: ${tpl.popularity}
              </div>
              <div class="agents-admin-tpl-actions" style="display: flex; gap: 10px;">
                <button class="btn btn-secondary btn-sm edit-template-btn" data-tpl-id="${tpl.id}">
                  <span class="ms ms-xs">edit</span> Edit
                </button>
                <button class="btn btn-danger btn-sm delete-template-btn" data-tpl-id="${tpl.id}">
                  <span class="ms ms-xs">delete</span> Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${templates.length === 0 ? `<p class="agents-admin-no-templates" style="text-align: center; color: var(--text-muted); padding: 40px 0;">No templates found. Create your first template!</p>` : ''}
      </div>
      
      <div class="modal-footer">
        <button id="close-admin-modal-footer" class="btn btn-secondary">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Bind events
  const closeButtons = modal.querySelectorAll('#close-admin-modal, #close-admin-modal-footer');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  });
  
  // Close when clicking on overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  // Bind new template button
  const newTemplateBtn = modal.querySelector('#new-template-btn');
  newTemplateBtn?.addEventListener('click', async () => {
    // Close the modal first
    document.body.removeChild(modal);
    
    // Import and use the template editor for a new template
    const { openNewTemplateEditor } = await import('../views/agents/template-editor');
    openNewTemplateEditor((newTemplate) => {
      // Refresh the template grid to show the new template
      // Note: This could call back to a refresh function if we had access to one
      alert(`Template "${newTemplate.name}" created successfully!`);
    });
  });
  
  // Bind edit buttons
  modal.querySelectorAll('.edit-template-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const templateId = (btn as HTMLElement).getAttribute('data-tpl-id');
      if (!templateId) return;
      
      const template = templates.find(tpl => tpl.id === templateId);
      if (!template) return;
      
      // Close the modal first
      document.body.removeChild(modal);
      
      // Open the template editor to edit
      const { openEditTemplateEditor } = await import('../views/agents/template-editor');
      openEditTemplateEditor(template, updatedTemplate => {
        alert(`Template "${updatedTemplate.name}" updated successfully!`);
      });
    });
  });
  
  // Bind delete buttons
  modal.querySelectorAll('.delete-template-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const templateId = (btn as HTMLElement).getAttribute('data-tpl-id');
      if (!templateId) return;
      
      if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
        return;
      }
      
      try {
        await templateLoader.deleteTemplate(templateId);
        // Remove the card visually
        const card = btn.closest('.agents-admin-tpl-card');
        if (card) {
          card.remove();
          
          // If no more templates, show the empty state message
          if (document.querySelectorAll('.agents-admin-tpl-card').length === 0) {
            const container = document.querySelector('.agents-admin-templates-grid');
            if (container) {
              container.innerHTML = '<p class="agents-admin-no-templates" style="text-align: center; color: var(--text-muted); padding: 40px 0;">No templates found. Create your first template!</p>';
            }
          }
          
          // Update the count in the header
          const templateCountHeader = document.querySelector('.agents-admin-templates-grid');
          if (templateCountHeader?.parentElement) {
            const headerText = templateCountHeader.parentElement.querySelector('h4');
            if (headerText) {
              const newCount = document.querySelectorAll('.agents-admin-tpl-card').length;
              headerText.textContent = `Template Library (${newCount} templates)`;
            }
          }
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
        alert(`Failed to delete template: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  });
}

/** Apply kinetic animations to all agents page sections */
export function initAgentsKinetic() {
  // Stagger the side panel cards
  const sidePanel = document.querySelector('.agents-side-panel');
  if (sidePanel) kineticStagger(sidePanel as HTMLElement, '.agents-panel-card');

  // Materialise the section cards
  document.querySelectorAll('.agents-section.k-materialise').forEach((el) => {
    kineticRow(el as HTMLElement, { materialise: true });
  });

  // Spring on hero stats
  document.querySelectorAll('.agents-hero-stat.k-spring').forEach((el) => {
    kineticRow(el as HTMLElement, { spring: true });
  });

  // Spring on panel cards
  document.querySelectorAll('.agents-panel-card.k-spring').forEach((el) => {
    kineticRow(el as HTMLElement, { spring: true, materialise: true });
  });
}

// ── Helpers ────────────────────────────────────────────────────────────

function _formatSkillName(id: string): string {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function _timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('just now');
  if (mins < 60) return `${mins}${t('m ago')}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${t('h ago')}`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return t('yesterday');
  return `${days}${t('d ago')}`;
}
