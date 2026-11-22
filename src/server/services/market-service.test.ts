import { describe, expect, it } from "vitest";

import { calculateRankings } from "@/server/domain/scoring";
import type { MarketDataset, RawAreaMetrics } from "@/server/domain/types";

import { summarizeMarketDataset } from "./market-service";

function county(
  geoid: string,
  population60Plus: number,
  financialCapacityPercent: number | null,
): RawAreaMetrics {
  return {
    geoid,
    level: "county",
    name: `County ${geoid}`,
    stateFips: geoid.slice(0, 2),
    stateName: "Test State",
    population60Plus,
    population60PlusMoe: 10,
    population60PlusPercent: 25,
    population60PlusPercentMoe: 0.5,
    financialCapacityPercent,
    financialCapacityMoe: financialCapacityPercent === null ? null : 0.5,
  };
}

describe("summarizeMarketDataset", () => {
  it("reports ranked-area and target-population coverage", () => {
    const dataset: MarketDataset = {
      metadata: {
        vintage: "2024",
        period: "Test period",
        methodologyVersion: "test",
        source: "Test source",
        sourceUrl: "https://example.com",
        importedAt: "2026-01-01T00:00:00.000Z",
        preview: false,
      },
      areas: calculateRankings([
        county("01001", 900, 80),
        county("01003", 100, null),
      ]),
    };

    const summary = summarizeMarketDataset(dataset, "county");

    expect(summary).toMatchObject({
      areaCount: 1,
      totalAreaCount: 2,
      rankedAreaCount: 1,
      unrankedAreaCount: 1,
      totalTargetPopulation: 1_000,
      rankedTargetPopulation: 900,
      targetPopulationCoveragePercent: 90,
    });
    expect(summary.topArea?.geoid).toBe("01001");
  });
});
