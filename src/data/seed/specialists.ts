import type { CDISpecialist } from '@/types/domain';
import { specialistSeedPlans } from './structure';

export const seedSpecialists: CDISpecialist[] = specialistSeedPlans.map((specialist) => ({
  id: specialist.id,
  name: specialist.name,
  healthSystemId: specialist.healthSystemId,
}));
