import { describe, expect, it } from "vitest";

import { calculateRankings, percentileRanks } from "./scoring";
import type { RawAreaMetrics } from "./types";

function area(
  geoid: string,
  population60Plus: number,
  population60PlusPercent: number,
  financialCapacityPercent: number | null,
): RawAreaMetrics {
  return {
    geoid,
    level: "state",
    name: `Area ${geoid}`,
    stateFips: geoid,
    stateName: `Area ${geoid}`,
    population60Plus,
    population60PlusMoe: 1,
    population60PlusPercent,
    population60PlusPercentMoe: 0.1,
    financialCapacityPercent,
    financialCapacityMoe: financialCapacityPercent === null ? null : 0.5,
  };
}

describe("percentileRanks", () => {
  it("maps an ordered range to 0 through 100", () => {
    expect(percentileRanks([10, 20, 30])).toEqual([0, 50, 100]);
  });

  it("gives tied values the same average percentile", () => {
    expect(percentileRanks([10, 20, 20, 40])).toEqual([0, 50, 50, 100]);
  });

  it("handles a single geography", () => {
    expect(percentileRanks([10])).toEqual([100]);
  });
});

describe("calculateRankings", () => {
  it("uses the documented weighted score and ranks descending", () => {
    const ranked = calculateRankings([
      area("01", 100, 10, 70),
      area("02", 200, 20, 80),
    ]);

    expect(ranked[0]).toMatchObject({ geoid: "02", rank: 1, score: 100 });
    expect(ranked[1]).toMatchObject({ geoid: "01", rank: 2, score: 0 });
  });

  it("keeps rows with missing financial data visible but ineligible", () => {
    const [ranked] = calculateRankings([area("01", 100, 10, null)]);

    expect(ranked).toMatchObject({
      eligible: false,
      rank: null,
      score: null,
      quality: "limited",
    });
  });
});
