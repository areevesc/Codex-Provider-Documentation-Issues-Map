import { AlertTriangle } from 'lucide-react';
import type { IssueLabel } from '@/types/domain';
import { findSimilar } from '@/lib/fuzzy';

interface DuplicateHintListProps {
  query: string;
  candidates: readonly IssueLabel[];
  onPick: (label: IssueLabel) => void;
}

/**
 * Live duplicate-name hint surfaced inside the Create Issue dialog. If the
 * proposed name looks close to an existing label, the user sees it and can
 * either pick the existing label or explicitly continue with a new one.
 */
export function DuplicateHintList({ query, candidates, onPick }: DuplicateHintListProps) {
  const matches = findSimilar(query, candidates, (l) => l.name, 0.5).slice(0, 4);

  if (matches.length === 0) return null;

  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <AlertTriangle className="h-3.5 w-3.5" />
        Possible duplicates
      </div>
      <p className="mt-0.5 text-[11px] text-ink-muted">
        These existing labels look similar. Pick one to avoid a near-duplicate,
        or continue if yours is genuinely different.
      </p>
      <ul className="mt-2 space-y-1">
        {matches.map(({ item, score }) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onPick(item)}
              className="flex w-full items-start gap-2 rounded border border-line bg-surface-raised px-2.5 py-1.5 text-left transition-colors hover:border-amber-500/50 hover:bg-amber-500/5"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">{item.name}</div>
                <div className="line-clamp-1 text-[11px] text-ink-muted">{item.description}</div>
              </div>
              <div className="shrink-0 pt-0.5 text-[10px] tabular-nums text-ink-faint">
                {Math.round(score * 100)}% match
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
