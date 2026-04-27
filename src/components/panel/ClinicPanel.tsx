import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getSpecialistForClinic } from '@/store/selectors';
import { activeIssueCountsForClinic } from '@/lib/counts';
import { isCurrentStatus } from '@/types/domain';
import type { IssueStatus } from '@/types/domain';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';
import { IssueCountList } from './IssueCountList';
import { StatusPill } from '@/components/ui/StatusPill';

interface ClinicPanelProps {
  clinicId: string;
}

export function ClinicPanel({ clinicId }: ClinicPanelProps) {
  const clinic = useAppStore((s) => s.clinics[clinicId]);
  const specialist = useAppStore((s) => getSpecialistForClinic(s, clinicId));
  const providersMap = useAppStore((s) => s.providers);
  const providerIssuesMap = useAppStore((s) => s.providerIssues);
  const issueLabelsMap = useAppStore((s) => s.issueLabels);

  const providers = useMemo(
    () =>
      Object.values(providersMap)
        .filter((p) => p.clinicId === clinicId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [providersMap, clinicId],
  );

  const counts = useMemo(
    () => activeIssueCountsForClinic(useAppStore.getState(), clinicId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clinicId, providersMap, providerIssuesMap],
  );

  const activeIssuesByProvider = useMemo(() => {
    const out: Record<string, Array<{ id: string; issueLabelId: string; status: IssueStatus }>> =
      {};
    for (const pi of Object.values(providerIssuesMap)) {
      if (!isCurrentStatus(pi.status)) continue;
      if (!out[pi.providerId]) out[pi.providerId] = [];
      out[pi.providerId].push({ id: pi.id, issueLabelId: pi.issueLabelId, status: pi.status });
    }
    return out;
  }, [providerIssuesMap]);

  if (!clinic) {
    return <div className="p-4 text-sm text-ink-muted">Clinic not found.</div>;
  }

  return (
    <PanelFrame
      type="clinic"
      title={clinic.name}
      subtitle={`${providers.length} provider${providers.length === 1 ? '' : 's'}`}
    >
      <PanelSection title="CDI Specialist">
        {specialist ? (
          <NodeLink type="specialist" refId={specialist.id}>
            {specialist.name}
          </NodeLink>
        ) : (
          <span className="text-xs text-ink-muted">Unassigned</span>
        )}
      </PanelSection>

      <PanelSection title="Providers">
        {providers.length === 0 ? (
          <div className="text-xs text-ink-muted">No providers.</div>
        ) : (
          <ul className="space-y-3">
            {providers.map((p) => {
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
            })}
          </ul>
        )}
      </PanelSection>

      <PanelSection
        title="Active Issue Summary"
        rightAdornment={<span className="text-[11px] text-ink-muted">scoped to this clinic</span>}
      >
        <IssueCountList counts={counts} emptyText="No active issues at this clinic." />
      </PanelSection>
    </PanelFrame>
  );
}
