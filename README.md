# MarketScope

MarketScope is a full-stack decision-support dashboard that ranks US states and counties for marketing life insurance to people age 60 and over. It uses public US Census Bureau data and a versioned, explainable scoring model—never personal contact information.

The application currently starts with a clearly labelled illustrative preview when no database is configured. A submission or production deployment must run the authenticated Census import so all 50 states, Washington DC, and 3,100+ counties are represented.

## What the application does

- Ranks states and counties independently on a 0–100 opportunity score.
- Supports search, state filtering, sorting, and pagination without changing national rank.
- Explains each area's component percentiles, source values, margins of error, and data-quality flag.
- Exposes versioned JSON endpoints for the dashboard and future consumers.
- Imports, validates, scores, and persists a complete Census dataset idempotently.
- Provides responsive layouts, keyboard-accessible controls, and reduced-motion support.

## Stack and architecture

- **Web and API:** Next.js App Router, React, TypeScript
- **Styling and UI:** Tailwind CSS foundation, application CSS, Lucide icons, Recharts
- **Database:** PostgreSQL on Neon
- **ORM and migrations:** Drizzle ORM and Drizzle Kit
- **Validation:** Zod at HTTP and Census-data boundaries
- **Tests:** Vitest, Testing Library, Playwright
- **Deployment:** Vercel (application) + Neon (database)

This is intentionally one deployable application. Route handlers are the API boundary, pure domain modules contain scoring, repositories isolate persistence, and an offline import command performs data ingestion. A separate API service or job platform would add operational cost without improving this seven-day deliverable.

See [architecture](docs/architecture.md), [methodology](docs/methodology.md), and [data sources](docs/data-sources.md) for the detailed design.

## Local setup

Prerequisites: Node.js 20.12+ and pnpm 10.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>. Without `DATABASE_URL`, the app intentionally uses the preview dataset and displays a warning banner.

## Load the real dataset

1. Create a Neon PostgreSQL database.
2. Request a key from the [Census API key page](https://api.census.gov/data/key_signup.html).
3. Set `DATABASE_URL` and `CENSUS_API_KEY` in `.env.local`.
4. Generate/apply the committed migration and import the data:

```bash
pnpm db:migrate
pnpm data:import
pnpm data:validate
```

The importer retrieves the 2020–2024 ACS 5-year subject tables, validates national coverage and unique GEOIDs, calculates rankings separately for states and counties, and upserts records in batches. Import metadata, checksum, status, counts, and failures are recorded in `data_imports`.

## Commands

```bash
pnpm dev           # local development server
pnpm build         # production build
pnpm lint          # ESLint
pnpm typecheck     # TypeScript without emit
pnpm format:check  # Prettier verification
pnpm test:run      # unit tests once
pnpm test:e2e      # Playwright end-to-end tests
pnpm db:generate   # generate a migration after schema changes
pnpm db:migrate    # apply migrations
pnpm data:import   # retrieve, validate, score, and persist ACS data
pnpm data:validate # verify the persisted dataset
```

## API

| Endpoint                          | Purpose                                                                  |
| --------------------------------- | ------------------------------------------------------------------------ |
| `GET /api/health`                 | Deployment, dataset, and preview diagnostics                             |
| `GET /api/v1/areas`               | Paginated rankings with level, state, search, sort, and order parameters |
| `GET /api/v1/areas/:geoid`        | One area and its score explanation                                       |
| `GET /api/v1/summary?level=state` | KPI totals and top ten areas                                             |
| `GET /api/v1/metadata`            | Dataset source, vintage, methodology version, and preview status         |

Invalid inputs receive a structured `400` response; unknown GEOIDs receive `404`. Public read endpoints use CDN-friendly cache headers.

## Deployment

1. Push the repository to GitHub and import it into Vercel.
2. Add `DATABASE_URL`, `CENSUS_API_KEY`, `NEXT_PUBLIC_APP_URL`, and `APP_COMMIT_SHA` to Vercel.
3. Apply migrations and run the import from a trusted local or CI environment before directing traffic to the deployment.
4. Deploy from `main`; Vercel runs `pnpm build` and creates preview deployments for pull requests.
5. Confirm `/api/health` returns `preview: false`, exercise state and county filters, and record the live URL in [the submission checklist](docs/submission-checklist.md).

Do not run the annual import inside a request handler. It is a controlled maintenance command, which avoids serverless time limits and partial user-facing updates.

## Submission materials

- [One-page assignment write-up](docs/assignment-write-up.md)
- [AI usage disclosure](docs/ai-usage.md)
- [Submission and demo checklist](docs/submission-checklist.md)

## Scope and limitations

MarketScope prioritizes geographic opportunity, not individual propensity or policy eligibility. ACS estimates are sample-based and lag current conditions; close scores should be treated as directional. The score does not include carrier licensing, acquisition cost, competition, health status, conversion history, or product fit. Those require company data and governance that are outside this public-data assignment.
