import type { IssueStatus } from '@/types/domain';

interface StatusPillProps {
  status: IssueStatus;
  className?: string;
}

const statusClasses: Record<IssueStatus, string> = {
  Active: 'bg-status-active/15 text-status-active border-status-active/30',
  Improving: 'bg-status-improving/15 text-status-improving border-status-improving/30',
  Resolved: 'bg-status-resolved/15 text-status-resolved border-status-resolved/30',
};

export function StatusPill({ status, className = '' }: StatusPillProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        statusClasses[status],
        className,
      ].join(' ')}
    >
      {status}
    </span>
  );
}
