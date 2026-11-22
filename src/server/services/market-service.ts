import type {
  AreaLevel,
  AreaListResponse,
  MarketArea,
  MarketDataset,
  MarketSummary,
} from "@/server/domain/types";

import { getMarketDataset } from "../repositories/market-repository";

export type SortField =
  | "rank"
  | "score"
  | "population"
  | "concentration"
  | "financialCapacity"
  | "name";

export interface ListAreasInput {
  level: AreaLevel;
  state?: string;
  search?: string;
  sort: SortField;
  order: "asc" | "desc";
  page: number;
  pageSize: number;
}

function sortValue(area: MarketArea, field: SortField): number | string {
  switch (field) {
    case "rank":
      return area.rank ?? Number.MAX_SAFE_INTEGER;
    case "score":
      return area.score ?? -1;
    case "population":
      return area.population60Plus;
    case "concentration":
      return area.population60PlusPercent;
    case "financialCapacity":
      return area.financialCapacityPercent ?? -1;
    case "name":
      return `${area.name} ${area.stateName}`;
  }
}

export async function listAreas(
  input: ListAreasInput,
): Promise<AreaListResponse> {
  const dataset = await getMarketDataset();
  const normalizedSearch = input.search?.trim().toLocaleLowerCase();

  const filtered = dataset.areas.filter(
    (area) =>
      area.level === input.level &&
      (!input.state || area.stateFips === input.state) &&
      (!normalizedSearch ||
        `${area.name} ${area.stateName}`
          .toLocaleLowerCase()
          .includes(normalizedSearch)),
  );

  filtered.sort((a, b) => {
    const left = sortValue(a, input.sort);
    const right = sortValue(b, input.sort);
    const comparison =
      typeof left === "string" && typeof right === "string"
        ? left.localeCompare(right)
        : Number(left) - Number(right);
    return input.order === "asc" ? comparison : -comparison;
  });

  const total = filtered.length;
  const start = (input.page - 1) * input.pageSize;

  return {
    data: filtered.slice(start, start + input.pageSize),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.ceil(total / input.pageSize),
    },
    metadata: dataset.metadata,
  };
}

export async function getArea(geoid: string): Promise<MarketArea | null> {
  const dataset = await getMarketDataset();
  return dataset.areas.find((area) => area.geoid === geoid) ?? null;
}

export function summarizeMarketDataset(
  dataset: MarketDataset,
  level: AreaLevel,
): MarketSummary {
  const allAreas = dataset.areas.filter((area) => area.level === level);
  const rankedAreas = allAreas
    .filter((area) => area.eligible)
    .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));

  const totalTargetPopulation = allAreas.reduce(
    (total, area) => total + area.population60Plus,
    0,
  );
  const rankedTargetPopulation = rankedAreas.reduce(
    (total, area) => total + area.population60Plus,
    0,
  );
  const targetPopulationCoveragePercent =
    totalTargetPopulation === 0
      ? 0
      : (rankedTargetPopulation / totalTargetPopulation) * 100;

  return {
    // Retained for API compatibility; rankedAreaCount is the clearer name.
    areaCount: rankedAreas.length,
    totalAreaCount: allAreas.length,
    rankedAreaCount: rankedAreas.length,
    unrankedAreaCount: allAreas.length - rankedAreas.length,
    totalTargetPopulation,
    rankedTargetPopulation,
    targetPopulationCoveragePercent,
    topArea: rankedAreas[0] ?? null,
    topTen: rankedAreas.slice(0, 10),
    metadata: dataset.metadata,
  };
}

export async function getSummary(level: AreaLevel): Promise<MarketSummary> {
  const dataset = await getMarketDataset();
  return summarizeMarketDataset(dataset, level);
}
