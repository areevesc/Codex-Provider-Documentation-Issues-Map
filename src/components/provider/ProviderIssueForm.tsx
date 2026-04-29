import { useEffect, useState, type ClipboardEvent, type DragEvent } from 'react';
import { ImagePlus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import type { IssueStatus, ProviderIssue, ProviderIssueAttachment } from '@/types/domain';
import { ISSUE_STATUSES } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Textarea, FieldLabel } from '@/components/ui/Input';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDateTime } from '@/lib/dates';

interface ProviderIssueFormProps {
  issue: ProviderIssue;
}

const MAX_ATTACHMENTS = 6;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export function ProviderIssueForm({ issue }: ProviderIssueFormProps) {
  const labels = useAppStore((s) => s.issueLabels);
  const updateProviderIssue = useAppStore((s) => s.updateProviderIssue);

  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [notes, setNotes] = useState(issue.notes);
  const [attachments, setAttachments] = useState<ProviderIssueAttachment[]>(issue.attachments ?? []);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  // Sync local form when switching between issues or after external updates.
  useEffect(() => {
    setStatus(issue.status);
    setNotes(issue.notes);
    setAttachments(issue.attachments ?? []);
    setAttachmentError(null);
  }, [issue.id, issue.status, issue.notes, issue.attachments]);

  const label = labels[issue.issueLabelId];
  const dirty =
    status !== issue.status ||
    notes !== issue.notes ||
    !sameAttachments(attachments, issue.attachments ?? []);

  function handleSave() {
    if (!dirty) return;
    updateProviderIssue(issue.id, { status, notes, attachments });
  }

  function handleRevert() {
    setStatus(issue.status);
    setNotes(issue.notes);
    setAttachments(issue.attachments ?? []);
    setAttachmentError(null);
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
      setAttachmentError(`${tooLarge.name} is too large. Keep each image under 2 MB.`);
      return;
    }

    try {
      const next = await Promise.all(accepted.map(fileToAttachment));
      setAttachments((current) => [...current, ...next]);
      if (incoming.length > accepted.length) {
        setAttachmentError(`Added ${accepted.length}; limit is ${MAX_ATTACHMENTS} images per issue.`);
      }
    } catch {
      setAttachmentError('Could not read that image. Try saving it as PNG or JPG and uploading it.');
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

  const willStampResolved = status === 'Resolved' && issue.status !== 'Resolved';
  const willClearResolved = status !== 'Resolved' && issue.status === 'Resolved';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <FieldLabel>Issue label</FieldLabel>
          <div className="rounded-md border border-line bg-surface-panel px-3 py-2 text-sm text-ink">
            {label?.name ?? 'Unknown label'}
          </div>
          {label?.description && (
            <p className="text-xs text-ink-muted">{label.description}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="status-select">Status</FieldLabel>
          <div className="relative">
            <select
              id="status-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              className="block w-full appearance-none rounded-md border border-line bg-surface-raised px-3 py-2 pr-8 text-sm text-ink focus:border-accent-specialist focus:outline-none focus:ring-2 focus:ring-accent-specialist/25"
            >
              {ISSUE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span>Currently:</span>
            <StatusPill status={issue.status} />
            {status !== issue.status && (
              <>
                <span className="text-ink-faint">→</span>
                <StatusPill status={status} />
              </>
            )}
          </div>
          {willStampResolved && (
            <p className="text-[11px] text-status-resolved">
              Saving will stamp a Resolved date (today).
            </p>
          )}
          {willClearResolved && (
            <p className="text-[11px] text-status-active">
              Saving will clear the previous Resolved date.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <FieldLabel htmlFor="notes">
          Notes
          <span className="ml-1 font-normal text-ink-faint">
            (fake context and follow-up details only)
          </span>
        </FieldLabel>
        <Textarea
          id="notes"
          rows={10}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onPaste={handlePaste}
          placeholder="Use fabricated examples only. Do not enter real patient, provider, or clinical documentation data."
        />
      </div>

      <div
        className="rounded-md border border-dashed border-line bg-surface-panel px-4 py-3"
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
              <li key={attachment.id} className="overflow-hidden rounded-md border border-line bg-surface-raised">
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="h-40 w-full object-contain bg-surface"
                />
                <div className="flex items-center justify-between gap-2 border-t border-line px-2.5 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium text-ink">{attachment.name}</div>
                    <div className="text-[11px] text-ink-faint">{formatBytes(attachment.size)}</div>
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

      <div className="grid gap-3 rounded-md border border-line bg-surface-panel px-4 py-3 text-xs text-ink-muted sm:grid-cols-3">
        <Meta label="Opened" value={formatDateTime(issue.createdAt)} />
        <Meta label="Last updated" value={formatDateTime(issue.updatedAt)} />
        <Meta
          label="Resolved"
          value={issue.resolvedAt ? formatDateTime(issue.resolvedAt) : '—'}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={handleRevert}
          disabled={!dirty}
          icon={<RotateCcw className="h-3.5 w-3.5" />}
          className="w-full sm:w-auto"
        >
          Revert
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!dirty}
          icon={<Save className="h-3.5 w-3.5" />}
          className="w-full sm:w-auto"
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}

function fileToAttachment(file: File): Promise<ProviderIssueAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unexpected file reader result'));
        return;
      }
      resolve({
        id: `att-${nanoid(10)}`,
        name: file.name || 'Pasted image',
        type: file.type,
        size: file.size,
        dataUrl: reader.result,
        createdAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  });
}

function sameAttachments(
  a: ProviderIssueAttachment[],
  b: ProviderIssueAttachment[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const other = b[index];
    return (
      item.id === other.id &&
      item.name === other.name &&
      item.type === other.type &&
      item.size === other.size &&
      item.dataUrl === other.dataUrl
    );
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
        {label}
      </div>
      <div className="mt-0.5 text-ink">{value}</div>
    </div>
  );
}
