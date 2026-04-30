import { useEffect, useMemo, useRef } from 'react';
import cytoscape from 'cytoscape';
// @ts-expect-error - cytoscape-dagre ships without bundled typedefs.
import dagre from 'cytoscape-dagre';
import { useAppStore } from '@/store/useAppStore';
import { buildGraphElements } from '@/lib/graphBuilder';
import { parseGraphNodeId } from '@/lib/ids';
import type { NodeType } from '@/types/graph';
import { createGraphStylesheet } from './graphStyles';
import { useGraphSync } from './useGraphSync';
import { useGraphFocus } from './useGraphFocus';

// Register the dagre layout extension exactly once.
let dagreRegistered = false;
if (!dagreRegistered) {
  cytoscape.use(dagre);
  dagreRegistered = true;
}

/**
 * Hosts a single Cytoscape instance and wires it to the Zustand store.
 * The component itself never unmounts/remounts the canvas on store changes —
 * it diffs elements in place via useGraphSync and adjusts focus via
 * useGraphFocus.
 */
export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Subscribe to the slices needed to build elements.
  const specialistFilterId = useAppStore((s) => s.specialistFilterId);
  const visibleNodeTypes = useAppStore((s) => s.visibleNodeTypes);
  const specialists = useAppStore((s) => s.specialists);
  const clinics = useAppStore((s) => s.clinics);
  const providers = useAppStore((s) => s.providers);
  const issueLabels = useAppStore((s) => s.issueLabels);
  const providerIssues = useAppStore((s) => s.providerIssues);
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const colorTheme = useAppStore((s) => s.colorTheme);

  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const setSelection = useAppStore((s) => s.setSelection);
  const clearSelection = useAppStore((s) => s.clearSelection);

  const elements = useMemo(
    () =>
      buildGraphElements(
        {
          ...useAppStore.getState(),
          specialists,
          clinics,
          providers,
          issueLabels,
          providerIssues,
        },
        { specialistFilterId, visibleNodeTypes },
      ),
    [specialistFilterId, visibleNodeTypes, specialists, clinics, providers, issueLabels, providerIssues],
  );

  // Initialize Cytoscape once.
  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      style: createGraphStylesheet(),
      elements: [],
      minZoom: 0.25,
      maxZoom: 3,
      wheelSensitivity: 0.25,
      boxSelectionEnabled: false,
      autoungrabify: false,
    });
    cyRef.current = cy;

    const onNodeTap: cytoscape.EventHandler = (e) => {
      const node = e.target;
      const parsed = parseGraphNodeId(node.id());
      if (!parsed) return;
      const type: NodeType =
        parsed.prefix === 'hs'
          ? 'healthSystem'
          : parsed.prefix === 'sp'
          ? 'specialist'
          : parsed.prefix === 'cl'
            ? 'clinic'
            : parsed.prefix === 'pr'
              ? 'provider'
              : 'label';
      setSelection(node.id(), type);
    };
    cy.on('tap', 'node', onNodeTap);

    const onBackgroundTap: cytoscape.EventHandler = (e) => {
      if (e.target === cy) clearSelection();
    };
    cy.on('tap', onBackgroundTap);

    // Persist positions when the user drags a node.
    const onDragFree: cytoscape.EventHandler = () => {
      const positions: Record<string, { x: number; y: number }> = {};
      cy.nodes().forEach((n) => {
        const p = n.position();
        positions[n.id()] = { x: p.x, y: p.y };
      });
      useAppStore.getState().saveLayoutPositions(positions);
    };
    cy.on('dragfree', 'node', onDragFree);

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // We intentionally initialize once and use refs for everything else.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGraphSync(cyRef, elements);
  useGraphFocus(cyRef, selectedNodeId);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      cyRef.current?.style().fromJson(createGraphStylesheet()).update();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [appearanceMode, colorTheme]);

  // Keep the instance sized to its container. Cytoscape listens to window
  // resize by default, but the three-pane layout can change size without a
  // window resize (e.g. panels collapsing). A ResizeObserver keeps it honest.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      cyRef.current?.resize();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0" />
      <GraphLegend />
    </div>
  );
}

function GraphLegend() {
  const entries: { type: NodeType; label: string; color: string }[] = [
    { type: 'specialist', label: 'CDI specialist', color: 'bg-accent-specialist' },
    { type: 'clinic', label: 'Clinic', color: 'bg-accent-clinic' },
    { type: 'provider', label: 'Provider', color: 'bg-accent-provider' },
    { type: 'label', label: 'Issue label', color: 'bg-accent-label' },
  ];
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1 rounded-md border border-line bg-surface-panel/80 px-2.5 py-2 text-[11px] text-ink-muted backdrop-blur">
      {entries.map((e) => (
        <div key={e.type} className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${e.color}`} />
          <span>{e.label}</span>
        </div>
      ))}
    </div>
  );
}
