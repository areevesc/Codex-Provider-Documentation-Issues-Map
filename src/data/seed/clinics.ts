import type { Clinic } from '@/types/domain';
import { seedClinicDefinitions } from './structure';

export const seedClinics: Clinic[] = seedClinicDefinitions.map((clinic) => ({
  id: clinic.id,
  name: clinic.name,
  cdiSpecialistId: clinic.cdiSpecialistId,
}));
