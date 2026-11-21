import { and, desc, eq } from "drizzle-orm";

import { METHODOLOGY_VERSION } from "@/server/domain/methodology";
import type { MarketArea, MarketDataset } from "@/server/domain/types";

import { previewDataset } from "../data/preview";
import { getDatabase } from "../db/client";
import { areaRankings, areas, dataImports, marketMetrics } from "../db/schema";

function numberOrNull(value: string | null): number | null {
  return value === null ? null : Number(value);
}

async function loadDatabaseDataset(): Promise<MarketDataset> {
  const db = getDatabase();
  const [latestImport] = await db
    .select()
    .from(dataImports)
    .where(eq(dataImports.status, "completed"))
    .orderBy(desc(dataImports.completedAt))
    .limit(1);

  if (!latestImport) {
    throw new Error("No completed Census import is available");
  }

  const rows = await db
    .select({
      geoid: areas.geoid,
      level: areas.level,
      name: areas.name,
      stateFips: areas.stateFips,
      stateName: areas.stateName,
      population60Plus: marketMetrics.population60Plus,
      population60PlusMoe: marketMetrics.population60PlusMoe,
      population60PlusPercent: marketMetrics.population60PlusPercent,
      population60PlusPercentMoe: marketMetrics.population60PlusPercentMoe,
      financialCapacityPercent: marketMetrics.financialCapacityPercent,
      financialCapacityMoe: marketMetrics.financialCapacityMoe,
      rank: areaRankings.nationalRank,
      score: areaRankings.opportunityScore,
      sizePercentile: areaRankings.sizePercentile,
      concentrationPercentile: areaRankings.concentrationPercentile,
      financialCapacityPercentile: areaRankings.financialCapacityPercentile,
      eligible: areaRankings.eligible,
      quality: areaRankings.quality,
    })
    .from(areas)
    .innerJoin(
      marketMetrics,
      and(
        eq(areas.geoid, marketMetrics.areaGeoid),
        eq(marketMetrics.datasetVintage, latestImport.vintage),
      ),
    )
    .innerJoin(
      areaRankings,
      and(
        eq(areas.geoid, areaRankings.areaGeoid),
        eq(areaRankings.datasetVintage, latestImport.vintage),
        eq(areaRankings.methodologyVersion, METHODOLOGY_VERSION),
      ),
    );

  const normalized = rows.map(
    (row) =>
      ({
        ...row,
        population60PlusPercent: Number(row.population60PlusPercent),
        population60PlusPercentMoe: Number(row.population60PlusPercentMoe),
        financialCapacityPercent: numberOrNull(row.financialCapacityPercent),
        financialCapacityMoe: numberOrNull(row.financialCapacityMoe),
        score: numberOrNull(row.score),
        sizePercentile: numberOrNull(row.sizePercentile),
        concentrationPercentile: numberOrNull(row.concentrationPercentile),
        financialCapacityPercentile: numberOrNull(
          row.financialCapacityPercentile,
        ),
      }) satisfies MarketArea,
  );

  return {
    metadata: {
      vintage: latestImport.vintage,
      period: `2020–${latestImport.vintage} ACS 5-year estimates`,
      methodologyVersion: METHODOLOGY_VERSION,
      source: "US Census Bureau American Community Survey",
      sourceUrl:
        latestImport.sourceUrls[0] ??
        "https://api.census.gov/data/2024/acs/acs5/subject.html",
      importedAt:
        latestImport.completedAt?.toISOString() ?? new Date().toISOString(),
      preview: false,
    },
    areas: normalized,
  };
}

export async function getMarketDataset(): Promise<MarketDataset> {
  return process.env.DATABASE_URL ? loadDatabaseDataset() : previewDataset;
}
