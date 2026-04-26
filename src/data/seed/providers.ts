import type { Provider } from '@/types/domain';

// Fabricated provider names — no real clinicians.
export const seedProviders: Provider[] = [
  // ── Maplewood Family Medicine ─────────────────────────────────────────────
  { id: 'pr-reyna',    name: 'Dr. Alex Reyna',    clinicId: 'cl-maplewood', specialty: 'Family Medicine' },
  { id: 'pr-varma',    name: 'Dr. Priya Varma',   clinicId: 'cl-maplewood', specialty: 'Family Medicine' },
  { id: 'pr-holt',     name: 'Dr. Marcus Holt',   clinicId: 'cl-maplewood', specialty: 'Family Medicine' },

  // ── Harbor Internal Medicine ──────────────────────────────────────────────
  { id: 'pr-liu',   name: 'Dr. Dana Liu',    clinicId: 'cl-harbor', specialty: 'Internal Medicine' },
  { id: 'pr-nouri', name: 'Dr. Omar Nouri',  clinicId: 'cl-harbor', specialty: 'Internal Medicine' },
  { id: 'pr-tran',  name: 'Dr. Sylvia Tran', clinicId: 'cl-harbor', specialty: 'Internal Medicine' },

  // ── Oakridge Primary Care ─────────────────────────────────────────────────
  { id: 'pr-caldwell',  name: 'Dr. Ben Caldwell',   clinicId: 'cl-oakridge', specialty: 'Primary Care' },
  { id: 'pr-morimoto',  name: 'Dr. Keiko Morimoto', clinicId: 'cl-oakridge', specialty: 'Primary Care' },
  { id: 'pr-paulsen',   name: 'Dr. Vera Paulsen',   clinicId: 'cl-oakridge', specialty: 'Primary Care' },

  // ── Riverside Cardiology Associates ──────────────────────────────────────
  { id: 'pr-okafor',   name: 'Dr. Theo Okafor',    clinicId: 'cl-riverside', specialty: 'Cardiology' },
  { id: 'pr-finnegan', name: 'Dr. Isla Finnegan',  clinicId: 'cl-riverside', specialty: 'Cardiology' },
  { id: 'pr-park',     name: 'Dr. Rachel Park',    clinicId: 'cl-riverside', specialty: 'Cardiology' },

  // ── Northfield Family Health ──────────────────────────────────────────────
  { id: 'pr-ellison',   name: 'Dr. Jacob Ellison',   clinicId: 'cl-northfield', specialty: 'Family Medicine' },
  { id: 'pr-shepherd',  name: 'Dr. Maya Shepherd',   clinicId: 'cl-northfield', specialty: 'Family Medicine' },
  { id: 'pr-hernandez', name: 'Dr. Luis Hernandez',  clinicId: 'cl-northfield', specialty: 'Family Medicine' },

  // ── Summit Pediatrics Group ───────────────────────────────────────────────
  { id: 'pr-ashford',   name: 'Dr. Naomi Ashford',   clinicId: 'cl-summit', specialty: 'Pediatrics' },
  { id: 'pr-blake',     name: 'Dr. Devon Blake',     clinicId: 'cl-summit', specialty: 'Pediatrics' },
  { id: 'pr-kobayashi', name: 'Dr. Hana Kobayashi',  clinicId: 'cl-summit', specialty: 'Pediatrics' },

  // ── Bayshore Internal Medicine ────────────────────────────────────────────
  { id: 'pr-voss',    name: 'Dr. Eleanor Voss',   clinicId: 'cl-bayshore', specialty: 'Internal Medicine' },
  { id: 'pr-malik',   name: 'Dr. Rashid Malik',   clinicId: 'cl-bayshore', specialty: 'Internal Medicine' },
  { id: 'pr-delgado', name: 'Dr. Carmen Delgado', clinicId: 'cl-bayshore', specialty: 'Internal Medicine' },

  // ── Lakeside Specialty Clinic ─────────────────────────────────────────────
  { id: 'pr-ibarra',   name: 'Dr. Felix Ibarra',   clinicId: 'cl-lakeside', specialty: 'Endocrinology' },
  { id: 'pr-whitaker', name: 'Dr. Sonia Whitaker', clinicId: 'cl-lakeside', specialty: 'Rheumatology' },
  { id: 'pr-khatri',   name: 'Dr. Amir Khatri',    clinicId: 'cl-lakeside', specialty: 'Endocrinology' },

  // ── Eastwind Medical Center ───────────────────────────────────────────────
  { id: 'pr-moreau',    name: 'Dr. Tessa Moreau',    clinicId: 'cl-eastwind', specialty: 'Internal Medicine' },
  { id: 'pr-watanabe',  name: 'Dr. Kenji Watanabe',  clinicId: 'cl-eastwind', specialty: 'Internal Medicine' },
  { id: 'pr-brightman', name: 'Dr. Lena Brightman',  clinicId: 'cl-eastwind', specialty: 'Internal Medicine' },

  // ── Pine Ridge Family Practice ────────────────────────────────────────────
  { id: 'pr-raman',   name: 'Dr. Nikhil Raman',  clinicId: 'cl-pineridge', specialty: 'Family Medicine' },
  { id: 'pr-haddad',  name: 'Dr. Yara Haddad',   clinicId: 'cl-pineridge', specialty: 'Family Medicine' },
  { id: 'pr-polaski', name: 'Dr. Grant Polaski',  clinicId: 'cl-pineridge', specialty: 'Family Medicine' },

  // ── Summit Creek Orthopedics ──────────────────────────────────────────────
  { id: 'pr-park-o', name: 'Dr. Olivia Park',   clinicId: 'cl-summit-creek', specialty: 'Orthopedics' },
  { id: 'pr-diaz-h', name: 'Dr. Hector Diaz',   clinicId: 'cl-summit-creek', specialty: 'Orthopedics' },
  { id: 'pr-zhao',   name: 'Dr. Mei Ling Zhao', clinicId: 'cl-summit-creek', specialty: 'Orthopedics' },

  // ── Western Neurology Associates ──────────────────────────────────────────
  { id: 'pr-novak',    name: 'Dr. Stefan Novak',  clinicId: 'cl-western-neuro', specialty: 'Neurology' },
  { id: 'pr-hassan-a', name: 'Dr. Amira Hassan',  clinicId: 'cl-western-neuro', specialty: 'Neurology' },
  { id: 'pr-oduya',    name: 'Dr. Ben Oduya',     clinicId: 'cl-western-neuro', specialty: 'Neurology' },

  // ── Clearwater Family Medicine ────────────────────────────────────────────
  { id: 'pr-monroe',   name: 'Dr. Lisa Monroe',  clinicId: 'cl-clearwater', specialty: 'Family Medicine' },
  { id: 'pr-reyes-c',  name: 'Dr. Carlos Reyes', clinicId: 'cl-clearwater', specialty: 'Family Medicine' },
  { id: 'pr-chen-a',   name: 'Dr. Amy Chen',     clinicId: 'cl-clearwater', specialty: 'Family Medicine' },

  // ── Highland Cardiology Group ─────────────────────────────────────────────
  { id: 'pr-hartley', name: 'Dr. James Hartley', clinicId: 'cl-highland', specialty: 'Cardiology' },
  { id: 'pr-petrov',  name: 'Dr. Nadia Petrov',  clinicId: 'cl-highland', specialty: 'Cardiology' },
  { id: 'pr-saad',    name: 'Dr. Omar Saad',     clinicId: 'cl-highland', specialty: 'Cardiology' },

  // ── Valley Primary Care ───────────────────────────────────────────────────
  { id: 'pr-kim-g', name: 'Dr. Grace Kim',    clinicId: 'cl-valley-pc', specialty: 'Primary Care' },
  { id: 'pr-webb',  name: 'Dr. Marcus Webb',  clinicId: 'cl-valley-pc', specialty: 'Primary Care' },
  { id: 'pr-lowe',  name: 'Dr. Sandra Lowe',  clinicId: 'cl-valley-pc', specialty: 'Primary Care' },

  // ── Pacific Internal Medicine ─────────────────────────────────────────────
  { id: 'pr-huang-v', name: 'Dr. Victor Huang', clinicId: 'cl-pacific', specialty: 'Internal Medicine' },
  { id: 'pr-volkov',  name: 'Dr. Elena Volkov', clinicId: 'cl-pacific', specialty: 'Internal Medicine' },
  { id: 'pr-mehta',   name: 'Dr. Raj Mehta',    clinicId: 'cl-pacific', specialty: 'Internal Medicine' },

  // ── Cedar Hill Gastroenterology ───────────────────────────────────────────
  { id: 'pr-tan-l',   name: 'Dr. Lily Tan',       clinicId: 'cl-cedar', specialty: 'Gastroenterology' },
  { id: 'pr-boateng', name: 'Dr. Samuel Boateng', clinicId: 'cl-cedar', specialty: 'Gastroenterology' },
  { id: 'pr-romano',  name: 'Dr. Mia Romano',     clinicId: 'cl-cedar', specialty: 'Gastroenterology' },

  // ── Forest View Pediatrics ────────────────────────────────────────────────
  { id: 'pr-park-h',    name: 'Dr. Henry Park',   clinicId: 'cl-forest', specialty: 'Pediatrics' },
  { id: 'pr-ahmed-z',   name: 'Dr. Zara Ahmed',   clinicId: 'cl-forest', specialty: 'Pediatrics' },
  { id: 'pr-peterson-l',name: 'Dr. Luke Peterson', clinicId: 'cl-forest', specialty: 'Pediatrics' },

  // ── Downtown Primary Care ─────────────────────────────────────────────────
  { id: 'pr-miller-a',  name: 'Dr. Ava Miller',   clinicId: 'cl-downtown', specialty: 'Primary Care' },
  { id: 'pr-ortiz',     name: 'Dr. Diego Ortiz',  clinicId: 'cl-downtown', specialty: 'Primary Care' },
  { id: 'pr-jackson-c', name: 'Dr. Chloe Jackson', clinicId: 'cl-downtown', specialty: 'Primary Care' },

  // ── Metro Nephrology Specialists ──────────────────────────────────────────
  { id: 'pr-kowalski', name: 'Dr. Ivan Kowalski',    clinicId: 'cl-metro', specialty: 'Nephrology' },
  { id: 'pr-alfarsi',  name: 'Dr. Fatima Al-Farsi',  clinicId: 'cl-metro', specialty: 'Nephrology' },
  { id: 'pr-nguyen-r', name: 'Dr. Rob Nguyen',       clinicId: 'cl-metro', specialty: 'Nephrology' },

  // ── Central Pulmonology Group ─────────────────────────────────────────────
  { id: 'pr-ferreira-d', name: 'Dr. Diana Ferreira', clinicId: 'cl-central', specialty: 'Pulmonology' },
  { id: 'pr-murphy-n',   name: 'Dr. Noel Murphy',    clinicId: 'cl-central', specialty: 'Pulmonology' },
  { id: 'pr-singh-t',    name: 'Dr. Tanya Singh',    clinicId: 'cl-central', specialty: 'Pulmonology' },

  // ── Riverside Rheumatology Clinic ────────────────────────────────────────
  { id: 'pr-lam',        name: 'Dr. Arthur Lam',      clinicId: 'cl-riv-rheum', specialty: 'Rheumatology' },
  { id: 'pr-martin-s',   name: 'Dr. Sophie Martin',   clinicId: 'cl-riv-rheum', specialty: 'Rheumatology' },
  { id: 'pr-washington', name: 'Dr. Kyle Washington', clinicId: 'cl-riv-rheum', specialty: 'Rheumatology' },

  // ── Springfield Family Health ─────────────────────────────────────────────
  { id: 'pr-collins-n',  name: 'Dr. Nancy Collins',  clinicId: 'cl-springfield', specialty: 'Family Medicine' },
  { id: 'pr-johansson',  name: 'Dr. Peter Johansson', clinicId: 'cl-springfield', specialty: 'Family Medicine' },
  { id: 'pr-nakamura-m', name: 'Dr. Mei Nakamura',   clinicId: 'cl-springfield', specialty: 'Family Medicine' },

  // ── Northgate Oncology Associates ────────────────────────────────────────
  { id: 'pr-fox-l',     name: 'Dr. Linda Fox',    clinicId: 'cl-northgate', specialty: 'Oncology' },
  { id: 'pr-rivera-e',  name: 'Dr. Ethan Rivera', clinicId: 'cl-northgate', specialty: 'Oncology' },
  { id: 'pr-hughes-c',  name: 'Dr. Cora Hughes',  clinicId: 'cl-northgate', specialty: 'Oncology' },

  // ── Bayside Endocrinology ─────────────────────────────────────────────────
  { id: 'pr-chang-d',  name: 'Dr. Derek Chang',   clinicId: 'cl-bayside-endo', specialty: 'Endocrinology' },
  { id: 'pr-tanaka-y', name: 'Dr. Yuki Tanaka',   clinicId: 'cl-bayside-endo', specialty: 'Endocrinology' },
  { id: 'pr-espinoza', name: 'Dr. Maria Espinoza', clinicId: 'cl-bayside-endo', specialty: 'Endocrinology' },

  // ── Lakewood Internal Medicine ────────────────────────────────────────────
  { id: 'pr-grant-a',  name: 'Dr. Alan Grant',   clinicId: 'cl-lakewood', specialty: 'Internal Medicine' },
  { id: 'pr-okonkwo',  name: 'Dr. Rose Okonkwo', clinicId: 'cl-lakewood', specialty: 'Internal Medicine' },
  { id: 'pr-fischer',  name: 'Dr. Max Fischer',  clinicId: 'cl-lakewood', specialty: 'Internal Medicine' },

  // ── Elm Street Family Practice ────────────────────────────────────────────
  { id: 'pr-brooks-h', name: 'Dr. Hazel Brooks', clinicId: 'cl-elm', specialty: 'Family Medicine' },
  { id: 'pr-wu-j',     name: 'Dr. Jason Wu',     clinicId: 'cl-elm', specialty: 'Family Medicine' },
  { id: 'pr-larsen',   name: 'Dr. Petra Larsen', clinicId: 'cl-elm', specialty: 'Family Medicine' },

  // ── Sunrise Multispecialty Group ──────────────────────────────────────────
  { id: 'pr-sullivan-o', name: 'Dr. Owen Sullivan',  clinicId: 'cl-sunrise', specialty: 'Internal Medicine' },
  { id: 'pr-marques',    name: 'Dr. Isabel Marques', clinicId: 'cl-sunrise', specialty: 'Family Medicine' },
  { id: 'pr-kowalczyk',  name: 'Dr. Finn Kowalczyk', clinicId: 'cl-sunrise', specialty: 'Cardiology' },

  // ── Meadow Brook Primary Care ─────────────────────────────────────────────
  { id: 'pr-ross-a',   name: 'Dr. Abby Ross',    clinicId: 'cl-meadow', specialty: 'Primary Care' },
  { id: 'pr-wei',      name: 'Dr. Chen Wei',     clinicId: 'cl-meadow', specialty: 'Primary Care' },
  { id: 'pr-andersen', name: 'Dr. Lars Andersen', clinicId: 'cl-meadow', specialty: 'Primary Care' },

  // ── Ironwood Cardiology Partners ──────────────────────────────────────────
  { id: 'pr-stone-g',  name: 'Dr. George Stone',  clinicId: 'cl-ironwood', specialty: 'Cardiology' },
  { id: 'pr-hassan-l', name: 'Dr. Layla Hassan',  clinicId: 'cl-ironwood', specialty: 'Cardiology' },
  { id: 'pr-popov',    name: 'Dr. Nick Popov',    clinicId: 'cl-ironwood', specialty: 'Cardiology' },

  // ── Coastal Neurology Center ──────────────────────────────────────────────
  { id: 'pr-walsh-s',  name: 'Dr. Serena Walsh',   clinicId: 'cl-coastal', specialty: 'Neurology' },
  { id: 'pr-burke-a',  name: 'Dr. Aiden Burke',    clinicId: 'cl-coastal', specialty: 'Neurology' },
  { id: 'pr-cruz',     name: 'Dr. Yolanda Cruz',   clinicId: 'cl-coastal', specialty: 'Neurology' },

  // ── Greenfield Pediatrics ─────────────────────────────────────────────────
  { id: 'pr-lee-t',    name: 'Dr. Tommy Lee',    clinicId: 'cl-greenfield', specialty: 'Pediatrics' },
  { id: 'pr-sharma-p', name: 'Dr. Priya Sharma', clinicId: 'cl-greenfield', specialty: 'Pediatrics' },
  { id: 'pr-osei-j',   name: 'Dr. Jack Osei',    clinicId: 'cl-greenfield', specialty: 'Pediatrics' },

  // ── Aspen Valley Internal Medicine ───────────────────────────────────────
  { id: 'pr-hoffman-m', name: 'Dr. Mia Hoffman',     clinicId: 'cl-aspen', specialty: 'Internal Medicine' },
  { id: 'pr-winters',   name: 'Dr. Carl Winters',    clinicId: 'cl-aspen', specialty: 'Internal Medicine' },
  { id: 'pr-moreau-b',  name: 'Dr. Brigitte Moreau', clinicId: 'cl-aspen', specialty: 'Internal Medicine' },

  // ── Redwood Oncology & Hematology ────────────────────────────────────────
  { id: 'pr-king-w',      name: 'Dr. Warren King',     clinicId: 'cl-redwood', specialty: 'Oncology' },
  { id: 'pr-nakamura-s',  name: 'Dr. Stella Nakamura', clinicId: 'cl-redwood', specialty: 'Hematology' },
  { id: 'pr-reyes-f',     name: 'Dr. Felix Reyes',     clinicId: 'cl-redwood', specialty: 'Oncology' },

  // ── Clover Leaf Family Medicine ───────────────────────────────────────────
  { id: 'pr-chan-b',    name: 'Dr. Becky Chan',    clinicId: 'cl-clover', specialty: 'Family Medicine' },
  { id: 'pr-smith-h',  name: 'Dr. Harold Smith',  clinicId: 'cl-clover', specialty: 'Family Medicine' },
  { id: 'pr-torres-a', name: 'Dr. Alicia Torres', clinicId: 'cl-clover', specialty: 'Family Medicine' },

  // ── Horizon Gastroenterology ──────────────────────────────────────────────
  { id: 'pr-park-d',  name: 'Dr. Donald Park',  clinicId: 'cl-horizon', specialty: 'Gastroenterology' },
  { id: 'pr-keller',  name: 'Dr. Vera Keller',  clinicId: 'cl-horizon', specialty: 'Gastroenterology' },
  { id: 'pr-adeyemi', name: 'Dr. Mitch Adeyemi', clinicId: 'cl-horizon', specialty: 'Gastroenterology' },
];
