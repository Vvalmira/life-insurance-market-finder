# AMANET take-home: one-page write-up

## Data sources and why

MarketScope uses the US Census Bureau 2020–2024 American Community Survey 5-year subject tables. The 5-year release provides a consistent public dataset for every state and 3,100+ counties/county equivalents, unlike ACS 1-year data. I use S0101 for the number and share of residents age 60+ and S0102 for the share of the 60+ poverty-universe population at or above 150% of poverty. The latter is a transparent, imperfect proxy for financial capacity. I retain every published margin of error, record import provenance/checksums, and use no personal or contact data.

## How areas are scored and ranked

States and counties are scored in separate peer groups. Each raw indicator becomes an average-rank percentile from 0 to 100, preventing large numeric scales from dominating. The opportunity score is 50% age-60+ population, 30% age-60+ population share, and 20% financial capacity. Market size is most important because campaign reach matters; concentration rewards efficient targeting; capacity adds commercial context without overwhelming the demographic signal. Missing required data makes an area ineligible rather than imputing an arbitrary value. Scores are deterministic, filters do not recalculate national rank, and the interface exposes raw values, component percentiles, margins of error, and a quality flag.

## What I would build with another month

I would first validate weights against compliant historical campaign outcomes and add sensitivity analysis so users can see how robust rankings are to weight changes. Then I would add media-cost and carrier-availability data, year-over-year trends, a choropleth map, saved scenarios, CSV export, scheduled refreshes with alerts, and observability for ingestion/data drift. Before any individual-level use, I would establish privacy, legal, fairness, and model-risk controls. I would keep geographic aggregate recommendations separate from underwriting or individual eligibility.

## Where AI helped—and where it was wrong

AI accelerated option analysis, repository scaffolding, test-case brainstorming, UI iteration, and documentation structure. I treated it as a pair programmer, not a source of truth: I reviewed every line and verified the framework build, type checks, linting, scoring tests, API behavior, and official Census definitions. It initially suggested that anonymous Census API access might be enough and proposed an upsert that accidentally reused stored columns instead of incoming `excluded` values. Direct endpoint testing disproved the first assumption; code review found and corrected the second. These failures reinforced the need to validate external facts against primary sources and inspect generated persistence logic carefully.
