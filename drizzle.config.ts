import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Drizzle commands");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
