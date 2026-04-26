import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

/**
 * Root application shell. The top nav is always visible; individual pages
 * render into <Outlet /> and supply their own layout (three-pane for the
 * graph home, single-column for everything else).
 */
export default function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
