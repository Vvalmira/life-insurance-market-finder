import type { RawAreaMetrics } from "@/server/domain/types";

export interface DatasetValidation {
  stateCount: number;
  countyCount: number;
  warnings: string[];
}

export function validateCensusMetrics(
  rows: RawAreaMetrics[],
): DatasetValidation {
  const stateCount = rows.filter((row) => row.level === "state").length;
  const countyCount = rows.filter((row) => row.level === "county").length;
  const uniqueGeoids = new Set(rows.map((row) => row.geoid));

  if (uniqueGeoids.size !== rows.length) {
    throw new Error("Census import contains duplicate GEOIDs");
  }
  if (stateCount !== 51) {
    throw new Error(`Expected 51 state-level areas; received ${stateCount}`);
  }
  if (countyCount < 3_100) {
    throw new Error(
      `Expected at least 3,100 counties; received ${countyCount}`,
    );
  }

  const missingFinancial = rows.filter(
    (row) => row.financialCapacityPercent === null,
  ).length;

  return {
    stateCount,
    countyCount,
    warnings:
      missingFinancial > 0
        ? [`${missingFinancial} areas have missing financial-capacity data`]
        : [],
  };
}
