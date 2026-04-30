import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FieldLabel } from '@/components/ui/Input';

const ALL_VALUE = '__ALL__';

export function SpecialistSelector() {
  // Subscribe to the record (stable reference); derive the array in useMemo.
  const specialistsMap = useAppStore((s) => s.specialists);
  const specialistFilterId = useAppStore((s) => s.specialistFilterId);
  const setSpecialistFilter = useAppStore((s) => s.setSpecialistFilter);

  const sorted = useMemo(
    () => Object.values(specialistsMap).sort((a, b) => a.name.localeCompare(b.name)),
    [specialistsMap],
  );

  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor="specialist-filter">Specialist</FieldLabel>
      <div className="relative">
        <select
          id="specialist-filter"
          value={specialistFilterId ?? ALL_VALUE}
          onChange={(e) => {
            const v = e.target.value;
            setSpecialistFilter(v === ALL_VALUE ? null : v);
          }}
          className="block w-full appearance-none rounded-md border border-line bg-surface-raised px-3 py-2 pr-8 text-sm text-ink focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/25"
        >
          <option value={ALL_VALUE}>All specialists</option>
          {sorted.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.name}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[11px] text-ink-faint">
        Filters the graph to one specialist's subtree.
      </p>
    </div>
  );
}
