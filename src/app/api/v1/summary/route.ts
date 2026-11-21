import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSummary } from "@/server/services/market-service";

const schema = z.enum(["state", "county"]);

export async function GET(request: NextRequest) {
  const parsed = schema.safeParse(
    request.nextUrl.searchParams.get("level") ?? "state",
  );
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_LEVEL",
          message: "Level must be state or county.",
        },
      },
      { status: 400 },
    );
  }

  const response = NextResponse.json(await getSummary(parsed.data));
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  return response;
}
