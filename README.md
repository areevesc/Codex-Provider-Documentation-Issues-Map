# CDI Relationship Tracker

Private internal prototype for exploring health system, CDI specialist, clinic, provider, and documentation issue label relationships.

## Setup

Install dependencies with a Node package manager, then run the Vite dev server:

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run build
npm run lint
npm run preview
```

The app uses fake sample data only. Edits are stored in browser local storage so the prototype can be exercised without a backend. Do not enter real patient, provider, or clinical documentation data into the GitHub Pages deployment.

Current seed scale: 2 health systems, 9 CDI specialists, 81 clinics, and 310 fictional providers.

## Project handoff notes

Use `PROJECT_MEMORY.md` as the persistent working-memory file for future sessions. It records current state, decisions, risks, and likely next steps so work can resume after chat history is lost.
