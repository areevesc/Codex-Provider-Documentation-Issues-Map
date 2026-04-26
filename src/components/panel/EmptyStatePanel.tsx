import { MousePointerClick } from 'lucide-react';

export function EmptyStatePanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="rounded-full bg-surface-panel p-3 text-ink-muted">
        <MousePointerClick size={20} />
      </div>
      <div>
        <div className="text-sm font-medium text-ink">Nothing selected</div>
        <div className="mt-1 text-xs text-ink-muted">
          Click a node in the graph to see its details, relationships, and active issue summary.
        </div>
      </div>
    </div>
  );
}
