import { format, parseISO } from 'date-fns';

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDate(iso: string | undefined | null, fallback = '—'): string {
  if (!iso) return fallback;
  try {
    return format(parseISO(iso), 'MMM d, yyyy');
  } catch {
    return fallback;
  }
}

export function formatDateTime(iso: string | undefined | null, fallback = '—'): string {
  if (!iso) return fallback;
  try {
    return format(parseISO(iso), 'MMM d, yyyy · h:mm a');
  } catch {
    return fallback;
  }
}
