import type { ProviderImportRow } from '@/store/useAppStore';
import { ISSUE_STATUSES } from '@/types/domain';
import type { IssueStatus } from '@/types/domain';

const REQUIRED_HEADERS = ['health_system', 'cdi_specialist', 'clinic', 'provider'] as const;
const OPTIONAL_HEADERS = [
  'specialty',
  'issue_label',
  'issue_label_description',
  'status',
  'notes',
  'created_at',
  'updated_at',
  'resolved_at',
] as const;
const ALLOWED_HEADERS = new Set<string>([...REQUIRED_HEADERS, ...OPTIONAL_HEADERS]);

export interface ProviderCsvParseResult {
  rows: ProviderImportRow[];
  warnings: string[];
}

export interface ProviderCsvPreview {
  healthSystemCount: number;
  specialistCount: number;
  clinicCount: number;
  providerCount: number;
  issueRowCount: number;
  repeatedProviderRows: number;
  issueLabelCount: number;
  sampleRows: ProviderImportRow[];
}

export function parseProviderCsv(csv: string): ProviderCsvParseResult {
  const records = parseCsvRecords(csv);
  if (records.length === 0) throw new Error('CSV file is empty.');

  const headers = records[0].map(normalizeHeader);
  if (headers.length === 0 || headers.every((header) => header === '')) {
    throw new Error('CSV header row is empty.');
  }

  const duplicateHeader = headers.find((header, index) => header && headers.indexOf(header) !== index);
  if (duplicateHeader) throw new Error(`Duplicate CSV header: ${duplicateHeader}.`);

  const unknownHeaders = headers.filter((header) => !ALLOWED_HEADERS.has(header));
  if (unknownHeaders.length > 0) {
    throw new Error(
      `Unsupported CSV header(s): ${unknownHeaders.join(', ')}. Only ${[
        ...REQUIRED_HEADERS,
        ...OPTIONAL_HEADERS,
      ].join(', ')} are allowed.`,
    );
  }

  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV header(s): ${missingHeaders.join(', ')}.`);
  }

  const rows: ProviderImportRow[] = [];
  const warnings: string[] = [];

  for (let recordIndex = 1; recordIndex < records.length; recordIndex += 1) {
    const record = records[recordIndex];
    const lineNumber = recordIndex + 1;
    if (record.every((value) => value.trim() === '')) continue;
    if (record.length > headers.length) {
      throw new Error(`Line ${lineNumber} has more values than the header row.`);
    }

    const valueFor = (header: string) => {
      const columnIndex = headers.indexOf(header);
      return columnIndex === -1 ? '' : (record[columnIndex] ?? '').trim();
    };

    const row: ProviderImportRow = {
      healthSystem: valueFor('health_system'),
      cdiSpecialist: valueFor('cdi_specialist'),
      clinic: valueFor('clinic'),
      provider: valueFor('provider'),
      specialty: valueFor('specialty'),
      issueLabel: valueFor('issue_label'),
      issueLabelDescription: valueFor('issue_label_description'),
      status: parseStatus(valueFor('status'), lineNumber, warnings),
      notes: valueFor('notes'),
      createdAt: parseOptionalIso(valueFor('created_at'), 'created_at', lineNumber, warnings),
      updatedAt: parseOptionalIso(valueFor('updated_at'), 'updated_at', lineNumber, warnings),
      resolvedAt: parseOptionalIso(valueFor('resolved_at'), 'resolved_at', lineNumber, warnings),
    };

    const missingValue = REQUIRED_HEADERS.find((header) => valueFor(header) === '');
    if (missingValue) {
      warnings.push(`Line ${lineNumber} skipped: ${missingValue} is blank.`);
      continue;
    }

    rows.push(row);
  }

  if (rows.length === 0) throw new Error('CSV contains no importable provider rows.');

  return { rows, warnings };
}

export function previewProviderImport(rows: ProviderImportRow[]): ProviderCsvPreview {
  const healthSystems = new Set<string>();
  const specialists = new Set<string>();
  const clinics = new Set<string>();
  const providers = new Set<string>();
  const issueLabels = new Set<string>();
  let repeatedProviderRows = 0;
  let issueRowCount = 0;

  for (const row of rows) {
    const healthSystem = normalizeName(row.healthSystem);
    const specialist = normalizeName(row.cdiSpecialist);
    const clinic = normalizeName(row.clinic);
    const provider = normalizeName(row.provider);
    const specialistKey = `${healthSystem}|${specialist}`;
    const clinicKey = `${specialistKey}|${clinic}`;
    const providerKey = `${clinicKey}|${provider}`;

    healthSystems.add(healthSystem);
    specialists.add(specialistKey);
    clinics.add(clinicKey);
    if (providers.has(providerKey)) repeatedProviderRows += 1;
    providers.add(providerKey);
    if (row.issueLabel?.trim()) {
      issueRowCount += 1;
      issueLabels.add(normalizeName(row.issueLabel));
    }
  }

  return {
    healthSystemCount: healthSystems.size,
    specialistCount: specialists.size,
    clinicCount: clinics.size,
    providerCount: providers.size,
    issueRowCount,
    repeatedProviderRows,
    issueLabelCount: issueLabels.size,
    sampleRows: rows.slice(0, 5),
  };
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function parseStatus(
  value: string,
  lineNumber: number,
  warnings: string[],
): IssueStatus | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const status = ISSUE_STATUSES.find((candidate) => namesMatch(candidate, trimmed));
  if (status) return status;
  warnings.push(
    `Line ${lineNumber}: unsupported status "${trimmed}" changed to Active. Use Active, Improving, or Resolved.`,
  );
  return 'Active';
}

function parseOptionalIso(
  value: string,
  fieldName: string,
  lineNumber: number,
  warnings: string[],
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    warnings.push(`Line ${lineNumber}: ${fieldName} is not a valid date and was ignored.`);
    return undefined;
  }
  return date.toISOString();
}

function namesMatch(left: string, right: string): boolean {
  return normalizeName(left) === normalizeName(right);
}

function parseCsvRecords(csv: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      record.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      record.push(field);
      records.push(record);
      record = [];
      field = '';
      continue;
    }

    field += char;
  }

  if (inQuotes) throw new Error('CSV contains an unclosed quoted field.');
  if (field !== '' || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
}
