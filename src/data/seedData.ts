import type {
  AppEntities,
  CdiSpecialist,
  Clinic,
  IssueLabel,
  Provider,
  ProviderIssueRecord,
  ProviderIssueStatus
} from "../domain/types";

const cdiSpecialists: CdiSpecialist[] = [
  { id: "cdi-avery-lane", name: "Avery Lane, CCDS" },
  { id: "cdi-jordan-kim", name: "Jordan Kim, RN" },
  { id: "cdi-morgan-patel", name: "Morgan Patel, CCS" }
];

const clinics: Clinic[] = [
  { id: "clinic-northside", name: "Northside Family Clinic", cdiSpecialistId: "cdi-avery-lane" },
  { id: "clinic-harbor", name: "Harbor Internal Medicine", cdiSpecialistId: "cdi-avery-lane" },
  { id: "clinic-cedar", name: "Cedar Ridge Primary Care", cdiSpecialistId: "cdi-jordan-kim" },
  { id: "clinic-lakeside", name: "Lakeside Pediatrics", cdiSpecialistId: "cdi-jordan-kim" },
  { id: "clinic-summit", name: "Summit Specialty Group", cdiSpecialistId: "cdi-morgan-patel" },
  { id: "clinic-valley", name: "Valley Community Health", cdiSpecialistId: "cdi-morgan-patel" }
];

const providers: Provider[] = [
  { id: "provider-amelia-stone", name: "Dr. Amelia Stone", clinicId: "clinic-northside" },
  { id: "provider-caleb-brooks", name: "Dr. Caleb Brooks", clinicId: "clinic-northside" },
  { id: "provider-nora-valdez", name: "Dr. Nora Valdez", clinicId: "clinic-northside" },
  { id: "provider-ethan-wright", name: "Dr. Ethan Wright", clinicId: "clinic-northside" },
  { id: "provider-maya-reed", name: "Dr. Maya Reed", clinicId: "clinic-harbor" },
  { id: "provider-owen-price", name: "Dr. Owen Price", clinicId: "clinic-harbor" },
  { id: "provider-leah-hart", name: "Dr. Leah Hart", clinicId: "clinic-harbor" },
  { id: "provider-simon-clark", name: "Dr. Simon Clark", clinicId: "clinic-harbor" },
  { id: "provider-iris-bennett", name: "Dr. Iris Bennett", clinicId: "clinic-cedar" },
  { id: "provider-julian-ramos", name: "Dr. Julian Ramos", clinicId: "clinic-cedar" },
  { id: "provider-tessa-nguyen", name: "Dr. Tessa Nguyen", clinicId: "clinic-cedar" },
  { id: "provider-luca-miles", name: "Dr. Luca Miles", clinicId: "clinic-cedar" },
  { id: "provider-ana-foster", name: "Dr. Ana Foster", clinicId: "clinic-lakeside" },
  { id: "provider-devon-hayes", name: "Dr. Devon Hayes", clinicId: "clinic-lakeside" },
  { id: "provider-priya-shah", name: "Dr. Priya Shah", clinicId: "clinic-lakeside" },
  { id: "provider-noah-grant", name: "Dr. Noah Grant", clinicId: "clinic-lakeside" },
  { id: "provider-selena-morris", name: "Dr. Selena Morris", clinicId: "clinic-summit" },
  { id: "provider-marcus-young", name: "Dr. Marcus Young", clinicId: "clinic-summit" },
  { id: "provider-elena-soto", name: "Dr. Elena Soto", clinicId: "clinic-summit" },
  { id: "provider-victor-chen", name: "Dr. Victor Chen", clinicId: "clinic-summit" },
  { id: "provider-grace-holland", name: "Dr. Grace Holland", clinicId: "clinic-valley" },
  { id: "provider-isaac-park", name: "Dr. Isaac Park", clinicId: "clinic-valley" },
  { id: "provider-hannah-ellis", name: "Dr. Hannah Ellis", clinicId: "clinic-valley" },
  { id: "provider-miles-carter", name: "Dr. Miles Carter", clinicId: "clinic-valley" }
];

const issueLabels: IssueLabel[] = [
  {
    id: "issue-missing-specificity",
    name: "Missing specificity",
    description: "The note identifies a condition but does not include enough clinical specificity.",
    createdAt: "2026-01-03T09:00:00.000Z",
    updatedAt: "2026-01-03T09:00:00.000Z"
  },
  {
    id: "issue-visit-dx-undocumented",
    name: "Visit diagnoses listed but not documented",
    description: "Diagnoses appear in the assessment or billing context without supporting documentation.",
    createdAt: "2026-01-03T09:15:00.000Z",
    updatedAt: "2026-01-03T09:15:00.000Z"
  },
  {
    id: "issue-unsupported-wording",
    name: "Unsupported diagnosis wording",
    description: "Diagnosis wording is stronger than the evidence documented in the encounter.",
    createdAt: "2026-01-03T09:30:00.000Z",
    updatedAt: "2026-01-03T09:30:00.000Z"
  },
  {
    id: "issue-chronic-status",
    name: "Chronic condition status unclear",
    description: "The record does not clearly describe whether a chronic condition is current, stable, or managed.",
    createdAt: "2026-01-03T09:45:00.000Z",
    updatedAt: "2026-01-03T09:45:00.000Z"
  },
  {
    id: "issue-linkage",
    name: "Cause-and-effect linkage unclear",
    description: "Related clinical conditions need clearer linkage in the provider documentation.",
    createdAt: "2026-01-03T10:00:00.000Z",
    updatedAt: "2026-01-03T10:00:00.000Z"
  },
  {
    id: "issue-labs-not-addressed",
    name: "Abnormal results not addressed",
    description: "Relevant abnormal findings are present but not discussed in the assessment or plan.",
    createdAt: "2026-01-03T10:15:00.000Z",
    updatedAt: "2026-01-03T10:15:00.000Z"
  },
  {
    id: "issue-risk-gap",
    name: "Risk adjustment condition gap",
    description: "A known chronic condition appears to need current-year assessment or supporting documentation.",
    createdAt: "2026-01-03T10:30:00.000Z",
    updatedAt: "2026-01-03T10:30:00.000Z"
  },
  {
    id: "issue-acute-chronic",
    name: "Acute versus chronic state unclear",
    description: "The note does not make the acuity or chronicity of the condition clear.",
    createdAt: "2026-01-03T10:45:00.000Z",
    updatedAt: "2026-01-03T10:45:00.000Z"
  },
  {
    id: "issue-plan-thin",
    name: "Treatment plan lacks detail",
    description: "The plan mentions follow-up or monitoring but lacks enough detail for the documented condition.",
    createdAt: "2026-01-03T11:00:00.000Z",
    updatedAt: "2026-01-03T11:00:00.000Z"
  }
];

function record(
  id: string,
  providerId: string,
  issueLabelId: string,
  status: ProviderIssueStatus,
  notesExamples: string,
  createdAt: string,
  updatedAt: string,
  resolvedAt?: string
): ProviderIssueRecord {
  return { id, providerId, issueLabelId, status, notesExamples, createdAt, updatedAt, resolvedAt };
}

const providerIssueRecords: ProviderIssueRecord[] = [
  record("pir-001", "provider-amelia-stone", "issue-missing-specificity", "Active", "Often needs laterality and severity added for chronic musculoskeletal conditions.", "2026-01-12T15:00:00.000Z", "2026-04-04T15:00:00.000Z"),
  record("pir-002", "provider-amelia-stone", "issue-plan-thin", "Improving", "Recent notes include better follow-up intervals; continue watching medication monitoring language.", "2026-01-18T15:00:00.000Z", "2026-04-05T15:00:00.000Z"),
  record("pir-003", "provider-amelia-stone", "issue-visit-dx-undocumented", "Resolved", "Prior issue improved after January education session.", "2026-01-10T15:00:00.000Z", "2026-03-01T15:00:00.000Z", "2026-03-01T15:00:00.000Z"),
  record("pir-004", "provider-caleb-brooks", "issue-visit-dx-undocumented", "Active", "Diagnosis list sometimes includes conditions not addressed in the visit narrative.", "2026-02-02T15:00:00.000Z", "2026-04-02T15:00:00.000Z"),
  record("pir-005", "provider-caleb-brooks", "issue-risk-gap", "Active", "Several chronic diagnoses need current assessment language during annual reviews.", "2026-02-03T15:00:00.000Z", "2026-03-30T15:00:00.000Z"),
  record("pir-006", "provider-nora-valdez", "issue-linkage", "Improving", "Linkage language has improved but remains inconsistent in endocrine-related examples.", "2026-02-04T15:00:00.000Z", "2026-04-01T15:00:00.000Z"),
  record("pir-007", "provider-nora-valdez", "issue-labs-not-addressed", "Active", "Abnormal values are present but the assessment sometimes omits clinical interpretation.", "2026-02-06T15:00:00.000Z", "2026-03-28T15:00:00.000Z"),
  record("pir-008", "provider-ethan-wright", "issue-missing-specificity", "Active", "Needs stage, severity, and complication detail when relevant.", "2026-02-10T15:00:00.000Z", "2026-03-21T15:00:00.000Z"),
  record("pir-009", "provider-ethan-wright", "issue-acute-chronic", "Archived", "Mistaken entry from sample review cleanup.", "2026-02-11T15:00:00.000Z", "2026-02-12T15:00:00.000Z"),
  record("pir-010", "provider-maya-reed", "issue-unsupported-wording", "Active", "Avoid definitive wording when the plan documents only evaluation or monitoring.", "2026-02-14T15:00:00.000Z", "2026-04-05T15:00:00.000Z"),
  record("pir-011", "provider-maya-reed", "issue-chronic-status", "Improving", "Follow-up notes increasingly specify stable versus worsening status.", "2026-02-15T15:00:00.000Z", "2026-04-05T15:00:00.000Z"),
  record("pir-012", "provider-owen-price", "issue-plan-thin", "Active", "Assessment is clear, but plan often needs explicit monitoring or treatment detail.", "2026-02-16T15:00:00.000Z", "2026-04-02T15:00:00.000Z"),
  record("pir-013", "provider-owen-price", "issue-risk-gap", "Resolved", "Current-year review language improved in March sample.", "2026-01-20T15:00:00.000Z", "2026-03-18T15:00:00.000Z", "2026-03-18T15:00:00.000Z"),
  record("pir-014", "provider-leah-hart", "issue-missing-specificity", "Active", "Most common in dermatology-related and wound documentation examples.", "2026-02-17T15:00:00.000Z", "2026-03-25T15:00:00.000Z"),
  record("pir-015", "provider-leah-hart", "issue-labs-not-addressed", "Improving", "Recent documentation references follow-up labs more consistently.", "2026-02-18T15:00:00.000Z", "2026-04-01T15:00:00.000Z"),
  record("pir-016", "provider-simon-clark", "issue-visit-dx-undocumented", "Active", "Problem list diagnoses appear in encounter coding without matching discussion.", "2026-02-19T15:00:00.000Z", "2026-04-02T15:00:00.000Z"),
  record("pir-017", "provider-simon-clark", "issue-linkage", "Active", "Needs clearer cause-and-effect statements for related diagnoses when clinically supported.", "2026-02-20T15:00:00.000Z", "2026-03-30T15:00:00.000Z"),
  record("pir-018", "provider-iris-bennett", "issue-risk-gap", "Active", "Several chronic conditions appear in history but need active assessment.", "2026-02-22T15:00:00.000Z", "2026-04-03T15:00:00.000Z"),
  record("pir-019", "provider-iris-bennett", "issue-chronic-status", "Active", "Clarify whether chronic conditions are stable, worsening, or under active treatment.", "2026-02-22T15:00:00.000Z", "2026-04-03T15:00:00.000Z"),
  record("pir-020", "provider-julian-ramos", "issue-unsupported-wording", "Improving", "Education helped; keep examples focused on assessment wording.", "2026-02-24T15:00:00.000Z", "2026-04-02T15:00:00.000Z"),
  record("pir-021", "provider-julian-ramos", "issue-missing-specificity", "Resolved", "Improved after specificity tip sheet review.", "2026-01-17T15:00:00.000Z", "2026-03-09T15:00:00.000Z", "2026-03-09T15:00:00.000Z"),
  record("pir-022", "provider-tessa-nguyen", "issue-labs-not-addressed", "Active", "Lab interpretation missing from a subset of follow-up visits.", "2026-02-26T15:00:00.000Z", "2026-04-06T15:00:00.000Z"),
  record("pir-023", "provider-tessa-nguyen", "issue-plan-thin", "Active", "Plan should document next steps more explicitly for unresolved issues.", "2026-02-27T15:00:00.000Z", "2026-04-06T15:00:00.000Z"),
  record("pir-024", "provider-luca-miles", "issue-acute-chronic", "Active", "Acuity is sometimes unclear in respiratory and injury examples.", "2026-03-01T15:00:00.000Z", "2026-03-29T15:00:00.000Z"),
  record("pir-025", "provider-luca-miles", "issue-linkage", "Improving", "Linkage language has improved in the last review cycle.", "2026-03-02T15:00:00.000Z", "2026-03-29T15:00:00.000Z"),
  record("pir-026", "provider-ana-foster", "issue-visit-dx-undocumented", "Active", "Well-child visits sometimes carry forward diagnoses that are not addressed.", "2026-03-03T15:00:00.000Z", "2026-04-04T15:00:00.000Z"),
  record("pir-027", "provider-ana-foster", "issue-plan-thin", "Resolved", "Plan detail improved after template adjustment.", "2026-02-01T15:00:00.000Z", "2026-03-20T15:00:00.000Z", "2026-03-20T15:00:00.000Z"),
  record("pir-028", "provider-devon-hayes", "issue-missing-specificity", "Improving", "Specificity reminders are working; still monitor developmental diagnosis language.", "2026-03-04T15:00:00.000Z", "2026-04-02T15:00:00.000Z"),
  record("pir-029", "provider-devon-hayes", "issue-acute-chronic", "Active", "Distinguish acute complaints from chronic conditions in assessment language.", "2026-03-04T15:00:00.000Z", "2026-03-31T15:00:00.000Z"),
  record("pir-030", "provider-priya-shah", "issue-labs-not-addressed", "Active", "Follow-up notes need interpretation of abnormal screening results.", "2026-03-05T15:00:00.000Z", "2026-04-05T15:00:00.000Z"),
  record("pir-031", "provider-priya-shah", "issue-chronic-status", "Resolved", "No longer appearing in current sample review.", "2026-02-11T15:00:00.000Z", "2026-03-25T15:00:00.000Z", "2026-03-25T15:00:00.000Z"),
  record("pir-032", "provider-noah-grant", "issue-unsupported-wording", "Active", "Some diagnoses need softer wording when the documentation supports screening only.", "2026-03-06T15:00:00.000Z", "2026-04-01T15:00:00.000Z"),
  record("pir-033", "provider-noah-grant", "issue-risk-gap", "Improving", "Annual visit templates are helping current assessment capture.", "2026-03-06T15:00:00.000Z", "2026-04-01T15:00:00.000Z"),
  record("pir-034", "provider-selena-morris", "issue-linkage", "Active", "Specialty notes need explicit relationship language when clinically supported.", "2026-03-07T15:00:00.000Z", "2026-04-05T15:00:00.000Z"),
  record("pir-035", "provider-selena-morris", "issue-risk-gap", "Active", "Known chronic diagnoses require current-year assessment evidence.", "2026-03-07T15:00:00.000Z", "2026-04-05T15:00:00.000Z"),
  record("pir-036", "provider-marcus-young", "issue-missing-specificity", "Active", "Need specificity for complication and severity language.", "2026-03-08T15:00:00.000Z", "2026-03-31T15:00:00.000Z"),
  record("pir-037", "provider-marcus-young", "issue-visit-dx-undocumented", "Improving", "Fewer carried-forward diagnoses in the latest sample.", "2026-03-08T15:00:00.000Z", "2026-03-31T15:00:00.000Z"),
  record("pir-038", "provider-elena-soto", "issue-plan-thin", "Active", "Plans sometimes omit monitoring frequency and patient-specific next steps.", "2026-03-09T15:00:00.000Z", "2026-04-04T15:00:00.000Z"),
  record("pir-039", "provider-elena-soto", "issue-labs-not-addressed", "Resolved", "Improved in late March review.", "2026-02-16T15:00:00.000Z", "2026-03-28T15:00:00.000Z", "2026-03-28T15:00:00.000Z"),
  record("pir-040", "provider-victor-chen", "issue-acute-chronic", "Active", "Acuity distinctions are unclear in episodic care examples.", "2026-03-10T15:00:00.000Z", "2026-04-02T15:00:00.000Z"),
  record("pir-041", "provider-victor-chen", "issue-unsupported-wording", "Active", "Avoid unsupported definitive diagnoses when assessment describes rule-out work.", "2026-03-10T15:00:00.000Z", "2026-04-02T15:00:00.000Z"),
  record("pir-042", "provider-grace-holland", "issue-chronic-status", "Active", "Current status of chronic conditions needs clearer visit-level documentation.", "2026-03-12T15:00:00.000Z", "2026-04-06T15:00:00.000Z"),
  record("pir-043", "provider-grace-holland", "issue-risk-gap", "Resolved", "Improved after chronic condition review workflow.", "2026-02-14T15:00:00.000Z", "2026-03-23T15:00:00.000Z", "2026-03-23T15:00:00.000Z"),
  record("pir-044", "provider-isaac-park", "issue-visit-dx-undocumented", "Active", "Assessment includes diagnoses without supporting visit documentation.", "2026-03-13T15:00:00.000Z", "2026-04-04T15:00:00.000Z"),
  record("pir-045", "provider-isaac-park", "issue-linkage", "Active", "Needs clearer linkage between clinically related conditions.", "2026-03-13T15:00:00.000Z", "2026-04-04T15:00:00.000Z"),
  record("pir-046", "provider-hannah-ellis", "issue-missing-specificity", "Improving", "Specificity has improved in problem-oriented notes.", "2026-03-14T15:00:00.000Z", "2026-04-03T15:00:00.000Z"),
  record("pir-047", "provider-hannah-ellis", "issue-labs-not-addressed", "Active", "Abnormal findings need clearer assessment and follow-up plan references.", "2026-03-14T15:00:00.000Z", "2026-04-03T15:00:00.000Z"),
  record("pir-048", "provider-miles-carter", "issue-plan-thin", "Active", "Plans need clearer specificity around monitoring and patient instructions.", "2026-03-15T15:00:00.000Z", "2026-04-06T15:00:00.000Z"),
  record("pir-049", "provider-miles-carter", "issue-chronic-status", "Active", "Clarify current state of chronic problems in visit documentation.", "2026-03-15T15:00:00.000Z", "2026-04-06T15:00:00.000Z"),
  record("pir-050", "provider-miles-carter", "issue-unsupported-wording", "Archived", "Sample duplicate entered during data seeding.", "2026-03-16T15:00:00.000Z", "2026-03-17T15:00:00.000Z")
];

function byId<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export const seedEntities: AppEntities = {
  cdiSpecialists: byId(cdiSpecialists),
  clinics: byId(clinics),
  providers: byId(providers),
  issueLabels: byId(issueLabels),
  providerIssueRecords: byId(providerIssueRecords)
};

export function cloneSeedEntities(): AppEntities {
  return structuredClone(seedEntities);
}
