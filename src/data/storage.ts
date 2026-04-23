import { cloneSeedEntities } from "./seedData";
import type { AppEntities } from "../domain/types";

const STORAGE_KEY = "provider-documentation-issues-map:mvp-data";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hasMinimumShape(value: unknown): value is AppEntities {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AppEntities>;
  return Boolean(
    candidate.cdiSpecialists &&
      candidate.clinics &&
      candidate.providers &&
      candidate.issueLabels &&
      candidate.providerIssueRecords
  );
}

export function loadAppEntities(): AppEntities {
  if (!canUseLocalStorage()) {
    return cloneSeedEntities();
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return cloneSeedEntities();
  }

  try {
    const parsed = JSON.parse(stored);
    return hasMinimumShape(parsed) ? parsed : cloneSeedEntities();
  } catch {
    return cloneSeedEntities();
  }
}

export function saveAppEntities(entities: AppEntities) {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
  }
}

export function resetStoredEntities(): AppEntities {
  const fresh = cloneSeedEntities();
  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }
  return fresh;
}
