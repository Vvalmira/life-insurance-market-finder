import { afterEach, describe, expect, it, vi } from "vitest";

import { CENSUS_FIELDS } from "./constants";
import { fetchCensusMetrics } from "./client";

const stateRow = ["Alabama", "100", "5", "25", "1", "80", "2", "01"];
const countyRow = [
  "Autauga County, Alabama",
  "25",
  "2",
  "22",
  "1",
  "78",
  "3",
  "01",
  "001",
];

describe("fetchCensusMetrics", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requests counties through the required state geography hierarchy", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      const isCounty = url.searchParams.get("for") === "county:*";
      return {
        ok: true,
        json: async () => [
          [...CENSUS_FIELDS, "state", ...(isCounty ? ["county"] : [])],
          isCounty ? countyRow : stateRow,
        ],
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const metrics = await fetchCensusMetrics("test-key");
    const countyUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));

    expect(countyUrl.searchParams.get("for")).toBe("county:*");
    expect(countyUrl.searchParams.get("in")).toBe("state:*");
    expect(countyUrl.searchParams.get("key")).toBe("test-key");
    expect(metrics.map((row) => row.geoid)).toEqual(["01", "01001"]);
  });
});
