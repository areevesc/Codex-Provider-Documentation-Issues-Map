import type { AppState } from './useAppStore';
import type {
  CDISpecialist,
  Clinic,
  HealthSystem,
  IssueLabel,
  Provider,
  ProviderIssue,
} from '@/types/domain';
import { isCurrentStatus, isHistoricalStatus } from '@/types/domain';

/**
 * Pure derived reads over the store. These don't subscribe to the store — use
 * `useAppStore((s) => selector(s, ...))` at call sites, or wrap in `useMemo`
 * when the return value is an array/object and stability matters.
 */

// ── Basic lookups ─────────────────────────────────────────────────────────

export const getHealthSystem = (s: AppState, id: string): HealthSystem | undefined =>
  s.healthSystems[id];
export const listHealthSystems = (s: AppState): HealthSystem[] =>
  Object.values(s.healthSystems);
export const getSpecialistsForHealthSystem = (
  s: AppState,
  healthSystemId: string,
): CDISpecialist[] => listSpecialists(s).filter((sp) => sp.healthSystemId === healthSystemId);
export const getHealthSystemForSpecialist = (
  s: AppState,
  specialistId: string,
): HealthSystem | undefined => {
  const sp = getSpecialist(s, specialistId);
  return sp ? getHealthSystem(s, sp.healthSystemId) : undefined;
};

export const getSpecialist = (s: AppState, id: string): CDISpecialist | undefined =>
  s.specialists[id];
export const getClinic = (s: AppState, id: string): Clinic | undefined => s.clinics[id];
export const getProvider = (s: AppState, id: string): Provider | undefined => s.providers[id];
export const getIssueLabel = (s: AppState, id: string): IssueLabel | undefined =>
  s.issueLabels[id];
export const getProviderIssue = (s: AppState, id: string): ProviderIssue | undefined =>
  s.providerIssues[id];

export const listSpecialists = (s: AppState): CDISpecialist[] => Object.values(s.specialists);
export const listClinics = (s: AppState): Clinic[] => Object.values(s.clinics);
export const listProviders = (s: AppState): Provider[] => Object.values(s.providers);
export const listIssueLabels = (s: AppState): IssueLabel[] => Object.values(s.issueLabels);
export const listProviderIssues = (s: AppState): ProviderIssue[] =>
  Object.values(s.providerIssues);

// ── Traversal ─────────────────────────────────────────────────────────────

export const getClinicsForSpecialist = (s: AppState, specialistId: string): Clinic[] =>
  listClinics(s).filter((c) => c.cdiSpecialistId === specialistId);

export const getProvidersForClinic = (s: AppState, clinicId: string): Provider[] =>
  listProviders(s).filter((p) => p.clinicId === clinicId);

export const getProvidersForSpecialist = (s: AppState, specialistId: string): Provider[] => {
  const clinicIds = new Set(
    getClinicsForSpecialist(s, specialistId).map((c) => c.id),
  );
  return listProviders(s).filter((p) => clinicIds.has(p.clinicId));
};

export const getSpecialistForClinic = (
  s: AppState,
  clinicId: string,
): CDISpecialist | undefined => {
  const clinic = getClinic(s, clinicId);
  return clinic ? getSpecialist(s, clinic.cdiSpecialistId) : undefined;
};

export const getClinicForProvider = (s: AppState, providerId: string): Clinic | undefined => {
  const provider = getProvider(s, providerId);
  return provider ? getClinic(s, provider.clinicId) : undefined;
};

export const getSpecialistForProvider = (
  s: AppState,
  providerId: string,
): CDISpecialist | undefined => {
  const clinic = getClinicForProvider(s, providerId);
  return clinic ? getSpecialist(s, clinic.cdiSpecialistId) : undefined;
};

// ── Provider-issue scoping ────────────────────────────────────────────────

export const getProviderIssuesForProvider = (
  s: AppState,
  providerId: string,
): ProviderIssue[] => listProviderIssues(s).filter((pi) => pi.providerId === providerId);

export const getCurrentProviderIssuesForProvider = (
  s: AppState,
  providerId: string,
): ProviderIssue[] =>
  getProviderIssuesForProvider(s, providerId).filter((pi) => isCurrentStatus(pi.status));

export const getHistoricalProviderIssuesForProvider = (
  s: AppState,
  providerId: string,
): ProviderIssue[] =>
  getProviderIssuesForProvider(s, providerId).filter((pi) => isHistoricalStatus(pi.status));

export const getCurrentProviderIssuesForLabel = (
  s: AppState,
  labelId: string,
): ProviderIssue[] =>
  listProviderIssues(s).filter(
    (pi) => pi.issueLabelId === labelId && isCurrentStatus(pi.status),
  );

export const isLabelCurrentlyAssignedToProvider = (
  s: AppState,
  providerId: string,
  labelId: string,
): boolean =>
  listProviderIssues(s).some(
    (pi) =>
      pi.providerId === providerId &&
      pi.issueLabelId === labelId &&
      isCurrentStatus(pi.status),
  );

// ── Labels currently in play for a set of providers ───────────────────────

/** Returns labelId → Set<providerId> for currently active issues across the given providers. */
export function currentLabelProviderMap(
  s: AppState,
  providerIds: readonly string[],
): Map<string, Set<string>> {
  const allowed = new Set(providerIds);
  const out = new Map<string, Set<string>>();
  for (const pi of listProviderIssues(s)) {
    if (!allowed.has(pi.providerId)) continue;
    if (!isCurrentStatus(pi.status)) continue;
    let set = out.get(pi.issueLabelId);
    if (!set) {
      set = new Set();
      out.set(pi.issueLabelId, set);
    }
    set.add(pi.providerId);
  }
  return out;
}
