import type cytoscape from 'cytoscape';

/**
 * Cytoscape stylesheet. Nodes are shaped and colored by type; selection
 * emphasizes the focused node + its neighborhood, and fades everything else.
 */
export const graphStylesheet: cytoscape.StylesheetJson = [
  // ── Base node ─────────────────────────────────────────────────────────
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 6,
      color: '#e6ecf5',
      'font-size': 10,
      'font-weight': 500,
      'text-outline-width': 2,
      'text-outline-color': '#0f1115',
      'background-color': '#1c2230',
      'border-width': 2,
      'border-color': '#2a3245',
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
      'background-color': '#a78bfa',
      'border-color': '#c4b5fd',
      width: 44,
      height: 44,
      'font-size': 12,
      'font-weight': 600,
    },
  },
  {
    selector: 'node[type="clinic"]',
    style: {
      'background-color': '#60a5fa',
      'border-color': '#93c5fd',
      shape: 'round-rectangle',
      width: 36,
      height: 36,
    },
  },
  {
    selector: 'node[type="provider"]',
    style: {
      'background-color': '#34d399',
      'border-color': '#6ee7b7',
      width: 24,
      height: 24,
    },
  },
  {
    selector: 'node[type="label"]',
    style: {
      'background-color': '#fbbf24',
      'border-color': '#fcd34d',
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
      'line-color': '#2a3245',
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
      'border-color': '#ffffff',
      'border-width': 3,
      opacity: 1,
      'z-index': 20,
    },
  },
  {
    selector: 'node.focused-primary',
    style: {
      'border-color': '#ffffff',
      'border-width': 4,
      'z-index': 21,
    },
  },
  {
    selector: 'edge.focused',
    style: {
      'line-color': '#e6ecf5',
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
