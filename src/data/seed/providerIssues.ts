import type { ProviderIssue } from '@/types/domain';
import { seedProviders } from './providers';

const LABEL_IDS = [
  'il-missing-specificity',
  'il-visit-dx-not-documented',
  'il-unsupported-wording',
  'il-unspecified-laterality',
  'il-acute-vs-chronic',
  'il-status-missing',
  'il-linkage',
  'il-query-pending',
  'il-hcc-missed',
  'il-comorbidity-not-addressed',
];

const STATUSES: ProviderIssue['status'][] = [
  'Active',
  'Active',
  'Improving',
  'Active',
  'Resolved',
  'Improving',
];

const NOTES = [
  'Fabricated sample: recent documentation review found repeated missing diagnosis specificity.',
  'Fabricated sample: CDI follow-up is needed to clarify note support and condition status.',
  'Fabricated sample: coaching opportunity identified during provider documentation trend review.',
  'Fabricated sample: query pattern shows inconsistent response or incomplete supporting language.',
  'Fabricated sample: issue has improved after prior education but remains worth tracking.',
  'Fabricated sample: historical issue retained for trend context after resolution.',
];

function dateFor(index: number, dayOffset = 0): string {
  const day = String(((index + dayOffset) % 24) + 1).padStart(2, '0');
  return `2026-04-${day}T00:00:00.000Z`;
}

function mk(
  issueNumber: number,
  providerId: string,
  labelId: string,
  status: ProviderIssue['status'],
  noteIndex: number,
): ProviderIssue {
  const updatedAt = dateFor(issueNumber, 3);
  const issue: ProviderIssue = {
    id: `pi-${String(issueNumber).padStart(3, '0')}`,
    providerId,
    issueLabelId: labelId,
    status,
    createdAt: dateFor(issueNumber),
    updatedAt,
    notes: NOTES[noteIndex % NOTES.length],
  };

  if (status === 'Resolved') issue.resolvedAt = updatedAt;
  return issue;
}

const providerIssues: ProviderIssue[] = [];
let issueNumber = 1;

seedProviders.forEach((provider, providerIndex) => {
  if (providerIndex % 2 !== 0) return;

  providerIssues.push(
    mk(
      issueNumber,
      provider.id,
      LABEL_IDS[providerIndex % LABEL_IDS.length],
      STATUSES[providerIndex % STATUSES.length],
      providerIndex,
    ),
  );
  issueNumber += 1;

  if (providerIndex % 17 === 0) {
    providerIssues.push(
      mk(
        issueNumber,
        provider.id,
        LABEL_IDS[(providerIndex + 3) % LABEL_IDS.length],
        STATUSES[(providerIndex + 2) % STATUSES.length],
        providerIndex + 2,
      ),
    );
    issueNumber += 1;
  }
});

export const seedProviderIssues: ProviderIssue[] = providerIssues;
