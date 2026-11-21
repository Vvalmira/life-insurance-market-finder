import { NextResponse } from "next/server";

import { getArea } from "@/server/services/market-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ geoid: string }> },
) {
  const { geoid } = await context.params;
  if (!/^\d{2}(\d{3})?$/.test(geoid)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_GEOID",
          message: "GEOID must contain 2 or 5 digits.",
        },
      },
      { status: 400 },
    );
  }

  const area = await getArea(geoid);
  if (!area) {
    return NextResponse.json(
      {
        error: {
          code: "AREA_NOT_FOUND",
          message: "The requested area was not found.",
        },
      },
      { status: 404 },
    );
  }

  const response = NextResponse.json({ data: area });
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  return response;
}
