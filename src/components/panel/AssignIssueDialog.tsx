import { useMemo, useState, type ClipboardEvent, type DragEvent } from 'react';
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
import { ChevronDown, Check, ExternalLink, ImagePlus, Trash2, X } from 'lucide-react';
import type { IssueLabel, ProviderIssueAttachment } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { isCurrentStatus } from '@/types/domain';
import { Button } from '@/components/ui/Button';
import { Textarea, FieldLabel } from '@/components/ui/Input';
import {
  fileToAttachment,
  formatBytes,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENTS,
} from '@/lib/attachments';

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
    () => labels.filter((l) => !excludedIds.has(l.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [labels, excludedIds],
  );

  const [selected, setSelected] = useState<IssueLabel | null>(null);
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<ProviderIssueAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<ProviderIssueAttachment | null>(null);

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
    setAttachments([]);
    setAttachmentError(null);
    setPreviewAttachment(null);
    onClose();
  }

  function handleAssign() {
    if (!selected) return;
    assignIssueToProvider(providerId, selected.id, notes.trim(), attachments);
    handleClose();
  }

  async function addImageFiles(files: Iterable<File>) {
    const incoming = [...files].filter((file) => file.type.startsWith('image/'));
    if (incoming.length === 0) return;

    setAttachmentError(null);
    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0) {
      setAttachmentError(`Remove an image before adding more. Limit is ${MAX_ATTACHMENTS}.`);
      return;
    }

    const accepted = incoming.slice(0, remainingSlots);
    const tooLarge = accepted.find((file) => file.size > MAX_ATTACHMENT_BYTES);
    if (tooLarge) {
      setAttachmentError(`${tooLarge.name} is too large. Keep each image under 5 MB.`);
      return;
    }

    try {
      const next = await Promise.all(accepted.map(fileToAttachment));
      setAttachments((current) => [...current, ...next]);
      if (incoming.length > accepted.length) {
        setAttachmentError(
          `Added ${accepted.length}; limit is ${MAX_ATTACHMENTS} images per issue.`,
        );
      }
    } catch {
      setAttachmentError(
        'Could not read that image. Try saving it as PNG or JPG and uploading it.',
      );
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const files = [...e.clipboardData.files].filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;
    e.preventDefault();
    void addImageFiles(files);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    void addImageFiles(e.dataTransfer.files);
  }

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((item) => item.id !== id));
  }

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-0 sm:items-start sm:p-4 sm:pt-[12vh]">
        <DialogPanel className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-lg border border-line bg-surface-raised shadow-2xl sm:rounded-lg">
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
              <FieldLabel htmlFor="assign-label-combo">Issue label</FieldLabel>
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
                    className="block w-full rounded-md border border-line bg-surface-raised py-2 pl-3 pr-9 text-sm text-ink placeholder:text-ink-faint focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/25"
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
                                    className="h-4 w-4 text-accent-primary"
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

              {selected && <p className="mt-1 text-xs text-ink-muted">{selected.description}</p>}
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
                onPaste={handlePaste}
                placeholder="Use fabricated context only. Do not enter real patient, provider, or clinical documentation data."
              />
            </div>

            <div
              className="rounded-md border border-dashed border-line bg-surface-panel px-3 py-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <FieldLabel>Images / snips</FieldLabel>
                  <p className="mt-1 text-xs text-ink-muted">
                    Paste an image into the notes field, drag one here, or upload a PNG/JPG.
                  </p>
                </div>
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-line bg-surface-raised px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-subtle">
                  <ImagePlus className="h-4 w-4" />
                  Add image
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      void addImageFiles(e.currentTarget.files ?? []);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
              </div>

              {attachmentError && (
                <p className="mt-3 rounded border border-status-active/30 bg-status-active/10 px-2.5 py-1.5 text-xs text-status-active">
                  {attachmentError}
                </p>
              )}

              {attachments.length > 0 && (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {attachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="overflow-hidden rounded-md border border-line bg-surface-raised"
                    >
                      <button
                        type="button"
                        onClick={() => setPreviewAttachment(attachment)}
                        className="block w-full bg-surface transition-colors hover:bg-surface-subtle"
                        title="View larger"
                      >
                        <img
                          src={attachment.dataUrl}
                          alt={attachment.name}
                          className="h-32 w-full object-contain"
                        />
                      </button>
                      <div className="flex items-center justify-between gap-2 border-t border-line px-2.5 py-2">
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-ink">
                            {attachment.name}
                          </div>
                          <div className="text-[11px] text-ink-faint">
                            {formatBytes(attachment.size)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="shrink-0 rounded p-1.5 text-ink-muted hover:bg-surface-subtle hover:text-status-active"
                          aria-label={`Remove ${attachment.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-md border border-dashed border-line bg-surface-panel px-3 py-2 text-xs text-ink-muted">
              Not finding the right label?{' '}
              <Link
                to="/issues"
                onClick={handleClose}
                className="inline-flex items-center gap-1 font-medium text-accent-primary hover:underline"
              >
                Go to Issue Library
                <ExternalLink className="h-3 w-3" />
              </Link>{' '}
              to create a new one.
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface-panel px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="ghost" onClick={handleClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={!selected}
              className="w-full sm:w-auto"
            >
              Assign label
            </Button>
          </div>

          {previewAttachment && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Image preview"
            >
              <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-line bg-surface-raised shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <div className="min-w-0 truncate text-sm font-semibold text-ink">
                    {previewAttachment.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewAttachment(null)}
                    className="shrink-0 rounded p-1.5 text-ink-muted hover:bg-surface-subtle hover:text-ink"
                    aria-label="Close image preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-auto bg-surface p-3">
                  <img
                    src={previewAttachment.dataUrl}
                    alt={previewAttachment.name}
                    className="mx-auto max-h-[78vh] max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
