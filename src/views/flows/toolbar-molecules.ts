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
        <button class="flow-tb-btn flow-tb-btn-run${isRunning ? ' active' : ''}" data-action="run-flow" title="${isRunning ? t('flow.toolbar.running') : t('flow.toolbar.run')}">
          <span class="ms">${isRunning ? 'hourglass_top' : 'play_arrow'}</span>
        </button>
        <button class="flow-tb-btn flow-tb-btn-debug${isDebug ? ' active' : ''}" data-action="debug-flow" title="${isDebug ? t('flow.toolbar.debugging') : t('flow.toolbar.debug')}">
          <span class="ms">bug_report</span>
        </button>
        ${
          isDebug
            ? `
          <button class="flow-tb-btn flow-tb-btn-step" data-action="step-next" title="${t('flow.toolbar.stepNext')}">
            <span class="ms">skip_next</span>
          </button>
        `
            : ''
        }
        ${
          isRunning || isDebug
            ? `
          <button class="flow-tb-btn${isPaused ? ' active' : ''}" data-action="pause-flow" title="${isPaused ? t('flow.toolbar.resume') : t('flow.toolbar.pause')}">
            <span class="ms">${isPaused ? 'play_arrow' : 'pause'}</span>
          </button>
          <button class="flow-tb-btn flow-tb-btn-danger" data-action="stop-flow" title="${t('flow.toolbar.stop')}">
            <span class="ms">stop</span>
          </button>
        `
            : ''
        }
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        <button class="flow-tb-btn" data-action="add-trigger" title="${t('flow.toolbar.addTrigger')}">
          <span class="ms">${NODE_DEFAULTS.trigger.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-agent" title="${t('flow.toolbar.addAgent')}">
          <span class="ms">${NODE_DEFAULTS.agent.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-tool" title="${t('flow.toolbar.addTool')}">
          <span class="ms">${NODE_DEFAULTS.tool.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-condition" title="${t('flow.toolbar.addCondition')}">
          <span class="ms">${NODE_DEFAULTS.condition.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-data" title="${t('flow.toolbar.addData')}">
          <span class="ms">${NODE_DEFAULTS.data.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-code" title="${t('flow.toolbar.addCode')}">
          <span class="ms">${NODE_DEFAULTS.code.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-error" title="${t('flow.toolbar.addErrorHandler')}">
          <span class="ms">${NODE_DEFAULTS.error.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-output" title="${t('flow.toolbar.addOutput')}">
          <span class="ms">${NODE_DEFAULTS.output.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-http" title="${t('flow.toolbar.addHttpRequest')}">
          <span class="ms">${NODE_DEFAULTS.http.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-mcp-tool" title="${t('flow.toolbar.addMcpTool')}">
          <span class="ms">${NODE_DEFAULTS['mcp-tool'].icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-loop" title="${t('flow.toolbar.addLoop')}">
          <span class="ms">${NODE_DEFAULTS.loop.icon}</span>
        </button>
        <button class="flow-tb-btn" data-action="add-event-horizon" title="${t('flow.toolbar.addEventHorizon')}">
          <span class="ms">${NODE_DEFAULTS['event-horizon'].icon}</span>
        </button>
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        <button class="flow-tb-btn" data-action="auto-layout" title="${t('flow.toolbar.autoLayout')}">
          <span class="ms">auto_fix_high</span>
        </button>
        <button class="flow-tb-btn" data-action="fit-view" title="${t('flow.toolbar.fitView')}">
          <span class="ms">fit_screen</span>
        </button>
        <button class="flow-tb-btn" data-action="zoom-in" title="${t('flow.toolbar.zoomIn')}">
          <span class="ms">zoom_in</span>
        </button>
        <button class="flow-tb-btn" data-action="zoom-out" title="${t('flow.toolbar.zoomOut')}">
          <span class="ms">zoom_out</span>
        </button>
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        <button class="flow-tb-btn" data-action="undo" title="${t('flow.toolbar.undo')}">
          <span class="ms">undo</span>
        </button>
        <button class="flow-tb-btn" data-action="redo" title="${t('flow.toolbar.redo')}">
          <span class="ms">redo</span>
        </button>
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        <button class="flow-tb-btn" data-action="export-flow" title="${t('flow.toolbar.export')}">
          <span class="ms">download</span>
        </button>
        <button class="flow-tb-btn" data-action="import-flow" title="${t('flow.toolbar.import')}">
          <span class="ms">upload</span>
        </button>
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group">
        <button class="flow-tb-btn flow-tb-btn-danger" data-action="delete-selected" title="${t('flow.toolbar.deleteSelected')}">
          <span class="ms">delete</span>
        </button>
      </div>
      <div class="flow-toolbar-divider"></div>
      <div class="flow-toolbar-group flow-toolbar-view">
        <button class="flow-tb-btn" data-action="toggle-list" title="${t('flow.toolbar.toggleList')}">
          <span class="ms">left_panel_close</span>
        </button>
        <button class="flow-tb-btn" data-action="toggle-minimap" title="${t('flow.toolbar.toggleMinimap')}">
          <span class="ms">map</span>
        </button>
        <button class="flow-tb-btn" data-action="toggle-data-labels" title="${t('flow.toolbar.toggleDataLabels')}">
          <span class="ms">label</span>
        </button>
        <button class="flow-tb-btn" data-action="show-shortcuts" title="${t('flow.toolbar.showShortcuts')}">
          <span class="ms">keyboard</span>
        </button>
        <button class="flow-tb-btn" data-action="toggle-agent" title="${t('flow.toolbar.flowArchitectAgent')}">
          <span class="ms">smart_toy</span>
        </button>
        <button class="flow-tb-btn" data-action="toggle-panel" title="${t('flow.toolbar.togglePropertiesPanel')}">
          <span class="ms">right_panel_close</span>
        </button>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action!;
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
