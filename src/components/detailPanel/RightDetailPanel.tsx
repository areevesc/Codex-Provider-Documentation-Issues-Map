import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowUpRight, Building2, CircleDot, Stethoscope, UserRound } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import {
  getAllProviderIds,
  getCdiForProvider,
  getClinicsForCdi,
  getClinicForProvider,
  getCurrentClinicsLinkedToIssue,
  getCurrentIssueDetailsForProvider,
  getCurrentProvidersLinkedToIssue,
  getIssueSummariesForProviderIds,
  getIssueUsageCounts,
  getProviderIdsForCdi,
  getProvidersForClinic,
  sortByName,
} from "../../domain/selectors";
import { IssueSummaryList } from "../issues/IssueSummaryList";
import { AssignExistingIssueForm } from "../issues/AssignExistingIssueForm";
import { StatusPill } from "../issues/StatusPill";

export function RightDetailPanel() {
  const entities = useAppStore((state) => state.entities);
  const selectedNode = useAppStore((state) => state.selectedNode);
  const selectedCdiSpecialistId = useAppStore((state) => state.selectedCdiSpecialistId);

  return (
    <aside className="home-detail border-l border-slate-200 bg-white">
      {!selectedNode ? (
        <EmptySelection />
      ) : selectedNode.type === "cdi" ? (
        <CdiDetail id={selectedNode.id} />
      ) : selectedNode.type === "clinic" ? (
        <ClinicDetail id={selectedNode.id} />
      ) : selectedNode.type === "provider" ? (
        <ProviderDetail id={selectedNode.id} />
      ) : (
        <IssueLabelDetail id={selectedNode.id} selectedCdiSpecialistId={selectedCdiSpecialistId} />
      )}
      <div className="mt-auto border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
        Main graph summaries use current provider-to-issue links only. Resolved and archived history stays on provider detail pages.
      </div>
    </aside>
  );

  function EmptySelection() {
    const providerIds = selectedCdiSpecialistId ? getProviderIdsForCdi(entities, selectedCdiSpecialistId) : getAllProviderIds(entities);
    const summaries = getIssueSummariesForProviderIds(entities, providerIds);

    return (
      <section className="space-y-5">
        <div>
          <p className="eyebrow">Graph home</p>
          <h1 className="panel-title">Select a node</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Click a CDI specialist, clinic, provider, or issue label to focus the graph and inspect the connected details.
          </p>
        </div>
        <div>
          <h2 className="section-title">Current issue summary</h2>
          <IssueSummaryList summaries={summaries.slice(0, 6)} emptyText="No current issue links in this scope." />
        </div>
      </section>
    );
  }

  function CdiDetail({ id }: { id: string }) {
    const cdi = entities.cdiSpecialists[id];
    if (!cdi) {
      return <MissingDetail />;
    }

    const clinics = getClinicsForCdi(entities, id);
    const providerIds = getProviderIdsForCdi(entities, id);
    const summaries = getIssueSummariesForProviderIds(entities, providerIds);

    return (
      <section className="space-y-6">
        <DetailHeading icon={<Stethoscope className="h-5 w-5" />} kicker="CDI specialist" title={cdi.name} />
        <div>
          <h2 className="section-title">Assigned clinics and providers</h2>
          <div className="space-y-3">
            {clinics.map((clinic) => (
              <div className="detail-block" key={clinic.id}>
                <p className="font-semibold text-slate-900">{clinic.name}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {getProvidersForClinic(entities, clinic.id).map((provider) => (
                    <span className="name-chip" key={provider.id}>
                      {provider.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="section-title">Current issue summaries</h2>
          <IssueSummaryList summaries={summaries} emptyText="No current issues are linked to this CDI specialist's providers." />
        </div>
      </section>
    );
  }

  function ClinicDetail({ id }: { id: string }) {
    const clinic = entities.clinics[id];
    if (!clinic) {
      return <MissingDetail />;
    }

    const cdi = entities.cdiSpecialists[clinic.cdiSpecialistId];
    const providers = getProvidersForClinic(entities, id);
    const providerIds = providers.map((provider) => provider.id);
    const summaries = getIssueSummariesForProviderIds(entities, providerIds);

    return (
      <section className="space-y-6">
        <DetailHeading icon={<Building2 className="h-5 w-5" />} kicker="Clinic" title={clinic.name} />
        <div className="detail-block">
          <p className="eyebrow">Assigned CDI specialist</p>
          <p className="mt-1 font-semibold text-slate-900">{cdi?.name ?? "Unassigned"}</p>
        </div>
        <div>
          <h2 className="section-title">Providers in clinic</h2>
          <div className="flex flex-wrap gap-1.5">
            {providers.map((provider) => (
              <span className="name-chip" key={provider.id}>
                {provider.name}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="section-title">Current issue summaries</h2>
          <IssueSummaryList summaries={summaries} emptyText="No current issues are linked to this clinic." />
        </div>
      </section>
    );
  }

  function ProviderDetail({ id }: { id: string }) {
    const provider = entities.providers[id];
    if (!provider) {
      return <MissingDetail />;
    }

    const clinic = getClinicForProvider(entities, id);
    const cdi = getCdiForProvider(entities, id);
    const currentIssues = getCurrentIssueDetailsForProvider(entities, id);

    return (
      <section className="space-y-6">
        <DetailHeading icon={<UserRound className="h-5 w-5" />} kicker="Provider" title={provider.name} />
        <div className="detail-block">
          <p className="eyebrow">Assignment</p>
          <p className="mt-1 text-sm text-slate-700">{clinic?.name ?? "No clinic"}</p>
          <p className="text-sm text-slate-500">{cdi?.name ?? "No CDI specialist"}</p>
        </div>
        <div>
          <h2 className="section-title">Currently assigned issues</h2>
          {currentIssues.length === 0 ? (
            <p className="empty-copy">No current issues assigned to this provider.</p>
          ) : (
            <div className="space-y-2">
              {currentIssues.map(({ issueLabel, record }) => (
                <div className="summary-row" key={record.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{issueLabel.name}</p>
                    <p className="truncate text-xs text-slate-500">{issueLabel.description}</p>
                  </div>
                  <StatusPill status={record.status} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="section-title">Assign existing issue label</h2>
          <AssignExistingIssueForm providerId={id} />
        </div>
        <Link className="primary-button w-full justify-center" to={`/providers/${id}`}>
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          Open Provider Detail
        </Link>
      </section>
    );
  }

  function IssueLabelDetail({ id, selectedCdiSpecialistId }: { id: string; selectedCdiSpecialistId: string | null }) {
    const issueLabel = entities.issueLabels[id];
    if (!issueLabel) {
      return <MissingDetail />;
    }

    const scopeProviderIds = selectedCdiSpecialistId ? getProviderIdsForCdi(entities, selectedCdiSpecialistId) : getAllProviderIds(entities);
    const providers = getCurrentProvidersLinkedToIssue(entities, id, scopeProviderIds);
    const clinics = getCurrentClinicsLinkedToIssue(entities, id, scopeProviderIds);
    const counts = getIssueUsageCounts(entities, id, scopeProviderIds);
    const scopeLabel = selectedCdiSpecialistId
      ? `Scoped to ${entities.cdiSpecialists[selectedCdiSpecialistId]?.name ?? "selected CDI specialist"}`
      : "Global active counts";

    return (
      <section className="space-y-6">
        <DetailHeading icon={<CircleDot className="h-5 w-5" />} kicker="Issue label" title={issueLabel.name} />
        <p className="text-sm leading-6 text-slate-600">{issueLabel.description || "No description added."}</p>
        <div>
          <h2 className="section-title">{scopeLabel}</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="stat-tile">
              <strong>{counts.activeProviderCount}</strong>
              <span>Providers</span>
            </div>
            <div className="stat-tile">
              <strong>{counts.activeClinicCount}</strong>
              <span>Clinics</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="section-title">Linked providers</h2>
          {providers.length === 0 ? (
            <p className="empty-copy">No current provider links in this scope.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {providers.map((provider) => (
                <span className="name-chip" key={provider.id}>
                  {provider.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="section-title">Linked clinics</h2>
          {clinics.length === 0 ? (
            <p className="empty-copy">No current clinic links in this scope.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {sortByName(clinics).map((clinic) => (
                <span className="name-chip" key={clinic.id}>
                  {clinic.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link className="secondary-button w-full justify-center" to="/issues">
          Manage in Issue Library
        </Link>
      </section>
    );
  }

  function MissingDetail() {
    return <p className="empty-copy">The selected record was not found.</p>;
  }
}

function DetailHeading({ icon, kicker, title }: { icon: ReactNode; kicker: string; title: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="icon-tile">{icon}</div>
      <div className="min-w-0">
        <p className="eyebrow">{kicker}</p>
        <h1 className="panel-title truncate">{title}</h1>
      </div>
    </div>
  );
}
