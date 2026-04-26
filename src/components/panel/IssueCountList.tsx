import { useAppStore } from '@/store/useAppStore';
import { NodeLink } from './NodeLink';
import type { LabelCount } from '@/lib/counts';

interface IssueCountListProps {
  counts: LabelCount[];
  emptyText?: string;
}

/**
 * Renders a table-like list of "issue label → active provider count". Clicking
 * the label name selects the corresponding graph node.
 */
export function IssueCountList({ counts, emptyText = 'No active issues.' }: IssueCountListProps) {
  const labels = useAppStore((s) => s.issueLabels);

  if (counts.length === 0) {
    return <div className="text-xs text-ink-muted">{emptyText}</div>;
  }

  return (
    <ul className="divide-y divide-line/60 rounded border border-line bg-surface-panel">
      {counts.map(({ labelId, providerCount }) => {
        const label = labels[labelId];
        if (!label) return null;
        return (
          <li key={labelId} className="flex items-center justify-between px-3 py-2">
            <NodeLink type="label" refId={labelId} className="truncate">
              {label.name}
            </NodeLink>
            <span className="ml-2 inline-flex min-w-[2rem] justify-end text-sm tabular-nums text-ink-muted">
              {providerCount}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
