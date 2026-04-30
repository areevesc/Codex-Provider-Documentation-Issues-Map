import type { ReactNode } from 'react';

type Tone =
  | 'default'
  | 'system'
  | 'specialist'
  | 'clinic'
  | 'provider'
  | 'label'
  | 'purple'
  | 'blue'
  | 'green'
  | 'amber'
  | 'muted';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  default: 'bg-surface-subtle text-ink border-line',
  system: 'bg-accent-healthSystem/15 text-accent-healthSystem border-accent-healthSystem/30',
  specialist: 'bg-accent-specialist/15 text-accent-specialist border-accent-specialist/30',
  clinic: 'bg-accent-clinic/15 text-accent-clinic border-accent-clinic/30',
  provider: 'bg-accent-provider/15 text-accent-provider border-accent-provider/30',
  label: 'bg-accent-label/15 text-accent-label border-accent-label/30',
  purple: 'bg-accent-specialist/15 text-accent-specialist border-accent-specialist/30',
  blue: 'bg-accent-clinic/15 text-accent-clinic border-accent-clinic/30',
  green: 'bg-accent-provider/15 text-accent-provider border-accent-provider/30',
  amber: 'bg-accent-label/15 text-accent-label border-accent-label/30',
  muted: 'bg-surface-panel text-ink-muted border-line',
};

export function Badge({ tone = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        toneClasses[tone],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
