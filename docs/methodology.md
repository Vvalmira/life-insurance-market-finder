# Ranking methodology

## Decision question

The score answers: **Which US geographies combine a large age-60+ audience, a strong local concentration of that audience, and evidence of financial capacity?** It is a marketing prioritization signal—not an individual purchase prediction, actuarial price, or eligibility decision.

## Indicators

| Component            | ACS variable     | Interpretation                                                                           | Weight |
| -------------------- | ---------------- | ---------------------------------------------------------------------------------------- | -----: |
| Market size          | `S0101_C01_028E` | Estimated residents age 60+                                                              |    50% |
| Target concentration | `S0101_C02_028E` | Percent of residents age 60+                                                             |    30% |
| Financial capacity   | `S0102_C02_089E` | Percent of the 60+ poverty-universe population at or above 150% of the poverty threshold |    20% |

Size receives the highest weight because addressable volume most directly affects campaign reach. Concentration rewards efficient geographic targeting. Financial capacity is a cautious public-data proxy for ability to sustain premiums, not a claim about any individual.

## Calculation

States are compared only with states and counties only with counties. For each component, values are converted to 0–100 average-rank percentiles. Ties receive the same percentile, so input order cannot affect the result.

```text
opportunity score =
  0.50 × size percentile
  + 0.30 × concentration percentile
  + 0.20 × financial-capacity percentile
```

Scores are rounded to one decimal. Ranking is descending by score, then by age-60+ population, then GEOID for deterministic output. Equal scores share a competition rank. Search and filters never recalculate national rank.

## Missing values and uncertainty

An area missing any required component is marked ineligible instead of receiving an invented value. Census estimates and their published margins of error are preserved. Data quality is based on the worst relative margin of error among the three indicators:

- high: at most 10%
- moderate: above 10% and at most 20%
- limited: above 20%, zero denominator, or missing uncertainty

The quality label does not alter the score; it tells users how cautiously to interpret it. This separation keeps the formula transparent.

## Interpretation and limitations

A high score means relative opportunity under this explicit model. It does not prove conversion or profitability. ACS data is lagged and sample-based, the financial-capacity measure is only a proxy, and county/state aggregates can hide local variation. Close scores should be considered directional.

A production model should be calibrated against compliant campaign outcomes and supplemented with media cost, carrier availability, competition, product fit, and state regulations. Any sensitive or individual-level data would require legal, privacy, fairness, and model-risk review.
