import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { ProviderIssue } from '@/types/domain';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';

interface ProviderIssueRowProps {
  issue: ProviderIssue;
  variant?: 'active' | 'historical';
}

export function ProviderIssueRow({ issue, variant = 'active' }: ProviderIssueRowProps) {
  const label = useAppStore((s) => s.issueLabels[issue.issueLabelId]);
  const archivedDim = variant === 'historical' && issue.status === 'Archived';

  return (
    <Link
      to={`/providers/${issue.providerId}/issues/${issue.id}`}
      className={[
        'group flex items-start justify-between gap-3 rounded-md border border-line bg-surface-panel px-4 py-3 transition-colors hover:border-ink-faint/40 hover:bg-surface-subtle',
        archivedDim ? 'opacity-60 hover:opacity-100' : '',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-medium text-ink">
            {label?.name ?? 'Unknown label'}
          </h3>
          <StatusPill status={issue.status} />
        </div>
        {issue.notes ? (
          <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{issue.notes}</p>
        ) : (
          <p className="mt-1 text-xs italic text-ink-faint">No notes yet.</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-ink-faint">
          <span>Opened {formatDate(issue.createdAt)}</span>
          <span>Updated {formatDate(issue.updatedAt)}</span>
          {issue.resolvedAt && <span>Resolved {formatDate(issue.resolvedAt)}</span>}
        </div>
      </div>
      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink-muted" />
    </Link>
  );
}
