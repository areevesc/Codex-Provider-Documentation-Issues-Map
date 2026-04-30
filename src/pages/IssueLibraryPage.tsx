import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { IssueLabel } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { IssueLibraryTable } from '@/components/issues/IssueLibraryTable';
import { CreateIssueDialog } from '@/components/issues/CreateIssueDialog';
import { EditIssueDialog } from '@/components/issues/EditIssueDialog';
import { PageHeader } from '@/components/layout/PageHeader';

export function IssueLibraryPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<IssueLabel | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <PageHeader />
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
        <header className="flex flex-col items-stretch gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink">Issue Library</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Canonical documentation-issue labels. Create them here — never from a provider panel —
              to keep the label set clean and reusable.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setCreateOpen(true)}
            icon={<Plus className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            New label
          </Button>
        </header>

        <div className="mt-6">
          <IssueLibraryTable onEdit={(l) => setEditing(l)} />
        </div>

        <CreateIssueDialog open={createOpen} onClose={() => setCreateOpen(false)} />
        <EditIssueDialog open={editing !== null} label={editing} onClose={() => setEditing(null)} />
      </div>
    </div>
  );
}
