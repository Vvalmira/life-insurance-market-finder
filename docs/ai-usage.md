# AI usage disclosure

AI assistance was used for architecture discussion, implementation acceleration, test ideation, UI critique, and documentation drafting. All generated work was reviewed and remains explainable and editable by the candidate.

## Useful contributions

- comparing a modular Next.js deployment with a split frontend/backend architecture;
- proposing domain boundaries and edge cases for tied percentiles and missing values;
- accelerating repetitive typed API, schema, component, and documentation work;
- identifying accessibility and operational checks to include before submission.

## Errors and corrections

- AI initially assumed the Census API could be used anonymously for this workflow. A request to the official endpoint returned `Missing Key`; the importer now fails fast unless `CENSUS_API_KEY` is set.
- An initial Drizzle upsert mapped update values to the current table columns, which would have preserved stale values. Review corrected each update to use PostgreSQL `excluded` values.
- Broad technology suggestions included a separate API service and more infrastructure than this deadline justified. The final design is a simpler modular monolith.
- Preview values are illustrative, not claimed as official Census output. The app labels them prominently and production verification requires `preview: false`.

## Human verification

The candidate should be able to explain and change the scoring formula, data validation, repository boundary, API query validation, database schema, responsive UI, and deployment flow during the walkthrough. Before submission, rerun all quality checks and verify the official variable definitions and current deployment configuration.
