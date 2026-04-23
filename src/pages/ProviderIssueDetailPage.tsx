import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { StatusPill } from "../components/issues/StatusPill";
import { formatDateTime } from "../domain/format";
import type { ProviderIssueStatus } from "../domain/types";
import { getCdiForProvider, getClinicForProvider } from "../domain/selectors";
import { useAppStore } from "../store/useAppStore";

const statuses: ProviderIssueStatus[] = ["Active", "Improving", "Resolved", "Archived"];

export function ProviderIssueDetailPage() {
  const { providerId = "", providerIssueId = "" } = useParams();
  const entities = useAppStore((state) => state.entities);
  const updateProviderIssueRecord = useAppStore((state) => state.updateProviderIssueRecord);
  const provider = entities.providers[providerId];
  const record = entities.providerIssueRecords[providerIssueId];
  const issueLabel = record ? entities.issueLabels[record.issueLabelId] : undefined;
  const clinic = provider ? getClinicForProvider(entities, provider.id) : undefined;
  const cdi = provider ? getCdiForProvider(entities, provider.id) : undefined;
  const [status, setStatus] = useState<ProviderIssueStatus>("Active");
  const [notesExamples, setNotesExamples] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setStatus(record.status);
      setNotesExamples(record.notesExamples);
    }
  }, [record]);

  if (!provider || !record || !issueLabel || record.providerId !== provider.id) {
    return (
      <main className="page-shell">
        <Link className="ghost-button w-fit" to={provider ? `/providers/${provider.id}` : "/"}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back
        </Link>
        <p className="empty-copy mt-8">Provider issue record not found.</p>
      </main>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = updateProviderIssueRecord(record.id, { status, notesExamples });
    setMessage(result.message);
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <Link className="ghost-button mb-4 w-fit" to={`/providers/${provider.id}`}>
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Provider
          </Link>
          <p className="eyebrow">Provider issue detail</p>
          <h1 className="page-title">{issueLabel.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {provider.name} · {clinic?.name ?? "No clinic"} · {cdi?.name ?? "No CDI specialist"}
          </p>
        </div>
        <StatusPill status={record.status} />
      </header>

      <section className="detail-edit-grid">
        <form className="surface-panel space-y-5" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Edit provider-specific record</p>
            <h2 className="section-heading">Status and notes/examples</h2>
          </div>
          <label className="field-label">
            Status
            <select
              className="select-input"
              onChange={(event) => setStatus(event.target.value as ProviderIssueStatus)}
              value={status}
            >
              {statuses.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Notes/examples
            <textarea
              className="textarea-input min-h-72"
              onChange={(event) => setNotesExamples(event.target.value)}
              value={notesExamples}
            />
          </label>
          <button className="primary-button w-fit" type="submit">
            <Save aria-hidden="true" className="h-4 w-4" />
            Save Changes
          </button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>

        <aside className="surface-panel space-y-5">
          <div>
            <p className="eyebrow">Global label description</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{issueLabel.description || "No description added."}</p>
          </div>
          <div className="record-meta-grid">
            <div>
              <span>Created</span>
              <strong>{formatDateTime(record.createdAt)}</strong>
            </div>
            <div>
              <span>Updated</span>
              <strong>{formatDateTime(record.updatedAt)}</strong>
            </div>
            <div>
              <span>Resolved</span>
              <strong>{formatDateTime(record.resolvedAt)}</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
