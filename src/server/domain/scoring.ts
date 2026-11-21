import { SCORE_WEIGHTS } from "./methodology";
import type { DataQuality, MarketArea, RawAreaMetrics } from "./types";

function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Returns average-rank percentiles in a 0–100 range. Equal values receive the
 * same percentile so an area's score never depends on input order.
 */
export function percentileRanks(values: number[]): number[] {
  if (values.length === 0) return [];
  if (values.length === 1) return [100];

  const sorted = values
    .map((value, originalIndex) => ({ value, originalIndex }))
    .sort((a, b) => a.value - b.value);
  const output = new Array<number>(values.length);

  let start = 0;
  while (start < sorted.length) {
    let end = start;
    while (
      end + 1 < sorted.length &&
      sorted[end + 1]?.value === sorted[start]?.value
    ) {
      end += 1;
    }

    const averageIndex = (start + end) / 2;
    const percentile = (averageIndex / (sorted.length - 1)) * 100;
    for (let index = start; index <= end; index += 1) {
      const item = sorted[index];
      if (item) output[item.originalIndex] = round(percentile, 2);
    }
    start = end + 1;
  }

  return output;
}

function relativeMoe(value: number | null, moe: number | null): number {
  if (value === null || moe === null || value === 0)
    return Number.POSITIVE_INFINITY;
  return Math.abs(moe / value);
}

export function assessDataQuality(area: RawAreaMetrics): DataQuality {
  const worstRelativeMoe = Math.max(
    relativeMoe(area.population60Plus, area.population60PlusMoe),
    relativeMoe(area.population60PlusPercent, area.population60PlusPercentMoe),
    relativeMoe(area.financialCapacityPercent, area.financialCapacityMoe),
  );

  if (worstRelativeMoe <= 0.1) return "high";
  if (worstRelativeMoe <= 0.2) return "moderate";
  return "limited";
}

export function calculateRankings(rows: RawAreaMetrics[]): MarketArea[] {
  const output: MarketArea[] = [];

  for (const level of ["state", "county"] as const) {
    const levelRows = rows.filter((row) => row.level === level);
    const eligibleRows = levelRows.filter(
      (row) =>
        row.population60Plus >= 0 &&
        row.population60PlusPercent >= 0 &&
        row.financialCapacityPercent !== null &&
        row.financialCapacityPercent >= 0,
    );

    const sizeRanks = percentileRanks(
      eligibleRows.map((row) => row.population60Plus),
    );
    const concentrationRanks = percentileRanks(
      eligibleRows.map((row) => row.population60PlusPercent),
    );
    const financialRanks = percentileRanks(
      eligibleRows.map((row) => row.financialCapacityPercent ?? 0),
    );

    const scored = eligibleRows.map<MarketArea>((row, index) => {
      const sizePercentile = sizeRanks[index] ?? 0;
      const concentrationPercentile = concentrationRanks[index] ?? 0;
      const financialCapacityPercentile = financialRanks[index] ?? 0;
      const score = round(
        sizePercentile * SCORE_WEIGHTS.marketSize +
          concentrationPercentile * SCORE_WEIGHTS.concentration +
          financialCapacityPercentile * SCORE_WEIGHTS.financialCapacity,
      );

      return {
        ...row,
        rank: null,
        score,
        sizePercentile,
        concentrationPercentile,
        financialCapacityPercentile,
        eligible: true,
        quality: assessDataQuality(row),
      };
    });

    scored.sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        b.population60Plus - a.population60Plus ||
        a.geoid.localeCompare(b.geoid),
    );

    let previousScore: number | null = null;
    let previousRank = 0;
    scored.forEach((area, index) => {
      const rank = area.score === previousScore ? previousRank : index + 1;
      area.rank = rank;
      previousScore = area.score;
      previousRank = rank;
    });

    const ineligible = levelRows
      .filter((row) => !eligibleRows.includes(row))
      .map(
        (row) =>
          ({
            ...row,
            rank: null,
            score: null,
            sizePercentile: null,
            concentrationPercentile: null,
            financialCapacityPercentile: null,
            eligible: false,
            quality: "limited",
          }) satisfies MarketArea,
      );

    output.push(...scored, ...ineligible);
  }

  return output;
}
