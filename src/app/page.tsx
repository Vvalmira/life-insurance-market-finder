import { Dashboard } from "@/features/market-finder/components/dashboard";
import { listAreas, getSummary } from "@/server/services/market-service";

export default async function HomePage() {
  const [initialAreas, initialSummary] = await Promise.all([
    listAreas({
      level: "state",
      sort: "rank",
      order: "asc",
      page: 1,
      pageSize: 25,
    }),
    getSummary("state"),
  ]);

  return (
    <Dashboard initialAreas={initialAreas} initialSummary={initialSummary} />
  );
}
