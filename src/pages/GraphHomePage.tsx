import { HierarchyView } from '@/components/hierarchy/HierarchyView';
import { RightPanel } from '@/components/panel/RightPanel';

export function GraphHomePage() {
  return (
    <div className="h-full w-full overflow-y-auto lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:overflow-hidden">
      <section className="h-[58vh] min-h-[420px] overflow-hidden border-b border-line bg-surface lg:h-full lg:min-h-0 lg:border-b-0 lg:border-r">
        <HierarchyView />
      </section>
      <aside className="min-h-[42vh] bg-surface-raised lg:h-full lg:overflow-y-auto">
        <RightPanel />
      </aside>
    </div>
  );
}
