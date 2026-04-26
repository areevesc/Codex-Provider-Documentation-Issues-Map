import { useEffect, useRef } from 'react';
import type cytoscape from 'cytoscape';
import type { GraphElements } from '@/lib/graphBuilder';

/**
 * Diff-sync Cytoscape elements from a declarative element list.
 *
 * Strategy:
 *  - Remove nodes/edges no longer in the list.
 *  - Add new nodes/edges.
 *  - For nodes that already existed, update their `data` (label can change).
 *  - On any topology change (or first load), re-run the dagre hierarchical
 *    layout. Dagre is deterministic so there is no need to save/restore
 *    positions — the layout is always the same for a given graph structure.
 */
export function useGraphSync(
  cyRef: React.MutableRefObject<cytoscape.Core | null>,
  elements: GraphElements,
) {
  const hasLaidOut = useRef(false);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const newNodeIds = new Set(elements.nodes.map((n) => n.id));
    const newEdgeIds = new Set(elements.edges.map((e) => e.id));

    // Remove anything that's no longer present.
    const toRemove = cy.collection();
    cy.nodes().forEach((n) => {
      if (!newNodeIds.has(n.id())) toRemove.merge(n);
    });
    cy.edges().forEach((e) => {
      if (!newEdgeIds.has(e.id())) toRemove.merge(e);
    });
    if (toRemove.length > 0) toRemove.remove();

    // Update existing nodes' data (label could have changed).
    for (const node of elements.nodes) {
      const existing = cy.getElementById(node.id);
      if (existing.nonempty()) {
        existing.data(node);
      }
    }

    // Add new nodes and edges.
    const toAdd: cytoscape.ElementDefinition[] = [];
    for (const node of elements.nodes) {
      if (cy.getElementById(node.id).empty()) {
        toAdd.push({ group: 'nodes', data: { ...node } });
      }
    }
    for (const edge of elements.edges) {
      if (cy.getElementById(edge.id).empty()) {
        toAdd.push({ group: 'edges', data: { ...edge } });
      }
    }
    if (toAdd.length > 0) cy.add(toAdd);

    const topologyChanged =
      toAdd.length > 0 || toRemove.length > 0;

    if ((!hasLaidOut.current && cy.nodes().length > 0) || topologyChanged) {
      runLayout(cy);
      hasLaidOut.current = true;
    }
  }, [cyRef, elements]);
}

function runLayout(cy: cytoscape.Core) {
  const layout = cy.layout({
    name: 'dagre',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rankDir: 'LR' as any,
    nodeSep: 22,
    rankSep: 100,
    edgeSep: 10,
    padding: 50,
    animate: false,
    fit: true,
    nodeDimensionsIncludeLabels: true,
  } as cytoscape.LayoutOptions);

  layout.run();
}
