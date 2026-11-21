import { createHash, randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";

import { METHODOLOGY_VERSION } from "@/server/domain/methodology";
import type { MarketArea } from "@/server/domain/types";

import { getDatabase } from "@/server/db/client";
import {
  areaRankings,
  areas,
  dataImports,
  marketMetrics,
} from "@/server/db/schema";

import { CENSUS_PERIOD, CENSUS_SOURCE_URL, CENSUS_VINTAGE } from "./constants";

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function chunks<T>(values: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }
  return output;
}

export async function persistCensusImport(
  ranked: MarketArea[],
): Promise<string> {
  const db = getDatabase();
  const importId = randomUUID();
  const checksum = createHash("sha256")
    .update(JSON.stringify(ranked))
    .digest("hex");

  await db.insert(dataImports).values({
    id: importId,
    provider: "US Census Bureau",
    dataset: CENSUS_PERIOD,
    vintage: CENSUS_VINTAGE,
    status: "running",
    sourceUrls: [CENSUS_SOURCE_URL],
    checksum,
  });

  try {
    for (const batch of chunks(ranked, 250)) {
      await db
        .insert(areas)
        .values(
          batch.map((area) => ({
            geoid: area.geoid,
            level: area.level,
            name: area.name,
            slug: `${slugify(area.name)}-${area.geoid}`,
            stateFips: area.stateFips,
            stateName: area.stateName,
            parentGeoid: area.level === "county" ? area.stateFips : null,
          })),
        )
        .onConflictDoUpdate({
          target: areas.geoid,
          set: {
            level: sql`excluded.level`,
            name: sql`excluded.name`,
            slug: sql`excluded.slug`,
            stateFips: sql`excluded.state_fips`,
            stateName: sql`excluded.state_name`,
            parentGeoid: sql`excluded.parent_geoid`,
          },
        });

      await db
        .insert(marketMetrics)
        .values(
          batch.map((area) => ({
            areaGeoid: area.geoid,
            datasetVintage: CENSUS_VINTAGE,
            population60Plus: area.population60Plus,
            population60PlusMoe: area.population60PlusMoe,
            population60PlusPercent: String(area.population60PlusPercent),
            population60PlusPercentMoe: String(area.population60PlusPercentMoe),
            financialCapacityPercent:
              area.financialCapacityPercent === null
                ? null
                : String(area.financialCapacityPercent),
            financialCapacityMoe:
              area.financialCapacityMoe === null
                ? null
                : String(area.financialCapacityMoe),
            sourceTable: "S0101,S0102",
          })),
        )
        .onConflictDoUpdate({
          target: [marketMetrics.areaGeoid, marketMetrics.datasetVintage],
          set: {
            population60Plus: sql`excluded.population_60_plus`,
            population60PlusMoe: sql`excluded.population_60_plus_moe`,
            population60PlusPercent: sql`excluded.population_60_plus_percent`,
            population60PlusPercentMoe: sql`excluded.population_60_plus_percent_moe`,
            financialCapacityPercent: sql`excluded.financial_capacity_percent`,
            financialCapacityMoe: sql`excluded.financial_capacity_moe`,
            sourceTable: sql`excluded.source_table`,
          },
        });

      await db
        .insert(areaRankings)
        .values(
          batch.map((area) => ({
            areaGeoid: area.geoid,
            datasetVintage: CENSUS_VINTAGE,
            methodologyVersion: METHODOLOGY_VERSION,
            sizePercentile:
              area.sizePercentile === null ? null : String(area.sizePercentile),
            concentrationPercentile:
              area.concentrationPercentile === null
                ? null
                : String(area.concentrationPercentile),
            financialCapacityPercentile:
              area.financialCapacityPercentile === null
                ? null
                : String(area.financialCapacityPercentile),
            opportunityScore: area.score === null ? null : String(area.score),
            nationalRank: area.rank,
            eligible: area.eligible,
            quality: area.quality,
          })),
        )
        .onConflictDoUpdate({
          target: [
            areaRankings.areaGeoid,
            areaRankings.datasetVintage,
            areaRankings.methodologyVersion,
          ],
          set: {
            sizePercentile: sql`excluded.size_percentile`,
            concentrationPercentile: sql`excluded.concentration_percentile`,
            financialCapacityPercentile: sql`excluded.financial_capacity_percentile`,
            opportunityScore: sql`excluded.opportunity_score`,
            nationalRank: sql`excluded.national_rank`,
            eligible: sql`excluded.eligible`,
            quality: sql`excluded.quality`,
            calculatedAt: sql`now()`,
          },
        });
    }

    await db
      .update(dataImports)
      .set({
        status: "completed",
        rowCounts: {
          state: ranked.filter((area) => area.level === "state").length,
          county: ranked.filter((area) => area.level === "county").length,
        },
        completedAt: new Date(),
      })
      .where(eq(dataImports.id, importId));

    return importId;
  } catch (error) {
    await db
      .update(dataImports)
      .set({
        status: "failed",
        completedAt: new Date(),
        errorSummary: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(dataImports.id, importId));
    throw error;
  }
}
