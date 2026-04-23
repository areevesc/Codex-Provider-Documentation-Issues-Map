import { Link } from "react-router-dom";
import { BookOpen, RotateCcw, Search } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { getAllProviderIds, getIssueSummariesForProviderIds, getProviderIdsForCdi, sortByName, values } from "../../domain/selectors";

export function LeftSidebar() {
  const entities = useAppStore((state) => state.entities);
  const selectedCdiSpecialistId = useAppStore((state) => state.selectedCdiSpecialistId);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSelectedCdiSpecialistId = useAppStore((state) => state.setSelectedCdiSpecialistId);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const selectNode = useAppStore((state) => state.selectNode);
  const resetDemoData = useAppStore((state) => state.resetDemoData);

  const scopedProviderIds = selectedCdiSpecialistId
    ? getProviderIdsForCdi(entities, selectedCdiSpecialistId)
    : getAllProviderIds(entities);
  const issueSummaries = getIssueSummariesForProviderIds(entities, scopedProviderIds);
  const selectedCdi = selectedCdiSpecialistId ? entities.cdiSpecialists[selectedCdiSpecialistId] : undefined;

  function handleCdiChange(value: string) {
    const nextValue = value || null;
    setSelectedCdiSpecialistId(nextValue);
    selectNode(nextValue ? { type: "cdi", id: nextValue } : null);
  }

  return (
    <aside className="home-sidebar border-r border-slate-200 bg-white">
      <div className="space-y-6">
        <div>
          <p className="eyebrow">CDI context</p>
          <select
            aria-label="CDI specialist selector"
            className="select-input mt-2"
            onChange={(event) => handleCdiChange(event.target.value)}
            value={selectedCdiSpecialistId ?? ""}
          >
            <option value="">All CDI specialists</option>
            {sortByName(values(entities.cdiSpecialists)).map((cdi) => (
              <option key={cdi.id} value={cdi.id}>
                {cdi.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="eyebrow">Search</p>
          <div className="field-shell mt-2">
            <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
            <input
              aria-label="Search graph"
              className="field-input"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Provider, clinic, issue"
              value={searchQuery}
            />
          </div>
        </div>

        <div>
          <p className="eyebrow">Filters</p>
          <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            Graph links show current issues only: Active and Improving.
          </div>
        </div>

        <div>
          <p className="eyebrow">Current scope</p>
          <div className="mt-2 space-y-2">
            <div className="metric-row">
              <span>Providers</span>
              <strong>{scopedProviderIds.length}</strong>
            </div>
            <div className="metric-row">
              <span>Active issue labels</span>
              <strong>{issueSummaries.length}</strong>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3 text-sm leading-5 text-slate-600">
              {selectedCdi ? selectedCdi.name : "All CDI specialists"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Link className="secondary-button w-full justify-center" to="/issues">
          <BookOpen aria-hidden="true" className="h-4 w-4" />
          Issue Library
        </Link>
        <button className="ghost-button w-full justify-center" onClick={resetDemoData} type="button">
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset Demo Data
        </button>
      </div>
    </aside>
  );
}
