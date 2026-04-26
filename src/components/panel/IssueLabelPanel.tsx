import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useAppStore } from '@/store/useAppStore';
import {
  activeClinicsForLabel,
  globalActiveClinicCountForLabel,
  globalActiveProviderCountForLabel,
} from '@/lib/counts';
import { isCurrentStatus } from '@/types/domain';
import { PanelFrame, PanelSection } from './PanelFrame';
import { NodeLink } from './NodeLink';

interface IssueLabelPanelProps {
  labelId: string;
}

export function IssueLabelPanel({ labelId }: IssueLabelPanelProps) {
  const label = useAppStore((s) => s.issueLabels[labelId]);
  const providerCount = useAppStore((s) => globalActiveProviderCountForLabel(s, labelId));
  const clinicCount = useAppStore((s) => globalActiveClinicCountForLabel(s, labelId));
  const providers = useAppStore((s) => s.providers);
  const clinics = useAppStore((s) => s.clinics);
  const providerIssuesMap = useAppStore((s) => s.providerIssues);
  const labelScopeProviderIds = useAppStore((s) => s.labelScopeProviderIds);

  const clinicIds = useAppStore(useShallow((s) => activeClinicsForLabel(s, labelId)));

  // Providers grouped by clinic — all active, globally.
  const providersByClinic = useMemo(() => {
    return buildProvidersByClinic(
      Object.values(providerIssuesMap),
      providers,
      clinics,
      labelId,
      null,
    );
  }, [providerIssuesMap, providers, clinics, labelId]);

  // Same grouping but restricted to the scope, when one is active.
  const scopeSet = useMemo(
    () => (labelScopeProviderIds ? new Set(labelScopeProviderIds) : null),
    [labelScopeProviderIds],
  );

  const scopedProvidersByClinic = useMemo(() => {
    if (!scopeSet) return null;
    return buildProvidersByClinic(
      Object.values(providerIssuesMap),
      providers,
      clinics,
      labelId,
      scopeSet,
    );
  }, [providerIssuesMap, providers, clinics, labelId, scopeSet]);

  const scopedProviderCount = useMemo(() => {
    if (!scopedProvidersByClinic) return 0;
    return scopedProvidersByClinic.reduce((n, g) => n + g.providers.length, 0);
  }, [scopedProvidersByClinic]);

  if (!label) {
    return <div className="p-4 text-sm text-ink-muted">Issue label not found.</div>;
  }

  const isScoped = scopedProvidersByClinic !== null;

  return (
    <PanelFrame
      type="label"
      title={label.name}
      subtitle={
        isScoped
          ? `${scopedProviderCount} provider${scopedProviderCount === 1 ? '' : 's'} in this scope`
          : `Active across ${providerCount} provider${providerCount === 1 ? '' : 's'} in ${clinicCount} clinic${clinicCount === 1 ? '' : 's'}`
      }
    >
      <PanelSection title="Description">
        <p className="text-sm leading-relaxed text-ink">{label.description}</p>
      </PanelSection>

      {isScoped ? (
        <>
          <PanelSection title="In This Scope">
            <ProvidersByClinicList groups={scopedProvidersByClinic!} />
          </PanelSection>

          <PanelSection title="System-wide">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Providers" value={providerCount} />
              <Stat label="Clinics" value={clinicCount} />
            </div>
          </PanelSection>
        </>
      ) : (
        <>
          <PanelSection title="Active Counts">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Providers" value={providerCount} />
              <Stat label="Clinics" value={clinicCount} />
            </div>
          </PanelSection>

          <PanelSection title="Linked Providers (active)">
            <ProvidersByClinicList groups={providersByClinic} />
          </PanelSection>

          <PanelSection title="Linked Clinics (active)">
            {clinicIds.length === 0 ? (
              <div className="text-xs text-ink-muted">No active clinics.</div>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {clinicIds.map((cid) => (
                  <li key={cid}>
                    <NodeLink
                      type="clinic"
                      refId={cid}
                      className="rounded border border-line bg-surface-panel px-2 py-1 text-xs"
                    >
                      {clinics[cid]?.name ?? cid}
                    </NodeLink>
                  </li>
                ))}
              </ul>
            )}
          </PanelSection>
        </>
      )}
    </PanelFrame>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type ClinicGroup = {
  clinicId: string;
  clinicName: string;
  providers: { providerId: string; name: string }[];
};

function buildProvidersByClinic(
  allIssues: ReturnType<typeof Object.values<{ issueLabelId: string; providerId: string; status: string }>>,
  providers: Record<string, { id: string; name: string; clinicId: string }>,
  clinics: Record<string, { id: string; name: string }>,
  labelId: string,
  scopeSet: Set<string> | null,
): ClinicGroup[] {
  const groups = new Map<string, { providerId: string; name: string }[]>();
  for (const pi of allIssues) {
    if (pi.issueLabelId !== labelId) continue;
    if (!isCurrentStatus(pi.status as never)) continue;
    if (scopeSet && !scopeSet.has(pi.providerId)) continue;
    const p = providers[pi.providerId];
    if (!p) continue;
    const arr = groups.get(p.clinicId) ?? [];
    if (!arr.some((x) => x.providerId === p.id)) {
      arr.push({ providerId: p.id, name: p.name });
    }
    groups.set(p.clinicId, arr);
  }
  return [...groups.entries()]
    .map(([clinicId, items]) => ({
      clinicId,
      clinicName: clinics[clinicId]?.name ?? 'Unknown clinic',
      providers: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.clinicName.localeCompare(b.clinicName));
}

function ProvidersByClinicList({ groups }: { groups: ClinicGroup[] }) {
  if (groups.length === 0) {
    return <div className="text-xs text-ink-muted">No active providers.</div>;
  }
  return (
    <ul className="space-y-3">
      {groups.map((group) => (
        <li key={group.clinicId}>
          <NodeLink type="clinic" refId={group.clinicId} className="font-medium">
            {group.clinicName}
          </NodeLink>
          <ul className="ml-3 mt-1 space-y-0.5 border-l border-line pl-3">
            {group.providers.map((p) => (
              <li key={p.providerId}>
                <NodeLink type="provider" refId={p.providerId} className="text-sm">
                  {p.name}
                </NodeLink>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-line bg-surface-panel px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums text-ink">{value}</div>
    </div>
  );
}
