import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const areaLevelEnum = pgEnum("area_level", ["state", "county"]);
export const importStatusEnum = pgEnum("import_status", [
  "running",
  "completed",
  "failed",
]);
export const dataQualityEnum = pgEnum("data_quality", [
  "high",
  "moderate",
  "limited",
]);

export const areas = pgTable(
  "areas",
  {
    geoid: varchar("geoid", { length: 5 }).primaryKey(),
    level: areaLevelEnum("level").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    stateFips: varchar("state_fips", { length: 2 }).notNull(),
    stateName: text("state_name").notNull(),
    parentGeoid: varchar("parent_geoid", { length: 5 }),
  },
  (table) => [
    uniqueIndex("areas_level_slug_unique").on(table.level, table.slug),
    index("areas_level_state_idx").on(table.level, table.stateFips),
  ],
);

export const marketMetrics = pgTable(
  "market_metrics",
  {
    areaGeoid: varchar("area_geoid", { length: 5 })
      .notNull()
      .references(() => areas.geoid, { onDelete: "cascade" }),
    datasetVintage: varchar("dataset_vintage", { length: 4 }).notNull(),
    population60Plus: bigint("population_60_plus", {
      mode: "number",
    }).notNull(),
    population60PlusMoe: bigint("population_60_plus_moe", {
      mode: "number",
    }).notNull(),
    population60PlusPercent: numeric("population_60_plus_percent", {
      precision: 6,
      scale: 2,
    }).notNull(),
    population60PlusPercentMoe: numeric("population_60_plus_percent_moe", {
      precision: 6,
      scale: 2,
    }).notNull(),
    financialCapacityPercent: numeric("financial_capacity_percent", {
      precision: 6,
      scale: 2,
    }),
    financialCapacityMoe: numeric("financial_capacity_moe", {
      precision: 6,
      scale: 2,
    }),
    sourceTable: varchar("source_table", { length: 32 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.areaGeoid, table.datasetVintage] })],
);

export const areaRankings = pgTable(
  "area_rankings",
  {
    areaGeoid: varchar("area_geoid", { length: 5 })
      .notNull()
      .references(() => areas.geoid, { onDelete: "cascade" }),
    datasetVintage: varchar("dataset_vintage", { length: 4 }).notNull(),
    methodologyVersion: varchar("methodology_version", {
      length: 20,
    }).notNull(),
    sizePercentile: numeric("size_percentile", { precision: 6, scale: 2 }),
    concentrationPercentile: numeric("concentration_percentile", {
      precision: 6,
      scale: 2,
    }),
    financialCapacityPercentile: numeric("financial_capacity_percentile", {
      precision: 6,
      scale: 2,
    }),
    opportunityScore: numeric("opportunity_score", { precision: 6, scale: 2 }),
    nationalRank: integer("national_rank"),
    eligible: boolean("eligible").notNull(),
    quality: dataQualityEnum("quality").notNull(),
    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.areaGeoid,
        table.datasetVintage,
        table.methodologyVersion,
      ],
    }),
    index("rankings_vintage_score_idx").on(
      table.datasetVintage,
      table.opportunityScore,
    ),
  ],
);

export const dataImports = pgTable("data_imports", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  dataset: text("dataset").notNull(),
  vintage: varchar("vintage", { length: 4 }).notNull(),
  status: importStatusEnum("status").notNull(),
  sourceUrls: jsonb("source_urls").$type<string[]>().notNull(),
  checksum: text("checksum"),
  rowCounts: jsonb("row_counts").$type<Record<string, number>>(),
  errorSummary: text("error_summary"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});
