/**
 * Core domain types for the CDI Relationship Tracker.
 *
 * Relationship model (from SPEC.md):
 *   Specialist 1 ── * Clinic 1 ── * Provider 1 ── * ProviderIssue * ── 1 IssueLabel
 *
 * IssueLabel is a global/reusable definition. ProviderIssue is the per-provider
 * instance that carries status + notes + timestamps. Notes/examples live on
 * ProviderIssue, never on IssueLabel.
 */

export type IssueStatus = 'Active' | 'Improving' | 'Resolved' | 'Archived';

export const ISSUE_STATUSES: readonly IssueStatus[] = [
  'Active',
  'Improving',
  'Resolved',
  'Archived',
] as const;

/** "Current / active" on home screen = Active + Improving (per confirmed spec interpretation). */
export const CURRENT_STATUSES: readonly IssueStatus[] = ['Active', 'Improving'] as const;

/** Historical = Resolved + Archived. Shown only on provider detail page. */
export const HISTORICAL_STATUSES: readonly IssueStatus[] = ['Resolved', 'Archived'] as const;

export function isCurrentStatus(status: IssueStatus): boolean {
  return status === 'Active' || status === 'Improving';
}

export function isHistoricalStatus(status: IssueStatus): boolean {
  return status === 'Resolved' || status === 'Archived';
}

export interface HealthSystem {
  id: string;
  name: string;
}

export interface CDISpecialist {
  id: string;
  name: string;
  healthSystemId: string;
}

export interface Clinic {
  id: string;
  name: string;
  /** A clinic belongs to exactly one CDI specialist. */
  cdiSpecialistId: string;
}

export interface Provider {
  id: string;
  name: string;
  /** A provider belongs to exactly one clinic. */
  clinicId: string;
  specialty?: string;
}

export interface IssueLabel {
  id: string;
  name: string;
  description: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
}

export interface ProviderIssue {
  id: string;
  providerId: string;
  issueLabelId: string;
  status: IssueStatus;
  /** Single combined free-text field: notes, examples, pasted excerpts. */
  notes: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
  /** ISO-8601 timestamp. */
  updatedAt: string;
  /** Set when status transitions to Resolved. Cleared when status leaves Resolved. */
  resolvedAt?: string;
}
