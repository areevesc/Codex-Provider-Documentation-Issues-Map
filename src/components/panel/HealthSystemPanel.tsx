import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { activeIssueCountsForHealthSystem } from '@/lib/counts';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';
import { IssueCountList } from './IssueCountList';

interface HealthSystemPanelProps {
  healthSystemId: string;
}

export function HealthSystemPanel({ healthSystemId }: HealthSystemPanelProps) {
  const healthSystem = useAppStore((s) => s.healthSystems[healthSystemId]);
  const specialistsMap = useAppStore((s) => s.specialists);
  const clinicsMap = useAppStore((s) => s.clinics);
  const providersMap = useAppStore((s) => s.providers);
  const providerIssuesMap = useAppStore((s) => s.providerIssues);

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

  return (
    <PanelFrame
      type="healthSystem"
      title={healthSystem.name}
      subtitle={`${specialists.length} CDI specialist${specialists.length === 1 ? '' : 's'} · ${clinicCount} clinic${clinicCount === 1 ? '' : 's'} · ${providerCount} provider${providerCount === 1 ? '' : 's'}`}
    >
      <PanelSection title="CDI Specialists">
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
        rightAdornment={
          <span className="text-[11px] text-ink-muted">scoped to this system</span>
        }
      >
        <IssueCountList
          counts={counts}
          emptyText="No active issues in this health system."
        />
      </PanelSection>
    </PanelFrame>
  );
}
