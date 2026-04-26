import { useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, ChevronLeft, Check } from 'lucide-react';
import type { IssueLabel } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, FieldLabel } from '@/components/ui/Input';
import { DuplicateHintList } from './DuplicateHintList';

interface CreateIssueDialogProps {
  open: boolean;
  onClose(): void;
  /** Called with the newly-created label id when creation succeeds. */
  onCreated?: (labelId: string) => void;
  /** Called when the user picks an existing label from the duplicate hint. */
  onPickedExisting?: (labelId: string) => void;
}

type Step = 'name' | 'describe';

/**
 * Two-step create flow: (1) propose a name + see duplicate hints, confirm it's
 * not a dup; (2) write description + create. This is the only place new
 * IssueLabels can be created.
 */
export function CreateIssueDialog({
  open,
  onClose,
  onCreated,
  onPickedExisting,
}: CreateIssueDialogProps) {
  const labelsMap = useAppStore((s) => s.issueLabels);
  const labels = useMemo(() => Object.values(labelsMap), [labelsMap]);
  const createIssueLabel = useAppStore((s) => s.createIssueLabel);

  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const trimmedName = name.trim();
  const exactDuplicate = useMemo(
    () =>
      trimmedName
        ? labels.find((l) => l.name.trim().toLowerCase() === trimmedName.toLowerCase())
        : undefined,
    [labels, trimmedName],
  );

  function reset() {
    setStep('name');
    setName('');
    setDescription('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handlePickExisting(label: IssueLabel) {
    onPickedExisting?.(label.id);
    handleClose();
  }

  function handleCreate() {
    if (!trimmedName || !description.trim() || exactDuplicate) return;
    const created = createIssueLabel(trimmedName, description.trim());
    onCreated?.(created.id);
    handleClose();
  }

  const canContinueFromName = trimmedName.length >= 2 && !exactDuplicate;

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-[10vh]">
        <DialogPanel className="w-full max-w-lg overflow-hidden rounded-lg border border-line bg-surface-raised shadow-2xl">
          <div className="flex items-start justify-between border-b border-line px-4 py-3">
            <div>
              <DialogTitle className="text-base font-semibold text-ink">
                Create issue label
              </DialogTitle>
              <p className="mt-0.5 text-xs text-ink-muted">
                Step {step === 'name' ? 1 : 2} of 2 ·{' '}
                {step === 'name' ? 'Name + duplicate check' : 'Description'}
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

          {step === 'name' ? (
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="create-name">Proposed name</FieldLabel>
                <Input
                  id="create-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Missing specificity"
                  autoFocus
                />
                {exactDuplicate && (
                  <p className="text-xs text-status-active">
                    A label with this exact name already exists: “{exactDuplicate.name}”. Pick a
                    different name or use the existing one.
                  </p>
                )}
              </div>

              <DuplicateHintList
                query={trimmedName}
                candidates={labels}
                onPick={handlePickExisting}
              />

              <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={!canContinueFromName}
                  onClick={() => setStep('describe')}
                >
                  Continue — mine is different
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-4 py-4">
              <div className="rounded-md border border-line bg-surface-panel px-3 py-2 text-sm">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                  Name
                </div>
                <div className="mt-0.5 font-medium text-ink">{trimmedName}</div>
              </div>

              <div className="space-y-1.5">
                <FieldLabel htmlFor="create-desc">
                  Description
                  <span className="ml-1 font-normal text-ink-faint">
                    (what this label covers)
                  </span>
                </FieldLabel>
                <Textarea
                  id="create-desc"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain when a provider-issue should be tagged with this label, including edge cases and examples."
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between border-t border-line pt-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep('name')}
                  icon={<ChevronLeft className="h-3.5 w-3.5" />}
                >
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!description.trim()}
                    onClick={handleCreate}
                    icon={<Check className="h-3.5 w-3.5" />}
                  >
                    Create label
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
