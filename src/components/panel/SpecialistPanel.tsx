import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { activeIssueCountsForSpecialist } from '@/lib/counts';
import { graphNodeId } from '@/lib/ids';
import { confirmOrgDelete, getOrgDeleteImpact } from '@/lib/orgDeletion';
import { isCurrentStatus } from '@/types/domain';
import type { IssueStatus } from '@/types/domain';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';
import { IssueCountList } from './IssueCountList';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { OrgEntityDialog } from '@/components/org/OrgEntityDialog';
import type { OrgEntityType } from '@/lib/orgDeletion';

interface SpecialistPanelProps {
  specialistId: string;
}

export function SpecialistPanel({ specialistId }: SpecialistPanelProps) {
  // Subscribe to stable record maps; Zustand mutations always spread-create new records,
  // so their references change on any update → useMemo recomputes correctly.
  const specialist = useAppStore((s) => s.specialists[specialistId]);
  const clinicsMap = useAppStore((s) => s.clinics);
  const providersMap = useAppStore((s) => s.providers);
  const providerIssuesMap = useAppStore((s) => s.providerIssues);
  const issueLabelsMap = useAppStore((s) => s.issueLabels);
  const setSelection = useAppStore((s) => s.setSelection);
  const deleteSpecialist = useAppStore((s) => s.deleteSpecialist);
  const [editOpen, setEditOpen] = useState(false);
  const [addClinicOpen, setAddClinicOpen] = useState(false);

  const clinics = useMemo(
    () => Object.values(clinicsMap).filter((c) => c.cdiSpecialistId === specialistId),
    [clinicsMap, specialistId],
  );

  const clinicSections = useMemo(
    () =>
      clinics.map((c) => ({
        clinic: c,
        providers: Object.values(providersMap)
          .filter((p) => p.clinicId === c.id)
          .sort((a, b) => a.name.localeCompare(b.name)),
      })),
    [clinics, providersMap],
  );

  const providerCount = useMemo(() => {
    const clinicIds = new Set(clinics.map((c) => c.id));
    return Object.values(providersMap).filter((p) => clinicIds.has(p.clinicId)).length;
  }, [clinics, providersMap]);

  const activeIssuesByProvider = useMemo(() => {
    const out: Record<
      string,
      Array<{ id: string; issueLabelId: string; status: IssueStatus }>
    > = {};
    for (const pi of Object.values(providerIssuesMap)) {
      if (!isCurrentStatus(pi.status)) continue;
      if (!out[pi.providerId]) out[pi.providerId] = [];
      out[pi.providerId].push({ id: pi.id, issueLabelId: pi.issueLabelId, status: pi.status });
    }
    return out;
  }, [providerIssuesMap]);

  // Compute counts inside useMemo — avoids returning a new array reference from useAppStore.
  const counts = useMemo(
    () => activeIssueCountsForSpecialist(useAppStore.getState(), specialistId),
    // Depend on the records that activeIssueCountsForSpecialist reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [specialistId, clinicsMap, providersMap, providerIssuesMap],
  );

  if (!specialist) {
    return <div className="p-4 text-sm text-ink-muted">Specialist not found.</div>;
  }

  function handleDelete() {
    if (!specialist) return;
    const impact = getOrgDeleteImpact(useAppStore.getState(), 'specialist', specialist.id);
    if (!confirmOrgDelete(specialist.name, impact)) return;
    const parentId = specialist.healthSystemId;
    deleteSpecialist(specialist.id);
    setSelection(graphNodeId.healthSystem(parentId), 'healthSystem');
  }

  function handleOrgSaved(entityType: OrgEntityType, id: string) {
    if (entityType === 'specialist') {
      setSelection(graphNodeId.specialist(id), 'specialist');
    } else if (entityType === 'clinic') {
      setSelection(graphNodeId.clinic(id), 'clinic');
    }
  }

  return (
    <>
      <PanelFrame
        type="specialist"
        title={specialist.name}
        subtitle={`${clinics.length} clinic${clinics.length === 1 ? '' : 's'} · ${providerCount} provider${providerCount === 1 ? '' : 's'}`}
        headerActions={
          <div className="flex flex-wrap justify-end gap-1">
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
        <PanelSection
          title="Clinics & Providers"
          rightAdornment={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAddClinicOpen(true)}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add clinic
            </Button>
          }
        >
          {clinicSections.length === 0 ? (
            <div className="text-xs text-ink-muted">No clinics assigned.</div>
          ) : (
            <ul className="space-y-3">
              {clinicSections.map(({ clinic, providers }) => (
                <li key={clinic.id}>
                  <NodeLink type="clinic" refId={clinic.id} className="font-medium">
                    {clinic.name}
                  </NodeLink>
                  <ul className="ml-2 mt-1 space-y-1.5 border-l border-line pl-2 sm:ml-3 sm:pl-3">
                    {providers.length === 0 ? (
                      <li className="text-xs text-ink-muted">No providers</li>
                    ) : (
                      providers.map((p) => {
                        const issues = activeIssuesByProvider[p.id] ?? [];
                        return (
                          <li key={p.id}>
                            <div className="flex items-center gap-1">
                              <NodeLink type="provider" refId={p.id} className="text-sm">
                                {p.name}
                              </NodeLink>
                              {p.specialty && (
                                <span className="text-xs text-ink-muted">· {p.specialty}</span>
                              )}
                            </div>
                            {issues.length > 0 && (
                              <ul className="ml-2 mt-0.5 space-y-0.5 border-l border-line/50 pl-2 sm:ml-3">
                                {issues.map((pi) => {
                                  const label = issueLabelsMap[pi.issueLabelId];
                                  return (
                                    <li key={pi.id} className="flex flex-wrap items-center gap-1.5">
                                      <NodeLink
                                        type="label"
                                        refId={pi.issueLabelId}
                                        className="max-w-full text-xs"
                                      >
                                        {label?.name ?? 'Unknown label'}
                                      </NodeLink>
                                      <StatusPill status={pi.status} />
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </PanelSection>

        <PanelSection
          title="Active Issue Summary"
          rightAdornment={
            <span className="text-[11px] text-ink-muted">scoped to this specialist</span>
          }
        >
          <IssueCountList counts={counts} emptyText="No active issues for this specialist." />
        </PanelSection>
      </PanelFrame>

      <OrgEntityDialog
        open={editOpen}
        mode="edit"
        entityType="specialist"
        entityId={specialist.id}
        onClose={() => setEditOpen(false)}
        onSaved={handleOrgSaved}
      />
      <OrgEntityDialog
        open={addClinicOpen}
        mode="create"
        entityType="clinic"
        parentId={specialist.id}
        onClose={() => setAddClinicOpen(false)}
        onSaved={handleOrgSaved}
      />
    </>
  );
}
