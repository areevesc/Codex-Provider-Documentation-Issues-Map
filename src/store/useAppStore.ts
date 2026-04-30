import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CDISpecialist,
  Clinic,
  HealthSystem,
  IssueLabel,
  Provider,
  ProviderIssue,
  ProviderIssueAttachment,
  IssueStatus,
} from '@/types/domain';
import type { NodeType } from '@/types/graph';
import { seedRepository } from '@/data/repository/seedRepository';
import { newId, graphNodeId } from '@/lib/ids';
import { nowIso } from '@/lib/dates';

const STORAGE_KEY = 'cdi-prototype';
const STORAGE_VERSION = 5;

type ById<T> = Record<string, T>;

function indexById<T extends { id: string }>(items: readonly T[]): ById<T> {
  const out: ById<T> = {};
  for (const item of items) out[item.id] = item;
  return out;
}

interface EntitiesSlice {
  healthSystems: ById<HealthSystem>;
  specialists: ById<CDISpecialist>;
  clinics: ById<Clinic>;
  providers: ById<Provider>;
  issueLabels: ById<IssueLabel>;
  providerIssues: ById<ProviderIssue>;
}

interface UiSlice {
  selectedNodeId: string | null;
  selectedNodeType: NodeType | null;
  specialistFilterId: string | null;
  searchQuery: string;
  visibleNodeTypes: Record<NodeType, boolean>;
  graphLayoutPositions: Record<string, { x: number; y: number }>;
  /** When a label is selected from within a hierarchy context, this holds the
   *  provider IDs in scope so the right panel can show a scoped view. Null
   *  means global (e.g. selected from search or Issue Library). */
  labelScopeProviderIds: string[] | null;
  appearanceMode: 'dark' | 'light';
  colorTheme: 'classic' | 'clinical' | 'rose';
}

export interface AppState extends EntitiesSlice, UiSlice {
  // selection
  setSelection(id: string | null, type: NodeType | null): void;
  clearSelection(): void;
  /** Select a label and remember which provider IDs it was opened from. */
  selectLabelInScope(labelId: string, providerIds: string[]): void;

  // ui
  setSpecialistFilter(id: string | null): void;
  setSearchQuery(q: string): void;
  setVisibleNodeTypes(updates: Partial<Record<NodeType, boolean>>): void;
  saveLayoutPositions(positions: Record<string, { x: number; y: number }>): void;
  setAppearanceMode(mode: UiSlice['appearanceMode']): void;
  setColorTheme(theme: UiSlice['colorTheme']): void;

  // mutations — organization structure
  createHealthSystem(name: string): HealthSystem;
  updateHealthSystem(id: string, updates: Pick<HealthSystem, 'name'>): void;
  deleteHealthSystem(id: string): void;
  createSpecialist(name: string, healthSystemId: string): CDISpecialist;
  updateSpecialist(id: string, updates: Pick<CDISpecialist, 'name'>): void;
  deleteSpecialist(id: string): void;
  createClinic(name: string, cdiSpecialistId: string): Clinic;
  updateClinic(id: string, updates: Pick<Clinic, 'name'>): void;
  deleteClinic(id: string): void;
  createProvider(name: string, clinicId: string, specialty?: string): Provider;
  updateProvider(id: string, updates: Pick<Provider, 'name' | 'specialty'>): void;
  deleteProvider(id: string): void;

  // mutations — provider issues
  assignIssueToProvider(
    providerId: string,
    issueLabelId: string,
    initialNotes?: string,
    initialAttachments?: ProviderIssueAttachment[],
  ): ProviderIssue;
  updateProviderIssue(
    id: string,
    updates: Partial<Pick<ProviderIssue, 'status' | 'notes' | 'attachments'>>,
  ): void;
  deleteProviderIssue(id: string): void;

  // mutations — issue labels
  createIssueLabel(name: string, description: string): IssueLabel;
  updateIssueLabel(id: string, updates: Partial<Pick<IssueLabel, 'name' | 'description'>>): void;

  // dev
  resetToSeed(): void;
}

function initialEntities(): EntitiesSlice {
  const seed = seedRepository.loadAll();
  return {
    healthSystems: indexById(seed.healthSystems),
    specialists: indexById(seed.specialists),
    clinics: indexById(seed.clinics),
    providers: indexById(seed.providers),
    issueLabels: indexById(seed.issueLabels),
    providerIssues: indexById(seed.providerIssues),
  };
}

function initialUi(): UiSlice {
  return {
    selectedNodeId: null,
    selectedNodeType: null,
    specialistFilterId: null,
    searchQuery: '',
    visibleNodeTypes: {
      healthSystem: true,
      specialist: true,
      clinic: true,
      provider: true,
      label: true,
    },
    graphLayoutPositions: {},
    labelScopeProviderIds: null,
    appearanceMode: 'dark',
    colorTheme: 'classic',
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialEntities(),
      ...initialUi(),

      setSelection(id, type) {
        set({ selectedNodeId: id, selectedNodeType: type, labelScopeProviderIds: null });
      },
      clearSelection() {
        set({ selectedNodeId: null, selectedNodeType: null, labelScopeProviderIds: null });
      },
      selectLabelInScope(labelId, providerIds) {
        set({
          selectedNodeId: graphNodeId.label(labelId),
          selectedNodeType: 'label',
          labelScopeProviderIds: providerIds,
        });
      },

      setSpecialistFilter(id) {
        set({ specialistFilterId: id });
      },
      setSearchQuery(q) {
        set({ searchQuery: q });
      },
      setVisibleNodeTypes(updates) {
        set((s) => ({ visibleNodeTypes: { ...s.visibleNodeTypes, ...updates } }));
      },
      saveLayoutPositions(positions) {
        set({ graphLayoutPositions: positions });
      },
      setAppearanceMode(mode) {
        set({ appearanceMode: mode });
      },
      setColorTheme(theme) {
        set({ colorTheme: theme });
      },

      createHealthSystem(name) {
        const id = newId('healthSystem');
        const record: HealthSystem = { id, name: name.trim() };
        set((s) => ({ healthSystems: { ...s.healthSystems, [id]: record } }));
        return record;
      },

      updateHealthSystem(id, updates) {
        const existing = get().healthSystems[id];
        if (!existing) return;
        set((s) => ({
          healthSystems: {
            ...s.healthSystems,
            [id]: { ...existing, name: updates.name.trim() },
          },
        }));
      },

      deleteHealthSystem(id) {
        set((s) => {
          const specialistIds = new Set(
            Object.values(s.specialists)
              .filter((sp) => sp.healthSystemId === id)
              .map((sp) => sp.id),
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
          return deleteOrgRecords(s, {
            healthSystemIds: new Set([id]),
            specialistIds,
            clinicIds,
            providerIds,
          });
        });
      },

      createSpecialist(name, healthSystemId) {
        const id = newId('specialist');
        const record: CDISpecialist = { id, name: name.trim(), healthSystemId };
        set((s) => ({ specialists: { ...s.specialists, [id]: record } }));
        return record;
      },

      updateSpecialist(id, updates) {
        const existing = get().specialists[id];
        if (!existing) return;
        set((s) => ({
          specialists: {
            ...s.specialists,
            [id]: { ...existing, name: updates.name.trim() },
          },
        }));
      },

      deleteSpecialist(id) {
        set((s) => {
          const clinicIds = new Set(
            Object.values(s.clinics)
              .filter((clinic) => clinic.cdiSpecialistId === id)
              .map((clinic) => clinic.id),
          );
          const providerIds = new Set(
            Object.values(s.providers)
              .filter((provider) => clinicIds.has(provider.clinicId))
              .map((provider) => provider.id),
          );
          return deleteOrgRecords(s, {
            healthSystemIds: new Set(),
            specialistIds: new Set([id]),
            clinicIds,
            providerIds,
          });
        });
      },

      createClinic(name, cdiSpecialistId) {
        const id = newId('clinic');
        const record: Clinic = { id, name: name.trim(), cdiSpecialistId };
        set((s) => ({ clinics: { ...s.clinics, [id]: record } }));
        return record;
      },

      updateClinic(id, updates) {
        const existing = get().clinics[id];
        if (!existing) return;
        set((s) => ({
          clinics: {
            ...s.clinics,
            [id]: { ...existing, name: updates.name.trim() },
          },
        }));
      },

      deleteClinic(id) {
        set((s) => {
          const providerIds = new Set(
            Object.values(s.providers)
              .filter((provider) => provider.clinicId === id)
              .map((provider) => provider.id),
          );
          return deleteOrgRecords(s, {
            healthSystemIds: new Set(),
            specialistIds: new Set(),
            clinicIds: new Set([id]),
            providerIds,
          });
        });
      },

      createProvider(name, clinicId, specialty = '') {
        const id = newId('provider');
        const trimmedSpecialty = specialty.trim();
        const record: Provider = {
          id,
          name: name.trim(),
          clinicId,
          ...(trimmedSpecialty ? { specialty: trimmedSpecialty } : {}),
        };
        set((s) => ({ providers: { ...s.providers, [id]: record } }));
        return record;
      },

      updateProvider(id, updates) {
        const existing = get().providers[id];
        if (!existing) return;
        const trimmedSpecialty = updates.specialty?.trim();
        const next: Provider = {
          ...existing,
          name: updates.name.trim(),
          ...(trimmedSpecialty ? { specialty: trimmedSpecialty } : { specialty: undefined }),
        };
        set((s) => ({ providers: { ...s.providers, [id]: next } }));
      },

      deleteProvider(id) {
        set((s) =>
          deleteOrgRecords(s, {
            healthSystemIds: new Set(),
            specialistIds: new Set(),
            clinicIds: new Set(),
            providerIds: new Set([id]),
          }),
        );
      },

      assignIssueToProvider(providerId, issueLabelId, initialNotes = '', initialAttachments = []) {
        const id = newId('providerIssue');
        const now = nowIso();
        const record: ProviderIssue = {
          id,
          providerId,
          issueLabelId,
          status: 'Active',
          notes: initialNotes,
          ...(initialAttachments.length > 0 ? { attachments: initialAttachments } : {}),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          providerIssues: { ...s.providerIssues, [id]: record },
        }));
        return record;
      },

      updateProviderIssue(id, updates) {
        const existing = get().providerIssues[id];
        if (!existing) return;
        const nextStatus: IssueStatus = updates.status ?? existing.status;
        const next: ProviderIssue = {
          ...existing,
          ...updates,
          status: nextStatus,
          updatedAt: nowIso(),
        };
        // resolvedAt lifecycle: stamp on transition to Resolved; clear on
        // transition away from Resolved.
        if (nextStatus === 'Resolved' && existing.status !== 'Resolved') {
          next.resolvedAt = next.updatedAt;
        } else if (nextStatus !== 'Resolved' && existing.status === 'Resolved') {
          next.resolvedAt = undefined;
        }
        set((s) => ({ providerIssues: { ...s.providerIssues, [id]: next } }));
      },

      deleteProviderIssue(id) {
        set((s) => {
          const providerIssues = { ...s.providerIssues };
          delete providerIssues[id];
          return { providerIssues };
        });
      },

      createIssueLabel(name, description) {
        const id = newId('issueLabel');
        const now = nowIso();
        const label: IssueLabel = {
          id,
          name: name.trim(),
          description: description.trim(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ issueLabels: { ...s.issueLabels, [id]: label } }));
        return label;
      },

      updateIssueLabel(id, updates) {
        const existing = get().issueLabels[id];
        if (!existing) return;
        const next: IssueLabel = {
          ...existing,
          ...updates,
          ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
          ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
          updatedAt: nowIso(),
        };
        set((s) => ({ issueLabels: { ...s.issueLabels, [id]: next } }));
      },

      resetToSeed() {
        set({ ...initialEntities(), ...initialUi() });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: migratePersistedState,
      // UI state (selection, search) intentionally persists too so navigation
      // feels continuous across refreshes. Layout positions persist so the
      // graph doesn't re-shuffle.
    },
  ),
);

function migratePersistedState(
  persistedState: unknown,
  persistedVersion?: number,
): EntitiesSlice & UiSlice {
  const baseline = { ...initialEntities(), ...initialUi() };
  if (persistedVersion !== STORAGE_VERSION) return baseline;
  if (!persistedState || typeof persistedState !== 'object') return baseline;

  const state = persistedState as Partial<EntitiesSlice & UiSlice>;
  const providerIssues: ById<ProviderIssue> = {};
  for (const [id, issue] of Object.entries(state.providerIssues ?? baseline.providerIssues)) {
    if (!issue || typeof issue !== 'object') continue;
    if ((issue as { status?: string }).status === 'Archived') continue;
    providerIssues[id] = issue;
  }

  return {
    ...baseline,
    ...state,
    providerIssues,
  };
}

function deleteOrgRecords(
  s: EntitiesSlice & UiSlice,
  ids: {
    healthSystemIds: Set<string>;
    specialistIds: Set<string>;
    clinicIds: Set<string>;
    providerIds: Set<string>;
  },
): Partial<EntitiesSlice & UiSlice> {
  const healthSystems = { ...s.healthSystems };
  const specialists = { ...s.specialists };
  const clinics = { ...s.clinics };
  const providers = { ...s.providers };
  const providerIssues = { ...s.providerIssues };

  for (const id of ids.healthSystemIds) delete healthSystems[id];
  for (const id of ids.specialistIds) delete specialists[id];
  for (const id of ids.clinicIds) delete clinics[id];
  for (const id of ids.providerIds) delete providers[id];
  for (const issue of Object.values(s.providerIssues)) {
    if (ids.providerIds.has(issue.providerId)) delete providerIssues[issue.id];
  }

  return {
    healthSystems,
    specialists,
    clinics,
    providers,
    providerIssues,
    selectedNodeId: null,
    selectedNodeType: null,
    labelScopeProviderIds: null,
  };
}
