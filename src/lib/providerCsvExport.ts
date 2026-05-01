import type { AppState } from '@/store/useAppStore';
import type { ProviderIssue } from '@/types/domain';

export const PROVIDER_ISSUE_CSV_HEADERS = [
  'health_system',
  'cdi_specialist',
  'clinic',
  'provider',
  'specialty',
  'issue_label',
  'status',
  'notes',
] as const;

export function buildProviderIssueCsv(s: AppState): string {
  const rows: string[][] = [PROVIDER_ISSUE_CSV_HEADERS.map((header) => header)];
  const healthSystems = Object.values(s.healthSystems).sort((a, b) => a.name.localeCompare(b.name));

  for (const healthSystem of healthSystems) {
    const specialists = Object.values(s.specialists)
      .filter((specialist) => specialist.healthSystemId === healthSystem.id)
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const specialist of specialists) {
      const clinics = Object.values(s.clinics)
        .filter((clinic) => clinic.cdiSpecialistId === specialist.id)
        .sort((a, b) => a.name.localeCompare(b.name));

      for (const clinic of clinics) {
        const providers = Object.values(s.providers)
          .filter((provider) => provider.clinicId === clinic.id)
          .sort((a, b) => a.name.localeCompare(b.name));

        for (const provider of providers) {
          const providerIssues = Object.values(s.providerIssues)
            .filter((issue) => issue.providerId === provider.id)
            .sort((a, b) => sortIssueRows(s, a, b));

          if (providerIssues.length === 0) {
            rows.push([
              healthSystem.name,
              specialist.name,
              clinic.name,
              provider.name,
              provider.specialty ?? '',
              '',
              '',
              '',
            ]);
            continue;
          }

          for (const issue of providerIssues) {
            const label = s.issueLabels[issue.issueLabelId];
            rows.push([
              healthSystem.name,
              specialist.name,
              clinic.name,
              provider.name,
              provider.specialty ?? '',
              label?.name ?? '',
              issue.status,
              issue.notes,
            ]);
          }
        }
      }
    }
  }

  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function sortIssueRows(s: AppState, a: ProviderIssue, b: ProviderIssue): number {
  const aLabel = s.issueLabels[a.issueLabelId]?.name ?? '';
  const bLabel = s.issueLabels[b.issueLabelId]?.name ?? '';
  return aLabel.localeCompare(bLabel) || a.createdAt.localeCompare(b.createdAt);
}

function escapeCsvCell(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}
