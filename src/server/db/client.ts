import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

let cachedDb: ReturnType<typeof createDatabase> | undefined;

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  return drizzle({ client: neon(connectionString), schema });
}

export function getDatabase() {
  cachedDb ??= createDatabase();
  return cachedDb;
}
