import type { HealthSystem } from '@/types/domain';
import { healthSystemDefinitions } from './structure';

export const seedHealthSystems: HealthSystem[] = healthSystemDefinitions.map((healthSystem) => ({
  id: healthSystem.id,
  name: healthSystem.name,
}));
