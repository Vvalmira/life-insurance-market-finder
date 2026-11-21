# Submission and demo checklist

## Required before submitting

- [ ] Set `DATABASE_URL` and `CENSUS_API_KEY` locally.
- [ ] Run `pnpm db:migrate`, `pnpm data:import`, and `pnpm data:validate`.
- [ ] Verify `/api/health` reports `preview: false` and the expected ACS vintage.
- [ ] Run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm test:e2e`, and `pnpm build`.
- [ ] Deploy to Vercel and verify the public URL on desktop and mobile.
- [ ] Add the public URL, repository URL, and demo-video URL below.
- [ ] Review the one-page write-up and AI disclosure for accuracy.
- [ ] Confirm the repository contains meaningful, non-secret commit history.

## Submission links

- Live application: _add after deployment_
- Git repository: _add after pushing_
- Demo video (maximum five minutes): _add after recording_

## Five-minute demo script

1. **0:00–0:35 — Problem and outcome:** explain the audience and the state/county decision.
2. **0:35–1:30 — Dashboard:** show KPIs, leading-market chart, state/county switch, filter, sort, and pagination.
3. **1:30–2:15 — Explainability:** open a market, walk through score components, margins of error, and quality.
4. **2:15–3:10 — Methodology:** explain peer groups, percentile normalization, weights, ties, and limitations.
5. **3:10–4:05 — Architecture and data:** show module boundaries, API validation, import audit, and latest-completed dataset rule.
6. **4:05–4:40 — Quality:** show unit/integration/browser checks and CI.
7. **4:40–5:00 — Next month:** calibration, sensitivity analysis, media cost, trends, map, and monitoring.

## Walkthrough preparation

Practice one small change end to end—for example changing a weight, adding a table column, or adding an API sort option. Explain which tests should change and why ranks must be recalculated when methodology changes.
