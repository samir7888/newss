import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/news";
const client = postgres(connectionString, {
  max: 1,
  connect_timeout: 10,
  idle_timeout: 5,
});

export const db = drizzle(client);

export async function closeDatabase() {
  await client.end({ timeout: 5 }).catch(() => {});
}
