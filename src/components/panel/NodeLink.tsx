import type { ReactNode } from 'react';
import type { NodeType } from '@/types/graph';
import { useAppStore } from '@/store/useAppStore';
import { graphNodeId } from '@/lib/ids';

interface NodeLinkProps {
  type: NodeType;
  refId: string;
  children: ReactNode;
  className?: string;
}

/**
 * Clickable in-panel link that selects a graph node. Reuses the same selection
 * store the graph uses, so the canvas focus and right panel stay in sync.
 */
export function NodeLink({ type, refId, children, className = '' }: NodeLinkProps) {
  const setSelection = useAppStore((s) => s.setSelection);
  const graphId =
    type === 'healthSystem'
      ? graphNodeId.healthSystem(refId)
      : type === 'specialist'
        ? graphNodeId.specialist(refId)
        : type === 'clinic'
          ? graphNodeId.clinic(refId)
          : type === 'provider'
            ? graphNodeId.provider(refId)
            : graphNodeId.label(refId);
  return (
    <button
      type="button"
      onClick={() => setSelection(graphId, type)}
      className={[
        'inline-flex min-w-0 max-w-full items-center gap-1 rounded px-1 py-0.5 text-left text-sm text-ink transition-colors hover:bg-surface-subtle hover:text-ink',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}
