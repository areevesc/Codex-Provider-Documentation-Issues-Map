import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useAppStore } from '@/store/useAppStore';
import {
  getClinicForProvider,
  getSpecialistForProvider,
  getCurrentProviderIssuesForProvider,
} from '@/store/selectors';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';
import { AssignIssueDialog } from './AssignIssueDialog';

interface ProviderPanelProps {
  providerId: string;
}

export function ProviderPanel({ providerId }: ProviderPanelProps) {
  const provider = useAppStore((s) => s.providers[providerId]);
  // Single object lookups — same reference if unchanged, no useShallow needed.
  const clinic = useAppStore((s) => getClinicForProvider(s, providerId));
  const specialist = useAppStore((s) => getSpecialistForProvider(s, providerId));
  // Array result — wrap with useShallow.
  const currentIssues = useAppStore(useShallow((s) => getCurrentProviderIssuesForProvider(s, providerId)));
  const labels = useAppStore((s) => s.issueLabels);

  const [assignOpen, setAssignOpen] = useState(false);

  const sortedIssues = useMemo(
    () =>
      [...currentIssues].sort((a, b) => {
        const aName = labels[a.issueLabelId]?.name ?? '';
        const bName = labels[b.issueLabelId]?.name ?? '';
        return aName.localeCompare(bName);
      }),
    [currentIssues, labels],
  );

  if (!provider) {
    return <div className="p-4 text-sm text-ink-muted">Provider not found.</div>;
  }

  return (
    <>
      <PanelFrame
        type="provider"
        title={provider.name}
        subtitle={provider.specialty}
        headerActions={
          <Link
            to={`/providers/${provider.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-panel px-2.5 py-1 text-xs text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
            title="Open full provider detail"
          >
            Detail
            <ExternalLink className="h-3 w-3" />
          </Link>
        }
      >
        <PanelSection title="Clinic">
          {clinic ? (
            <NodeLink type="clinic" refId={clinic.id}>
              {clinic.name}
            </NodeLink>
          ) : (
            <span className="text-xs text-ink-muted">No clinic</span>
          )}
        </PanelSection>

        <PanelSection title="CDI Specialist">
          {specialist ? (
            <NodeLink type="specialist" refId={specialist.id}>
              {specialist.name}
            </NodeLink>
          ) : (
            <span className="text-xs text-ink-muted">Unassigned</span>
          )}
        </PanelSection>

        <PanelSection
          title="Current Issue Labels"
          rightAdornment={
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setAssignOpen(true)}
            >
              Assign existing
            </Button>
          }
        >
          {sortedIssues.length === 0 ? (
            <div className="text-xs text-ink-muted">
              No current issue labels. Use <em>Assign existing</em> to link one.
            </div>
          ) : (
            <ul className="divide-y divide-line/60 rounded border border-line bg-surface-panel">
              {sortedIssues.map((pi) => {
                const label = labels[pi.issueLabelId];
                return (
                  <li key={pi.id} className="flex items-start justify-between gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <NodeLink
                          type="label"
                          refId={pi.issueLabelId}
                          className="truncate font-medium"
                        >
                          {label?.name ?? 'Unknown label'}
                        </NodeLink>
                        <StatusPill status={pi.status} />
                      </div>
                      {pi.notes && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{pi.notes}</p>
                      )}
                    </div>
                    <Link
                      to={`/providers/${provider.id}/issues/${pi.id}`}
                      className="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-ink-muted hover:bg-surface-subtle hover:text-ink"
                      title="Open issue detail"
                    >
                      Open
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </PanelSection>
      </PanelFrame>

      <AssignIssueDialog
        open={assignOpen}
        providerId={provider.id}
        onClose={() => setAssignOpen(false)}
      />
    </>
  );
}
