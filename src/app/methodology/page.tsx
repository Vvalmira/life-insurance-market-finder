import Link from "next/link";
import {
  ArrowLeft,
  Database,
  EqualApproximately,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { INDICATORS, SCORE_FORMULA } from "@/server/domain/methodology";

export default function MethodologyPage() {
  return (
    <main className="methodology-page">
      <div className="methodology-shell">
        <Link className="back-link" href="/">
          <ArrowLeft aria-hidden="true" size={18} /> Back to rankings
        </Link>

        <div className="methodology-hero">
          <span className="eyebrow">Transparent by design</span>
          <h1>How the opportunity score works</h1>
          <p>
            The score ranks geographic market opportunity. It is not a
            prediction that an individual will purchase life insurance.
          </p>
        </div>

        <section className="methodology-grid" aria-label="Score components">
          {INDICATORS.map((indicator, index) => {
            const Icon = [Database, Scale, ShieldCheck][index] ?? Database;
            return (
              <article className="method-card" key={indicator.key}>
                <div className="method-icon">
                  <Icon aria-hidden="true" size={20} />
                </div>
                <strong>{Math.round(indicator.weight * 100)}%</strong>
                <h2>{indicator.label}</h2>
                <p>{indicator.description}</p>
                <code>{indicator.sourceVariable}</code>
              </article>
            );
          })}
        </section>

        <section className="methodology-copy">
          <div>
            <span className="eyebrow">The calculation</span>
            <h2>{SCORE_FORMULA}</h2>
          </div>
          <div className="copy-columns">
            <article>
              <EqualApproximately aria-hidden="true" />
              <h3>Comparable percentiles</h3>
              <p>
                Each raw indicator becomes a percentile from 0 to 100. States
                are compared with state-level areas; counties are compared
                nationally. County filters never recalculate the national rank.
              </p>
            </article>
            <article>
              <ShieldCheck aria-hidden="true" />
              <h3>Uncertainty remains visible</h3>
              <p>
                Census margins of error are retained and shown with every
                metric. Near-tied scores should be treated as directional
                evidence, not a precise forecast.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
