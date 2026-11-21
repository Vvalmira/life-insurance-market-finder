# Data sources and processing

## Selected source

The baseline uses the US Census Bureau **2020–2024 American Community Survey 5-year subject tables** through the public Census Data API.

- Dataset documentation: <https://api.census.gov/data/2024/acs/acs5/subject.html>
- Variable groups: <https://api.census.gov/data/2024/acs/acs5/subject/groups.html>
- API key request: <https://api.census.gov/data/key_signup.html>

The 5-year release is selected because it provides consistent state and county coverage. One-year ACS releases do not cover every county. The source is public, authoritative, reproducible, and includes margins of error.

## Retrieval

The importer requests `NAME`, the three estimates, and their matching margin-of-error fields for `state:*` and `county:*`. It includes the 50 states and Washington DC and excludes territories so state and county comparisons use a consistent US market scope.

As of this implementation, the Census endpoint requires an API key. The key is provided through `CENSUS_API_KEY`; it is never committed or exposed to browser code.

## Validation rules

Before persistence, the pipeline checks:

- exactly 51 state-level areas;
- at least 3,100 counties/county equivalents;
- unique GEOIDs across the normalized dataset;
- numeric estimates are finite and non-negative;
- sentinel/missing values become `null`, not zero;
- missing financial capacity is reported and makes the area ineligible.

The database stores the source vintage and table, estimates, margins of error, source URLs, row counts, checksum, completion status, and methodology version.

## Update policy

Run the controlled import after a new county-complete ACS 5-year vintage is released. Review variable definitions before changing `CENSUS_VINTAGE`; Census group structures can change. Apply the migration, import, run `pnpm data:validate`, inspect score distribution/top markets, and only then deploy. The app selects the latest **completed** import, so failed work does not become public.

## Rejected baseline sources

- Individual lead/contact data: prohibited by the assignment and unnecessary.
- Commercial market datasets: not reproducible or openly accessible.
- ACS 1-year estimates: incomplete county coverage.
- Live Census queries on every page view: slower, rate-limited, and not reproducible.
- Health indicators in the first version: potentially relevant, but they add multi-source joins and a more contestable interpretation within a seven-day deadline.
