CREATE TYPE "public"."area_level" AS ENUM('state', 'county');--> statement-breakpoint
CREATE TYPE "public"."data_quality" AS ENUM('high', 'moderate', 'limited');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "area_rankings" (
	"area_geoid" varchar(5) NOT NULL,
	"dataset_vintage" varchar(4) NOT NULL,
	"methodology_version" varchar(20) NOT NULL,
	"size_percentile" numeric(6, 2),
	"concentration_percentile" numeric(6, 2),
	"financial_capacity_percentile" numeric(6, 2),
	"opportunity_score" numeric(6, 2),
	"national_rank" integer,
	"eligible" boolean NOT NULL,
	"quality" "data_quality" NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "area_rankings_area_geoid_dataset_vintage_methodology_version_pk" PRIMARY KEY("area_geoid","dataset_vintage","methodology_version")
);
--> statement-breakpoint
CREATE TABLE "areas" (
	"geoid" varchar(5) PRIMARY KEY NOT NULL,
	"level" "area_level" NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"state_fips" varchar(2) NOT NULL,
	"state_name" text NOT NULL,
	"parent_geoid" varchar(5)
);
--> statement-breakpoint
CREATE TABLE "data_imports" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"dataset" text NOT NULL,
	"vintage" varchar(4) NOT NULL,
	"status" "import_status" NOT NULL,
	"source_urls" jsonb NOT NULL,
	"checksum" text,
	"row_counts" jsonb,
	"error_summary" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "market_metrics" (
	"area_geoid" varchar(5) NOT NULL,
	"dataset_vintage" varchar(4) NOT NULL,
	"population_60_plus" bigint NOT NULL,
	"population_60_plus_moe" bigint NOT NULL,
	"population_60_plus_percent" numeric(6, 2) NOT NULL,
	"population_60_plus_percent_moe" numeric(6, 2) NOT NULL,
	"financial_capacity_percent" numeric(6, 2),
	"financial_capacity_moe" numeric(6, 2),
	"source_table" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_metrics_area_geoid_dataset_vintage_pk" PRIMARY KEY("area_geoid","dataset_vintage")
);
--> statement-breakpoint
ALTER TABLE "area_rankings" ADD CONSTRAINT "area_rankings_area_geoid_areas_geoid_fk" FOREIGN KEY ("area_geoid") REFERENCES "public"."areas"("geoid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_metrics" ADD CONSTRAINT "market_metrics_area_geoid_areas_geoid_fk" FOREIGN KEY ("area_geoid") REFERENCES "public"."areas"("geoid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rankings_vintage_score_idx" ON "area_rankings" USING btree ("dataset_vintage","opportunity_score");--> statement-breakpoint
CREATE UNIQUE INDEX "areas_level_slug_unique" ON "areas" USING btree ("level","slug");--> statement-breakpoint
CREATE INDEX "areas_level_state_idx" ON "areas" USING btree ("level","state_fips");