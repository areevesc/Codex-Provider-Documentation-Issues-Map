import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useAppStore } from '@/store/useAppStore';
import { getHistoricalProviderIssuesForProvider } from '@/store/selectors';
import { ProviderIssueRow } from './ProviderIssueRow';

interface ProviderHistorySectionProps {
  providerId: string;
}

export function ProviderHistorySection({ providerId }: ProviderHistorySectionProps) {
  const issues = useAppStore(useShallow((s) => getHistoricalProviderIssuesForProvider(s, providerId)));
  const [open, setOpen] = useState(false);

  const { resolved, archived, sorted } = useMemo(() => {
    const r = issues.filter((i) => i.status === 'Resolved').length;
    const a = issues.filter((i) => i.status === 'Archived').length;
    const s = [...issues].sort((x, y) => {
      if (x.status !== y.status) return x.status === 'Resolved' ? -1 : 1;
      const xt = x.resolvedAt ?? x.updatedAt;
      const yt = y.resolvedAt ?? y.updatedAt;
      return yt.localeCompare(xt);
    });
    return { resolved: r, archived: a, sorted: s };
  }, [issues]);

  return (
    <section className="mt-8">
      <header>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 border-b border-line pb-2 text-left transition-colors hover:border-ink-faint/40"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2">
            {open ? (
              <ChevronDown className="h-4 w-4 text-ink-muted" />
            ) : (
              <ChevronRight className="h-4 w-4 text-ink-muted" />
            )}
            <h2 className="text-base font-semibold text-ink">Historical Issues</h2>
          </div>
          <div className="text-xs text-ink-muted">
            {resolved} resolved · {archived} archived
          </div>
        </button>
      </header>

      {open && (
        <>
          {sorted.length === 0 ? (
            <div className="mt-3 text-xs text-ink-muted">No historical issues.</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {sorted.map((pi) => (
                <li key={pi.id}>
                  <ProviderIssueRow issue={pi} variant="historical" />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
