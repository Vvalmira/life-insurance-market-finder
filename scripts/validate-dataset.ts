import { getMarketDataset } from "../src/server/repositories/market-repository";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required; preview data cannot pass production validation",
    );
  }

  const dataset = await getMarketDataset();
  const stateAreas = dataset.areas.filter((area) => area.level === "state");
  const countyAreas = dataset.areas.filter((area) => area.level === "county");
  const states = stateAreas.length;
  const counties = countyAreas.length;
  const rankedStates = stateAreas.filter((area) => area.eligible);
  const rankedCounties = countyAreas.filter((area) => area.eligible);
  const unrankedCounties = counties - rankedCounties.length;
  const invalidScores = dataset.areas.filter(
    (area) => area.score !== null && (area.score < 0 || area.score > 100),
  );

  if (invalidScores.length > 0) {
    throw new Error(
      `${invalidScores.length} scores are outside the 0–100 range`,
    );
  }

  if (dataset.metadata.preview) {
    throw new Error("Preview data cannot pass production validation");
  }
  if (states !== 51) {
    throw new Error(`Expected 51 state-level areas; received ${states}`);
  }
  if (counties < 3_100) {
    throw new Error(`Expected at least 3,100 counties; received ${counties}`);
  }
  if (rankedStates.length !== states) {
    throw new Error(
      `Expected all ${states} state-level areas to be ranked; received ${rankedStates.length}`,
    );
  }

  for (const [label, areas] of [
    ["state", rankedStates],
    ["county", rankedCounties],
  ] as const) {
    const hasIncompleteScore = areas.some(
      (area) =>
        area.rank === null ||
        area.score === null ||
        area.sizePercentile === null ||
        area.concentrationPercentile === null ||
        area.financialCapacityPercentile === null,
    );
    const orderedAreas = [...areas].sort(
      (left, right) =>
        right.score! - left.score! ||
        right.population60Plus - left.population60Plus ||
        left.geoid.localeCompare(right.geoid),
    );
    let previousScore: number | null = null;
    let previousRank = 0;
    const ranksFollowCompetitionRules = orderedAreas.every((area, index) => {
      const expectedRank =
        area.score === previousScore ? previousRank : index + 1;
      const rankIsValid = area.rank === expectedRank;
      previousScore = area.score;
      previousRank = expectedRank;
      return rankIsValid;
    });

    if (!ranksFollowCompetitionRules || hasIncompleteScore) {
      throw new Error(`${label} rankings are incomplete or inconsistent`);
    }
  }

  const invalidIneligibleAreas = dataset.areas.filter(
    (area) => !area.eligible && (area.rank !== null || area.score !== null),
  );
  if (invalidIneligibleAreas.length > 0) {
    throw new Error(
      `${invalidIneligibleAreas.length} ineligible areas unexpectedly have a score or rank`,
    );
  }

  const totalCountyTargetPopulation = countyAreas.reduce(
    (total, area) => total + area.population60Plus,
    0,
  );
  const rankedCountyTargetPopulation = rankedCounties.reduce(
    (total, area) => total + area.population60Plus,
    0,
  );
  const countyPopulationCoverage =
    totalCountyTargetPopulation === 0
      ? 0
      : (rankedCountyTargetPopulation / totalCountyTargetPopulation) * 100;

  if (countyPopulationCoverage < 90) {
    throw new Error(
      `Ranked counties cover only ${countyPopulationCoverage.toFixed(1)}% of the age 60+ population; expected at least 90%`,
    );
  }

  process.stdout.write(
    `Dataset ${dataset.metadata.period}: ${rankedStates.length}/${states} states ranked; ${rankedCounties.length}/${counties} counties ranked; ${unrankedCounties} counties unranked; ${countyPopulationCoverage.toFixed(1)}% of the county age 60+ population covered; preview=${dataset.metadata.preview}.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Unknown validation error"}\n`,
  );
  process.exitCode = 1;
});
