import { ChevronRight } from "lucide-react";

import type { MarketArea } from "@/server/domain/types";

import { formatPercent, fullNumberFormatter } from "../format";
import { ScoreRing } from "./score-ring";

export function RankingTable({
  areas,
  onSelect,
}: {
  areas: MarketArea[];
  onSelect: (area: MarketArea) => void;
}) {
  if (areas.length === 0) {
    return (
      <div className="empty-state">
        <h3>No areas found</h3>
        <p>Try a broader search or remove the state filter.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="ranking-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Area</th>
            <th>Opportunity</th>
            <th>Residents 60+</th>
            <th>60+ share</th>
            <th>Financial capacity</th>
            <th>Quality</th>
            <th>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area.geoid}>
              <td>
                <span className="rank-number">{area.rank ?? "—"}</span>
              </td>
              <td>
                <button
                  className="area-name"
                  type="button"
                  onClick={() => onSelect(area)}
                >
                  <strong>{area.name}</strong>
                  {area.level === "county" && <span>{area.stateName}</span>}
                </button>
              </td>
              <td>
                <ScoreRing score={area.score} />
              </td>
              <td>{fullNumberFormatter.format(area.population60Plus)}</td>
              <td>{formatPercent(area.population60PlusPercent)}</td>
              <td>{formatPercent(area.financialCapacityPercent)}</td>
              <td>
                <span className={`quality quality--${area.quality}`}>
                  {area.quality}
                </span>
              </td>
              <td>
                <button
                  className="row-action"
                  type="button"
                  onClick={() => onSelect(area)}
                  aria-label={`View ${area.name} details`}
                >
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
