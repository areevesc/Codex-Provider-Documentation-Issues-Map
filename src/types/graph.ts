/**
 * Types for the graph layer. These are a thin mapping over the domain entities
 * suitable for feeding Cytoscape.js elements.
 */

export type NodeType = 'healthSystem' | 'specialist' | 'clinic' | 'provider' | 'label';

export interface GraphNodeData {
  /** Cytoscape node id — prefixed to guarantee uniqueness across types. */
  id: string;
  type: NodeType;
  label: string;
  /** Underlying domain entity id (not prefixed). */
  refId: string;
}

export type GraphEdgeKind = 'specialist-clinic' | 'clinic-provider' | 'provider-label';

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  kind: GraphEdgeKind;
}
