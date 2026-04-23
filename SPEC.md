Treat this prompt as the authoritative product specification for the MVP unless I explicitly override something later.

Do not code yet.
First, produce a detailed implementation plan for the MVP, with architecture, data model, page structure, component structure, graph behavior, state management, and milestone order.
Minimize assumptions. If something is not explicitly defined here, prefer the most conservative/simple implementation that preserves this spec.
Ask follow-up questions only if you are blocked by a true ambiguity that would materially change architecture or behavior.
Otherwise, proceed by following this spec exactly.

PROJECT TYPE
Build a private internal prototype web app using fake/sample data only.
This is a greenfield prototype for workflow testing.
No real provider names, no PHI, no real company-sensitive data.
No auth yet.
No production security flows yet.
Keep the codebase clean, simple, and easy to extend later.

PRIMARY PRODUCT GOAL
Build a graph-first CDI relationship tracking web app that visually maps:
- CDI specialists
- clinics
- providers
- documentation issue labels

The app should feel visually similar in spirit to an Obsidian-style graph:
- graph is the main experience
- clicking a node should visually emphasize its connected nodes
- unrelated nodes should be de-emphasized
- the graph should help users explore relationships, not just act as decoration

However, editing and structured information should happen through panels and detail pages, not through the graph alone.

PRIMARY UX DECISION
The graph is the home screen.

HOME SCREEN LAYOUT
The home screen must use a 3-part layout:
1. Left sidebar
2. Center graph canvas
3. Right detail panel

LEFT SIDEBAR MUST INCLUDE
- CDI specialist selector
- search bar
- filters as needed for MVP

CENTER AREA
- interactive graph canvas
- nodes for CDI specialists, clinics, providers, and issue labels
- graph should visually refocus around the selected node
- connected nodes should be emphasized
- unrelated nodes should be dimmed/de-emphasized

RIGHT DETAIL PANEL
Shows the details for the currently selected node.

CORE DOMAIN RULES
- One provider belongs to one main clinic
- One clinic belongs to one main CDI specialist
- One CDI specialist can have multiple clinics
- Assignments should be treated as mostly stable in MVP
- Provider/clinic/CDI specialist relationships can be editable later, but no heavy admin system is needed for MVP

DOCUMENTATION ISSUE MODEL
Documentation issues are standardized reusable issue labels.
Examples might be things like:
- Missing specificity
- Visit diagnoses listed but not documented
- Unsupported diagnosis wording

Important:
There must be a distinction between:
1. Global issue labels
2. Provider-specific issue records

GLOBAL ISSUE LABEL
This is the reusable standardized issue definition used across the system.

PROVIDER-SPECIFIC ISSUE RECORD
This is the instance of a specific issue label being linked to a specific provider.

Provider-specific issue records are where the app stores:
- issue status for that provider
- notes/examples for that provider
- created date
- updated date
- optional resolved/history state

Notes/examples must live on the provider-specific issue record, not on the global issue label.

ISSUE CREATION RULES
Users must NOT casually create new issue labels from the provider panel.
Creating a new issue label must happen only in a separate Issue Library / Issue Management page.

In the provider panel or provider detail page, users may:
- assign an existing issue label to a provider
- update the provider-specific issue record

They may not:
- create a brand-new global issue label from the provider panel

The goal is to reduce duplicate issue labels caused by slightly different wording.

ISSUE LIBRARY / ISSUE MANAGEMENT PAGE
This must be a separate screen/page.
It should allow deliberate management of global issue labels.

For each issue label, this page should show:
- issue label name
- short description
- active provider count
- active clinic count

This page should support:
- search issue labels
- review issue labels before creating a new one
- create a new issue label
- edit an existing issue label description

MVP DATA SCOPING RULES
Main graph/home screen should use ACTIVE-ONLY issue summaries and counts.

Do not combine active and historical counts in the main graph/home experience.

Historical/resolved issue information should appear only in provider detail view.

COUNT RULES
Counts should be based on provider-to-issue links.

One count = one provider currently linked to one issue label within a given scope.

Example:
If 10 providers currently have the issue label “Missing specificity,” then the count is 10.

Counts must not be based on:
- number of notes
- number of snippets/examples
- number of times text was entered

COUNT RULES BY NODE TYPE

CDI SPECIALIST NODE
Issue summaries should be scoped only to that CDI specialist’s assigned providers.

CLINIC NODE
Issue summaries should be scoped only to providers in that clinic.

ISSUE LABEL NODE
Counts should be global/system-wide unless a filter is applied.

PROVIDER NODE
No special issue count summary needed beyond showing the provider’s assigned issue labels.

ACTIVE-ONLY MEANING
For MVP, summary counts on the home screen should count current issues only.
Do not mix resolved/historical issues into home screen counts.

STATUS MODEL
Status exists at the provider-specific issue level, not at the provider level.

A provider may have different statuses for different issues.

Example:
Dr. Smith
- Missing specificity = Active
- Visit diagnoses listed but not documented = Improving
- Unsupported diagnosis wording = Resolved

Recommended MVP statuses:
- Active
- Improving
- Resolved
- Archived

Archived should mainly be used for mistaken entries or cleanup, not normal improvement.

NOTES / EXAMPLES FIELD
Use one combined text field for notes/examples.
Do NOT split notes and snippets into separate fields for MVP.

This combined field should allow:
- free text comments
- pasted documentation excerpts
- examples
- explanatory text

HOME SCREEN NODE BEHAVIOR

IF USER CLICKS A CDI SPECIALIST NODE
Right panel should show:
- CDI specialist name
- assigned clinics
- provider names grouped by clinic
- issue summaries scoped to that CDI specialist’s assigned providers, with active-only counts

Do not prioritize raw provider count by itself.
Provider names matter more than just showing a number.

IF USER CLICKS A CLINIC NODE
Right panel should show:
- clinic name
- assigned CDI specialist
- providers in that clinic
- issue summaries scoped to that clinic, with active-only counts

IF USER CLICKS A PROVIDER NODE
Right panel should show:
- provider name
- assigned clinic
- assigned CDI specialist
- currently assigned issue labels for that provider
- option to assign an existing issue label to that provider
- option to open full provider detail page

Do not include “create new issue label” in this panel.

IF USER CLICKS AN ISSUE LABEL NODE
Right panel should show:
- issue label name
- description
- linked providers
- linked clinics
- global active counts

Do not redundantly repeat the issue label name multiple times in an awkward way.

PROVIDER DETAIL PAGE
This is a deeper structured screen for one provider.

It should show:
- provider name
- clinic
- assigned CDI specialist
- active/current issues
- separate historical/resolved issues section

The provider detail page is where the user should be able to see historical improvement over time for that provider.

PROVIDER ISSUE DETAIL VIEW
Inside the provider detail page, if the user clicks a specific issue assigned to that provider, they should be able to open a deeper provider-issue detail view.

This detail view is for one issue for one provider.

It should include:
- issue label
- status
- notes/examples
- created date
- updated date
- resolved date if status is resolved, if useful to the data model

This is not a second graph.
Do not create a mini graph inside the provider detail or provider-issue detail view.

MVP SCREENS REQUIRED
At minimum, plan for these screens/views:
1. Graph home screen
2. Issue Library / Issue Management page
3. Provider detail page
4. Provider-issue detail view

You may also include supporting views/components for clinic/CDI specialist details if they are naturally handled in the right panel rather than separate pages.

MVP USER FLOW
The most important user flow should work like this:
1. User opens app
2. User lands on graph home screen
3. User selects or confirms CDI specialist context if needed
4. User searches for or clicks a provider
5. Right panel shows provider details and currently assigned issues
6. User assigns an existing issue label to that provider
7. User opens provider detail page if deeper editing is needed
8. User opens provider-specific issue detail to edit status and notes/examples

ISSUE CREATION FLOW
If the needed issue does not already exist:
1. User goes to Issue Library page
2. User reviews existing issue labels and descriptions
3. User creates a new issue label deliberately
4. User returns to provider and assigns that issue label

The app should be designed to discourage duplicate issue labels.

GRAPH BEHAVIOR REQUIREMENTS
The graph should not just be a static diagram.
It should support:
- selecting nodes
- visually focusing connected relationships
- de-emphasizing non-connected nodes
- making exploration intuitive

Keep the graph readable.
Do not try to over-engineer physics or animations if that harms clarity or maintainability.

DATA MODEL EXPECTATIONS
Plan a clean schema for at least:
- CDI specialist
- clinic
- provider
- issue label
- provider issue record

Include suggested fields and relationships.

The provider issue record should clearly support:
- provider linkage
- issue label linkage
- status
- notes/examples
- createdAt
- updatedAt
- resolvedAt if useful

SEED DATA
Use fake but realistic sample seed data for MVP.
Seed enough records to make the graph meaningful:
- multiple CDI specialists
- multiple clinics
- multiple providers per clinic
- multiple issue labels
- multiple provider-issue records
- some active issues
- some improving issues
- some resolved historical issues visible in provider detail

TECHNICAL EXPECTATIONS
Recommend a modern, maintainable web stack appropriate for:
- graph-first UI
- structured side panels
- fake local seed data for MVP
- easy later expansion

Choose the graph library you think best fits this app and justify the choice.

Also recommend:
- state management approach
- routing/page structure
- file/folder structure
- component breakdown
- styling approach
- how to keep fake seed data separate and easy to replace later

NON-GOALS FOR MVP
Do not include these in MVP unless they are absolutely necessary:
- authentication
- user roles/permissions
- production hosting/security
- real PHI workflows
- complex commenting systems
- file attachments
- audit logs beyond simple timestamps
- duplicate merging automation
- reporting dashboards beyond basic summaries/counts
- a second embedded graph anywhere else in the app

PLAN OUTPUT FORMAT
Before coding, provide:
1. Recommended tech stack
2. Why that stack fits this product
3. Folder/file structure
4. Route/page structure
5. Data model/schema
6. Component breakdown
7. Graph behavior approach
8. State management approach
9. Seed data structure
10. MVP implementation phases in order
11. Risks, ambiguities, or design tradeoffs
12. Any truly necessary follow-up questions only

Then stop and wait for my approval before writing code.

DONE WHEN FOR THE PLAN
The plan is complete only if:
- it covers all required screens
- it covers all domain relationships
- it respects all issue creation rules
- it respects all count scoping rules
- it respects active-only home screen summaries
- it keeps historical issues limited to provider detail
- it treats provider-issue records separately from global issue labels
- it gives a phased MVP implementation order
- it does not silently invent major features outside the spec