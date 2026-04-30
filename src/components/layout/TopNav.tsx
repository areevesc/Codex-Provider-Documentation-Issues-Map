import { NavLink } from 'react-router-dom';
import { Library, Network, Settings } from 'lucide-react';

const navCls = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
    isActive ? 'bg-surface-panel text-ink' : 'text-ink-muted hover:bg-surface-panel hover:text-ink',
  ].join(' ');

export function TopNav() {
  return (
    <nav className="flex min-w-0 items-center gap-1">
      <NavLink to="/" end className={navCls}>
        <Network size={14} />
        Graph
      </NavLink>
      <NavLink to="/issues" className={navCls}>
        <Library size={14} />
        Issue Library
      </NavLink>
      <NavLink to="/settings" className={navCls}>
        <Settings size={14} />
        Settings
      </NavLink>
    </nav>
  );
}
