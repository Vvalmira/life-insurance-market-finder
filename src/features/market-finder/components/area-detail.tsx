"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { MarketArea } from "@/server/domain/types";

import { formatPercent, formatScore, fullNumberFormatter } from "../format";
import { ScoreRing } from "./score-ring";

interface AreaDetailProps {
  area: MarketArea;
  onClose: () => void;
}

export function AreaDetail({ area, onClose }: AreaDetailProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const components = [
    {
      label: "Market size",
      value: area.sizePercentile,
      weight: "50%",
      raw: fullNumberFormatter.format(area.population60Plus),
    },
    {
      label: "Target concentration",
      value: area.concentrationPercentile,
      weight: "30%",
      raw: formatPercent(area.population60PlusPercent),
    },
    {
      label: "Financial capacity",
      value: area.financialCapacityPercentile,
      weight: "20%",
      raw: formatPercent(area.financialCapacityPercent),
    },
  ];

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Close details"
        >
          <X aria-hidden="true" />
        </button>
        <div className="detail-heading">
          <ScoreRing score={area.score} size="large" />
          <div>
            <span className="eyebrow">National rank #{area.rank ?? "—"}</span>
            <h2 id="detail-title">{area.name}</h2>
            {area.level === "county" && <p>{area.stateName}</p>}
          </div>
        </div>

        <p className="detail-summary">
          {area.name} scores <strong>{formatScore(area.score)}</strong> based on
          its target-market size, concentration, and financial-capacity profile.
        </p>

        <div className="component-list">
          {components.map((component) => (
            <div className="component-row" key={component.label}>
              <div className="component-label">
                <strong>{component.label}</strong>
                <span>
                  {component.weight} of score · {component.raw}
                </span>
              </div>
              <div className="component-meter">
                <span style={{ width: `${component.value ?? 0}%` }} />
              </div>
              <b>
                {component.value?.toFixed(0) ?? "—"}
                <small>th</small>
              </b>
            </div>
          ))}
        </div>

        <div className="detail-data-grid">
          <div>
            <span>Age 60+ estimate</span>
            <strong>{fullNumberFormatter.format(area.population60Plus)}</strong>
            <small>
              ± {fullNumberFormatter.format(area.population60PlusMoe)}
            </small>
          </div>
          <div>
            <span>Age 60+ share</span>
            <strong>{formatPercent(area.population60PlusPercent)}</strong>
            <small>± {formatPercent(area.population60PlusPercentMoe)}</small>
          </div>
          <div>
            <span>Financial capacity</span>
            <strong>{formatPercent(area.financialCapacityPercent)}</strong>
            <small>± {formatPercent(area.financialCapacityMoe)}</small>
          </div>
          <div>
            <span>Data quality</span>
            <strong className={`quality quality--${area.quality}`}>
              {area.quality}
            </strong>
            <small>Based on relative MOE</small>
          </div>
        </div>

        <p className="detail-note">
          ACS estimates are sample-based. Close scores should be treated as
          directional rather than exact forecasts.
        </p>
      </aside>
    </div>
  );
}
