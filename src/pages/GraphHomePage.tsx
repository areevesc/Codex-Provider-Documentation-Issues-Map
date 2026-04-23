import { useMemo } from "react";
import { CircleDot } from "lucide-react";
import { LeftSidebar } from "../components/sidebar/LeftSidebar";
import { RelationshipGraph } from "../components/graph/RelationshipGraph";
import { RightDetailPanel } from "../components/detailPanel/RightDetailPanel";
import { useAppStore } from "../store/useAppStore";
import { buildRelationshipGraphModel } from "../domain/graphModel";

export function GraphHomePage() {
  const entities = useAppStore((state) => state.entities);
  const selectedCdiSpecialistId = useAppStore((state) => state.selectedCdiSpecialistId);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const graph = useMemo(
    () => buildRelationshipGraphModel(entities, selectedCdiSpecialistId, searchQuery),
    [entities, searchQuery, selectedCdiSpecialistId]
  );

  return (
    <main className="home-shell">
      <LeftSidebar />
      <section className="graph-stage">
        <header className="graph-header">
          <div>
            <p className="eyebrow">Provider Documentation Issues Map</p>
            <h1 className="text-xl font-semibold text-slate-950">Relationship Graph</h1>
          </div>
          <div className="graph-counts">
            <span>
              <CircleDot aria-hidden="true" className="h-3.5 w-3.5" />
              {graph.nodes.length} nodes
            </span>
            <span>{graph.links.length} links</span>
          </div>
        </header>
        <div className="graph-canvas-shell">
          <RelationshipGraph graph={graph} />
        </div>
      </section>
      <RightDetailPanel />
    </main>
  );
}
