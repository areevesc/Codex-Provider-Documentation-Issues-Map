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
    <div className="flex h-full flex-col">
      <div className="border-b border-line bg-surface-panel px-4 py-2">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Badge tone={typeTones[type]} className="shrink-0">
              {typeLabels[type]}
            </Badge>
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight text-ink">
              {title}
            </h2>
            {subtitle && (
              <div className="max-w-[45%] shrink-0 truncate text-xs text-ink-muted">
                {subtitle}
              </div>
            )}
          </div>
          {headerActions}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
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
      <header className="flex items-center justify-between px-4 pb-1 pt-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {title}
        </h3>
        {rightAdornment}
      </header>
      <div className="px-4 pb-3 pt-1 text-sm text-ink">{children}</div>
    </section>
  );
}
