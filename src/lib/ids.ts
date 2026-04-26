import { nanoid } from 'nanoid';

/** Domain-entity id prefixes kept short for readability in URLs and logs. */
export const idPrefixes = {
  healthSystem: 'hs',
  specialist: 'sp',
  clinic: 'cl',
  provider: 'pr',
  issueLabel: 'il',
  providerIssue: 'pi',
} as const;

type EntityKind = keyof typeof idPrefixes;

/** Creates a new domain id, e.g. `pi-x3fQ9...`. */
export function newId(kind: EntityKind): string {
  return `${idPrefixes[kind]}-${nanoid(10)}`;
}

/** Graph-node id helpers. Graph ids are separate from domain ids so the
 *  same domain entity can become a node without id collisions. */
export const graphNodeId = {
  healthSystem: (refId: string) => `hs:${refId}`,
  specialist: (refId: string) => `sp:${refId}`,
  clinic: (refId: string) => `cl:${refId}`,
  provider: (refId: string) => `pr:${refId}`,
  label: (refId: string) => `lb:${refId}`,
};

export function parseGraphNodeId(nodeId: string): { prefix: string; refId: string } | null {
  const idx = nodeId.indexOf(':');
  if (idx === -1) return null;
  return { prefix: nodeId.slice(0, idx), refId: nodeId.slice(idx + 1) };
}
