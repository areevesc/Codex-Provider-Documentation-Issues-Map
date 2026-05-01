# Project Memory

Persistent handoff notes for future Codex sessions. Update this file whenever scope, decisions, or next steps change materially.

## Product Intent

- App name: CDI Relationship Tracker.
- Primary users: CDI specialists and CDI managers/directors.
- Secondary audience: potentially other leadership/stakeholders, but the app is mainly designed around CDI workflow and management visibility.
- Core job: track provider documentation issues, attach detailed fabricated examples/notes/images, and show trends by provider, clinic, CDI specialist, and health system.
- Current safety posture: prototype/demo only. Use fake data only for now.
- Long-term safety goal: the owner may eventually want real PHI-capable workflows, but HIPAA compliance, storage, access control, auditing, and deployment would need to be solved first.

## Domain Model

- Current hierarchy is intentional and should remain stable unless there is a strong future reason to change it:
  - Health System -> CDI Specialist -> Clinic -> Provider.
- Current assumption: one provider belongs to one clinic/health system path.
- Issue labels are reusable/canonical documentation issue categories.
- A provider can be assigned existing issue labels when that provider has that documentation issue.
- If a needed issue label does not exist yet, it should be added through the Issue Library, then assigned to providers.
- ProviderIssue is the provider-specific assignment of an IssueLabel. It carries status, notes, timestamps, and image attachments.
- Current statuses:
  - Active
  - Improving
  - Resolved
- Current/current-active views treat Active + Improving as current issues.
- Historical views treat Resolved as historical.

## Implemented App Areas

- Home / hierarchy view:
  - Expandable tree for health systems, CDI specialists, clinics, and providers.
  - Search for nodes.
  - Counts current issue trends up the hierarchy.
  - Selecting a node opens a contextual right panel.
- Right panels:
  - Health system, specialist, clinic, provider, and issue-label details.
  - Organization entities can be created, edited, and deleted.
  - Deletes cascade downward and require typing `DELETE`.
- Provider workflow:
  - Provider panel shows clinic, CDI specialist, current issue labels, status pills, and links to notes/images.
  - Provider profile page shows current and historical issues.
  - Provider issue detail page edits status, notes, and attached images.
  - Image attachments can be pasted, dragged in, or uploaded.
  - Attachment limits currently exist to keep localStorage manageable.
- Issue Library:
  - Canonical issue-label management.
  - New labels use a two-step create flow with duplicate hints.
  - Existing labels can be searched, sorted, edited, and linked from counts.
- Settings:
  - Appearance mode and color theme controls.
  - Link to Issue Library.
  - Demo-data reset.
  - Data-safety warning.
  - Provider CSV import.

## Data And Persistence

- Stack: React, Vite, TypeScript, Zustand, Tailwind, Headless UI, Cytoscape-related graph code still present.
- Browser persistence is via Zustand localStorage key `cdi-prototype`.
- There is no backend currently.
- Seed data is fake and generated from `src/data/seed`.
- Reset restores the built-in fictional seed dataset and discards local browser edits.
- Current seed scale noted in README: 2 health systems, 9 CDI specialists, 81 clinics, and 310 fictional providers.

## CSV Import

- Intended product purpose: let a user replace the demo org/provider roster and optionally import/export provider issue assignments, notes, statuses, and issue labels in spreadsheet-friendly CSV form.
- Current accepted headers:

```csv
health_system,cdi_specialist,clinic,provider,specialty,issue_label,issue_label_description,status,notes,created_at,updated_at,resolved_at
```

- Current implementation behavior as of this memory update:
  - Parses provider CSV in `src/lib/providerCsvImport.ts`.
  - Exports provider issue CSV in `src/lib/providerCsvExport.ts`.
  - Imports from Settings.
  - Replaces current health system, CDI specialist, clinic, provider, and provider-issue assignment data in browser storage.
  - Preserves the issue-label library so default/common labels remain available.
  - Creates missing issue labels from imported `issue_label` values, using `issue_label_description` when available.
  - Supports roster-only rows when `issue_label` is blank.
  - Repeats provider/org columns per issue row so exported CSVs remain sortable/filterable.
  - Deduplicates provider/org records by normalized names within the imported hierarchy.
  - Shows a confirmation warning before opening the file picker.
  - Parses into a preview before replacement, including hierarchy counts, issue-row count, repeated-provider-row count, warnings, and sample rows.
  - Requires final confirmation from the preview before replacing roster data.
  - Rejects unsupported columns to avoid accidentally importing PHI-heavy note/chart fields.

## Safety Boundaries

- Current app copy should continue warning against PHI, patient identifiers, chart text, patient names, MRNs, DOBs, encounter dates, and real clinical screenshots.
- Notes/images are useful for examples, but are the highest-risk area if this ever becomes real-data-capable.
- Before real PHI support, the app would need a serious compliance design:
  - Backend storage rather than browser-only localStorage.
  - Authentication and role-based access.
  - Audit logging.
  - Encryption and secure deployment.
  - Data retention/deletion policy.
  - BAA-covered hosting/services.
  - Clear separation of patient data from provider/org trend data.

## Known Gaps / Risks

- Import has no automated tests yet.
- Export is CSV-only and does not include image attachments or full UI/localStorage backup metadata.
- Browser localStorage is fragile for large images and not appropriate for real PHI.
- The app has strong prototype safety language, but technical controls are not sufficient for real clinical data.
- A zero-byte `.codex` file is currently untracked and pre-existing; it has not been touched.

## Recommended Next Work

- Add tests for CSV parsing and import replacement behavior.
- Consider full JSON backup/export if notes/images become important to preserve outside the browser.
- Revisit graph view only after the core hierarchy/import/provider issue workflow is solid.

## Session Handoff Protocol

- At the start of future sessions:
  - Read this file first.
  - Run `git status --short` to see current uncommitted changes.
- At the end of substantial work sessions, update this file with:
  - What changed.
  - Decisions made.
  - Known gaps or risks.
  - Recommended next step.
