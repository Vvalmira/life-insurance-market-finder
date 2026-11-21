import { METHODOLOGY_VERSION } from "../src/server/domain/methodology";
import { calculateRankings } from "../src/server/domain/scoring";
import { fetchCensusMetrics } from "../src/server/imports/census/client";
import { persistCensusImport } from "../src/server/imports/census/persist";
import { validateCensusMetrics } from "../src/server/imports/census/validation";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

async function main() {
  const apiKey = process.env.CENSUS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CENSUS_API_KEY is required. Request a free key from api.census.gov/data/key_signup.html.",
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to persist an import");
  }

  process.stdout.write("Fetching 2024 ACS state and county metrics…\n");
  const metrics = await fetchCensusMetrics(apiKey);
  const validation = validateCensusMetrics(metrics);
  const ranked = calculateRankings(metrics);
  const importId = await persistCensusImport(ranked);

  process.stdout.write(
    [
      `Import ${importId} completed.`,
      `${validation.stateCount} state-level areas.`,
      `${validation.countyCount} counties and county equivalents.`,
      `Methodology ${METHODOLOGY_VERSION}.`,
      ...validation.warnings,
    ].join(" ") + "\n",
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Unknown import error"}\n`,
  );
  process.exitCode = 1;
});
