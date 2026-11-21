import { describe, expect, it } from "vitest";

import type { RawAreaMetrics } from "@/server/domain/types";

import { validateCensusMetrics } from "./validation";

const base: RawAreaMetrics = {
  geoid: "01",
  level: "state",
  name: "Alabama",
  stateFips: "01",
  stateName: "Alabama",
  population60Plus: 1,
  population60PlusMoe: 1,
  population60PlusPercent: 1,
  population60PlusPercentMoe: 1,
  financialCapacityPercent: 1,
  financialCapacityMoe: 1,
};

describe("validateCensusMetrics", () => {
  it("rejects duplicate GEOIDs before persistence", () => {
    expect(() => validateCensusMetrics([base, base])).toThrow(
      "duplicate GEOIDs",
    );
  });

  it("rejects incomplete national coverage", () => {
    expect(() => validateCensusMetrics([base])).toThrow(
      "Expected 51 state-level areas",
    );
  });
});
