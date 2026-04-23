import { create } from "zustand";
import { loadAppEntities, resetStoredEntities, saveAppEntities } from "../data/storage";
import type {
  AppEntities,
  EntityId,
  GraphNodeRef,
  IssueLabel,
  MutationResult,
  ProviderIssueRecord,
  ProviderIssueStatus
} from "../domain/types";
import { isCurrentIssueStatus, values } from "../domain/selectors";

interface AppStore {
  entities: AppEntities;
  selectedNode: GraphNodeRef | null;
  selectedCdiSpecialistId: EntityId | null;
  searchQuery: string;
  selectNode: (node: GraphNodeRef | null) => void;
  setSelectedCdiSpecialistId: (id: EntityId | null) => void;
  setSearchQuery: (query: string) => void;
  assignIssueToProvider: (providerId: EntityId, issueLabelId: EntityId) => MutationResult;
  updateProviderIssueRecord: (
    providerIssueRecordId: EntityId,
    patch: Partial<Pick<ProviderIssueRecord, "status" | "notesExamples">>
  ) => MutationResult;
  createIssueLabel: (input: Pick<IssueLabel, "name" | "description">) => MutationResult;
  editIssueLabelDescription: (issueLabelId: EntityId, description: string) => MutationResult;
  resetDemoData: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function saveAndReturn(entities: AppEntities) {
  saveAppEntities(entities);
  return entities;
}

function updateResolvedAt(status: ProviderIssueStatus, previous: ProviderIssueRecord) {
  if (status === "Resolved") {
    return previous.resolvedAt ?? nowIso();
  }

  return undefined;
}

export const useAppStore = create<AppStore>((set, get) => ({
  entities: loadAppEntities(),
  selectedNode: null,
  selectedCdiSpecialistId: null,
  searchQuery: "",
  selectNode: (node) => set({ selectedNode: node }),
  setSelectedCdiSpecialistId: (id) =>
    set((state) => ({
      selectedCdiSpecialistId: id,
      selectedNode: state.selectedNode?.type === "cdi" ? (id ? { type: "cdi", id } : null) : state.selectedNode
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  assignIssueToProvider: (providerId, issueLabelId) => {
    const { entities } = get();
    const provider = entities.providers[providerId];
    const issueLabel = entities.issueLabels[issueLabelId];

    if (!provider || !issueLabel) {
      return { ok: false, message: "Choose a valid provider and issue label." };
    }

    const existing = values(entities.providerIssueRecords).find(
      (record) => record.providerId === providerId && record.issueLabelId === issueLabelId
    );

    if (existing && isCurrentIssueStatus(existing.status)) {
      return { ok: false, message: "That issue is already current for this provider.", id: existing.id };
    }

    if (existing) {
      const updated: ProviderIssueRecord = {
        ...existing,
        status: "Active",
        updatedAt: nowIso(),
        resolvedAt: undefined
      };
      const nextEntities = {
        ...entities,
        providerIssueRecords: {
          ...entities.providerIssueRecords,
          [existing.id]: updated
        }
      };
      set({ entities: saveAndReturn(nextEntities) });
      return { ok: true, message: "Existing provider issue reopened as active.", id: existing.id };
    }

    const createdAt = nowIso();
    const id = `pir-${providerId}-${slugify(issueLabel.name)}-${createdAt.slice(0, 10)}`;
    const nextRecord: ProviderIssueRecord = {
      id,
      providerId,
      issueLabelId,
      status: "Active",
      notesExamples: "",
      createdAt,
      updatedAt: createdAt
    };
    const nextEntities = {
      ...entities,
      providerIssueRecords: {
        ...entities.providerIssueRecords,
        [id]: nextRecord
      }
    };

    set({ entities: saveAndReturn(nextEntities) });
    return { ok: true, message: "Issue assigned to provider.", id };
  },
  updateProviderIssueRecord: (providerIssueRecordId, patch) => {
    const { entities } = get();
    const record = entities.providerIssueRecords[providerIssueRecordId];

    if (!record) {
      return { ok: false, message: "Provider issue record not found." };
    }

    const nextStatus = patch.status ?? record.status;
    const nextRecord: ProviderIssueRecord = {
      ...record,
      ...patch,
      status: nextStatus,
      updatedAt: nowIso(),
      resolvedAt: updateResolvedAt(nextStatus, record)
    };
    const nextEntities = {
      ...entities,
      providerIssueRecords: {
        ...entities.providerIssueRecords,
        [record.id]: nextRecord
      }
    };

    set({ entities: saveAndReturn(nextEntities) });
    return { ok: true, message: "Provider issue updated.", id: record.id };
  },
  createIssueLabel: ({ name, description }) => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      return { ok: false, message: "Issue label name is required." };
    }

    const { entities } = get();
    const duplicate = values(entities.issueLabels).find(
      (issueLabel) => issueLabel.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      return { ok: false, message: "An issue label with that name already exists.", id: duplicate.id };
    }

    const timestamp = nowIso();
    const baseId = `issue-${slugify(trimmedName)}`;
    const id = entities.issueLabels[baseId] ? `${baseId}-${Date.now()}` : baseId;
    const issueLabel: IssueLabel = {
      id,
      name: trimmedName,
      description: trimmedDescription,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const nextEntities = {
      ...entities,
      issueLabels: {
        ...entities.issueLabels,
        [id]: issueLabel
      }
    };

    set({ entities: saveAndReturn(nextEntities) });
    return { ok: true, message: "Issue label created.", id };
  },
  editIssueLabelDescription: (issueLabelId, description) => {
    const { entities } = get();
    const issueLabel = entities.issueLabels[issueLabelId];

    if (!issueLabel) {
      return { ok: false, message: "Issue label not found." };
    }

    const nextEntities = {
      ...entities,
      issueLabels: {
        ...entities.issueLabels,
        [issueLabelId]: {
          ...issueLabel,
          description: description.trim(),
          updatedAt: nowIso()
        }
      }
    };

    set({ entities: saveAndReturn(nextEntities) });
    return { ok: true, message: "Issue label description updated.", id: issueLabelId };
  },
  resetDemoData: () => {
    const entities = resetStoredEntities();
    set({
      entities,
      selectedNode: null,
      selectedCdiSpecialistId: null,
      searchQuery: ""
    });
  }
}));
