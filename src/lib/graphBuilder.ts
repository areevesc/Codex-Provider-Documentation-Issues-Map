import type { AppState } from '@/store/useAppStore';
import type { GraphEdgeData, GraphNodeData, NodeType } from '@/types/graph';
import { graphNodeId } from '@/lib/ids';
import {
  getClinicsForSpecialist,
  getProvidersForSpecialist,
  getProvidersForClinic,
  listProviderIssues,
  listSpecialists,
  listClinics,
  listProviders,
  listIssueLabels,
} from '@/store/selectors';
import { isCurrentStatus } from '@/types/domain';

export interface GraphElements {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface BuildOptions {
  /** When set, restrict to this specialist's subtree (specialist + their clinics + providers). */
  specialistFilterId: string | null;
  /** When a node type is false, it and its edges are omitted from the result. */
  visibleNodeTypes: Record<NodeType, boolean>;
}

/**
 * Build Cytoscape element descriptors from the current store state.
 *
 * Home-screen rules:
 *   - provider ↔ label edges only exist for CURRENT (Active/Improving) provider-issues.
 *   - Label nodes are only included when they have at least one current edge to an
 *     in-scope provider (avoids floating labels).
 *   - Specialist filter narrows the specialist/clinic/provider set to one subtree.
 */
export function buildGraphElements(s: AppState, opts: BuildOptions): GraphElements {
  const { specialistFilterId, visibleNodeTypes } = opts;

  const specialists = specialistFilterId
    ? listSpecialists(s).filter((sp) => sp.id === specialistFilterId)
    : listSpecialists(s);

  const clinics = specialistFilterId
    ? getClinicsForSpecialist(s, specialistFilterId)
    : listClinics(s);

  const providers = specialistFilterId
    ? getProvidersForSpecialist(s, specialistFilterId)
    : listProviders(s);

  const providerIdSet = new Set(providers.map((p) => p.id));

  // Determine which labels should appear: those with at least one current
  // provider-issue against an in-scope provider.
  const labelIdsInPlay = new Set<string>();
  const currentEdges: GraphEdgeData[] = [];
  for (const pi of listProviderIssues(s)) {
    if (!isCurrentStatus(pi.status)) continue;
    if (!providerIdSet.has(pi.providerId)) continue;
    labelIdsInPlay.add(pi.issueLabelId);
    currentEdges.push({
      id: `e:pl:${pi.id}`,
      source: graphNodeId.provider(pi.providerId),
      target: graphNodeId.label(pi.issueLabelId),
      kind: 'provider-label',
    });
  }

  const labels = listIssueLabels(s).filter((l) => labelIdsInPlay.has(l.id));

  // ── Nodes ───────────────────────────────────────────────────────────────
  const nodes: GraphNodeData[] = [];
  if (visibleNodeTypes.specialist) {
    for (const sp of specialists) {
      nodes.push({
        id: graphNodeId.specialist(sp.id),
        type: 'specialist',
        label: sp.name,
        refId: sp.id,
      });
    }
  }
  if (visibleNodeTypes.clinic) {
    for (const cl of clinics) {
      nodes.push({
        id: graphNodeId.clinic(cl.id),
        type: 'clinic',
        label: cl.name,
        refId: cl.id,
      });
    }
  }
  if (visibleNodeTypes.provider) {
    for (const p of providers) {
      nodes.push({
        id: graphNodeId.provider(p.id),
        type: 'provider',
        label: p.name,
        refId: p.id,
      });
    }
  }
  if (visibleNodeTypes.label) {
    for (const l of labels) {
      nodes.push({
        id: graphNodeId.label(l.id),
        type: 'label',
        label: l.name,
        refId: l.id,
      });
    }
  }

  // ── Edges ───────────────────────────────────────────────────────────────
  const edges: GraphEdgeData[] = [];
  const nodeIdSet = new Set(nodes.map((n) => n.id));

  if (visibleNodeTypes.specialist && visibleNodeTypes.clinic) {
    for (const cl of clinics) {
      edges.push({
        id: `e:sc:${cl.id}`,
        source: graphNodeId.specialist(cl.cdiSpecialistId),
        target: graphNodeId.clinic(cl.id),
        kind: 'specialist-clinic',
      });
    }
  }

  if (visibleNodeTypes.clinic && visibleNodeTypes.provider) {
    for (const cl of clinics) {
      const clinicProviders = getProvidersForClinic(s, cl.id);
      for (const p of clinicProviders) {
        edges.push({
          id: `e:cp:${p.id}`,
          source: graphNodeId.clinic(cl.id),
          target: graphNodeId.provider(p.id),
          kind: 'clinic-provider',
        });
      }
    }
  }

  if (visibleNodeTypes.provider && visibleNodeTypes.label) {
    for (const edge of currentEdges) {
      edges.push(edge);
    }
  }

  // Filter edges whose endpoints aren't in the node set (e.g. label toggled off).
  const filteredEdges = edges.filter(
    (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target),
  );

  return { nodes, edges: filteredEdges };
}
