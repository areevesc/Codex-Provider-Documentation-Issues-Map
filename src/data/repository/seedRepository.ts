import type { Repository } from './types';
import { getSeedDataset } from '@/data/seed';

/**
 * Synchronous in-memory repository backed by the exported seed arrays. Swap
 * for a real network-backed implementation later without touching the UI or
 * the store's public surface.
 */
export const seedRepository: Repository = {
  loadAll() {
    return getSeedDataset();
  },
};
