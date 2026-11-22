"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Database,
  Info,
  Search,
  ShieldCheck,
  Target,
  UsersRound,
} from "lucide-react";

import type {
  AreaLevel,
  AreaListResponse,
  MarketArea,
  MarketSummary,
} from "@/server/domain/types";

import { STATE_OPTIONS } from "../constants";
import { numberFormatter } from "../format";
import { AreaDetail } from "./area-detail";
import { RankingTable } from "./ranking-table";
import { SortMenu } from "./sort-menu";
import { TopChart } from "./top-chart";

interface DashboardProps {
  initialAreas: AreaListResponse;
  initialSummary: MarketSummary;
}

export function Dashboard({ initialAreas, initialSummary }: DashboardProps) {
  const [level, setLevel] = useState<AreaLevel>("state");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [state, setState] = useState("");
  const [sort, setSort] = useState("rank");
  const [page, setPage] = useState(1);
  const [areas, setAreas] = useState(initialAreas);
  const [summary, setSummary] = useState(initialSummary);
  const [selectedArea, setSelectedArea] = useState<MarketArea | null>(null);
  const [error, setError] = useState<string | null>(null);
  const censusDocumentationUrl = `https://api.census.gov/data/${areas.metadata.vintage}/acs/acs5/subject.html`;

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      level,
      sort,
      order: sort === "rank" || sort === "name" ? "asc" : "desc",
      page: String(page),
      pageSize: "25",
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (level === "county" && state) params.set("state", state);

    Promise.all([
      fetch(`/api/v1/areas?${params}`, { signal: controller.signal }).then(
        (response) => {
          if (!response.ok) throw new Error("Could not load rankings");
          return response.json() as Promise<AreaListResponse>;
        },
      ),
      fetch(`/api/v1/summary?level=${level}`, {
        signal: controller.signal,
      }).then((response) => {
        if (!response.ok) throw new Error("Could not load summary");
        return response.json() as Promise<MarketSummary>;
      }),
    ])
      .then(([nextAreas, nextSummary]) => {
        setError(null);
        setAreas(nextAreas);
        setSummary(nextSummary);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError")
          return;
        setError(reason instanceof Error ? reason.message : "Unexpected error");
      });

    return () => controller.abort();
  }, [debouncedSearch, level, page, sort, state]);

  const resultLabel = useMemo(() => {
    const noun = level === "state" ? "state-level areas" : "counties";
    return `${areas.pagination.total} ${noun}`;
  }, [areas.pagination.total, level]);

  function changeLevel(nextLevel: AreaLevel) {
    setLevel(nextLevel);
    setState("");
    setSearch("");
    setSort("rank");
    setPage(1);
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="MarketScope home">
          <span className="brand-mark">
            <Target aria-hidden="true" />
          </span>
          <span>
            <strong>Market</strong>Scope
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#rankings">Rankings</a>
          <Link href="/methodology">Methodology</Link>
          <a href="#sources">Data sources</a>
        </nav>
        <div className="data-badge">
          <span /> ACS {areas.metadata.vintage}
        </div>
      </header>

      {areas.metadata.preview && (
        <div className="preview-banner" role="status">
          <Info aria-hidden="true" size={17} />
          <strong>Development preview:</strong> illustrative records are active
          until the authenticated Census import is run.
        </div>
      )}

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow">
              US life insurance market intelligence
            </span>
            <h1>
              Find the markets where
              <br />
              <em>opportunity is strongest.</em>
            </h1>
            <p>
              Rank states and counties using a transparent blend of age 60+
              market size, concentration, and financial capacity.
            </p>
          </div>
          <div className="hero-method">
            <div className="hero-method-heading">
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Explainable by design</strong>
                <span>No black-box predictions</span>
              </div>
            </div>
            <div className="weight-row">
              <span>
                <b>50%</b> Market size
              </span>
              <span>
                <b>30%</b> Concentration
              </span>
              <span>
                <b>20%</b> Capacity
              </span>
            </div>
            <Link href="/methodology">See how scoring works</Link>
          </div>
        </section>

        <section className="content-shell" id="rankings">
          <div className="section-heading">
            <div>
              <span className="eyebrow">National opportunity index</span>
              <h2>Market rankings</h2>
              <p>Compare areas with sufficient data on one 0–100 score.</p>
            </div>
            <div
              className="level-toggle"
              role="group"
              aria-label="Geography level"
            >
              <button
                className={level === "state" ? "active" : ""}
                type="button"
                onClick={() => changeLevel("state")}
              >
                States
              </button>
              <button
                className={level === "county" ? "active" : ""}
                type="button"
                onClick={() => changeLevel("county")}
              >
                Counties
              </button>
            </div>
          </div>

          <div className="kpi-grid">
            <article>
              <span className="kpi-icon">
                <Database />
              </span>
              <div>
                <small>Areas ranked</small>
                <strong>
                  {summary.rankedAreaCount} / {summary.totalAreaCount}
                </strong>
                <p>
                  {summary.unrankedAreaCount === 0
                    ? "All available areas"
                    : `${summary.unrankedAreaCount} lack a required indicator`}
                </p>
              </div>
            </article>
            <article>
              <span className="kpi-icon">
                <UsersRound />
              </span>
              <div>
                <small>Population coverage</small>
                <strong>
                  {summary.targetPopulationCoveragePercent.toFixed(1)}%
                </strong>
                <p>
                  {numberFormatter.format(summary.rankedTargetPopulation)} of{" "}
                  {numberFormatter.format(summary.totalTargetPopulation)} age
                  60+
                </p>
              </div>
            </article>
            <article className="top-market-card">
              <span className="kpi-icon">
                <Target />
              </span>
              <div>
                <small>Top opportunity</small>
                <strong>{summary.topArea?.name ?? "—"}</strong>
                <p>
                  Score {summary.topArea?.score?.toFixed(1) ?? "—"} · Rank #1
                </p>
              </div>
            </article>
          </div>

          <div className="insight-grid">
            <article className="chart-card">
              <div className="card-heading">
                <div>
                  <small>Leading markets</small>
                  <h3>Top opportunity scores</h3>
                </div>
                <span>Score / 100</span>
              </div>
              <TopChart areas={summary.topTen} />
            </article>
            <article className="insight-card">
              <small>What drives the leaders?</small>
              <h3>Scale and focus work together.</h3>
              <p>
                The strongest markets are not simply the oldest. They pair a
                meaningful addressable population with above-average
                concentration and financial capacity.
              </p>
              <div className="insight-stat">
                <span>
                  {summary.topArea?.population60PlusPercent.toFixed(1) ?? "—"}%
                </span>
                <p>of residents in the leading market are age 60+</p>
              </div>
            </article>
          </div>

          <section className="ranking-card">
            <div className="filters">
              <label className="search-field">
                <Search aria-hidden="true" size={18} />
                <span className="sr-only">Search areas</span>
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder={`Search ${level === "state" ? "states" : "counties"}…`}
                />
              </label>
              {level === "county" && (
                <label className="select-field">
                  <span className="sr-only">Filter by state</span>
                  <select
                    value={state}
                    onChange={(event) => {
                      setState(event.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All states</option>
                    {STATE_OPTIONS.map(([fips, name]) => (
                      <option key={fips} value={fips}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <SortMenu
                value={sort}
                onChange={(nextSort) => {
                  setSort(nextSort);
                  setPage(1);
                }}
              />
              <span className="result-count">{resultLabel}</span>
            </div>
            {error ? (
              <div className="error-state">
                <strong>Rankings are temporarily unavailable.</strong>
                <span>{error}</span>
              </div>
            ) : (
              <RankingTable areas={areas.data} onSelect={setSelectedArea} />
            )}
            <div className="table-footer">
              <span>
                Showing {areas.data.length} of {areas.pagination.total}.
                National ranks stay fixed when filters change.
              </span>
              <nav className="pagination" aria-label="Rankings pages">
                <button
                  type="button"
                  disabled={areas.pagination.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {areas.pagination.page} of{" "}
                  {Math.max(areas.pagination.totalPages, 1)}
                </span>
                <button
                  type="button"
                  disabled={
                    areas.pagination.page >= areas.pagination.totalPages
                  }
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </nav>
            </div>
          </section>
        </section>

        <section className="source-section" id="sources">
          <div>
            <span className="eyebrow">Source &amp; confidence</span>
            <h2>Built on public evidence.</h2>
          </div>
          <p>
            Metrics come from the US Census Bureau’s {areas.metadata.period}.
            Every estimate retains its published margin of error, and missing
            financial data makes an area ineligible rather than silently
            assigning a value.
          </p>
          <a href={censusDocumentationUrl} target="_blank" rel="noreferrer">
            View Census documentation
          </a>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark">
            <Target aria-hidden="true" />
          </span>
          <span>
            <strong>Market</strong>Scope
          </span>
        </a>
        <p>Decision support, not an individual purchase prediction.</p>
        <span>Methodology v{areas.metadata.methodologyVersion}</span>
      </footer>
      {selectedArea && (
        <AreaDetail area={selectedArea} onClose={() => setSelectedArea(null)} />
      )}
    </div>
  );
}
