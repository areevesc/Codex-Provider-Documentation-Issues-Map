import type { AppEntities, EntityId, GraphNodeId, GraphNodeRef, GraphNodeType } from "./types";
import {
  getAllProviderIds,
  getCurrentRecordsForProviderIds,
  getIssueUsageCounts,
  getProviderIdsForCdi,
  values
} from "./selectors";

export interface RelationshipGraphNode {
  id: GraphNodeId;
  rawId: EntityId;
  type: GraphNodeType;
  label: string;
  subtitle?: string;
  count?: number;
  val: number;
  color: string;
  x?: number;
  y?: number;
}

export interface RelationshipGraphLink {
  source: GraphNodeId;
  target: GraphNodeId;
  kind: "assignment" | "membership" | "current-issue";
}

export interface RelationshipGraphModel {
  nodes: RelationshipGraphNode[];
  links: RelationshipGraphLink[];
}

const nodeColors: Record<GraphNodeType, string> = {
  cdi: "#2563eb",
  clinic: "#0891b2",
  provider: "#4f46e5",
  issue: "#dc2626"
};

export function makeGraphNodeId(type: GraphNodeType, id: EntityId): GraphNodeId {
  return `${type}:${id}`;
}

export function parseGraphNodeId(nodeId: GraphNodeId): GraphNodeRef {
  const [type, ...rest] = nodeId.split(":");
  return { type: type as GraphNodeType, id: rest.join(":") };
}

function matchesSearch(label: string, searchQuery: string) {
  return label.toLowerCase().includes(searchQuery.trim().toLowerCase());
}

function addProviderContext(entities: AppEntities, providerId: EntityId, sets: VisibleSets) {
  const provider = entities.providers[providerId];
  const clinic = provider ? entities.clinics[provider.clinicId] : undefined;

  if (!provider || !clinic) {
    return;
  }

  sets.providerIds.add(provider.id);
  sets.clinicIds.add(clinic.id);
  sets.cdiIds.add(clinic.cdiSpecialistId);
}

interface VisibleSets {
  cdiIds: Set<EntityId>;
  clinicIds: Set<EntityId>;
  providerIds: Set<EntityId>;
  issueLabelIds: Set<EntityId>;
}

function getBaseProviderIds(entities: AppEntities, selectedCdiSpecialistId: EntityId | null) {
  return selectedCdiSpecialistId ? getProviderIdsForCdi(entities, selectedCdiSpecialistId) : getAllProviderIds(entities);
}

function buildVisibleSets(
  entities: AppEntities,
  selectedCdiSpecialistId: EntityId | null,
  searchQuery: string
): VisibleSets {
  const baseProviderIds = new Set(getBaseProviderIds(entities, selectedCdiSpecialistId));
  const sets: VisibleSets = {
    cdiIds: new Set<EntityId>(),
    clinicIds: new Set<EntityId>(),
    providerIds: new Set<EntityId>(),
    issueLabelIds: new Set<EntityId>()
  };

  baseProviderIds.forEach((providerId) => addProviderContext(entities, providerId, sets));
  getCurrentRecordsForProviderIds(entities, baseProviderIds).forEach((record) => sets.issueLabelIds.add(record.issueLabelId));

  const query = searchQuery.trim();
  if (!query) {
    return sets;
  }

  const matchedSets: VisibleSets = {
    cdiIds: new Set<EntityId>(),
    clinicIds: new Set<EntityId>(),
    providerIds: new Set<EntityId>(),
    issueLabelIds: new Set<EntityId>()
  };

  values(entities.cdiSpecialists).forEach((cdi) => {
    if (!sets.cdiIds.has(cdi.id) || !matchesSearch(cdi.name, query)) {
      return;
    }

    matchedSets.cdiIds.add(cdi.id);
    values(entities.clinics)
      .filter((clinic) => clinic.cdiSpecialistId === cdi.id)
      .forEach((clinic) => {
        matchedSets.clinicIds.add(clinic.id);
        values(entities.providers)
          .filter((provider) => provider.clinicId === clinic.id && baseProviderIds.has(provider.id))
          .forEach((provider) => addProviderContext(entities, provider.id, matchedSets));
      });
  });

  values(entities.clinics).forEach((clinic) => {
    if (!sets.clinicIds.has(clinic.id) || !matchesSearch(clinic.name, query)) {
      return;
    }

    matchedSets.clinicIds.add(clinic.id);
    matchedSets.cdiIds.add(clinic.cdiSpecialistId);
    values(entities.providers)
      .filter((provider) => provider.clinicId === clinic.id && baseProviderIds.has(provider.id))
      .forEach((provider) => addProviderContext(entities, provider.id, matchedSets));
  });

  values(entities.providers).forEach((provider) => {
    if (!baseProviderIds.has(provider.id) || !matchesSearch(provider.name, query)) {
      return;
    }

    addProviderContext(entities, provider.id, matchedSets);
  });

  values(entities.issueLabels).forEach((issueLabel) => {
    if (!sets.issueLabelIds.has(issueLabel.id) || !matchesSearch(issueLabel.name, query)) {
      return;
    }

    matchedSets.issueLabelIds.add(issueLabel.id);
    getCurrentRecordsForProviderIds(entities, baseProviderIds)
      .filter((record) => record.issueLabelId === issueLabel.id)
      .forEach((record) => addProviderContext(entities, record.providerId, matchedSets));
  });

  getCurrentRecordsForProviderIds(entities, matchedSets.providerIds).forEach((record) => {
    matchedSets.issueLabelIds.add(record.issueLabelId);
  });

  return matchedSets;
}

export function buildRelationshipGraphModel(
  entities: AppEntities,
  selectedCdiSpecialistId: EntityId | null,
  searchQuery: string
): RelationshipGraphModel {
  const visible = buildVisibleSets(entities, selectedCdiSpecialistId, searchQuery);
  const nodes: RelationshipGraphNode[] = [];
  const links: RelationshipGraphLink[] = [];

  values(entities.cdiSpecialists)
    .filter((cdi) => visible.cdiIds.has(cdi.id))
    .forEach((cdi) => {
      nodes.push({
        id: makeGraphNodeId("cdi", cdi.id),
        rawId: cdi.id,
        type: "cdi",
        label: cdi.name,
        subtitle: "CDI specialist",
        val: 12,
        color: nodeColors.cdi
      });
    });

  values(entities.clinics)
    .filter((clinic) => visible.clinicIds.has(clinic.id))
    .forEach((clinic) => {
      nodes.push({
        id: makeGraphNodeId("clinic", clinic.id),
        rawId: clinic.id,
        type: "clinic",
        label: clinic.name,
        subtitle: "Clinic",
        val: 9,
        color: nodeColors.clinic
      });
      links.push({
        source: makeGraphNodeId("cdi", clinic.cdiSpecialistId),
        target: makeGraphNodeId("clinic", clinic.id),
        kind: "assignment"
      });
    });

  values(entities.providers)
    .filter((provider) => visible.providerIds.has(provider.id))
    .forEach((provider) => {
      nodes.push({
        id: makeGraphNodeId("provider", provider.id),
        rawId: provider.id,
        type: "provider",
        label: provider.name,
        subtitle: "Provider",
        val: 7,
        color: nodeColors.provider
      });
      links.push({
        source: makeGraphNodeId("clinic", provider.clinicId),
        target: makeGraphNodeId("provider", provider.id),
        kind: "membership"
      });
    });

  values(entities.issueLabels)
    .filter((issueLabel) => visible.issueLabelIds.has(issueLabel.id))
    .forEach((issueLabel) => {
      const counts = getIssueUsageCounts(entities, issueLabel.id, visible.providerIds);
      nodes.push({
        id: makeGraphNodeId("issue", issueLabel.id),
        rawId: issueLabel.id,
        type: "issue",
        label: issueLabel.name,
        subtitle: `${counts.activeProviderCount} active provider${counts.activeProviderCount === 1 ? "" : "s"}`,
        count: counts.activeProviderCount,
        val: Math.max(6, Math.min(14, 5 + counts.activeProviderCount)),
        color: nodeColors.issue
      });
    });

  getCurrentRecordsForProviderIds(entities, visible.providerIds)
    .filter((record) => visible.issueLabelIds.has(record.issueLabelId))
    .forEach((record) => {
      links.push({
        source: makeGraphNodeId("provider", record.providerId),
        target: makeGraphNodeId("issue", record.issueLabelId),
        kind: "current-issue"
      });
    });

  const nodeIds = new Set(nodes.map((node) => node.id));
  return {
    nodes,
    links: links.filter((link) => nodeIds.has(link.source) && nodeIds.has(link.target))
  };
}

export function getNeighborNodeIds(graph: RelationshipGraphModel, nodeId: GraphNodeId | null) {
  if (!nodeId) {
    return new Set<GraphNodeId>();
  }

  const neighbors = new Set<GraphNodeId>();
  graph.links.forEach((link) => {
    if (link.source === nodeId) {
      neighbors.add(link.target);
    }
    if (link.target === nodeId) {
      neighbors.add(link.source);
    }
  });

  return neighbors;
}
