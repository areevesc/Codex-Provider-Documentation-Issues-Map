import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Save, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { CDISpecialist, Clinic, HealthSystem, Provider } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { FieldLabel, Input } from '@/components/ui/Input';
import type { OrgEntityType } from '@/lib/orgDeletion';

type Mode = 'create' | 'edit';

interface OrgEntityDialogProps {
  open: boolean;
  mode: Mode;
  entityType: OrgEntityType;
  entityId?: string;
  parentId?: string;
  onClose(): void;
  onSaved?(entityType: OrgEntityType, id: string): void;
}

const selectClasses =
  'block w-full rounded-md border border-line bg-surface-raised px-3 py-2 text-sm text-ink focus:border-accent-specialist focus:outline-none focus:ring-2 focus:ring-accent-specialist/25 disabled:cursor-not-allowed disabled:opacity-60';

const titles: Record<OrgEntityType, string> = {
  healthSystem: 'health system',
  specialist: 'CDI specialist',
  clinic: 'clinic',
  provider: 'provider',
};

export function OrgEntityDialog({
  open,
  mode,
  entityType,
  entityId,
  parentId,
  onClose,
  onSaved,
}: OrgEntityDialogProps) {
  const healthSystems = useAppStore((s) => s.healthSystems);
  const specialists = useAppStore((s) => s.specialists);
  const clinics = useAppStore((s) => s.clinics);
  const providers = useAppStore((s) => s.providers);

  const createHealthSystem = useAppStore((s) => s.createHealthSystem);
  const updateHealthSystem = useAppStore((s) => s.updateHealthSystem);
  const createSpecialist = useAppStore((s) => s.createSpecialist);
  const updateSpecialist = useAppStore((s) => s.updateSpecialist);
  const createClinic = useAppStore((s) => s.createClinic);
  const updateClinic = useAppStore((s) => s.updateClinic);
  const createProvider = useAppStore((s) => s.createProvider);
  const updateProvider = useAppStore((s) => s.updateProvider);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [healthSystemId, setHealthSystemId] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [clinicId, setClinicId] = useState('');

  const healthSystemOptions = useMemo(
    () => Object.values(healthSystems).sort((a, b) => a.name.localeCompare(b.name)),
    [healthSystems],
  );
  const specialistOptions = useMemo(
    () => Object.values(specialists).sort((a, b) => a.name.localeCompare(b.name)),
    [specialists],
  );
  const clinicOptions = useMemo(
    () => Object.values(clinics).sort((a, b) => a.name.localeCompare(b.name)),
    [clinics],
  );

  useEffect(() => {
    if (!open) return;

    if (mode === 'create') {
      setName('');
      setSpecialty('');
      setHealthSystemId(entityType === 'specialist' ? (parentId ?? '') : '');
      setSpecialistId(entityType === 'clinic' ? (parentId ?? '') : '');
      setClinicId(entityType === 'provider' ? (parentId ?? '') : '');
      return;
    }

    if (entityType === 'healthSystem') {
      const entity = entityId ? healthSystems[entityId] : undefined;
      setName(entity?.name ?? '');
    } else if (entityType === 'specialist') {
      const entity = entityId ? specialists[entityId] : undefined;
      setName(entity?.name ?? '');
      setHealthSystemId(entity?.healthSystemId ?? '');
    } else if (entityType === 'clinic') {
      const entity = entityId ? clinics[entityId] : undefined;
      setName(entity?.name ?? '');
      setSpecialistId(entity?.cdiSpecialistId ?? '');
    } else {
      const entity = entityId ? providers[entityId] : undefined;
      setName(entity?.name ?? '');
      setClinicId(entity?.clinicId ?? '');
      setSpecialty(entity?.specialty ?? '');
    }
  }, [open, mode, entityType, entityId, parentId, healthSystems, specialists, clinics, providers]);

  const trimmedName = name.trim();
  const trimmedSpecialty = specialty.trim();
  const duplicate = useMemo(
    () =>
      findDuplicate(
        entityType,
        trimmedName,
        entityId,
        healthSystems,
        specialists,
        clinics,
        providers,
      ),
    [entityType, trimmedName, entityId, healthSystems, specialists, clinics, providers],
  );

  const missingParent =
    mode === 'create' &&
    ((entityType === 'specialist' && !healthSystemId) ||
      (entityType === 'clinic' && !specialistId) ||
      (entityType === 'provider' && !clinicId));
  const canSave = trimmedName.length >= 2 && !duplicate && !missingParent;
  const title = `${mode === 'create' ? 'Add' : 'Edit'} ${titles[entityType]}`;

  function handleClose() {
    onClose();
  }

  function handleSave() {
    if (!canSave) return;

    let savedId = entityId ?? '';
    if (entityType === 'healthSystem') {
      if (mode === 'create') savedId = createHealthSystem(trimmedName).id;
      else if (entityId) updateHealthSystem(entityId, { name: trimmedName });
    } else if (entityType === 'specialist') {
      if (mode === 'create') savedId = createSpecialist(trimmedName, healthSystemId).id;
      else if (entityId) updateSpecialist(entityId, { name: trimmedName });
    } else if (entityType === 'clinic') {
      if (mode === 'create') savedId = createClinic(trimmedName, specialistId).id;
      else if (entityId) updateClinic(entityId, { name: trimmedName });
    } else if (mode === 'create') {
      savedId = createProvider(trimmedName, clinicId, trimmedSpecialty).id;
    } else if (entityId) {
      updateProvider(entityId, { name: trimmedName, specialty: trimmedSpecialty });
    }

    onSaved?.(entityType, savedId);
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-start sm:p-4 sm:pt-[10vh]">
        <DialogPanel className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-lg border border-line bg-surface-raised shadow-2xl sm:rounded-lg">
          <div className="flex items-start justify-between border-b border-line px-4 py-3">
            <div>
              <DialogTitle className="text-base font-semibold text-ink">{title}</DialogTitle>
              <p className="mt-0.5 text-xs text-ink-muted">
                Organization names only. Do not enter patient names, MRNs, or chart details.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded p-1 text-ink-muted hover:bg-surface-subtle hover:text-ink"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 px-4 py-4">
            {mode === 'create' && entityType === 'specialist' && (
              <ParentSelect
                id="org-health-system"
                label="Health system"
                value={healthSystemId}
                options={healthSystemOptions}
                getLabel={(item) => item.name}
                onChange={setHealthSystemId}
              />
            )}
            {mode === 'create' && entityType === 'clinic' && (
              <ParentSelect
                id="org-specialist"
                label="CDI specialist"
                value={specialistId}
                options={specialistOptions}
                getLabel={(item) => item.name}
                onChange={setSpecialistId}
              />
            )}
            {mode === 'create' && entityType === 'provider' && (
              <ParentSelect
                id="org-clinic"
                label="Clinic"
                value={clinicId}
                options={clinicOptions}
                getLabel={(item) => item.name}
                onChange={setClinicId}
              />
            )}

            <div className="space-y-1.5">
              <FieldLabel htmlFor="org-name">Name</FieldLabel>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder(entityType)}
                autoFocus
              />
              {duplicate && (
                <p className="text-xs text-status-active">
                  “{duplicate.name}” already exists. Use the existing record instead of creating a
                  duplicate assignment.
                </p>
              )}
            </div>

            {entityType === 'provider' && (
              <div className="space-y-1.5">
                <FieldLabel htmlFor="org-specialty" hint="optional">
                  Specialty
                </FieldLabel>
                <Input
                  id="org-specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Family Medicine"
                />
              </div>
            )}

            {missingParent && (
              <p className="rounded-md border border-status-active/30 bg-status-active/10 px-3 py-2 text-xs text-status-active">
                Select a parent before saving.
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!canSave}
              icon={<Save className="h-3.5 w-3.5" />}
              className="w-full sm:w-auto"
            >
              Save
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

function ParentSelect<T extends { id: string }>({
  id,
  label,
  value,
  options,
  getLabel,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: T[];
  getLabel(item: T): string;
  onChange(value: string): void;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClasses}
      >
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {getLabel(item)}
          </option>
        ))}
      </select>
      {options.length === 0 && (
        <p className="text-xs text-status-active">Create a {label.toLowerCase()} first.</p>
      )}
    </div>
  );
}

function findDuplicate(
  entityType: OrgEntityType,
  name: string,
  entityId: string | undefined,
  healthSystems: Record<string, HealthSystem>,
  specialists: Record<string, CDISpecialist>,
  clinics: Record<string, Clinic>,
  providers: Record<string, Provider>,
): { id: string; name: string } | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  const records =
    entityType === 'healthSystem'
      ? Object.values(healthSystems)
      : entityType === 'specialist'
        ? Object.values(specialists)
        : entityType === 'clinic'
          ? Object.values(clinics)
          : Object.values(providers);
  return records.find(
    (record) => record.id !== entityId && record.name.trim().toLowerCase() === lower,
  );
}

function namePlaceholder(entityType: OrgEntityType): string {
  if (entityType === 'healthSystem') return 'e.g. Northstar Health Alliance';
  if (entityType === 'specialist') return 'e.g. Avery Quinn';
  if (entityType === 'clinic') return 'e.g. Maplewood Family Medicine';
  return 'e.g. Dr. Alex Reyna';
}
