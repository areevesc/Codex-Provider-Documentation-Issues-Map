import type { Clinic } from '@/types/domain';

// Fabricated clinic names — no real practices.
export const seedClinics: Clinic[] = [
  // ── Avery Quinn (sp-avery) — 3 clinics ───────────────────────────────────
  { id: 'cl-maplewood', name: 'Maplewood Family Medicine',       cdiSpecialistId: 'sp-avery' },
  { id: 'cl-harbor',    name: 'Harbor Internal Medicine',         cdiSpecialistId: 'sp-avery' },
  { id: 'cl-oakridge',  name: 'Oakridge Primary Care',            cdiSpecialistId: 'sp-avery' },

  // ── Jordan Patel (sp-jordan) — 3 clinics ─────────────────────────────────
  { id: 'cl-riverside',  name: 'Riverside Cardiology Associates', cdiSpecialistId: 'sp-jordan' },
  { id: 'cl-northfield', name: 'Northfield Family Health',        cdiSpecialistId: 'sp-jordan' },
  { id: 'cl-summit',     name: 'Summit Pediatrics Group',          cdiSpecialistId: 'sp-jordan' },

  // ── Riley Chen (sp-riley) — 2 clinics ────────────────────────────────────
  { id: 'cl-bayshore', name: 'Bayshore Internal Medicine', cdiSpecialistId: 'sp-riley' },
  { id: 'cl-lakeside', name: 'Lakeside Specialty Clinic',  cdiSpecialistId: 'sp-riley' },

  // ── Sam Brooks (sp-sam) — 4 clinics ──────────────────────────────────────
  { id: 'cl-eastwind',     name: 'Eastwind Medical Center',        cdiSpecialistId: 'sp-sam' },
  { id: 'cl-pineridge',    name: 'Pine Ridge Family Practice',     cdiSpecialistId: 'sp-sam' },
  { id: 'cl-summit-creek', name: 'Summit Creek Orthopedics',       cdiSpecialistId: 'sp-sam' },
  { id: 'cl-western-neuro', name: 'Western Neurology Associates',  cdiSpecialistId: 'sp-sam' },

  // ── Morgan Wells (sp-morgan) — 3 clinics ─────────────────────────────────
  { id: 'cl-clearwater', name: 'Clearwater Family Medicine',   cdiSpecialistId: 'sp-morgan' },
  { id: 'cl-highland',   name: 'Highland Cardiology Group',    cdiSpecialistId: 'sp-morgan' },
  { id: 'cl-valley-pc',  name: 'Valley Primary Care',          cdiSpecialistId: 'sp-morgan' },

  // ── Taylor Osei (sp-taylor) — 3 clinics ──────────────────────────────────
  { id: 'cl-pacific',   name: 'Pacific Internal Medicine',      cdiSpecialistId: 'sp-taylor' },
  { id: 'cl-cedar',     name: 'Cedar Hill Gastroenterology',    cdiSpecialistId: 'sp-taylor' },
  { id: 'cl-forest',    name: 'Forest View Pediatrics',         cdiSpecialistId: 'sp-taylor' },

  // ── Chris Nakamura (sp-chris) — 3 clinics ────────────────────────────────
  { id: 'cl-downtown',  name: 'Downtown Primary Care',          cdiSpecialistId: 'sp-chris' },
  { id: 'cl-metro',     name: 'Metro Nephrology Specialists',   cdiSpecialistId: 'sp-chris' },
  { id: 'cl-central',   name: 'Central Pulmonology Group',      cdiSpecialistId: 'sp-chris' },

  // ── Devon Russo (sp-devon) — 3 clinics ───────────────────────────────────
  { id: 'cl-riv-rheum',   name: 'Riverside Rheumatology Clinic',   cdiSpecialistId: 'sp-devon' },
  { id: 'cl-springfield', name: 'Springfield Family Health',        cdiSpecialistId: 'sp-devon' },
  { id: 'cl-northgate',   name: 'Northgate Oncology Associates',    cdiSpecialistId: 'sp-devon' },

  // ── Jamie Flores (sp-jamie) — 3 clinics ──────────────────────────────────
  { id: 'cl-bayside-endo', name: 'Bayside Endocrinology',       cdiSpecialistId: 'sp-jamie' },
  { id: 'cl-lakewood',     name: 'Lakewood Internal Medicine',  cdiSpecialistId: 'sp-jamie' },
  { id: 'cl-elm',          name: 'Elm Street Family Practice',  cdiSpecialistId: 'sp-jamie' },

  // ── Alex Torres (sp-alex) — 3 clinics ────────────────────────────────────
  { id: 'cl-sunrise',  name: 'Sunrise Multispecialty Group',    cdiSpecialistId: 'sp-alex' },
  { id: 'cl-meadow',   name: 'Meadow Brook Primary Care',       cdiSpecialistId: 'sp-alex' },
  { id: 'cl-ironwood', name: 'Ironwood Cardiology Partners',    cdiSpecialistId: 'sp-alex' },

  // ── Pat Kimura (sp-pat) — 3 clinics ──────────────────────────────────────
  { id: 'cl-coastal',      name: 'Coastal Neurology Center',        cdiSpecialistId: 'sp-pat' },
  { id: 'cl-greenfield',   name: 'Greenfield Pediatrics',           cdiSpecialistId: 'sp-pat' },
  { id: 'cl-aspen',        name: 'Aspen Valley Internal Medicine',  cdiSpecialistId: 'sp-pat' },

  // ── Robin Callaway (sp-robin) — 3 clinics ────────────────────────────────
  { id: 'cl-redwood',  name: 'Redwood Oncology & Hematology',   cdiSpecialistId: 'sp-robin' },
  { id: 'cl-clover',   name: 'Clover Leaf Family Medicine',     cdiSpecialistId: 'sp-robin' },
  { id: 'cl-horizon',  name: 'Horizon Gastroenterology',        cdiSpecialistId: 'sp-robin' },
];
