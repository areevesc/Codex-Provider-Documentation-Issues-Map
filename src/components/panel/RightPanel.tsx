import { useAppStore } from '@/store/useAppStore';
import { parseGraphNodeId } from '@/lib/ids';
import { HealthSystemPanel } from './HealthSystemPanel';
import { SpecialistPanel } from './SpecialistPanel';
import { ClinicPanel } from './ClinicPanel';
import { IssueLabelPanel } from './IssueLabelPanel';
import { ProviderPanel } from './ProviderPanel';
import { EmptyStatePanel } from './EmptyStatePanel';

export function RightPanel() {
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const selectedNodeType = useAppStore((s) => s.selectedNodeType);

  if (!selectedNodeId || !selectedNodeType) return <EmptyStatePanel />;

  const parsed = parseGraphNodeId(selectedNodeId);
  if (!parsed) return <EmptyStatePanel />;

  switch (selectedNodeType) {
    case 'healthSystem':
      return <HealthSystemPanel healthSystemId={parsed.refId} />;
    case 'specialist':
      return <SpecialistPanel specialistId={parsed.refId} />;
    case 'clinic':
      return <ClinicPanel clinicId={parsed.refId} />;
    case 'provider':
      return <ProviderPanel providerId={parsed.refId} />;
    case 'label':
      return <IssueLabelPanel labelId={parsed.refId} />;
    default:
      return <EmptyStatePanel />;
  }
}
