import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Network, Library } from 'lucide-react';
import type { IssueLabel } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { IssueLibraryTable } from '@/components/issues/IssueLibraryTable';
import { CreateIssueDialog } from '@/components/issues/CreateIssueDialog';
import { EditIssueDialog } from '@/components/issues/EditIssueDialog';

const navCls = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
    isActive ? 'bg-surface-panel text-ink' : 'text-ink-muted hover:bg-surface-panel hover:text-ink',
  ].join(' ');

export function IssueLibraryPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<IssueLabel | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-line bg-surface-raised px-6 py-2">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-ink">
              CDI Relationship Tracker
            </span>
            <span className="rounded border border-line bg-surface-panel px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
              Prototype
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navCls}>
              <Network size={14} />
              Graph
            </NavLink>
            <NavLink to="/issues" className={navCls}>
              <Library size={14} />
              Issue Library
            </NavLink>
          </nav>
        </div>
      </div>
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Issue Library</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Canonical documentation-issue labels. Create them here — never from a provider
            panel — to keep the label set clean and reusable.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          New label
        </Button>
      </header>

      <div className="mt-6">
        <IssueLibraryTable onEdit={(l) => setEditing(l)} />
      </div>

      <CreateIssueDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditIssueDialog
        open={editing !== null}
        label={editing}
        onClose={() => setEditing(null)}
      />
    </div>
    </div>
  );
}
