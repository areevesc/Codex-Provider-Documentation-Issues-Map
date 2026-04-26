import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { activeIssueCountsForSpecialist } from '@/lib/counts';
import { isCurrentStatus } from '@/types/domain';
import type { IssueStatus } from '@/types/domain';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';
import { IssueCountList } from './IssueCountList';
import { StatusPill } from '@/components/ui/StatusPill';

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
    const out: Record<string, Array<{ id: string; issueLabelId: string; status: IssueStatus }>> = {};
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

  return (
    <PanelFrame
      type="specialist"
      title={specialist.name}
      subtitle={`${clinics.length} clinic${clinics.length === 1 ? '' : 's'} · ${providerCount} provider${providerCount === 1 ? '' : 's'}`}
    >
      <PanelSection title="Clinics & Providers">
        {clinicSections.length === 0 ? (
          <div className="text-xs text-ink-muted">No clinics assigned.</div>
        ) : (
          <ul className="space-y-3">
            {clinicSections.map(({ clinic, providers }) => (
              <li key={clinic.id}>
                <NodeLink type="clinic" refId={clinic.id} className="font-medium">
                  {clinic.name}
                </NodeLink>
                <ul className="ml-3 mt-1 space-y-1.5 border-l border-line pl-3">
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
                            <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-line/50 pl-2">
                              {issues.map((pi) => {
                                const label = issueLabelsMap[pi.issueLabelId];
                                return (
                                  <li key={pi.id} className="flex items-center gap-1.5">
                                    <NodeLink type="label" refId={pi.issueLabelId} className="text-xs">
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
  );
}
