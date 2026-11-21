import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { listAreas } from "@/server/services/market-service";

const querySchema = z.object({
  level: z.enum(["state", "county"]).default("state"),
  state: z
    .string()
    .regex(/^\d{2}$/)
    .optional(),
  search: z.string().trim().max(80).optional(),
  sort: z
    .enum([
      "rank",
      "score",
      "population",
      "concentration",
      "financialCapacity",
      "name",
    ])
    .default("rank"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_QUERY",
          message: "One or more query parameters are invalid.",
          details: z.treeifyError(parsed.error),
        },
      },
      { status: 400 },
    );
  }

  const response = NextResponse.json(await listAreas(parsed.data));
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  return response;
}
