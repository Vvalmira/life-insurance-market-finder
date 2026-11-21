export const METHODOLOGY_VERSION = "1.0.0";

export const SCORE_WEIGHTS = {
  marketSize: 0.5,
  concentration: 0.3,
  financialCapacity: 0.2,
} as const;

export const INDICATORS = [
  {
    key: "marketSize",
    label: "Market size",
    description: "Estimated number of residents age 60 and over.",
    weight: SCORE_WEIGHTS.marketSize,
    sourceVariable: "S0101_C01_028E",
  },
  {
    key: "concentration",
    label: "Target concentration",
    description: "Share of residents who are age 60 and over.",
    weight: SCORE_WEIGHTS.concentration,
    sourceVariable: "S0101_C02_028E",
  },
  {
    key: "financialCapacity",
    label: "Financial capacity",
    description:
      "Share of the 60+ population at or above 150% of the poverty threshold.",
    weight: SCORE_WEIGHTS.financialCapacity,
    sourceVariable: "S0102_C02_089E",
  },
] as const;

export const SCORE_FORMULA =
  "50% market size + 30% target concentration + 20% financial capacity";
