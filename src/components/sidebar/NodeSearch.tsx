import { useMemo, useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { NodeType } from '@/types/graph';
import { graphNodeId } from '@/lib/ids';
import { Input, FieldLabel } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Hit {
  type: NodeType;
  id: string;
  label: string;
  subtitle?: string;
}

const MAX_HITS_PER_GROUP = 5;

export function NodeSearch() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setSelection = useAppStore((s) => s.setSelection);

  // Subscribe to the entity maps we need to search.
  const healthSystems = useAppStore((s) => s.healthSystems);
  const specialists = useAppStore((s) => s.specialists);
  const clinics = useAppStore((s) => s.clinics);
  const providers = useAppStore((s) => s.providers);
  const issueLabels = useAppStore((s) => s.issueLabels);

  const [focused, setFocused] = useState(false);

  const { groups, total } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { groups: {} as Record<NodeType, Hit[]>, total: 0 };

    const match = (text: string) => text.toLowerCase().includes(q);

    const hsHits: Hit[] = Object.values(healthSystems)
      .filter((hs) => match(hs.name))
      .slice(0, MAX_HITS_PER_GROUP)
      .map((hs) => ({ type: 'healthSystem', id: hs.id, label: hs.name }));

    const spHits: Hit[] = Object.values(specialists)
      .filter((sp) => match(sp.name))
      .slice(0, MAX_HITS_PER_GROUP)
      .map((sp) => ({
        type: 'specialist',
        id: sp.id,
        label: sp.name,
        subtitle: healthSystems[sp.healthSystemId]?.name,
      }));

    const clHits: Hit[] = Object.values(clinics)
      .filter((cl) => match(cl.name))
      .slice(0, MAX_HITS_PER_GROUP)
      .map((cl) => {
        const sp = specialists[cl.cdiSpecialistId];
        return { type: 'clinic', id: cl.id, label: cl.name, subtitle: sp?.name };
      });

    const prHits: Hit[] = Object.values(providers)
      .filter((p) => match(p.name) || (p.specialty ? match(p.specialty) : false))
      .slice(0, MAX_HITS_PER_GROUP)
      .map((p) => {
        const cl = clinics[p.clinicId];
        return {
          type: 'provider',
          id: p.id,
          label: p.name,
          subtitle: [p.specialty, cl?.name].filter(Boolean).join(' · '),
        };
      });

    const lbHits: Hit[] = Object.values(issueLabels)
      .filter((l) => match(l.name) || match(l.description))
      .slice(0, MAX_HITS_PER_GROUP)
      .map((l) => ({ type: 'label', id: l.id, label: l.name, subtitle: l.description }));

    const all = { healthSystem: hsHits, specialist: spHits, clinic: clHits, provider: prHits, label: lbHits };
    const count = hsHits.length + spHits.length + clHits.length + prHits.length + lbHits.length;
    return { groups: all, total: count };
  }, [searchQuery, healthSystems, specialists, clinics, providers, issueLabels]);

  function handlePick(hit: Hit) {
    const graphId =
      hit.type === 'healthSystem'
        ? graphNodeId.healthSystem(hit.id)
        : hit.type === 'specialist'
          ? graphNodeId.specialist(hit.id)
          : hit.type === 'clinic'
            ? graphNodeId.clinic(hit.id)
            : hit.type === 'provider'
              ? graphNodeId.provider(hit.id)
              : graphNodeId.label(hit.id);
    setSelection(graphId, hit.type);
    // Keep the query visible so the user can continue browsing; collapse the
    // dropdown by blurring.
    setFocused(false);
    (document.activeElement as HTMLElement | null)?.blur();
  }

  const showResults = focused && searchQuery.trim().length > 0;

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor="node-search">Search</FieldLabel>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <Input
          id="node-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          // Delay to allow click-selection on a result before blur collapses.
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder="Specialists, clinics, providers, labels…"
          className="pl-9 pr-8"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {showResults && (
          <div className="absolute z-30 mt-1 max-h-[60vh] w-full overflow-auto rounded-md border border-line bg-surface-raised shadow-lg">
            {total === 0 ? (
              <div className="px-3 py-4 text-xs text-ink-muted">No matches.</div>
            ) : (
              <div className="py-1 text-sm">
                <HitGroup title="Health Systems" hits={groups.healthSystem ?? []} onPick={handlePick} />
                <HitGroup title="Specialists" hits={groups.specialist ?? []} onPick={handlePick} />
                <HitGroup title="Clinics" hits={groups.clinic ?? []} onPick={handlePick} />
                <HitGroup title="Providers" hits={groups.provider ?? []} onPick={handlePick} />
                <HitGroup title="Issue labels" hits={groups.label ?? []} onPick={handlePick} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface HitGroupProps {
  title: string;
  hits: Hit[];
  onPick(hit: Hit): void;
}

const typeToTone: Record<NodeType, Parameters<typeof Badge>[0]['tone']> = {
  healthSystem: 'system',
  specialist: 'specialist',
  clinic: 'clinic',
  provider: 'provider',
  label: 'label',
};

function HitGroup({ title, hits, onPick }: HitGroupProps) {
  if (hits.length === 0) return null;
  return (
    <div className="border-b border-line last:border-b-0">
      <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        {title}
      </div>
      <ul>
        {hits.map((hit) => (
          <li key={`${hit.type}:${hit.id}`}>
            <button
              type="button"
              // onMouseDown ensures the handler runs before input blur hides the panel.
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(hit);
              }}
              className="flex w-full items-start gap-2 px-3 py-1.5 text-left hover:bg-surface-subtle"
            >
              <div className="mt-0.5 shrink-0">
                <Badge tone={typeToTone[hit.type]}>·</Badge>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-ink">{hit.label}</div>
                {hit.subtitle && (
                  <div className="truncate text-[11px] text-ink-muted">{hit.subtitle}</div>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
