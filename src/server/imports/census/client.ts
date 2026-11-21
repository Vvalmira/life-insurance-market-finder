import { z } from "zod";

import type { AreaLevel, RawAreaMetrics } from "@/server/domain/types";

import {
  CENSUS_DATASET,
  CENSUS_FIELDS,
  CENSUS_SOURCE_URL,
  INCLUDED_STATE_FIPS,
} from "./constants";

const responseSchema = z.array(z.array(z.string()));

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function buildUrl(level: AreaLevel, apiKey: string): string {
  const url = new URL(CENSUS_SOURCE_URL);
  url.searchParams.set("get", CENSUS_FIELDS.join(","));
  url.searchParams.set("for", level === "state" ? "state:*" : "county:*");
  if (level === "county") url.searchParams.set("in", "state:*");
  url.searchParams.set("key", apiKey);
  return url.toString();
}

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  const [header, ...body] = rows;
  if (!header) throw new Error("Census response did not contain a header row");

  return body.map((row) =>
    Object.fromEntries(header.map((field, index) => [field, row[index] ?? ""])),
  );
}

function normalizeRow(
  row: Record<string, string>,
  level: AreaLevel,
  stateNames: Map<string, string>,
): RawAreaMetrics | null {
  const stateFips = row.state ?? "";
  if (!INCLUDED_STATE_FIPS.has(stateFips)) return null;

  const countyFips = row.county ?? "";
  const geoid = level === "state" ? stateFips : `${stateFips}${countyFips}`;
  const rawName = row.NAME ?? "";
  const name =
    level === "county" ? (rawName.split(",")[0]?.trim() ?? rawName) : rawName;
  const stateName =
    level === "state"
      ? rawName
      : (stateNames.get(stateFips) ?? "Unknown state");

  const population60Plus = parseNumber(row.S0101_C01_028E ?? "");
  const population60PlusMoe = parseNumber(row.S0101_C01_028M ?? "");
  const population60PlusPercent = parseNumber(row.S0101_C02_028E ?? "");
  const population60PlusPercentMoe = parseNumber(row.S0101_C02_028M ?? "");

  if (
    population60Plus === null ||
    population60PlusMoe === null ||
    population60PlusPercent === null ||
    population60PlusPercentMoe === null
  ) {
    return null;
  }

  return {
    geoid,
    level,
    name,
    stateFips,
    stateName,
    population60Plus,
    population60PlusMoe,
    population60PlusPercent,
    population60PlusPercentMoe,
    financialCapacityPercent: parseNumber(row.S0102_C02_089E ?? ""),
    financialCapacityMoe: parseNumber(row.S0102_C02_089M ?? ""),
  };
}

async function fetchRows(
  level: AreaLevel,
  apiKey: string,
): Promise<string[][]> {
  const response = await fetch(buildUrl(level, apiKey), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(
      `Census ${CENSUS_DATASET} request failed with ${response.status}`,
    );
  }

  return responseSchema.parse(await response.json());
}

export async function fetchCensusMetrics(
  apiKey: string,
): Promise<RawAreaMetrics[]> {
  const stateObjects = rowsToObjects(await fetchRows("state", apiKey));
  const stateNames = new Map(
    stateObjects
      .filter((row) => INCLUDED_STATE_FIPS.has(row.state ?? ""))
      .map((row) => [row.state ?? "", row.NAME ?? ""]),
  );
  const countyObjects = rowsToObjects(await fetchRows("county", apiKey));

  return [
    ...stateObjects.map((row) => normalizeRow(row, "state", stateNames)),
    ...countyObjects.map((row) => normalizeRow(row, "county", stateNames)),
  ].filter((row): row is RawAreaMetrics => row !== null);
}
