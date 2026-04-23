import type { IssueSummary } from "../../domain/types";
import { pluralize } from "../../domain/format";

interface IssueSummaryListProps {
  summaries: IssueSummary[];
  emptyText: string;
}

export function IssueSummaryList({ summaries, emptyText }: IssueSummaryListProps) {
  if (summaries.length === 0) {
    return <p className="empty-copy">{emptyText}</p>;
  }

  return (
    <div className="space-y-2">
      {summaries.map((summary) => (
        <div className="summary-row" key={summary.issueLabel.id}>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{summary.issueLabel.name}</p>
            <p className="text-xs text-slate-500">{pluralize(summary.activeClinicCount, "clinic")}</p>
          </div>
          <div className="count-badge">{summary.activeProviderCount}</div>
        </div>
      ))}
    </div>
  );
}
