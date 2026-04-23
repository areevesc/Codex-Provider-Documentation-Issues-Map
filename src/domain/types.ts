export type EntityId = string;

export type ProviderIssueStatus = "Active" | "Improving" | "Resolved" | "Archived";

export type GraphNodeType = "cdi" | "clinic" | "provider" | "issue";

export type GraphNodeId = `${GraphNodeType}:${string}`;

export interface CdiSpecialist {
  id: EntityId;
  name: string;
}

export interface Clinic {
  id: EntityId;
  name: string;
  cdiSpecialistId: EntityId;
}

export interface Provider {
  id: EntityId;
  name: string;
  clinicId: EntityId;
}

export interface IssueLabel {
  id: EntityId;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderIssueRecord {
  id: EntityId;
  providerId: EntityId;
  issueLabelId: EntityId;
  status: ProviderIssueStatus;
  notesExamples: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface AppEntities {
  cdiSpecialists: Record<EntityId, CdiSpecialist>;
  clinics: Record<EntityId, Clinic>;
  providers: Record<EntityId, Provider>;
  issueLabels: Record<EntityId, IssueLabel>;
  providerIssueRecords: Record<EntityId, ProviderIssueRecord>;
}

export interface GraphNodeRef {
  type: GraphNodeType;
  id: EntityId;
}

export interface IssueSummary {
  issueLabel: IssueLabel;
  activeProviderCount: number;
  activeClinicCount: number;
}

export interface ProviderIssueDetail {
  record: ProviderIssueRecord;
  issueLabel: IssueLabel;
}

export interface MutationResult {
  ok: boolean;
  message: string;
  id?: EntityId;
}

export const CURRENT_ISSUE_STATUSES: ProviderIssueStatus[] = ["Active", "Improving"];

export const HISTORICAL_ISSUE_STATUSES: ProviderIssueStatus[] = ["Resolved", "Archived"];
