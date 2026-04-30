import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { activeIssueCountsForHealthSystem } from '@/lib/counts';
import { graphNodeId } from '@/lib/ids';
import { confirmOrgDelete, getOrgDeleteImpact } from '@/lib/orgDeletion';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';
import { IssueCountList } from './IssueCountList';
import { Button } from '@/components/ui/Button';
import { OrgEntityDialog } from '@/components/org/OrgEntityDialog';
import type { OrgEntityType } from '@/lib/orgDeletion';

interface HealthSystemPanelProps {
  healthSystemId: string;
}

export function HealthSystemPanel({ healthSystemId }: HealthSystemPanelProps) {
  const healthSystem = useAppStore((s) => s.healthSystems[healthSystemId]);
  const specialistsMap = useAppStore((s) => s.specialists);
  const clinicsMap = useAppStore((s) => s.clinics);
  const providersMap = useAppStore((s) => s.providers);
  const providerIssuesMap = useAppStore((s) => s.providerIssues);
  const setSelection = useAppStore((s) => s.setSelection);
  const deleteHealthSystem = useAppStore((s) => s.deleteHealthSystem);
  const [editOpen, setEditOpen] = useState(false);
  const [addSpecialistOpen, setAddSpecialistOpen] = useState(false);

  const specialists = useMemo(
    () =>
      Object.values(specialistsMap)
        .filter((sp) => sp.healthSystemId === healthSystemId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [specialistsMap, healthSystemId],
  );

  const { clinicCount, providerCount } = useMemo(() => {
    const spIds = new Set(specialists.map((sp) => sp.id));
    const clIds = new Set(
      Object.values(clinicsMap)
        .filter((c) => spIds.has(c.cdiSpecialistId))
        .map((c) => c.id),
    );
    return {
      clinicCount: clIds.size,
      providerCount: Object.values(providersMap).filter((p) => clIds.has(p.clinicId)).length,
    };
  }, [specialists, clinicsMap, providersMap]);

  const counts = useMemo(
    () => activeIssueCountsForHealthSystem(useAppStore.getState(), healthSystemId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [healthSystemId, specialistsMap, clinicsMap, providersMap, providerIssuesMap],
  );

  if (!healthSystem) {
    return <div className="p-4 text-sm text-ink-muted">Health system not found.</div>;
  }

  function handleDelete() {
    if (!healthSystem) return;
    const impact = getOrgDeleteImpact(useAppStore.getState(), 'healthSystem', healthSystem.id);
    if (!confirmOrgDelete(healthSystem.name, impact)) return;
    deleteHealthSystem(healthSystem.id);
  }

  function handleOrgSaved(entityType: OrgEntityType, id: string) {
    if (entityType === 'healthSystem') {
      setSelection(graphNodeId.healthSystem(id), 'healthSystem');
    } else if (entityType === 'specialist') {
      setSelection(graphNodeId.specialist(id), 'specialist');
    }
  }

  return (
    <>
      <PanelFrame
        type="healthSystem"
        title={healthSystem.name}
        subtitle={`${specialists.length} CDI specialist${specialists.length === 1 ? '' : 's'} · ${clinicCount} clinic${clinicCount === 1 ? '' : 's'} · ${providerCount} provider${providerCount === 1 ? '' : 's'}`}
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
          title="CDI Specialists"
          rightAdornment={
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAddSpecialistOpen(true)}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add CDI
            </Button>
          }
        >
          {specialists.length === 0 ? (
            <div className="text-xs text-ink-muted">No specialists assigned.</div>
          ) : (
            <ul className="space-y-0.5">
              {specialists.map((sp) => (
                <li key={sp.id}>
                  <NodeLink type="specialist" refId={sp.id}>
                    {sp.name}
                  </NodeLink>
                </li>
              ))}
            </ul>
          )}
        </PanelSection>

        <PanelSection
          title="Active Issue Summary"
          rightAdornment={<span className="text-[11px] text-ink-muted">scoped to this system</span>}
        >
          <IssueCountList counts={counts} emptyText="No active issues in this health system." />
        </PanelSection>
      </PanelFrame>

      <OrgEntityDialog
        open={editOpen}
        mode="edit"
        entityType="healthSystem"
        entityId={healthSystem.id}
        onClose={() => setEditOpen(false)}
        onSaved={handleOrgSaved}
      />
      <OrgEntityDialog
        open={addSpecialistOpen}
        mode="create"
        entityType="specialist"
        parentId={healthSystem.id}
        onClose={() => setAddSpecialistOpen(false)}
        onSaved={handleOrgSaved}
      />
    </>
  );
}
