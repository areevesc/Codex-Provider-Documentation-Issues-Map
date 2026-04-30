import type { Clinic, Provider } from '@/types/domain';

export const healthSystemDefinitions = [
  { id: 'hs-1', name: 'Health System 1' },
  { id: 'hs-2', name: 'Health System 2' },
] as const;

export interface SpecialistSeedPlan {
  id: string;
  name: string;
  healthSystemId: string;
  clinicCount: number;
  providerTotal: number;
  providerCounts: number[];
}

function distributeProviders(clinicCount: number, providerTotal: number): number[] {
  const base = Math.floor(providerTotal / clinicCount);
  const extra = providerTotal % clinicCount;
  return Array.from({ length: clinicCount }, (_, index) => base + (index < extra ? 1 : 0));
}

function plan(
  healthSystemId: string,
  cdiNumber: number,
  clinicCount: number,
  providerTotal: number,
): SpecialistSeedPlan {
  return {
    id: `sp-${healthSystemId.replace('hs-', 'hs')}-cdi-${cdiNumber}`,
    name: `Health System ${healthSystemId.replace('hs-', '')} CDI ${cdiNumber}`,
    healthSystemId,
    clinicCount,
    providerTotal,
    providerCounts: distributeProviders(clinicCount, providerTotal),
  };
}

export const specialistSeedPlans: SpecialistSeedPlan[] = [
  plan('hs-1', 1, 19, 27),
  plan('hs-1', 2, 10, 23),
  plan('hs-2', 1, 5, 30),
  plan('hs-2', 2, 6, 32),
  plan('hs-2', 3, 12, 52),
  plan('hs-2', 4, 9, 42),
  plan('hs-2', 5, 5, 30),
  plan('hs-2', 6, 6, 32),
  plan('hs-2', 7, 9, 42),
];

const SPECIALTIES = [
  'Family Medicine',
  'Internal Medicine',
  'Primary Care',
  'Cardiology',
  'Pediatrics',
  'Endocrinology',
  'Gastroenterology',
  'Pulmonology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Rheumatology',
  'Nephrology',
];

const FIRST_NAMES = [
  'Avery',
  'Jordan',
  'Riley',
  'Morgan',
  'Taylor',
  'Casey',
  'Quinn',
  'Parker',
  'Reese',
  'Hayden',
  'Rowan',
  'Emerson',
  'Finley',
  'Harper',
  'Sawyer',
  'Kendall',
  'Sloane',
  'Blair',
  'Cameron',
  'Devon',
  'Skyler',
  'Robin',
  'Ari',
  'Marlowe',
  'Nico',
  'Sasha',
];

const LAST_NAMES = [
  'Adams',
  'Bennett',
  'Carter',
  'Diaz',
  'Ellis',
  'Foster',
  'Garcia',
  'Hughes',
  'Ibrahim',
  'Jensen',
  'Kaur',
  'Lee',
  'Morgan',
  'Nguyen',
  'Owens',
  'Patel',
  'Reed',
  'Santos',
  'Turner',
  'Vasquez',
  'Walker',
  'Young',
  'Zimmerman',
  'Brooks',
  'Chen',
  'Daniels',
];

export interface GeneratedClinic extends Clinic {
  providerCount: number;
  specialty: string;
}

export const seedClinicDefinitions: GeneratedClinic[] = specialistSeedPlans.flatMap((sp) =>
  sp.providerCounts.map((providerCount, index) => {
    const clinicNumber = index + 1;
    const healthSystemNumber = sp.healthSystemId.replace('hs-', '');
    const cdiNumber = sp.id.split('-').at(-1);
    const specialty = SPECIALTIES[index % SPECIALTIES.length];
    return {
      id: `cl-hs${healthSystemNumber}-cdi${cdiNumber}-${String(clinicNumber).padStart(2, '0')}`,
      name: `HS ${healthSystemNumber} CDI ${cdiNumber} Clinic ${String(clinicNumber).padStart(2, '0')}`,
      cdiSpecialistId: sp.id,
      providerCount,
      specialty,
    };
  }),
);

function providerName(index: number): string {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `Dr. ${firstName} ${lastName}`;
}

const providers: Provider[] = [];
let providerIndex = 0;

for (const clinic of seedClinicDefinitions) {
  for (let index = 0; index < clinic.providerCount; index += 1) {
    providerIndex += 1;
    providers.push({
      id: `${clinic.id.replace('cl-', 'pr-')}-${String(index + 1).padStart(2, '0')}`,
      name: providerName(providerIndex - 1),
      clinicId: clinic.id,
      specialty: clinic.specialty,
    });
  }
}

export const seedProviderDefinitions = providers;
