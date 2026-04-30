import { useAppStore } from '@/store/useAppStore';
import type { NodeType } from '@/types/graph';

const rows: { type: NodeType; label: string; dotClass: string }[] = [
  { type: 'specialist', label: 'Specialists', dotClass: 'bg-accent-specialist' },
  { type: 'clinic', label: 'Clinics', dotClass: 'bg-accent-clinic' },
  { type: 'provider', label: 'Providers', dotClass: 'bg-accent-provider' },
  { type: 'label', label: 'Issue labels', dotClass: 'bg-accent-label' },
];

export function GraphFilters() {
  const visible = useAppStore((s) => s.visibleNodeTypes);
  const setVisibleNodeTypes = useAppStore((s) => s.setVisibleNodeTypes);

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-ink-muted">Visible node types</div>
      <ul className="space-y-0.5 rounded-md border border-line bg-surface-panel px-2 py-2">
        {rows.map(({ type, label, dotClass }) => {
          const on = visible[type];
          return (
            <li key={type}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm text-ink hover:bg-surface-subtle">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => setVisibleNodeTypes({ [type]: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-line text-accent-primary focus:ring-accent-primary/30"
                />
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotClass}`} />
                <span className="flex-1">{label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-ink-faint">
        Hiding a type also hides its edges.
      </p>
    </div>
  );
}
