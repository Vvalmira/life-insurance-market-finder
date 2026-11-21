import { NextResponse } from "next/server";

import { INDICATORS, SCORE_FORMULA } from "@/server/domain/methodology";
import { getMarketDataset } from "@/server/repositories/market-repository";

export async function GET() {
  const dataset = await getMarketDataset();
  return NextResponse.json({
    data: {
      ...dataset.metadata,
      formula: SCORE_FORMULA,
      indicators: INDICATORS,
    },
  });
}
