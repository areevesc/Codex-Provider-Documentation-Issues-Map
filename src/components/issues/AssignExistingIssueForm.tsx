import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { getCurrentProviderIssueRecordsForProvider, sortByName, values } from "../../domain/selectors";

interface AssignExistingIssueFormProps {
  providerId: string;
  compact?: boolean;
}

export function AssignExistingIssueForm({ providerId, compact = false }: AssignExistingIssueFormProps) {
  const entities = useAppStore((state) => state.entities);
  const assignIssueToProvider = useAppStore((state) => state.assignIssueToProvider);
  const [query, setQuery] = useState("");
  const [issueLabelId, setIssueLabelId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const currentIssueLabelIds = useMemo(
    () =>
      new Set(
        getCurrentProviderIssueRecordsForProvider(entities, providerId).map((record) => record.issueLabelId)
      ),
    [entities, providerId]
  );

  const availableIssueLabels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sortByName(values(entities.issueLabels))
      .filter((issueLabel) => !currentIssueLabelIds.has(issueLabel.id))
      .filter((issueLabel) =>
        normalizedQuery
          ? issueLabel.name.toLowerCase().includes(normalizedQuery) ||
            issueLabel.description.toLowerCase().includes(normalizedQuery)
          : true
      );
  }, [currentIssueLabelIds, entities.issueLabels, query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!issueLabelId) {
      setMessage("Choose an existing issue label first.");
      return;
    }

    const result = assignIssueToProvider(providerId, issueLabelId);
    setMessage(result.message);
    if (result.ok) {
      setIssueLabelId("");
      setQuery("");
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="field-shell">
        <Search aria-hidden="true" className="h-4 w-4 text-slate-400" />
        <input
          aria-label="Search existing issue labels"
          className="field-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search existing labels"
          value={query}
        />
      </div>
      <select
        aria-label="Existing issue label"
        className="select-input"
        onChange={(event) => setIssueLabelId(event.target.value)}
        value={issueLabelId}
      >
        <option value="">Choose an existing issue label</option>
        {availableIssueLabels.map((issueLabel) => (
          <option key={issueLabel.id} value={issueLabel.id}>
            {issueLabel.name}
          </option>
        ))}
      </select>
      <button className="primary-button w-full" type="submit">
        <Plus aria-hidden="true" className="h-4 w-4" />
        Assign Issue
      </button>
      {message ? <p className="text-xs text-slate-600">{message}</p> : null}
      {!compact ? (
        <p className="text-xs leading-5 text-slate-500">
          New labels are created only in the{" "}
          <Link className="text-link" to="/issues">
            Issue Library
          </Link>
          .
        </p>
      ) : null}
    </form>
  );
}
