import type {
  AppEntities,
  EntityId,
  IssueLabel,
  IssueSummary,
  Provider,
  ProviderIssueDetail,
  ProviderIssueRecord,
  ProviderIssueStatus
} from "./types";
import { CURRENT_ISSUE_STATUSES, HISTORICAL_ISSUE_STATUSES } from "./types";

export function values<T>(record: Record<string, T>): T[] {
  return Object.values(record);
}

export function isCurrentIssueStatus(status: ProviderIssueStatus) {
  return CURRENT_ISSUE_STATUSES.includes(status);
}

export function isHistoricalIssueStatus(status: ProviderIssueStatus) {
  return HISTORICAL_ISSUE_STATUSES.includes(status);
}

export function sortByName<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export function getClinicsForCdi(entities: AppEntities, cdiSpecialistId: EntityId) {
  return sortByName(values(entities.clinics).filter((clinic) => clinic.cdiSpecialistId === cdiSpecialistId));
}

export function getProvidersForClinic(entities: AppEntities, clinicId: EntityId) {
  return sortByName(values(entities.providers).filter((provider) => provider.clinicId === clinicId));
}

export function getProviderIdsForClinic(entities: AppEntities, clinicId: EntityId) {
  return getProvidersForClinic(entities, clinicId).map((provider) => provider.id);
}

export function getProviderIdsForCdi(entities: AppEntities, cdiSpecialistId: EntityId) {
  const clinicIds = new Set(getClinicsForCdi(entities, cdiSpecialistId).map((clinic) => clinic.id));
  return values(entities.providers)
    .filter((provider) => clinicIds.has(provider.clinicId))
    .map((provider) => provider.id);
}

export function getCdiForClinic(entities: AppEntities, clinicId: EntityId) {
  const clinic = entities.clinics[clinicId];
  return clinic ? entities.cdiSpecialists[clinic.cdiSpecialistId] : undefined;
}

export function getClinicForProvider(entities: AppEntities, providerId: EntityId) {
  const provider = entities.providers[providerId];
  return provider ? entities.clinics[provider.clinicId] : undefined;
}

export function getCdiForProvider(entities: AppEntities, providerId: EntityId) {
  const clinic = getClinicForProvider(entities, providerId);
  return clinic ? entities.cdiSpecialists[clinic.cdiSpecialistId] : undefined;
}

export function getProviderIssueRecordsForProvider(entities: AppEntities, providerId: EntityId) {
  return values(entities.providerIssueRecords).filter((record) => record.providerId === providerId);
}

export function getCurrentProviderIssueRecordsForProvider(entities: AppEntities, providerId: EntityId) {
  return getProviderIssueRecordsForProvider(entities, providerId).filter((record) =>
    isCurrentIssueStatus(record.status)
  );
}

export function getHistoricalProviderIssueRecordsForProvider(entities: AppEntities, providerId: EntityId) {
  return getProviderIssueRecordsForProvider(entities, providerId).filter((record) =>
    isHistoricalIssueStatus(record.status)
  );
}

export function hydrateProviderIssueRecord(
  entities: AppEntities,
  record: ProviderIssueRecord
): ProviderIssueDetail | undefined {
  const issueLabel = entities.issueLabels[record.issueLabelId];
  return issueLabel ? { record, issueLabel } : undefined;
}

export function getProviderIssueDetails(
  entities: AppEntities,
  records: ProviderIssueRecord[]
): ProviderIssueDetail[] {
  return records
    .map((record) => hydrateProviderIssueRecord(entities, record))
    .filter((detail): detail is ProviderIssueDetail => Boolean(detail))
    .sort((a, b) => a.issueLabel.name.localeCompare(b.issueLabel.name));
}

export function getCurrentIssueDetailsForProvider(entities: AppEntities, providerId: EntityId) {
  return getProviderIssueDetails(entities, getCurrentProviderIssueRecordsForProvider(entities, providerId));
}

export function getHistoricalIssueDetailsForProvider(entities: AppEntities, providerId: EntityId) {
  return getProviderIssueDetails(entities, getHistoricalProviderIssueRecordsForProvider(entities, providerId));
}

export function getProvidersForIds(entities: AppEntities, providerIds: Iterable<EntityId>) {
  return sortByName([...providerIds].map((id) => entities.providers[id]).filter((provider): provider is Provider => Boolean(provider)));
}

export function getCurrentRecordsForProviderIds(entities: AppEntities, providerIds: Iterable<EntityId>) {
  const allowedProviderIds = new Set(providerIds);
  return values(entities.providerIssueRecords).filter(
    (record) => allowedProviderIds.has(record.providerId) && isCurrentIssueStatus(record.status)
  );
}

export function getIssueSummariesForProviderIds(
  entities: AppEntities,
  providerIds: Iterable<EntityId>
): IssueSummary[] {
  const summaries = new Map<EntityId, { issueLabel: IssueLabel; providerIds: Set<EntityId>; clinicIds: Set<EntityId> }>();

  getCurrentRecordsForProviderIds(entities, providerIds).forEach((record) => {
    const issueLabel = entities.issueLabels[record.issueLabelId];
    const provider = entities.providers[record.providerId];
    if (!issueLabel || !provider) {
      return;
    }

    const existing =
      summaries.get(issueLabel.id) ?? {
        issueLabel,
        providerIds: new Set<EntityId>(),
        clinicIds: new Set<EntityId>()
      };

    existing.providerIds.add(provider.id);
    existing.clinicIds.add(provider.clinicId);
    summaries.set(issueLabel.id, existing);
  });

  return [...summaries.values()]
    .map((summary) => ({
      issueLabel: summary.issueLabel,
      activeProviderCount: summary.providerIds.size,
      activeClinicCount: summary.clinicIds.size
    }))
    .sort((a, b) => b.activeProviderCount - a.activeProviderCount || a.issueLabel.name.localeCompare(b.issueLabel.name));
}

export function getAllProviderIds(entities: AppEntities) {
  return values(entities.providers).map((provider) => provider.id);
}

export function getIssueUsageCounts(
  entities: AppEntities,
  issueLabelId: EntityId,
  scopeProviderIds: Iterable<EntityId> = getAllProviderIds(entities)
) {
  const providerIds = new Set(scopeProviderIds);
  const linkedProviderIds = new Set<EntityId>();
  const linkedClinicIds = new Set<EntityId>();

  values(entities.providerIssueRecords).forEach((record) => {
    if (
      record.issueLabelId !== issueLabelId ||
      !providerIds.has(record.providerId) ||
      !isCurrentIssueStatus(record.status)
    ) {
      return;
    }

    const provider = entities.providers[record.providerId];
    if (!provider) {
      return;
    }

    linkedProviderIds.add(provider.id);
    linkedClinicIds.add(provider.clinicId);
  });

  return {
    activeProviderCount: linkedProviderIds.size,
    activeClinicCount: linkedClinicIds.size
  };
}

export function getCurrentProvidersLinkedToIssue(
  entities: AppEntities,
  issueLabelId: EntityId,
  scopeProviderIds: Iterable<EntityId> = getAllProviderIds(entities)
) {
  const allowedProviderIds = new Set(scopeProviderIds);
  const providerIds = new Set<EntityId>();

  values(entities.providerIssueRecords).forEach((record) => {
    if (
      record.issueLabelId === issueLabelId &&
      allowedProviderIds.has(record.providerId) &&
      isCurrentIssueStatus(record.status)
    ) {
      providerIds.add(record.providerId);
    }
  });

  return getProvidersForIds(entities, providerIds);
}

export function getCurrentClinicsLinkedToIssue(
  entities: AppEntities,
  issueLabelId: EntityId,
  scopeProviderIds: Iterable<EntityId> = getAllProviderIds(entities)
) {
  const clinicsById = new Map<EntityId, string>();
  getCurrentProvidersLinkedToIssue(entities, issueLabelId, scopeProviderIds).forEach((provider) => {
    const clinic = entities.clinics[provider.clinicId];
    if (clinic) {
      clinicsById.set(clinic.id, clinic.name);
    }
  });

  return [...clinicsById.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getProviderIdsForCurrentIssue(entities: AppEntities, issueLabelId: EntityId) {
  return getCurrentProvidersLinkedToIssue(entities, issueLabelId).map((provider) => provider.id);
}
