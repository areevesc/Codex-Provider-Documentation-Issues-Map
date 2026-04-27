import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, Save, AlertTriangle } from 'lucide-react';
import type { IssueLabel } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { globalActiveProviderCountForLabel } from '@/lib/counts';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, FieldLabel } from '@/components/ui/Input';

interface EditIssueDialogProps {
  open: boolean;
  label: IssueLabel | null;
  onClose(): void;
}

export function EditIssueDialog({ open, label, onClose }: EditIssueDialogProps) {
  const labels = useAppStore((s) => s.issueLabels);
  const updateIssueLabel = useAppStore((s) => s.updateIssueLabel);
  const linkedProviderCount = useAppStore((s) =>
    label ? globalActiveProviderCountForLabel(s, label.id) : 0,
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (label) {
      setName(label.name);
      setDescription(label.description);
    }
  }, [label]);

  const trimmedName = name.trim();
  const trimmedDesc = description.trim();
  const nameChanged = !!label && trimmedName !== label.name.trim();
  const descChanged = !!label && trimmedDesc !== label.description.trim();
  const dirty = nameChanged || descChanged;

  const nameCollision = useMemo(() => {
    if (!label || !trimmedName) return undefined;
    const lower = trimmedName.toLowerCase();
    return Object.values(labels).find(
      (l) => l.id !== label.id && l.name.trim().toLowerCase() === lower,
    );
  }, [labels, label, trimmedName]);

  function handleClose() {
    onClose();
  }

  function handleSave() {
    if (!label || !dirty) return;
    if (nameCollision) return;
    if (!trimmedName) return;
    const updates: { name?: string; description?: string } = {};
    if (nameChanged) updates.name = trimmedName;
    if (descChanged) updates.description = trimmedDesc;
    updateIssueLabel(label.id, updates);
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-start sm:p-4 sm:pt-[10vh]">
        <DialogPanel className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-lg border border-line bg-surface-raised shadow-2xl sm:rounded-lg">
          <div className="flex items-start justify-between border-b border-line px-4 py-3">
            <div>
              <DialogTitle className="text-base font-semibold text-ink">
                Edit issue label
              </DialogTitle>
              <p className="mt-0.5 text-xs text-ink-muted">
                Changes apply to every linked ProviderIssue.
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
            <div className="space-y-1.5">
              <FieldLabel htmlFor="edit-name">Name</FieldLabel>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Label name"
              />
              {nameChanged && linkedProviderCount > 0 && (
                <div className="flex items-start gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 px-2.5 py-1.5 text-[11px] text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    This label is currently linked to {linkedProviderCount} provider
                    {linkedProviderCount === 1 ? '' : 's'}. Renaming will update everywhere it
                    appears.
                  </span>
                </div>
              )}
              {nameCollision && (
                <p className="text-xs text-status-active">
                  Another label already uses this name: “{nameCollision.name}”.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="edit-desc">Description</FieldLabel>
              <Textarea
                id="edit-desc"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!dirty || !trimmedName || !!nameCollision}
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
