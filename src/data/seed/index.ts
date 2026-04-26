import { seedHealthSystems } from './healthSystems';
import { seedSpecialists } from './specialists';
import { seedClinics } from './clinics';
import { seedProviders } from './providers';
import { seedIssueLabels } from './issueLabels';
import { seedProviderIssues } from './providerIssues';

export interface SeedDataset {
  healthSystems: typeof seedHealthSystems;
  specialists: typeof seedSpecialists;
  clinics: typeof seedClinics;
  providers: typeof seedProviders;
  issueLabels: typeof seedIssueLabels;
  providerIssues: typeof seedProviderIssues;
}

export function getSeedDataset(): SeedDataset {
  return {
    healthSystems: seedHealthSystems,
    specialists: seedSpecialists,
    clinics: seedClinics,
    providers: seedProviders,
    issueLabels: seedIssueLabels,
    providerIssues: seedProviderIssues,
  };
}

export {
  seedHealthSystems,
  seedSpecialists,
  seedClinics,
  seedProviders,
  seedIssueLabels,
  seedProviderIssues,
};
