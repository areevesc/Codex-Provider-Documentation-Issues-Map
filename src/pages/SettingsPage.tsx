import { FileUp, Library, Palette, RotateCcw, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { ResetSeedButton } from '@/components/layout/ResetSeedButton';
import { Button, ButtonLink } from '@/components/ui/Button';

const appearanceModes = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
] as const;

const colorThemes = [
  { value: 'classic', label: 'Classic', description: 'Purple, blue, green, amber' },
  { value: 'clinical', label: 'Clinical', description: 'Teal and blue emphasis' },
  { value: 'blue', label: 'Blue', description: 'Blue, cyan, green, amber' },
  { value: 'green', label: 'Green', description: 'Green, teal, blue, amber' },
  { value: 'purple', label: 'Purple', description: 'Purple, blue, teal, amber' },
  { value: 'rose', label: 'Red / rose', description: 'Rose, pink, blue, orange' },
  { value: 'amber', label: 'Amber', description: 'Amber, orange, blue, green' },
] as const;

type ColorTheme = (typeof colorThemes)[number]['value'];

export function SettingsPage() {
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const setAppearanceMode = useAppStore((s) => s.setAppearanceMode);
  const setColorTheme = useAppStore((s) => s.setColorTheme);

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
            <Header icon={<FileUp className="h-4 w-4" />} title="Import" />
            <div className="space-y-3 px-4 py-4 text-sm text-ink-muted">
              <p>
                CSV import is planned here, but not implemented yet. The intended format is one row
                per provider:
              </p>
              <pre className="overflow-x-auto rounded-md border border-line bg-surface-raised p-3 text-xs text-ink">
                health_system,cdi_specialist,clinic,provider,specialty
              </pre>
              <div className="rounded-md border border-status-active/30 bg-status-active/10 px-3 py-2 text-xs text-status-active">
                Import files must not include patient names, MRNs, DOBs, encounter dates,
                patient-specific notes, or chart text.
              </div>
              <Button disabled icon={<FileUp className="h-4 w-4" />}>
                Import CSV coming soon
              </Button>
            </div>
          </section>

          <section className="rounded-md border border-line bg-surface-panel">
            <Header icon={<RotateCcw className="h-4 w-4" />} title="Demo data" />
            <div className="space-y-3 px-4 py-4 text-sm text-ink-muted">
              <p>
                Resetting restores the built-in fictional seed data and discards local edits in this
                browser.
              </p>
              <ResetSeedButton />
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

function ThemeSwatches({ theme }: { theme: ColorTheme }) {
  const colors: Record<ColorTheme, string[]> = {
    classic: ['bg-slate-400', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-yellow-500'],
    clinical: ['bg-teal-500', 'bg-sky-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500'],
    blue: ['bg-blue-600', 'bg-sky-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500'],
    green: ['bg-green-600', 'bg-emerald-500', 'bg-teal-500', 'bg-sky-500', 'bg-amber-500'],
    purple: ['bg-violet-600', 'bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-amber-500'],
    rose: ['bg-rose-600', 'bg-rose-500', 'bg-pink-500', 'bg-sky-500', 'bg-orange-500'],
    amber: ['bg-amber-600', 'bg-amber-500', 'bg-orange-600', 'bg-sky-500', 'bg-green-500'],
  };
  return (
    <span className="flex shrink-0 gap-1">
      {colors[theme].map((color) => (
        <span key={color} className={`h-3 w-3 rounded-full ${color}`} />
      ))}
    </span>
  );
}
