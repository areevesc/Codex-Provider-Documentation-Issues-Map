import { NodeSearch } from './NodeSearch';

export function LeftSidebar() {
  return (
    <div className="flex h-full flex-col gap-5 p-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          CDI Tracker
        </div>
        <p className="mt-1 text-[11px] text-ink-faint">
          Click a specialist to expand their clinics and providers.
        </p>
      </div>
      <NodeSearch />
    </div>
  );
}
