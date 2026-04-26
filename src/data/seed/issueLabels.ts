import type { IssueLabel } from '@/types/domain';

// Timestamps are fixed so seed data is deterministic across environments.
const CREATED = '2025-09-01T00:00:00.000Z';
const UPDATED = '2025-12-15T00:00:00.000Z';

export const seedIssueLabels: IssueLabel[] = [
  {
    id: 'il-missing-specificity',
    name: 'Missing specificity',
    description:
      'Diagnosis is documented without sufficient specificity (e.g. "heart failure" without type or acuity).',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-visit-dx-not-documented',
    name: 'Visit diagnoses listed but not documented',
    description:
      'Diagnoses appear in the assessment/problem list but are not supported in the visit note body.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-unsupported-wording',
    name: 'Unsupported diagnosis wording',
    description:
      'Wording used in the note does not meet clinical indicators typically required to support the diagnosis.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-unspecified-laterality',
    name: 'Unspecified laterality',
    description: 'Condition affecting a paired structure is documented without left/right/bilateral.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-acute-vs-chronic',
    name: 'Acute vs chronic unclear',
    description: 'Condition documented without distinguishing acute, chronic, or acute-on-chronic.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-status-missing',
    name: 'Status of condition missing',
    description:
      'Condition status (stable, worsening, in remission, resolved) is absent from the assessment.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-linkage',
    name: 'Linkage not documented',
    description:
      'Causal or "with"/"due to" linkage between conditions (e.g. diabetes with neuropathy) is not stated.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-query-pending',
    name: 'Query response pending',
    description: 'Provider has an open CDI query that has not yet been answered.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-hcc-missed',
    name: 'HCC opportunity missed',
    description:
      'Condition with a potential HCC mapping was discussed but not captured as a documented diagnosis.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
  {
    id: 'il-comorbidity-not-addressed',
    name: 'Co-morbidity not addressed',
    description:
      'Known chronic co-morbidity is present in history but not assessed or addressed in the encounter note.',
    createdAt: CREATED,
    updatedAt: UPDATED,
  },
];
