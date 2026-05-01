import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

/**
 * Dev-only reset: wipes the persisted prototype state and reloads the seed
 * dataset. Wrapped in a confirmation dialog because it's destructive.
 */
export function ResetSeedButton() {
  const resetToSeed = useAppStore((s) => s.resetToSeed);
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    resetToSeed();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-7 items-center gap-1 rounded-md bg-status-active/80 px-2 text-[10px] font-medium uppercase tracking-wider text-white transition-colors hover:bg-status-active"
        title="Wipe local changes and reload seed data"
      >
        <RotateCcw className="h-3 w-3" />
        <span className="hidden sm:inline">Reset seed</span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-start sm:p-4 sm:pt-[20vh]">
          <DialogPanel className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-lg border border-line bg-surface-raised shadow-2xl sm:rounded-lg">
            <div className="flex items-start gap-3 border-b border-line px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <DialogTitle className="text-sm font-semibold text-ink">
                  Reset to seed data?
                </DialogTitle>
                <p className="mt-1 text-xs text-ink-muted">
                  This will discard every label, assignment, and status change
                  you've made in this prototype and restore the original sample
                  dataset.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 bg-surface-panel px-4 py-3">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirm}>
                Reset
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

export function DeleteRosterDataButton() {
  const clearRosterData = useAppStore((s) => s.clearRosterData);
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    clearRosterData();
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-7 items-center gap-1 rounded-md bg-status-active/80 px-2 text-[10px] font-medium uppercase tracking-wider text-white transition-colors hover:bg-status-active"
        title="Delete roster/demo data but keep issue labels"
      >
        <Trash2 className="h-3 w-3" />
        <span className="hidden sm:inline">Delete demo data</span>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-start sm:p-4 sm:pt-[20vh]">
          <DialogPanel className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-lg border border-line bg-surface-raised shadow-2xl sm:rounded-lg">
            <div className="flex items-start gap-3 border-b border-line px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-active" />
              <div>
                <DialogTitle className="text-sm font-semibold text-ink">
                  Delete demo roster data?
                </DialogTitle>
                <p className="mt-1 text-xs text-ink-muted">
                  This deletes health systems, CDI specialists, clinics, providers, and provider
                  issue assignments in this browser. Issue labels are kept.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 bg-surface-panel px-4 py-3">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirm}>
                Delete
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
