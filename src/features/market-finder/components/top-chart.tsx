"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MarketArea } from "@/server/domain/types";

export function TopChart({ areas }: { areas: MarketArea[] }) {
  const data = areas.slice(0, 7).map((area) => ({
    name: area.name.replace(" County", ""),
    score: area.score,
  }));

  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label="Opportunity scores for the seven highest-ranked areas"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, bottom: 0, left: 8 }}
        >
          <CartesianGrid horizontal={false} stroke="#e7e9ee" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#6a7080", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fill: "#2a2e38", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f4f5f7" }}
            formatter={(value) => [`${Number(value).toFixed(1)}`, "Score"]}
          />
          <Bar
            dataKey="score"
            fill="#ef2b2d"
            radius={[0, 5, 5, 0]}
            barSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
