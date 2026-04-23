import type { ProviderIssueStatus } from "../../domain/types";

const statusClasses: Record<ProviderIssueStatus, string> = {
  Active: "border-red-200 bg-red-50 text-red-700",
  Improving: "border-amber-200 bg-amber-50 text-amber-700",
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Archived: "border-slate-200 bg-slate-100 text-slate-600"
};

export function StatusPill({ status }: { status: ProviderIssueStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}>
      {status}
    </span>
  );
}
