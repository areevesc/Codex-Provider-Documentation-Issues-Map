import type { Clinic, Provider } from '@/types/domain';

export const healthSystemDefinitions = [
  { id: 'hs-1', name: 'Northstar Health Alliance' },
  { id: 'hs-2', name: 'Riverbend Regional Health' },
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
  name: string,
): SpecialistSeedPlan {
  return {
    id: `sp-${healthSystemId.replace('hs-', 'hs')}-cdi-${cdiNumber}`,
    name,
    healthSystemId,
    clinicCount,
    providerTotal,
    providerCounts: distributeProviders(clinicCount, providerTotal),
  };
}

export const specialistSeedPlans: SpecialistSeedPlan[] = [
  plan('hs-1', 1, 19, 27, 'Avery Quinn'),
  plan('hs-1', 2, 10, 23, 'Jordan Patel'),
  plan('hs-2', 1, 5, 30, 'Riley Chen'),
  plan('hs-2', 2, 6, 32, 'Morgan Wells'),
  plan('hs-2', 3, 12, 52, 'Taylor Osei'),
  plan('hs-2', 4, 9, 42, 'Chris Nakamura'),
  plan('hs-2', 5, 5, 30, 'Devon Russo'),
  plan('hs-2', 6, 6, 32, 'Jamie Flores'),
  plan('hs-2', 7, 9, 42, 'Alex Torres'),
];

const clinicTemplates = [
  { baseName: 'Maplewood Family Medicine', specialty: 'Family Medicine' },
  { baseName: 'Harbor Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Oakridge Primary Care', specialty: 'Primary Care' },
  { baseName: 'Riverside Cardiology Associates', specialty: 'Cardiology' },
  { baseName: 'Summit Pediatrics Group', specialty: 'Pediatrics' },
  { baseName: 'Bayshore Endocrinology', specialty: 'Endocrinology' },
  { baseName: 'Cedar Hill Gastroenterology', specialty: 'Gastroenterology' },
  { baseName: 'Central Pulmonology Group', specialty: 'Pulmonology' },
  { baseName: 'Coastal Neurology Center', specialty: 'Neurology' },
  { baseName: 'Northgate Oncology Associates', specialty: 'Oncology' },
  { baseName: 'Summit Creek Orthopedics', specialty: 'Orthopedics' },
  { baseName: 'Riverside Rheumatology Clinic', specialty: 'Rheumatology' },
  { baseName: 'Metro Nephrology Specialists', specialty: 'Nephrology' },
  { baseName: 'Lakewood Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Pine Ridge Family Practice', specialty: 'Family Medicine' },
  { baseName: 'Valley Primary Care', specialty: 'Primary Care' },
  { baseName: 'Highland Cardiology Group', specialty: 'Cardiology' },
  { baseName: 'Forest View Pediatrics', specialty: 'Pediatrics' },
  { baseName: 'Pacific Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Clearwater Family Medicine', specialty: 'Family Medicine' },
  { baseName: 'Downtown Primary Care', specialty: 'Primary Care' },
  { baseName: 'Meadow Brook Primary Care', specialty: 'Primary Care' },
  { baseName: 'Ironwood Cardiology Partners', specialty: 'Cardiology' },
  { baseName: 'Aspen Valley Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Redwood Oncology and Hematology', specialty: 'Oncology' },
  { baseName: 'Clover Leaf Family Medicine', specialty: 'Family Medicine' },
  { baseName: 'Horizon Gastroenterology', specialty: 'Gastroenterology' },
  { baseName: 'Greenfield Pediatrics', specialty: 'Pediatrics' },
  { baseName: 'Sunrise Multispecialty Group', specialty: 'Internal Medicine' },
  { baseName: 'Willow Creek Primary Care', specialty: 'Primary Care' },
  { baseName: 'Silver Lake Family Health', specialty: 'Family Medicine' },
  { baseName: 'Stonebridge Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Grandview Cardiology Clinic', specialty: 'Cardiology' },
  { baseName: 'Brighton Pediatric Care', specialty: 'Pediatrics' },
  { baseName: 'Canyon Ridge Endocrinology', specialty: 'Endocrinology' },
  { baseName: 'Prairie View Gastroenterology', specialty: 'Gastroenterology' },
  { baseName: 'Northfield Pulmonary Medicine', specialty: 'Pulmonology' },
  { baseName: 'Seaside Neurology Associates', specialty: 'Neurology' },
  { baseName: 'Lakeshore Oncology Group', specialty: 'Oncology' },
  { baseName: 'Orchard Park Orthopedics', specialty: 'Orthopedics' },
  { baseName: 'Twin Rivers Rheumatology', specialty: 'Rheumatology' },
  { baseName: 'Keystone Nephrology Center', specialty: 'Nephrology' },
  { baseName: 'Elm Street Family Practice', specialty: 'Family Medicine' },
  { baseName: 'Briarwood Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Heritage Primary Care', specialty: 'Primary Care' },
  { baseName: 'Westbrook Cardiology', specialty: 'Cardiology' },
  { baseName: 'Crescent Pediatrics', specialty: 'Pediatrics' },
  { baseName: 'Evergreen Endocrine Clinic', specialty: 'Endocrinology' },
  { baseName: 'Ridgeline Gastroenterology', specialty: 'Gastroenterology' },
  { baseName: 'Bluewater Pulmonology', specialty: 'Pulmonology' },
  { baseName: 'Cypress Neurology Center', specialty: 'Neurology' },
  { baseName: 'Magnolia Oncology Associates', specialty: 'Oncology' },
  { baseName: 'Hillcrest Orthopedic Care', specialty: 'Orthopedics' },
  { baseName: 'Foxglove Rheumatology', specialty: 'Rheumatology' },
  { baseName: 'Riverstone Nephrology', specialty: 'Nephrology' },
  { baseName: 'Brookside Family Health', specialty: 'Family Medicine' },
  { baseName: 'Parkview Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Hawthorne Primary Care', specialty: 'Primary Care' },
  { baseName: 'Spring Valley Cardiology', specialty: 'Cardiology' },
  { baseName: 'Juniper Pediatrics', specialty: 'Pediatrics' },
  { baseName: 'Laurel Endocrinology', specialty: 'Endocrinology' },
  { baseName: 'Windward Gastroenterology', specialty: 'Gastroenterology' },
  { baseName: 'Falcon Ridge Pulmonary', specialty: 'Pulmonology' },
  { baseName: 'Mariner Neurology Associates', specialty: 'Neurology' },
  { baseName: 'Palisade Oncology Center', specialty: 'Oncology' },
  { baseName: 'Redstone Orthopedics', specialty: 'Orthopedics' },
  { baseName: 'Sycamore Rheumatology', specialty: 'Rheumatology' },
  { baseName: 'Eastgate Nephrology', specialty: 'Nephrology' },
  { baseName: 'Rosewood Family Medicine', specialty: 'Family Medicine' },
  { baseName: 'Copperfield Internal Medicine', specialty: 'Internal Medicine' },
  { baseName: 'Northpoint Primary Care', specialty: 'Primary Care' },
  { baseName: 'Bridgewater Cardiology', specialty: 'Cardiology' },
  { baseName: 'Beacon Pediatrics', specialty: 'Pediatrics' },
  { baseName: 'Sagebrush Endocrinology', specialty: 'Endocrinology' },
  { baseName: 'Woodland Gastroenterology', specialty: 'Gastroenterology' },
  { baseName: 'Southgate Pulmonology', specialty: 'Pulmonology' },
  { baseName: 'Cedar Grove Neurology', specialty: 'Neurology' },
  { baseName: 'Millstone Oncology Group', specialty: 'Oncology' },
  { baseName: 'Northstar Orthopedics', specialty: 'Orthopedics' },
  { baseName: 'Riverbend Rheumatology', specialty: 'Rheumatology' },
  { baseName: 'Summit Nephrology Associates', specialty: 'Nephrology' },
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

const clinics: GeneratedClinic[] = [];
let clinicIndex = 0;

for (const specialist of specialistSeedPlans) {
  specialist.providerCounts.forEach((providerCount, index) => {
    const clinicNumber = index + 1;
    const healthSystemNumber = specialist.healthSystemId.replace('hs-', '');
    const cdiNumber = specialist.id.split('-').at(-1);
    const template = clinicTemplates[clinicIndex % clinicTemplates.length];
    clinicIndex += 1;
    clinics.push({
      id: `cl-hs${healthSystemNumber}-cdi${cdiNumber}-${String(clinicNumber).padStart(2, '0')}`,
      name: template.baseName,
      cdiSpecialistId: specialist.id,
      providerCount,
      specialty: template.specialty,
    });
  });
}

export const seedClinicDefinitions = clinics;

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
