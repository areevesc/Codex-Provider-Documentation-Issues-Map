import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AssignExistingIssueForm } from "../components/issues/AssignExistingIssueForm";
import { StatusPill } from "../components/issues/StatusPill";
import { formatDateTime } from "../domain/format";
import {
  getCdiForProvider,
  getClinicForProvider,
  getCurrentIssueDetailsForProvider,
  getHistoricalIssueDetailsForProvider
} from "../domain/selectors";
import { useAppStore } from "../store/useAppStore";

export function ProviderDetailPage() {
  const { providerId = "" } = useParams();
  const entities = useAppStore((state) => state.entities);
  const provider = entities.providers[providerId];

  if (!provider) {
    return (
      <main className="page-shell">
        <Link className="ghost-button w-fit" to="/">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Graph
        </Link>
        <p className="empty-copy mt-8">Provider not found.</p>
      </main>
    );
  }

  const clinic = getClinicForProvider(entities, provider.id);
  const cdi = getCdiForProvider(entities, provider.id);
  const currentIssues = getCurrentIssueDetailsForProvider(entities, provider.id);
  const historicalIssues = getHistoricalIssueDetailsForProvider(entities, provider.id);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <Link className="ghost-button mb-4 w-fit" to="/">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Graph
          </Link>
          <p className="eyebrow">Provider detail</p>
          <h1 className="page-title">{provider.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {clinic?.name ?? "No clinic"} · {cdi?.name ?? "No CDI specialist"}
          </p>
        </div>
      </header>

      <section className="provider-detail-grid">
        <section className="surface-panel">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Current</p>
              <h2 className="section-heading">Active and improving issues</h2>
            </div>
            <span className="mini-stat">{currentIssues.length} current</span>
          </div>
          <div className="mt-5 space-y-3">
            {currentIssues.length === 0 ? (
              <p className="empty-copy">No current issues assigned to this provider.</p>
            ) : (
              currentIssues.map(({ record, issueLabel }) => (
                <article className="issue-record-row" key={record.id}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950">{issueLabel.name}</h3>
                      <StatusPill status={record.status} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{issueLabel.description}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {record.notesExamples || "No notes/examples added yet."}
                    </p>
                  </div>
                  <Link className="secondary-button shrink-0" to={`/providers/${provider.id}/issues/${record.id}`}>
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    Open
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="surface-panel">
          <p className="eyebrow">Assign</p>
          <h2 className="section-heading">Existing issue label</h2>
          <div className="mt-4">
            <AssignExistingIssueForm providerId={provider.id} />
          </div>
        </aside>
      </section>

      <section className="surface-panel">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">History</p>
            <h2 className="section-heading">Resolved and archived issues</h2>
          </div>
          <span className="mini-stat">{historicalIssues.length} historical</span>
        </div>
        <div className="mt-5 space-y-3">
          {historicalIssues.length === 0 ? (
            <p className="empty-copy">No resolved or archived issues for this provider.</p>
          ) : (
            historicalIssues.map(({ record, issueLabel }) => (
              <article className="issue-record-row" key={record.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-950">{issueLabel.name}</h3>
                    <StatusPill status={record.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{record.notesExamples}</p>
                  <p className="mt-2 text-xs text-slate-500">Resolved: {formatDateTime(record.resolvedAt)}</p>
                </div>
                <Link className="secondary-button shrink-0" to={`/providers/${provider.id}/issues/${record.id}`}>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  Open
                </Link>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
