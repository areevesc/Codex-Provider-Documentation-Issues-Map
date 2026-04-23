import { describe, expect, it } from "vitest";
import { seedEntities } from "../data/seedData";
import {
  getCurrentIssueDetailsForProvider,
  getHistoricalIssueDetailsForProvider,
  getIssueSummariesForProviderIds,
  getIssueUsageCounts,
  getProviderIdsForCdi
} from "./selectors";

describe("issue selectors", () => {
  it("keeps current provider issues separate from historical issues", () => {
    const current = getCurrentIssueDetailsForProvider(seedEntities, "provider-amelia-stone");
    const historical = getHistoricalIssueDetailsForProvider(seedEntities, "provider-amelia-stone");

    expect(current.map((detail) => detail.record.status).sort()).toEqual(["Active", "Improving"]);
    expect(historical.map((detail) => detail.record.status)).toEqual(["Resolved"]);
  });

  it("counts active/current provider-to-issue links for scoped summaries", () => {
    const providerIds = getProviderIdsForCdi(seedEntities, "cdi-avery-lane");
    const summaries = getIssueSummariesForProviderIds(seedEntities, providerIds);
    const missingSpecificity = summaries.find((summary) => summary.issueLabel.id === "issue-missing-specificity");

    expect(missingSpecificity?.activeProviderCount).toBe(3);
    expect(missingSpecificity?.activeClinicCount).toBe(2);
  });

  it("excludes resolved and archived records from issue usage counts", () => {
    const counts = getIssueUsageCounts(seedEntities, "issue-risk-gap");

    expect(counts.activeProviderCount).toBe(4);
    expect(counts.activeClinicCount).toBe(4);
  });
});
