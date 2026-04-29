import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { NodeType } from '@/types/graph';

interface PanelFrameProps {
  type: NodeType;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

const typeLabels: Record<NodeType, string> = {
  healthSystem: 'Health System',
  specialist: 'CDI Specialist',
  clinic: 'Clinic',
  provider: 'Provider',
  label: 'Issue Label',
};

const typeTones: Record<NodeType, Parameters<typeof Badge>[0]['tone']> = {
  healthSystem: 'default',
  specialist: 'purple',
  clinic: 'blue',
  provider: 'green',
  label: 'amber',
};

export function PanelFrame({
  type,
  title,
  subtitle,
  headerActions,
  children,
}: PanelFrameProps) {
  return (
    <div className="flex min-h-full flex-col lg:h-full">
      <div className="border-b border-line bg-surface-panel px-3 py-2 sm:px-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 sm:flex-nowrap">
            <Badge tone={typeTones[type]} className="shrink-0">
              {typeLabels[type]}
            </Badge>
            <h2 className="min-w-[7rem] flex-1 truncate text-sm font-semibold leading-tight text-ink">
              {title}
            </h2>
            {subtitle && (
              <div className="min-w-0 max-w-full truncate text-xs text-ink-muted sm:max-w-[8rem] sm:shrink">
                {subtitle}
              </div>
            )}
          </div>
          {headerActions && <div className="shrink-0">{headerActions}</div>}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-visible lg:overflow-y-auto">{children}</div>
    </div>
  );
}

export function PanelSection({
  title,
  rightAdornment,
  children,
}: {
  title: string;
  rightAdornment?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line last:border-b-0">
      <header className="flex items-center justify-between gap-3 px-3 pb-1 pt-3 sm:px-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {title}
        </h3>
        {rightAdornment}
      </header>
      <div className="px-3 pb-3 pt-1 text-sm text-ink sm:px-4">{children}</div>
    </section>
  );
}
