// ─────────────────────────────────────────────────────────────────────────────
// Flow Visualization Engine — Toolbar Molecules
// Toolbar HTML rendering and action dispatch (add nodes, zoom, layout, etc.).
// ─────────────────────────────────────────────────────────────────────────────

import { t } from '../../i18n';
import { type FlowNodeKind, NODE_DEFAULTS, createNode, snapToGrid, applyLayout } from './atoms';
import { getMoleculesState } from './molecule-state';
import {
  renderGraph,
  fitView,
  deleteSelected,
  getCanvasCenter,
  addNewNodeId,
  zoomIn,
  zoomOut,
} from './canvas-molecules';

// ── Toolbar Rendering ──────────────────────────────────────────────────────

let toolbarTooltipEl: HTMLDivElement | null = null;

function ensureToolbarTooltip() {
  if (toolbarTooltipEl?.isConnected) return toolbarTooltipEl;
  toolbarTooltipEl = document.createElement('div');
  toolbarTooltipEl.className = 'flow-toolbar-floating-tooltip';
  toolbarTooltipEl.setAttribute('role', 'tooltip');
  toolbarTooltipEl.hidden = true;
  document.body.appendChild(toolbarTooltipEl);
  return toolbarTooltipEl;
}

function hideToolbarTooltip() {
  if (!toolbarTooltipEl) return;
  toolbarTooltipEl.hidden = true;
}

function showToolbarTooltip(button: HTMLElement, label: string) {
  const tooltip = ensureToolbarTooltip();
  tooltip.textContent = label;
  tooltip.hidden = false;

  const rect = button.getBoundingClientRect();
  const gap = 10;
  const maxWidth = tooltip.offsetWidth;
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - maxWidth / 2, 8),
    window.innerWidth - maxWidth - 8,
  );
  const top = rect.bottom + gap;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function renderToolbarButton(
  icon: string,
  label: string,
  dataAction: string,
  extraClass = '',
) {
  const className = ['flow-tb-btn', extraClass].filter(Boolean).join(' ');
  return `
    <button class="${className}" data-action="${dataAction}" title="${label}" aria-label="${label}">
      <span class="ms">${icon}</span>
    </button>
  `;
}

export function renderToolbar(
  container: HTMLElement,
  runState?: { isRunning: boolean; isPaused: boolean; isDebug?: boolean },
) {
  const isRunning = runState?.isRunning ?? false;
  const isPaused = runState?.isPaused ?? false;
  const isDebug = runState?.isDebug ?? false;

  container.innerHTML = `
    <div class="flow-toolbar">
      <div class="flow-toolbar-group flow-toolbar-exec">
        ${renderToolbarButton(
          isRunning ? 'hourglass_top' : 'play_arrow',
          isRunning ? t('flow.toolbar.running') : t('flow.toolbar.run'),
          'run-flow',
          `flow-tb-btn-run${isRunning ? ' active' : ''}`,
        )}
        ${renderToolbarButton(
          'bug_report',
          isDebug ? t('flow.toolbar.debugging') : t('flow.toolbar.debug'),
          'debug-flow',
          `flow-tb-btn-debug${isDebug ? ' active' : ''}`,
        )}
        ${
          isDebug
            ? renderToolbarButton('skip_next', t('flow.toolbar.stepNext'), 'step-next', 'flow-tb-btn-step')
            : ''
        }
        ${
          isRunning || isDebug
            ? `
          ${renderToolbarButton(
            isPaused ? 'play_arrow' : 'pause',
            isPaused ? t('flow.toolbar.resume') : t('flow.toolbar.pause'),
            'pause-flow',
            isPaused ? 'active' : '',
          )}
          ${renderToolbarButton('stop', t('flow.toolbar.stop'), 'stop-flow', 'flow-tb-btn-danger')}
        `
            : ''
        }
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        ${renderToolbarButton(NODE_DEFAULTS.trigger.icon, t('flow.toolbar.addTrigger'), 'add-trigger')}
        ${renderToolbarButton(NODE_DEFAULTS.agent.icon, t('flow.toolbar.addAgent'), 'add-agent')}
        ${renderToolbarButton(NODE_DEFAULTS.tool.icon, t('flow.toolbar.addTool'), 'add-tool')}
        ${renderToolbarButton(NODE_DEFAULTS.condition.icon, t('flow.toolbar.addCondition'), 'add-condition')}
        ${renderToolbarButton(NODE_DEFAULTS.data.icon, t('flow.toolbar.addData'), 'add-data')}
        ${renderToolbarButton(NODE_DEFAULTS.code.icon, t('flow.toolbar.addCode'), 'add-code')}
        ${renderToolbarButton(NODE_DEFAULTS.error.icon, t('flow.toolbar.addErrorHandler'), 'add-error')}
        ${renderToolbarButton(NODE_DEFAULTS.output.icon, t('flow.toolbar.addOutput'), 'add-output')}
        ${renderToolbarButton(NODE_DEFAULTS.http.icon, t('flow.toolbar.addHttpRequest'), 'add-http')}
        ${renderToolbarButton(NODE_DEFAULTS['mcp-tool'].icon, t('flow.toolbar.addMcpTool'), 'add-mcp-tool')}
        ${renderToolbarButton(NODE_DEFAULTS.loop.icon, t('flow.toolbar.addLoop'), 'add-loop')}
        ${renderToolbarButton(
          NODE_DEFAULTS['event-horizon'].icon,
          t('flow.toolbar.addEventHorizon'),
          'add-event-horizon',
        )}
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        ${renderToolbarButton('auto_fix_high', t('flow.toolbar.autoLayout'), 'auto-layout')}
        ${renderToolbarButton('fit_screen', t('flow.toolbar.fitView'), 'fit-view')}
        ${renderToolbarButton('zoom_in', t('flow.toolbar.zoomIn'), 'zoom-in')}
        ${renderToolbarButton('zoom_out', t('flow.toolbar.zoomOut'), 'zoom-out')}
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        ${renderToolbarButton('undo', t('flow.toolbar.undo'), 'undo')}
        ${renderToolbarButton('redo', t('flow.toolbar.redo'), 'redo')}
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        ${renderToolbarButton('download', t('flow.toolbar.export'), 'export-flow')}
        ${renderToolbarButton('upload', t('flow.toolbar.import'), 'import-flow')}
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        ${renderToolbarButton('delete', t('flow.toolbar.deleteSelected'), 'delete-selected', 'flow-tb-btn-danger')}
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group flow-toolbar-view">
        ${renderToolbarButton('left_panel_close', t('flow.toolbar.toggleList'), 'toggle-list')}
        ${renderToolbarButton('map', t('flow.toolbar.toggleMinimap'), 'toggle-minimap')}
        ${renderToolbarButton('label', t('flow.toolbar.toggleDataLabels'), 'toggle-data-labels')}
        ${renderToolbarButton('keyboard', t('flow.toolbar.showShortcuts'), 'show-shortcuts')}
        ${renderToolbarButton('smart_toy', t('flow.toolbar.flowArchitectAgent'), 'toggle-agent')}
        ${renderToolbarButton('right_panel_close', t('flow.toolbar.togglePropertiesPanel'), 'toggle-panel')}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-action]').forEach((btn) => {
    const element = btn as HTMLElement;
    const label = element.getAttribute('aria-label') || element.getAttribute('title') || '';

    if (label) {
      element.addEventListener('mouseenter', () => showToolbarTooltip(element, label));
      element.addEventListener('mouseleave', hideToolbarTooltip);
      element.addEventListener('focus', () => showToolbarTooltip(element, label));
      element.addEventListener('blur', hideToolbarTooltip);
    }

    btn.addEventListener('click', () => {
      hideToolbarTooltip();
      const action = element.dataset.action!;
      handleToolbarAction(action);
    });
  });
}

function handleToolbarAction(action: string) {
  const _state = getMoleculesState();
  if (!_state) return;
  const graph = _state.getGraph();
  if (!graph) return;

  const addKinds: Record<string, FlowNodeKind> = {
    'add-trigger': 'trigger',
    'add-agent': 'agent',
    'add-tool': 'tool',
    'add-condition': 'condition',
    'add-data': 'data',
    'add-code': 'code',
    'add-error': 'error',
    'add-output': 'output',
    'add-http': 'http' as FlowNodeKind,
    'add-mcp-tool': 'mcp-tool' as FlowNodeKind,
    'add-loop': 'loop' as FlowNodeKind,
    'add-event-horizon': 'event-horizon' as FlowNodeKind,
  };

  if (action in addKinds) {
    const kind = addKinds[action];
    const center = getCanvasCenter();
    const node = createNode(
      kind,
      `${kind.charAt(0).toUpperCase() + kind.slice(1)} ${graph.nodes.length + 1}`,
      snapToGrid(center.x),
      snapToGrid(center.y),
    );
    addNewNodeId(node.id);
    graph.nodes.push(node);
    _state.setSelectedNodeId(node.id);
    _state.onGraphChanged();
    renderGraph();
    return;
  }

  switch (action) {
    case 'auto-layout':
      applyLayout(graph);
      _state.onGraphChanged();
      renderGraph();
      break;
    case 'fit-view':
      fitView();
      break;
    case 'zoom-in':
      zoomIn();
      break;
    case 'zoom-out':
      zoomOut();
      break;
    case 'delete-selected':
      deleteSelected();
      break;
    case 'undo':
      _state.onUndo?.();
      break;
    case 'redo':
      _state.onRedo?.();
      break;
    case 'export-flow':
      _state.onExport?.();
      break;
    case 'import-flow':
      _state.onImport?.();
      break;
    case 'toggle-minimap':
    case 'toggle-data-labels':
    case 'show-shortcuts':
    case 'toggle-panel':
    case 'toggle-list':
    case 'toggle-agent':
      // Handled by UI orchestrator in index.ts
      document.dispatchEvent(new CustomEvent('flow:toolbar', { detail: { action } }));
      break;
  }
}
