export const AREA_LEVELS = ["state", "county"] as const;

export type AreaLevel = (typeof AREA_LEVELS)[number];
export type DataQuality = "high" | "moderate" | "limited";

export interface RawAreaMetrics {
  geoid: string;
  level: AreaLevel;
  name: string;
  stateFips: string;
  stateName: string;
  population60Plus: number;
  population60PlusMoe: number;
  population60PlusPercent: number;
  population60PlusPercentMoe: number;
  financialCapacityPercent: number | null;
  financialCapacityMoe: number | null;
}

export interface MarketArea extends RawAreaMetrics {
  rank: number | null;
  score: number | null;
  sizePercentile: number | null;
  concentrationPercentile: number | null;
  financialCapacityPercentile: number | null;
  eligible: boolean;
  quality: DataQuality;
}

export interface DatasetMetadata {
  vintage: string;
  period: string;
  methodologyVersion: string;
  source: string;
  sourceUrl: string;
  importedAt: string;
  preview: boolean;
}

export interface MarketDataset {
  metadata: DatasetMetadata;
  areas: MarketArea[];
}

export interface AreaListResponse {
  data: MarketArea[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  metadata: DatasetMetadata;
}

export interface MarketSummary {
  areaCount: number;
  totalAreaCount: number;
  rankedAreaCount: number;
  unrankedAreaCount: number;
  totalTargetPopulation: number;
  rankedTargetPopulation: number;
  targetPopulationCoveragePercent: number;
  topArea: MarketArea | null;
  topTen: MarketArea[];
  metadata: DatasetMetadata;
}
