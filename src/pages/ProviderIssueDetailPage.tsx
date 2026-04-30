import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getProvider, getProviderIssue } from '@/store/selectors';
import { Badge } from '@/components/ui/Badge';
import { ProviderIssueForm } from '@/components/provider/ProviderIssueForm';

export function ProviderIssueDetailPage() {
  const { providerId = '', providerIssueId = '' } = useParams<{
    providerId: string;
    providerIssueId: string;
  }>();

  const provider = useAppStore((s) => getProvider(s, providerId));
  const issue = useAppStore((s) => getProviderIssue(s, providerIssueId));
  const label = useAppStore((s) =>
    issue ? s.issueLabels[issue.issueLabelId] : undefined,
  );

  if (!provider || !issue || issue.providerId !== provider.id) {
    return (
      <div className="mx-auto h-full max-w-3xl overflow-y-auto px-3 py-10 sm:px-6 sm:py-12">
        <h1 className="text-xl font-semibold text-ink">Issue not found</h1>
        <p className="mt-2 text-sm text-ink-muted">
          That provider/issue pairing does not exist.
        </p>
        <Link
          to={providerId ? `/providers/${providerId}` : '/'}
          className="mt-4 inline-flex items-center gap-1 text-sm text-accent-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-3 py-5 sm:px-6 sm:py-8">
      <Link
        to={`/providers/${provider.id}`}
        className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to {provider.name}
      </Link>

      <header className="mt-3 border-b border-line pb-5">
        <Badge tone="label">Provider Issue</Badge>
        <h1 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
          {label?.name ?? 'Unknown label'}
        </h1>
        <div className="mt-1 text-sm text-ink-muted">
          for{' '}
          <Link
            to={`/providers/${provider.id}`}
            className="text-ink hover:underline"
          >
            {provider.name}
          </Link>
          {provider.specialty && (
            <span className="text-ink-faint"> · {provider.specialty}</span>
          )}
        </div>
      </header>

      <div className="mt-6">
        <ProviderIssueForm issue={issue} />
      </div>
    </div>
  );
}
