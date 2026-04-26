import type { ReactNode } from 'react';

interface ThreePaneLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

/**
 * Three-pane home layout: left sidebar (filters/search), center graph canvas,
 * right detail panel. Uses a CSS grid with fixed left/right widths and a
 * flexible center. The whole layout fills the parent and never scrolls at the
 * root — each pane scrolls independently.
 */
export function ThreePaneLayout({ left, center, right }: ThreePaneLayoutProps) {
  return (
    <div className="grid h-full w-full grid-cols-[280px_1fr_360px] overflow-hidden">
      <aside className="h-full overflow-y-auto border-r border-line bg-surface-raised">
        {left}
      </aside>
      <section className="h-full overflow-hidden bg-surface">{center}</section>
      <aside className="h-full overflow-y-auto border-l border-line bg-surface-raised">
        {right}
      </aside>
    </div>
  );
}
