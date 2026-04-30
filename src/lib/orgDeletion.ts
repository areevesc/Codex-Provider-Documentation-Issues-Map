import type { AppState } from '@/store/useAppStore';

export type OrgEntityType = 'healthSystem' | 'specialist' | 'clinic' | 'provider';

export interface OrgDeleteImpact {
  specialists: number;
  clinics: number;
  providers: number;
  providerIssues: number;
}

export function getOrgDeleteImpact(
  s: AppState,
  entityType: OrgEntityType,
  entityId: string,
): OrgDeleteImpact {
  if (entityType === 'healthSystem') {
    const specialistIds = new Set(
      Object.values(s.specialists)
        .filter((specialist) => specialist.healthSystemId === entityId)
        .map((specialist) => specialist.id),
    );
    const clinicIds = new Set(
      Object.values(s.clinics)
        .filter((clinic) => specialistIds.has(clinic.cdiSpecialistId))
        .map((clinic) => clinic.id),
    );
    const providerIds = new Set(
      Object.values(s.providers)
        .filter((provider) => clinicIds.has(provider.clinicId))
        .map((provider) => provider.id),
    );
    return {
      specialists: specialistIds.size,
      clinics: clinicIds.size,
      providers: providerIds.size,
      providerIssues: countProviderIssues(s, providerIds),
    };
  }

  if (entityType === 'specialist') {
    const clinicIds = new Set(
      Object.values(s.clinics)
        .filter((clinic) => clinic.cdiSpecialistId === entityId)
        .map((clinic) => clinic.id),
    );
    const providerIds = new Set(
      Object.values(s.providers)
        .filter((provider) => clinicIds.has(provider.clinicId))
        .map((provider) => provider.id),
    );
    return {
      specialists: 0,
      clinics: clinicIds.size,
      providers: providerIds.size,
      providerIssues: countProviderIssues(s, providerIds),
    };
  }

  if (entityType === 'clinic') {
    const providerIds = new Set(
      Object.values(s.providers)
        .filter((provider) => provider.clinicId === entityId)
        .map((provider) => provider.id),
    );
    return {
      specialists: 0,
      clinics: 0,
      providers: providerIds.size,
      providerIssues: countProviderIssues(s, providerIds),
    };
  }

  return {
    specialists: 0,
    clinics: 0,
    providers: 0,
    providerIssues: countProviderIssues(s, new Set([entityId])),
  };
}

export function confirmOrgDelete(name: string, impact: OrgDeleteImpact) {
  const totalImpacted =
    impact.specialists + impact.clinics + impact.providers + impact.providerIssues;
  const base = `Delete ${name}?`;

  const details = [
    impact.specialists
      ? `${impact.specialists} CDI specialist${impact.specialists === 1 ? '' : 's'}`
      : '',
    impact.clinics ? `${impact.clinics} clinic${impact.clinics === 1 ? '' : 's'}` : '',
    impact.providers ? `${impact.providers} provider${impact.providers === 1 ? '' : 's'}` : '',
    impact.providerIssues
      ? `${impact.providerIssues} provider issue${impact.providerIssues === 1 ? '' : 's'}`
      : '',
  ]
    .filter(Boolean)
    .join(', ');

  const impactText =
    totalImpacted > 0 ? `This will also delete ${details}.` : 'This cannot be undone.';
  const response = window.prompt(`${base}\n\n${impactText}\n\nType DELETE to confirm.`);
  return response === 'DELETE';
}

function countProviderIssues(s: AppState, providerIds: Set<string>): number {
  return Object.values(s.providerIssues).filter((issue) => providerIds.has(issue.providerId))
    .length;
}
