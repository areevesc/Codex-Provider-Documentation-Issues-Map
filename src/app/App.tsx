import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/store/useAppStore';

/**
 * Root application shell. The top nav is always visible; individual pages
 * render into <Outlet /> and supply their own layout (three-pane for the
 * graph home, single-column for everything else).
 */
export default function App() {
  const appearanceMode = useAppStore((s) => s.appearanceMode);
  const colorTheme = useAppStore((s) => s.colorTheme);

  useEffect(() => {
    document.documentElement.dataset.mode = appearanceMode;
    document.documentElement.dataset.theme = colorTheme;
  }, [appearanceMode, colorTheme]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
