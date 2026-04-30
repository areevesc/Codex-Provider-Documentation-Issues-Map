import type cytoscape from 'cytoscape';

const fallbackColors = {
  surface: '#0f1115',
  surfacePanel: '#1c2230',
  line: '#2a3245',
  ink: '#e6ecf5',
  specialist: '#6366f1',
  clinic: '#3b82f6',
  provider: '#10b981',
  label: '#eab308',
} as const;

function cssColor(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const raw = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw ? `rgb(${raw})` : fallback;
}

/**
 * Cytoscape stylesheet. Nodes are shaped and colored by type; selection
 * emphasizes the focused node + its neighborhood, and fades everything else.
 */
export function createGraphStylesheet(): cytoscape.StylesheetJson {
  const colors = {
    surface: cssColor('--color-surface', fallbackColors.surface),
    surfacePanel: cssColor('--color-surface-panel', fallbackColors.surfacePanel),
    line: cssColor('--color-line', fallbackColors.line),
    ink: cssColor('--color-ink', fallbackColors.ink),
    specialist: cssColor('--color-accent-specialist', fallbackColors.specialist),
    clinic: cssColor('--color-accent-clinic', fallbackColors.clinic),
    provider: cssColor('--color-accent-provider', fallbackColors.provider),
    label: cssColor('--color-accent-label', fallbackColors.label),
  };

  return [
  // ── Base node ─────────────────────────────────────────────────────────
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 6,
      color: colors.ink,
      'font-size': 10,
      'font-weight': 500,
      'text-outline-width': 2,
      'text-outline-color': colors.surface,
      'background-color': colors.surfacePanel,
      'border-width': 2,
      'border-color': colors.line,
      width: 28,
      height: 28,
      'transition-property': 'opacity, border-color, background-color, border-width',
      'transition-duration': 150,
    },
  },

  // ── Node types ────────────────────────────────────────────────────────
  {
    selector: 'node[type="specialist"]',
    style: {
      'background-color': colors.specialist,
      'border-color': colors.specialist,
      width: 44,
      height: 44,
      'font-size': 12,
      'font-weight': 600,
    },
  },
  {
    selector: 'node[type="clinic"]',
    style: {
      'background-color': colors.clinic,
      'border-color': colors.clinic,
      shape: 'round-rectangle',
      width: 36,
      height: 36,
    },
  },
  {
    selector: 'node[type="provider"]',
    style: {
      'background-color': colors.provider,
      'border-color': colors.provider,
      width: 24,
      height: 24,
    },
  },
  {
    selector: 'node[type="label"]',
    style: {
      'background-color': colors.label,
      'border-color': colors.label,
      shape: 'diamond',
      width: 30,
      height: 30,
    },
  },

  // ── Edges ─────────────────────────────────────────────────────────────
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      width: 1.2,
      'line-color': colors.line,
      'target-arrow-shape': 'none',
      opacity: 0.75,
      'transition-property': 'opacity, line-color, width',
      'transition-duration': 150,
    },
  },
  {
    selector: 'edge[kind="provider-label"]',
    style: {
      'line-style': 'dashed',
      'line-dash-pattern': [4, 3],
    },
  },

  // ── Focus / fade states ───────────────────────────────────────────────
  {
    selector: 'node.focused',
    style: {
      'border-color': colors.ink,
      'border-width': 3,
      opacity: 1,
      'z-index': 20,
    },
  },
  {
    selector: 'node.focused-primary',
    style: {
      'border-color': colors.ink,
      'border-width': 4,
      'z-index': 21,
    },
  },
  {
    selector: 'edge.focused',
    style: {
      'line-color': colors.ink,
      opacity: 1,
      width: 2,
      'z-index': 20,
    },
  },
  {
    selector: '.faded',
    style: {
      opacity: 0.12,
    },
  },
  ];
}
