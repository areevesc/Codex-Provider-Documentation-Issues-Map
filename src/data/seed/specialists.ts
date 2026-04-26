import type { CDISpecialist } from '@/types/domain';

// Fake/fabricated names — no real people.
export const seedSpecialists: CDISpecialist[] = [
  // ── Meridian Health Partners (hs-meridian) — 3 CDI specialists ───────────
  { id: 'sp-avery',  name: 'Avery Quinn',     healthSystemId: 'hs-meridian' },
  { id: 'sp-jordan', name: 'Jordan Patel',    healthSystemId: 'hs-meridian' },
  { id: 'sp-riley',  name: 'Riley Chen',      healthSystemId: 'hs-meridian' },

  // ── Apex Medical Network (hs-apex) — 9 CDI specialists ───────────────────
  { id: 'sp-sam',    name: 'Sam Brooks',      healthSystemId: 'hs-apex' },
  { id: 'sp-morgan', name: 'Morgan Wells',    healthSystemId: 'hs-apex' },
  { id: 'sp-taylor', name: 'Taylor Osei',     healthSystemId: 'hs-apex' },
  { id: 'sp-chris',  name: 'Chris Nakamura',  healthSystemId: 'hs-apex' },
  { id: 'sp-devon',  name: 'Devon Russo',     healthSystemId: 'hs-apex' },
  { id: 'sp-jamie',  name: 'Jamie Flores',    healthSystemId: 'hs-apex' },
  { id: 'sp-alex',   name: 'Alex Torres',     healthSystemId: 'hs-apex' },
  { id: 'sp-pat',    name: 'Pat Kimura',      healthSystemId: 'hs-apex' },
  { id: 'sp-robin',  name: 'Robin Callaway',  healthSystemId: 'hs-apex' },
];
