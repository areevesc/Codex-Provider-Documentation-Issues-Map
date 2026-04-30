import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  getClinicForProvider,
  getProvider,
  getSpecialistForProvider,
} from '@/store/selectors';
import { Badge } from '@/components/ui/Badge';
import { ProviderActiveIssuesSection } from '@/components/provider/ProviderActiveIssuesSection';
import { ProviderHistorySection } from '@/components/provider/ProviderHistorySection';
import { graphNodeId } from '@/lib/ids';

/**
 * Provider detail page: full structured view for one provider with separate
 * active and historical issue sections.
 */
export function ProviderDetailPage() {
  const { providerId = '' } = useParams<{ providerId: string }>();
  const provider = useAppStore((s) => getProvider(s, providerId));
  const clinic = useAppStore((s) => getClinicForProvider(s, providerId));
  const specialist = useAppStore((s) => getSpecialistForProvider(s, providerId));
  const setSelection = useAppStore((s) => s.setSelection);

  if (!provider) {
    return (
        <div className="mx-auto h-full max-w-3xl overflow-y-auto px-3 py-10 sm:px-6 sm:py-12">
        <h1 className="text-xl font-semibold text-ink">Provider not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          The provider id <code>{providerId}</code> does not exist in the current dataset.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
        >
          <Home className="h-4 w-4" /> Back to graph
        </Link>
      </div>
    );
  }

  function openInGraph() {
    if (!provider) return;
    setSelection(graphNodeId.provider(provider.id), 'provider');
  }

  return (
    <div className="mx-auto h-full max-w-5xl overflow-y-auto px-3 py-5 sm:px-6 sm:py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to graph
      </Link>

      <header className="mt-3 border-b border-line pb-6">
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Badge tone="provider">Provider</Badge>
            <h1 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">{provider.name}</h1>
            {provider.specialty && (
              <div className="mt-1 text-sm text-ink-muted">{provider.specialty}</div>
            )}
          </div>
          <Link
            to="/"
            onClick={openInGraph}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-md border border-line bg-surface-panel px-3 py-1.5 text-xs text-ink-muted hover:bg-surface-subtle hover:text-ink sm:justify-start"
          >
            Open in graph
          </Link>
        </div>

        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <Field label="Clinic">
            {clinic ? (
              <span className="text-ink">{clinic.name}</span>
            ) : (
              <span className="text-ink-muted">—</span>
            )}
          </Field>
          <Field label="CDI Specialist">
            {specialist ? (
              <span className="text-ink">{specialist.name}</span>
            ) : (
              <span className="text-ink-muted">Unassigned</span>
            )}
          </Field>
        </dl>
      </header>

      <div className="mt-6">
        <ProviderActiveIssuesSection providerId={provider.id} />
        <ProviderHistorySection providerId={provider.id} />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
