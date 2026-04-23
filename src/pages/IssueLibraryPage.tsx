import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Save, Search } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { formatDateTime, pluralize } from "../domain/format";
import { getIssueUsageCounts, sortByName, values } from "../domain/selectors";

export function IssueLibraryPage() {
  const entities = useAppStore((state) => state.entities);
  const createIssueLabel = useAppStore((state) => state.createIssueLabel);
  const editIssueLabelDescription = useAppStore((state) => state.editIssueLabelDescription);
  const [searchQuery, setSearchQuery] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [editingIssueLabelId, setEditingIssueLabelId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");

  const issueLabels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sortByName(values(entities.issueLabels)).filter((issueLabel) =>
      query
        ? issueLabel.name.toLowerCase().includes(query) || issueLabel.description.toLowerCase().includes(query)
        : true
    );
  }, [entities.issueLabels, searchQuery]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = createIssueLabel({ name, description });
    setMessage(result.message);
    if (result.ok) {
      setName("");
      setDescription("");
      setSearchQuery("");
    }
  }

  function startEditing(issueLabelId: string, currentDescription: string) {
    setEditingIssueLabelId(issueLabelId);
    setEditingDescription(currentDescription);
  }

  function saveDescription(issueLabelId: string) {
    const result = editIssueLabelDescription(issueLabelId, editingDescription);
    setMessage(result.message);
    if (result.ok) {
      setEditingIssueLabelId(null);
      setEditingDescription("");
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <Link className="ghost-button mb-4 w-fit" to="/">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Graph
          </Link>
          <p className="eyebrow">Issue management</p>
          <h1 className="page-title">Issue Library</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review existing standardized labels before creating a new one. Provider panels can only assign labels from this library.
          </p>
        </div>
      </header>

      <section className="library-grid">
        <form className="surface-panel space-y-4" onSubmit={handleCreate}>
          <div>
            <p className="eyebrow">Create deliberately</p>
            <h2 className="section-heading">New global issue label</h2>
          </div>
          <label className="field-label">
            Label name
            <input className="text-input" onChange={(event) => setName(event.target.value)} value={name} />
          </label>
          <label className="field-label">
            Short description
            <textarea
              className="textarea-input"
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              value={description}
            />
          </label>
          <button className="primary-button w-full justify-center" type="submit">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Create Label
          </button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>

        <section className="surface-panel min-w-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Review first</p>
              <h2 className="section-heading">Existing labels</h2>
            </div>
            <div className="field-shell w-full md:max-w-sm">
              <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
              <input
                aria-label="Search issue labels"
                className="field-input"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search labels"
                value={searchQuery}
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {issueLabels.length === 0 ? (
              <p className="empty-copy">No labels match this search.</p>
            ) : (
              issueLabels.map((issueLabel) => {
                const counts = getIssueUsageCounts(entities, issueLabel.id);
                const isEditing = editingIssueLabelId === issueLabel.id;
                return (
                  <article className="issue-library-row" key={issueLabel.id}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-950">{issueLabel.name}</h3>
                          <p className="mt-1 text-xs text-slate-500">Updated {formatDateTime(issueLabel.updatedAt)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="mini-stat">{pluralize(counts.activeProviderCount, "provider")}</span>
                          <span className="mini-stat">{pluralize(counts.activeClinicCount, "clinic")}</span>
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="mt-3 space-y-3">
                          <textarea
                            aria-label={`Description for ${issueLabel.name}`}
                            className="textarea-input"
                            onChange={(event) => setEditingDescription(event.target.value)}
                            rows={4}
                            value={editingDescription}
                          />
                          <div className="flex gap-2">
                            <button className="primary-button" onClick={() => saveDescription(issueLabel.id)} type="button">
                              <Save aria-hidden="true" className="h-4 w-4" />
                              Save
                            </button>
                            <button className="ghost-button" onClick={() => setEditingIssueLabelId(null)} type="button">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {issueLabel.description || "No description added."}
                          </p>
                          <button
                            className="secondary-button mt-3"
                            onClick={() => startEditing(issueLabel.id, issueLabel.description)}
                            type="button"
                          >
                            Edit Description
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
