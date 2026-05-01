import { useRef, useState, type ChangeEvent } from 'react';
import {
  CheckCircle2,
  Download,
  FileUp,
  Library,
  Palette,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeleteRosterDataButton, ResetSeedButton } from '@/components/layout/ResetSeedButton';
import { Button, ButtonLink } from '@/components/ui/Button';
import { parseProviderCsv, previewProviderImport } from '@/lib/providerCsvImport';
import type { ProviderCsvPreview } from '@/lib/providerCsvImport';
import type { ProviderImportRow, ProviderImportSummary } from '@/store/useAppStore';
import { buildProviderIssueCsv, downloadCsv } from '@/lib/providerCsvExport';

const appearanceModes = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
] as const;

const colorThemes = [
  { value: 'clinical', label: 'Clinical', description: 'Calm slate, teal, sky, green' },
  { value: 'green', label: 'Forest', description: 'Stone, pine, teal, lime' },
  { value: 'purple', label: 'Amethyst', description: 'Gray, violet, fuchsia, teal' },
  { value: 'rose', label: 'Coral', description: 'Stone, rose, pink, teal' },
  { value: 'amber', label: 'Copper', description: 'Stone, copper, amber, green' },
] as const;

type ColorTheme = (typeof colorThemes)[number]['value'];

interface PendingImport {
  fileName: string;
  rows: ProviderImportRow[];
  preview: ProviderCsvPreview;
  warnings: string[];
}

export function SettingsPage() {
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const setAppearanceMode = useAppStore((s) => s.setAppearanceMode);
  const setColorTheme = useAppStore((s) => s.setColorTheme);
  const importProviderRows = useAppStore((s) => s.importProviderRows);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSummary, setImportSummary] = useState<ProviderImportSummary | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImportError('');
    setImportSummary(null);
    setImportWarnings([]);
    setPendingImport(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportError('Choose a .csv file.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setImportError('CSV file is too large. Keep imports under 1 MB for this prototype.');
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const parsed = parseProviderCsv(text);
      setPendingImport({
        fileName: file.name,
        rows: parsed.rows,
        preview: previewProviderImport(parsed.rows),
        warnings: parsed.warnings,
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  }

  function handleChooseImportFile() {
    const confirmed = window.confirm(
      [
        'Import adds or updates providers, issue labels, and provider issue notes from the CSV.',
        '',
        'If you want to remove demo data first, use Delete demo data before importing.',
        '',
        'Do not include PHI. Imported notes must be fabricated for now.',
      ].join('\n'),
    );
    if (!confirmed) return;
    fileInputRef.current?.click();
  }

  function handleCancelPendingImport() {
    setPendingImport(null);
    setImportWarnings([]);
    setImportError('');
  }

  function handleConfirmPendingImport() {
    if (!pendingImport) return;
    const summary = importProviderRows(pendingImport.rows);
    setImportSummary(summary);
    setImportWarnings(pendingImport.warnings);
    setPendingImport(null);
  }

  function handleExportProviderIssueCsv() {
    const csv = buildProviderIssueCsv(useAppStore.getState());
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`cdi-provider-issues-${date}.csv`, csv);
  }

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader />
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
        <header className="border-b border-line pb-4">
          <h1 className="text-xl font-semibold text-ink">Settings</h1>
          <p className="mt-1 max-w-3xl text-sm text-ink-muted">
            Manage app setup, appearance, demo data, and future import tools. Do not enter PHI in
            settings, imported files, notes, or images.
          </p>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-md border border-line bg-surface-panel">
            <Header icon={<Palette className="h-4 w-4" />} title="Appearance" />
            <div className="space-y-5 px-4 py-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Mode
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {appearanceModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setAppearanceMode(mode.value)}
                      className={[
                        'rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                        appearanceMode === mode.value
                          ? 'border-accent-primary bg-accent-primary/15 text-ink'
                          : 'border-line bg-surface-raised text-ink-muted hover:bg-surface-subtle hover:text-ink',
                      ].join(' ')}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Color theme
                </div>
                <div className="mt-2 grid gap-2">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() => setColorTheme(theme.value)}
                      className={[
                        'flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                        colorTheme === theme.value
                          ? 'border-accent-primary bg-accent-primary/15'
                          : 'border-line bg-surface-raised hover:bg-surface-subtle',
                      ].join(' ')}
                    >
                      <span>
                        <span className="block text-sm font-medium text-ink">{theme.label}</span>
                        <span className="block text-xs text-ink-muted">{theme.description}</span>
                      </span>
                      <ThemeSwatches theme={theme.value} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface-panel">
            <Header icon={<Library className="h-4 w-4" />} title="Categories" />
            <div className="space-y-3 px-4 py-4 text-sm text-ink-muted">
              <p>
                Issue categories are managed in the Issue Library. Use it to add, rename, and
                maintain reusable documentation issue labels.
              </p>
              <ButtonLink to="/issues" variant="secondary" icon={<Library className="h-4 w-4" />}>
                Open Issue Library
              </ButtonLink>
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface-panel">
            <Header icon={<FileUp className="h-4 w-4" />} title="Import / Export" />
            <div className="space-y-3 px-4 py-4 text-sm text-ink-muted">
              <p>
                Import adds or updates providers, issue labels, statuses, and notes from a CSV.
                Export creates a spreadsheet-friendly backup without images.
              </p>
              <pre className="overflow-x-auto rounded-md border border-line bg-surface-raised p-3 text-xs text-ink">
                health_system,cdi_specialist,clinic,provider,specialty,issue_label,status,notes
              </pre>
              <p className="text-xs text-ink-muted">
                Required import columns: health_system, cdi_specialist, clinic, provider. Optional
                issue columns: specialty, issue_label, issue_label_description, status, notes,
                created_at, updated_at, resolved_at. Blank issue_label rows import roster-only
                providers.
              </p>
              <div className="rounded-md border border-status-active/30 bg-status-active/10 px-3 py-2 text-xs text-status-active">
                Imported notes must be fabricated for now. Do not include patient names, MRNs, DOBs,
                encounter dates, patient-specific notes, or chart text.
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportFile}
                className="hidden"
              />
              <Button
                type="button"
                disabled={isImporting}
                icon={<FileUp className="h-4 w-4" />}
                onClick={handleChooseImportFile}
              >
                {isImporting ? 'Importing...' : 'Import CSV'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={<Download className="h-4 w-4" />}
                onClick={handleExportProviderIssueCsv}
              >
                Export provider issue CSV
              </Button>
              {importError && (
                <p className="rounded-md border border-status-active/30 bg-status-active/10 px-3 py-2 text-xs text-status-active">
                  {importError}
                </p>
              )}
              {pendingImport && (
                <div className="rounded-md border border-line bg-surface-raised p-3 text-xs">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold text-ink">Preview import</div>
                      <p className="mt-0.5 text-ink-muted">{pendingImport.fileName}</p>
                    </div>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                      <Button size="sm" variant="ghost" onClick={handleCancelPendingImport}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="primary" onClick={handleConfirmPendingImport}>
                        Import now
                      </Button>
                    </div>
                  </div>

                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <PreviewStat label="CSV rows ready" value={pendingImport.rows.length} />
                    <PreviewStat
                      label="Health systems"
                      value={pendingImport.preview.healthSystemCount}
                    />
                    <PreviewStat
                      label="CDI specialists"
                      value={pendingImport.preview.specialistCount}
                    />
                    <PreviewStat label="Clinics" value={pendingImport.preview.clinicCount} />
                    <PreviewStat label="Providers" value={pendingImport.preview.providerCount} />
                    <PreviewStat
                      label="Issue rows"
                      value={pendingImport.preview.issueRowCount}
                    />
                    <PreviewStat
                      label="Repeated provider rows"
                      value={pendingImport.preview.repeatedProviderRows}
                    />
                    <PreviewStat
                      label="Issue labels in CSV"
                      value={pendingImport.preview.issueLabelCount}
                    />
                  </dl>

                  <div className="mt-3 rounded-md border border-status-active/30 bg-status-active/10 px-3 py-2 text-status-active">
                    Confirming will add or update matching records. It will not delete demo data;
                    use Delete demo data first if you want a clean import.
                  </div>

                  {pendingImport.warnings.length > 0 && (
                    <div className="mt-3 rounded-md border border-status-improving/30 bg-status-improving/10 px-3 py-2 text-status-improving">
                      <div className="font-semibold">Warnings before import</div>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {pendingImport.warnings.slice(0, 5).map((warning) => (
                          <li key={warning}>{warning}</li>
                        ))}
                      </ul>
                      {pendingImport.warnings.length > 5 && (
                        <p className="mt-1">
                          Additional warnings: {pendingImport.warnings.length - 5}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 overflow-hidden rounded-md border border-line">
                    <table className="w-full text-left">
                      <thead className="bg-surface-panel text-[10px] uppercase tracking-wider text-ink-muted">
                        <tr>
                          <th className="px-2 py-1.5 font-semibold">Health system</th>
                          <th className="px-2 py-1.5 font-semibold">CDI specialist</th>
                          <th className="px-2 py-1.5 font-semibold">Clinic</th>
                          <th className="px-2 py-1.5 font-semibold">Provider</th>
                          <th className="px-2 py-1.5 font-semibold">Specialty</th>
                          <th className="px-2 py-1.5 font-semibold">Issue label</th>
                          <th className="px-2 py-1.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-ink">
                        {pendingImport.preview.sampleRows.map((row, index) => (
                          <tr key={`${row.provider}-${index}`}>
                            <td className="px-2 py-1.5">{row.healthSystem}</td>
                            <td className="px-2 py-1.5">{row.cdiSpecialist}</td>
                            <td className="px-2 py-1.5">{row.clinic}</td>
                            <td className="px-2 py-1.5">{row.provider}</td>
                            <td className="px-2 py-1.5">{row.specialty || '—'}</td>
                            <td className="px-2 py-1.5">{row.issueLabel || '—'}</td>
                            <td className="px-2 py-1.5">{row.status || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {importSummary && (
                <div className="rounded-md border border-status-resolved/30 bg-status-resolved/10 px-3 py-2 text-xs text-status-resolved">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    Import complete
                  </div>
                  <dl className="mt-2 grid gap-x-4 gap-y-1 text-ink sm:grid-cols-2">
                    <SummaryStat label="Rows processed" value={importSummary.rowsProcessed} />
                    <SummaryStat
                      label="Health systems created"
                      value={importSummary.healthSystemsCreated}
                    />
                    <SummaryStat
                      label="CDI specialists created"
                      value={importSummary.specialistsCreated}
                    />
                    <SummaryStat label="Clinics created" value={importSummary.clinicsCreated} />
                    <SummaryStat label="Providers created" value={importSummary.providersCreated} />
                    <SummaryStat
                      label="Repeated provider rows"
                      value={importSummary.providersSkipped}
                    />
                    <SummaryStat
                      label="Issue labels created"
                      value={importSummary.issueLabelsCreated}
                    />
                    <SummaryStat
                      label="Provider issues created"
                      value={importSummary.providerIssuesCreated}
                    />
                    <SummaryStat
                      label="Provider issues updated"
                      value={importSummary.providerIssuesUpdated}
                    />
                    <SummaryStat
                      label="Provider issues skipped"
                      value={importSummary.providerIssuesSkipped}
                    />
                  </dl>
                </div>
              )}
              {importWarnings.length > 0 && (
                <div className="rounded-md border border-status-improving/30 bg-status-improving/10 px-3 py-2 text-xs text-status-improving">
                  <div className="font-semibold">Warnings</div>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {importWarnings.slice(0, 5).map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                  {importWarnings.length > 5 && (
                    <p className="mt-1">Additional warnings: {importWarnings.length - 5}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface-panel">
            <Header icon={<RotateCcw className="h-4 w-4" />} title="Demo data" />
            <div className="space-y-3 px-4 py-4 text-sm text-ink-muted">
              <p>
                Resetting restores the built-in fictional seed data and discards local edits in this
                browser. Deleting demo data clears the roster and provider issue assignments while
                keeping the issue-label library.
              </p>
              <div className="flex flex-wrap gap-2">
                <DeleteRosterDataButton />
                <ResetSeedButton />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface-panel lg:col-span-2">
            <Header icon={<ShieldAlert className="h-4 w-4" />} title="Data safety" />
            <div className="px-4 py-4 text-sm text-ink-muted">
              This prototype stores data in this browser. Do not enter PHI, patient identifiers,
              chart screenshots, or patient-specific clinical details.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Header({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <header className="flex items-center gap-2 border-b border-line px-4 py-3 text-sm font-semibold text-ink">
      {icon}
      {title}
    </header>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-mono text-ink">{value}</dd>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-line bg-surface-panel px-2 py-1.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </dt>
      <dd className="mt-0.5 font-mono text-sm text-ink">{value}</dd>
    </div>
  );
}

function ThemeSwatches({ theme }: { theme: ColorTheme }) {
  const colors: Record<ColorTheme, string[]> = {
    clinical: ['bg-slate-500', 'bg-teal-500', 'bg-sky-500', 'bg-green-500', 'bg-yellow-500'],
    green: ['bg-stone-500', 'bg-green-800', 'bg-teal-600', 'bg-lime-500', 'bg-amber-600'],
    purple: ['bg-gray-500', 'bg-purple-700', 'bg-fuchsia-500', 'bg-teal-400', 'bg-amber-400'],
    rose: ['bg-stone-500', 'bg-rose-700', 'bg-pink-400', 'bg-teal-500', 'bg-orange-500'],
    amber: ['bg-stone-500', 'bg-orange-700', 'bg-amber-500', 'bg-green-600', 'bg-yellow-600'],
  };
  return (
    <span className="flex shrink-0 gap-1">
      {colors[theme].map((color) => (
        <span key={color} className={`h-3 w-3 rounded-full ${color}`} />
      ))}
    </span>
  );
}
