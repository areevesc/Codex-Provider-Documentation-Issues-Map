import { nanoid } from 'nanoid';
import type { ProviderIssueAttachment } from '@/types/domain';

export const MAX_ATTACHMENTS = 6;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export function fileToAttachment(file: File): Promise<ProviderIssueAttachment> {
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

export function sameAttachments(
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

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
