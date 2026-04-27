import { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import type { IssueStatus, ProviderIssue } from '@/types/domain';
import { ISSUE_STATUSES } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Textarea, FieldLabel } from '@/components/ui/Input';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDateTime } from '@/lib/dates';

interface ProviderIssueFormProps {
  issue: ProviderIssue;
}

export function ProviderIssueForm({ issue }: ProviderIssueFormProps) {
  const labels = useAppStore((s) => s.issueLabels);
  const updateProviderIssue = useAppStore((s) => s.updateProviderIssue);

  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [notes, setNotes] = useState(issue.notes);

  // Sync local form when switching between issues or after external updates.
  useEffect(() => {
    setStatus(issue.status);
    setNotes(issue.notes);
  }, [issue.id, issue.status, issue.notes]);

  const label = labels[issue.issueLabelId];
  const dirty = status !== issue.status || notes !== issue.notes;

  function handleSave() {
    if (!dirty) return;
    updateProviderIssue(issue.id, { status, notes });
  }

  function handleRevert() {
    setStatus(issue.status);
    setNotes(issue.notes);
  }

  const willStampResolved = status === 'Resolved' && issue.status !== 'Resolved';
  const willClearResolved = status !== 'Resolved' && issue.status === 'Resolved';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FieldLabel>Issue label</FieldLabel>
          <div className="rounded-md border border-line bg-surface-panel px-3 py-2 text-sm text-ink">
            {label?.name ?? 'Unknown label'}
          </div>
          {label?.description && (
            <p className="text-xs text-ink-muted">{label.description}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="status-select">Status</FieldLabel>
          <div className="relative">
            <select
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              className="block w-full appearance-none rounded-md border border-line bg-surface-raised px-3 py-2 pr-8 text-sm text-ink focus:border-accent-specialist focus:outline-none focus:ring-2 focus:ring-accent-specialist/25"
            >
              {ISSUE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span>Currently:</span>
            <StatusPill status={issue.status} />
            {status !== issue.status && (
              <>
                <span className="text-ink-faint">→</span>
                <StatusPill status={status} />
              </>
            )}
          </div>
          {willStampResolved && (
            <p className="text-[11px] text-status-resolved">
              Saving will stamp a Resolved date (today).
            </p>
          )}
          {willClearResolved && (
            <p className="text-[11px] text-status-active">
              Saving will clear the previous Resolved date.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="notes">
          Notes
          <span className="ml-1 font-normal text-ink-faint">
            (fake context and follow-up details only)
          </span>
        </FieldLabel>
        <Textarea
          id="notes"
          rows={10}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Use fabricated examples only. Do not enter real patient, provider, or clinical documentation data."
        />
      </div>

      <div className="grid gap-3 rounded-md border border-line bg-surface-panel px-4 py-3 text-xs text-ink-muted sm:grid-cols-3">
        <Meta label="Opened" value={formatDateTime(issue.createdAt)} />
        <Meta label="Last updated" value={formatDateTime(issue.updatedAt)} />
        <Meta
          label="Resolved"
          value={issue.resolvedAt ? formatDateTime(issue.resolvedAt) : '—'}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={handleRevert}
          disabled={!dirty}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          className="w-full sm:w-auto"
        >
          Revert
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!dirty}
          icon={<Save className="h-3.5 w-3.5" />}
          className="w-full sm:w-auto"
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      <div className="mt-0.5 text-ink">{value}</div>
    </div>
  );
}
