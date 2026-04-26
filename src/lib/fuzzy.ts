/**
 * Lightweight fuzzy-similarity helpers for the Issue Library duplicate check.
 * Not a general-purpose search tool — just "does this candidate look suspiciously
 * like an existing label?".
 */

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Returns a similarity score in [0, 1]. Uses a normalized token-set overlap. */
export function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  const tokensA = new Set(na.split(' '));
  const tokensB = new Set(nb.split(' '));
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap += 1;
  }
  const tokenScore = (2 * overlap) / (tokensA.size + tokensB.size);

  // Combine with a normalized prefix match for small-edit-distance wording.
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  const prefixScore = longer.startsWith(shorter) ? 0.3 : 0;

  return Math.min(1, tokenScore + prefixScore);
}

export interface FuzzyMatch<T> {
  item: T;
  score: number;
}

/** Returns items with similarity >= threshold, sorted highest score first. */
export function findSimilar<T>(
  query: string,
  items: readonly T[],
  getText: (item: T) => string,
  threshold = 0.5,
): FuzzyMatch<T>[] {
  if (!query.trim()) return [];
  const scored = items
    .map((item) => ({ item, score: similarity(query, getText(item)) }))
    .filter((m) => m.score >= threshold);
  scored.sort((a, b) => b.score - a.score);
  return scored;
}
