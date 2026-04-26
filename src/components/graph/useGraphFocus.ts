import { useEffect } from 'react';
import type cytoscape from 'cytoscape';

/**
 * On selection changes, apply `.focused` to the selected node + its closed
 * neighborhood and `.faded` to everything else. When nothing is selected,
 * remove both classes so the graph returns to a neutral state. Also pans
 * the viewport to the selected node so out-of-view picks (search, NodeLink,
 * etc.) actually land on screen.
 */
export function useGraphFocus(
  cyRef: React.MutableRefObject<cytoscape.Core | null>,
  selectedNodeId: string | null,
) {
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Clear previous focus state.
    cy.elements().removeClass('focused focused-primary faded');

    if (!selectedNodeId) return;

    const node = cy.getElementById(selectedNodeId);
    if (node.empty()) return;

    // Highlight the full hierarchy chain: all ancestors (up to specialist root)
    // and all descendants (down to issue labels), not just immediate neighbors.
    const fullChain = node.union(node.predecessors()).union(node.successors());
    fullChain.addClass('focused');
    node.addClass('focused-primary');

    cy.elements().not(fullChain).addClass('faded');

    // Pan toward the selected node if it's off-screen or near the edge.
    // Use a short animation so it feels intentional, not a jump.
    const bb = node.renderedBoundingBox();
    const w = cy.width();
    const h = cy.height();
    const margin = 40;
    const offScreen =
      bb.x1 < margin || bb.y1 < margin || bb.x2 > w - margin || bb.y2 > h - margin;
    if (offScreen) {
      cy.animate({ center: { eles: node }, duration: 240, easing: 'ease-out' });
    }
  }, [cyRef, selectedNodeId]);
}
