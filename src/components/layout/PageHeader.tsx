import type { ReactNode } from 'react';
import { TopNav } from './TopNav';

export function PageHeader({ actions }: { actions?: ReactNode }) {
  return (
    <div className="border-b border-line bg-surface-raised px-3 py-2 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold tracking-wide text-ink">
            CDI Relationship Tracker
          </span>
          <span className="rounded border border-line bg-surface-panel px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
            Prototype
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <TopNav />
          {actions && (
            <>
              <div className="h-5 w-px bg-line" aria-hidden="true" />
              {actions}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
