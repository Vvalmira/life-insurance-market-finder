# MarketScope

MarketScope is a data-driven decision-support dashboard for comparing US states and counties as potential life-insurance marketing areas for adults age 60 and over. It combines public US Census Bureau data with a transparent scoring model and an interactive web interface.

## Product overview

- Compare state- and county-level market opportunities on a 0–100 score.
- Search, filter, sort, and paginate without changing the national ranking.
- Inspect the three score components, source estimates, and Census margins of error.
- Distinguish ranked areas from areas that lack a required source indicator.
- Access the same dataset through versioned JSON endpoints.

## Data and methodology

The application uses the US Census Bureau **2020–2024 American Community Survey 5-year Subject Tables**. This release was selected because it provides consistent coverage for every state and more than 3,100 counties and county equivalents.

| Component                                                                | ACS variable     | Weight |
| ------------------------------------------------------------------------ | ---------------- | -----: |
| Residents age 60+                                                        | `S0101_C01_028E` |    50% |
| Share of residents age 60+                                               | `S0101_C02_028E` |    30% |
| Share of the 60+ poverty-universe population at or above 150% of poverty | `S0102_C02_089E` |    20% |

Each indicator is converted to an average-rank percentile from 0 to 100. States are compared only with states, and counties only with counties. The final score is:

```text
Opportunity score =
  0.50 × market-size percentile
  + 0.30 × concentration percentile
  + 0.20 × financial-capacity percentile
```

Missing required values make an area ineligible rather than assigning an artificial value. Rankings remain deterministic through explicit tie handling, and filters never recalculate the national rank.

See [data sources](docs/data-sources.md), [ranking methodology](docs/methodology.md), and [architecture](docs/architecture.md) for implementation details.

## Technology

- **Application:** Next.js App Router, React, TypeScript
- **Interface:** Tailwind CSS foundation, application CSS, Lucide icons, Recharts
- **Database:** PostgreSQL on Neon
- **Data access:** Drizzle ORM and Drizzle Kit
- **Validation:** Zod
- **Testing:** Vitest, Testing Library, Playwright

The project is implemented as a modular monolith. Route handlers expose the API, domain modules own the scoring rules, repositories isolate persistence, and a controlled import command retrieves and validates Census data before storing it.

## Local development

Prerequisites: Node.js 20.12+ and pnpm 10.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>. Without a configured database, the application displays a clearly labelled preview dataset.

## Import the Census dataset

Set `DATABASE_URL` and `CENSUS_API_KEY` in `.env.local`, then run:

```bash
pnpm db:migrate
pnpm data:import
pnpm data:validate
```

The import validates geographic coverage and unique GEOIDs, converts Census missing-value sentinels to `null`, computes state and county rankings independently, and records import provenance and status.

## Quality checks

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:run
pnpm test:e2e
pnpm build
```

## API

| Endpoint                          | Purpose                                 |
| --------------------------------- | --------------------------------------- |
| `GET /api/health`                 | Application and dataset status          |
| `GET /api/v1/areas`               | Filtered and paginated rankings         |
| `GET /api/v1/areas/:geoid`        | Area details and score explanation      |
| `GET /api/v1/summary?level=state` | Summary metrics and leading areas       |
| `GET /api/v1/metadata`            | Source vintage and methodology metadata |
