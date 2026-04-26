import { HierarchyView } from '@/components/hierarchy/HierarchyView';
import { RightPanel } from '@/components/panel/RightPanel';

export function GraphHomePage() {
  return (
    <div className="grid h-full w-full grid-cols-[1fr_440px] overflow-hidden">
      <section className="h-full overflow-hidden border-r border-line bg-surface">
        <HierarchyView />
      </section>
      <aside className="h-full overflow-y-auto bg-surface-raised">
        <RightPanel />
      </aside>
    </div>
  );
}
