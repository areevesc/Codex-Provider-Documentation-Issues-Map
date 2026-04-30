import { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, Network, Library, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { parseGraphNodeId, graphNodeId } from '@/lib/ids';
import {
  activeIssueCountsForHealthSystem,
  activeIssueCountsForSpecialist,
  activeIssueCountsForClinic,
} from '@/lib/counts';
import { isCurrentStatus } from '@/types/domain';
import type { LabelCount } from '@/lib/counts';
import { NodeSearch } from '@/components/sidebar/NodeSearch';
import { ResetSeedButton } from '@/components/layout/ResetSeedButton';
import { OrgEntityDialog } from '@/components/org/OrgEntityDialog';
import type { OrgEntityType } from '@/lib/orgDeletion';

export function HierarchyView() {
  const setSelection = useAppStore((s) => s.setSelection);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const selectedNodeType = useAppStore((s) => s.selectedNodeType);
  const healthSystemsMap = useAppStore((s) => s.healthSystems);
  const specialistsMap = useAppStore((s) => s.specialists);
  const clinicsMap = useAppStore((s) => s.clinics);
  const providersMap = useAppStore((s) => s.providers);
  const providerIssuesMap = useAppStore((s) => s.providerIssues);

  const [expandedHealthSystemIds, setExpandedHealthSystemIds] = useState<Set<string>>(new Set());
  const [expandedSpecialistIds, setExpandedSpecialistIds] = useState<Set<string>>(new Set());
  const [expandedClinicIds, setExpandedClinicIds] = useState<Set<string>>(new Set());
  const [addHealthSystemOpen, setAddHealthSystemOpen] = useState(false);

  const healthSystems = useMemo(
    () => Object.values(healthSystemsMap).sort((a, b) => a.name.localeCompare(b.name)),
    [healthSystemsMap],
  );

  // ── Pre-computed issue counts ────────────────────────────────────────────

  const healthSystemIssueCounts = useMemo(() => {
    const s = useAppStore.getState();
    const out: Record<string, LabelCount[]> = {};
    for (const hs of healthSystems) out[hs.id] = activeIssueCountsForHealthSystem(s, hs.id);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthSystems, specialistsMap, clinicsMap, providersMap, providerIssuesMap]);

  const specialistIssueCounts = useMemo(() => {
    const s = useAppStore.getState();
    const out: Record<string, LabelCount[]> = {};
    for (const sp of Object.values(specialistsMap))
      out[sp.id] = activeIssueCountsForSpecialist(s, sp.id);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialistsMap, clinicsMap, providersMap, providerIssuesMap]);

  const clinicIssueCounts = useMemo(() => {
    const s = useAppStore.getState();
    const out: Record<string, LabelCount[]> = {};
    for (const cl of Object.values(clinicsMap)) out[cl.id] = activeIssueCountsForClinic(s, cl.id);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicsMap, providersMap, providerIssuesMap]);

  const providerActiveIssueCount = useMemo(() => {
    const out: Record<string, number> = {};
    for (const pi of Object.values(providerIssuesMap)) {
      if (!isCurrentStatus(pi.status)) continue;
      out[pi.providerId] = (out[pi.providerId] ?? 0) + 1;
    }
    return out;
  }, [providerIssuesMap]);

  const providerCountPerClinic = useMemo(() => {
    const out: Record<string, number> = {};
    for (const p of Object.values(providersMap)) out[p.clinicId] = (out[p.clinicId] ?? 0) + 1;
    return out;
  }, [providersMap]);

  const clinicCountPerSpecialist = useMemo(() => {
    const out: Record<string, number> = {};
    for (const cl of Object.values(clinicsMap))
      out[cl.cdiSpecialistId] = (out[cl.cdiSpecialistId] ?? 0) + 1;
    return out;
  }, [clinicsMap]);

  const specialistCountPerHealthSystem = useMemo(() => {
    const out: Record<string, number> = {};
    for (const sp of Object.values(specialistsMap))
      out[sp.healthSystemId] = (out[sp.healthSystemId] ?? 0) + 1;
    return out;
  }, [specialistsMap]);

  // ── Sync tree expansion from store selection (search / NodeLink) ──────────

  useEffect(() => {
    if (!selectedNodeId || !selectedNodeType) return;
    const parsed = parseGraphNodeId(selectedNodeId);
    if (!parsed) return;

    if (selectedNodeType === 'healthSystem') {
      setExpandedHealthSystemIds((prev) => new Set([...prev, parsed.refId]));
    } else if (selectedNodeType === 'specialist') {
      const sp = specialistsMap[parsed.refId];
      if (sp) {
        setExpandedHealthSystemIds((prev) => new Set([...prev, sp.healthSystemId]));
        setExpandedSpecialistIds((prev) => new Set([...prev, parsed.refId]));
      }
    } else if (selectedNodeType === 'clinic') {
      const clinic = clinicsMap[parsed.refId];
      if (clinic) {
        const sp = specialistsMap[clinic.cdiSpecialistId];
        if (sp) setExpandedHealthSystemIds((prev) => new Set([...prev, sp.healthSystemId]));
        setExpandedSpecialistIds((prev) => new Set([...prev, clinic.cdiSpecialistId]));
        setExpandedClinicIds((prev) => new Set([...prev, parsed.refId]));
      }
    } else if (selectedNodeType === 'provider') {
      const provider = providersMap[parsed.refId];
      if (provider) {
        const clinic = clinicsMap[provider.clinicId];
        if (clinic) {
          const sp = specialistsMap[clinic.cdiSpecialistId];
          if (sp) setExpandedHealthSystemIds((prev) => new Set([...prev, sp.healthSystemId]));
          setExpandedSpecialistIds((prev) => new Set([...prev, clinic.cdiSpecialistId]));
          setExpandedClinicIds((prev) => new Set([...prev, provider.clinicId]));
        }
      }
    }
  }, [selectedNodeId, selectedNodeType, specialistsMap, clinicsMap, providersMap]);

  const selectedRefId = selectedNodeId ? (parseGraphNodeId(selectedNodeId)?.refId ?? null) : null;

  // ── Handlers ─────────────────────────────────────────────────────────────

  function toggleHealthSystem(id: string) {
    setExpandedHealthSystemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelection(graphNodeId.healthSystem(id), 'healthSystem');
  }

  function toggleSpecialist(id: string) {
    setExpandedSpecialistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelection(graphNodeId.specialist(id), 'specialist');
  }

  function toggleClinic(id: string) {
    setExpandedClinicIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelection(graphNodeId.clinic(id), 'clinic');
  }

  function handleSelectProvider(id: string) {
    setSelection(graphNodeId.provider(id), 'provider');
  }

  function handleOrgSaved(entityType: OrgEntityType, id: string) {
    if (entityType !== 'healthSystem') return;
    setExpandedHealthSystemIds((prev) => new Set([...prev, id]));
    setSelection(graphNodeId.healthSystem(id), 'healthSystem');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-line bg-surface-raised">
        <div className="flex flex-col gap-2 px-3 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold tracking-wide text-ink">
              CDI Relationship Tracker
            </span>
            <span className="rounded border border-line bg-surface-panel px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-muted">
              Prototype
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <nav className="flex min-w-0 items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-surface-panel text-ink'
                      : 'text-ink-muted hover:bg-surface-panel hover:text-ink',
                  ].join(' ')
                }
              >
                <Network size={14} />
                Graph
              </NavLink>
              <NavLink
                to="/issues"
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-surface-panel text-ink'
                      : 'text-ink-muted hover:bg-surface-panel hover:text-ink',
                  ].join(' ')
                }
              >
                <Library size={14} />
                Issue Library
              </NavLink>
            </nav>
            <div className="h-5 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setAddHealthSystemOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-panel px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
            >
              <Plus size={14} />
              Health system
            </button>
            <ResetSeedButton />
          </div>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <NodeSearch />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-1.5 py-2 sm:px-2">
        {healthSystems.map((hs) => {
          const isHsExpanded = expandedHealthSystemIds.has(hs.id);
          const isHsSelected = selectedNodeType === 'healthSystem' && selectedRefId === hs.id;
          const hsCounts = healthSystemIssueCounts[hs.id] ?? [];
          const hsTotal = hsCounts.reduce((n, c) => n + c.providerCount, 0);
          const hsSpCount = specialistCountPerHealthSystem[hs.id] ?? 0;
          const specialistsForHs = Object.values(specialistsMap)
            .filter((sp) => sp.healthSystemId === hs.id)
            .sort((a, b) => a.name.localeCompare(b.name));

          return (
            <div key={hs.id} className="mb-1">
              {/* Health System row */}
              <button
                type="button"
                onClick={() => toggleHealthSystem(hs.id)}
                className={[
                  'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left transition-colors',
                  isHsSelected ? 'bg-surface-subtle ring-1 ring-line' : 'hover:bg-surface-subtle',
                ].join(' ')}
              >
                <ChevronRight
                  className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-150 ${isHsExpanded ? 'rotate-90' : ''}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`truncate text-sm font-bold ${isHsSelected ? 'text-ink' : 'text-ink'}`}
                    >
                      {hs.name}
                    </span>
                    {hsTotal > 0 && (
                      <span className="shrink-0 rounded-full bg-surface-panel px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink-muted ring-1 ring-line">
                        {hsTotal}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-faint">
                    {hsSpCount} CDI specialist{hsSpCount === 1 ? '' : 's'}
                    {hsCounts.length > 0 &&
                      ` · ${hsCounts.length} issue type${hsCounts.length === 1 ? '' : 's'}`}
                  </div>
                </div>
              </button>

              {/* CDI Specialists */}
              {isHsExpanded && (
                <div className="ml-3 border-l border-line/50 pl-1.5 sm:ml-5 sm:pl-2">
                  {specialistsForHs.map((sp) => {
                    const isSpExpanded = expandedSpecialistIds.has(sp.id);
                    const isSpSelected =
                      selectedNodeType === 'specialist' && selectedRefId === sp.id;
                    const spCounts = specialistIssueCounts[sp.id] ?? [];
                    const spTotal = spCounts.reduce((n, c) => n + c.providerCount, 0);
                    const spClinicCount = clinicCountPerSpecialist[sp.id] ?? 0;
                    const clinicsForSp = Object.values(clinicsMap)
                      .filter((c) => c.cdiSpecialistId === sp.id)
                      .sort((a, b) => a.name.localeCompare(b.name));

                    return (
                      <div key={sp.id} className="mb-0.5">
                        {/* Specialist row */}
                        <button
                          type="button"
                          onClick={() => toggleSpecialist(sp.id)}
                          className={[
                            'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left transition-colors',
                            isSpSelected
                              ? 'bg-accent-specialist/10 ring-1 ring-accent-specialist/25'
                              : 'hover:bg-surface-subtle',
                          ].join(' ')}
                        >
                          <ChevronRight
                            className={`h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform duration-150 ${isSpExpanded ? 'rotate-90' : ''}`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`truncate text-sm font-semibold ${isSpSelected ? 'text-accent-specialist' : 'text-ink'}`}
                              >
                                {sp.name}
                              </span>
                              {spTotal > 0 && (
                                <span className="shrink-0 rounded-full bg-accent-specialist/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-accent-specialist">
                                  {spTotal}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 text-[11px] text-ink-faint">
                              {spClinicCount} {spClinicCount === 1 ? 'clinic' : 'clinics'}
                              {spCounts.length > 0 &&
                                ` · ${spCounts.length} issue type${spCounts.length === 1 ? '' : 's'}`}
                            </div>
                          </div>
                        </button>

                        {/* Clinics */}
                        {isSpExpanded && (
                          <div className="ml-3 border-l border-line/50 pl-1.5 sm:ml-5 sm:pl-2">
                            {clinicsForSp.map((cl) => {
                              const isClExpanded = expandedClinicIds.has(cl.id);
                              const isClSelected =
                                selectedNodeType === 'clinic' && selectedRefId === cl.id;
                              const clCounts = clinicIssueCounts[cl.id] ?? [];
                              const clTotal = clCounts.reduce((n, c) => n + c.providerCount, 0);
                              const pCount = providerCountPerClinic[cl.id] ?? 0;
                              const providersForCl = Object.values(providersMap)
                                .filter((p) => p.clinicId === cl.id)
                                .sort((a, b) => a.name.localeCompare(b.name));

                              return (
                                <div key={cl.id} className="mb-0.5">
                                  {/* Clinic row */}
                                  <button
                                    type="button"
                                    onClick={() => toggleClinic(cl.id)}
                                    className={[
                                      'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors',
                                      isClSelected
                                        ? 'bg-accent-clinic/10 ring-1 ring-accent-clinic/25'
                                        : 'hover:bg-surface-subtle',
                                    ].join(' ')}
                                  >
                                    <ChevronRight
                                      className={`h-3 w-3 shrink-0 text-ink-muted transition-transform duration-150 ${isClExpanded ? 'rotate-90' : ''}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <span
                                          className={`text-sm font-medium leading-snug ${isClSelected ? 'text-accent-clinic' : 'text-ink'}`}
                                        >
                                          {cl.name}
                                        </span>
                                        {clTotal > 0 && (
                                          <span className="shrink-0 rounded-full bg-accent-clinic/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-accent-clinic">
                                            {clTotal}
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-0.5 text-[11px] text-ink-faint">
                                        {pCount} {pCount === 1 ? 'provider' : 'providers'}
                                        {clCounts.length > 0 &&
                                          ` · ${clCounts.length} issue type${clCounts.length === 1 ? '' : 's'}`}
                                      </div>
                                    </div>
                                  </button>

                                  {/* Providers */}
                                  {isClExpanded && (
                                    <div className="ml-2 border-l border-line/50 pl-1.5 sm:ml-4 sm:pl-2">
                                      {providersForCl.map((p) => {
                                        const isPSelected =
                                          selectedNodeType === 'provider' && selectedRefId === p.id;
                                        const issueCount = providerActiveIssueCount[p.id] ?? 0;

                                        return (
                                          <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handleSelectProvider(p.id)}
                                            className={[
                                              'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                                              isPSelected
                                                ? 'bg-accent-provider/10 ring-1 ring-accent-provider/25'
                                                : 'hover:bg-surface-subtle',
                                            ].join(' ')}
                                          >
                                            <span className="h-3.5 w-3.5 shrink-0" />
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center justify-between gap-2">
                                                <span
                                                  className={`truncate text-sm ${isPSelected ? 'font-semibold text-accent-provider' : 'font-medium text-ink'}`}
                                                >
                                                  {p.name}
                                                </span>
                                                {issueCount > 0 && (
                                                  <span className="shrink-0 rounded-full bg-accent-provider/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-accent-provider">
                                                    {issueCount}
                                                  </span>
                                                )}
                                              </div>
                                              {p.specialty && (
                                                <div className="mt-0.5 text-[11px] text-ink-faint">
                                                  {p.specialty}
                                                </div>
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <OrgEntityDialog
        open={addHealthSystemOpen}
        mode="create"
        entityType="healthSystem"
        onClose={() => setAddHealthSystemOpen(false)}
        onSaved={handleOrgSaved}
      />
    </div>
  );
}
