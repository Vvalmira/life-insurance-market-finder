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
  const states = dataset.areas.filter((area) => area.level === "state").length;
  const counties = dataset.areas.filter(
    (area) => area.level === "county",
  ).length;
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

  process.stdout.write(
    `Dataset ${dataset.metadata.period}: ${states} states, ${counties} counties, preview=${dataset.metadata.preview}.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Unknown validation error"}\n`,
  );
  process.exitCode = 1;
});
