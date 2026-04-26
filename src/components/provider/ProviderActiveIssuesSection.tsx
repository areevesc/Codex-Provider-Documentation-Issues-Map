import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useAppStore } from '@/store/useAppStore';
import { getCurrentProviderIssuesForProvider } from '@/store/selectors';
import { Button } from '@/components/ui/Button';
import { AssignIssueDialog } from '@/components/panel/AssignIssueDialog';
import { ProviderIssueRow } from './ProviderIssueRow';

interface ProviderActiveIssuesSectionProps {
  providerId: string;
}

export function ProviderActiveIssuesSection({ providerId }: ProviderActiveIssuesSectionProps) {
  const issues = useAppStore(useShallow((s) => getCurrentProviderIssuesForProvider(s, providerId)));
  const labels = useAppStore((s) => s.issueLabels);
  const [assignOpen, setAssignOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...issues].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'Active' ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      }),
    [issues],
  );

  return (
    <>
      <section>
        <header className="flex items-end justify-between gap-3 border-b border-line pb-2">
          <div>
            <h2 className="text-base font-semibold text-ink">Current Issues</h2>
            <p className="text-xs text-ink-muted">
              Active and Improving — showing on the home graph.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => setAssignOpen(true)}
          >
            Assign existing label
          </Button>
        </header>

        {sorted.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-line bg-surface-panel px-4 py-6 text-center text-sm text-ink-muted">
            No current issues for this provider.
            <div className="mt-2 text-xs">
              Use <em>Assign existing label</em> above to link one.
            </div>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {sorted.map((pi) => {
              if (!labels[pi.issueLabelId]) return null;
              return (
                <li key={pi.id}>
                  <ProviderIssueRow issue={pi} variant="active" />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AssignIssueDialog
        open={assignOpen}
        providerId={providerId}
        onClose={() => setAssignOpen(false)}
      />
    </>
  );
}
