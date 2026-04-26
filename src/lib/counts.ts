import type { AppState } from '@/store/useAppStore';
import {
  currentLabelProviderMap,
  getProvidersForClinic,
  getProvidersForSpecialist,
  listProviderIssues,
} from '@/store/selectors';
import { isCurrentStatus } from '@/types/domain';

export interface LabelCount {
  labelId: string;
  providerCount: number;
}

/** Active counts of provider→label pairs, scoped to a health system. */
export function activeIssueCountsForHealthSystem(
  s: AppState,
  healthSystemId: string,
): LabelCount[] {
  const specialistIds = new Set(
    Object.values(s.specialists)
      .filter((sp) => sp.healthSystemId === healthSystemId)
      .map((sp) => sp.id),
  );
  const clinicIds = new Set(
    Object.values(s.clinics)
      .filter((c) => specialistIds.has(c.cdiSpecialistId))
      .map((c) => c.id),
  );
  const providerIds = Object.values(s.providers)
    .filter((p) => clinicIds.has(p.clinicId))
    .map((p) => p.id);
  const map = currentLabelProviderMap(s, providerIds);
  return [...map.entries()]
    .map(([labelId, providerSet]) => ({ labelId, providerCount: providerSet.size }))
    .sort((a, b) => b.providerCount - a.providerCount);
}

/** Active counts (Active + Improving) of provider→label pairs, scoped to a CDI specialist. */
export function activeIssueCountsForSpecialist(
  s: AppState,
  specialistId: string,
): LabelCount[] {
  const providers = getProvidersForSpecialist(s, specialistId);
  const map = currentLabelProviderMap(
    s,
    providers.map((p) => p.id),
  );
  return [...map.entries()]
    .map(([labelId, providerSet]) => ({ labelId, providerCount: providerSet.size }))
    .sort((a, b) => b.providerCount - a.providerCount);
}

/** Active counts of provider→label pairs, scoped to one clinic. */
export function activeIssueCountsForClinic(s: AppState, clinicId: string): LabelCount[] {
  const providers = getProvidersForClinic(s, clinicId);
  const map = currentLabelProviderMap(
    s,
    providers.map((p) => p.id),
  );
  return [...map.entries()]
    .map(([labelId, providerSet]) => ({ labelId, providerCount: providerSet.size }))
    .sort((a, b) => b.providerCount - a.providerCount);
}

/** Global count of distinct providers currently linked to a given issue label. */
export function globalActiveProviderCountForLabel(s: AppState, labelId: string): number {
  const providerIds = new Set<string>();
  for (const pi of listProviderIssues(s)) {
    if (pi.issueLabelId === labelId && isCurrentStatus(pi.status)) {
      providerIds.add(pi.providerId);
    }
  }
  return providerIds.size;
}

/** Global count of distinct clinics whose providers are currently linked to a given issue label. */
export function globalActiveClinicCountForLabel(s: AppState, labelId: string): number {
  const clinicIds = new Set<string>();
  for (const pi of listProviderIssues(s)) {
    if (pi.issueLabelId !== labelId) continue;
    if (!isCurrentStatus(pi.status)) continue;
    const provider = s.providers[pi.providerId];
    if (provider) clinicIds.add(provider.clinicId);
  }
  return clinicIds.size;
}

/** Providers currently linked to the given label (deduplicated). */
export function activeProvidersForLabel(
  s: AppState,
  labelId: string,
): { providerId: string; providerIssueIds: string[] }[] {
  const byProvider = new Map<string, string[]>();
  for (const pi of listProviderIssues(s)) {
    if (pi.issueLabelId !== labelId) continue;
    if (!isCurrentStatus(pi.status)) continue;
    const existing = byProvider.get(pi.providerId);
    if (existing) existing.push(pi.id);
    else byProvider.set(pi.providerId, [pi.id]);
  }
  return [...byProvider.entries()].map(([providerId, providerIssueIds]) => ({
    providerId,
    providerIssueIds,
  }));
}

/** Clinics currently linked (via any of their providers) to the given label. */
export function activeClinicsForLabel(s: AppState, labelId: string): string[] {
  const clinicIds = new Set<string>();
  for (const pi of listProviderIssues(s)) {
    if (pi.issueLabelId !== labelId) continue;
    if (!isCurrentStatus(pi.status)) continue;
    const provider = s.providers[pi.providerId];
    if (provider) clinicIds.add(provider.clinicId);
  }
  return [...clinicIds];
}

/** Which CDI specialists have at least one provider currently linked to the given label. */
export function activeSpecialistsForLabel(s: AppState, labelId: string): string[] {
  const specialistIds = new Set<string>();
  for (const pi of listProviderIssues(s)) {
    if (pi.issueLabelId !== labelId) continue;
    if (!isCurrentStatus(pi.status)) continue;
    const provider = s.providers[pi.providerId];
    if (!provider) continue;
    const clinic = s.clinics[provider.clinicId];
    if (clinic) specialistIds.add(clinic.cdiSpecialistId);
  }
  return [...specialistIds];
}

/**
 * Used by Issue Library table — for every label, active provider count and
 * active clinic count. Returns a map keyed by labelId.
 */
export function allLabelUsageCounts(
  s: AppState,
): Record<string, { providerCount: number; clinicCount: number }> {
  const providerSets = new Map<string, Set<string>>();
  const clinicSets = new Map<string, Set<string>>();
  for (const pi of listProviderIssues(s)) {
    if (!isCurrentStatus(pi.status)) continue;
    let ps = providerSets.get(pi.issueLabelId);
    if (!ps) {
      ps = new Set();
      providerSets.set(pi.issueLabelId, ps);
    }
    ps.add(pi.providerId);

    const provider = s.providers[pi.providerId];
    if (provider) {
      let cs = clinicSets.get(pi.issueLabelId);
      if (!cs) {
        cs = new Set();
        clinicSets.set(pi.issueLabelId, cs);
      }
      cs.add(provider.clinicId);
    }
  }

  const out: Record<string, { providerCount: number; clinicCount: number }> = {};
  for (const labelId of Object.keys(s.issueLabels)) {
    out[labelId] = {
      providerCount: providerSets.get(labelId)?.size ?? 0,
      clinicCount: clinicSets.get(labelId)?.size ?? 0,
    };
  }
  return out;
}
