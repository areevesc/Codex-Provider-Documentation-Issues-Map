import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink, StickyNote, Pencil, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/shallow';
import { useAppStore } from '@/store/useAppStore';
import {
  getClinicForProvider,
  getSpecialistForProvider,
  getCurrentProviderIssuesForProvider,
} from '@/store/selectors';
import { graphNodeId } from '@/lib/ids';
import { confirmOrgDelete, getOrgDeleteImpact } from '@/lib/orgDeletion';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';
import { AssignIssueDialog } from './AssignIssueDialog';
import { OrgEntityDialog } from '@/components/org/OrgEntityDialog';
import type { OrgEntityType } from '@/lib/orgDeletion';

interface ProviderPanelProps {
  providerId: string;
}

export function ProviderPanel({ providerId }: ProviderPanelProps) {
  const provider = useAppStore((s) => s.providers[providerId]);
  // Single object lookups — same reference if unchanged, no useShallow needed.
  const clinic = useAppStore((s) => getClinicForProvider(s, providerId));
  const specialist = useAppStore((s) => getSpecialistForProvider(s, providerId));
  // Array result — wrap with useShallow.
  const currentIssues = useAppStore(
    useShallow((s) => getCurrentProviderIssuesForProvider(s, providerId)),
  );
  const labels = useAppStore((s) => s.issueLabels);
  const setSelection = useAppStore((s) => s.setSelection);
  const deleteProvider = useAppStore((s) => s.deleteProvider);

  const [assignOpen, setAssignOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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

  function handleDelete() {
    if (!provider) return;
    const impact = getOrgDeleteImpact(useAppStore.getState(), 'provider', provider.id);
    if (!confirmOrgDelete(provider.name, impact)) return;
    const parentId = provider.clinicId;
    deleteProvider(provider.id);
    setSelection(graphNodeId.clinic(parentId), 'clinic');
  }

  function handleOrgSaved(entityType: OrgEntityType, id: string) {
    if (entityType === 'provider') setSelection(graphNodeId.provider(id), 'provider');
  }

  return (
    <>
      <PanelFrame
        type="provider"
        title={provider.name}
        subtitle={provider.specialty}
        headerActions={
          <div className="flex flex-wrap justify-end gap-1">
            <Link
              to={`/providers/${provider.id}`}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-accent-provider/35 bg-accent-provider/10 px-2.5 text-xs font-medium text-accent-provider transition-colors hover:bg-accent-provider/20 hover:text-ink"
              title="Open provider profile with current and historical issues"
            >
              Profile
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditOpen(true)}
              icon={<Pencil className="h-3.5 w-3.5" />}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              icon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete
            </Button>
          </div>
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
                  <li
                    key={pi.id}
                    className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                  >
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
                      {pi.attachments && pi.attachments.length > 0 && (
                        <p className="mt-1 text-[11px] text-ink-faint">
                          {pi.attachments.length} image{pi.attachments.length === 1 ? '' : 's'}{' '}
                          attached
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/providers/${provider.id}/issues/${pi.id}`}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-accent-specialist/40 bg-accent-specialist/15 px-2.5 py-1.5 text-xs font-medium text-accent-specialist transition-colors hover:bg-accent-specialist/25 hover:text-ink"
                      title="Edit notes and attached images"
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                      Notes & images
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
      <OrgEntityDialog
        open={editOpen}
        mode="edit"
        entityType="provider"
        entityId={provider.id}
        onClose={() => setEditOpen(false)}
        onSaved={handleOrgSaved}
      />
    </>
  );
}
