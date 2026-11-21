import { NextResponse } from "next/server";

import { getMarketDataset } from "@/server/repositories/market-repository";

export async function GET() {
  try {
    const dataset = await getMarketDataset();
    return NextResponse.json({
      status: "ok",
      vintage: dataset.metadata.vintage,
      preview: dataset.metadata.preview,
      commit: process.env.APP_COMMIT_SHA ?? "local",
    });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }
}
