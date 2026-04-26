import { useMemo, useState } from 'react';
import { Pencil, ArrowUp, ArrowDown, Search as SearchIcon } from 'lucide-react';
import type { IssueLabel } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { allLabelUsageCounts } from '@/lib/counts';
import { Input } from '@/components/ui/Input';
import { NodeLink } from '@/components/panel/NodeLink';

type SortKey = 'name' | 'providerCount' | 'clinicCount' | 'updatedAt';
type SortDir = 'asc' | 'desc';

interface IssueLibraryTableProps {
  onEdit: (label: IssueLabel) => void;
}

export function IssueLibraryTable({ onEdit }: IssueLibraryTableProps) {
  const labels = useAppStore((s) => s.issueLabels);
  // allLabelUsageCounts returns a new object each call — compute in useMemo
  // against the stable record subscriptions to avoid an infinite loop.
  const providerIssuesMap = useAppStore((s) => s.providerIssues);
  const providersMap = useAppStore((s) => s.providers);
  const counts = useMemo(
    () => allLabelUsageCounts(useAppStore.getState()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providerIssuesMap, providersMap, labels],
  );

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const rows = useMemo(() => {
    const list = Object.values(labels).map((l) => ({
      label: l,
      providerCount: counts[l.id]?.providerCount ?? 0,
      clinicCount: counts[l.id]?.clinicCount ?? 0,
    }));

    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          ({ label }) =>
            label.name.toLowerCase().includes(q) ||
            label.description.toLowerCase().includes(q),
        )
      : list;

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.label.name.localeCompare(b.label.name);
          break;
        case 'providerCount':
          cmp = a.providerCount - b.providerCount;
          break;
        case 'clinicCount':
          cmp = a.clinicCount - b.clinicCount;
          break;
        case 'updatedAt':
          cmp = a.label.updatedAt.localeCompare(b.label.updatedAt);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [labels, counts, search, sortKey, sortDir]);

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }

  return (
    <div>
      <div className="relative mb-3 max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search labels by name or description…"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-panel text-[11px] uppercase tracking-wider text-ink-muted">
            <tr>
              <SortableTh
                label="Label"
                active={sortKey === 'name'}
                dir={sortDir}
                onClick={() => onSort('name')}
              />
              <th className="px-3 py-2 font-semibold">Description</th>
              <SortableTh
                label="Active providers"
                active={sortKey === 'providerCount'}
                dir={sortDir}
                onClick={() => onSort('providerCount')}
                align="right"
              />
              <SortableTh
                label="Active clinics"
                active={sortKey === 'clinicCount'}
                dir={sortDir}
                onClick={() => onSort('clinicCount')}
                align="right"
              />
              <SortableTh
                label="Updated"
                active={sortKey === 'updatedAt'}
                dir={sortDir}
                onClick={() => onSort('updatedAt')}
                align="right"
              />
              <th className="w-16 px-3 py-2" aria-label="actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line bg-surface-raised">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No labels match your search.
                </td>
              </tr>
            ) : (
              rows.map(({ label, providerCount, clinicCount }) => (
                <tr key={label.id} className="hover:bg-surface-subtle/60">
                  <td className="px-3 py-2 align-top">
                    <NodeLink type="label" refId={label.id} className="font-medium">
                      {label.name}
                    </NodeLink>
                  </td>
                  <td className="px-3 py-2 align-top text-ink-muted">
                    <p className="line-clamp-2 max-w-prose">{label.description}</p>
                  </td>
                  <td className="px-3 py-2 text-right align-top tabular-nums">
                    {providerCount}
                  </td>
                  <td className="px-3 py-2 text-right align-top tabular-nums">
                    {clinicCount}
                  </td>
                  <td className="px-3 py-2 text-right align-top text-xs text-ink-muted">
                    {formatShortDate(label.updatedAt)}
                  </td>
                  <td className="px-3 py-2 text-right align-top">
                    <button
                      type="button"
                      onClick={() => onEdit(label)}
                      className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-panel px-2 py-1 text-[11px] text-ink-muted hover:bg-surface-subtle hover:text-ink"
                      aria-label={`Edit ${label.name}`}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SortableThProps {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: 'left' | 'right';
}

function SortableTh({ label, active, dir, onClick, align = 'left' }: SortableThProps) {
  return (
    <th
      scope="col"
      className={['px-3 py-2 font-semibold', align === 'right' ? 'text-right' : 'text-left'].join(' ')}
    >
      <button
        type="button"
        onClick={onClick}
        className={[
          'inline-flex items-center gap-1 uppercase tracking-wider',
          active ? 'text-ink' : 'text-ink-muted hover:text-ink',
        ].join(' ')}
      >
        <span>{label}</span>
        {active && (dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </th>
  );
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}
