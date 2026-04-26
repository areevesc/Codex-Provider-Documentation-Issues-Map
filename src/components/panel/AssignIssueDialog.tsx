import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { ChevronDown, Check, ExternalLink, X } from 'lucide-react';
import type { IssueLabel } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { isCurrentStatus } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Textarea, FieldLabel } from '@/components/ui/Input';

interface AssignIssueDialogProps {
  open: boolean;
  providerId: string;
  onClose(): void;
}

/**
 * Assign an EXISTING issue label to a provider. Creates a ProviderIssue with
 * status=Active. Labels the provider is already currently linked to are filtered
 * out of the combobox so the user can't create duplicate current ProviderIssues.
 *
 * Per SPEC, creating a brand-new IssueLabel is intentionally NOT possible here —
 * the user must go to the Issue Library to create a new canonical label.
 */
export function AssignIssueDialog({ open, providerId, onClose }: AssignIssueDialogProps) {
  const labelsMap = useAppStore((s) => s.issueLabels);
  const labels = useMemo(() => Object.values(labelsMap), [labelsMap]);
  const providerIssues = useAppStore((s) => s.providerIssues);
  const assignIssueToProvider = useAppStore((s) => s.assignIssueToProvider);

  const excludedIds = useMemo(() => {
    const excluded = new Set<string>();
    for (const pi of Object.values(providerIssues)) {
      if (pi.providerId === providerId && isCurrentStatus(pi.status)) {
        excluded.add(pi.issueLabelId);
      }
    }
    return excluded;
  }, [providerIssues, providerId]);

  const availableLabels = useMemo(
    () =>
      labels
        .filter((l) => !excludedIds.has(l.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [labels, excludedIds],
  );

  const [selected, setSelected] = useState<IssueLabel | null>(null);
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableLabels;
    return availableLabels.filter((l) => l.name.toLowerCase().includes(q));
  }, [availableLabels, query]);

  function handleClose() {
    // reset local form on close
    setSelected(null);
    setQuery('');
    setNotes('');
    onClose();
  }

  function handleAssign() {
    if (!selected) return;
    assignIssueToProvider(providerId, selected.id, notes.trim());
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-[12vh]">
        <DialogPanel className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-surface-raised shadow-2xl">
          <div className="flex items-start justify-between border-b border-line px-4 py-3">
            <div>
              <DialogTitle className="text-base font-semibold text-ink">
                Assign issue label
              </DialogTitle>
              <p className="mt-0.5 text-xs text-ink-muted">
                Link an existing label to this provider. Creates an Active issue.
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
              <FieldLabel htmlFor="assign-label-combo">
                Issue label
              </FieldLabel>
              <Combobox
                value={selected}
                onChange={(v: IssueLabel | null) => setSelected(v)}
                immediate
              >
                <div className="relative">
                  <ComboboxInput
                    id="assign-label-combo"
                    displayValue={(l: IssueLabel | null) => l?.name ?? ''}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search existing labels..."
                    className="block w-full rounded-md border border-line bg-surface-raised py-2 pl-3 pr-9 text-sm text-ink placeholder:text-ink-faint focus:border-accent-specialist focus:outline-none focus:ring-2 focus:ring-accent-specialist/25"
                  />
                  <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-muted">
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </ComboboxButton>
                  <ComboboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-line bg-surface-raised py-1 shadow-lg focus:outline-none">
                    {filtered.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-ink-muted">
                        {availableLabels.length === 0
                          ? 'All labels are already linked to this provider.'
                          : 'No matching labels.'}
                      </div>
                    ) : (
                      filtered.map((l) => (
                        <ComboboxOption
                          key={l.id}
                          value={l}
                          className={({ focus, selected: isSel }) =>
                            [
                              'relative cursor-pointer select-none px-3 py-2 text-sm',
                              focus ? 'bg-surface-subtle' : '',
                              isSel ? 'text-ink' : 'text-ink',
                            ].join(' ')
                          }
                        >
                          {({ selected: isSel }) => (
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                                {isSel && (
                                  <Check
                                    className="h-4 w-4 text-accent-specialist"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">{l.name}</div>
                                <div className="line-clamp-2 text-xs text-ink-muted">
                                  {l.description}
                                </div>
                              </div>
                            </div>
                          )}
                        </ComboboxOption>
                      ))
                    )}
                  </ComboboxOptions>
                </div>
              </Combobox>

              {selected && (
                <p className="mt-1 text-xs text-ink-muted">{selected.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="assign-notes" hint="optional">
                Initial notes
              </FieldLabel>
              <Textarea
                id="assign-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Context, the documentation snippet, or what the clinician needs to know."
              />
            </div>

            <div className="rounded-md border border-dashed border-line bg-surface-panel px-3 py-2 text-xs text-ink-muted">
              Not finding the right label?{' '}
              <Link
                to="/issues"
                onClick={handleClose}
                className="inline-flex items-center gap-1 font-medium text-accent-specialist hover:underline"
              >
                Go to Issue Library
                <ExternalLink className="h-3 w-3" />
              </Link>{' '}
              to create a new one.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-panel px-4 py-3">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssign} disabled={!selected}>
              Assign label
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
