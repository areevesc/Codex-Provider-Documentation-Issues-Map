import type { SeedDataset } from '@/data/seed';

/**
 * Thin repository interface over the data source. The seed implementation is
 * synchronous; a future network-backed implementation can return Promises
 * without rewriting callers (the store can be adapted).
 */
export interface Repository {
  /** Returns the full initial dataset used to hydrate the store. */
  loadAll(): SeedDataset;
}
